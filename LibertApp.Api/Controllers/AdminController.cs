using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibertApp.Api.Data;
using LibertApp.Api.Data.Entities;
using LibertApp.Api.Security;

namespace LibertApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    private async Task<bool> CheckIsAdminAsync(int callerId)
    {
        var caller = await _context.Usuarios.FindAsync(callerId);
        return caller != null && caller.IsAdmin;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int callerId)
    {
        if (!await CheckIsAdminAsync(callerId))
        {
            return Forbid();
        }

        var users = await _context.Usuarios
            .OrderByDescending(u => u.DataCriacao)
            .Select(u => new
            {
                id = u.Id,
                nome = u.Nome,
                email = u.Email,
                telefone = u.Telefone,
                cpf = u.CPF,
                curso = u.Curso,
                bio = u.Bio,
                localizacao = u.Localizacao,
                numeroCarteira = u.NumeroCarteira,
                fotoUrl = u.FotoUrl,
                pontos = u.Pontos,
                nivel = u.Nivel,
                isAdmin = u.IsAdmin,
                ativo = u.Ativo,
                dataCriacao = u.DataCriacao
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id, [FromQuery] int callerId)
    {
        if (!await CheckIsAdminAsync(callerId))
        {
            return Forbid();
        }

        if (id == callerId)
        {
            return BadRequest(new { message = "O administrador logado não pode excluir a própria conta." });
        }

        var user = await _context.Usuarios.FindAsync(id);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        // Remove dados relacionados ao usuário em cascata
        var posts = await _context.FeedPosts.Where(p => p.UsuarioId == id).ToListAsync();
        _context.FeedPosts.RemoveRange(posts);

        var comments = await _context.PostComentarios.Where(c => c.UsuarioId == id).ToListAsync();
        _context.PostComentarios.RemoveRange(comments);

        var likes = await _context.PostLikes.Where(l => l.UsuarioId == id).ToListAsync();
        _context.PostLikes.RemoveRange(likes);

        var commentLikes = await _context.CommentLikes.Where(l => l.UsuarioId == id).ToListAsync();
        _context.CommentLikes.RemoveRange(commentLikes);

        var follows = await _context.UsuarioSeguidores.Where(s => s.SeguidorId == id || s.SeguidoId == id).ToListAsync();
        _context.UsuarioSeguidores.RemoveRange(follows);

        var desafios = await _context.UsuariosDesafios.Where(d => d.UsuarioId == id).ToListAsync();
        _context.UsuariosDesafios.RemoveRange(desafios);

        var pomodoros = await _context.SessoesPomodoro.Where(p => p.UsuarioId == id).ToListAsync();
        _context.SessoesPomodoro.RemoveRange(pomodoros);

        _context.Usuarios.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Usuário '{user.Nome}' e todos os seus dados foram excluídos com sucesso." });
    }

    [HttpPost("users/{id}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(int id, [FromQuery] int callerId)
    {
        if (!await CheckIsAdminAsync(callerId))
        {
            return Forbid();
        }

        if (id == callerId)
        {
            return BadRequest(new { message = "O administrador logado não pode desativar a própria conta." });
        }

        var user = await _context.Usuarios.FindAsync(id);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        user.Ativo = !user.Ativo;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id,
            ativo = user.Ativo,
            message = user.Ativo ? $"Conta de '{user.Nome}' reativada com sucesso." : $"Conta de '{user.Nome}' desativada com sucesso."
        });
    }

    [HttpPost("users/{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, [FromQuery] int callerId, [FromBody] ResetPasswordRequest request)
    {
        if (!await CheckIsAdminAsync(callerId))
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Trim().Length < 4)
        {
            return BadRequest(new { message = "A nova senha deve possuir ao menos 4 caracteres." });
        }

        var user = await _context.Usuarios.FindAsync(id);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        user.SenhaHash = PasswordHasher.Hash(request.NewPassword.Trim());

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Senha do usuário '{user.Nome}' redefinida com sucesso." });
    }
}

public record ResetPasswordRequest(string NewPassword);
