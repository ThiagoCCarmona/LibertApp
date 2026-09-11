namespace LibertApp.Api.Data.Entities;

public class FeedPost
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Autor { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string Curso { get; set; } = string.Empty;
    public string TipoPost { get; set; } = "nature"; // memory, nature, games, reading
    public string Conteudo { get; set; } = string.Empty;
    public string? ImagemUrl { get; set; }
    public string BgColor { get; set; } = "#E8D7C8";
    public string BorderColor { get; set; } = "#D7C4B3";
    public string Icon { get; set; } = "🏔️";
    public int Likes { get; set; } = 0;
    public int Comments { get; set; } = 0;
    public DateTime DataPublicacao { get; set; } = DateTime.UtcNow;
}
