import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import type { TreeMode } from "../../types/familyTypes";

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

        <input
          ref={fileInputRef}
          type="file"
          accept=".gramps,.xml"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <button
        onClick={() => navigate("/family")}
        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
      >
        Back
      </button>
    </div>
  );
};

export default FamilyToolbar;