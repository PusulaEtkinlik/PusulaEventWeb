import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/pusula.PNG";
import { isPhoneAdmin } from "../utils/adminService";
export default function ResetPasswordWithApproval() {
  const [userPhone, setUserPhone] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [smsCode, setSmsCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [codeVerified, setCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();

  // +90 formatı
  const formatPhone = (input) => {
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = digits.slice(1);
    return "+90" + digits.slice(0, 10);
  };

  useEffect(() => {
    if (codeSent && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (codeSent && timeLeft === 0) {
      alert("Kod süresi doldu. Lütfen tekrar deneyin.");
      setCodeSent(false);
      setSmsCode("");
      setTimeLeft(60);
    }
  }, [codeSent, timeLeft]);

  const handleSendCode = async () => {
    const formattedPhone = approverPhone.startsWith("+90")
      ? approverPhone
      : "+90" + approverPhone.replace(/^0/, "");
  
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setCodeSent(true);
    setTimeLeft(60);
  
    try {
      const response = await fetch("https://pusulaeventapi.onrender.com/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: `📌 Pusula Eğitim: Onay kodunuz: ${code}`
        })
      });
  
      const data = await response.json();
      if (data.success) {
        alert("Kod başarıyla gönderildi!");
      } else {
        alert("SMS gönderilemedi: " + (data.message || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error("Fetch hatası:", error);
      alert("SMS gönderimi başarısız.");
    }
  };

  const handleVerifyCode = () => {
    if (smsCode === "1234") {
      // Sadece demo amaçlı sabit kod
      setCodeVerified(true);
    } else {
      alert("Kod hatalı. Lütfen tekrar deneyin.");
    }
  };

  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      alert("Şifre en az 6 karakter olmalı.");
      return;
    }

    // TODO: Firebase üzerinde kullanıcı şifresi güncellenecek
    console.log("🔒 Yeni şifre ayarlandı:", {
      phone: formatPhone(userPhone),
      password: newPassword,
    });

    alert("Şifreniz başarıyla güncellendi.");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full space-y-6 border border-gray-200">
        <div className="flex justify-center">
          <img src={logo} alt="Pusula Eğitim" className="h-20" />
        </div>

        <h2 className="text-xl font-bold text-center text-gray-800">
          🔐 Şifre Sıfırlama
        </h2>

        {!codeSent && (
          <>
            {/* Kullanıcı telefon */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Kendi Telefon Numaranız
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l-xl text-sm">
                  +90
                </span>
                <input
                  type="tel"
                  placeholder="5xxxxxxxxx"
                  value={userPhone.replace("+90", "")}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            {/* Admin telefon */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Onaylayacak Admin Numarası
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l-xl text-sm">
                  +90
                </span>
                <input
                  type="tel"
                  placeholder="5xxxxxxxxx"
                  value={adminPhone.replace("+90", "")}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendCode}
              className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition duration-300"
            >
              SMS Kod Gönder
            </button>
          </>
        )}

        {/* KOD GİRİŞİ */}
        {codeSent && !codeVerified && (
          <>
            <input
              type="text"
              placeholder="Gelen SMS kodu"
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="text-center text-sm text-gray-600">
              Kalan süre: <span className="font-semibold">{timeLeft}</span> saniye
            </div>

            <button
              type="button"
              onClick={handleVerifyCode}
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition duration-300"
            >
              ✅ Kodu Doğrula
            </button>
          </>
        )}

        {/* YENİ ŞİFRE */}
        {codeVerified && (
          <>
            <input
              type="password"
              placeholder="Yeni Şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
              type="button"
              onClick={handleResetPassword}
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition duration-300"
            >
              🔒 Şifreyi Güncelle
            </button>
          </>
        )}

        {/* Girişe dön */}
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