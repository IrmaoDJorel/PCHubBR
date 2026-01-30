"use client";

import { useEffect, useState } from "react";

/**
 * Hook para verificar se usuário está autenticado
 * Faz fetch em /api/auth/me para obter dados do usuário
 */
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data?.userId) {
          setIsLoggedIn(true);
          setUserId(data.userId);
        } else {
          setIsLoggedIn(false);
          setUserId(null);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUserId(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { isLoggedIn, loading, userId };
}