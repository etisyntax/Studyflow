import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

async function fetchProfile(userId) {
  const { data } = await supabase
    .from("profiles")
    .select("full_name, created_at")
    .eq("id", userId)
    .single();
  return data;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchProfile(session.user.id).then(setProfile);
  }, [session]);

  async function refreshProfile() {
    if (!session) return;
    const data = await fetchProfile(session.user.id);
    setProfile(data);
  }

  const value = {
    session,
    user: session ? session.user : null,
    profile: session ? profile : null,
    loading,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}