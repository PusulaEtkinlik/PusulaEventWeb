export function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.seconds) return "Henüz giriş yapılmadı";
    return new Date(timestamp.seconds * 1000).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  export function formatTime(timestamp) {
    if (!timestamp || !timestamp.seconds) return "Henüz giriş yapılmadı";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }