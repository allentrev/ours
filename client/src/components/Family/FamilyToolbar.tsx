import type { FamilyTreeMode } from "../../types/familyTypes";

interface Props {
  mode: FamilyTreeMode;
  onModeChange: (mode: FamilyTreeMode) => void;
}

const FamilyToolbar = ({ mode, onModeChange }: Props) => {
  return (
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
  );
};

export default FamilyToolbar;