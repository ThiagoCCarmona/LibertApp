namespace LibertApp.Mobile.Services;

/// <summary>
/// Funcionalidades que dependem de permissões especiais do sistema operacional e por isso só
/// têm implementação real no Android (a Apple não permite que apps de terceiros leiam o tempo
/// de uso de outros apps nem liguem o "Não Perturbar" do sistema — ver Family Controls/Screen
/// Time da Apple). Em outras plataformas os métodos retornam valores neutros ("indisponível"),
/// em vez de fingir sucesso.
/// </summary>
public interface IDeviceWellbeingService
{
    bool IsUsageAccessGranted();
    void OpenUsageAccessSettings();

    /// <summary>Minutos de uso da tela hoje (soma do tempo em primeiro plano de todos os apps). Null se indisponível.</summary>
    int? GetScreenTimeMinutesToday();

    bool IsDoNotDisturbAccessGranted();
    void OpenDoNotDisturbAccessSettings();

    /// <summary>Liga/desliga o Modo Noturno Digital (filtro "somente alarmes" do sistema). Retorna se a ação foi aplicada.</summary>
    bool SetDigitalNightMode(bool enabled);
}
