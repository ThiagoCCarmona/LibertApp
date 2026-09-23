namespace LibertApp.Api.Data.Entities;

public class Conquista
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Icone { get; set; } = "🏅";

    /// <summary>
    /// Tipo de métrica usada para calcular o progresso: "pontos", "pomodoros", "desafios", "posts" ou "seguidores".
    /// </summary>
    public string Tipo { get; set; } = "pontos";
    public int Meta { get; set; } = 1;
    public int PontosRecompensa { get; set; } = 0;
    public bool Ativo { get; set; } = true;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
