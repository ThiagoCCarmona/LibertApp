using Microsoft.EntityFrameworkCore;
using LibertApp.Mobile.Data;
using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> GetCurrentUserAsync()
    {
        return await _context.Usuarios.FirstOrDefaultAsync();
    }

    public async Task<Usuario?> LoginAsync(string email, string senha)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<Usuario> UpdateProfileAsync(string nome, string email, string telefone, string cpf, string localizacao)
    {
        var user = await _context.Usuarios.FirstOrDefaultAsync();
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

        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<List<Usuario>> GetRankingAsync()
    {
        return await _context.Usuarios
            .OrderByDescending(u => u.Pontos)
            .Take(10)
            .ToListAsync();
    }
}
