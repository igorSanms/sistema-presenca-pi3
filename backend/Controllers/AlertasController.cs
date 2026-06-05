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
                .Where(a => a.FaltasReais >= 3)
                .OrderByDescending(a => a.FaltasReais)
                .Select(a => new AlertaResponseDTO
                {
                    AlunoId = a.Id,
                    Nome = a.Nome,
                    FaltasReais = a.FaltasReais,
                    NivelAlerta = a.FaltasReais == 3 ? 1 : 2
                })
                .ToListAsync();

            return Ok(alertas);
        }
    }
}
