#if ANDROID
using Android.App;
using Android.Content;
using Android.OS;
using System.Text.Json;

namespace LibertApp.Mobile.Platforms.Android;

public static class BackgroundNotificationManager
{
    public const string ActionBreathing = "com.libertapp.carmelita.ACTION_BREATHING";
    public const string ActionCheckNotifications = "com.libertapp.carmelita.ACTION_CHECK_NOTIFICATIONS";
    public const string ChannelId = "libertapp_background_channel";

    private const int RequestCodeBreathing = 2001;
    private const int RequestCodeCheck = 2002;

    public static void SaveSettings(int userId, bool breathingEnabled, int breathingIntervalMinutes, bool nightMode, string nightModeStart, string nightModeEnd)
    {
        var prefs = Microsoft.Maui.Storage.Preferences.Default;
        if (userId > 0) prefs.Set("bg_user_id", userId);
        prefs.Set("bg_breathing_enabled", breathingEnabled);
        prefs.Set("bg_breathing_interval", Math.Max(5, breathingIntervalMinutes));
        prefs.Set("bg_nightmode_enabled", nightMode);
        prefs.Set("bg_nightmode_start", nightModeStart ?? "22:00");
        prefs.Set("bg_nightmode_end", nightModeEnd ?? "07:00");
    }

    public static void ScheduleAll(Context context)
    {
        CreateNotificationChannel(context);

        var prefs = Microsoft.Maui.Storage.Preferences.Default;
        bool breathingEnabled = prefs.Get("bg_breathing_enabled", true);
        int interval = prefs.Get("bg_breathing_interval", 120);
        int userId = prefs.Get("bg_user_id", 0);

        if (breathingEnabled)
        {
            ScheduleBreathing(context, interval);
        }
        else
        {
            CancelBreathing(context);
        }

        if (userId > 0)
        {
            SchedulePeriodicCheck(context);
        }
    }

    public static void ScheduleBreathing(Context context, int intervalMinutes)
    {
        CreateNotificationChannel(context);
        var alarmManager = (AlarmManager?)context.GetSystemService(Context.AlarmService);
        if (alarmManager == null) return;

        var intent = new Intent(context, typeof(BackgroundAlarmReceiver));
        intent.SetAction(ActionBreathing);

        var pendingIntent = PendingIntent.GetBroadcast(
            context,
            RequestCodeBreathing,
            intent,
            PendingIntentFlags.UpdateCurrent | PendingIntentFlags.Immutable
        );

        long triggerAtMillis = Java.Lang.JavaSystem.CurrentTimeMillis() + (intervalMinutes * 60 * 1000L);

        if (Build.VERSION.SdkInt >= BuildVersionCodes.M)
        {
            alarmManager.SetExactAndAllowWhileIdle(AlarmType.RtcWakeup, triggerAtMillis, pendingIntent);
        }
        else
        {
            alarmManager.Set(AlarmType.RtcWakeup, triggerAtMillis, pendingIntent);
        }
    }

    public static void CancelBreathing(Context context)
    {
        var alarmManager = (AlarmManager?)context.GetSystemService(Context.AlarmService);
        if (alarmManager == null) return;

        var intent = new Intent(context, typeof(BackgroundAlarmReceiver));
        intent.SetAction(ActionBreathing);

        var pendingIntent = PendingIntent.GetBroadcast(
            context,
            RequestCodeBreathing,
            intent,
            PendingIntentFlags.UpdateCurrent | PendingIntentFlags.Immutable
        );

        alarmManager.Cancel(pendingIntent);
    }

    public static void SchedulePeriodicCheck(Context context, long delayMillis = 15 * 60 * 1000L)
    {
        CreateNotificationChannel(context);
        var alarmManager = (AlarmManager?)context.GetSystemService(Context.AlarmService);
        if (alarmManager == null) return;

        var intent = new Intent(context, typeof(BackgroundAlarmReceiver));
        intent.SetAction(ActionCheckNotifications);

        var pendingIntent = PendingIntent.GetBroadcast(
            context,
            RequestCodeCheck,
            intent,
            PendingIntentFlags.UpdateCurrent | PendingIntentFlags.Immutable
        );

        long triggerAtMillis = Java.Lang.JavaSystem.CurrentTimeMillis() + delayMillis;

        if (Build.VERSION.SdkInt >= BuildVersionCodes.M)
        {
            alarmManager.SetExactAndAllowWhileIdle(AlarmType.RtcWakeup, triggerAtMillis, pendingIntent);
        }
        else
        {
            alarmManager.Set(AlarmType.RtcWakeup, triggerAtMillis, pendingIntent);
        }
    }

    public static void CreateNotificationChannel(Context context)
    {
        if (Build.VERSION.SdkInt >= BuildVersionCodes.O)
        {
            var notificationManager = (NotificationManager?)context.GetSystemService(Context.NotificationService);
            if (notificationManager == null) return;

            var channel = notificationManager.GetNotificationChannel(ChannelId);
            if (channel == null)
            {
                channel = new NotificationChannel(
                    ChannelId,
                    "LibertApp Alertas e Lembretes",
                    NotificationImportance.High
                )
                {
                    Description = "Lembretes de respiro e notificações em segundo plano do LibertApp"
                };
                channel.EnableVibration(true);
                channel.EnableLights(true);
                channel.LockscreenVisibility = NotificationVisibility.Public;
                notificationManager.CreateNotificationChannel(channel);
            }
        }
    }
}
#endif
