import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import QRCode from "qrcode";
import logo from "../assets/pusula.PNG";
import { getAuth } from "firebase/auth";
import { formatTimestamp, formatTime } from "../utils/utils";
export default function InviteGuest() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
    const auth = getAuth();
    const [form, setForm] = useState({
        name: "",
        surname: "",
        phone: "",
        school: "",
        reference: "",
    });
    const [adminInfo, setAdminInfo] = useState({ phone: "", name: "" });

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
                    setAdminInfo({
                        phone: `${data.phone}`,
                        name: `${data.firstName} ${data.lastName}`,
                    });
                } else {
                    // fallback - Firestore'da admin kaydı yoksa auth'dan al
                    setAdminInfo({
                        phone: user.phoneNumber || "",
                        name: "Bilinmeyen Admin",
                    });
                }
            }
        });

        return () => unsubscribe(); // cleanup



    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEvent || !form.name || !form.surname || !form.phone || !form.school) {
            alert("Lütfen tüm zorunlu alanları doldurun.");
            return;
        }

        const fullPhone = form.phone.startsWith("+90")
            ? form.phone
            : "+90" + form.phone.replace(/^0/, "");
        const qrText = `${form.name} ${form.surname} - ${fullPhone}`;
        const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
            qrText
        )}&size=250x250`;
        try {
            const q = query(
                collection(db, "guests"),
                where("eventId", "==", selectedEvent),
                where("phone", "==", fullPhone)
            );
            const existing = await getDocs(q);
            if (!existing.empty) {
                alert("Bu telefon numarası zaten bu etkinliğe kayıtlı.");
                return;
            }
            await addDoc(collection(db, "guests"), {
                name: form.name,
                surname: form.surname,
                phone: fullPhone,
                school: form.school,
                reference: form.reference || "",
                eventId: selectedEvent,
                qrCode: qrDataUrl,
                addedBy: adminInfo.phone,
                addedByName: adminInfo.name,
            });

            const confirmSend = window.confirm("✅ Davetli başarıyla kaydedildi. Şimdi davetiye gönderilsin mi?");
            if (confirmSend) {
                const response = await fetch("https://pusulaeventapi.onrender.com/send-sms", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        to: fullPhone,
                        message: `${events.find(e => e.id === selectedEvent)?.title} Etkinliğine davetlisiniz!\n\n ${form.name} ${form.surname}\n Tarih: ${formatTime(events.find(e => e.id === selectedEvent)?.date)}\n Saat: ${formatTimestamp(events.find(e => e.id === selectedEvent)?.time)}\n Adres: ${events.find(e => e.id === selectedEvent)?.location}\n QR Kodunuz: ${qrDataUrl}\n QR Kodunuzu girişte gösteriniz.`,
                    }),
                });
                const result = await response.json();
                if (result.success) {
                    alert("📨 Davetiye başarıyla gönderildi.");
                } else {
                    alert("SMS gönderilemedi: " + (result.error || "Bilinmeyen hata"));
                }
            }

            setForm({
                name: "",
                surname: "",
                phone: "",
                school: "",
                reference: "",
            });
        } catch (error) {
            console.error("Kayıt hatası:", error);
            alert("❌ Davetli kaydı başarısız oldu.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full space-y-5 border border-gray-200"
            >
                <div className="flex justify-center mb-2">
                    <img
                        src={logo}
                        alt="Pusula Eğitim Kurumları"
                        className="h-20 object-contain"
                    />
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-800">🎟️ Davetli Ekle</h2>

                <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                >
                    <option value="">Etkinlik Seçin</option>
                    {events.map((e) => (
                        <option key={e.id} value={e.id}>
                            {e.title}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    name="name"
                    placeholder="Ad"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                />

                <input
                    type="text"
                    name="surname"
                    placeholder="Soyad"
                    value={form.surname}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                />

                <div className="flex">
                    <span className="inline-flex items-center px-3 text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l-xl text-sm">
                        +90
                    </span>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Telefon"
                        value={form.phone.replace("+90", "")}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        autoComplete="tel"
                        className="w-full p-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                    />
                </div>

                <input
                    type="text"
                    name="school"
                    placeholder="Okul"
                    value={form.school}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                />

                <input
                    type="text"
                    name="reference"
                    placeholder="Referans (isteğe bağlı)"
                    value={form.reference}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <button
                    type="submit"
                    className="w-full bg-amber-500 text-white text-lg py-3 rounded-xl font-semibold hover:bg-amber-600 transition"
                >
                    ➕ Ekle
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="w-full mt-3 bg-gray-200 text-gray-800 text-lg py-3 rounded-xl font-medium hover:bg-gray-300 transition"
                >
                    ❌ Vazgeç
                </button>
            </form>
        </div>
    );
}
