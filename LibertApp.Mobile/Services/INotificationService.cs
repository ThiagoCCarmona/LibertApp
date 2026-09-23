namespace LibertApp.Mobile.Services;

public interface INotificationService
{
    /// <summary>Exibe uma notificação local imediata (lembrete de respiro, limite de tela, interações, etc.).</summary>
    Task<bool> ShowNowAsync(string title, string message);
}
