import { useEffect, useState } from "react";
import { libertAppLogo } from "../../assets/logo";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setOpacity(1);
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#FDFBF7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transition: "opacity 0.8s ease-in-out",
        zIndex: 100,
      }}
    >
      {/* Logo image (embedded high-res asset) */}
      <img
        src={libertAppLogo}
        alt="LibertApp logo"
        width={180}
        height={180}
        style={{ marginBottom: 24, objectFit: "contain" }}
      />

      {/* Text */}
      <h1
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 32,
          fontWeight: 500,
          color: "#2D3A2E",
          margin: 0,
          letterSpacing: "-0.5px",
        }}
      >
        LibertApp
      </h1>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "#7A8A7B",
          marginTop: 8,
          letterSpacing: "0.5px",
        }}
      >
        Bem-estar Digital
      </p>

      {/* Loading indicator */}
      <div
        style={{
          marginTop: 48,
          display: "flex",
          gap: 6,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#D68C70",
              animation: `pulse 1.5s infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
