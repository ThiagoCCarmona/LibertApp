using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibertApp.Api.Data;
using LibertApp.Api.Data.Entities;

namespace LibertApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PomodoroController : ControllerBase
{
    private readonly AppDbContext _context;

    public PomodoroController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("session")]
    public async Task<IActionResult> RecordSession([FromBody] RecordSessionRequest request)
    {
        var user = await _context.Usuarios.FindAsync(request.UsuarioId);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        var sessao = new SessaoPomodoro
        {
            UsuarioId = user.Id,
            Tipo = request.Tipo,
            DuracaoMinutos = request.Minutos,
            DataHora = DateTime.UtcNow
        };

        _context.SessoesPomodoro.Add(sessao);

        // Pontos: 2 pontos por minuto de foco
        int pontosGanhos = request.Minutos * 2;
        user.Pontos += pontosGanhos;

        // Atualizar nível (a cada 600 pontos = 1 nível, até 5)
        user.Nivel = Math.Min(5, Math.Max(1, user.Pontos / 600 + 1));

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            pontosGanhos,
            totalPontos = user.Pontos,
            nivel = user.Nivel
        });
    }

    [HttpGet("desafios")]
    public async Task<IActionResult> GetDesafios([FromQuery] int usuarioId)
    {
        var concluidos = await _context.UsuariosDesafios
            .Where(ud => ud.UsuarioId == usuarioId && ud.Concluido)
            .Select(ud => ud.DesafioId)
            .ToListAsync();

        var desafios = await _context.Desafios
            .Where(d => d.Ativo)
            .ToListAsync();

        var result = desafios.Select(d => new
        {
            id = d.Id,
            title = d.Titulo,
            category = d.Categoria,
            points = d.PontosRecompensa,
            completed = concluidos.Contains(d.Id)
        });

        return Ok(result);
    }

    [HttpPost("desafios/{id}/toggle")]
    public async Task<IActionResult> ToggleDesafio(int id, [FromBody] ToggleDesafioRequest request)
    {
        var user = await _context.Usuarios.FindAsync(request.UsuarioId);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        var desafio = await _context.Desafios.FindAsync(id);
        if (desafio == null) return NotFound(new { message = "Desafio não encontrado." });

        var registro = await _context.UsuariosDesafios
            .FirstOrDefaultAsync(ud => ud.UsuarioId == request.UsuarioId && ud.DesafioId == id);

        bool novoStatus;
        if (registro == null)
        {
            registro = new UsuarioDesafio
            {
                UsuarioId = request.UsuarioId,
                DesafioId = id,
                Concluido = true,
                DataConclusao = DateTime.UtcNow
            };
            _context.UsuariosDesafios.Add(registro);
            novoStatus = true;
            user.Pontos += desafio.PontosRecompensa;
        }
        else
        {
            registro.Concluido = !registro.Concluido;
            novoStatus = registro.Concluido;
            if (novoStatus)
                user.Pontos += desafio.PontosRecompensa;
            else
                user.Pontos = Math.Max(0, user.Pontos - desafio.PontosRecompensa);
        }

        user.Nivel = Math.Min(5, Math.Max(1, user.Pontos / 600 + 1));
        await _context.SaveChangesAsync();

        return Ok(new { desafioId = id, completed = novoStatus, totalPontos = user.Pontos, nivel = user.Nivel });
    }

    [HttpPost("desafios")]
    public async Task<IActionResult> CreateDesafio([FromBody] CreateDesafioRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Titulo))
        {
            return BadRequest(new { message = "O título da meta é obrigatório." });
        }

        var desafio = new Desafio
        {
            Titulo = request.Titulo.Trim(),
            Categoria = string.IsNullOrWhiteSpace(request.Categoria) ? "daily" : request.Categoria.ToLower(),
            PontosRecompensa = request.PontosRecompensa > 0 ? request.PontosRecompensa : 50,
            Ativo = true
        };

        _context.Desafios.Add(desafio);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = desafio.Id,
            title = desafio.Titulo,
            category = desafio.Categoria,
            points = desafio.PontosRecompensa,
            completed = false
        });
    }

    [HttpPut("desafios/{id}")]
    public async Task<IActionResult> UpdateDesafio(int id, [FromBody] UpdateDesafioRequest request)
    {
        var desafio = await _context.Desafios.FindAsync(id);
        if (desafio == null) return NotFound(new { message = "Meta não encontrada." });

        if (!string.IsNullOrWhiteSpace(request.Titulo)) desafio.Titulo = request.Titulo.Trim();
        if (!string.IsNullOrWhiteSpace(request.Categoria)) desafio.Categoria = request.Categoria.ToLower();
        if (request.PontosRecompensa.HasValue && request.PontosRecompensa.Value > 0)
            desafio.PontosRecompensa = request.PontosRecompensa.Value;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = desafio.Id,
            title = desafio.Titulo,
            category = desafio.Categoria,
            points = desafio.PontosRecompensa
        });
    }

    [HttpDelete("desafios/{id}")]
    public async Task<IActionResult> DeleteDesafio(int id)
    {
        var desafio = await _context.Desafios.FindAsync(id);
        if (desafio == null) return NotFound(new { message = "Meta não encontrada." });

        _context.Desafios.Remove(desafio);

        var usuarioDesafios = await _context.UsuariosDesafios.Where(ud => ud.DesafioId == id).ToListAsync();
        _context.UsuariosDesafios.RemoveRange(usuarioDesafios);

        await _context.SaveChangesAsync();
        return Ok(new { message = "Meta excluída com sucesso." });
    }
}

public record RecordSessionRequest(int UsuarioId, string Tipo, int Minutos);
public record ToggleDesafioRequest(int UsuarioId);
public record CreateDesafioRequest(string Titulo, string Categoria, int PontosRecompensa);
public record UpdateDesafioRequest(string? Titulo, string? Categoria, int? PontosRecompensa);
