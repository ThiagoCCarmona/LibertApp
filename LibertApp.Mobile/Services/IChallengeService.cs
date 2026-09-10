using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Services;

public class DesafioItemDto
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Categoria { get; set; } = "daily";
    public int PontosRecompensa { get; set; }
    public bool Completed { get; set; }
}

public interface IChallengeService
{
    Task<List<DesafioItemDto>> GetDesafiosAsync();
    Task<bool> ToggleDesafioAsync(int desafioId);
}
