using System;
using backend.Models.Enums;

namespace backend.Models
{
    public class RegistroFrequencia
    {
        public Guid Id { get; set; }
        
        public Guid AulaId { get; set; }
        public Aula? Aula { get; set; }

        public StatusPresenca Status { get; set; }
        
        public Guid AlunoId { get; set; }
        public Aluno? Aluno { get; set; }
    }
}
