import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/pusula.PNG";

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const formatPhone = (input) => {
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = digits.slice(1);
    return "+90" + digits.slice(0, 10);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formatted = formatPhone(phone);
    if (formatted.length < 13) {
      alert("Lütfen geçerli bir telefon numarası girin.");
      return;
    }

    // Buraya Firestore'a kayıt vs. eklenebilir
    console.log("📨 Şifre sıfırlama isteği:", formatted);

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-3xl p-8 max-w-sm w-full space-y-6 border border-gray-200"
      >
        <div className="flex justify-center">
          <img src={logo} alt="Pusula Eğitim" className="h-20" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">🔐 Şifre Sıfırlama</h2>

        {submitted ? (
          <p className="text-center text-green-600">
            Talebiniz alınmıştır. Yetkili sizinle iletişime geçecek.
          </p>
        ) : (
          <>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l-xl text-sm">
                +90
              </span>
              <input
                type="tel"
                placeholder="Telefon numaranız"
                value={phone.replace("+90", "")}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 text-white py-3 rounded-xl hover:bg-amber-700 transition font-semibold"
            >
              Talep Gönder
            </button>
          </>
        )}

        <div className="pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full text-gray-800 border border-gray-800 py-2 rounded-xl font-medium hover:bg-gray-800 hover:text-white transition"
          >
            🔙 Girişe Dön
          </button>
        </div>
      </form>
    </div>
  );
}