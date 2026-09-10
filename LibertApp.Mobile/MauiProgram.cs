using Microsoft.Extensions.Logging;
using LibertApp.Mobile.Data;
using LibertApp.Mobile.Services;
using LibertApp.Mobile.Bridge;

namespace LibertApp.Mobile;

public static class MauiProgram
{
	public static MauiApp CreateMauiApp()
	{
		var builder = MauiApp.CreateBuilder();
		builder
			.UseMauiApp<App>()
			.ConfigureFonts(fonts =>
			{
				fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
				fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
			});

		// Database & Services DI
		builder.Services.AddDbContext<AppDbContext>();
		builder.Services.AddScoped<IUserService, UserService>();
		builder.Services.AddScoped<IPomodoroService, PomodoroService>();
		builder.Services.AddScoped<IChallengeService, ChallengeService>();
		builder.Services.AddScoped<IBenefitService, BenefitService>();
		builder.Services.AddScoped<IFeedService, FeedService>();
		builder.Services.AddScoped<HybridBridge>();
		builder.Services.AddTransient<MainPage>();

#if DEBUG
		builder.Logging.AddDebug();
#endif

		var app = builder.Build();

		// Inicializar SQLite local e aplicar Seed inicial
		try
		{
			using var scope = app.Services.CreateScope();
			var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
			db.Database.EnsureCreated();
		}
		catch
		{
			// Safe fallback
		}

		return app;
	}
}
