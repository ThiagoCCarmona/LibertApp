using Microsoft.EntityFrameworkCore;
using LibertApp.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Controllers & JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// CORS: Permitir chamadas do App Mobile e Web
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configuração de limite para upload de imagens (até 20MB)
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 20 * 1024 * 1024;
});

// Banco de dados SQLite central na VPS (com suporte a volume persistente)
var dbDir = Path.Combine(AppContext.BaseDirectory, "data");
Directory.CreateDirectory(dbDir);
var dbPath = Path.Combine(dbDir, "libertapp_central.db");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite($"Data Source={dbPath}");
});

builder.Services.AddOpenApi();

var app = builder.Build();

// Inicialização e Seed do banco central
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // 1. Seed do usuário Administrador
    var adminEmail = "admin@libertapp.com.br";
    var adminUser = db.Usuarios.FirstOrDefault(u => u.Email.ToLower() == adminEmail);
    if (adminUser == null)
    {
        using var sha = System.Security.Cryptography.SHA256.Create();
        var hash = Convert.ToHexString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes("admin123")));

        db.Usuarios.Add(new LibertApp.Api.Data.Entities.Usuario
        {
            Nome = "Administrador Geral",
            Email = adminEmail,
            SenhaHash = hash,
            Telefone = "(11) 99999-9999",
            CPF = "000.000.000-00",
            Curso = "Coordenação Geral",
            Bio = "Administrador do sistema com acesso total para moderação e gestão.",
            Localizacao = "Comunidade Carmelita",
            NumeroCarteira = "LBT-ADMIN-0001",
            FotoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            Pontos = 5000,
            Nivel = 5,
            IsAdmin = true,
            DataCriacao = DateTime.UtcNow
        });
        db.SaveChanges();
    }
    else if (!adminUser.IsAdmin)
    {
        adminUser.IsAdmin = true;
        db.SaveChanges();
    }

    // 2. Seed da usuária padrão Silvia Mendes
    var silviaEmail = "silvia.mendes@email.com";
    if (!db.Usuarios.Any(u => u.Email.ToLower() == silviaEmail))
    {
        using var sha = System.Security.Cryptography.SHA256.Create();
        var hash = Convert.ToHexString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes("123456")));

        db.Usuarios.Add(new LibertApp.Api.Data.Entities.Usuario
        {
            Nome = "Silvia Mendes",
            Email = silviaEmail,
            SenhaHash = hash,
            Telefone = "(11) 98765-4321",
            CPF = "123.456.789-00",
            Curso = "Psicologia • 4º Semestre",
            Bio = "Buscando reconexão com o presente e momentos de foco.",
            Localizacao = "Comunidade Carmelita",
            NumeroCarteira = "LBT-0001-2024",
            FotoUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            Pontos = 2450,
            Nivel = 3,
            IsAdmin = false,
            DataCriacao = DateTime.UtcNow
        });
        db.SaveChanges();
    }
}

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

// Healthcheck simples para verificar se a VPS está online
app.MapGet("/", () => Results.Ok(new
{
    app = "LibertApp Academic API",
    status = "running",
    version = "1.0.0",
    time = DateTime.UtcNow
}));

app.Run();
