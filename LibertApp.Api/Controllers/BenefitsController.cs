using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibertApp.Api.Data;

namespace LibertApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BenefitsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BenefitsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBenefits([FromQuery] int? usuarioId)
    {
        var userLevel = 1;
        if (usuarioId.HasValue)
        {
            var user = await _context.Usuarios.FindAsync(usuarioId.Value);
            if (user != null) userLevel = user.Nivel;
        }

        var parceiros = await _context.ParceirosBeneficios
            .Where(p => p.Ativo)
            .OrderBy(p => p.NivelDesbloqueio)
            .ToListAsync();

        var result = parceiros.Select(p => new
        {
            id = p.Id,
            name = p.Nome,
            description = p.Descricao,
            icon = p.Emoji,
            level = p.NivelDesbloqueio,
            unlocked = p.UnlockedPadrao || userLevel >= p.NivelDesbloqueio
        });

        return Ok(new
        {
            userLevel,
            totalPartners = parceiros.Count,
            unlockedCount = parceiros.Count(p => p.UnlockedPadrao || userLevel >= p.NivelDesbloqueio),
            partners = result
        });
    }
}
