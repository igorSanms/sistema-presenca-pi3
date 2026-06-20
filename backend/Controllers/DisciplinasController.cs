using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
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
            var disciplinas = await _context.Disciplinas
                .Include(d => d.Professor)
                .Select(d => new DisciplinaResponseDTO
                {
                    Id = d.Id,
                    Nome = d.Nome,
                    ProfessorId = d.ProfessorId,
                    ProfessorNome = d.Professor.Nome,
                    Horarios = d.Horarios
                })
                .ToListAsync();

            return Ok(disciplinas);
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
                Horarios = dto.Horarios
            };

            _context.Disciplinas.Add(disciplina);
            await _context.SaveChangesAsync();

            var response = new DisciplinaResponseDTO
            {
                Id = disciplina.Id,
                Nome = disciplina.Nome,
                ProfessorId = disciplina.ProfessorId,
                ProfessorNome = professor.Nome,
                Horarios = disciplina.Horarios
            };

            return CreatedAtAction(nameof(GetAll), new { id = disciplina.Id }, response); // Pode-se ajustar para GetById futuramente
        }
    }
}
