using Microsoft.EntityFrameworkCore;
using LibertApp.Mobile.Data;
using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private static int _currentUserId = 1;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public void SetCurrentUserId(int userId)
    {
        _currentUserId = userId;
    }

    public async Task<Usuario?> GetCurrentUserAsync()
    {
        var user = await _context.Usuarios.FindAsync(_currentUserId);
        return user ?? await _context.Usuarios.FirstOrDefaultAsync();
    }

    public async Task<Usuario?> LoginAsync(string email, string senha)
    {
        var user = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower());

        if (user != null)
        {
            // Valida senha se existir
            if (!string.IsNullOrEmpty(user.SenhaHash) && user.SenhaHash != senha)
            {
                return null;
            }
            _currentUserId = user.Id;
        }

        return user;
    }

    public async Task<Usuario> RegisterAsync(string nome, string email, string senha)
    {
        var existing = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower());

        if (existing != null)
        {
            throw new InvalidOperationException("Este e-mail já está cadastrado.");
        }

        var totalUsers = await _context.Usuarios.CountAsync();
        var newUser = new Usuario
        {
            Nome = nome.Trim(),
            Email = email.Trim(),
            SenhaHash = senha,
            Pontos = 50, // Bônus de boas-vindas
            Nivel = 1,
            NumeroCarteira = $"LBT-{(totalUsers + 1):D4}-{DateTime.UtcNow.Year}",
            DataCriacao = DateTime.UtcNow
        };

        _context.Usuarios.Add(newUser);
        await _context.SaveChangesAsync();

        _currentUserId = newUser.Id;
        return newUser;
    }

    public async Task<Usuario> UpdateProfileAsync(string nome, string email, string telefone, string cpf, string localizacao, string? fotoUrl = null)
    {
        var user = await GetCurrentUserAsync();
        if (user == null)
        {
            user = new Usuario();
            _context.Usuarios.Add(user);
        }

        user.Nome = nome;
        user.Email = email;
        user.Telefone = telefone;
        user.CPF = cpf;
        user.Localizacao = localizacao;
        if (!string.IsNullOrWhiteSpace(fotoUrl))
        {
            user.FotoUrl = fotoUrl;
        }

        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<List<Usuario>> GetRankingAsync()
    {
        return await _context.Usuarios
            .OrderByDescending(u => u.Pontos)
            .Take(15)
            .ToListAsync();
    }

    public async Task<List<object>> SearchUsersAsync(string termo, bool apenasSeguindo)
    {
        var currentId = _currentUserId;
        var query = _context.Usuarios.AsQueryable();

        if (!string.IsNullOrWhiteSpace(termo))
        {
            var t = termo.Trim().ToLower();
            query = query.Where(u => u.Nome.ToLower().Contains(t) || u.Localizacao.ToLower().Contains(t));
        }

        var followedIds = await _context.UsuarioSeguidores
            .Where(s => s.SeguidorId == currentId)
            .Select(s => s.SeguidoId)
            .ToListAsync();

        if (apenasSeguindo)
        {
            query = query.Where(u => followedIds.Contains(u.Id));
        }

        var users = await query
            .Where(u => u.Id != currentId)
            .OrderByDescending(u => u.Pontos)
            .Take(30)
            .ToListAsync();

        var result = new List<object>();
        foreach (var u in users)
        {
            result.Add(new
            {
                id = u.Id,
                name = u.Nome,
                avatar = u.FotoUrl ?? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                level = u.Nivel,
                levelName = $"Nível {u.Nivel} - Foco Consciente",
                points = u.Pontos,
                streakDays = Math.Min(14, Math.Max(1, u.Pontos / 200)),
                focusMinutes = Math.Max(30, (int)(u.Pontos * 0.15)),
                department = string.IsNullOrEmpty(u.Localizacao) ? "Comunidade Carmelita" : u.Localizacao,
                bio = "Dedicado(a) à desconexão e foco no bem-estar digital.",
                isFollowing = followedIds.Contains(u.Id)
            });
        }

        return result;
    }

    public async Task<bool> ToggleFollowAsync(int seguidoId)
    {
        var currentId = _currentUserId;
        var existing = await _context.UsuarioSeguidores
            .FirstOrDefaultAsync(s => s.SeguidorId == currentId && s.SeguidoId == seguidoId);

        if (existing != null)
        {
            _context.UsuarioSeguidores.Remove(existing);
            await _context.SaveChangesAsync();
            return false; // Não está mais seguindo
        }
        else
        {
            _context.UsuarioSeguidores.Add(new UsuarioSeguidor
            {
                SeguidorId = currentId,
                SeguidoId = seguidoId,
                DataSeguido = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
            return true; // Agora está seguindo
        }
    }
}
