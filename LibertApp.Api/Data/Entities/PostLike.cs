namespace LibertApp.Api.Data.Entities;

public class PostLike
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int UsuarioId { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
