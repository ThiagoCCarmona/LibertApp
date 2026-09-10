namespace LibertApp.Mobile.Data.Entities;

public class Desafio
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Categoria { get; set; } = "daily"; // daily, weekly, monthly
    public int PontosRecompensa { get; set; } = 50;
    public bool Ativo { get; set; } = true;

    public ICollection<UsuarioDesafio> Conclusoes { get; set; } = new List<UsuarioDesafio>();
}
