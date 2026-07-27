using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
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

            Usuario usuario;

            if (request.Perfil == backend.Models.Enums.Perfil.Professor)
            {
                usuario = new Professor
                {
                    Id = Guid.NewGuid(),
                    Nome = request.Nome,
                    Email = request.Email,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
                    Perfil = request.Perfil,
                    // 👉 Se o telefone vier vazio, força a ser gravado como [null] no banco
                    Telefone = string.IsNullOrWhiteSpace(request.Telefone) ? null : request.Telefone,
                    AreaAtuacao = request.AreaAtuacao
                };
            }
            else
            {
                usuario = new Usuario
                {
                    Id = Guid.NewGuid(),
                    Nome = request.Nome,
                    Email = request.Email,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
                    Perfil = request.Perfil
                };
            }

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

            if (!usuario.Ativo)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Conta desativada pela coordenação." });
            }

            var token = GenerateJwtToken(usuario);

            return Ok(new { Token = token, Perfil = usuario.Perfil.ToString() });
        }

        [Authorize]
        [HttpGet("professores")]
        public async Task<IActionResult> GetProfessores()
        {
            var professores = await _context.Professores
                .Where(p => p.Ativo)
                .Select(p => new ProfessorSelecaoDTO
                {
                    Id = p.Id,
                    Nome = p.Nome,
                    Email = p.Email,
                    Telefone = p.Telefone, // 👉 Agora o backend devolve o telefone para o site
                    AreaAtuacao = string.IsNullOrEmpty(p.AreaAtuacao) ? "Não informada" : p.AreaAtuacao
                })
                .ToListAsync();

            return Ok(professores);
        }

        [Authorize(Roles = "Coordenacao")]
        [HttpDelete("professores/{id}")]
        public async Task<IActionResult> DeleteProfessor(Guid id)
        {
            var professor = await _context.Professores.FindAsync(id);
            if (professor == null)
            {
                return NotFound(new { Message = "Professor não encontrado." });
            }

            professor.Ativo = false; // Soft Delete
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Professor inativado com sucesso." });
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
                new Claim(ClaimTypes.Name, usuario.Nome),
                new Claim(JwtRegisteredClaimNames.Name, usuario.Nome),
                new Claim("perfil", usuario.Perfil.ToString()), // Custom claim para Perfil
                new Claim(ClaimTypes.Role, usuario.Perfil.ToString()) // Usando o padrao nativo da Microsoft
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [Authorize]
        [HttpGet("coordenadores")]
        public async Task<IActionResult> GetCoordenadores()
        {
            var coordenadores = await _context.Usuarios
                .Where(u => u.Perfil == backend.Models.Enums.Perfil.Coordenacao && u.Ativo)
                .Select(u => new
                {
                    Id = u.Id,
                    Nome = u.Nome,
                    Email = u.Email
                })
                .ToListAsync();

            return Ok(coordenadores);
        }

        [Authorize(Roles = "Coordenacao")]
        [HttpDelete("coordenadores/{id}")]
        public async Task<IActionResult> DeleteCoordenador(Guid id)
        {
            var coordenador = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == id && u.Perfil == backend.Models.Enums.Perfil.Coordenacao);

            if (coordenador == null)
            {
                return NotFound(new { Message = "Coordenador não encontrado." });
            }

            coordenador.Ativo = false; // Soft Delete
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Coordenador inativado com sucesso." });
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUsuarioById(Guid id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null || !usuario.Ativo)
                return NotFound(new { Message = "Usuário não encontrado." });

            if (usuario.Email.ToLower() == "admin@gmail.com")
            {
                return BadRequest(new { Message = "O administrador padrão do sistema não pode ser editado." });
            }

            return Ok(new
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Perfil = usuario.Perfil.ToString(),
                Telefone = usuario is Professor p ? p.Telefone : null,
                AreaAtuacao = usuario is Professor prof ? prof.AreaAtuacao : null
            });
        }

        [Authorize(Roles = "Coordenacao")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUsuario(Guid id, [FromBody] UpdateUsuarioRequest request)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null || !usuario.Ativo)
                return NotFound(new { Message = "Usuário não encontrado." });

            // 👉 TRAVA DE SEGURANÇA: Impede edição do administrador padrão
            if (usuario.Email.ToLower() == "admin@gmail.com")
            {
                return BadRequest(new { Message = "Não é permitido alterar os dados do administrador padrão do sistema." });
            }

            // 👉 TRAVA DE E-MAIL DUPLICADO
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var emailEmUso = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.Id != id);
                if (emailEmUso)
                {
                    return BadRequest(new { Message = "Este e-mail já está em uso por outro profissional." });
                }
            }

            // Atualiza campos comuns
            usuario.Nome = request.Nome;
            usuario.Email = request.Email;

            // Se for professor, atualiza os campos extras (Coordenador não entra aqui)
            if (usuario is Professor professor)
            {
                professor.Telefone = string.IsNullOrWhiteSpace(request.Telefone) ? null : request.Telefone;
                professor.AreaAtuacao = request.AreaAtuacao;
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cadastro atualizado com sucesso." });
        }
    }
}