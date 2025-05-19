import React from "react";
import flagBRUrl from "@/assets/brazil-flag.svg";
import logoMercosulUrl from "@/assets/logo-mercosul-blanco.svg";

export interface LicensePlateProps {
  plate: string; // ex: "EXK7F11"
  plateColor: string; // ex: "#000000"
  plateTypeCode: string; // ex: "mercosul_moto", "mercosul_privada", "mercosul_colecionador"
}

export default function LicensePlate({
  plate,
  plateColor,
  plateTypeCode,
}: LicensePlateProps) {
  const isCollector = plateTypeCode === "mercosul_colecionador";
  const isMotorcycle = plateTypeCode === "mercosul_moto";

  // Divide em duas linhas no caso de moto
  const firstLine = isMotorcycle ? plate.slice(0, 3) : plate;
  const secondLine = isMotorcycle ? plate.slice(3) : "";

  // Tamanhos responsivos
  const MAX_WIDTH = isMotorcycle ? 200 : 300;
  const FONT_SIZE = isMotorcycle ? 40 : 56; // Aumentei um pouco a fonte
  const STRIPE_HEIGHT = 36;

  // Cor de fundo e texto
  const bgColor = isCollector
    ? "#000000"
    : plateTypeCode === "mercosul_privada"
    ? "#FFFFFF"
    : "#FFFFFF";
  const txtColor = isCollector ? "#FFFFFF" : plateColor;

  const containerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: MAX_WIDTH,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: bgColor,
    border: `3px solid ${plateColor}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
  };

  const stripeStyle: React.CSSProperties = {
    height: STRIPE_HEIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E40AF",
    padding: "0 8px",
  };

  const stripeText: React.CSSProperties = {
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "sans-serif",
  };

  const plateContainer: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 0",
  };

  const plateText: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: FONT_SIZE,
    lineHeight: 1,
    color: txtColor,
    textAlign: "center" as const,
    whiteSpace: "nowrap",
  };

  const logoStyle = { height: 20 };

  return (
    <div style={containerStyle}>
      {/* Faixa superior com logo Mercosul, Brasil e bandeira */}
      <div style={stripeStyle}>
        <img src={logoMercosulUrl} alt="Mercosul" style={logoStyle} />
        <span style={stripeText}>BRASIL</span>
        <img src={flagBRUrl} alt="BR" style={logoStyle} />
      </div>

      {/* Texto da placa */}
      <div style={plateContainer}>
        <div style={plateText}>{firstLine}</div>
        {isMotorcycle && <div style={plateText}>{secondLine}</div>}
      </div>
    </div>
  );
}
