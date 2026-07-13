using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Alerta
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid AlunoId { get; set; }

        [ForeignKey("AlunoId")]
        public Aluno? Aluno { get; set; }

        // Opcional para alertas de falta unificada
        public Guid? DisciplinaId { get; set; }

        [ForeignKey("DisciplinaId")]
        public Disciplina? Disciplina { get; set; }

        [Required]
        public string Mensagem { get; set; } = string.Empty;

        public bool Resolvido { get; set; } = false;

        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        public DateTime? DataResolucao { get; set; }
        public Guid? ResolvidoPorId { get; set; }

        [ForeignKey("ResolvidoPorId")]
        public Usuario? ResolvidoPor { get; set; }
    }
}