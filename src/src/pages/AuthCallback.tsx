import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        navigate("/");
      } else {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  return <div>กำลังยืนยันบัญชี...</div>;
}