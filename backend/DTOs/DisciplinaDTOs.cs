using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class DisciplinaCreateDTO
    {
        [Required]
        [MaxLength(200)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        public Guid ProfessorId { get; set; }

        [Required(ErrorMessage = "O horário é obrigatório.")]
        public string Horarios { get; set; } = string.Empty;
    }

    public class DisciplinaUpdateDTO
    {
        [Required]
        [MaxLength(200)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        public Guid ProfessorId { get; set; }

        [Required(ErrorMessage = "O horário é obrigatório.")]
        public string Horarios { get; set; } = string.Empty;
    }

    public class DisciplinaResponseDTO
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public Guid ProfessorId { get; set; }
        public string ProfessorNome { get; set; } = string.Empty;
        public string Horarios { get; set; } = string.Empty;
    }
}
