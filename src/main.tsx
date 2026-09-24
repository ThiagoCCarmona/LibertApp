
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { LanguageProvider } from "./i18n";
import "./styles/index.css";

import { isMauiHybrid } from "./services/nativeBridge.ts";

// Registra o Service Worker do PWA exclusivamente em navegadores comuns (fora do APK)
if ("serviceWorker" in navigator && !window.location.protocol.startsWith("file:")) {
  if (isMauiHybrid()) {
    // No APK nativo, desregistra qualquer worker anterior para evitar interferência
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
  } else {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker registrado com sucesso:", reg.scope);
        })
        .catch((err) => {
          console.warn("Falha ao registrar PWA Service Worker:", err);
        });
    });
  }
}

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);

  