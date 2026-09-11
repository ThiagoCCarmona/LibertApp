using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Services;

public interface IUserService
{
    Task<Usuario?> GetCurrentUserAsync();
    void SetCurrentUserId(int userId);
    Task<Usuario?> LoginAsync(string email, string senha);
    Task<Usuario> RegisterAsync(string nome, string email, string senha);
    Task<Usuario> UpdateProfileAsync(string nome, string email, string telefone, string cpf, string localizacao);
    Task<List<Usuario>> GetRankingAsync();
    Task<List<object>> SearchUsersAsync(string termo, bool apenasSeguindo);
    Task<bool> ToggleFollowAsync(int seguidoId);
}
