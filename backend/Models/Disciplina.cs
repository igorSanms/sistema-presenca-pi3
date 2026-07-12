using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Disciplina
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Nome { get; set; } = string.Empty;

        public Guid ProfessorId { get; set; }
        
        [ForeignKey("ProfessorId")]
        public Professor Professor { get; set; } = null!;

        public ICollection<AlunoDisciplina> AlunoDisciplinas { get; set; } = new List<AlunoDisciplina>();

        // Ciclos de Semestre
        public DateOnly DataInicio { get; set; }
        public DateOnly DataFim { get; set; }

        // Armazena os horários da disciplina (como JSON ou texto simples)
        public string Horarios { get; set; } = string.Empty;
    }
}
