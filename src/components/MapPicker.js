import React, { useCallback, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "1rem",
  marginTop: "1rem"
};

const center = {
  lat: 39.9208,
  lng: 32.8541,
};

function MapPicker({ onLocationSelect }) {
  const [marker, setMarker] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "🧩 BURAYA SENİN API ANAHTARIN GELECEK",
  });

  const handleClick = useCallback((event) => {
    const clickedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarker(clickedLocation);
    onLocationSelect(clickedLocation);
  }, [onLocationSelect]);

  if (!isLoaded) return <p>Harita yükleniyor...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={6}
      onClick={handleClick}
    >
      {marker && <Marker position={marker} />}
    </GoogleMap>
  );
}

export default React.memo(MapPicker);