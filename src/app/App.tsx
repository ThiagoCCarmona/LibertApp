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

export type Tab = "home" | "activities" | "profile";
export type Screen = "splash" | "login" | "signup" | "forgot" | "home" | "main" | "editProfile" | "benefits" | "card" | "leaderboard" | "searchUsers";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [activeTab, setActiveTab] = useState<Tab>("home");

  // Modo dev: navegação livre (sem autoplay automático)
  // Desative para percorrer manualmente.
  const DEV_AUTOPLAY_ALL_SCREENS = false;




  useEffect(() => {
    // Sempre mostrar splash ao abrir (Telas 1 -> 2)
    const timer = setTimeout(() => {
      setCurrentScreen("login");
      localStorage.setItem("splashShown", "true");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);




  const handleSplashComplete = () => {
    // Quando em modo dev autopercurso: imediatamente manda para a tela de login
    setCurrentScreen("login");
    localStorage.setItem("splashShown", "true");

    // sem autoplay: navegação manual via botões
    if (DEV_AUTOPLAY_ALL_SCREENS) {
      // noop (mantido por compatibilidade com versões anteriores)
    }

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



  const handleLogin = () => {
    // fluxo normal de login (ou login simulado em modo DEV_SIMULATED_LOGIN)
    setCurrentScreen("main");
    localStorage.setItem("isLoggedIn", "true");
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
                    onLogout={handleLogout}
                  />
                )}
              </>
            )}
            {currentScreen === "editProfile" && <EditProfileScreen onBack={() => handleBack("main")} />}
            {currentScreen === "benefits" && <BenefitsScreen onBack={() => handleBack("main")} onOpenCard={handleOpenCard} />}
            {currentScreen === "card" && <CardScreen onBack={() => handleBack("benefits")} />}
            {currentScreen === "leaderboard" && <LeaderboardScreen onBack={() => handleBack("main")} />}
            {currentScreen === "searchUsers" && <SearchUsersScreen onBack={() => handleBack("main")} />}
          </div>
          {currentScreen === "main" && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
        </>
      )}
    </div>
  );
}
