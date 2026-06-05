using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Professor> Professores { get; set; }
        public DbSet<Aluno> Alunos { get; set; }
        public DbSet<RegistroFrequencia> RegistrosFrequencia { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Mapping for Usuario (TPH using Perfil as Discriminator)
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nome).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.Property(e => e.SenhaHash).IsRequired();
                
                // Configure Perfil to be stored as string
                entity.Property(e => e.Perfil).IsRequired().HasConversion<string>();

                // Configure TPH discriminator
                entity.HasDiscriminator(e => e.Perfil)
                      .HasValue<Usuario>(Perfil.Coordenacao)
                      .HasValue<Professor>(Perfil.Professor);

                // Unique email constraint
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Mapping for Professor specific properties
            modelBuilder.Entity<Professor>(entity =>
            {
                entity.Property(e => e.Telefone).HasMaxLength(20);
                entity.Property(e => e.AreaAtuacao).HasMaxLength(100);
            });

            // Mapping for Aluno
            modelBuilder.Entity<Aluno>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nome).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(150);
                entity.Property(e => e.Telefone).HasMaxLength(20);
                
                // Numeric counters
                entity.Property(e => e.Presencas).IsRequired().HasDefaultValue(0);
                entity.Property(e => e.FaltasReais).IsRequired().HasDefaultValue(0);
                entity.Property(e => e.FaltasJustificadas).IsRequired().HasDefaultValue(0);
                
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Mapping for RegistroFrequencia
            modelBuilder.Entity<RegistroFrequencia>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Data).IsRequired();
                entity.Property(e => e.Status).IsRequired().HasConversion<string>();
                entity.Property(e => e.Observacao).HasMaxLength(500);

                entity.HasOne(e => e.Aluno)
                      .WithMany(a => a.Registros)
                      .HasForeignKey(e => e.AlunoId)
                      .OnDelete(DeleteBehavior.Cascade); // Regra de exclusão em cascata
            });
        }
    }
}
