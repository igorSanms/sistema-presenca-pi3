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

        [Required(ErrorMessage = "A data de início é obrigatória.")]
        public DateOnly DataInicio { get; set; }

        [Required(ErrorMessage = "A data de término é obrigatória.")]
        public DateOnly DataFim { get; set; }
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

        [Required(ErrorMessage = "A data de início é obrigatória.")]
        public DateOnly DataInicio { get; set; }

        [Required(ErrorMessage = "A data de término é obrigatória.")]
        public DateOnly DataFim { get; set; }
    }

    public class DisciplinaResponseDTO
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public Guid ProfessorId { get; set; }
        public string ProfessorNome { get; set; } = string.Empty;
        public string Horarios { get; set; } = string.Empty;
        public DateOnly DataInicio { get; set; }
        public DateOnly DataFim { get; set; }
        
        //  Retorna o status para o React saber se deve mostrar na grade ou não
        public bool Ativo { get; set; }
    }
}