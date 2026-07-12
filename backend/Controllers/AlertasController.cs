using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Coordenacao")]
    public class AlertasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlertasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("Ativos")]
        public async Task<IActionResult> GetAtivos()
        {
            var alertas = await _context.Alertas
                .Include(a => a.Aluno)
                .Include(a => a.Disciplina)
                .Where(a => !a.Resolvido)
                .Select(a => new
                {
                    Id = a.Id,
                    AlunoNome = a.Aluno != null ? a.Aluno.Nome : "Sem Nome",
                    DisciplinaNome = a.Disciplina != null ? a.Disciplina.Nome : "Sem Disciplina",
                    Mensagem = a.Mensagem,
                    DataCriacao = a.DataCriacao
                })
                .OrderByDescending(a => a.DataCriacao)
                .ToListAsync();

            return Ok(alertas);
        }

        [HttpPut("{id}/Resolver")]
        public async Task<IActionResult> Resolver(Guid id)
        {
            var alerta = await _context.Alertas
                .Include(a => a.Aluno)
                .Include(a => a.Disciplina)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (alerta == null)
            {
                return NotFound(new { Message = "Alerta não encontrado." });
            }

            if (alerta.Resolvido)
            {
                return BadRequest(new { Message = "Alerta já resolvido." });
            }

            var usuarioIdLogadoStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (!Guid.TryParse(usuarioIdLogadoStr, out var usuarioIdLogado))
            {
                return Unauthorized(new { Message = "Usuário não identificado no token." });
            }

            alerta.Resolvido = true;
            alerta.DataResolucao = DateTime.UtcNow;
            alerta.ResolvidoPorId = usuarioIdLogado;

            var alunoNome = alerta.Aluno != null ? alerta.Aluno.Nome : "Desconhecido";
            var disciplinaNome = alerta.Disciplina != null ? alerta.Disciplina.Nome : "Desconhecida";

            // Auditoria Explícita para sobrepor a genérica
            _context.RegistrosAtividades.Add(new RegistroAtividade 
            { 
                UsuarioId = usuarioIdLogado, 
                Acao = "Resolução de Alerta", 
                Descricao = $"Marcou como resolvido o alerta de infrequência (3 faltas) do aluno {alunoNome} na disciplina {disciplinaNome}." 
            });

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Alerta resolvido com sucesso." });
        }
    }
}
