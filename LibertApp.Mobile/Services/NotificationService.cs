namespace LibertApp.Mobile.Services;

/// <summary>
/// Notificações locais (disparadas pelo próprio dispositivo, sem servidor de push). Usadas
/// para lembretes de respiro, aviso de limite de tela e incentivo de perfil, todos calculados
/// e agendados pelo próprio React (setTimeout/setInterval) que apenas pede para o nativo
/// exibir a notificação na hora certa via a ponte HybridBridge.
/// Curtidas/comentários de outros usuários exigiriam push remoto (Firebase/APNs), fora do
/// escopo aqui pois depende de credenciais externas (projeto Firebase, certificado Apple)
/// que precisam ser provisionadas pela equipe.
/// </summary>
public class NotificationService : INotificationService
{
    public async Task<bool> ShowNowAsync(string title, string message)
    {
#if ANDROID
        return await ShowAndroidAsync(title, message);
#elif IOS
        return await ShowIosAsync(title, message);
#else
        await Task.CompletedTask;
        return false;
#endif
    }

#if ANDROID
    private const string ChannelId = "libertapp_alerts_v2";

    private async Task<bool> ShowAndroidAsync(string title, string message)
    {
        var context = global::Android.App.Application.Context;

        if (global::Android.OS.Build.VERSION.SdkInt >= global::Android.OS.BuildVersionCodes.Tiramisu)
        {
            var status = await Microsoft.Maui.ApplicationModel.Permissions.CheckStatusAsync<Microsoft.Maui.ApplicationModel.Permissions.PostNotifications>();
            if (status != Microsoft.Maui.ApplicationModel.PermissionStatus.Granted)
            {
                status = await Microsoft.Maui.ApplicationModel.Permissions.RequestAsync<Microsoft.Maui.ApplicationModel.Permissions.PostNotifications>();
            }
            if (status != Microsoft.Maui.ApplicationModel.PermissionStatus.Granted)
            {
                return false;
            }
        }
        else
        {
            var compat = AndroidX.Core.App.NotificationManagerCompat.From(context);
            if (!compat.AreNotificationsEnabled())
            {
                return false;
            }
        }

        var notificationManager = (global::Android.App.NotificationManager)context.GetSystemService(global::Android.Content.Context.NotificationService)!;

        global::Android.App.Notification.Builder builder;

        if (global::Android.OS.Build.VERSION.SdkInt >= global::Android.OS.BuildVersionCodes.O)
        {
            var channel = notificationManager.GetNotificationChannel(ChannelId);
            if (channel == null)
            {
                channel = new global::Android.App.NotificationChannel(
                    ChannelId, "Lembretes do LibertApp", global::Android.App.NotificationImportance.High)
                {
                    Description = "Lembretes de respiro, limite de tela e avisos da comunidade"
                };
                channel.EnableVibration(true);
                channel.EnableLights(true);
                notificationManager.CreateNotificationChannel(channel);
            }
            builder = new global::Android.App.Notification.Builder(context, ChannelId);
        }
        else
        {
            builder = new global::Android.App.Notification.Builder(context);
        }

        int iconId = global::Android.Resource.Drawable.IcDialogInfo;
        try
        {
            if (context.ApplicationInfo?.Icon != 0)
            {
                iconId = context.ApplicationInfo!.Icon;
            }
        }
        catch { }

        builder.SetContentTitle(title)
            .SetContentText(message)
            .SetSmallIcon(iconId)
            .SetPriority((int)global::Android.App.NotificationPriority.High)
            .SetDefaults(global::Android.App.NotificationDefaults.All)
            .SetAutoCancel(true);

        notificationManager.Notify(new Random().Next(1000, int.MaxValue), builder.Build());
        return true;
    }
#endif

#if IOS
    private async Task<bool> ShowIosAsync(string title, string message)
    {
        var center = UserNotifications.UNUserNotificationCenter.Current;
        var settings = await center.RequestAuthorizationAsync(
            UserNotifications.UNAuthorizationOptions.Alert | UserNotifications.UNAuthorizationOptions.Sound);

        if (!settings.Item1) return false;

        var content = new UserNotifications.UNMutableNotificationContent
        {
            Title = title,
            Body = message,
        };

        var trigger = UserNotifications.UNTimeIntervalNotificationTrigger.CreateTrigger(1, false);
        var request = UserNotifications.UNNotificationRequest.FromIdentifier(Guid.NewGuid().ToString(), content, trigger);

        var error = await center.AddNotificationRequestAsync(request);
        return error == null;
    }
#endif
}
