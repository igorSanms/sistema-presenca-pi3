using System;
using backend.Models.Enums;

namespace backend.Models
{
    public class RegistroFrequencia
    {
        public Guid Id { get; set; }
        public DateOnly Data { get; set; }
        public StatusPresenca Status { get; set; }
        public string? Observacao { get; set; }
        
        public Guid AlunoId { get; set; }
        public Aluno? Aluno { get; set; }
    }
}
