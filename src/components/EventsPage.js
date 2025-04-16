import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/pusula.PNG";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { formatTimestamp } from "../utils/utils";
export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "events"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(data);
      } catch (error) {
        console.error("Etkinlikler alınamadı:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bu etkinliği silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "events", id));
        setEvents((prev) => prev.filter((event) => event.id !== id));
        alert("Etkinlik silindi.");
      } catch (err) {
        alert("Silme işlemi başarısız.");
        console.error(err);
      }
    }
  };

  const handleEdit = (event) => {
    navigate(`/edit-event/${event.id}`);
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("tr-TR");
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.seconds) return "";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-center">
          <img src={logo} alt="Pusula Eğitim Kurumları" className="h-20 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          📋 Etkinlikler
        </h2>

        <div className="text-left">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl transition"
          >
            ⬅️ Geri Dön
          </button>
        </div>

        <div className="grid gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white p-6 rounded-xl shadow border border-gray-200 cursor-pointer hover:bg-amber-50 transition"
              onClick={() => navigate(`/events/${event.id}/guests`)}
            >
              <h3 className="text-xl font-semibold text-amber-600 mb-2">
                {event.title}
              </h3>
              <p className="text-gray-600 mb-1">📍 {event.location}</p>
              <p className="text-gray-600 mb-1">
                📅 {event.date?.toDate?.() ? event.date.toDate().toLocaleDateString() : ""}
                {event.time ? ` ⏰ ${formatTimestamp(event.time)}` : ""}
              </p>
              <p className="text-gray-600 mt-2 mb-4">{event.description}</p>

              <div className="flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit-event/${event.id}`)
                    // handleEdit(event);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition"
                >
                  ✏️ Düzenle
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(event.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition"
                >
                  ❌ Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
