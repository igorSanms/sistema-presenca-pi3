using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet]
        public async Task<IActionResult> GetAlertas()
        {
            var alertas = await _context.Alunos
                .Select(a => new
                {
                    a.Id,
                    a.Nome,
                    TotalFaltas = _context.RegistrosFrequencia.Count(r => r.AlunoId == a.Id && r.Status == backend.Models.Enums.StatusPresenca.Falta)
                })
                .Where(x => x.TotalFaltas >= 3)
                .Select(x => new AlertaResponseDTO
                {
                    AlunoId = x.Id,
                    Nome = x.Nome,
                    FaltasReais = x.TotalFaltas,
                    NivelAlerta = x.TotalFaltas == 3 ? 1 : 2
                })
                .OrderByDescending(x => x.FaltasReais)
                .ToListAsync();

            return Ok(alertas);
        }
    }
}
