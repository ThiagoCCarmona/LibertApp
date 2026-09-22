namespace LibertApp.Api.Data.Entities;

public class CommentLike
{
    public int Id { get; set; }
    public int ComentarioId { get; set; }
    public int UsuarioId { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
