using backend.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class RegisterRequest
    {
        [Required]
        public string Nome { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Senha { get; set; } = string.Empty;

        [Required]
        public Perfil Perfil { get; set; }

        public string? Telefone { get; set; }
        public string? AreaAtuacao { get; set; }
    }
}
