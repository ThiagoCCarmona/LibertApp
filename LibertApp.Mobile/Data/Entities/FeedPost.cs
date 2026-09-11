namespace LibertApp.Mobile.Data.Entities;

public class FeedPost
{
    public int Id { get; set; }
    public int UsuarioId { get; set; } = 1;
    public string Autor { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string TipoPost { get; set; } = "memory"; // memory, nature, games, reading
    public string Conteudo { get; set; } = string.Empty;
    public string? ImagemUrl { get; set; }
    public string BgColor { get; set; } = "#FCE4EC";
    public string BorderColor { get; set; } = "#F8BBD0";
    public string Icon { get; set; } = "🧠";
    public int Likes { get; set; } = 0;
    public int Comments { get; set; } = 0;
    public DateTime DataPublicacao { get; set; } = DateTime.UtcNow;
}
