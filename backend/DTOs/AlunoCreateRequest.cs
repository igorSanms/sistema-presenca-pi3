using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class AlunoCreateRequest
    {
        [Required, MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [EmailAddress, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Telefone { get; set; } = string.Empty;
    }
}