using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibertApp.Api.Data;
using LibertApp.Api.Data.Entities;

namespace LibertApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedController : ControllerBase
{
    private readonly AppDbContext _context;

    public FeedController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetFeed([FromQuery] int? callerId)
    {
        var posts = await _context.FeedPosts
            .OrderByDescending(p => p.DataPublicacao)
            .Take(50)
            .ToListAsync();

        var likedPostIds = callerId.HasValue
            ? await _context.PostLikes.Where(l => l.UsuarioId == callerId.Value).Select(l => l.PostId).ToListAsync()
            : new List<int>();

        var result = new List<object>();
        foreach (var p in posts)
        {
            var commentCount = await _context.PostComentarios.CountAsync(c => c.PostId == p.Id);
            var likesCount = await _context.PostLikes.CountAsync(l => l.PostId == p.Id);

            result.Add(new
            {
                id = p.Id,
                usuarioId = p.UsuarioId,
                author = p.Autor,
                avatar = p.AvatarUrl,
                curso = p.Curso,
                type = p.TipoPost,
                content = p.Conteudo,
                image = p.ImagemUrl,
                bgColor = p.BgColor,
                borderColor = p.BorderColor,
                icon = p.Icon,
                likes = likesCount > 0 ? likesCount : p.Likes,
                comments = commentCount,
                liked = likedPostIds.Contains(p.Id),
                time = GetRelativeTime(p.DataPublicacao)
            });
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new { message = "O conteúdo da publicação é obrigatório." });
        }

        var user = await _context.Usuarios.FindAsync(request.UsuarioId);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        var bgColors = new Dictionary<string, (string bg, string border)>
        {
            { "nature", ("#E8D7C8", "#D7C4B3") },
            { "memory", ("#FCE4EC", "#F8BBD0") },
            { "games", ("#FFEBEE", "#FFCDD2") },
            { "reading", ("#E8F5E9", "#C8E6C9") }
        };

        var cat = (request.Category ?? "nature").ToLower();
        var (bg, border) = bgColors.TryGetValue(cat, out var scheme) ? scheme : ("#F5EFE3", "#EDE7DA");

        var post = new FeedPost
        {
            UsuarioId = user.Id,
            Autor = user.Nome,
            AvatarUrl = user.FotoUrl,
            Curso = user.Curso,
            TipoPost = cat,
            Conteudo = request.Content.Trim(),
            ImagemUrl = request.Image,
            Icon = request.Icon ?? "🏔️",
            BgColor = bg,
            BorderColor = border,
            Likes = 0,
            Comments = 0,
            DataPublicacao = DateTime.UtcNow
        };

        _context.FeedPosts.Add(post);
        user.Pontos += 20; // Bonificação por publicar
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = post.Id,
            usuarioId = post.UsuarioId,
            author = post.Autor,
            avatar = post.AvatarUrl,
            curso = post.Curso,
            type = post.TipoPost,
            content = post.Conteudo,
            image = post.ImagemUrl,
            bgColor = post.BgColor,
            borderColor = post.BorderColor,
            icon = post.Icon,
            likes = 0,
            comments = 0,
            liked = false,
            time = "Agora"
        });
    }

    [HttpPost("{id}/like")]
    public async Task<IActionResult> ToggleLike(int id, [FromBody] LikeRequest request)
    {
        var existing = await _context.PostLikes
            .FirstOrDefaultAsync(l => l.PostId == id && l.UsuarioId == request.UsuarioId);

        bool isLiked;
        if (existing != null)
        {
            _context.PostLikes.Remove(existing);
            isLiked = false;
        }
        else
        {
            _context.PostLikes.Add(new PostLike { PostId = id, UsuarioId = request.UsuarioId, DataCriacao = DateTime.UtcNow });
            isLiked = true;

            var user = await _context.Usuarios.FindAsync(request.UsuarioId);
            if (user != null) user.Pontos += 5; // +5 pontos por interagir
        }

        await _context.SaveChangesAsync();
        var totalLikes = await _context.PostLikes.CountAsync(l => l.PostId == id);
        return Ok(new { postId = id, likes = totalLikes, liked = isLiked });
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetComments(int id)
    {
        var comments = await _context.PostComentarios
            .Where(c => c.PostId == id)
            .OrderBy(c => c.DataCriacao)
            .Select(c => new
            {
                id = c.Id,
                author = c.AutorNome,
                avatar = c.AutorAvatar,
                curso = c.AutorCurso,
                text = c.Texto,
                time = GetRelativeTime(c.DataCriacao),
                likes = c.Likes
            })
            .ToListAsync();

        return Ok(comments);
    }

    [HttpPost("{id}/comment")]
    public async Task<IActionResult> AddComment(int id, [FromBody] AddCommentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Texto))
        {
            return BadRequest(new { message = "O comentário não pode ser vazio." });
        }

        var user = await _context.Usuarios.FindAsync(request.UsuarioId);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        var comentario = new PostComentario
        {
            PostId = id,
            UsuarioId = user.Id,
            AutorNome = user.Nome,
            AutorAvatar = user.FotoUrl,
            AutorCurso = user.Curso,
            Texto = request.Texto.Trim(),
            DataCriacao = DateTime.UtcNow
        };

        _context.PostComentarios.Add(comentario);
        user.Pontos += 5; // +5 pontos por comentar
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = comentario.Id,
            author = comentario.AutorNome,
            avatar = comentario.AutorAvatar,
            curso = comentario.AutorCurso,
            text = comentario.Texto,
            time = "Agora",
            likes = 0
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id, [FromQuery] int callerId)
    {
        var post = await _context.FeedPosts.FindAsync(id);
        if (post == null) return NotFound(new { message = "Post não encontrado." });

        var caller = await _context.Usuarios.FindAsync(callerId);
        if (caller == null) return Unauthorized(new { message = "Usuário não autenticado." });

        if (post.UsuarioId != callerId && !caller.IsAdmin)
        {
            return Forbid();
        }

        _context.FeedPosts.Remove(post);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Post excluído com sucesso." });
    }

    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(int id, [FromQuery] int callerId)
    {
        var comentario = await _context.PostComentarios.FindAsync(id);
        if (comentario == null) return NotFound(new { message = "Comentário não encontrado." });

        var caller = await _context.Usuarios.FindAsync(callerId);
        if (caller == null) return Unauthorized(new { message = "Usuário não autenticado." });

        if (comentario.UsuarioId != callerId && !caller.IsAdmin)
        {
            return Forbid();
        }

        _context.PostComentarios.Remove(comentario);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Comentário excluído com sucesso." });
    }

    private static string GetRelativeTime(DateTime dt)
    {
        var diff = DateTime.UtcNow - dt;
        if (diff.TotalMinutes < 1) return "Agora";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes}m atrás";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours}h atrás";
        return $"{(int)diff.TotalDays}d atrás";
    }
}

public record CreatePostRequest(int UsuarioId, string Content, string? Category, string? Icon, string? Image);
public record LikeRequest(int UsuarioId);
public record AddCommentRequest(int UsuarioId, string Texto);
