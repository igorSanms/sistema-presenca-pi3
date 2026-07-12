using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Aula
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid DisciplinaId { get; set; }
        
        [ForeignKey("DisciplinaId")]
        public Disciplina Disciplina { get; set; } = null!;

        [Required]
        public DateOnly Data { get; set; }

        [Required]
        [MaxLength(50)]
        public string Horario { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Conteudo { get; set; }

        public ICollection<RegistroFrequencia> Registros { get; set; } = new List<RegistroFrequencia>();
    }
}
