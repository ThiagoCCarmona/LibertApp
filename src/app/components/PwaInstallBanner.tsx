import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share, PlusSquare, CheckCircle2 } from "lucide-react";
import { isMauiHybrid } from "../../services/nativeBridge";
import { useTranslation } from "../../i18n";

export function PwaInstallBanner() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(() => {
    return isMauiHybrid();
  });
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem("pwa_install_dismissed") === "true";
  });

  useEffect(() => {
    // Se estiver rodando dentro do MAUI Android/APK, não precisa do banner PWA
    if (isMauiHybrid()) {
      setIsStandalone(true);
      return;
    }

    const handleNativeReady = () => {
      setIsStandalone(true);
    };
    window.addEventListener("libertapp-native-ready", handleNativeReady);

    // Checa se já está instalado como PWA (standalone)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      if (isStandaloneMode) {
        setIsStandalone(true);
      }
    };
    checkStandalone();

    // Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("libertapp-native-ready", handleNativeReady);
    };
  }, []);

  if (isStandalone || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosModal(true);
    } else {
      // Fallback para navegadores que não dispararam beforeinstallprompt
      alert(t("pwa_manual_instruction"));
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  return (
    <>
      <div
        style={{
          background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 100%)",
          color: "#FDFBF7",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          boxShadow: "0 4px 12px rgba(45, 58, 46, 0.2)",
          position: "relative",
          zIndex: 50,
          borderBottom: "1px solid rgba(214, 140, 112, 0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(214, 140, 112, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Smartphone size={18} color="#D68C70" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#FFFFFF" }}>
              {t("pwa_banner_title")}
            </p>
            <p style={{ margin: "1px 0 0", fontSize: 10.5, color: "rgba(253, 251, 247, 0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {t("pwa_banner_sub")}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button
            onClick={handleInstallClick}
            style={{
              background: "#D68C70",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            <Download size={13} />
            {t("pwa_install_btn")}
          </button>
          <button
            onClick={handleDismiss}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(253, 251, 247, 0.6)",
              padding: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title={t("common_close")}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Modal explicativo para iOS Safari */}
      {showIosModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            backgroundColor: "rgba(45, 58, 46, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#FDFBF7",
              borderRadius: 20,
              padding: 24,
              maxWidth: 340,
              width: "100%",
              boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(214, 140, 112, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <Smartphone size={24} color="#D68C70" />
            </div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "#2D3A2E", margin: "0 0 8px 0" }}>
              {t("pwa_ios_modal_title")}
            </h3>
            <p style={{ fontSize: 13, color: "#7A8A7B", lineHeight: 1.5, margin: "0 0 16px 0" }}>
              {t("pwa_ios_modal_desc")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", background: "#F5EFE3", padding: 14, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#2D3A2E" }}>
                <Share size={18} color="#D68C70" />
                <span>{t("pwa_ios_step_1")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#2D3A2E" }}>
                <PlusSquare size={18} color="#D68C70" />
                <span>{t("pwa_ios_step_2")}</span>
              </div>
            </div>
            <button
              onClick={() => setShowIosModal(false)}
              style={{
                width: "100%",
                background: "#2D3A2E",
                color: "#FDFBF7",
                border: "none",
                borderRadius: 12,
                padding: "12px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("common_confirm")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
