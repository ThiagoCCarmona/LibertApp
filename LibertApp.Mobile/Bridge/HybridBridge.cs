using System.Text.Json;
using LibertApp.Mobile.Services;

namespace LibertApp.Mobile.Bridge;

public class HybridBridge
{
    private readonly IUserService _userService;
    private readonly IPomodoroService _pomodoroService;
    private readonly IChallengeService _challengeService;
    private readonly IBenefitService _benefitService;
    private readonly IFeedService _feedService;
    private readonly INotificationService _notificationService;
    private readonly IDeviceWellbeingService _deviceWellbeingService;

    public HybridBridge(
        IUserService userService,
        IPomodoroService pomodoroService,
        IChallengeService challengeService,
        IBenefitService benefitService,
        IFeedService feedService,
        INotificationService notificationService,
        IDeviceWellbeingService deviceWellbeingService)
    {
        _userService = userService;
        _pomodoroService = pomodoroService;
        _challengeService = challengeService;
        _benefitService = benefitService;
        _feedService = feedService;
        _notificationService = notificationService;
        _deviceWellbeingService = deviceWellbeingService;
    }

    public async Task<string> HandleMessageAsync(string rawMessage)
    {
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        BridgeMessage? message;

        try
        {
            message = JsonSerializer.Deserialize<BridgeMessage>(rawMessage, options);
        }
        catch (Exception ex)
        {
            return JsonSerializer.Serialize(new BridgeResponse
            {
                Success = false,
                Error = $"Invalid JSON format: {ex.Message}"
            });
        }

        if (message == null || string.IsNullOrWhiteSpace(message.Action))
        {
            return JsonSerializer.Serialize(new BridgeResponse
            {
                Success = false,
                Error = "Empty action"
            });
        }

        try
        {
            object? result = message.Action.ToUpperInvariant() switch
            {
                "GET_CURRENT_USER" => await _userService.GetCurrentUserAsync(),
                "REGISTER_USER" => await HandleRegisterUser(message.Payload),
                "LOGIN_USER" => await HandleLoginUser(message.Payload),
                "GET_DESAFIOS" => await _challengeService.GetDesafiosAsync(),
                "TOGGLE_DESAFIO" => await HandleToggleDesafio(message.Payload),
                "RECORD_POMODORO" => await HandleRecordPomodoro(message.Payload),
                "GET_PARTNERS" => await _benefitService.GetPartnersAsync(),
                "GET_FEED" => await _feedService.GetPostsAsync(),
                "CREATE_POST" => await HandleCreatePost(message.Payload),
                "LIKE_POST" => await HandleLikePost(message.Payload),
                "GET_COMMENTS" => await HandleGetComments(message.Payload),
                "ADD_COMMENT" => await HandleAddComment(message.Payload),
                "GET_RANKING" => await _userService.GetRankingAsync(),
                "SEARCH_USERS" => await HandleSearchUsers(message.Payload),
                "TOGGLE_FOLLOW" => await HandleToggleFollow(message.Payload),
                "UPDATE_PROFILE" => await HandleUpdateProfile(message.Payload),
                "SHOW_LOCAL_NOTIFICATION" => await HandleShowLocalNotification(message.Payload),
                "CHECK_NOTIFICATION_PERMISSION" => await HandleCheckNotificationPermission(),
                "REQUEST_NOTIFICATION_PERMISSION" => await HandleRequestNotificationPermission(),
                "CHECK_USAGE_ACCESS" => _deviceWellbeingService.IsUsageAccessGranted(),
                "REQUEST_USAGE_ACCESS" => HandleRequestUsageAccess(),
                "GET_SCREEN_TIME_TODAY" => _deviceWellbeingService.GetScreenTimeMinutesToday(),
                "CHECK_DND_ACCESS" => _deviceWellbeingService.IsDoNotDisturbAccessGranted(),
                "REQUEST_DND_ACCESS" => HandleRequestDndAccess(),
                "SET_DND_MODE" => HandleSetDndMode(message.Payload),
                "CHECK_LOCATION_PERMISSION" => await HandleCheckLocationPermission(),
                "REQUEST_LOCATION_PERMISSION" => await HandleRequestLocationPermission(),
                "GET_CURRENT_LOCATION" => await HandleGetCurrentLocation(),
                "CHECK_MEDIA_PERMISSION" => await HandleCheckMediaPermission(),
                "REQUEST_MEDIA_PERMISSION" => await HandleRequestMediaPermission(message.Payload),
                "PICK_IMAGE" => await HandlePickImage(false),
                "CAPTURE_PHOTO" => await HandlePickImage(true),
                _ => throw new InvalidOperationException($"Unknown action: {message.Action}")
            };

            return JsonSerializer.Serialize(new BridgeResponse
            {
                Success = true,
                Data = result,
                CallbackId = message.CallbackId
            });
        }
        catch (Exception ex)
        {
            return JsonSerializer.Serialize(new BridgeResponse
            {
                Success = false,
                Error = ex.Message,
                CallbackId = message.CallbackId
            });
        }
    }

