using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibertApp.Api.Data;

namespace LibertApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public LeaderboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRanking()
    {
        var users = await _context.Usuarios
            .OrderByDescending(u => u.Pontos)
            .Take(25)
            .ToListAsync();

        var result = users.Select((u, index) => new
        {
            position = index + 1,
            id = u.Id,
            name = u.Nome,
            avatar = u.FotoUrl,
            department = !string.IsNullOrEmpty(u.Curso) ? u.Curso : u.Localizacao,
            points = u.Pontos,
            level = u.Nivel
        });

        return Ok(result);
    }
}
