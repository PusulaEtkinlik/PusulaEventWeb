import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const formatTimestamp = (timestamp) => {
  if (!timestamp?.seconds) return "Henüz giriş yapılmadı";
  return new Date(timestamp.seconds * 1000).toLocaleString("tr-TR");
};

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [guests, setGuests] = useState([]);
  const [page, setPage] = useState(1);
  const [filterCheckedIn, setFilterCheckedIn] = useState("all");
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, "events"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(list);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchGuests = async () => {
      if (!selectedEventId) return;
      const q = query(collection(db, "guests"), where("eventId", "==", selectedEventId));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGuests(list);
      setPage(1);
    };
    fetchGuests();
  }, [selectedEventId]);

  const filteredGuests = guests.filter((g) => {
    if (filterCheckedIn === "checkedIn") return g.checkInTime;
    if (filterCheckedIn === "notCheckedIn") return !g.checkInTime;
    return true;
  });

  const paginatedGuests = filteredGuests.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredGuests.length / rowsPerPage);

  const handleExport = () => {
    const csv = [
      ["Ad", "Soyad", "Telefon", "Okul", "Referans", "Giriş Zamanı", "Kontrol Eden"],
      ...filteredGuests.map((g) => [
        g.name,
        g.surname,
        g.phone,
        g.school,
        g.reference || "-",
        formatTimestamp(g.checkInTime),
        g.checkedInByName || g.checkedInBy || "-",
      ]),
    ]
      .map((row) => row.join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "davetli_analizi.csv";
    link.click();
  };

  const checkedInCount = guests.filter((g) => g.checkInTime).length;
  const notCheckedInCount = guests.length - checkedInCount;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">📊 Etkinlik Analizi</h2>

        {/* 🎯 Etkinlik Seçimi */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">Etkinlik Seçin:</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">-- Etkinlik Seç --</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        {/* 🧮 Giriş Durumu Özeti */}
        {selectedEventId && (
          <>
            <div className="flex flex-wrap justify-center gap-6 bg-gray-100 p-4 rounded-xl text-center text-gray-800 text-sm sm:text-base font-medium">
              <div>✅ Giriş Yapan: <span className="font-bold text-green-600">{checkedInCount}</span></div>
              <div>⏳ Giriş Yapmayan: <span className="font-bold text-red-600">{notCheckedInCount}</span></div>
              <div>👥 Toplam Davetli: <span className="font-bold text-gray-700">{guests.length}</span></div>
            </div>

            {/* 🔍 Filtreleme */}
            <div className="flex flex-col sm:flex-row sm:justify-center items-start sm:items-center gap-4 sm:gap-6 text-sm sm:text-base text-gray-700 font-medium">
              <label className="flex items-center gap-2">
                <input type="radio" name="filter" value="all" checked={filterCheckedIn === "all"} onChange={() => setFilterCheckedIn("all")} /> Tümü
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="filter" value="checkedIn" checked={filterCheckedIn === "checkedIn"} onChange={() => setFilterCheckedIn("checkedIn")} /> Giriş Yapanlar
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="filter" value="notCheckedIn" checked={filterCheckedIn === "notCheckedIn"} onChange={() => setFilterCheckedIn("notCheckedIn")} /> Giriş Yapmayanlar
              </label>
            </div>
          </>
        )}

        {/* 📊 Tablo */}
        {selectedEventId && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300 rounded">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">Ad</th>
                    <th className="p-2">Soyad</th>
                    <th className="p-2">Telefon</th>
                    <th className="p-2">Okul</th>
                    <th className="p-2">Referans</th>
                    <th className="p-2">Giriş Zamanı</th>
                    <th className="p-2">Kontrol Eden</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGuests.map((g) => (
                    <tr key={g.id} className="border-t">
                      <td className="p-2">{g.name}</td>
                      <td className="p-2">{g.surname}</td>
                      <td className="p-2">{g.phone}</td>
                      <td className="p-2">{g.school}</td>
                      <td className="p-2">{g.reference || "-"}</td>
                      <td className="p-2">{formatTimestamp(g.checkInTime)}</td>
                      <td className="p-2">{g.checkedInByName  || g.checkedInBy || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 📃 Sayfalama ve Dışa Aktarma */}
            <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
              <div className="text-sm text-gray-600">
                Sayfa {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  ⬅️ Önceki
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Sonraki ➡️
                </button>
              </div>
              <button
                onClick={handleExport}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                📥 Excel'e Aktar
              </button>
            </div>
          </>
        )}

        <div className="pt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-xl"
          >
            ⬅️ Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
}
