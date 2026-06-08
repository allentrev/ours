import type { FamilyTreeMode } from "../../types/familyTypes";
import { useNavigate } from "react-router-dom";

interface Props {
  mode: FamilyTreeMode;
  onModeChange: (mode: FamilyTreeMode) => void;
}

const FamilyToolbar = ({ mode, onModeChange }: Props) => {
  const navigate = useNavigate();
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