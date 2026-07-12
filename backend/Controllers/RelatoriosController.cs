using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Authorize(Roles = "Coordenacao,Professor")]
    [ApiController]
    [Route("api/[controller]")]
    public class RelatoriosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RelatoriosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("Alunos/Exportar")]
        public async Task<IActionResult> ExportarAlunos()
        {
            var query = _context.Alunos
                .Include(a => a.AlunoDisciplinas)
                .AsQueryable();

            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            if (perfil == "Professor")
            {
                var usuarioIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                if (Guid.TryParse(usuarioIdStr, out var usuarioId))
                {
                    query = query.Where(a => a.AlunoDisciplinas.Any(ad => ad.Disciplina != null && ad.Disciplina.ProfessorId == usuarioId));
                }
            }

            var alunos = await query.ToListAsync();

            var builder = new StringBuilder();
            
            // Cabeçalho clássico brasileiro (usando ponto e vírgula como separador para compatibilidade Excel)
            builder.AppendLine("Matrícula;Nome;E-mail;Status");

            foreach (var aluno in alunos)
            {
                var status = aluno.Ativo ? "Ativo" : "Inativo";
                
                // Sanitização sutil para evitar quebras no arquivo CSV caso haja ponto e vírgula inserido no input
                var matricula = (aluno.Matricula ?? "").Replace(";", "");
                var nome = (aluno.Nome ?? "").Replace(";", "");
                var email = (aluno.Email ?? "").Replace(";", "");

                builder.AppendLine($"{matricula};{nome};{email};{status}");
            }

            var bytes = Encoding.UTF8.GetBytes(builder.ToString());

            // Retorna o arquivo CSV nativo
            return File(bytes, "text/csv", "relatorio_alunos.csv");
        }

        [HttpGet("Disciplinas/Exportar")]
        public async Task<IActionResult> ExportarDisciplinas()
        {
            var query = _context.Disciplinas
                .Include(d => d.Professor)
                .AsQueryable();

            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            if (perfil == "Professor")
            {
                var usuarioIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                if (Guid.TryParse(usuarioIdStr, out var usuarioId))
                {
                    query = query.Where(d => d.ProfessorId == usuarioId);
                }
            }

            var disciplinas = await query.ToListAsync();

            var builder = new StringBuilder();

            // Cabeçalho brasileiro
            builder.AppendLine("Disciplina;Professor;Data Início;Data Fim;Horários");

            foreach (var d in disciplinas)
            {
                var nome = (d.Nome ?? "").Replace(";", "");
                var professor = (d.Professor?.Nome ?? "Sem Professor").Replace(";", "");
                
                // Formatação brasileira de data ou indicação de legado (Ano 0001)
                var dataInicioStr = (d.DataInicio.Year <= 1) ? "Não definida" : d.DataInicio.ToString("dd/MM/yyyy");
                var dataFimStr = (d.DataFim.Year <= 1) ? "Não definida" : d.DataFim.ToString("dd/MM/yyyy");

                // Mantém a string dos horários limpa de caracteres de escape
                var horarios = (d.Horarios ?? "").Replace(";", "");

                builder.AppendLine($"{nome};{professor};{dataInicioStr};{dataFimStr};{horarios}");
            }

            var bytes = Encoding.UTF8.GetBytes(builder.ToString());

            return File(bytes, "text/csv", "relatorio_disciplinas.csv");
        }

        [HttpGet("Frequencia/Evolucao")]
        public async Task<IActionResult> EvolucaoFrequencia()
        {
            // Agregação pesada nativa no SQL Server / Postgres via IQueryable
            var query = _context.RegistrosFrequencia
                .Include(r => r.Aula)
                .Where(r => r.Aula != null)
                .AsQueryable();

            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            if (perfil == "Professor")
            {
                var usuarioIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                if (Guid.TryParse(usuarioIdStr, out var usuarioId))
                {
                    query = query.Where(r => r.Aula != null && r.Aula.Disciplina != null && r.Aula.Disciplina.ProfessorId == usuarioId);
                }
            }

            var registros = await query
                .GroupBy(r => new { r.Aula!.Data.Year, r.Aula!.Data.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    TotalPresencas = g.Count(r => r.Status == backend.Models.Enums.StatusPresenca.Presente),
                    TotalFaltas = g.Count(r => r.Status == backend.Models.Enums.StatusPresenca.Falta)
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            // Interpolação na memória do Servidor (Calculo da Taxa)
            var resultado = registros.Select(r =>
            {
                var total = r.TotalPresencas + r.TotalFaltas;
                var taxa = total > 0 ? Math.Round((double)r.TotalPresencas / total * 100, 1) : 0.0;
                
                return new
                {
                    Periodo = $"{r.Month:D2}/{r.Year}",
                    TotalPresencas = r.TotalPresencas,
                    TotalFaltas = r.TotalFaltas,
                    TaxaFrequencia = taxa
                };
            }).ToList();

            return Ok(resultado);
        }

        [HttpGet("Atividades")]
        public async Task<IActionResult> Atividades()
        {
            var query = _context.RegistrosAtividades
                .Include(r => r.Usuario)
                .AsQueryable();

            var perfil = User.FindFirst(ClaimTypes.Role)?.Value;
            if (perfil == "Professor")
            {
                var usuarioIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                if (Guid.TryParse(usuarioIdStr, out var usuarioId))
                {
                    query = query.Where(r => r.UsuarioId == usuarioId);
                }
            }

            var atividades = await query
                .OrderByDescending(r => r.DataHora)
                .Take(50)
                .Select(r => new
                {
                    r.Id,
                    r.DataHora,
                    r.Acao,
                    r.Descricao,
                    UsuarioNome = r.Usuario != null ? r.Usuario.Nome : "Sistema"
                })
                .ToListAsync();

            return Ok(atividades);
        }
    }
}
