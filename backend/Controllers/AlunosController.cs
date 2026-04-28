using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Regra 1: Todas as rotas exigem usuário autenticado
    public class AlunosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlunosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Alunos
        // Regra 2: Qualquer perfil autenticado pode acessar
        [HttpGet]
        public async Task<IActionResult> GetAlunos()
        {
            var alunos = await _context.Alunos.ToListAsync();
            return Ok(alunos);
        }

        // GET: api/Alunos/{id}
        // Regra 2: Qualquer perfil autenticado pode acessar
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAluno(Guid id)
        {
            var aluno = await _context.Alunos.FindAsync(id);

            if (aluno == null)
                return NotFound(new { Message = "Aluno não encontrado." });

            return Ok(aluno);
        }

        // POST: api/Alunos
        // Regra 2: Qualquer perfil autenticado pode criar
        [HttpPost]
        public async Task<IActionResult> CreateAluno([FromBody] AlunoCreateRequest request)
        {
            if (!string.IsNullOrEmpty(request.Email) && await _context.Alunos.AnyAsync(a => a.Email == request.Email))
            {
                return BadRequest(new { Message = "Este e-mail já está cadastrado." });
            }

            var aluno = new Aluno
            {
                Id = Guid.NewGuid(),
                Nome = request.Nome,
                Email = request.Email,
                Telefone = request.Telefone,
                // Regra 4: Contadores obrigatoriamente iniciam zerados
                Presencas = 0,
                FaltasReais = 0,
                FaltasJustificadas = 0
            };

            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAluno), new { id = aluno.Id }, aluno);
        }

        // PUT: api/Alunos/{id}
        // Regra 3: Restrito APENAS à Coordenação
        [HttpPut("{id}")]
        [Authorize(Roles = "Coordenacao")]
        public async Task<IActionResult> UpdateAluno(Guid id, [FromBody] AlunoUpdateRequest request)
        {
            var aluno = await _context.Alunos.FindAsync(id);

            if (aluno == null)
                return NotFound(new { Message = "Aluno não encontrado." });

            if (!string.IsNullOrEmpty(request.Email) && 
                request.Email != aluno.Email && 
                await _context.Alunos.AnyAsync(a => a.Email == request.Email && a.Id != id))
            {
                return BadRequest(new { Message = "Este e-mail já está cadastrado para outro aluno." });
            }

            aluno.Nome = request.Nome;
            aluno.Email = request.Email;
            aluno.Telefone = request.Telefone;
            
            // Permite a coordenação ajustar contadores manualmente se houver necessidade
            aluno.Presencas = request.Presencas;
            aluno.FaltasReais = request.FaltasReais;
            aluno.FaltasJustificadas = request.FaltasJustificadas;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Aluno atualizado com sucesso.", Aluno = aluno });
        }

        // DELETE: api/Alunos/{id}
        // Regra 3: Restrito APENAS à Coordenação
        [HttpDelete("{id}")]
        [Authorize(Roles = "Coordenacao")]
        public async Task<IActionResult> DeleteAluno(Guid id)
        {
            var aluno = await _context.Alunos.FindAsync(id);

            if (aluno == null)
                return NotFound(new { Message = "Aluno não encontrado." });

            _context.Alunos.Remove(aluno);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Aluno removido com sucesso." });
        }
    }
}
