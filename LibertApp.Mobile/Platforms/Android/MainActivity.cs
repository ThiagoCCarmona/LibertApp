using Android.App;
using Android.Content.PM;
using Android.OS;

namespace LibertApp.Mobile;

[Activity(Theme = "@style/Maui.SplashTheme", Label = "LibertApp", MainLauncher = true, LaunchMode = LaunchMode.SingleTop, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation | ConfigChanges.UiMode | ConfigChanges.ScreenLayout | ConfigChanges.SmallestScreenSize | ConfigChanges.Density)]
public class MainActivity : MauiAppCompatActivity
{
}
