using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TurmasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TurmasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTurmas()
        {
            var turmas = await _context.Turmas
                .Where(t => t.Ativo)
                .Select(t => new TurmaResponseDTO
                {
                    Id = t.Id,
                    Nome = t.Nome,
                    Ativo = t.Ativo
                })
                .OrderBy(t => t.Nome)
                .ToListAsync();

            return Ok(turmas);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTurma([FromBody] TurmaCreateDTO dto)
        {
            var turma = new Turma
            {
                Nome = dto.Nome
            };

            _context.Turmas.Add(turma);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTurmas), new { id = turma.Id }, new TurmaResponseDTO
            {
                Id = turma.Id,
                Nome = turma.Nome,
                Ativo = turma.Ativo
            });
        }
    }
}