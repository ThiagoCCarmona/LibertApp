namespace LibertApp.Api.Data.Entities;

public class UsuarioConquista
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int ConquistaId { get; set; }
    public DateTime DataConquistada { get; set; } = DateTime.UtcNow;
}
