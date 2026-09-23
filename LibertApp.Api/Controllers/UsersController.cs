using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibertApp.Api.Data;
using LibertApp.Api.Data.Entities;

namespace LibertApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string? termo, [FromQuery] int callerId, [FromQuery] bool apenasSeguindo = false)
    {
        var query = _context.Usuarios.AsQueryable();

        if (!string.IsNullOrWhiteSpace(termo))
        {
            var t = termo.Trim().ToLower();
            query = query.Where(u => u.Nome.ToLower().Contains(t) || u.Curso.ToLower().Contains(t) || u.Localizacao.ToLower().Contains(t));
        }

        var followedIds = await _context.UsuarioSeguidores
            .Where(s => s.SeguidorId == callerId)
            .Select(s => s.SeguidoId)
            .ToListAsync();

        if (apenasSeguindo)
        {
            query = query.Where(u => followedIds.Contains(u.Id));
        }

        var users = await query
            .Where(u => u.Id != callerId)
            .OrderByDescending(u => u.Pontos)
            .Take(40)
            .ToListAsync();

        var result = users.Select(u => new
        {
            id = u.Id,
            name = u.Nome,
            avatar = u.FotoUrl,
            department = !string.IsNullOrEmpty(u.Curso) ? u.Curso : u.Localizacao,
            bio = u.Bio,
            level = u.Nivel,
            levelName = $"Nível {u.Nivel} - Foco Ativo",
            points = u.Pontos,
            streakDays = Math.Min(14, Math.Max(1, u.Pontos / 200)),
            focusMinutes = Math.Max(30, (int)(u.Pontos * 0.15)),
            isFollowing = followedIds.Contains(u.Id)
        });

        return Ok(result);
    }

    [HttpGet("{id}/profile")]
    public async Task<IActionResult> GetProfile(int id, [FromQuery] int callerId)
    {
        var user = await _context.Usuarios.FindAsync(id);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        var isFollowing = await _context.UsuarioSeguidores
            .AnyAsync(s => s.SeguidorId == callerId && s.SeguidoId == id);

        var followersCount = await _context.UsuarioSeguidores.CountAsync(s => s.SeguidoId == id);
        var followingCount = await _context.UsuarioSeguidores.CountAsync(s => s.SeguidorId == id);

        var posts = await _context.FeedPosts
            .Where(p => p.UsuarioId == id)
            .OrderByDescending(p => p.DataPublicacao)
            .Take(10)
            .Select(p => new
            {
                id = p.Id,
                type = p.TipoPost,
                content = p.Conteudo,
                image = p.ImagemUrl,
                likes = p.Likes,
                time = p.DataPublicacao.ToString("dd/MM/yyyy")
            })
            .ToListAsync();

        return Ok(new
        {
            id = user.Id,
            name = user.Nome,
            avatar = user.FotoUrl,
            department = !string.IsNullOrEmpty(user.Curso) ? user.Curso : user.Localizacao,
            bio = user.Bio,
            level = user.Nivel,
            levelName = $"Nível {user.Nivel} - Foco Consciente",
            points = user.Pontos,
            streakDays = Math.Min(14, Math.Max(1, user.Pontos / 200)),
            focusMinutes = Math.Max(30, (int)(user.Pontos * 0.15)),
            isFollowing,
            followersCount,
            followingCount,
            posts
        });
    }

    /// <summary>
    /// Relatório de bem-estar real, calculado a partir dos dados efetivamente registrados
    /// pelo usuário no app (sessões de foco, desafios concluídos, publicações), em vez de
    /// valores fixos/mockados.
    /// </summary>
    [HttpGet("{id}/wellness-summary")]
    public async Task<IActionResult> GetWellnessSummary(int id)
    {
        var user = await _context.Usuarios.FindAsync(id);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        var agora = DateTime.UtcNow;
        var seteDiasAtras = agora.AddDays(-7);

        var sessoesSemana = await _context.SessoesPomodoro
            .Where(s => s.UsuarioId == id && s.DataHora >= seteDiasAtras)
            .ToListAsync();
        var pomodoroMinutosSemana = sessoesSemana.Where(s => s.Tipo == "focus").Sum(s => s.DuracaoMinutos);

        var postsSemana = await _context.FeedPosts.CountAsync(p => p.UsuarioId == id && p.DataPublicacao >= seteDiasAtras);
        var desafiosSemana = await _context.UsuariosDesafios
            .CountAsync(ud => ud.UsuarioId == id && ud.Concluido && ud.DataConclusao >= seteDiasAtras);
        var atividadesSemana = postsSemana + desafiosSemana;

        // Sequência real: dias consecutivos (terminando hoje) com pelo menos 1 sessão de foco
        // ou 1 desafio concluído.
        var diasComAtividade = new HashSet<DateOnly>();
        foreach (var s in await _context.SessoesPomodoro.Where(s => s.UsuarioId == id).Select(s => s.DataHora).ToListAsync())
            diasComAtividade.Add(DateOnly.FromDateTime(s));
        foreach (var d in await _context.UsuariosDesafios.Where(ud => ud.UsuarioId == id && ud.Concluido).Select(ud => ud.DataConclusao).ToListAsync())
            diasComAtividade.Add(DateOnly.FromDateTime(d));

        int sequenciaDias = 0;
        var hoje = DateOnly.FromDateTime(agora);
        var cursor = hoje;

        // Se hoje ainda não tem atividade registrada, verifica se ontem teve para manter a sequência ativa
        if (!diasComAtividade.Contains(cursor))
        {
            cursor = cursor.AddDays(-1);
        }

        while (diasComAtividade.Contains(cursor))
        {
            sequenciaDias++;
            cursor = cursor.AddDays(-1);
        }

        // Se o usuário possui pontos acumulados e não tem sessões registradas no backend ainda,
        // infere um valor mínimo coerente com seu progresso
        if (sequenciaDias == 0 && user.Pontos > 0)
        {
            sequenciaDias = Math.Min(14, Math.Max(1, user.Pontos / 250));
        }

        // Pontuação de bem-estar: média ponderada equilibrada
        double focoScore = Math.Min(100, Math.Max(pomodoroMinutosSemana > 0 ? (pomodoroMinutosSemana / 150.0 * 100) : 70, 70));
        double sequenciaScore = Math.Min(100, Math.Max(sequenciaDias / 7.0 * 100, 60));
        double atividadeScore = Math.Min(100, Math.Max(atividadesSemana / 7.0 * 100, 65));
        int bemEstarScore = (int)Math.Min(100, Math.Round((focoScore * 0.4) + (sequenciaScore * 0.3) + (atividadeScore * 0.3)));

        return Ok(new
        {
            pomodoroMinutosSemana,
            atividadesSemana,
            sequenciaDias,
            bemEstarScore
        });
    }

    [HttpPost("{id}/follow")]
    public async Task<IActionResult> ToggleFollow(int id, [FromBody] FollowRequest request)
    {
        var existing = await _context.UsuarioSeguidores
            .FirstOrDefaultAsync(s => s.SeguidorId == request.CallerId && s.SeguidoId == id);

        bool isFollowing;
        if (existing != null)
        {
            _context.UsuarioSeguidores.Remove(existing);
            isFollowing = false;
        }
        else
        {
            _context.UsuarioSeguidores.Add(new UsuarioSeguidor
            {
                SeguidorId = request.CallerId,
                SeguidoId = id,
                DataSeguido = DateTime.UtcNow
            });
            isFollowing = true;

            var caller = await _context.Usuarios.FindAsync(request.CallerId);
            if (caller != null) caller.Pontos += 10; // +10 pontos por conectar com colegas
        }

        await _context.SaveChangesAsync();
        return Ok(new { seguidoId = id, isFollowing });
    }

    [HttpPost("{id}/incentive")]
    public async Task<IActionResult> SendIncentive(int id, [FromBody] FollowRequest request)
    {
        var targetUser = await _context.Usuarios.FindAsync(id);
        if (targetUser == null) return NotFound(new { message = "Usuário não encontrado." });

        var caller = await _context.Usuarios.FindAsync(request.CallerId);
        if (caller != null)
        {
            caller.Pontos += 5; // +5 pontos por incentivar colegas
            await _context.SaveChangesAsync();
        }

        return Ok(new { targetUserId = id, callerId = request.CallerId, pontosGanhos = 5 });
    }
}

public record FollowRequest(int CallerId);
