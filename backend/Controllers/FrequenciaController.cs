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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var alunoIds = request.Alunos.Select(a => a.AlunoId).ToList();

            var alunosExistentes = await _context.Alunos
                .Where(a => alunoIds.Contains(a.Id))
                .ToDictionaryAsync(a => a.Id);

            var registrosExistentes = await _context.RegistrosFrequencia
                .Where(r => r.Data == request.Data && alunoIds.Contains(r.AlunoId))
                .ToDictionaryAsync(r => r.AlunoId);

            foreach (var dto in request.Alunos)
            {
                if (!alunosExistentes.TryGetValue(dto.AlunoId, out var aluno))
                {
                    continue; // Ignora caso o ID do aluno seja inválido
                }

                if (registrosExistentes.TryGetValue(dto.AlunoId, out var registroExistente))
                {
                    if (registroExistente.Status != dto.Status)
                    {
                        registroExistente.Status = dto.Status;
                    }
                    registroExistente.Observacao = dto.Observacao;
                }
                else
                {
                    var novoRegistro = new RegistroFrequencia
                    {
                        Data = request.Data,
                        AlunoId = dto.AlunoId,
                        Status = dto.Status,
                        Observacao = dto.Observacao
                    };
                    await _context.RegistrosFrequencia.AddAsync(novoRegistro);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Chamada registrada e contadores atualizados com sucesso." });
        }



        [HttpGet("{data}")]
        public async Task<IActionResult> ObterChamadaDoDia(DateOnly data)
        {
            var alunos = await _context.Alunos
                .OrderBy(a => a.Nome)
                .ToListAsync();

            var registros = await _context.RegistrosFrequencia
                .Where(r => r.Data == data)
                .ToDictionaryAsync(r => r.AlunoId);

            var response = alunos.Select(a =>
            {
                registros.TryGetValue(a.Id, out var registro);
                
                return new AlunoChamadaResponseDTO
                {
                    AlunoId = a.Id,
                    Nome = a.Nome,
                    Status = registro?.Status,
                    Observacao = registro?.Observacao
                };
            }).ToList();

            return Ok(response);
        }

        [HttpPut("justificar")]
        [Authorize(Roles = "Coordenacao")]
        public async Task<IActionResult> JustificarFalta([FromBody] JustificarFaltaRequestDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var registro = await _context.RegistrosFrequencia
                .FirstOrDefaultAsync(r => r.AlunoId == request.AlunoId && r.Data == request.Data);

            if (registro == null || registro.Status != StatusPresenca.Falta)
            {
                return BadRequest(new { Message = "Apenas ausências não justificadas podem ser alteradas." });
            }

            var aluno = await _context.Alunos.FindAsync(request.AlunoId);
            if (aluno == null)
            {
                return NotFound(new { Message = "Aluno não encontrado." });
            }

            registro.Status = StatusPresenca.Justificada;
            registro.Observacao = request.Observacao;

            aluno.FaltasReais = Math.Max(0, aluno.FaltasReais - 1);
            aluno.FaltasJustificadas++;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Falta justificada com sucesso. Contadores atualizados." });
        }
    }
}
