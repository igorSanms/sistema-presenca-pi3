using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FrequenciaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FrequenciaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> RealizarChamada([FromBody] RealizarChamadaRequestDTO request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // 1. Busca ou Cria o "Dia Letivo Unificado" (Disciplina nula)
            var aula = await _context.Aulas
                .FirstOrDefaultAsync(a => a.Data == request.Data && a.DisciplinaId == null);

            if (aula == null)
            {
                aula = new Aula
                {
                    Id = Guid.NewGuid(),
                    DisciplinaId = null, // Marcação de Chamada Global
                    Data = request.Data,
                    Horario = "Turno Unico",
                    Conteudo = request.Conteudo
                };
                await _context.Aulas.AddAsync(aula);
            }
            else if (request.Conteudo != null)
            {
                aula.Conteudo = request.Conteudo;
            }

            var alunoIds = request.Alunos.Select(a => a.AlunoId).ToList();

            var alunosExistentes = await _context.Alunos
                .Where(a => alunoIds.Contains(a.Id))
                .ToDictionaryAsync(a => a.Id);

            var registrosExistentes = await _context.RegistrosFrequencia
                .Where(r => r.AulaId == aula.Id && alunoIds.Contains(r.AlunoId))
                .ToDictionaryAsync(r => r.AlunoId);

            foreach (var dto in request.Alunos)
            {
                if (!alunosExistentes.TryGetValue(dto.AlunoId, out var aluno)) continue;

                if (registrosExistentes.TryGetValue(dto.AlunoId, out var registroExistente))
                {
                    // Lógica de Edição: Se mudou na tela, atualiza no banco
                    if (registroExistente.Status != dto.Status)
                    {
                        registroExistente.Status = dto.Status;
                    }
                }
                else
                {
                    var novoRegistro = new RegistroFrequencia
                    {
                        AulaId = aula.Id,
                        AlunoId = dto.AlunoId,
                        Status = dto.Status
                    };
                    await _context.RegistrosFrequencia.AddAsync(novoRegistro);
                }
            }

            await _context.SaveChangesAsync();

            // 2. Motor de Alertas Global (Regra de Negócio: 3 faltas)
            foreach (var dto in request.Alunos)
            {
                // Busca direta e leve apenas pelo AlunoId e Status
                var totalFaltasGlobais = await _context.RegistrosFrequencia
                    .CountAsync(r => r.AlunoId == dto.AlunoId 
                                  && r.Status == StatusPresenca.Falta);

                if (totalFaltasGlobais >= 3)
                {
                    bool alertaJaFoiGerado = await _context.Alertas
                        .AnyAsync(a => a.AlunoId == dto.AlunoId);

                    if (!alertaJaFoiGerado)
                    {
                        _context.Alertas.Add(new Alerta
                        {
                            AlunoId = dto.AlunoId,
                            Mensagem = $"O aluno atingiu {totalFaltasGlobais} faltas."
                        });
                    }
                }
                else
                {
                    var alertaExistente = await _context.Alertas
                        .FirstOrDefaultAsync(a => a.AlunoId == dto.AlunoId);

                    if (alertaExistente != null)
                    {
                        _context.Alertas.Remove(alertaExistente);
                    }
                }
            }
            
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Chamada registrada/atualizada com sucesso." });
        }

        [HttpGet]
        public async Task<IActionResult> ObterChamadaDoDia([FromQuery] DateOnly data)
        {
            var alunos = await _context.Alunos.OrderBy(a => a.Nome).ToListAsync();

            // Busca as presenças vinculadas apenas à data, ignorando disciplina
            var registrosQuery = _context.RegistrosFrequencia
                .Include(r => r.Aula)
                .Where(r => r.Aula != null && r.Aula.Data == data && r.Aula.DisciplinaId == null);

            var registros = await registrosQuery.ToDictionaryAsync(r => r.AlunoId);

            var response = alunos.Select(a =>
            {
                registros.TryGetValue(a.Id, out var registro);
                return new AlunoChamadaResponseDTO
                {
                    AlunoId = a.Id,
                    Nome = a.Nome,
                    Status = registro?.Status
                };
            }).ToList();

            return Ok(response);
        }

        [HttpPut("justificar")]
        [Authorize(Roles = "Coordenacao")]
        public async Task<IActionResult> JustificarFalta([FromBody] JustificarFaltaRequestDTO request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var registro = await _context.RegistrosFrequencia
                .Include(r => r.Aula)
                .FirstOrDefaultAsync(r => r.AlunoId == request.AlunoId 
                                       && r.Aula!.Data == request.Data 
                                       && r.Aula.DisciplinaId == null); // Garante que é a chamada global

            if (registro == null || registro.Status != StatusPresenca.Falta)
            {
                return BadRequest(new { Message = "Registro não encontrado ou já justificado." });
            }

            registro.Status = StatusPresenca.Justificada;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Falta justificada com sucesso." });
        }
    }
}