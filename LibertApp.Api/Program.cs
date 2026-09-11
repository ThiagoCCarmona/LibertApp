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

// Banco de dados SQLite central na VPS
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