    private async Task<object?> HandleRegisterUser(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        string nome = doc.GetProperty("nome").GetString() ?? "";
        string email = doc.GetProperty("email").GetString() ?? "";
        string senha = doc.GetProperty("senha").GetString() ?? "";

        return await _userService.RegisterAsync(nome, email, senha);
    }

    private async Task<object?> HandleLoginUser(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        string email = doc.GetProperty("email").GetString() ?? "";
        string senha = doc.GetProperty("senha").GetString() ?? "";

        var user = await _userService.LoginAsync(email, senha);
        if (user == null)
        {
            throw new InvalidOperationException("E-mail ou senha incorretos.");
        }
        return user;
    }

    private async Task<object?> HandleCreatePost(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        string content = doc.GetProperty("content").GetString() ?? "";
        string category = doc.TryGetProperty("category", out var c) ? c.GetString() ?? "nature" : "nature";
        string icon = doc.TryGetProperty("icon", out var ic) ? ic.GetString() ?? "🏔️" : "🏔️";
        string? image = doc.TryGetProperty("image", out var img) ? img.GetString() : null;

        return await _feedService.CreatePostAsync(content, category, icon, image);
    }

    private async Task<object?> HandleLikePost(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        int postId = doc.GetProperty("postId").GetInt32();
        int likes = await _feedService.LikePostAsync(postId);
        return new { PostId = postId, Likes = likes };
    }

    private async Task<object?> HandleGetComments(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        int postId = doc.GetProperty("postId").GetInt32();
        return await _feedService.GetCommentsAsync(postId);
    }

    private async Task<object?> HandleAddComment(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        int postId = doc.GetProperty("postId").GetInt32();
        string texto = doc.GetProperty("texto").GetString() ?? "";

        return await _feedService.AddCommentAsync(postId, texto);
    }

    private async Task<object?> HandleSearchUsers(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        string termo = doc.TryGetProperty("termo", out var t) ? t.GetString() ?? "" : "";
        bool apenasSeguindo = doc.TryGetProperty("apenasSeguindo", out var s) && s.GetBoolean();

        return await _userService.SearchUsersAsync(termo, apenasSeguindo);
    }

    private async Task<object?> HandleToggleFollow(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        int seguidoId = doc.GetProperty("seguidoId").GetInt32();

        bool isFollowing = await _userService.ToggleFollowAsync(seguidoId);
        return new { SeguidoId = seguidoId, IsFollowing = isFollowing };
    }

    private async Task<object?> HandleToggleDesafio(string? payload)
    {
        if (int.TryParse(payload, out int desafioId))
        {
            var status = await _challengeService.ToggleDesafioAsync(desafioId);
            return new { DesafioId = desafioId, Completed = status };
        }
        return null;
    }

    private async Task<object?> HandleRecordPomodoro(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        string tipo = doc.TryGetProperty("tipo", out var t) ? t.GetString() ?? "focus" : "focus";
        int minutos = doc.TryGetProperty("minutos", out var m) ? m.GetInt32() : 25;

        return await _pomodoroService.RegistrarSessaoAsync(tipo, minutos);
    }

