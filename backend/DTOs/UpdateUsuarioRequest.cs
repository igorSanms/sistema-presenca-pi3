using System;

namespace backend.DTOs
{
    public class UpdateUsuarioRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public string? AreaAtuacao { get; set; }
    }
}