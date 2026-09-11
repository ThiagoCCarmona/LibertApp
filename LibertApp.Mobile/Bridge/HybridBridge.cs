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

    public HybridBridge(
        IUserService userService,
        IPomodoroService pomodoroService,
        IChallengeService challengeService,
        IBenefitService benefitService,
        IFeedService feedService)
    {
        _userService = userService;
        _pomodoroService = pomodoroService;
        _challengeService = challengeService;
        _benefitService = benefitService;
        _feedService = feedService;
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
}
