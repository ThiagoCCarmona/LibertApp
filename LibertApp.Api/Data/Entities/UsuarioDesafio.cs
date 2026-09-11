namespace LibertApp.Api.Data.Entities;

public class UsuarioDesafio
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int DesafioId { get; set; }
    public bool Concluido { get; set; }
    public DateTime DataConclusao { get; set; } = DateTime.UtcNow;

    public Usuario? Usuario { get; set; }
    public Desafio? Desafio { get; set; }
}
