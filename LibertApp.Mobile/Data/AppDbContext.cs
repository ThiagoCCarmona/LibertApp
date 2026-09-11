using Microsoft.EntityFrameworkCore;
using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Data;

public class AppDbContext : DbContext
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<SessaoPomodoro> SessoesPomodoro => Set<SessaoPomodoro>();
    public DbSet<Desafio> Desafios => Set<Desafio>();
    public DbSet<UsuarioDesafio> UsuariosDesafios => Set<UsuarioDesafio>();
    public DbSet<ParceiroBeneficio> ParceirosBeneficios => Set<ParceiroBeneficio>();
    public DbSet<FeedPost> FeedPosts => Set<FeedPost>();
    public DbSet<PostComentario> PostComentarios => Set<PostComentario>();
    public DbSet<UsuarioSeguidor> UsuarioSeguidores => Set<UsuarioSeguidor>();

    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var dbPath = Path.Combine(FileSystem.AppDataDirectory, "libertapp.db");
            optionsBuilder.UseSqlite($"Data Source={dbPath}");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed: Usuário padrão (Silvia Mendes)
        modelBuilder.Entity<Usuario>().HasData(
            new Usuario
            {
                Id = 1,
                Nome = "Silvia Mendes",
                Email = "silvia.mendes@email.com",
                SenhaHash = "123456",
                Telefone = "(11) 98765-4321",
                CPF = "123.456.789-00",
                Localizacao = "São Paulo, SP",
                NumeroCarteira = "LBT-0001-2024",
                DataNascimento = "15/03/1985",
                Pontos = 2450,
                Nivel = 3,
                DataCriacao = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed: Desafios
        modelBuilder.Entity<Desafio>().HasData(
            new Desafio { Id = 1, Titulo = "Ficar 30 min offline", Categoria = "daily", PontosRecompensa = 50, Ativo = true },
            new Desafio { Id = 2, Titulo = "Completar 2 Pomodoros", Categoria = "daily", PontosRecompensa = 75, Ativo = true },
            new Desafio { Id = 3, Titulo = "Fazer 1 pausa ativa", Categoria = "daily", PontosRecompensa = 40, Ativo = true },
            new Desafio { Id = 4, Titulo = "Fazer uma caminhada na natureza", Categoria = "weekly", PontosRecompensa = 150, Ativo = true },
            new Desafio { Id = 5, Titulo = "Meditar 3x", Categoria = "weekly", PontosRecompensa = 120, Ativo = true },
            new Desafio { Id = 6, Titulo = "Conectar com alguém presencialmente", Categoria = "weekly", PontosRecompensa = 100, Ativo = true },
            new Desafio { Id = 7, Titulo = "Participar de 1 gincana presencial", Categoria = "monthly", PontosRecompensa = 300, Ativo = true },
            new Desafio { Id = 8, Titulo = "Ler 1 livro completo", Categoria = "monthly", PontosRecompensa = 250, Ativo = true },
            new Desafio { Id = 9, Titulo = "Fazer 1 atividade em grupo", Categoria = "monthly", PontosRecompensa = 200, Ativo = true }
        );

        // Seed: Desafio concluído pela Silvia
        modelBuilder.Entity<UsuarioDesafio>().HasData(
            new UsuarioDesafio { Id = 1, UsuarioId = 1, DesafioId = 1, Concluido = true, DataConclusao = new DateTime(2024, 6, 10, 10, 0, 0, DateTimeKind.Utc) },
            new UsuarioDesafio { Id = 2, UsuarioId = 1, DesafioId = 5, Concluido = true, DataConclusao = new DateTime(2024, 6, 9, 15, 0, 0, DateTimeKind.Utc) }
        );

        // Seed: Parceiros / Benefícios
        modelBuilder.Entity<ParceiroBeneficio>().HasData(
            new ParceiroBeneficio { Id = 1, Nome = "Verde Brasil", Descricao = "Culinária saudável · Centro", Emoji = "🥗", NivelDesbloqueio = 1, UnlockedPadrao = true, Ativo = true },
            new ParceiroBeneficio { Id = 2, Nome = "Café do Bem", Descricao = "Café orgânico · Vila Madalena", Emoji = "☕", NivelDesbloqueio = 2, UnlockedPadrao = true, Ativo = true },
            new ParceiroBeneficio { Id = 3, Nome = "Raízes", Descricao = "Comida vegetariana · Pinheiros", Emoji = "🌾", NivelDesbloqueio = 3, UnlockedPadrao = true, Ativo = true },
            new ParceiroBeneficio { Id = 4, Nome = "Horta & Mesa", Descricao = "Farm to table · Itaim", Emoji = "🥕", NivelDesbloqueio = 4, UnlockedPadrao = false, Ativo = true },
            new ParceiroBeneficio { Id = 5, Nome = "Natural Fit", Descricao = "Lanches saudáveis · Moema", Emoji = "🥑", NivelDesbloqueio = 5, UnlockedPadrao = false, Ativo = true }
        );

        // Seed: Feed Posts
        modelBuilder.Entity<FeedPost>().HasData(
            new FeedPost
            {
                Id = 1,
                Autor = "Marcela Costa",
                AvatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&auto=format",
                TipoPost = "memory",
                Conteudo = "Completei os exercícios de memória e atenção durante minha pausa digital! Sinto a mente muito mais clara agora.",
                BgColor = "#FCE4EC",
                BorderColor = "#F8BBD0",
                Icon = "🧠",
                Likes = 24,
                Comments = 5,
                DataPublicacao = new DateTime(2024, 6, 11, 8, 0, 0, DateTimeKind.Utc)
            },
            new FeedPost
            {
                Id = 2,
                Autor = "Rafael Mendes",
                AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format",
                TipoPost = "nature",
                Conteudo = "Fiz uma trilha incrível na Serra do Mar! 2 horas de desconexão completa, natureza pura e foco visual renovado.",
                ImagemUrl = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&auto=format",
                BgColor = "#E8D7C8",
                BorderColor = "#D7C4B3",
                Icon = "🏔️",
                Likes = 42,
                Comments = 12,
                DataPublicacao = new DateTime(2024, 6, 11, 5, 0, 0, DateTimeKind.Utc)
            },
            new FeedPost
            {
                Id = 3,
                Autor = "Ana Oliveira",
                AvatarUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format",
                TipoPost = "games",
                Conteudo = "Que gincana incrível! Charadas, jogos de raciocínio rápido e muita socialização ao vivo. Voltei para casa com energia!",
                ImagemUrl = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop&auto=format",
                BgColor = "#FFEBEE",
                BorderColor = "#FFCDD2",
                Icon = "🎯",
                Likes = 38,
                Comments = 8,
                DataPublicacao = new DateTime(2024, 6, 10, 14, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
