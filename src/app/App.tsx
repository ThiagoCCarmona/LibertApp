import { useState, useEffect } from "react";
import { HomeNewScreen } from "./components/HomeNewScreen";
import { ActivitiesScreen } from "./components/ActivitiesScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { SplashScreen } from "./components/SplashScreen";
import { LoginScreen } from "./components/LoginScreen";
import { SignUpScreen } from "./components/SignUpScreen";
import { PasswordRecoveryScreen } from "./components/PasswordRecoveryScreen";
import { BottomNav } from "./components/BottomNav";
import { EditProfileScreen } from "./components/EditProfileScreen";
import { BenefitsScreen } from "./components/BenefitsScreen";
import { CardScreen } from "./components/CardScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { SearchUsersScreen } from "./components/SearchUsersScreen";
import { startNotificationScheduler } from "../services/notificationScheduler";

export type Tab = "home" | "activities" | "profile";
export type Screen = "splash" | "login" | "signup" | "forgot" | "home" | "main" | "editProfile" | "benefits" | "card" | "leaderboard" | "searchUsers";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [activeTab, setActiveTab] = useState<Tab>("home");

  useEffect(() => {
    // Sempre mostrar splash ao abrir (Telas 1 -> 2)
    const timer = setTimeout(() => {
      setCurrentScreen("login");
      localStorage.setItem("splashShown", "true");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSplashComplete = () => {
    setCurrentScreen("login");
    localStorage.setItem("splashShown", "true");
  };


  const handleAuthNavigate = (screen: Screen | any) => {
    // LoginScreen manda "home" ao clicar em Entrar (tela 2 -> main)
    if (screen === "home") {
      setCurrentScreen("main");
      setActiveTab("home");
      localStorage.setItem("isLoggedIn", "true");
      return;
    }

    // LoginScreen manda "recovery" ao clicar em Esqueci minha senha (tela 4 -> recovery -> login)
    if (screen === "recovery") {
      setCurrentScreen("forgot");
      return;
    }

    setCurrentScreen(screen);
  };

  const handleShowLeaderboard = () => {
    setCurrentScreen("leaderboard");
  };

  const handleSearchUsers = () => {
    setCurrentScreen("searchUsers");
  };

  const handleEditProfile = () => {
    setCurrentScreen("editProfile");
  };

  const handleShowBenefits = () => {
    setCurrentScreen("benefits");
  };

  const handleOpenCard = () => {
    setCurrentScreen("card");
  };

  const handleBack = (backTo: Screen = "main") => {
    setCurrentScreen(backTo);
  };

  // Expõe uma função global para o botão de voltar nativo (Android) do app .NET MAUI.
  // Retorna true quando a navegação foi tratada aqui dentro da SPA (o nativo não faz nada);
  // retorna false quando já estamos na tela raiz, para o nativo minimizar o app.
  useEffect(() => {
    (window as any).__handleNativeBack = (): boolean => {
      if (currentScreen === "signup" || currentScreen === "forgot") {
        setCurrentScreen("login");
        return true;
      }

      if (
        currentScreen === "editProfile" ||
        currentScreen === "benefits" ||
        currentScreen === "card" ||
        currentScreen === "leaderboard" ||
        currentScreen === "searchUsers"
      ) {
        handleBack("main");
        return true;
      }

      if (currentScreen === "main" && activeTab !== "home") {
        setActiveTab("home");
        return true;
      }

      // Aba "Início" da tela principal, "login" e "splash" são consideradas telas raiz.
      return false;
    };

    return () => {
      delete (window as any).__handleNativeBack;
    };
  }, [currentScreen, activeTab]);

  // Liga os lembretes locais (respiro, limite de tela, curtidas/comentários, perfil) assim
  // que o usuário está logado e dentro do app. Só tem efeito dentro do app nativo.
  useEffect(() => {
    if (currentScreen !== "main") return;

    let userId: number | undefined;
    try {
      const stored = localStorage.getItem("currentUser");
      userId = stored ? JSON.parse(stored)?.id : undefined;
    } catch {}

    if (!userId) return;

    const stop = startNotificationScheduler(userId);
    return stop;
  }, [currentScreen]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("splashShown");
    setActiveTab("home");
    setCurrentScreen("login");
  };


  return (
    <div
      style={{
        height: "100dvh",
        width: "100vw",
        maxWidth: "100%",
        background: "#FDFBF7",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {currentScreen === "splash" ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {/* Auth Screens */}
            {currentScreen === "login" && <LoginScreen onNavigate={handleAuthNavigate} />}
            {currentScreen === "signup" && <SignUpScreen onNavigate={handleAuthNavigate} />}
            {currentScreen === "forgot" && <PasswordRecoveryScreen onNavigate={handleAuthNavigate} />}

            {/* Main App Screens */}
            {currentScreen === "main" && (
              <>
                {activeTab === "home" && (
                  <HomeNewScreen
                    onShowLeaderboard={handleShowLeaderboard}
                    onSearchUsers={handleSearchUsers}
                  />
                )}
                {activeTab === "activities" && <ActivitiesScreen />}
                {activeTab === "profile" && (
                  <ProfileScreen
                    onEditProfile={handleEditProfile}
                    onShowBenefits={handleShowBenefits}
                    onOpenCard={handleOpenCard}
                    onLogout={handleLogout}
                  />
                )}
              </>
            )}
            {currentScreen === "editProfile" && <EditProfileScreen onBack={() => handleBack("main")} />}
            {currentScreen === "benefits" && <BenefitsScreen onBack={() => handleBack("main")} onOpenCard={handleOpenCard} />}
            {currentScreen === "card" && <CardScreen onBack={() => handleBack("main")} />}
            {currentScreen === "leaderboard" && <LeaderboardScreen onBack={() => handleBack("main")} />}
            {currentScreen === "searchUsers" && <SearchUsersScreen onBack={() => handleBack("main")} />}
          </div>
          {currentScreen === "main" && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
        </>
      )}
    </div>
  );
}
