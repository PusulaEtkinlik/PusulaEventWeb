import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatTimestamp, formatTime } from "../utils/utils";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function GuestListPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState({ title: "", date: null, time: "", location: "" });
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState("");
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", surname: "", phone: "", school: "", reference: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const maxVisiblePages = 5;

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const q = query(collection(db, "guests"), where("eventId", "==", id));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setGuests(data);
      } catch (error) {
        console.error("Davetliler alınamadı:", error);
      }
    };
    fetchGuests();
  }, [id]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id));
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          setEventDetails({ title: data.title || "", date: data.date || null, time: data.time || "", location: data.location || "" });
        }
      } catch (err) {
        console.error("Etkinlik bilgisi alınamadı:", err);
      }
    };
    fetchEventDetails();
  }, [id]);

  const handleDelete = async (guestId) => {
    if (window.confirm("Bu davetliyi silmek istiyor musunuz?")) {
      try {
        await deleteDoc(doc(db, "guests", guestId));
        setGuests((prev) => prev.filter((g) => g.id !== guestId));
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Silme işlemi başarısız.");
      }
    }
  };

  const sendSmsInvite = async (guest) => {
    const rawPhone = String(guest.phone);
    const phone = rawPhone.startsWith("+90") ? rawPhone : "+90" + rawPhone.replace(/^0/, "");
    const qrText = `${guest.name} ${guest.surname} - ${phone}`;
    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrText)}&size=250x250`;
    const message = `${eventDetails.title} Etkinliğine davetlisiniz!\n\n ${guest.name} ${guest.surname} Saat: ${formatTimestamp(eventDetails.time)} Tarih: ${formatTime(eventDetails.date)} Adres: ${eventDetails.location}\n QR Kodunuz: ${qrDataUrl}\n QR Kodunuzu girişte gösteriniz.`;
    const response = await fetch("https://pusulaeventapi.onrender.com/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: phone, message }),
    });
    return response.json();
  };

  const handleSendInvite = async (guest) => {
    try {
      const data = await sendSmsInvite(guest);
      if (data.success) {
        alert(`✅ SMS gönderildi: ${guest.name + " " + guest.surname}`);
      } else {
        alert("SMS gönderilemedi: " + (data.error || data.message || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error("Davetli SMS gönderim hatası:", error);
      alert("SMS gönderimi başarısız.");
    }
  };

  const handleSendAllInvites = async () => {
    if (!window.confirm("Tüm davetlilere SMS göndermek istediğinizden emin misiniz?")) return;
    for (const guest of filteredGuests) {
      await handleSendInvite(guest);
    }
  };

  const handleEdit = (guest) => {
    setEditingGuestId(guest.id);
    setEditForm({ name: guest.name, surname: guest.surname, phone: guest.phone, school: guest.school, reference: guest.reference || "" });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(db, "guests", editingGuestId);
      await updateDoc(ref, editForm);
      setGuests((prev) => prev.map((g) => (g.id === editingGuestId ? { ...g, ...editForm } : g)));
      setEditingGuestId(null);
      alert("Davetli güncellendi.");
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      alert("Davetli güncellenemedi.");
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const text = `${guest.name} ${guest.surname} ${guest.phone} ${guest.school} ${guest.reference}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filteredGuests.length / rowsPerPage);
  const paginatedGuests = filteredGuests.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="min-h-screen bg-indigo-50 p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">👥 Davetli Listesi</h2>

      <div className="max-w-2xl mx-auto mb-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="İsim, okul, telefon veya referans ile ara..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
        />
        <button onClick={handleSendAllInvites} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl">📨 Tümüne Davetiye Gönder</button>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-6">
        {/* Davetli Kartları */}
        {/* Sayfalama */}
        {/* Geri Dön */}
        {/* Kod burada devam ediyor... */}
      </div>
    </div>
  );
}