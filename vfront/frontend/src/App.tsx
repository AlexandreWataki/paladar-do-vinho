import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import "./components/base.css"; // ✅ agora dentro de /components

const App: React.FC = () => {
  return (
    <div className="app-shell">
      <Header />
      <Outlet />
    </div>
  );
};

export default App;