    private async Task<object?> HandleShowLocalNotification(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        string title = doc.TryGetProperty("title", out var t) ? t.GetString() ?? "LibertApp" : "LibertApp";
        string message = doc.TryGetProperty("message", out var m) ? m.GetString() ?? "" : "";

        var shown = await _notificationService.ShowNowAsync(title, message);
        return new { shown };
    }

    private object HandleRequestUsageAccess()
    {
        _deviceWellbeingService.OpenUsageAccessSettings();
        return new { opened = true };
    }

    private object HandleRequestDndAccess()
    {
        _deviceWellbeingService.OpenDoNotDisturbAccessSettings();
        return new { opened = true };
    }

    private object HandleSetDndMode(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        bool enabled = doc.TryGetProperty("enabled", out var e) && e.GetBoolean();

        var applied = _deviceWellbeingService.SetDigitalNightMode(enabled);
        return new { applied, enabled };
    }

    private async Task<object?> HandleUpdateProfile(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        string nome = doc.GetProperty("nome").GetString() ?? "";
        string email = doc.GetProperty("email").GetString() ?? "";
        string tel = doc.GetProperty("telefone").GetString() ?? "";
        string cpf = doc.GetProperty("cpf").GetString() ?? "";
        string loc = doc.GetProperty("localizacao").GetString() ?? "";

        return await _userService.UpdateProfileAsync(nome, email, tel, cpf, loc);
    }

    private async Task<object?> HandleCheckNotificationPermission()
    {
#if ANDROID
        var status = await Microsoft.Maui.ApplicationModel.Permissions.CheckStatusAsync<Microsoft.Maui.ApplicationModel.Permissions.PostNotifications>();
        return new { granted = status == Microsoft.Maui.ApplicationModel.PermissionStatus.Granted };
#elif IOS
        var center = UserNotifications.UNUserNotificationCenter.Current;
        var settings = await center.GetNotificationSettingsAsync();
        return new { granted = settings.AuthorizationStatus == UserNotifications.UNAuthorizationStatus.Authorized };
#else
        await Task.CompletedTask;
        return new { granted = true };
#endif
    }

    private async Task<object?> HandleRequestNotificationPermission()
    {
#if ANDROID
        var status = await Microsoft.Maui.ApplicationModel.Permissions.CheckStatusAsync<Microsoft.Maui.ApplicationModel.Permissions.PostNotifications>();
        if (status != Microsoft.Maui.ApplicationModel.PermissionStatus.Granted)
        {
            status = await Microsoft.Maui.ApplicationModel.Permissions.RequestAsync<Microsoft.Maui.ApplicationModel.Permissions.PostNotifications>();
        }
        return new { granted = status == Microsoft.Maui.ApplicationModel.PermissionStatus.Granted };
#elif IOS
        var center = UserNotifications.UNUserNotificationCenter.Current;
        var settings = await center.RequestAuthorizationAsync(
            UserNotifications.UNAuthorizationOptions.Alert | UserNotifications.UNAuthorizationOptions.Sound | UserNotifications.UNAuthorizationOptions.Badge);
        return new { granted = settings.Item1 };
#else
        await Task.CompletedTask;
        return new { granted = true };
#endif
    }

    private async Task<object?> HandleCheckLocationPermission()
    {
        var status = await Microsoft.Maui.ApplicationModel.Permissions.CheckStatusAsync<Microsoft.Maui.ApplicationModel.Permissions.LocationWhenInUse>();
        return new { granted = status == Microsoft.Maui.ApplicationModel.PermissionStatus.Granted };
    }

    private async Task<object?> HandleRequestLocationPermission()
    {
        var status = await Microsoft.Maui.ApplicationModel.Permissions.CheckStatusAsync<Microsoft.Maui.ApplicationModel.Permissions.LocationWhenInUse>();
        if (status != Microsoft.Maui.ApplicationModel.PermissionStatus.Granted)
        {
            status = await Microsoft.Maui.ApplicationModel.Permissions.RequestAsync<Microsoft.Maui.ApplicationModel.Permissions.LocationWhenInUse>();
        }
        return new { granted = status == Microsoft.Maui.ApplicationModel.PermissionStatus.Granted };
    }

