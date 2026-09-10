namespace LibertApp.Mobile.Data.Entities;

public class SessaoPomodoro
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }
    public string Tipo { get; set; } = "focus"; // focus, short-break, long-break
    public int DuracaoMinutos { get; set; } = 25;
    public DateTime DataHora { get; set; } = DateTime.UtcNow;
}
