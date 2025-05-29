// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/kanban.css"; // Se você tiver estilos Kanban
import "react-grid-layout/css/styles.css"; // Adicione ou confirme
import "react-resizable/css/styles.css"; // Adicione ou confirme

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
