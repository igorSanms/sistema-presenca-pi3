using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class JustificarFaltaRequestDTO
    {
        [Required]
        public Guid AlunoId { get; set; }

        [Required]
        public DateOnly Data { get; set; }

        [Required]
        [MaxLength(500)]
        public string Observacao { get; set; } = string.Empty;
    }
}
