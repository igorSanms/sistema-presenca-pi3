using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlunosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlunosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? disciplinaId)
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid.TryParse(userIdStr, out Guid userId);

            var query = _context.Alunos
                .Include(a => a.AlunoDisciplinas)
                .ThenInclude(ad => ad.Disciplina)
                .Where(a => a.Ativo && a.TurmaId == turmaId) // 👉 Filtra pela turma
                .AsQueryable();

            if (perfil == "Professor")
            {
                query = query.Where(a => a.AlunoDisciplinas.Any(ad => ad.Disciplina.ProfessorId == userId));
            }

            if (disciplinaId.HasValue)
            {
                query = query.Where(a => a.AlunoDisciplinas.Any(ad => ad.DisciplinaId == disciplinaId.Value));
            }

            var alunos = await query
                .OrderBy(a => a.Nome)
                .Select(a => new AlunoResponseDTO
                {
                    Id = a.Id,
                    Nome = a.Nome,
                    Matricula = a.Matricula,
                    Email = a.Email,
                    Telefone = a.Telefone,
                    Ativo = a.Ativo,
                    
                    Presencas = a.Registros.Count(r => r.Status == (StatusPresenca)0), 
                    FaltasReais = a.Registros.Count(r => r.Status == StatusPresenca.Falta), 
                    FaltasJustificadas = a.Registros.Count(r => r.Status == StatusPresenca.Justificada), 
                    TotalAulas = a.Registros.Count(), 
                    
                    Disciplinas = a.AlunoDisciplinas.Select(ad => new AlunoDisciplinaResponseDTO
                    {
                        Id = ad.Disciplina.Id,
                        Nome = ad.Disciplina.Nome
                    }).ToList()
                })
                .ToListAsync();

            return Ok(alunos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            var aluno = await _context.Alunos
                .Where(al => al.Id == id && al.Ativo && al.TurmaId == turmaId) // 👉 Filtra pela turma
                .Select(a => new AlunoResponseDTO
                {
                    Id = a.Id,
                    Nome = a.Nome,
                    Matricula = a.Matricula,
                    Email = a.Email,
                    Telefone = a.Telefone,
                    Ativo = a.Ativo,
                    
                    Presencas = a.Registros.Count(r => r.Status == (StatusPresenca)0),
                    FaltasReais = a.Registros.Count(r => r.Status == StatusPresenca.Falta),
                    FaltasJustificadas = a.Registros.Count(r => r.Status == StatusPresenca.Justificada),
                    TotalAulas = a.Registros.Count(),
                    
                    Disciplinas = a.AlunoDisciplinas.Select(ad => new AlunoDisciplinaResponseDTO
                    {
                        Id = ad.Disciplina.Id,
                        Nome = ad.Disciplina.Nome
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (aluno == null) 
                return NotFound(new { Message = "Aluno não encontrado nesta turma ou inativo." });

            return Ok(aluno);
        }

        [HttpPost]
        [Authorize(Roles = "Coordenacao")]
        public async Task<IActionResult> Create([FromBody] AlunoCreateDTO dto)
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailEmUso = await _context.Alunos.AnyAsync(a => a.Email != null && a.Email.ToLower() == dto.Email.ToLower());
                if (emailEmUso)
                {
                    return BadRequest(new { Message = "Este e-mail já está cadastrado para outro aluno." });
                }
            }

            var matriculaAuto = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
            while (await _context.Alunos.AnyAsync(a => a.Matricula == matriculaAuto))
            {
                matriculaAuto = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
            }

            var aluno = new Aluno
            {
                Id = Guid.NewGuid(),
                Nome = dto.Nome,
                Matricula = matriculaAuto,
                Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email,
                Telefone = string.IsNullOrWhiteSpace(dto.Telefone) ? null : dto.Telefone, 
                Ativo = true,
                TurmaId = turmaId // 👉 Vincula o novo aluno à turma ativa!
            };

            if (dto.DisciplinasIds != null && dto.DisciplinasIds.Any())
            {
                foreach (var dId in dto.DisciplinasIds)
                {
                    aluno.AlunoDisciplinas.Add(new AlunoDisciplina
                    {
                        DisciplinaId = dId
                    });
                }
            }

            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = aluno.Id }, new { Message = "Aluno criado com sucesso." });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Coordenacao")]
        public async Task<IActionResult> Update(Guid id, [FromBody] AlunoUpdateDTO dto)
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            // 👉 Busca garantindo que o aluno pertence a esta turma
            var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Id == id && a.TurmaId == turmaId);
            if (aluno == null || !aluno.Ativo) 
                return NotFound(new { Message = "Aluno não encontrado nesta turma ou inativo." });

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailEmUso = await _context.Alunos.AnyAsync(a => a.Email != null && a.Email.ToLower() == dto.Email.ToLower() && a.Id != id);
                if (emailEmUso)
                {
                    return BadRequest(new { Message = "Este e-mail já está cadastrado para outro aluno." });
                }
            }

            aluno.Nome = dto.Nome;
            aluno.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email;
            aluno.Telefone = string.IsNullOrWhiteSpace(dto.Telefone) ? null : dto.Telefone; 

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Aluno atualizado com sucesso." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Coordenacao")]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Id == id && a.TurmaId == turmaId);
            if (aluno == null || !aluno.Ativo) 
                return NotFound(new { Message = "Aluno não encontrado nesta turma ou inativo." });

            aluno.Ativo = false;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Aluno inativado com sucesso." });
        }

        [HttpPut("{id}/Matriculas")]
        [Authorize(Roles = "Coordenacao")]
        public async Task<IActionResult> SincronizarMatriculas(Guid id, [FromBody] List<Guid> disciplinasIds)
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            var aluno = await _context.Alunos
                .Include(a => a.AlunoDisciplinas)
                .FirstOrDefaultAsync(a => a.Id == id && a.Ativo && a.TurmaId == turmaId); // 👉 Trava de segurança

            if (aluno == null)
            {
                return NotFound(new { Message = "Aluno não encontrado nesta turma ou inativo." });
            }

            var vinculosAtuais = aluno.AlunoDisciplinas.ToList();

            var paraRemover = vinculosAtuais
                .Where(v => !disciplinasIds.Contains(v.DisciplinaId))
                .ToList();

            foreach (var v in paraRemover)
            {
                _context.AlunoDisciplinas.Remove(v);
            }

            var idsAtuais = vinculosAtuais.Select(v => v.DisciplinaId).ToHashSet();
            var paraAdicionar = disciplinasIds
                .Where(dId => !idsAtuais.Contains(dId))
                .ToList();

            foreach (var dId in paraAdicionar)
            {
                var existeDisciplina = await _context.Disciplinas.AnyAsync(d => d.Id == dId && d.TurmaId == turmaId);
                if (existeDisciplina)
                {
                    _context.AlunoDisciplinas.Add(new AlunoDisciplina
                    {
                        AlunoId = id,
                        DisciplinaId = dId
                    });
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Matrículas atualizadas com sucesso." });
        }
    }
}