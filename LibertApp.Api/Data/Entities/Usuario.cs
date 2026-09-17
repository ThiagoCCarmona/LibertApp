namespace LibertApp.Api.Data.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string CPF { get; set; } = string.Empty;
    public string Curso { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Localizacao { get; set; } = "Comunidade Carmelita";
    public string NumeroCarteira { get; set; } = string.Empty;
    public string DataNascimento { get; set; } = string.Empty;
    public string FotoUrl { get; set; } = string.Empty;
    public int Pontos { get; set; } = 150;
    public int Nivel { get; set; } = 1;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public bool IsAdmin { get; set; } = false;
    public bool Ativo { get; set; } = true;

    public ICollection<SessaoPomodoro> SessoesPomodoro { get; set; } = new List<SessaoPomodoro>();
    public ICollection<UsuarioDesafio> DesafiosConcluidos { get; set; } = new List<UsuarioDesafio>();
}
