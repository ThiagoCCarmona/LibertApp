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
            _ = RequestMediaPermissionsAndStartChooserAsync(activity);
            return true;
        }
        catch
        {
            PendingFilePathCallback = null;
            return false;
        }
    }

    private static async Task RequestMediaPermissionsAndStartChooserAsync(Android.App.Activity activity)
    {
        try
        {
            await Microsoft.Maui.ApplicationModel.Permissions.RequestAsync<Microsoft.Maui.ApplicationModel.Permissions.Media>();
        }
        catch { }

        try
        {
            var getContentIntent = new Intent(Intent.ActionGetContent);
            getContentIntent.SetType("image/*");
            getContentIntent.AddCategory(Intent.CategoryOpenable);

            var chooser = Intent.CreateChooser(getContentIntent, "Selecionar imagem");

            var takePictureIntent = new Intent(Android.Provider.MediaStore.ActionImageCapture);
            if (takePictureIntent.ResolveActivity(activity.PackageManager!) != null)
            {
                chooser.PutExtra(Intent.ExtraInitialIntents, new[] { takePictureIntent });
            }

            activity.StartActivityForResult(chooser, RequestCode);
        }
        catch
        {
            PendingFilePathCallback?.OnReceiveValue(null);
            PendingFilePathCallback = null;
        }
    }

    public override async void OnGeolocationPermissionsShowPrompt(string? origin, GeolocationPermissions.ICallback? callback)
    {
        try
        {
            var status = await Microsoft.Maui.ApplicationModel.Permissions.CheckStatusAsync<Microsoft.Maui.ApplicationModel.Permissions.LocationWhenInUse>();
            if (status != Microsoft.Maui.ApplicationModel.PermissionStatus.Granted)
            {
                status = await Microsoft.Maui.ApplicationModel.Permissions.RequestAsync<Microsoft.Maui.ApplicationModel.Permissions.LocationWhenInUse>();
            }
            callback?.Invoke(origin, status == Microsoft.Maui.ApplicationModel.PermissionStatus.Granted, false);
        }
        catch
        {
            callback?.Invoke(origin, false, false);
        }
    }
}
