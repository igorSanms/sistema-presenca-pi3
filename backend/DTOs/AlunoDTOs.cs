using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class AlunoCreateDTO
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [MaxLength(200)]
        public string Nome { get; set; } = string.Empty;
        public string? Email { get; set; }
        [MaxLength(20)]
        public string? Telefone { get; set; }
        public List<Guid>? DisciplinasIds { get; set; }
    }

    public class AlunoUpdateDTO
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [MaxLength(200)]
        public string Nome { get; set; } = string.Empty;
        public string? Email { get; set; }
        [MaxLength(20)]
        public string? Telefone { get; set; }
    }

    public class AlunoDisciplinaResponseDTO
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
    }

    public class AlunoResponseDTO
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Matricula { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public bool Ativo { get; set; }
        public List<AlunoDisciplinaResponseDTO> Disciplinas { get; set; } = new List<AlunoDisciplinaResponseDTO>();

        public int Presencas { get; set; }
        public int FaltasReais { get; set; }
        public int FaltasJustificadas { get; set; }
        public int TotalAulas { get; set; }
    }
}