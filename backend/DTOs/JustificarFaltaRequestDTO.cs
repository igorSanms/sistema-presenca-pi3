using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class JustificarFaltaRequestDTO
    {
        [Required]
        public Guid AlunoId { get; set; }

        [Required]
        public Guid DisciplinaId { get; set; }

        [Required]
        public DateOnly Data { get; set; }

        [Required]
        public string Horario { get; set; } = string.Empty;
    }
}
