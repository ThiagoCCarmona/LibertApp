using Microsoft.EntityFrameworkCore;
using LibertApp.Mobile.Data;
using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Services;

public interface IFeedService
{
    Task<List<object>> GetPostsAsync();
    Task<object> CreatePostAsync(string conteudo, string categoria, string icone, string? imagemUrl);
    Task<int> LikePostAsync(int postId);
    Task<List<PostComentario>> GetCommentsAsync(int postId);
    Task<PostComentario> AddCommentAsync(int postId, string texto);
}

public class FeedService : IFeedService
{
    private readonly AppDbContext _context;
    private readonly IUserService _userService;

    public FeedService(AppDbContext context, IUserService userService)
    {
        _context = context;
        _userService = userService;
    }

    public async Task<List<object>> GetPostsAsync()
    {
        var posts = await _context.FeedPosts
            .OrderByDescending(p => p.DataPublicacao)
            .ToListAsync();

        var result = new List<object>();
        foreach (var p in posts)
        {
            var user = await _context.Usuarios.FindAsync(p.UsuarioId);
            var commentCount = await _context.PostComentarios.CountAsync(c => c.PostId == p.Id);

            result.Add(new
            {
                id = p.Id,
                type = p.TipoPost,
                author = !string.IsNullOrEmpty(p.Autor) ? p.Autor : (user?.Nome ?? "Membro da Comunidade"),
                avatar = !string.IsNullOrEmpty(p.AvatarUrl) ? p.AvatarUrl : (user?.FotoUrl ?? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"),
                time = GetRelativeTime(p.DataPublicacao),
                content = p.Conteudo,
                image = p.ImagemUrl,
                bgColor = !string.IsNullOrEmpty(p.BgColor) ? p.BgColor : GetBgColor(p.TipoPost),
                borderColor = !string.IsNullOrEmpty(p.BorderColor) ? p.BorderColor : GetBorderColor(p.TipoPost),
                likes = p.Likes,
                comments = commentCount,
                liked = false,
                icon = !string.IsNullOrEmpty(p.Icon) ? p.Icon : "🏔️"
            });
        }

        return result;
    }

    public async Task<object> CreatePostAsync(string conteudo, string categoria, string icone, string? imagemUrl)
    {
        var currentUser = await _userService.GetCurrentUserAsync();
        int usuarioId = currentUser?.Id ?? 1;

        var newPost = new FeedPost
        {
            UsuarioId = usuarioId,
            Autor = currentUser?.Nome ?? "Você",
            AvatarUrl = currentUser?.FotoUrl ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            TipoPost = categoria,
            Conteudo = conteudo,
            Icon = icone,
            ImagemUrl = imagemUrl,
            BgColor = GetBgColor(categoria),
            BorderColor = GetBorderColor(categoria),
            Likes = 0,
            Comments = 0,
            DataPublicacao = DateTime.UtcNow
        };

        _context.FeedPosts.Add(newPost);

        // Bonifica o usuário com 20 pontos por compartilhar
        if (currentUser != null)
        {
            currentUser.Pontos += 20;
        }

        await _context.SaveChangesAsync();

        return new
        {
            id = newPost.Id,
            type = newPost.TipoPost,
            author = newPost.Autor,
            avatar = newPost.AvatarUrl,
            time = "Agora",
            content = newPost.Conteudo,
            image = newPost.ImagemUrl,
            bgColor = newPost.BgColor,
            borderColor = newPost.BorderColor,
            likes = 0,
            comments = 0,
            liked = false,
            icon = newPost.Icon
        };
    }

    public async Task<int> LikePostAsync(int postId)
    {
        var post = await _context.FeedPosts.FindAsync(postId);
        if (post != null)
        {
            post.Likes++;
            await _context.SaveChangesAsync();
            return post.Likes;
        }
        return 0;
    }

    public async Task<List<PostComentario>> GetCommentsAsync(int postId)
    {
        return await _context.PostComentarios
            .Where(c => c.PostId == postId)
            .OrderBy(c => c.DataCriacao)
            .ToListAsync();
    }

    public async Task<PostComentario> AddCommentAsync(int postId, string texto)
    {
        var currentUser = await _userService.GetCurrentUserAsync();

        var comentario = new PostComentario
        {
            PostId = postId,
            UsuarioId = currentUser?.Id ?? 1,
            AutorNome = currentUser?.Nome ?? "Você",
            AutorAvatar = currentUser?.FotoUrl ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            Texto = texto.Trim(),
            Likes = 0,
            DataCriacao = DateTime.UtcNow
        };

        _context.PostComentarios.Add(comentario);

        // Bonifica o usuário com 5 pontos por incentivar colegas
        if (currentUser != null)
        {
            currentUser.Pontos += 5;
        }

        await _context.SaveChangesAsync();
        return comentario;
    }

    private static string GetRelativeTime(DateTime date)
    {
        var span = DateTime.UtcNow - date;
        if (span.TotalMinutes < 1) return "Agora";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes}m atrás";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours}h atrás";
        return $"{(int)span.TotalDays}d atrás";
    }

    private static string GetBgColor(string tipo) => tipo switch
    {
        "nature" => "#E8D7C8",
        "memory" => "#FCE4EC",
        "games" => "#FFEBEE",
        "reading" => "#E8F5E9",
        _ => "#F5EFE3"
    };

    private static string GetBorderColor(string tipo) => tipo switch
    {
        "nature" => "#D7C4B3",
        "memory" => "#F8BBD0",
        "games" => "#FFCDD2",
        "reading" => "#C8E6C9",
        _ => "#EDE7DA"
    };
}
