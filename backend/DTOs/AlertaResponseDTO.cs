using System;

namespace backend.DTOs
{
    public class AlertaResponseDTO
    {
        public Guid AlunoId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int FaltasReais { get; set; }
        public int NivelAlerta { get; set; }
    }
}
