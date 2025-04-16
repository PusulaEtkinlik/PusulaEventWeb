import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QrScanner({ onScanSuccess, scanControl }) {
    const readerId = "qr-reader";
    const html5QrCodeRef = useRef(null);
    const isScanningRef = useRef(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const stopCamera = () => {
        if (html5QrCodeRef.current && isScanningRef.current) {
          isScanningRef.current = false;
          html5QrCodeRef.current.stop().then(() => {
            html5QrCodeRef.current.clear();
            setIsCameraActive(false);
      
            // 🔽 Kamera stream'ini fiziksel olarak durdur
            const videoElem = document.getElementById(readerId)?.querySelector("video");
            if (videoElem?.srcObject) {
              videoElem.srcObject.getTracks().forEach((track) => track.stop());
            }
          }).catch((err) => console.error("Stop işlemi başarısız:", err));
        }
      };

    useEffect(() => {
        if (!isScanningRef.current) {
            isScanningRef.current = true;
            const qrCode = new Html5Qrcode(readerId);
            html5QrCodeRef.current = qrCode;

            Html5Qrcode.getCameras()
                .then((devices) => {
                    if (devices && devices.length > 0) {
                        const cameraId = devices[0].id;

                        qrCode
                            .start(
                                { facingMode: "environment" },
                                { fps: 10, qrbox: { width: 250, height: 250 } },
                                (decodedText) => {
                                    onScanSuccess(decodedText);
                                    qrCode.stop().then(() => qrCode.clear());
                                },
                                (errorMessage) => {
                                    // sessiz hata loglanabilir
                                }
                            )
                            .then(() => {
                                setIsCameraActive(true);
                            })
                            .catch((err) => {
                                console.error("Kamera başlatılamadı:", err);
                            });
                    }
                })
                .catch((err) => {
                    console.error("Kamera listesi alınamadı:", err);
                });

            // Cleanup
            return () => {
                if (html5QrCodeRef.current && html5QrCodeRef.current._isScanning) {
                    html5QrCodeRef.current
                        .stop()
                        .then(() => html5QrCodeRef.current.clear())
                        .catch((err) => console.error("Stop hatası:", err));
                }
            };
        }

    }, [onScanSuccess]);

    useEffect(() => {
        if (scanControl) {
            stopCamera(); // stopCamera fonksiyonunu çağırarak kamerayı durduruyoruz.
        }
    }, [scanControl]);

    return (
        <div className="flex justify-center">
            <div id={readerId} className="w-full max-w-xs" />
        </div>
    );
}