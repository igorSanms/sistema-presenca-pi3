using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class JustificarFaltaRequestDTO
    {
        [Required]
        public Guid AlunoId { get; set; }

        public Guid? DisciplinaId { get; set; }

        [Required]
        public DateOnly Data { get; set; }

        public string? Horario { get; set; }
    }
}