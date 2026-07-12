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
            // Extrai o Perfil e o ID do usuário através do Token JWT (Claims)
            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            var query = _context.Disciplinas
                .Include(d => d.Professor)
                .AsQueryable();

            // Se for Professor, isola a visualização (RBAC - Row-Level Security App Side)
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
            // Se for Coordenação, a query permanece intacta (God Mode)

            var disciplinas = await query
                .Select(d => new DisciplinaResponseDTO
                {
                    Id = d.Id,
                    Nome = d.Nome,
                    ProfessorId = d.ProfessorId,
                    ProfessorNome = d.Professor.Nome,
                    Horarios = d.Horarios,
                    DataInicio = d.DataInicio,
                    DataFim = d.DataFim
                })
                .ToListAsync();

            return Ok(disciplinas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var disciplina = await _context.Disciplinas
                .Include(d => d.Professor)
                .Select(d => new DisciplinaResponseDTO
                {
                    Id = d.Id,
                    Nome = d.Nome,
                    ProfessorId = d.ProfessorId,
                    ProfessorNome = d.Professor.Nome,
                    Horarios = d.Horarios,
                    DataInicio = d.DataInicio,
                    DataFim = d.DataFim
                })
                .FirstOrDefaultAsync(d => d.Id == id);

            if (disciplina == null)
            {
                return NotFound(new { Message = "Disciplina não encontrada." });
            }

            return Ok(disciplina);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DisciplinaCreateDTO dto)
        {
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
                DataFim = dto.DataFim
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
                DataFim = disciplina.DataFim
            };

            return CreatedAtAction(nameof(GetById), new { id = disciplina.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] DisciplinaUpdateDTO dto)
        {
            var disciplina = await _context.Disciplinas.FindAsync(id);
            if (disciplina == null)
            {
                return NotFound(new { Message = "Disciplina não encontrada." });
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
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var disciplina = await _context.Disciplinas.FindAsync(id);
            if (disciplina == null)
            {
                return NotFound(new { Message = "Disciplina não encontrada." });
            }

            _context.Disciplinas.Remove(disciplina);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Disciplina excluída com sucesso." });
        }
    }
}
