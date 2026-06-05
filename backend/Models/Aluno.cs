using System;

namespace backend.Models
{
    public class Aluno
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public int Presencas { get; set; }
        public int FaltasReais { get; set; }
        public int FaltasJustificadas { get; set; }

        public ICollection<RegistroFrequencia> Registros { get; set; } = new List<RegistroFrequencia>();
    }
}
