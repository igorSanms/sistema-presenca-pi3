using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class RealizarChamadaRequestDTO
    {
        [Required]
        public DateOnly Data { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "A chamada deve conter pelo menos um registro.")]
        public List<AlunoChamadaDTO> Alunos { get; set; } = new List<AlunoChamadaDTO>();
    }
}
