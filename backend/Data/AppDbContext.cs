using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Aluno> Alunos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Mapping for Usuario
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nome).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.Property(e => e.SenhaHash).IsRequired();
                entity.Property(e => e.Perfil).IsRequired().HasConversion<string>(); // Armazenar Enum como String é uma boa prática
                
                // Unique email constraint for Usuario
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Mapping for Aluno
            modelBuilder.Entity<Aluno>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nome).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(150);
                entity.Property(e => e.Telefone).HasMaxLength(20);
                
                // Numeric counters explicitly required by RF04
                entity.Property(e => e.Presencas).IsRequired().HasDefaultValue(0);
                entity.Property(e => e.FaltasReais).IsRequired().HasDefaultValue(0);
                entity.Property(e => e.FaltasJustificadas).IsRequired().HasDefaultValue(0);
                
                // Unique email constraint for Aluno (if emails are mandatory or if provided)
                entity.HasIndex(e => e.Email).IsUnique();
            });
        }
    }
}
