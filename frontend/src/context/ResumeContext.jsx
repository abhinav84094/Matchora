import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;
export const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  async function fetchResume() {
    if (!user?.resume) {
      setLoading(false);
      return;
    }
    try {
      // TODO: confirm this path matches your backend
      const res = await fetch(`${API_URL}/api/user/resume`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setResume(data.success ? data.resume : null);
        setIsPro(data.success ? Boolean(data.isPro) : false);
      }
    } catch {
      setResume(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResume();
  }, [user?.resume]);

  return (
    <ResumeContext.Provider value={{ resume, loading, refetch: fetchResume, setResume, isPro, setIsPro }}>
      {children}
    </ResumeContext.Provider>
  );
}

