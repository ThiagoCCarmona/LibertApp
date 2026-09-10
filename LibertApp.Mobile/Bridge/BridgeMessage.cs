namespace LibertApp.Mobile.Bridge;

public class BridgeMessage
{
    public string Action { get; set; } = string.Empty;
    public string? Payload { get; set; }
    public string? CallbackId { get; set; }
}

public class BridgeResponse
{
    public bool Success { get; set; } = true;
    public string? Error { get; set; }
    public object? Data { get; set; }
    public string? CallbackId { get; set; }
}
