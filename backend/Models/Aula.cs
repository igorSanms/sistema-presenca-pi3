using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Aula
    {
        public Guid Id { get; set; }
        
        // Transformado em opcional para permitir "Dia Letivo Unificado"
        public Guid? DisciplinaId { get; set; } 
        
        [ForeignKey("DisciplinaId")]
        public Disciplina? Disciplina { get; set; }

        [Required]
        public DateOnly Data { get; set; }

        // Mantido para compatibilidade, mas nosso front mandará "Turno Unico"
        [MaxLength(50)]
        public string? Horario { get; set; } 

        [MaxLength(500)]
        public string? Conteudo { get; set; }

        public ICollection<RegistroFrequencia> Registros { get; set; } = new List<RegistroFrequencia>();
    }
}