namespace LibertApp.Api.Data.Entities;

public class UsuarioSeguidor
{
    public int Id { get; set; }
    public int SeguidorId { get; set; }
    public int SeguidoId { get; set; }
    public DateTime DataSeguido { get; set; } = DateTime.UtcNow;
}
