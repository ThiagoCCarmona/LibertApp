using LibertApp.Mobile.Bridge;

namespace LibertApp.Mobile;

public partial class MainPage : ContentPage
{
    private readonly HybridBridge _bridge;

    /// <summary>
    /// Esquema de URL customizado usado pelo JS da SPA para "chamar" o C#, já que uma
    /// WebView apontando para conteúdo remoto (https) não pode usar o canal
    /// HybridWebView.SendRawMessage (bloqueado por política de mesma origem). O JS navega
    /// para "libertappbridge://send?payload=..."; interceptamos essa navegação abaixo,
    /// cancelamos e processamos a mensagem no HybridBridge normalmente.
    /// </summary>
    private const string BridgeSendPrefix = "libertappbridge://send?payload=";

    public MainPage(HybridBridge bridge)
    {
        InitializeComponent();
        _bridge = bridge;
    }

    private void OnNavigating(object? sender, WebNavigatingEventArgs e)
    {
        if (string.IsNullOrEmpty(e.Url) || !e.Url.StartsWith(BridgeSendPrefix, StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        e.Cancel = true;

        try
        {
            var encoded = e.Url.Substring(BridgeSendPrefix.Length);
            var rawMessage = Uri.UnescapeDataString(encoded);
            _ = HandleBridgeMessageAsync(rawMessage);
        }
        catch
        {
            // Mensagem malformada vinda da ponte: ignora com segurança
        }
    }

    private async Task HandleBridgeMessageAsync(string rawMessage)
    {
        var responseJson = await _bridge.HandleMessageAsync(rawMessage);

        MainThread.BeginInvokeOnMainThread(async () =>
        {
            try
            {
                var encoded = Uri.EscapeDataString(responseJson);
                await webView.EvaluateJavaScriptAsync(
                    $"window.__onNativeBridgeResponse && window.__onNativeBridgeResponse(JSON.parse(decodeURIComponent('{encoded}')));");
            }
            catch
            {
                // Ignora com segurança se a página estiver em transição
            }
        });
    }

    /// <summary>
    /// Reinjeta o "marcador" que o React usa para detectar que está rodando dentro do app
    /// nativo (isMauiHybrid) e a função de envio de mensagens para o C#, toda vez que a
    /// página termina de carregar.
    /// </summary>
    private async void OnNavigated(object? sender, WebNavigatedEventArgs e)
    {
        if (e.Result != WebNavigationResult.Success) return;

        const string injectScript = @"
            window.__LIBERTAPP_NATIVE_BRIDGE = true;
            window.__LIBERTAPP_NATIVE_BRIDGE_SEND = function(json) {
                window.location.href = 'libertappbridge://send?payload=' + encodeURIComponent(json);
            };
            window.dispatchEvent(new Event('libertapp-native-ready'));
        ";

        try
        {
            await webView.EvaluateJavaScriptAsync(injectScript);
        }
        catch
        {
            // Safe ignore
        }
    }

    /// <summary>
    /// Botão de voltar (hardware/gesto Android): delega primeiro para a navegação interna
    /// da SPA (window.__handleNativeBack, exposto pelo App.tsx). Só quando a SPA já está na
    /// tela raiz (retorna false) é que o app nativo assume o controle e manda o app para
    /// segundo plano, em vez de simplesmente fechar/matar o processo.
    /// </summary>
    protected override bool OnBackButtonPressed()
    {
        _ = HandleBackPressAsync();
        return true;
    }

    private async Task HandleBackPressAsync()
    {
        var handledBySpa = await TryHandleBackButtonInSpaAsync();
        if (handledBySpa) return;

#if ANDROID
        Microsoft.Maui.ApplicationModel.Platform.CurrentActivity?.MoveTaskToBack(true);
#else
        Application.Current?.Quit();
#endif
    }

    private async Task<bool> TryHandleBackButtonInSpaAsync()
    {
        try
        {
            var result = await webView.EvaluateJavaScriptAsync(
                "(window.__handleNativeBack && window.__handleNativeBack()) ? 'true' : 'false'");
            return string.Equals(result, "true", StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }
}
