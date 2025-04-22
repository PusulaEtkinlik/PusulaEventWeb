import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/pusula.PNG";
import { getAuth, signOut } from "firebase/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const auth = getAuth();


  const handleLogout = async () => {
    if (window.confirm("Çıkış yapmak istediğinizden emin misiniz?")) {
      try {
        await signOut(auth);
        localStorage.clear();
        sessionStorage.clear();
        navigate("/");
      } catch (error) {
        console.error("Çıkış hatası:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 space-y-6">
      <img src={logo} alt="Pusula Eğitim Kurumları" className="h-20" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
        <button
          onClick={() => navigate("/create-event")}
          className="bg-amber-500 hover:bg-amber-600 transition-all duration-200 text-white text-lg font-semibold py-4 rounded-2xl shadow"
        >
          ➕ Etkinlik Oluştur
        </button>

        <button
          onClick={() => navigate("/events")}
          className="bg-gray-800 hover:bg-gray-900 transition-all duration-200 text-white text-lg font-semibold py-4 rounded-2xl shadow"
        >
          📋 Etkinlikler
        </button>

        <button
          onClick={() => navigate("/invite")}
          className="bg-amber-600 hover:bg-amber-700 transition-all duration-200 text-white text-lg font-semibold py-4 rounded-2xl shadow"
        >
          👤 Davetli Ekle
        </button>

        <button
          onClick={() => navigate("/import")}
          className="bg-yellow-500 hover:bg-yellow-600 transition-all duration-200 text-white text-lg font-semibold py-4 rounded-2xl shadow"
        >
          📥 Excel ile Yükle
        </button>

        <button
          onClick={() => navigate("/check-in")}
          className="bg-gray-600 hover:bg-gray-700 transition-all duration-200 text-white text-lg font-semibold py-4 rounded-2xl shadow"
        >
          🎫 Giriş Kontrolü
        </button>

        <button
          onClick={() => navigate("/analytics")}
          className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white text-lg font-semibold py-4 rounded-2xl shadow"
        >
          📊 Analiz
        </button>
      </div>

      {/* Çıkış butonu ayrı satırda tam genişlikte */}
      <div className="w-full max-w-3xl pt-2">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 transition-all duration-200 text-white text-lg font-semibold py-4 rounded-2xl shadow"
        >
          🔓 Çıkış Yap
        </button>
      </div>
    </div>
  );
}