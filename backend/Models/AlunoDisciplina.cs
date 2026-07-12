using System;

namespace backend.Models
{
    public class AlunoDisciplina
    {
        public Guid AlunoId { get; set; }
        public Aluno Aluno { get; set; } = null!;

        public Guid DisciplinaId { get; set; }
        public Disciplina Disciplina { get; set; } = null!;
    }
}
