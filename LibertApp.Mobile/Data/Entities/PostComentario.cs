namespace LibertApp.Mobile.Data.Entities;

public class PostComentario
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int UsuarioId { get; set; }
    public string AutorNome { get; set; } = string.Empty;
    public string AutorAvatar { get; set; } = string.Empty;
    public string Texto { get; set; } = string.Empty;
    public int Likes { get; set; } = 0;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
