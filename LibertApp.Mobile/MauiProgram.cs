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
		builder.Services.AddSingleton<INotificationService, NotificationService>();
		builder.Services.AddSingleton<IDeviceWellbeingService, DeviceWellbeingService>();
		builder.Services.AddScoped<HybridBridge>();
		builder.Services.AddTransient<MainPage>();

#if ANDROID
		// A WebView do Android nao abre o seletor de arquivos para <input type="file">
		// (usado para importar foto de perfil e de publicacoes) sem um WebChromeClient
		// customizado. Veja Platforms/Android/FileChooserWebChromeClient.cs.
		Microsoft.Maui.Handlers.WebViewHandler.Mapper.AppendToMapping("FileChooserSupport", (handler, view) =>
		{
			handler.PlatformView.SetWebChromeClient(new FileChooserWebChromeClient());
		});
#endif

#if IOS
		// A WKWebView tem seu proprio gesto nativo de "voltar" (arrastar da borda esquerda),
		// que navega o historico HTTP da WebView — mas essa SPA nao usa navegacao HTTP real
		// (e um app de pagina unica controlado por estado do React), entao esse gesto nativo
		// nao faz nada. Desativamos ele e religamos o mesmo gesto para chamar
		// window.__handleNativeBack, a mesma funcao usada pelo botao/gesto de voltar do Android.
		Microsoft.Maui.Handlers.WebViewHandler.Mapper.AppendToMapping("BackSwipeGestureSupport", (handler, view) =>
		{
			var wkWebView = handler.PlatformView;
			wkWebView.AllowsBackForwardNavigationGestures = false;

			var edgeSwipeBack = new UIKit.UIScreenEdgePanGestureRecognizer(() =>
			{
				_ = wkWebView.EvaluateJavaScriptAsync("(window.__handleNativeBack && window.__handleNativeBack());");
			})
			{
				Edges = UIKit.UIRectEdge.Left
			};

			wkWebView.AddGestureRecognizer(edgeSwipeBack);
		});
#endif

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
