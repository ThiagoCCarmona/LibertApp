using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibertApp.Api.Data;
using LibertApp.Api.Data.Entities;

namespace LibertApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AchievementsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AchievementsController(AppDbContext context)
    {
        _context = context;
    }

    private async Task<bool> CheckIsAdminAsync(int callerId)
    {
        var caller = await _context.Usuarios.FindAsync(callerId);
        return caller != null && caller.IsAdmin;
    }

    private async Task<int> CalcularProgressoAsync(Conquista conquista, int usuarioId)
    {
        return conquista.Tipo.ToLower() switch
        {
            "pontos" => (await _context.Usuarios.FindAsync(usuarioId))?.Pontos ?? 0,
            "pomodoros" => await _context.SessoesPomodoro.CountAsync(s => s.UsuarioId == usuarioId && s.Tipo == "focus"),
            "desafios" => await _context.UsuariosDesafios.CountAsync(ud => ud.UsuarioId == usuarioId && ud.Concluido),
            "posts" => await _context.FeedPosts.CountAsync(p => p.UsuarioId == usuarioId),
            "seguidores" => await _context.UsuarioSeguidores.CountAsync(s => s.SeguidoId == usuarioId),
            _ => 0
        };
    }

    /// <summary>
    /// Lista as conquistas ativas com o progresso do usuário informado. Desbloqueia (e concede a
    /// recompensa de pontos) automaticamente quaisquer conquistas cuja meta já foi atingida e que
    /// ainda não tinham sido registradas.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMinhasConquistas([FromQuery] int usuarioId)
    {
        var usuario = await _context.Usuarios.FindAsync(usuarioId);
        if (usuario == null) return NotFound(new { message = "Usuário não encontrado." });

        var conquistas = await _context.Conquistas.Where(c => c.Ativo).OrderBy(c => c.Meta).ToListAsync();
        var desbloqueadas = await _context.UsuarioConquistas
            .Where(uc => uc.UsuarioId == usuarioId)
            .ToDictionaryAsync(uc => uc.ConquistaId, uc => uc.DataConquistada);

        bool houveNovaConquista = false;
        var result = new List<object>();

        foreach (var c in conquistas)
        {
            var progresso = await CalcularProgressoAsync(c, usuarioId);
            var jaDesbloqueada = desbloqueadas.TryGetValue(c.Id, out var dataConquistada);

            if (!jaDesbloqueada && progresso >= c.Meta)
            {
                _context.UsuarioConquistas.Add(new UsuarioConquista
                {
                    UsuarioId = usuarioId,
                    ConquistaId = c.Id,
                    DataConquistada = DateTime.UtcNow
                });
                if (c.PontosRecompensa > 0) usuario.Pontos += c.PontosRecompensa;

                jaDesbloqueada = true;
                dataConquistada = DateTime.UtcNow;
                houveNovaConquista = true;
            }

            result.Add(new
            {
                id = c.Id,
                titulo = c.Titulo,
                descricao = c.Descricao,
                icone = c.Icone,
                tipo = c.Tipo,
                meta = c.Meta,
                pontosRecompensa = c.PontosRecompensa,
                progresso = Math.Min(progresso, c.Meta),
                desbloqueada = jaDesbloqueada,
                dataConquistada = jaDesbloqueada ? dataConquistada : (DateTime?)null
            });
        }

        if (houveNovaConquista)
        {
            await _context.SaveChangesAsync();
        }

        return Ok(result);
    }

    /// <summary>Lista bruta para o painel administrativo gerenciar (criar/editar/excluir) conquistas.</summary>
    [HttpGet("admin")]
    public async Task<IActionResult> GetTodasParaAdmin([FromQuery] int callerId)
    {
        if (!await CheckIsAdminAsync(callerId)) return Forbid();

        var conquistas = await _context.Conquistas.OrderBy(c => c.Meta).ToListAsync();
        return Ok(conquistas.Select(c => new
        {
            id = c.Id,
            titulo = c.Titulo,
            descricao = c.Descricao,
            icone = c.Icone,
            tipo = c.Tipo,
            meta = c.Meta,
            pontosRecompensa = c.PontosRecompensa,
            ativo = c.Ativo
        }));
    }

    [HttpPost]
    public async Task<IActionResult> CreateConquista([FromBody] ConquistaRequest request, [FromQuery] int callerId)
    {
        if (!await CheckIsAdminAsync(callerId)) return Forbid();

        if (string.IsNullOrWhiteSpace(request.Titulo))
        {
            return BadRequest(new { message = "O título da conquista é obrigatório." });
        }

        var conquista = new Conquista
        {
            Titulo = request.Titulo.Trim(),
            Descricao = request.Descricao?.Trim() ?? string.Empty,
            Icone = string.IsNullOrWhiteSpace(request.Icone) ? "🏅" : request.Icone.Trim(),
            Tipo = string.IsNullOrWhiteSpace(request.Tipo) ? "pontos" : request.Tipo.Trim().ToLower(),
            Meta = request.Meta > 0 ? request.Meta : 1,
            PontosRecompensa = Math.Max(0, request.PontosRecompensa),
            Ativo = true,
            DataCriacao = DateTime.UtcNow
        };

        _context.Conquistas.Add(conquista);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Conquista criada com sucesso.", id = conquista.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateConquista(int id, [FromBody] ConquistaRequest request, [FromQuery] int callerId)
    {
        if (!await CheckIsAdminAsync(callerId)) return Forbid();

        var conquista = await _context.Conquistas.FindAsync(id);
        if (conquista == null) return NotFound(new { message = "Conquista não encontrada." });

        if (!string.IsNullOrWhiteSpace(request.Titulo)) conquista.Titulo = request.Titulo.Trim();
        if (request.Descricao != null) conquista.Descricao = request.Descricao.Trim();
        if (!string.IsNullOrWhiteSpace(request.Icone)) conquista.Icone = request.Icone.Trim();
        if (!string.IsNullOrWhiteSpace(request.Tipo)) conquista.Tipo = request.Tipo.Trim().ToLower();
        if (request.Meta > 0) conquista.Meta = request.Meta;
        if (request.PontosRecompensa >= 0) conquista.PontosRecompensa = request.PontosRecompensa;
        if (request.Ativo.HasValue) conquista.Ativo = request.Ativo.Value;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Conquista atualizada com sucesso." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteConquista(int id, [FromQuery] int callerId)
    {
        if (!await CheckIsAdminAsync(callerId)) return Forbid();

        var conquista = await _context.Conquistas.FindAsync(id);
        if (conquista == null) return NotFound(new { message = "Conquista não encontrada." });

        _context.Conquistas.Remove(conquista);

        var registros = await _context.UsuarioConquistas.Where(uc => uc.ConquistaId == id).ToListAsync();
        _context.UsuarioConquistas.RemoveRange(registros);

        await _context.SaveChangesAsync();
        return Ok(new { message = "Conquista excluída com sucesso." });
    }
}

public record ConquistaRequest(string Titulo, string? Descricao, string? Icone, string? Tipo, int Meta, int PontosRecompensa, bool? Ativo);
