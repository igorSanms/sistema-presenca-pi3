using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Turma
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        public bool Ativo { get; set; } = true;

        public ICollection<Aluno> Alunos { get; set; } = new List<Aluno>();
        public ICollection<Disciplina> Disciplinas { get; set; } = new List<Disciplina>();
    }
}