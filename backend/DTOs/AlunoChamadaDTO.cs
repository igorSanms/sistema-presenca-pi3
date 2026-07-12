using System;
using System.ComponentModel.DataAnnotations;
using backend.Models.Enums;

namespace backend.DTOs
{
    public class AlunoChamadaDTO
    {
        [Required]
        public Guid AlunoId { get; set; }

        public StatusPresenca Status { get; set; }
    }
}
