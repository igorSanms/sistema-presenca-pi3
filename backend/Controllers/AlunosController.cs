using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
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
            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid.TryParse(userIdStr, out Guid userId);

            var query = _context.Alunos
                .Include(a => a.AlunoDisciplinas)
                .ThenInclude(ad => ad.Disciplina)
                .Where(a => a.Ativo)
                .AsQueryable();

            // RBAC estrito de visibilidade
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
                    Ativo = a.Ativo,
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
            var a = await _context.Alunos
                .Include(al => al.AlunoDisciplinas)
                .ThenInclude(ad => ad.Disciplina)
                .FirstOrDefaultAsync(al => al.Id == id && al.Ativo);

            if (a == null) 
                return NotFound(new { Message = "Aluno não encontrado ou inativo." });

            return Ok(new AlunoResponseDTO
            {
                Id = a.Id,
                Nome = a.Nome,
                Matricula = a.Matricula,
                Email = a.Email,
                Ativo = a.Ativo,
                Disciplinas = a.AlunoDisciplinas.Select(ad => new AlunoDisciplinaResponseDTO
                {
                    Id = ad.Disciplina.Id,
                    Nome = ad.Disciplina.Nome
                }).ToList()
            });
        }

        [HttpPost]
        [Authorize(Roles = "Coordenacao")]
        public async Task<IActionResult> Create([FromBody] AlunoCreateDTO dto)
        {
            // Gera Matrícula Dinâmica
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
                Email = dto.Email,
                Ativo = true
            };

            // Processa matrículas em disciplinas
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
            var aluno = await _context.Alunos.FindAsync(id);
            if (aluno == null || !aluno.Ativo) 
                return NotFound(new { Message = "Aluno não encontrado ou inativo." });

            aluno.Nome = dto.Nome;
            aluno.Email = dto.Email;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Aluno atualizado com sucesso." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Coordenacao")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var aluno = await _context.Alunos.FindAsync(id);
            if (aluno == null || !aluno.Ativo) 
                return NotFound(new { Message = "Aluno não encontrado ou inativo." });

            // Soft Delete
            aluno.Ativo = false;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Aluno inativado com sucesso." });
        }

        [HttpPut("{id}/Matriculas")]
        [Authorize(Roles = "Coordenacao")]
        public async Task<IActionResult> SincronizarMatriculas(Guid id, [FromBody] List<Guid> disciplinasIds)
        {
            var aluno = await _context.Alunos
                .Include(a => a.AlunoDisciplinas)
                .FirstOrDefaultAsync(a => a.Id == id && a.Ativo);

            if (aluno == null)
            {
                return NotFound(new { Message = "Aluno não encontrado ou inativo." });
            }

            // Vínculos atuais no banco
            var vinculosAtuais = aluno.AlunoDisciplinas.ToList();

            // 1. Remover vínculos que não estão no corpo da nova lista
            var paraRemover = vinculosAtuais
                .Where(v => !disciplinasIds.Contains(v.DisciplinaId))
                .ToList();

            foreach (var v in paraRemover)
            {
                _context.AlunoDisciplinas.Remove(v);
            }

            // 2. Adicionar novos vínculos (que ainda não existem na base)
            var idsAtuais = vinculosAtuais.Select(v => v.DisciplinaId).ToHashSet();
            var paraAdicionar = disciplinasIds
                .Where(dId => !idsAtuais.Contains(dId))
                .ToList();

            foreach (var dId in paraAdicionar)
            {
                var existeDisciplina = await _context.Disciplinas.AnyAsync(d => d.Id == dId);
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
