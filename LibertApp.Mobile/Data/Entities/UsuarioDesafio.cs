namespace LibertApp.Mobile.Data.Entities;

public class UsuarioDesafio
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }
    public int DesafioId { get; set; }
    public Desafio? Desafio { get; set; }
    public bool Concluido { get; set; } = true;
    public DateTime DataConclusao { get; set; } = DateTime.UtcNow;
}
