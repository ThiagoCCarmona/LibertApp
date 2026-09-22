using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibertApp.Api.Data;
using LibertApp.Api.Data.Entities;
using LibertApp.Api.Security;

namespace LibertApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Senha))
        {
            return BadRequest(new { message = "Nome, e-mail e senha são obrigatórios." });
        }

        var emailLower = request.Email.Trim().ToLower();
        var exists = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == emailLower);
        if (exists)
        {
            return Conflict(new { message = "Este e-mail já está cadastrado." });
        }

        var user = new Usuario
        {
            Nome = request.Nome.Trim(),
            Email = emailLower,
            SenhaHash = PasswordHasher.Hash(request.Senha),
            Telefone = request.Telefone ?? string.Empty,
            CPF = request.CPF ?? string.Empty,
            Curso = request.Curso ?? "Estudante Carmelita",
            Bio = request.Bio ?? "Focado em momentos de presença e desconexão digital.",
            Localizacao = "Comunidade Carmelita",
            FotoUrl = !string.IsNullOrEmpty(request.FotoUrl)
                ? request.FotoUrl
                : "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22128%22%20height%3D%22128%22%20viewBox%3D%220%200%20128%20128%22%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20rx%3D%2264%22%20fill%3D%22%23E8F0E8%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2254%25%22%20dominant-baseline%3D%22central%22%20text-anchor%3D%22middle%22%20font-size%3D%2264%22%20font-family%3D%22-apple-system%2C%20BlinkMacSystemFont%2C%20sans-serif%22%3E%F0%9F%8C%B1%3C%2Ftext%3E%3C%2Fsvg%3E",
            Pontos = 150,
            Nivel = 1,
            DataCriacao = DateTime.UtcNow
        };

        _context.Usuarios.Add(user);
        await _context.SaveChangesAsync();

        user.NumeroCarteira = $"LBT-2026-{1000 + user.Id}";
        await _context.SaveChangesAsync();

        return Ok(ToDto(user));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var emailLower = request.Email.Trim().ToLower();
        var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == emailLower);

        if (user == null || !PasswordHasher.Verify(request.Senha, user.SenhaHash))
        {
            return Unauthorized(new { message = "E-mail ou senha incorretos." });
        }

        if (!user.Ativo)
        {
            return Unauthorized(new { message = "Sua conta foi desativada pela coordenação/administração." });
        }

        if (PasswordHasher.NeedsRehash(user.SenhaHash))
        {
            user.SenhaHash = PasswordHasher.Hash(request.Senha);
            await _context.SaveChangesAsync();
        }

        return Ok(ToDto(user));
    }

    [HttpGet("user/{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _context.Usuarios.FindAsync(id);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });
        return Ok(ToDto(user));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, [FromQuery] int callerId)
    {
        var user = await _context.Usuarios.FindAsync(request.Id);
        if (user == null) return NotFound(new { message = "Usuário não encontrado." });

        if (callerId != request.Id)
        {
            var caller = await _context.Usuarios.FindAsync(callerId);
            if (caller == null || !caller.IsAdmin) return Forbid();
        }

        user.Nome = !string.IsNullOrWhiteSpace(request.Nome) ? request.Nome.Trim() : user.Nome;
        user.Telefone = request.Telefone ?? user.Telefone;
        user.CPF = request.CPF ?? user.CPF;
        user.Curso = request.Curso ?? user.Curso;
        user.Bio = request.Bio ?? user.Bio;
        user.Localizacao = request.Localizacao ?? user.Localizacao;
        user.FotoUrl = !string.IsNullOrWhiteSpace(request.FotoUrl) ? request.FotoUrl : user.FotoUrl;

        await _context.SaveChangesAsync();
        return Ok(ToDto(user));
    }

    [HttpPost("recover")]
    public async Task<IActionResult> Recover([FromBody] RecoverRequest request)
    {
        var emailLower = request.Email.Trim().ToLower();
        var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == emailLower);
        if (user == null)
        {
            return NotFound(new { message = "E-mail não encontrado no sistema." });
        }

        // Simula envio de instruções de recuperação
        return Ok(new { message = "Instruções para redefinição de acesso foram geradas com sucesso." });
    }

    private static object ToDto(Usuario u) => new
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
        ativo = u.Ativo
    };
}

public record RegisterRequest(string Nome, string Email, string Senha, string? Telefone, string? CPF, string? Curso, string? Bio, string? FotoUrl);
public record LoginRequest(string Email, string Senha);
public record UpdateProfileRequest(int Id, string? Nome, string? Telefone, string? CPF, string? Curso, string? Bio, string? Localizacao, string? FotoUrl);
public record RecoverRequest(string Email);
