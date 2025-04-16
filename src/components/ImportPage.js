import React, { useRef, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, getDoc, doc, getDocs, query, where } from "firebase/firestore";
import QRCode from "qrcode";
import logo from "../assets/pusula.PNG";
import { getAuth } from "firebase/auth";
import { formatTimestamp, formatTime } from "../utils/utils";

export default function ImportPage() {
  const fileInputRef = useRef(null);
  const [previewData, setPreviewData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAllGlobal, setSelectAllGlobal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const rowsPerPage = 10;
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, "events"));
      const eventList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);
    };
    fetchEvents();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const ref = doc(db, "admins", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setAdminName(`${data.firstName} ${data.lastName}`);
          setAdminPhone(data.phone);
        } else {
          setAdminPhone(user.phoneNumber || "");
          setAdminName("Bilinmeyen Admin");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleTemplateDownload = () => {
    const headers = [["name", "surname", "phone", "school", "reference"]];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Şablon");
    XLSX.writeFile(wb, "davetli_sablon.xlsx");
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setPreviewData(data);
      setSelectedRows(Array(data.length).fill(true));
      setCurrentPage(1);
    };
    reader.readAsBinaryString(file);
  };

  const handleImportSelected = async () => {
    if (!selectedEventId) {
      alert("Lütfen bir etkinlik seçin.");
      return;
    }

    const selectedData = previewData.filter((_, i) => selectedRows[i]);
    const newlyAdded = [];

    const eventDetails = events.find((e) => e.id === selectedEventId);

    for (const guest of selectedData) {
      try {
        const fullPhone = String(guest.phone).startsWith("+90")
          ? guest.phone
          : "+90" + String(guest.phone).replace(/^0/, "");

        const q = query(
          collection(db, "guests"),
          where("eventId", "==", selectedEventId),
          where("phone", "==", fullPhone)
        );
        const existing = await getDocs(q);
        if (!existing.empty) {
          console.warn(`❌ ${guest.name} zaten kayıtlı, atlandı`);
          continue;
        }

        const qrContent = `${guest.name} ${guest.surname} - ${fullPhone}`;
        const qrDataURL = await QRCode.toDataURL(qrContent);

        await addDoc(collection(db, "guests"), {
          ...guest,
          phone: fullPhone,
          qrCode: qrDataURL,
          eventId: selectedEventId,
          addedBy: adminPhone,
          addedByName: adminName,
        });

        newlyAdded.push({ ...guest, phone: fullPhone, qrCode: qrDataURL });
      } catch (error) {
        console.error("Kayıt hatası:", error);
      }
    }

    if (newlyAdded.length > 0 && window.confirm("Yeni eklenen davetlilere davetiye gönderilsin mi?")) {
      for (const guest of newlyAdded) {
        const qrText = `${guest.name} ${guest.surname} - ${guest.phone}`;
        const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
          qrText
        )}&size=250x250`;
        const message = `${eventDetails.title} Etkinliğine davetlisiniz! \n\n${guest.name} ${guest.surname}\n Tarih: ${formatTime(eventDetails.date)}\n Saat: ${formatTimestamp(eventDetails.time)}\n Adres: ${eventDetails.location || ""}\n\n QR Kodunuz: ${qrDataUrl}\n QR Kodunuzu girişte gösteriniz.`;

        try {
          await fetch("https://pusulaeventapi.onrender.com/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: guest.phone, message }),
          });
        } catch (err) {
          console.error("SMS gönderim hatası:", err);
        }
      }
    }

    alert("Seçilen davetliler başarıyla eklendi.");
    navigate("/dashboard");
  };

  const handleCheckboxChange = (index) => {
    const updated = [...selectedRows];
    const globalIndex = (currentPage - 1) * rowsPerPage + index;
    updated[globalIndex] = !updated[globalIndex];
    setSelectedRows(updated);
  };

  const handleSelectAllOnPage = (checked) => {
    const updated = [...selectedRows];
    const start = (currentPage - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, previewData.length);
    for (let i = start; i < end; i++) {
      updated[i] = checked;
    }
    setSelectedRows(updated);
  };

  const handleSelectAllGlobal = (checked) => {
    setSelectedRows(Array(previewData.length).fill(checked));
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const paginatedData = previewData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const paginatedSelections = selectedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const allOnPageSelected = paginatedSelections.every((v) => v);
  const totalPages = Math.ceil(previewData.length / rowsPerPage);

  useEffect(() => {
    const allSelected = selectedRows.length > 0 && selectedRows.every((v) => v);
    setSelectAllGlobal(allSelected);
  }, [selectedRows]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Pusula Eğitim Kurumları" className="h-20" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">📤 Excel ile Davetli Yükle</h2>

        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-1">Etkinlik Seçin:</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">-- Etkinlik Seçin --</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button onClick={handleTemplateDownload} className="bg-amber-500 text-white py-2 px-4 rounded-xl hover:bg-amber-600 transition">
            📄 Şablon İndir
          </button>
          <button onClick={() => fileInputRef.current.click()} className="bg-gray-800 text-white py-2 px-4 rounded-xl hover:bg-gray-900 transition">
            📂 Excel Yükle
          </button>
          <button onClick={handleImportSelected} disabled={previewData.length === 0} className="bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 transition disabled:opacity-50">
            ✅ İçe Aktar
          </button>
          <button onClick={handleCancel} className="bg-red-600 text-white py-2 px-4 rounded-xl hover:bg-red-700 transition">
            ❌ Vazgeç
          </button>
          <input type="file" accept=".xlsx,.xls" ref={fileInputRef} onChange={handleExcelUpload} className="hidden" />
        </div>

        {previewData.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  📊 Ön İzleme
                  <label className="text-sm flex items-center gap-1 font-normal">
                    <input type="checkbox" checked={selectAllGlobal} onChange={(e) => handleSelectAllGlobal(e.target.checked)} />
                    Tümünü Seç (Tüm Sayfalar)
                  </label>
                </h3>
              </div>
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2 border-b border-gray-300">
                      <input type="checkbox" checked={allOnPageSelected} onChange={(e) => handleSelectAllOnPage(e.target.checked)} />
                    </th>
                    {Object.keys(previewData[0]).map((key) => (
                      <th key={key} className="p-2 border-b border-gray-300 capitalize">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr key={index} className="even:bg-gray-50">
                      <td className="p-2 border-b border-gray-200">
                        <input type="checkbox" checked={paginatedSelections[index]} onChange={() => handleCheckboxChange(index)} />
                      </td>
                      {Object.values(row).map((cell, i) => (
                        <td key={i} className="p-2 border-b border-gray-200">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-center space-x-2">
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">⬅️ Prev</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-amber-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Next ➡️</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
