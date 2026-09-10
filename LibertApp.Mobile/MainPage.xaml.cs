using LibertApp.Mobile.Bridge;

namespace LibertApp.Mobile;

public partial class MainPage : ContentPage
{
    private readonly HybridBridge _bridge;

    public MainPage(HybridBridge bridge)
    {
        InitializeComponent();
        _bridge = bridge;
    }

    private async void OnHybridMessageReceived(object? sender, HybridWebViewRawMessageReceivedEventArgs e)
    {
        if (string.IsNullOrWhiteSpace(e.Message)) return;

        var responseJson = await _bridge.HandleMessageAsync(e.Message);

        MainThread.BeginInvokeOnMainThread(async () =>
        {
            try
            {
                await hybridWebView.EvaluateJavaScriptAsync($"window.__onNativeBridgeResponse && window.__onNativeBridgeResponse({responseJson});");
            }
            catch
            {
                // Safe ignore if page is transitioning
            }
        });
    }
}
