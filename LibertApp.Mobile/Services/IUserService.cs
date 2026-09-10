using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Services;

public interface IUserService
{
    Task<Usuario?> GetCurrentUserAsync();
    Task<Usuario?> LoginAsync(string email, string senha);
    Task<Usuario> UpdateProfileAsync(string nome, string email, string telefone, string cpf, string localizacao);
    Task<List<Usuario>> GetRankingAsync();
}
