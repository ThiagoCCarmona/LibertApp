#if ANDROID
using Android.App;
using Android.Content;
using Android.OS;
using System.Text.Json;

namespace LibertApp.Mobile.Platforms.Android;

[BroadcastReceiver(Enabled = true, Exported = false)]
public class BackgroundAlarmReceiver : BroadcastReceiver
{
    private static readonly HttpClient _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(12) };

    public override void OnReceive(Context? context, Intent? intent)
    {
        if (context == null || intent == null) return;

        string? action = intent.Action;

        if (action == BackgroundNotificationManager.ActionBreathing)
        {
            HandleBreathing(context);
        }
        else if (action == BackgroundNotificationManager.ActionCheckNotifications)
        {
            HandleCheckNotifications(context);
        }
    }

    private void HandleBreathing(Context context)
    {
        var prefs = Microsoft.Maui.Storage.Preferences.Default;
        bool enabled = prefs.Get("bg_breathing_enabled", true);
        if (!enabled) return;

        if (!IsWithinNightMode())
        {
            ShowNotification(
                context,
                "Hora de respirar 🌿",
                "Faça uma pausa de 1 minuto para respirar fundo e se reconectar com o momento presente.",
                1001
            );
        }

        // Reagenda o próximo lembrete de respiro
        int interval = prefs.Get("bg_breathing_interval", 120);
        BackgroundNotificationManager.ScheduleBreathing(context, interval);
    }

    private void HandleCheckNotifications(Context context)
    {
        var prefs = Microsoft.Maui.Storage.Preferences.Default;
        int userId = prefs.Get("bg_user_id", 0);

        if (userId > 0 && !IsWithinNightMode())
        {
            // Executa chamada assíncrona desacoplada com WakeLock temporário
            var powerManager = (PowerManager?)context.GetSystemService(Context.PowerService);
            var wakeLock = powerManager?.NewWakeLock(WakeLockFlags.Partial, "LibertApp:NotificationSyncWakeLock");
            wakeLock?.Acquire(15000); // máx 15 segundos

            Task.Run(async () =>
            {
                try
                {
                    string url = $"https://api.libertapp.com.br/api/users/{userId}/notifications";
                    var response = await _httpClient.GetAsync(url);
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();
                        using var doc = JsonDocument.Parse(json);
                        var root = doc.RootElement;
                        if (root.ValueKind == JsonValueKind.Array)
                        {
                            int notifId = 3000;
                            foreach (var item in root.EnumerateArray())
                            {
                                string titulo = item.TryGetProperty("titulo", out var t) ? t.GetString() ?? "" : "";
                                string mensagem = item.TryGetProperty("mensagem", out var m) ? m.GetString() ?? "" : "";
                                string tipo = item.TryGetProperty("tipo", out var tp) ? tp.GetString() ?? "" : "";

                                if (string.IsNullOrWhiteSpace(titulo))
                                {
                                    titulo = tipo == "follow" ? "Novo Seguidor! 🌱" : "Incentivo Recebido! 🌟";
                                }

                                if (!string.IsNullOrWhiteSpace(mensagem))
                                {
                                    ShowNotification(context, titulo, mensagem, notifId++);
                                }
                            }
                        }
                    }
                }
                catch
                {
                    // Falha silenciosa em caso de sem internet / offline
                }
                finally
                {
                    try { wakeLock?.Release(); } catch { }
                }
            });
        }

        // Reagenda a próxima checagem em 15 minutos
        BackgroundNotificationManager.SchedulePeriodicCheck(context, 15 * 60 * 1000L);
    }

    private bool IsWithinNightMode()
    {
        var prefs = Microsoft.Maui.Storage.Preferences.Default;
        if (!prefs.Get("bg_nightmode_enabled", false)) return false;

        string start = prefs.Get("bg_nightmode_start", "22:00");
        string end = prefs.Get("bg_nightmode_end", "07:00");

        try
        {
            var now = DateTime.Now;
            int nowMinutes = now.Hour * 60 + now.Minute;

            var sp = start.Split(':');
            var ep = end.Split(':');
            int startMinutes = int.Parse(sp[0]) * 60 + int.Parse(sp[1]);
            int endMinutes = int.Parse(ep[0]) * 60 + int.Parse(ep[1]);

            if (startMinutes == endMinutes) return false;
            if (startMinutes < endMinutes)
            {
                return nowMinutes >= startMinutes && nowMinutes < endMinutes;
            }
            return nowMinutes >= startMinutes || nowMinutes < endMinutes;
        }
        catch
        {
            return false;
        }
    }

    private void ShowNotification(Context context, string title, string message, int id)
    {
        BackgroundNotificationManager.CreateNotificationChannel(context);
        var notificationManager = (NotificationManager?)context.GetSystemService(Context.NotificationService);
        if (notificationManager == null) return;

        // PendingIntent para reabrir o app na MainActivity ao tocar na notificação
        var launchIntent = context.PackageManager?.GetLaunchIntentForPackage(context.PackageName ?? "");
        if (launchIntent != null)
        {
            launchIntent.AddFlags(ActivityFlags.ClearTop | ActivityFlags.SingleTop);
        }

        var contentIntent = PendingIntent.GetActivity(
            context,
            id,
            launchIntent ?? new Intent(context, typeof(MainActivity)),
            PendingIntentFlags.UpdateCurrent | PendingIntentFlags.Immutable
        );

        int iconId = global::Android.Resource.Drawable.IcDialogInfo;
        try
        {
            if (context.ApplicationInfo?.Icon != 0)
            {
                iconId = context.ApplicationInfo!.Icon;
            }
        }
        catch { }

        Notification.Builder builder;
        if (Build.VERSION.SdkInt >= BuildVersionCodes.O)
        {
            builder = new Notification.Builder(context, BackgroundNotificationManager.ChannelId);
        }
        else
        {
            builder = new Notification.Builder(context);
        }

        builder.SetContentTitle(title)
            .SetContentText(message)
            .SetSmallIcon(iconId)
            .SetContentIntent(contentIntent)
            .SetPriority((int)NotificationPriority.High)
            .SetDefaults(NotificationDefaults.All)
            .SetAutoCancel(true);

        notificationManager.Notify(id, builder.Build());
    }
}
#endif
