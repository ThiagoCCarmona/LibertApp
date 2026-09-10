using LibertApp.Mobile.Data.Entities;

namespace LibertApp.Mobile.Services;

public interface IPomodoroService
{
    Task<SessaoPomodoro> RegistrarSessaoAsync(string tipo, int minutos);
    Task<int> GetMinutosFocoHojeAsync();
}
