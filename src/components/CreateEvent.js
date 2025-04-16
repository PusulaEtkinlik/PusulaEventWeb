import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../datepicker-custom.css";
import { registerLocale } from "react-datepicker";
import tr from "date-fns/locale/tr";
import { useNavigate } from "react-router-dom";
import logo from "../assets/pusula.PNG";

import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

registerLocale("tr", tr);

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!title || !selectedDate || !selectedTime || !location) {
      alert("Lütfen tüm gerekli alanları doldurun.");
      return;
    }
  
    try {
      await addDoc(collection(db, "events"), {
        title,
        description,
        location,
        date: Timestamp.fromDate(selectedDate),
        time: Timestamp.fromDate(selectedTime), // ⏱️ saat bilgisi Timestamp olarak kaydediliyor
      });
  
      alert("Etkinlik başarıyla oluşturuldu!");
      navigate("/events");
    } catch (error) {
      console.error("Etkinlik oluşturma hatası:", error);
      alert("Etkinlik oluşturulamadı.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full space-y-6 border border-gray-200"
      >
        {/* 🖼️ LOGO */}
        <div className="flex justify-center mb-2">
          <img src={logo} alt="Pusula Eğitim Kurumları" className="h-20 object-contain" />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800">
          📅 Etkinlik Oluştur
        </h2>

        <input
          type="text"
          placeholder="Etkinlik Başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        />

        <textarea
          placeholder="Açıklama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          rows="3"
        />

        {/* 📅 Tarih */}
        <div className="w-full">
          <label className="block text-gray-700 text-sm mb-1">📅 Tarih</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            locale="tr"
            dateFormat="dd/MM/yyyy"
            placeholderText="Tarih seçin"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* 🕒 Saat */}
        <div className="w-full">
          <label className="block text-gray-700 text-sm mb-1 mt-4">🕒 Saat</label>
          <DatePicker
            selected={selectedTime}
            onChange={(time) => setSelectedTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Saat"
            locale="tr"
            dateFormat="HH:mm"
            placeholderText="Saat seçin"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <input
          type="text"
          placeholder="📍 Adres"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-amber-500 text-white text-lg py-4 rounded-xl font-semibold hover:bg-amber-600 transition duration-300"
        >
          ✅ Oluştur
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="w-full mt-3 bg-gray-200 text-gray-800 text-lg py-3 rounded-xl font-medium hover:bg-gray-300 transition duration-300"
        >
          ❌ Vazgeç
        </button>
      </form>
    </div>
  );
}