using Microsoft.EntityFrameworkCore;
using LibertApp.Mobile.Data;
using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Services;

public class PomodoroService : IPomodoroService
{
    private readonly AppDbContext _context;

    public PomodoroService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SessaoPomodoro> RegistrarSessaoAsync(string tipo, int minutos)
    {
        var user = await _context.Usuarios.FirstOrDefaultAsync();
        var sessao = new SessaoPomodoro
        {
            UsuarioId = user?.Id ?? 1,
            Tipo = tipo,
            DuracaoMinutos = minutos,
            DataHora = DateTime.UtcNow
        };

        _context.SessoesPomodoro.Add(sessao);

        // Pontuação bônus por foco
        if (tipo == "focus" && user != null)
        {
            user.Pontos += 25;
            if (user.Pontos >= 3000 && user.Nivel < 4) user.Nivel = 4;
            if (user.Pontos >= 4000 && user.Nivel < 5) user.Nivel = 5;
        }

        await _context.SaveChangesAsync();
        return sessao;
    }

    public async Task<int> GetMinutosFocoHojeAsync()
    {
        var hoje = DateTime.UtcNow.Date;
        return await _context.SessoesPomodoro
            .Where(s => s.Tipo == "focus" && s.DataHora >= hoje)
            .SumAsync(s => s.DuracaoMinutos);
    }
}
