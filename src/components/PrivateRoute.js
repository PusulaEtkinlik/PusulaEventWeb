// src/components/PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      setReady(true);
    }
  }, [loading]);

  if (!ready) return <div>Yükleniyor...</div>;
  if (!user) return <Navigate to="/" replace />;

  return children;
}