using Microsoft.EntityFrameworkCore;
using LibertApp.Mobile.Data;
using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Services;

public class PartnerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = "🥗";
    public int Level { get; set; } = 1;
    public bool Unlocked { get; set; }
}

public interface IBenefitService
{
    Task<List<PartnerDto>> GetPartnersAsync();
}

public class BenefitService : IBenefitService
{
    private readonly AppDbContext _context;

    public BenefitService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<PartnerDto>> GetPartnersAsync()
    {
        var user = await _context.Usuarios.FirstOrDefaultAsync();
        var userLevel = user?.Nivel ?? 1;

        var partners = await _context.ParceirosBeneficios
            .Where(p => p.Ativo)
            .OrderBy(p => p.NivelDesbloqueio)
            .ToListAsync();

        return partners.Select(p => new PartnerDto
        {
            Id = p.Id,
            Name = p.Nome,
            Description = p.Descricao,
            Icon = p.Emoji,
            Level = p.NivelDesbloqueio,
            Unlocked = p.UnlockedPadrao || userLevel >= p.NivelDesbloqueio
        }).ToList();
    }
}
