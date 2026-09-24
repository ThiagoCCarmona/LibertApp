
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { LanguageProvider } from "./i18n";
import "./styles/index.css";

// Registra o Service Worker do PWA quando em ambiente web
if ("serviceWorker" in navigator && !window.location.protocol.startsWith("file:")) {
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

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);

  