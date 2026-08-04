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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTurma(Guid id, [FromBody] TurmaCreateDTO dto)
        {
            var turma = await _context.Turmas.FindAsync(id);
            if (turma == null || !turma.Ativo) 
                return NotFound(new { Message = "Turma não encontrada." });

            turma.Nome = dto.Nome;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Turma atualizada com sucesso." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTurma(Guid id)
        {
            var turma = await _context.Turmas.FindAsync(id);
            if (turma == null || !turma.Ativo) 
                return NotFound(new { Message = "Turma não encontrada." });

            // Exclusão Lógica: Inativa a Turma
            turma.Ativo = false;

            // Inativa todos os Alunos que pertencem a esta turma
            var alunos = await _context.Alunos.Where(a => a.TurmaId == id).ToListAsync();
            foreach (var aluno in alunos)
            {
                aluno.Ativo = false;
            }

            // Inativa todas as Disciplinas que pertencem a esta turma
            var disciplinas = await _context.Disciplinas.Where(d => d.TurmaId == id).ToListAsync();
            foreach (var disciplina in disciplinas)
            {
                disciplina.Ativo = false;
            }

            // Professores não são tocados! Eles continuam no banco de dados.

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Turma e seus registros foram excluídos com sucesso." });
        }
    }
}