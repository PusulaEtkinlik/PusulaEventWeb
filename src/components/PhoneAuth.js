import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updatePassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function PhoneAuth() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("auth nesnesi:", auth); // Hâlâ kalsın
  
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth, // burada önce auth!
          "recaptcha-container",
          {
            size: "invisible",
            callback: (response) => {
              console.log("✅ reCAPTCHA başarılı:", response);
            },
            'expired-callback': () => {
              console.log("⚠️ reCAPTCHA süresi doldu");
            },
          }
        );
      } catch (err) {
        console.error("❌ reCAPTCHA tanımlanamadı:", err);
      }
    }
  }, []);

  const sendCode = async () => {
    const formattedPhone = phone.startsWith("+90") ? phone : "+90" + phone.replace(/^0/, "");

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );
      setConfirmation(confirmationResult);
      alert("Kod gönderildi!");
    } catch (error) {
      alert("Kod gönderilemedi: " + error.message);
    }
  };

  const verifyCode = async () => {
    try {
      const result = await confirmation.confirm(code);
      alert("Doğrulama başarılı! Şimdi şifreyi güncelleyin.");
    } catch (error) {
      alert("Kod hatalı: " + error.message);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      alert("Şifre en az 6 karakter olmalı.");
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      alert("Şifre başarıyla güncellendi.");
      navigate("/");
    } catch (error) {
      alert("Şifre güncellenemedi: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4 max-w-sm w-full">
        <h2 className="text-xl font-bold text-center">📲 Şifreyi Sıfırla</h2>

        {!confirmation ? (
          <>
            <input
              type="tel"
              placeholder="Telefon (+905xx...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border rounded"
            />
            <button
              onClick={sendCode}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              SMS Kod Gönder
            </button>
          </>
        ) : !auth.currentUser ? (
          <>
            <input
              type="text"
              placeholder="SMS Kodu"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 border rounded"
            />
            <button
              onClick={verifyCode}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              ✅ Doğrula
            </button>
          </>
        ) : (
          <>
            <input
              type="password"
              placeholder="Yeni Şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border rounded"
            />
            <button
              onClick={handlePasswordUpdate}
              className="w-full bg-purple-600 text-white py-2 rounded"
            >
              🔒 Şifreyi Güncelle
            </button>
          </>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}