import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [bio, setBio] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");

  const { isPending, error, data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = await getToken();
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  // seed form once data loads
  useEffect(() => {
    if (data) {
      setBio(data.bio || "");
      setFacebook(data.facebook || "");
      setInstagram(data.instagram || "");
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/users/profile`,
        { bio, facebook, instagram },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(error.response.data),
  });

  if (isPending) return "Loading...";
  if (error) return "Failed to load profile";

  return (
    <div className="max-w-lg mx-auto mt-12 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Profile</h1>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-600">Bio</label>
        <textarea
          className="border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
          rows={4}
          placeholder="Tell readers a little about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-600">Facebook URL</label>
        <input
          type="url"
          className="border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
          placeholder="https://facebook.com/yourprofile"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-600">Instagram URL</label>
        <input
          type="url"
          className="border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
          placeholder="https://instagram.com/yourprofile"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
      </div>

      <button
        className="py-2 px-6 bg-blue-800 text-white rounded-3xl text-sm self-start hover:bg-blue-700 disabled:opacity-50"
        onClick={() => updateMutation.mutate()}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default ProfilePage;