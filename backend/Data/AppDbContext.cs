using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AppDbContext(DbContextOptions<AppDbContext> options, IHttpContextAccessor httpContextAccessor) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Turma> Turmas { get; set; }
        public DbSet<Professor> Professores { get; set; }
        public DbSet<Aluno> Alunos { get; set; }
        public DbSet<RegistroFrequencia> RegistrosFrequencia { get; set; }
        public DbSet<Disciplina> Disciplinas { get; set; }
        public DbSet<Aula> Aulas { get; set; }
        public DbSet<AlunoDisciplina> AlunoDisciplinas { get; set; }
        public DbSet<RegistroAtividade> RegistrosAtividades { get; set; }
        public DbSet<Alerta> Alertas { get; set; }

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

            // Mapping for Turma
            modelBuilder.Entity<Turma>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nome).IsRequired().HasMaxLength(100);
            });

            // Mapping for Aluno
            modelBuilder.Entity<Aluno>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Matricula).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(150);
                
                // Impede matrículas duplicadas no banco
                entity.HasIndex(a => a.Matricula).IsUnique();

                // Adicione isso dentro das chaves do Aluno:
                entity.HasOne(a => a.Turma)
                      .WithMany(t => t.Alunos)
                      .HasForeignKey(a => a.TurmaId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Mapping for AlunoDisciplina (N:N)
            modelBuilder.Entity<AlunoDisciplina>(entity =>
            {
                entity.HasKey(e => new { e.AlunoId, e.DisciplinaId });
                entity.HasOne(e => e.Aluno).WithMany(a => a.AlunoDisciplinas).HasForeignKey(e => e.AlunoId);
                entity.HasOne(e => e.Disciplina).WithMany(d => d.AlunoDisciplinas).HasForeignKey(e => e.DisciplinaId);
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

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) 
                           ?? _httpContextAccessor.HttpContext?.User.FindFirst("sub");
            Guid? usuarioLogadoId = userIdClaim != null ? Guid.Parse(userIdClaim.Value) : null;

            if (usuarioLogadoId.HasValue)
            {
                var entries = ChangeTracker.Entries()
                    .Where(e => e.Entity.GetType().Name != nameof(RegistroAtividade) &&
                               (e.State == EntityState.Added || e.State == EntityState.Deleted || e.State == EntityState.Modified))
                    .ToList(); // Materializa a lista para não quebrar o enumerator

                foreach (var entry in entries)
                {
                    string acaoStr = entry.State switch
                    {
                        EntityState.Added => "Criação",
                        EntityState.Modified => "Edição",
                        EntityState.Deleted => "Exclusão",
                        _ => "Modificação"
                    };

                    var nomeEntidade = entry.Entity.GetType().Name;

                    RegistrosAtividades.Add(new RegistroAtividade
                    {
                        UsuarioId = usuarioLogadoId.Value,
                        Acao = $"{acaoStr} de {nomeEntidade}",
                        Descricao = $"Operação de {acaoStr.ToLower()} automatizada no registro do tipo {nomeEntidade}."
                    });
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
