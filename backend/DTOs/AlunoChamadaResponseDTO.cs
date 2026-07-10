using System;
using backend.Models.Enums;

namespace backend.DTOs
{
    public class AlunoChamadaResponseDTO
    {
        public Guid AlunoId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public StatusPresenca? Status { get; set; }
        public string? Observacao { get; set; }
    }
}
