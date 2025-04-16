import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/pusula.PNG";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const formatPhone = (input) => {
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = digits.slice(1);
    return "+90" + digits.slice(0, 10);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formattedPhone = formatPhone(phone);
    const fakeEmail = `${formattedPhone.replace("+", "")}@pusula.fake`;

    try {
      await signInWithEmailAndPassword(auth, fakeEmail, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Giriş hatası:", err);
      alert("Telefon numarası veya şifre hatalı.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-3xl p-8 max-w-sm w-full space-y-6 border border-gray-200"
      >
        {/* 🖼️ LOGO */}
        <div className="flex justify-center mb-2">
          <img
            src={logo}
            alt="Pusula Eğitim Kurumları"
            className="h-20 object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">🔐 Giriş Yap</h2>

        {/* 📱 Telefon inputu (otomatik +90) */}
        <div className="flex">
          <span className="inline-flex items-center px-3 text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l-xl text-sm">
            +90
          </span>
          <input
            type="tel"
            placeholder="Telefon"
            value={phone.replace("+90", "")}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className="w-full p-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* 🔐 Şifre */}
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
        />


        {/* <div className="text-sm text-center text-gray-600 mt-2">
          <button
            type="button"
            onClick={() => navigate("/reset-password-auth")}
            className="text-indigo-600 hover:underline font-medium"
          >
            Şifremi Unuttum
          </button>
        </div> */}

        {/* Giriş Butonu */}
        <button
          type="submit"
          className="w-full bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-900 transition duration-300 font-semibold"
        >
          Giriş Yap
        </button>

        {/* Kayıt Yönlendirme */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/register-sms")}
            className="w-full text-amber-600 border border-amber-600 py-2 rounded-xl font-medium hover:bg-amber-600 hover:text-white transition duration-300"
          >
            Yetkili Kayıt
          </button>
        </div>
      </form>
    </div>
  );
}