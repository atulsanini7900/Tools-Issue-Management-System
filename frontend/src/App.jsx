import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import MechanicDashboard from "./pages/MechanicDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/mechanic" element={<MechanicDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<div style={{ textAlign: "center", padding: "4rem" }}><h2>⚠️ Page Not Found</h2><p>The requested page does not exist.</p></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
