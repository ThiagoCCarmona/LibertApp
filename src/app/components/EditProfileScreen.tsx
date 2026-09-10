import { useState } from "react";
import { ChevronLeft } from "lucide-react";

export function EditProfileScreen({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    fullName: "Silvia Mendes",
    email: "silvia.mendes@email.com",
    phone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    location: "São Paulo, SP",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, (match, p1, p2, p3) => {
          if (p3) return `(${p1}) ${p2}-${p3}`;
          if (p2) return `(${p1}) ${p2}`;
          if (p1) return `(${p1}`;
          return match;
        });
    }
    return value;
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/, (match, p1, p2, p3, p4) => {
          if (p4) return `${p1}.${p2}.${p3}-${p4}`;
          if (p3) return `${p1}.${p2}.${p3}`;
          if (p2) return `${p1}.${p2}`;
          if (p1) return `${p1}`;
          return match;
        });
    }
    return value;
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex-1 overflow-y-auto">
        {/* Header with back button */}
        <div className="px-6 pt-4 pb-4 flex items-center gap-4">
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
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, color: "#2D3A2E", margin: 0 }}>
            Editar Perfil
          </h1>
        </div>

        {/* Avatar section */}
        <div className="px-6 pb-6 flex flex-col items-center">
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #D68C70, #C4785A)",
              overflow: "hidden",
              border: "4px solid #D68C70",
              marginBottom: 12,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <button
            style={{
              background: "#F5EFE3",
              border: "1px solid #D68C70",
              borderRadius: 8,
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: "#D68C70",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Alterar Foto
          </button>
        </div>

        {/* Form fields */}
        <div className="px-6 pb-6 space-y-4">
          {/* Full Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid rgba(45,58,46,0.12)",
                borderRadius: 12,
                background: "#F5EFE3",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
              }}
              placeholder="Nome completo"
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              E-mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid rgba(45,58,46,0.12)",
                borderRadius: 12,
                background: "#F5EFE3",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
              }}
              placeholder="E-mail"
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              Telefone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid rgba(45,58,46,0.12)",
                borderRadius: 12,
                background: "#F5EFE3",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
              }}
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          {/* CPF */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              CPF
            </label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => handleChange("cpf", formatCPF(e.target.value))}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid rgba(45,58,46,0.12)",
                borderRadius: 12,
                background: "#F5EFE3",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
              }}
              placeholder="XXX.XXX.XXX-XX"
            />
          </div>

          {/* Location */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#2D3A2E", display: "block", marginBottom: 6 }}>
              Localização Padrão
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid rgba(45,58,46,0.12)",
                borderRadius: 12,
                background: "#F5EFE3",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
              }}
              placeholder="Cidade, Estado"
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="px-6 pb-6">
        <button
          onClick={handleSave}
          style={{
            width: "100%",
            padding: "14px",
            background: saved
              ? "linear-gradient(135deg, #2D3A2E 0%, #3D5040 100%)"
              : "linear-gradient(135deg, #D68C70 0%, #C4785A 100%)",
            border: "none",
            borderRadius: 12,
            color: "#FDFBF7",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.3s",
            boxShadow: saved
              ? "0 8px 24px rgba(45,58,46,0.25)"
              : "0 8px 24px rgba(214,140,112,0.3)",
          }}
        >
          {saved ? "✓ Salvo com sucesso!" : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}
