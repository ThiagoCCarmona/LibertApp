using Android.App;
using Android.Content;
using Android.Content.PM;
using Android.OS;

namespace LibertApp.Mobile;

[Activity(Theme = "@style/Maui.SplashTheme", Label = "LibertApp", MainLauncher = true, LaunchMode = LaunchMode.SingleTop, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation | ConfigChanges.UiMode | ConfigChanges.ScreenLayout | ConfigChanges.SmallestScreenSize | ConfigChanges.Density)]
public class MainActivity : MauiAppCompatActivity
{
    protected override void OnActivityResult(int requestCode, Result resultCode, Intent? data)
    {
        base.OnActivityResult(requestCode, resultCode, data);

        if (requestCode != FileChooserWebChromeClient.RequestCode) return;

        var callback = FileChooserWebChromeClient.PendingFilePathCallback;
        FileChooserWebChromeClient.PendingFilePathCallback = null;

        Android.Net.Uri[]? results = null;
        if (resultCode == Result.Ok && data != null)
        {
            if (data.ClipData != null)
            {
                var count = data.ClipData.ItemCount;
                results = new Android.Net.Uri[count];
                for (int i = 0; i < count; i++)
                {
                    results[i] = data.ClipData.GetItemAt(i)!.Uri!;
                }
            }
            else if (data.Data != null)
            {
                results = new[] { data.Data };
            }
        }

        callback?.OnReceiveValue(results);
    }
}
