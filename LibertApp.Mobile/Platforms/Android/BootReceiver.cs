#if ANDROID
using Android.App;
using Android.Content;

namespace LibertApp.Mobile.Platforms.Android;

[BroadcastReceiver(Enabled = true, Exported = true)]
[IntentFilter(new[] { Intent.ActionBootCompleted, "android.intent.action.QUICKBOOT_POWERON" })]
public class BootReceiver : BroadcastReceiver
{
    public override void OnReceive(Context? context, Intent? intent)
    {
        if (context == null) return;
        if (intent?.Action == Intent.ActionBootCompleted ||
            intent?.Action == "android.intent.action.QUICKBOOT_POWERON")
        {
            BackgroundNotificationManager.ScheduleAll(context);
        }
    }
}
#endif
