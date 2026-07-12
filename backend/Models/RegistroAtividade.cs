using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class RegistroAtividade
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UsuarioId { get; set; }

        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }

        [Required]
        [MaxLength(100)]
        public string Acao { get; set; } = string.Empty;

        [Required]
        public string Descricao { get; set; } = string.Empty;

        public DateTime DataHora { get; set; } = DateTime.UtcNow;
    }
}
