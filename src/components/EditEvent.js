import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import logo from "../assets/pusula.PNG";
import { registerLocale } from "react-datepicker";
import tr from "date-fns/locale/tr";

registerLocale("tr", tr);

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const ref = doc(db, "events", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setEvent(data);
      } else {
        alert("Etkinlik bulunamadı");
        navigate("/events");
      }
    };
    fetchEvent();
  }, [id, navigate]);

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");
      setLocationText(event.location || "");
  
      const eventDate = event.date?.seconds
        ? new Date(event.date.seconds * 1000)
        : new Date(event.date);
  
      let eventTime;
      if (event.time?.seconds) {
        eventTime = new Date(event.time.seconds * 1000);
      } else if (typeof event.time === "string" && event.time.includes(":")) {
        // örnek: "13:30"
        const [hours, minutes] = event.time.split(":").map(Number);
        eventTime = new Date();
        eventTime.setHours(hours);
        eventTime.setMinutes(minutes);
        eventTime.setSeconds(0);
        eventTime.setMilliseconds(0);
      } else {
        eventTime = new Date();
      }
  
      setSelectedDate(eventDate);
      setSelectedTime(eventTime);
    }
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !selectedDate || !selectedTime || !locationText) {
      alert("Lütfen tüm alanları doldurun");
      return;
    }

    try {
      const ref = doc(db, "events", id);
      await updateDoc(ref, {
        title,
        description,
        location: locationText,
        date: selectedDate,
        time: selectedTime,
      });

      alert("Etkinlik başarıyla güncellendi!");
      navigate("/events");
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      alert("Etkinlik güncellenemedi!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full space-y-6 border border-gray-200"
      >
        <div className="flex justify-center mb-2">
          <img src={logo} alt="Pusula Eğitim Kurumları" className="h-20 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">✏️ Etkinlik Düzenle</h2>

        <input
          type="text"
          placeholder="Etkinlik Başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <textarea
          placeholder="Açıklama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          rows="3"
        />

        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          locale="tr"
          dateFormat="dd/MM/yyyy"
          placeholderText="Tarih seçin"
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

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

        <input
          type="text"
          placeholder="📍 Adres"
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <button
          type="submit"
          className="w-full bg-amber-500 text-white text-lg py-3 rounded-xl font-semibold hover:bg-amber-600 transition duration-300"
        >
          ✅ Güncelle
        </button>

        <button
          type="button"
          onClick={() => navigate("/events")}
          className="w-full bg-gray-300 text-gray-800 text-lg py-3 rounded-xl font-medium hover:bg-gray-400 transition duration-300"
        >
          ❌ Vazgeç
        </button>
      </form>
    </div>
  );
}
