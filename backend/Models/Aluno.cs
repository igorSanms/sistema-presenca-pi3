using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Aluno
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Matricula { get; set; } = string.Empty;

        public string? Email { get; set; }

        [MaxLength(20)]
        public string? Telefone { get; set; }

        // Adicione estas duas linhas:
        public Guid TurmaId { get; set; }
        public Turma? Turma { get; set; }

        public bool Ativo { get; set; } = true;

        public ICollection<RegistroFrequencia> Registros { get; set; } = new List<RegistroFrequencia>();
        public ICollection<AlunoDisciplina> AlunoDisciplinas { get; set; } = new List<AlunoDisciplina>();
    }
}