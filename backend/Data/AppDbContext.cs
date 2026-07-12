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
        public DbSet<Disciplina> Disciplinas { get; set; }
        public DbSet<Aula> Aulas { get; set; }

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

            // Mapping for Aula
            modelBuilder.Entity<Aula>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Data).IsRequired();
                entity.Property(e => e.Horario).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Conteudo).HasMaxLength(500);

                entity.HasOne(e => e.Disciplina)
                      .WithMany()
                      .HasForeignKey(e => e.DisciplinaId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Mapping for RegistroFrequencia
            modelBuilder.Entity<RegistroFrequencia>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).IsRequired().HasConversion<string>();

                entity.HasOne(e => e.Aula)
                      .WithMany(a => a.Registros)
                      .HasForeignKey(e => e.AulaId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Aluno)
                      .WithMany(a => a.Registros)
                      .HasForeignKey(e => e.AlunoId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Garante que um aluno só possa ter uma frequência por aula
                entity.HasIndex(e => new { e.AulaId, e.AlunoId }).IsUnique();
            });

            // Mapping for Disciplina
            modelBuilder.Entity<Disciplina>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);

                entity.HasOne(e => e.Professor)
                      .WithMany()
                      .HasForeignKey(e => e.ProfessorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
