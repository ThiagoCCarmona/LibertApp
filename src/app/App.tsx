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

export type Tab = "home" | "activities" | "profile";
export type Screen = "splash" | "login" | "signup" | "forgot" | "home" | "main" | "editProfile" | "benefits" | "card" | "leaderboard";

const StatusBar = () => (
  <div className="flex items-center justify-between px-6 pt-3 pb-1" style={{ color: "#7A8A7B", fontSize: 12, fontWeight: 500 }}>
    <span>9:41</span>
    <div className="flex items-center gap-[5px]">
      <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><rect x="0" y="4" width="3" height="7" rx="0.8" opacity="0.4" /><rect x="4.5" y="3" width="3" height="8" rx="0.8" opacity="0.6" /><rect x="9" y="1" width="3" height="10" rx="0.8" opacity="0.8" /><rect x="13.5" y="0" width="2.5" height="11" rx="0.8" /></svg>
      <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 2.5 C4.5 2.5 1.8 3.8 0 5.9 L1.5 7.4 C2.9 5.7 5.1 4.6 7.5 4.6 C9.9 4.6 12.1 5.7 13.5 7.4 L15 5.9 C13.2 3.8 10.5 2.5 7.5 2.5Z" /><path d="M7.5 6.5 C6 6.5 4.6 7.1 3.6 8.1 L5.1 9.6 C5.7 9 6.5 8.6 7.5 8.6 C8.5 8.6 9.3 9 9.9 9.6 L11.4 8.1 C10.4 7.1 9 6.5 7.5 6.5Z" /><circle cx="7.5" cy="11" r="1.4" /></svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35" /><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" /><path d="M23 4.5 C24 5 24 7 23 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    </div>
  </div>
);

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
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(145deg, #E8E2D8 0%, #DDD6C8 50%, #D4CCBE 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: 390,
          height: 844,
          borderRadius: 50,
          overflow: "hidden",
          background: "#FDFBF7",
          boxShadow:
            "0 0 0 2px rgba(45,58,46,0.08), 0 32px 80px rgba(45,58,46,0.22), 0 8px 24px rgba(45,58,46,0.12)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Notch */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 126, height: 34, background: "#1A2318",
          borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
          zIndex: 10,
        }} />

        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
          {currentScreen === "splash" ? (
            <SplashScreen onComplete={handleSplashComplete} />
          ) : (
            <>
              <StatusBar />
              <div style={{ flex: 1, overflowY: "auto" }}>
                {/* Auth Screens */}
                {currentScreen === "login" && <LoginScreen onNavigate={handleAuthNavigate} />}
                {currentScreen === "signup" && <SignUpScreen onNavigate={handleAuthNavigate} />}
                {currentScreen === "forgot" && <PasswordRecoveryScreen onNavigate={handleAuthNavigate} />}

                {/* Main App Screens */}
                {currentScreen === "main" && (
                  <>
                    {activeTab === "home" && <HomeNewScreen onShowLeaderboard={handleShowLeaderboard} />}
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
              </div>
              {currentScreen === "main" && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
            </>
          )}
        </div>
      </div>

      <p style={{
        marginTop: 20, fontSize: 12, color: "rgba(45,58,46,0.4)", textAlign: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        LibertApp · UI Prototype · 11 Telas
      </p>
    </div>
  );
}
