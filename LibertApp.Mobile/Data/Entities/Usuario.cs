namespace LibertApp.Mobile.Data.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string CPF { get; set; } = string.Empty;
    public string Localizacao { get; set; } = "São Paulo, SP";
    public string NumeroCarteira { get; set; } = "LBT-0001-2024";
    public string DataNascimento { get; set; } = "15/03/1985";
    public string FotoUrl { get; set; } = string.Empty;
    public int Pontos { get; set; } = 2450;
    public int Nivel { get; set; } = 3;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public ICollection<SessaoPomodoro> SessoesPomodoro { get; set; } = new List<SessaoPomodoro>();
    public ICollection<UsuarioDesafio> DesafiosConcluidos { get; set; } = new List<UsuarioDesafio>();
}
