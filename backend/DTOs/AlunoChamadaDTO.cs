using System;
using System.ComponentModel.DataAnnotations;
using backend.Models.Enums;

namespace backend.DTOs
{
    public class AlunoChamadaDTO
    {
        [Required]
        public Guid AlunoId { get; set; }

        [Required]
        public StatusPresenca Status { get; set; }

        [MaxLength(500)]
        public string? Observacao { get; set; }
    }
}
