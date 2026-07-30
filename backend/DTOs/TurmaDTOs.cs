using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class TurmaCreateDTO
    {
        [Required(ErrorMessage = "O nome da turma é obrigatório.")]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;
    }

    public class TurmaResponseDTO
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}