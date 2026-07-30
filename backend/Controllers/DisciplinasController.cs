using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DisciplinasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DisciplinasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            var hoje = DateOnly.FromDateTime(DateTime.Now);
            var dataMinima = new DateOnly(2000, 1, 1);

            var disciplinasVencidas = await _context.Disciplinas
                .Where(d => d.Ativo && d.TurmaId == turmaId && d.DataFim > dataMinima && d.DataFim < hoje)
                .ToListAsync();

            if (disciplinasVencidas.Any())
            {
                foreach (var d in disciplinasVencidas)
                {
                    d.Ativo = false;
                }
                await _context.SaveChangesAsync();
            }

            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            var query = _context.Disciplinas
                .Include(d => d.Professor)
                .Where(d => d.TurmaId == turmaId) // 👉 Filtra pela turma
                .AsQueryable();

            if (perfil == "Professor")
            {
                if (Guid.TryParse(userIdStr, out Guid professorId))
                {
                    query = query.Where(d => d.ProfessorId == professorId);
                }
                else
                {
                    return Unauthorized(new { Message = "Sessão inválida. ID do professor ausente." });
                }
            }

            var disciplinas = await query
                .Select(d => new DisciplinaResponseDTO
                {
                    Id = d.Id,
                    Nome = d.Nome,
                    ProfessorId = d.ProfessorId,
                    ProfessorNome = d.Professor.Nome,
                    Horarios = d.Horarios,
                    DataInicio = d.DataInicio,
                    DataFim = d.DataFim,
                    Ativo = d.Ativo 
                })
                .ToListAsync();

            return Ok(disciplinas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            var disciplina = await _context.Disciplinas
                .Include(d => d.Professor)
                .Where(d => d.Id == id && d.TurmaId == turmaId) // 👉 Filtra pela turma
                .Select(d => new DisciplinaResponseDTO
                {
                    Id = d.Id,
                    Nome = d.Nome,
                    ProfessorId = d.ProfessorId,
                    ProfessorNome = d.Professor.Nome,
                    Horarios = d.Horarios,
                    DataInicio = d.DataInicio,
                    DataFim = d.DataFim,
                    Ativo = d.Ativo
                })
                .FirstOrDefaultAsync();

            if (disciplina == null)
            {
                return NotFound(new { Message = "Disciplina não encontrada nesta turma." });
            }

            return Ok(disciplina);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DisciplinaCreateDTO dto)
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            var professor = await _context.Professores.FindAsync(dto.ProfessorId);
            if (professor == null)
            {
                return BadRequest(new { Message = "Professor não encontrado." });
            }

            var disciplina = new Disciplina
            {
                Id = Guid.NewGuid(),
                Nome = dto.Nome,
                ProfessorId = dto.ProfessorId,
                Horarios = dto.Horarios,
                DataInicio = dto.DataInicio,
                DataFim = dto.DataFim,
                Ativo = true,
                TurmaId = turmaId // 👉 Vincula a nova disciplina à turma ativa!
            };

            _context.Disciplinas.Add(disciplina);
            await _context.SaveChangesAsync();

            var response = new DisciplinaResponseDTO
            {
                Id = disciplina.Id,
                Nome = disciplina.Nome,
                ProfessorId = disciplina.ProfessorId,
                ProfessorNome = professor.Nome,
                Horarios = disciplina.Horarios,
                DataInicio = disciplina.DataInicio,
                DataFim = disciplina.DataFim,
                Ativo = disciplina.Ativo
            };

            return CreatedAtAction(nameof(GetById), new { id = disciplina.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] DisciplinaUpdateDTO dto)
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            var disciplina = await _context.Disciplinas.FirstOrDefaultAsync(d => d.Id == id && d.TurmaId == turmaId);
            if (disciplina == null)
            {
                return NotFound(new { Message = "Disciplina não encontrada nesta turma." });
            }

            var professor = await _context.Professores.FindAsync(dto.ProfessorId);
            if (professor == null)
            {
                return BadRequest(new { Message = "Professor não encontrado." });
            }

            disciplina.Nome = dto.Nome;
            disciplina.ProfessorId = dto.ProfessorId;
            disciplina.Horarios = dto.Horarios;
            disciplina.DataInicio = dto.DataInicio;
            disciplina.DataFim = dto.DataFim;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Coordenacao")]
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            var disciplina = await _context.Disciplinas.FirstOrDefaultAsync(d => d.Id == id && d.TurmaId == turmaId);
            if (disciplina == null)
            {
                return NotFound(new { Message = "Disciplina não encontrada nesta turma." });
            }

            disciplina.Ativo = !disciplina.Ativo;
            await _context.SaveChangesAsync();

            var statusStr = disciplina.Ativo ? "ativada" : "desativada";
            return Ok(new { Message = $"Disciplina {statusStr} com sucesso.", Ativo = disciplina.Ativo });
        }

        [Authorize(Roles = "Coordenacao")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (!Request.Headers.TryGetValue("X-Turma-Id", out var turmaIdStr) || !Guid.TryParse(turmaIdStr, out Guid turmaId))
                return BadRequest(new { Message = "Turma não selecionada (Cabeçalho X-Turma-Id ausente)." });

            var disciplina = await _context.Disciplinas.FirstOrDefaultAsync(d => d.Id == id && d.TurmaId == turmaId);
            if (disciplina == null)
            {
                return NotFound(new { Message = "Disciplina não encontrada nesta turma." });
            }

            _context.Disciplinas.Remove(disciplina);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Disciplina excluída com sucesso." });
        }
    }
}