import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/pusula.PNG";
import { registerAdmin } from "../utils/adminService"; // Firestore kayıt servisi
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Firestore bağlantısı

export default function AdminRegisterWithSmsTo() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [password, setPassword] = useState("");
  const [approverPhone, setApproverPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const sendCode = async () => {
    const formattedPhone = approverPhone.startsWith("+90")
      ? approverPhone
      : "+90" + approverPhone.replace(/^0/, "");
  
    // ✅ Admin numarası kayıtlı mı kontrol et
    const q = query(collection(db, "admins"), where("phone", "==", formattedPhone));
    const snapshot = await getDocs(q);
  
    if (snapshot.empty) {
      alert("❌ Bu numara sistemde kayıtlı bir admin değil!");
      return;
    }
  
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
  
    try {
      const response = await fetch("https://pusulaeventapi.onrender.com/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: `Kullanıcı yetkilendirme kodunuz: ${code}\nBu kodu kimseyle paylaşmayın.`,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        setCodeSent(true);
        setTimeLeft(60);
        alert("Kod başarıyla gönderildi!");
      } else {
        alert("SMS gönderilemedi: " + data.error);
      }
    } catch (error) {
      console.error("Fetch hatası:", error);
      alert("SMS gönderimi başarısız oldu.");
    }
  };

  useEffect(() => {
    if (codeSent && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (codeSent && timeLeft === 0) {
      alert("Kod süresi doldu. Lütfen tekrar deneyin.");
      setCodeSent(false);
      setCode("");
      setTimeLeft(60);
    }
  }, [codeSent, timeLeft]);

  const handleSendSms = async (phone, message) => {
    try {
      const response = await fetch("https://pusulaeventapi.onrender.com/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message }),
      });
  
      const data = await response.json();
  
      if (data.message && data.message.includes("OK")) {
        alert("✅ SMS başarıyla gönderildi!");
      } else {
        console.error("SMS gönderilemedi:", data);
        alert("SMS gönderilemedi: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error("SMS gönderim hatası:", error);
      alert("SMS gönderimi sırasında hata oluştu.");
    }
  };

  const handlePhoneChange = (e, type) => {
    let input = e.target.value.replace(/\D/g, "");

    if (input.startsWith("0")) input = input.slice(1);
    if (input.length > 10) input = input.slice(0, 10);

    const formatted = `+90${input}`;

    if (type === "new") {
      setNewPhone(formatted);
    } else {
      setApproverPhone(formatted);
    }
  };
  const handleRegister = async () => {
    if (code !== generatedCode) {
      alert("Girilen kod hatalı!");
      return;
    }

    try {
      await registerAdmin({
        password,
        phone: newPhone,
        role: "admin",
        firstName,
        lastName,
      });
  
      alert("✅ Kayıt başarılı!");
      navigate("/"); // 👈 giriş ekranına yönlendir
    } catch (err) {
      console.error("Kayıt hatası:", err);
      alert("Kayıt sırasında bir hata oluştu: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full space-y-5 border border-gray-200">
        {/* 🖼️ Logo */}
        <div className="flex justify-center">
          <img src={logo} alt="Pusula Eğitim" className="h-20" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          📲 Yetkili Kaydı
        </h2>

        {!codeSent && (
          <>
            <input
              type="text"
              placeholder="Ad"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              className="w-full p-3 border border-gray-300 rounded-xl"
            />

            <input
              type="text"
              placeholder="Soyad"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
            <div className="flex">
              <span className="inline-flex items-center px-3 text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l-xl text-sm">
                +90
              </span>
              <input
                type="tel"
                placeholder="Telefon"
                value={newPhone.replace("+90", "")}
                onChange={(e) => handlePhoneChange(e, "new")}
                autoComplete="tel"
                className="w-full p-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex">
              <span className="inline-flex items-center px-3 text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l-xl text-sm">
                +90
              </span>
              <input
                type="tel"
                placeholder="Onaylayacak yetkili telefonu"
                value={approverPhone.replace("+90", "")}
                onChange={(e) => handlePhoneChange(e, "approver")}
                autoComplete="tel"
                className="w-full p-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={sendCode} 
              className="w-full bg-amber-500 text-white py-3 rounded-xl font-semibold hover:bg-amber-600 transition duration-300"
            >
              SMS Kod Gönder
            </button>
          </>
        )}

        {codeSent && (
          <>
            <input
              type="text"
              placeholder="Gelen SMS kodu"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="text-center text-sm text-gray-600">
              Kalan süre: <span className="font-semibold">{timeLeft}</span> saniye
            </div>

            <button
              onClick={handleRegister}
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition duration-300"
            >
              ✅ Kaydı Tamamla
            </button>
          </>
        )}

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-2">
            Zaten yetkili misin?
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full text-gray-800 border border-gray-800 py-2 rounded-xl font-medium hover:bg-gray-800 hover:text-white transition"
          >
            🔐 Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
}