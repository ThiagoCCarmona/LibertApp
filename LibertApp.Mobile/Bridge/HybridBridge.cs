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
                "GET_DESAFIOS" => await _challengeService.GetDesafiosAsync(),
                "TOGGLE_DESAFIO" => await HandleToggleDesafio(message.Payload),
                "RECORD_POMODORO" => await HandleRecordPomodoro(message.Payload),
                "GET_PARTNERS" => await _benefitService.GetPartnersAsync(),
                "GET_FEED" => await _feedService.GetPostsAsync(),
                "GET_RANKING" => await _userService.GetRankingAsync(),
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
