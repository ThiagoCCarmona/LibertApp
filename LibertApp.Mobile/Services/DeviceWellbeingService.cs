namespace LibertApp.Mobile.Services;

public class DeviceWellbeingService : IDeviceWellbeingService
{
    public bool IsUsageAccessGranted()
    {
#if ANDROID
        try
        {
            var context = global::Android.App.Application.Context;
            var appOps = (global::Android.App.AppOpsManager)context.GetSystemService(global::Android.Content.Context.AppOpsService)!;
            var mode = appOps.CheckOpNoThrow(
                global::Android.App.AppOpsManager.OpstrGetUsageStats,
                global::Android.OS.Process.MyUid(),
                context.PackageName!);
            return mode == global::Android.App.AppOpsManagerMode.Allowed;
        }
        catch
        {
            return false;
        }
#else
        return false;
#endif
    }

    public void OpenUsageAccessSettings()
    {
#if ANDROID
        try
        {
            var context = global::Android.App.Application.Context;
            var intent = new global::Android.Content.Intent(global::Android.Provider.Settings.ActionUsageAccessSettings);
            intent.AddFlags(global::Android.Content.ActivityFlags.NewTask);
            context.StartActivity(intent);
        }
        catch
        {
            // Configuração indisponível neste dispositivo/fabricante
        }
#endif
    }

    public int? GetScreenTimeMinutesToday()
    {
#if ANDROID
        if (!IsUsageAccessGranted()) return null;

        try
        {
            var context = global::Android.App.Application.Context;
            var usageStatsManager = (global::Android.App.Usage.UsageStatsManager)context.GetSystemService(global::Android.Content.Context.UsageStatsService)!;

            var now = DateTimeOffset.UtcNow;
            var startOfDayLocal = DateTime.Today;
            var startMillis = ((DateTimeOffset)startOfDayLocal).ToUnixTimeMilliseconds();
            var endMillis = now.ToUnixTimeMilliseconds();

            var statsList = usageStatsManager.QueryUsageStats(
                global::Android.App.Usage.UsageStatsInterval.Daily, startMillis, endMillis);

            if (statsList == null) return null;

            long totalMs = 0;
            foreach (var stats in statsList)
            {
                totalMs += stats.TotalTimeInForeground;
            }

            return (int)(totalMs / 60000);
        }
        catch
        {
            return null;
        }
#else
        return null;
#endif
    }

    public bool IsDoNotDisturbAccessGranted()
    {
#if ANDROID
        try
        {
            var context = global::Android.App.Application.Context;
            var notificationManager = (global::Android.App.NotificationManager)context.GetSystemService(global::Android.Content.Context.NotificationService)!;
            return notificationManager.IsNotificationPolicyAccessGranted;
        }
        catch
        {
            return false;
        }
#else
        return false;
#endif
    }

    public void OpenDoNotDisturbAccessSettings()
    {
#if ANDROID
        try
        {
            var context = global::Android.App.Application.Context;
            var intent = new global::Android.Content.Intent(global::Android.Provider.Settings.ActionNotificationPolicyAccessSettings);
            intent.AddFlags(global::Android.Content.ActivityFlags.NewTask);
            context.StartActivity(intent);
        }
        catch
        {
            // Configuração indisponível neste dispositivo/fabricante
        }
#endif
    }

    public bool SetDigitalNightMode(bool enabled)
    {
#if ANDROID
        if (!IsDoNotDisturbAccessGranted()) return false;

        try
        {
            var context = global::Android.App.Application.Context;
            var notificationManager = (global::Android.App.NotificationManager)context.GetSystemService(global::Android.Content.Context.NotificationService)!;
            notificationManager.SetInterruptionFilter(enabled
                ? global::Android.App.InterruptionFilter.Alarms
                : global::Android.App.InterruptionFilter.All);
            return true;
        }
        catch
        {
            return false;
        }
#else
        return false;
#endif
    }
}
