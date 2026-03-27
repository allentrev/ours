// hooks/useProfile.ts
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useProfile = () => {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["profile"],
    enabled: !!isSignedIn,   // only fetch if signed in
    queryFn: async () => {
      const token = await getToken();
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });
};