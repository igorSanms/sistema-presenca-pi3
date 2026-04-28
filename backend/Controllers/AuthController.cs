using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { Message = "E-mail já está em uso." });
            }

            var usuario = new Usuario
            {
                Id = Guid.NewGuid(),
                Nome = request.Nome,
                Email = request.Email,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
                Perfil = request.Perfil
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Usuário registrado com sucesso." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var usuario = await _context.Usuarios.SingleOrDefaultAsync(u => u.Email == request.Email);

            if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash))
            {
                return Unauthorized(new { Message = "Credenciais inválidas." });
            }

            var token = GenerateJwtToken(usuario);

            return Ok(new { Token = token, Perfil = usuario.Perfil.ToString() });
        }

        private string GenerateJwtToken(Usuario usuario)
        {
            var keyConfig = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(keyConfig))
            {
                throw new InvalidOperationException("A chave JWT não está configurada.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyConfig));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, usuario.Email),
                new Claim("perfil", usuario.Perfil.ToString()), // Custom claim para Perfil
                new Claim(ClaimTypes.Role, usuario.Perfil.ToString()) // Usando o padrao nativo da Microsoft
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
