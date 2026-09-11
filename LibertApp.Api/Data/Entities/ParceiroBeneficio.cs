namespace LibertApp.Api.Data.Entities;

public class ParceiroBeneficio
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Emoji { get; set; } = "🥗";
    public int NivelDesbloqueio { get; set; } = 1;
    public bool UnlockedPadrao { get; set; } = false;
    public bool Ativo { get; set; } = true;
}
