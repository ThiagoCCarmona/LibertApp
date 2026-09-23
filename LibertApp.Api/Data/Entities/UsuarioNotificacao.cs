namespace LibertApp.Api.Data.Entities;

public class UsuarioNotificacao
{
    public int Id { get; set; }
    public int UsuarioId { get; set; } // Destinatário da notificação
    public int RemetenteId { get; set; } // Quem originou o evento
    public string RemetenteNome { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty; // "follow", "incentive"
    public string Titulo { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public bool Lida { get; set; } = false;
}
