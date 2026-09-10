using Microsoft.EntityFrameworkCore;
using LibertApp.Mobile.Data;
using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Services;

public class ChallengeService : IChallengeService
{
    private readonly AppDbContext _context;

    public ChallengeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<DesafioItemDto>> GetDesafiosAsync()
    {
        var user = await _context.Usuarios.FirstOrDefaultAsync();
        var userId = user?.Id ?? 1;

        var concluidos = await _context.UsuariosDesafios
            .Where(ud => ud.UsuarioId == userId && ud.Concluido)
            .Select(ud => ud.DesafioId)
            .ToListAsync();

        var desafios = await _context.Desafios
            .Where(d => d.Ativo)
            .ToListAsync();

        return desafios.Select(d => new DesafioItemDto
        {
            Id = d.Id,
            Titulo = d.Titulo,
            Categoria = d.Categoria,
            PontosRecompensa = d.PontosRecompensa,
            Completed = concluidos.Contains(d.Id)
        }).ToList();
    }

    public async Task<bool> ToggleDesafioAsync(int desafioId)
    {
        var user = await _context.Usuarios.FirstOrDefaultAsync();
        var userId = user?.Id ?? 1;

        var registro = await _context.UsuariosDesafios
            .FirstOrDefaultAsync(ud => ud.UsuarioId == userId && ud.DesafioId == desafioId);

        var desafio = await _context.Desafios.FindAsync(desafioId);
        bool novoStatus;

        if (registro == null)
        {
            registro = new UsuarioDesafio
            {
                UsuarioId = userId,
                DesafioId = desafioId,
                Concluido = true,
                DataConclusao = DateTime.UtcNow
            };
            _context.UsuariosDesafios.Add(registro);
            novoStatus = true;

            if (user != null && desafio != null)
                user.Pontos += desafio.PontosRecompensa;
        }
        else
        {
            registro.Concluido = !registro.Concluido;
            novoStatus = registro.Concluido;

            if (user != null && desafio != null)
            {
                if (novoStatus)
                    user.Pontos += desafio.PontosRecompensa;
                else
                    user.Pontos = Math.Max(0, user.Pontos - desafio.PontosRecompensa);
            }
        }

        await _context.SaveChangesAsync();
        return novoStatus;
    }
}
