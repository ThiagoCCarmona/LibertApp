import { ChevronLeft } from "lucide-react";

// Simple QR Code SVG - stylized representation
const StylizedQRCode = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
    <rect x="0" y="0" width="120" height="120" fill="#FDFBF7" stroke="#D68C70" strokeWidth="2" />
    
    {/* Position detection patterns */}
    <rect x="4" y="4" width="16" height="16" fill="#2D3A2E" />
    <rect x="6" y="6" width="12" height="12" fill="#FDFBF7" />
    <rect x="8" y="8" width="8" height="8" fill="#2D3A2E" />
    
    <rect x="100" y="4" width="16" height="16" fill="#2D3A2E" />
    <rect x="102" y="6" width="12" height="12" fill="#FDFBF7" />
    <rect x="104" y="8" width="8" height="8" fill="#2D3A2E" />
    
    <rect x="4" y="100" width="16" height="16" fill="#2D3A2E" />
    <rect x="6" y="102" width="12" height="12" fill="#FDFBF7" />
    <rect x="8" y="104" width="8" height="8" fill="#2D3A2E" />
    
    {/* Data area - pattern */}
    <rect x="25" y="25" width="70" height="70" fill="#F5EFE3" opacity="0.3" />
    <rect x="30" y="30" width="4" height="4" fill="#D68C70" />
    <rect x="40" y="30" width="4" height="4" fill="#D68C70" />
    <rect x="50" y="30" width="4" height="4" fill="#D68C70" />
    <rect x="60" y="30" width="4" height="4" fill="#D68C70" />
    <rect x="30" y="40" width="4" height="4" fill="#D68C70" />
    <rect x="40" y="40" width="4" height="4" fill="#2D3A2E" />
    <rect x="50" y="40" width="4" height="4" fill="#D68C70" />
    <rect x="60" y="40" width="4" height="4" fill="#D68C70" />
    <rect x="30" y="50" width="4" height="4" fill="#D68C70" />
    <rect x="40" y="50" width="4" height="4" fill="#D68C70" />
    <rect x="50" y="50" width="4" height="4" fill="#2D3A2E" />
    <rect x="60" y="50" width="4" height="4" fill="#D68C70" />
    <rect x="30" y="60" width="4" height="4" fill="#D68C70" />
    <rect x="40" y="60" width="4" height="4" fill="#D68C70" />
    <rect x="50" y="60" width="4" height="4" fill="#D68C70" />
    <rect x="60" y="60" width="4" height="4" fill="#2D3A2E" />
  </svg>
);

// Barcode SVG - stylized representation
const StylizedBarcode = () => (
  <svg width="140" height="60" viewBox="0 0 140 60" fill="none">
    {/* Barcode lines */}
    {[0, 3, 7, 10, 14, 18, 21, 25, 29, 33, 37, 41, 44, 48, 52, 56, 60, 63, 67, 71, 75, 79, 83, 87, 91, 95, 99, 103, 107, 111, 115, 119, 123, 127, 131, 135].map((x) => (
      <line key={x} x1={x} y1="0" x2={x} y2={Math.random() > 0.5 ? "45" : "50"} stroke="#2D3A2E" strokeWidth="1.5" />
    ))}
    
    {/* Numbers below */}
    <text x="70" y="58" fontSize="8" textAnchor="middle" fill="#2D3A2E" fontWeight="600">
      SILVIAM-2024-001
    </text>
  </svg>
);

export function CardScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header with back button */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-4">
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Voltar"
        >
          <ChevronLeft size={24} color="#2D3A2E" />
        </button>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 500,
          fontSize: 20,
          color: "#2D3A2E",
          margin: 0,
        }}>
          Carteirinha Digital
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start py-4">

        {/* Main Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #2D3A2E 0%, #3D5040 40%, #4A6050 100%)",
            borderRadius: 24,
            padding: "28px 20px",
            width: "90%",
            maxWidth: 340,
            boxShadow: "0 20px 40px rgba(45,58,46,0.3), 0 8px 24px rgba(45,58,46,0.2)",
            position: "relative",
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(214,140,112,0.12)",
          }} />
          <div style={{
            position: "absolute",
            bottom: -20,
            left: 20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(214,140,112,0.07)",
          }} />

          {/* Card content */}
          <div style={{ position: "relative", zIndex: 2 }}>
            {/* Logo and title */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <svg width="24" height="24" viewBox="0 0 44 44" fill="none">
                <path d="M22 36 L22 13" stroke="rgba(253,251,247,0.8)" strokeWidth="2" strokeLinecap="round" />
                <path d="M22 26 Q16 24 14 18" stroke="rgba(253,251,247,0.8)" strokeWidth="2" strokeLinecap="round" />
                <path d="M22 21 Q28 19 30 13" stroke="rgba(253,251,247,0.8)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(253,251,247,0.6)", fontWeight: 500 }}>
                  LibertApp
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "#FDFBF7", fontWeight: 600 }}>
                  Membro Ativo
                </p>
              </div>
            </div>

            {/* Avatar and name */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(253,251,247,0.1)",
                  border: "2px solid rgba(214,140,112,0.3)",
                  overflow: "hidden",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  alt="Silvia"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(253,251,247,0.6)", fontWeight: 500 }}>
                  Titular
                </p>
                <p style={{ margin: 0, marginTop: 2, fontSize: 16, color: "#FDFBF7", fontWeight: 600 }}>
                  Silvia Mendes
                </p>
              </div>
            </div>

            {/* Info */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 20,
              paddingBottom: 20,
              borderBottom: "1px solid rgba(214,140,112,0.2)",
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(253,251,247,0.5)", fontWeight: 500 }}>
                  Data de Nascimento
                </p>
                <p style={{ margin: 0, marginTop: 4, fontSize: 12, color: "#FDFBF7", fontWeight: 600 }}>
                  15/03/1985
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(253,251,247,0.5)", fontWeight: 500 }}>
                  Nº da Carteira
                </p>
                <p style={{ margin: 0, marginTop: 4, fontSize: 12, color: "#FDFBF7", fontWeight: 600 }}>
                  LBT-0001-2024
                </p>
              </div>
            </div>

            {/* Barcode */}
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
              <StylizedBarcode />
            </div>

            {/* Security note */}
            <p style={{
              margin: 0,
              fontSize: 9,
              color: "rgba(253,251,247,0.4)",
              textAlign: "center",
              fontWeight: 500,
              letterSpacing: "0.5px",
            }}>
              VÁLIDA PARA IDENTIFICAÇÃO NOS ESTABELECIMENTOS PARCEIROS
            </p>
          </div>
        </div>

        {/* QR Code section */}
        <div
          style={{
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            width: "90%",
            maxWidth: 280,
          }}
        >
          <p style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 600,
            color: "#2D3A2E",
            marginBottom: 8,
          }}>
            Código para Validação
          </p>
          <StylizedQRCode />
          <p style={{
            margin: 0,
            marginTop: 8,
            fontSize: 10,
            color: "#7A8A7B",
            textAlign: "center",
          }}>
            Apresente este código ao estabelecimento
          </p>
        </div>
      </div>
    </div>
  );
}
