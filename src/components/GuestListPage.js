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

  const handleSendInvite = async (guest) => {
    const rawPhone = String(guest.phone);
    const phone = rawPhone.startsWith("+90") ? rawPhone : "+90" + rawPhone.replace(/^0/, "");
    const qrText = `${guest.name} ${guest.surname} - ${phone}`;
    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrText)}&size=250x250`;
    const message = `${eventDetails.title} Etkinliğine davetlisiniz!\n\n ${guest.name} ${guest.surname} Saat: ${formatTimestamp(eventDetails.time)} Tarih: ${formatTime(eventDetails.date)} Adres: ${eventDetails.location}\n QR Kodunuz: ${qrDataUrl}\n QR Kodunuzu girişte gösteriniz.`;
    try {
      const response = await fetch("https://pusulaeventapi.onrender.com/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message }),
      });
      const data = await response.json();
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
      <div className="max-w-2xl mx-auto mb-4">
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
      </div>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-6">
        {paginatedGuests.length === 0 ? (
          <p className="text-center text-gray-600">Aradığınız kriterlere uygun davetli bulunamadı.</p>
        ) : (
          paginatedGuests.map((guest) => (
            <div key={guest.id} className="border-b pb-4 text-gray-700">
              {editingGuestId === guest.id ? (
                <form onSubmit={handleEditSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input name="name" value={editForm.name} onChange={handleEditChange} placeholder="Ad" className="p-2 border border-gray-300 rounded" required />
                    <input name="surname" value={editForm.surname} onChange={handleEditChange} placeholder="Soyad" className="p-2 border border-gray-300 rounded" required />
                    <input name="phone" value={editForm.phone} onChange={handleEditChange} placeholder="Telefon" className="p-2 border border-gray-300 rounded col-span-2" required />
                    <input name="school" value={editForm.school} onChange={handleEditChange} placeholder="Okul" className="p-2 border border-gray-300 rounded col-span-2" required />
                    <input name="reference" value={editForm.reference} onChange={handleEditChange} placeholder="Referans (opsiyonel)" className="p-2 border border-gray-300 rounded col-span-2" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="submit" className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600">💾 Kaydet</button>
                    <button type="button" onClick={() => setEditingGuestId(null)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">❌ Vazgeç</button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold">{guest.name} {guest.surname}</p>
                    <p className="text-sm">🎓 {guest.school}</p>
                    {guest.reference && <p className="text-sm">📌 Referans: {guest.reference}</p>}
                    <p className="text-sm text-gray-500">📱 {guest.phone}</p>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[120px] items-end">
                    <button onClick={() => handleEdit(guest)} className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-3 py-1 rounded w-full">✏️ Düzenle</button>
                    <button onClick={() => handleDelete(guest.id)} className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded w-full">❌ Sil</button>
                    <button onClick={() => handleSendInvite(guest)} className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded w-full">📨 Davetiye</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              ⬅️
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 5) return true;
                if (currentPage <= 3) return page <= 5;
                if (currentPage >= totalPages - 2) return page >= totalPages - 4;
                return Math.abs(page - currentPage) <= 2;
              })
              .map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded ${currentPage === pageNum ? "bg-amber-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                  {pageNum}
                </button>
              ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              ➡️
            </button>
          </div>
        )}

        <div className="pt-4">
          <button onClick={() => navigate("/events")} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-xl">⬅️ Geri Dön</button>
        </div>
      </div>
    </div>
  );
}
