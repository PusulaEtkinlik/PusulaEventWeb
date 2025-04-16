import React, { useState, useEffect } from "react";
import QrScanner from "./QrScanner";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function CheckIn() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [qrResult, setQrResult] = useState("");
  const [checkStatus, setCheckStatus] = useState("");
  const [guestInfo, setGuestInfo] = useState(null);
  const [guestStats, setGuestStats] = useState({});
  const navigate = useNavigate();
  const auth = getAuth();
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [stopScan, setStopScan] = useState(false);
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
          // fallback - Firestore'da admin kaydı yoksa auth'dan al
          setAdminPhone(user.phoneNumber || "");
          setAdminName("Bilinmeyen Admin");
        }
      }
    });

    return () => unsubscribe(); // cleanup


  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedEventId) return;
      const q = query(collection(db, "guests"), where("eventId", "==", selectedEventId));
      const snapshot = await getDocs(q);
      const guests = snapshot.docs.map(doc => doc.data());
      const total = guests.length;
      const checkedIn = guests.filter(g => g.checkedIn).length;
      setGuestStats({ total, checkedIn });
    };
    fetchStats();
  }, [selectedEventId, qrResult]);

  const handleGuestCheckIn = async (qrText) => {
    if (!selectedEventId) return;
    const q = query(
      collection(db, "guests"),
      where("eventId", "==", selectedEventId),
      where("qrCode", "!=", "")
    );
    const snapshot = await getDocs(q);

    const guest = snapshot.docs.find((doc) => {
      const data = doc.data();
      const expectedText = `${data.name} ${data.surname} - ${data.phone}`;
      return expectedText === qrText;
    });

    if (!guest) {
      setCheckStatus("🚫 Davetli bulunamadı.");
      setGuestInfo(null);
      return;
    }

    const guestData = guest.data();
    setGuestInfo(guestData);

    if (guestData.checkedIn) {
      setCheckStatus("⚠️ Bu davetli zaten giriş yaptı.");
    } else {
      await updateDoc(doc(db, "guests", guest.id), {
        checkedIn: true,
        checkInTime: new Date(),
        checkedInBy: adminPhone,
        checkedInByName: adminName,
      });
      setCheckStatus("✅ Giriş başarılı!");
    }
  };

  const handleCancel = () => {
    setStopScan(true);
    navigate("/dashboard");
  };

  const handleRetry = () => {
    setQrResult("");
    setCheckStatus("");
    setGuestInfo(null);
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          🎟️ Giriş Kontrolü
        </h2>
        {!selectedEventId && (
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Kontrol edilecek etkinliği seçin:
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setQrResult("");
              }}
            >
              <option value="">-- Etkinlik Seç --</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedEventId && (
          <>
            <div className="text-gray-700 text-center mb-4">
              Etkinlik: <span className="text-amber-600 font-semibold">{selectedEvent?.title}</span><br />
              <span className="inline-block bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-xl mr-2">
                Giriş Yapan: {guestStats.checkedIn}
              </span>
              <span className="inline-block bg-gray-100 text-gray-800 font-semibold px-3 py-1 rounded-xl">
                Toplam: {guestStats.total}
              </span>
            </div>

            {!qrResult ? (
              <>
                <QrScanner
                  onScanSuccess={(text) => {
                    setQrResult(text);
                    handleGuestCheckIn(text);
                  }}
                  scanControl={stopScan}
                />

                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-xl"
                  >
                    ❌ Vazgeç
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`text-center font-semibold mb-4 p-4 rounded-xl shadow ${checkStatus.startsWith("✅")
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : checkStatus.startsWith("⚠️")
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                >
                  <div className="text-lg">{checkStatus}</div>
                  <div className="text-sm break-all mt-2 text-gray-700">{qrResult}</div>
                </div>

                {guestInfo && (
                  <div className="text-center text-gray-700 mb-4">
                    👤 <strong>{guestInfo.name} {guestInfo.surname}</strong><br />
                    🎓 {guestInfo.school}<br />
                    📱 {guestInfo.phone}<br />
                    {guestInfo.reference && (
                      <>📌 Referans: {guestInfo.reference}<br /></>
                    )}
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleRetry}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl"
                  >
                    🔁 Devam Et
                  </button>

                  <button
                    onClick={handleCancel}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl"
                  >
                    ❌ Vazgeç
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
