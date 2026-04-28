using System;
using backend.Models.Enums;

namespace backend.Models
{
    public class Usuario
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string SenhaHash { get; set; } = string.Empty;
        public Perfil Perfil { get; set; }
    }
}