    private async Task<object?> HandleGetCurrentLocation()
    {
        var status = await Microsoft.Maui.ApplicationModel.Permissions.CheckStatusAsync<Microsoft.Maui.ApplicationModel.Permissions.LocationWhenInUse>();
        if (status != Microsoft.Maui.ApplicationModel.PermissionStatus.Granted)
        {
            status = await Microsoft.Maui.ApplicationModel.Permissions.RequestAsync<Microsoft.Maui.ApplicationModel.Permissions.LocationWhenInUse>();
        }
        if (status != Microsoft.Maui.ApplicationModel.PermissionStatus.Granted)
        {
            throw new InvalidOperationException("Permissão de localização negada pelo usuário.");
        }

        var location = await Microsoft.Maui.Devices.Sensors.Geolocation.Default.GetLocationAsync(
            new Microsoft.Maui.Devices.Sensors.GeolocationRequest(Microsoft.Maui.Devices.Sensors.GeolocationAccuracy.Medium, TimeSpan.FromSeconds(10)));

        if (location == null)
        {
            throw new InvalidOperationException("Não foi possível obter coordenadas GPS.");
        }

        return new { latitude = location.Latitude, longitude = location.Longitude };
    }

    private async Task<object?> HandleCheckMediaPermission()
    {
        var status = await Microsoft.Maui.ApplicationModel.Permissions.CheckStatusAsync<Microsoft.Maui.ApplicationModel.Permissions.Media>();
        return new { granted = status == Microsoft.Maui.ApplicationModel.PermissionStatus.Granted };
    }

    private async Task<object?> HandleRequestMediaPermission(string? payload)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(payload ?? "{}");
        bool camera = doc.TryGetProperty("camera", out var c) && c.GetBoolean();

        if (camera)
        {
            var camStatus = await Microsoft.Maui.ApplicationModel.Permissions.RequestAsync<Microsoft.Maui.ApplicationModel.Permissions.Camera>();
            return new { granted = camStatus == Microsoft.Maui.ApplicationModel.PermissionStatus.Granted };
        }
        else
        {
            var mediaStatus = await Microsoft.Maui.ApplicationModel.Permissions.RequestAsync<Microsoft.Maui.ApplicationModel.Permissions.Media>();
            return new { granted = mediaStatus == Microsoft.Maui.ApplicationModel.PermissionStatus.Granted };
        }
    }

    private async Task<object?> HandlePickImage(bool fromCamera)
    {
        if (fromCamera)
        {
            var camStatus = await Microsoft.Maui.ApplicationModel.Permissions.CheckStatusAsync<Microsoft.Maui.ApplicationModel.Permissions.Camera>();
            if (camStatus != Microsoft.Maui.ApplicationModel.PermissionStatus.Granted)
            {
                camStatus = await Microsoft.Maui.ApplicationModel.Permissions.RequestAsync<Microsoft.Maui.ApplicationModel.Permissions.Camera>();
            }
            if (camStatus != Microsoft.Maui.ApplicationModel.PermissionStatus.Granted)
            {
                throw new InvalidOperationException("Permissão de câmera não concedida.");
            }
        }

        FileResult? photo = fromCamera
            ? await Microsoft.Maui.Media.MediaPicker.Default.CapturePhotoAsync()
            : await Microsoft.Maui.Media.MediaPicker.Default.PickPhotoAsync();

        if (photo == null) return null;

        using var stream = await photo.OpenReadAsync();
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms);
        var bytes = ms.ToArray();
        var contentType = photo.ContentType ?? "image/jpeg";
        var base64 = Convert.ToBase64String(bytes);
        return new
        {
            dataUrl = $"data:{contentType};base64,{base64}",
            fileName = photo.FileName
        };
    }
}
