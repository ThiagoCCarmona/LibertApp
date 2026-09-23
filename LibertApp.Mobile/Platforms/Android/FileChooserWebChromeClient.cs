using Android.Content;
using Android.Webkit;
using AndroidWebView = Android.Webkit.WebView;

namespace LibertApp.Mobile;

/// <summary>
/// A WebView Android nao suporta &lt;input type="file"&gt; (usado para importar fotos de
/// perfil e de publicacoes) sem um WebChromeClient customizado que responda a
/// OnShowFileChooser. Esta classe abre o seletor de imagens do sistema e devolve o
/// resultado para a pagina; o resultado da Activity e capturado em MainActivity.OnActivityResult.
/// </summary>
public class FileChooserWebChromeClient : WebChromeClient
{
    public const int RequestCode = 8765;
    public static IValueCallback? PendingFilePathCallback;

    public override bool OnShowFileChooser(AndroidWebView? webView, IValueCallback? filePathCallback, FileChooserParams? fileChooserParams)
    {
        PendingFilePathCallback?.OnReceiveValue(null);
        PendingFilePathCallback = filePathCallback;

        var activity = Microsoft.Maui.ApplicationModel.Platform.CurrentActivity;
        if (activity == null)
        {
            PendingFilePathCallback = null;
            return false;
        }

        try
        {
            var intent = new Intent(Intent.ActionGetContent);
            intent.SetType("image/*");
            intent.AddCategory(Intent.CategoryOpenable);

            activity.StartActivityForResult(Intent.CreateChooser(intent, "Selecionar imagem"), RequestCode);
            return true;
        }
        catch
        {
            PendingFilePathCallback = null;
            return false;
        }
    }
}
