using System;

namespace backend.DTOs
{
    public class ProfessorSelecaoDTO
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AreaAtuacao { get; set; } = string.Empty;
        public string? Telefone { get; set; } 
    }
}