using Microsoft.EntityFrameworkCore;
using LibertApp.Api.Data;
using LibertApp.Api.Security;

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
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    db.Database.EnsureCreated();

    // Migrações dinâmicas no banco SQLite existente.
    // Só ignora o erro esperado de "coluna/tabela já existe"; qualquer outra falha (disco cheio,
    // permissão, banco bloqueado) é logada para não passar despercebida.
    void RunMigrationStatement(string sql)
    {
        try
        {
            db.Database.ExecuteSqlRaw(sql);
        }
        catch (Exception ex) when (ex.Message.Contains("duplicate column", StringComparison.OrdinalIgnoreCase)
            || ex.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase))
        {
            // Coluna/tabela já existe: migração já aplicada anteriormente, ignora.
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Falha ao aplicar migração dinâmica: {Sql}", sql);
        }
    }

    RunMigrationStatement("ALTER TABLE Usuarios ADD COLUMN IsAdmin INTEGER NOT NULL DEFAULT 0;");
    RunMigrationStatement("ALTER TABLE Usuarios ADD COLUMN Ativo INTEGER NOT NULL DEFAULT 1;");
    RunMigrationStatement(@"CREATE TABLE IF NOT EXISTS CommentLikes (
        Id INTEGER NOT NULL CONSTRAINT PK_CommentLikes PRIMARY KEY AUTOINCREMENT,
        ComentarioId INTEGER NOT NULL,
        UsuarioId INTEGER NOT NULL,
        DataCriacao TEXT NOT NULL
    );");
    RunMigrationStatement(@"CREATE TABLE IF NOT EXISTS Conquistas (
        Id INTEGER NOT NULL CONSTRAINT PK_Conquistas PRIMARY KEY AUTOINCREMENT,
        Titulo TEXT NOT NULL,
        Descricao TEXT NOT NULL,
        Icone TEXT NOT NULL,
        Tipo TEXT NOT NULL,
        Meta INTEGER NOT NULL,
        PontosRecompensa INTEGER NOT NULL,
        Ativo INTEGER NOT NULL,
        DataCriacao TEXT NOT NULL
    );");
    RunMigrationStatement(@"CREATE TABLE IF NOT EXISTS UsuarioConquistas (
        Id INTEGER NOT NULL CONSTRAINT PK_UsuarioConquistas PRIMARY KEY AUTOINCREMENT,
        UsuarioId INTEGER NOT NULL,
        ConquistaId INTEGER NOT NULL,
        DataConquistada TEXT NOT NULL
    );");
    RunMigrationStatement(@"CREATE TABLE IF NOT EXISTS UsuarioNotificacoes (
        Id INTEGER NOT NULL CONSTRAINT PK_UsuarioNotificacoes PRIMARY KEY AUTOINCREMENT,
        UsuarioId INTEGER NOT NULL,
        RemetenteId INTEGER NOT NULL,
        RemetenteNome TEXT NOT NULL,
        Tipo TEXT NOT NULL,
        Titulo TEXT NOT NULL,
        Mensagem TEXT NOT NULL,
        DataCriacao TEXT NOT NULL,
        Lida INTEGER NOT NULL DEFAULT 0
    );");

    // O Administrador não compete nem acumula pontos no pódio
    RunMigrationStatement("UPDATE Usuarios SET Pontos = 0 WHERE IsAdmin = 1;");

    // 1. Seed do usuário Administrador
    // Senha vem de configuração (env var AdminSeed__Password); se não informada, gera uma
    // senha aleatória e a imprime no log apenas no momento da criação (não fica em código-fonte).
    var adminEmail = "admin@libertapp.com.br";
    var adminUser = db.Usuarios.FirstOrDefault(u => u.Email.ToLower() == adminEmail);
    if (adminUser == null)
    {
        var adminPassword = builder.Configuration["AdminSeed:Password"];
        var generatedAdminPassword = string.IsNullOrWhiteSpace(adminPassword);
        if (generatedAdminPassword)
        {
            adminPassword = PasswordHasher.GenerateRandomPassword();
        }

        db.Usuarios.Add(new LibertApp.Api.Data.Entities.Usuario
        {
            Nome = "Administrador Geral",
            Email = adminEmail,
            SenhaHash = PasswordHasher.Hash(adminPassword!),
            Telefone = "(11) 99999-9999",
            CPF = "000.000.000-00",
            Curso = "Coordenação Geral",
            Bio = "Administrador do sistema com acesso total para moderação e gestão.",
            Localizacao = "Comunidade Carmelita",
            NumeroCarteira = "LBT-ADMIN-0001",
            FotoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            Pontos = 0,
            Nivel = 1,
            IsAdmin = true,
            Ativo = true,
            DataCriacao = DateTime.UtcNow
        });
        db.SaveChanges();

        if (generatedAdminPassword)
        {
            logger.LogWarning(
                "Conta de Administrador criada: {Email} / senha gerada automaticamente: {Password} " +
                "— anote agora, ela não será exibida novamente. Para definir uma senha própria, configure AdminSeed__Password.",
                adminEmail, adminPassword);
        }
    }
    else
    {
        bool changed = false;
        if (!adminUser.IsAdmin) { adminUser.IsAdmin = true; changed = true; }
        if (adminUser.Pontos != 0) { adminUser.Pontos = 0; changed = true; }
        if (!adminUser.Ativo) { adminUser.Ativo = true; changed = true; }
        if (changed) db.SaveChanges();
    }

    // 2. Remoção garantida de qualquer usuário simulado/mockado (ex.: Silvia Mendes)
    try
    {
        var mockUsers = db.Usuarios.Where(u => u.Email.ToLower() == "silvia.mendes@email.com").ToList();
        if (mockUsers.Count > 0)
        {
            foreach (var mockUser in mockUsers)
            {
                var posts = db.FeedPosts.Where(p => p.UsuarioId == mockUser.Id);
                db.FeedPosts.RemoveRange(posts);
                var comments = db.PostComentarios.Where(c => c.UsuarioId == mockUser.Id);
                db.PostComentarios.RemoveRange(comments);
                var likes = db.PostLikes.Where(l => l.UsuarioId == mockUser.Id);
                db.PostLikes.RemoveRange(likes);
                var cLikes = db.CommentLikes.Where(l => l.UsuarioId == mockUser.Id);
                db.CommentLikes.RemoveRange(cLikes);
                var follows = db.UsuarioSeguidores.Where(s => s.SeguidorId == mockUser.Id || s.SeguidoId == mockUser.Id);
                db.UsuarioSeguidores.RemoveRange(follows);
                var desafios = db.UsuariosDesafios.Where(d => d.UsuarioId == mockUser.Id);
                db.UsuariosDesafios.RemoveRange(desafios);
                var pomodoros = db.SessoesPomodoro.Where(p => p.UsuarioId == mockUser.Id);
                db.SessoesPomodoro.RemoveRange(pomodoros);

                db.Usuarios.Remove(mockUser);
            }
            db.SaveChanges();
            logger.LogInformation("Usuário simulado de demonstração removido com sucesso.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao limpar usuário simulado de demonstração.");
    }

    // 3. Seed das conquistas reais (badges) padrão da comunidade
    if (!db.Set<LibertApp.Api.Data.Entities.Conquista>().Any())
    {
        db.Set<LibertApp.Api.Data.Entities.Conquista>().AddRange(
            new LibertApp.Api.Data.Entities.Conquista { Titulo = "Primeiro Passo", Descricao = "Publique sua primeira mensagem no mural da comunidade.", Icone = "🌱", Tipo = "posts", Meta = 1, PontosRecompensa = 10, Ativo = true },
            new LibertApp.Api.Data.Entities.Conquista { Titulo = "Voz Ativa", Descricao = "Compartilhe 10 publicações no mural da comunidade.", Icone = "📣", Tipo = "posts", Meta = 10, PontosRecompensa = 50, Ativo = true },
            new LibertApp.Api.Data.Entities.Conquista { Titulo = "Foco Consciente", Descricao = "Complete 10 sessões de foco (Pomodoro).", Icone = "🎯", Tipo = "pomodoros", Meta = 10, PontosRecompensa = 60, Ativo = true },
            new LibertApp.Api.Data.Entities.Conquista { Titulo = "Mestre do Foco", Descricao = "Complete 50 sessões de foco (Pomodoro).", Icone = "🏆", Tipo = "pomodoros", Meta = 50, PontosRecompensa = 200, Ativo = true },
            new LibertApp.Api.Data.Entities.Conquista { Titulo = "Superando Desafios", Descricao = "Conclua 10 desafios de bem-estar.", Icone = "✅", Tipo = "desafios", Meta = 10, PontosRecompensa = 80, Ativo = true },
            new LibertApp.Api.Data.Entities.Conquista { Titulo = "Conectado(a)", Descricao = "Conquiste 5 seguidores na comunidade.", Icone = "🤝", Tipo = "seguidores", Meta = 5, PontosRecompensa = 40, Ativo = true },
            new LibertApp.Api.Data.Entities.Conquista { Titulo = "Comunidade Querida", Descricao = "Conquiste 20 seguidores na comunidade.", Icone = "💚", Tipo = "seguidores", Meta = 20, PontosRecompensa = 150, Ativo = true },
            new LibertApp.Api.Data.Entities.Conquista { Titulo = "Ponto de Virada", Descricao = "Acumule 1000 pontos de bem-estar.", Icone = "⭐", Tipo = "pontos", Meta = 1000, PontosRecompensa = 0, Ativo = true }
        );
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
