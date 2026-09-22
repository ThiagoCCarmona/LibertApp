using Microsoft.EntityFrameworkCore;
using LibertApp.Api.Data.Entities;

namespace LibertApp.Api.Data;

public class AppDbContext : DbContext
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<FeedPost> FeedPosts => Set<FeedPost>();
    public DbSet<PostComentario> PostComentarios => Set<PostComentario>();
    public DbSet<PostLike> PostLikes => Set<PostLike>();
    public DbSet<CommentLike> CommentLikes => Set<CommentLike>();
    public DbSet<UsuarioSeguidor> UsuarioSeguidores => Set<UsuarioSeguidor>();
    public DbSet<Desafio> Desafios => Set<Desafio>();
    public DbSet<UsuarioDesafio> UsuariosDesafios => Set<UsuarioDesafio>();
    public DbSet<ParceiroBeneficio> ParceirosBeneficios => Set<ParceiroBeneficio>();
    public DbSet<SessaoPomodoro> SessoesPomodoro => Set<SessaoPomodoro>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Desafios padrão da comunidade
        modelBuilder.Entity<Desafio>().HasData(
            new Desafio { Id = 1, Titulo = "Ficar 30 min offline na feira", Categoria = "daily", PontosRecompensa = 50, Ativo = true },
            new Desafio { Id = 2, Titulo = "Completar 2 Pomodoros de estudo", Categoria = "daily", PontosRecompensa = 75, Ativo = true },
            new Desafio { Id = 3, Titulo = "Fazer 1 pausa ativa sem telas", Categoria = "daily", PontosRecompensa = 40, Ativo = true },
            new Desafio { Id = 4, Titulo = "Fazer uma caminhada ao ar livre", Categoria = "weekly", PontosRecompensa = 150, Ativo = true },
            new Desafio { Id = 5, Titulo = "Meditar ou respirar 3x", Categoria = "weekly", PontosRecompensa = 120, Ativo = true },
            new Desafio { Id = 6, Titulo = "Conectar com alguém presencialmente", Categoria = "weekly", PontosRecompensa = 100, Ativo = true },
            new Desafio { Id = 7, Titulo = "Participar da gincana acadêmica", Categoria = "monthly", PontosRecompensa = 300, Ativo = true },
            new Desafio { Id = 8, Titulo = "Ler 1 livro completo", Categoria = "monthly", PontosRecompensa = 250, Ativo = true },
            new Desafio { Id = 9, Titulo = "Fazer 1 atividade em grupo", Categoria = "monthly", PontosRecompensa = 200, Ativo = true }
        );

        // Parceiros / Benefícios saudáveis
        modelBuilder.Entity<ParceiroBeneficio>().HasData(
            new ParceiroBeneficio { Id = 1, Nome = "Verde Brasil", Descricao = "Culinária saudável · Campus", Emoji = "🥗", NivelDesbloqueio = 1, UnlockedPadrao = true, Ativo = true },
            new ParceiroBeneficio { Id = 2, Nome = "Café do Bem", Descricao = "Café orgânico & Lanches", Emoji = "☕", NivelDesbloqueio = 2, UnlockedPadrao = true, Ativo = true },
            new ParceiroBeneficio { Id = 3, Nome = "Raízes", Descricao = "Comida natural & Sucos", Emoji = "🌾", NivelDesbloqueio = 3, UnlockedPadrao = true, Ativo = true },
            new ParceiroBeneficio { Id = 4, Nome = "Horta & Mesa", Descricao = "Alimentos frescos", Emoji = "🥕", NivelDesbloqueio = 4, UnlockedPadrao = false, Ativo = true },
            new ParceiroBeneficio { Id = 5, Nome = "Natural Fit", Descricao = "Açaí & Bowls energéticos", Emoji = "🥑", NivelDesbloqueio = 5, UnlockedPadrao = false, Ativo = true }
        );
    }
}
