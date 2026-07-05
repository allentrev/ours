import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { SquarePen } from "lucide-react"; // or any small icon

import type { TreeMode } from "../../types/familyTypes";
import { isAdminUser } from "@/utilities/authRoles";

interface Props {
  mode: TreeMode;
  onModeChange: (mode: TreeMode) => void;
  onImportGrampsFile: (file: File) => void;
  onExportFamilyData: () => void;
  importing: boolean;
  exporting: boolean;
}

const FamilyToolbar = ({
  mode,
  onModeChange,
  onImportGrampsFile,
  onExportFamilyData,
  importing,
  exporting,
}: Props) => {
  
  const { user } = useUser(); 
  const isAdmin = isAdminUser(user);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const busy = importing || exporting;

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    onImportGrampsFile(file);
    event.target.value = "";
  };

  return (
    <div className="flex justify-between items-center mr-4">
      <div className="border-b border-gray-200 bg-white p-4 flex gap-3">
        <button
          onClick={() => onModeChange("ancestors")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "ancestors"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Ancestors
        </button>

        <button
          onClick={() => onModeChange("descendants")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "descendants"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Descendants
        </button>

        { isAdmin && (
          <div className="flex flex-row gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                busy
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {importing ? "Importing..." : "Import"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={onExportFamilyData}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                busy
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {exporting ? "Exporting..." : "Export"}
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".gramps,.xml"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/family")}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          Back
        </button>
        <SignedOut>
          <Link to="/login">
            <button className="py-2 px-4 rounded-3xl bg-blue-800 text-white">Login</button>
          </Link>
        </SignedOut>
        <SignedIn>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Edit Profile"
                labelIcon={<SquarePen size={16} />}
                href="/profile"
              />
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>
      </div>
    </div>
  );
};

export default FamilyToolbar;