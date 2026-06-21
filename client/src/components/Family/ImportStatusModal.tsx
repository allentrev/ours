import { XMarkIcon } from "@heroicons/react/24/outline";

type StatusAction = "import" | "export";

interface Props {
  action: StatusAction;
  running: boolean;
  message: string;
  error: string;
  onClose: () => void;
}

const ImportStatusModal = ({
  action,
  running,
  message,
  error,
  onClose,
}: Props) => {
  const open = running || !!message || !!error;

  if (!open) return null;

  const title =
    action === "import"
      ? "Import Family Data"
      : "Export Family Data";

  const runningText =
    action === "import"
      ? "Importing family data..."
      : "Preparing export...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>

          {!running && (
            <button
              onClick={onClose}
              className="rounded p-1 hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-5">
          {running && (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>{runningText}</span>
            </div>
          )}

          {!running && message && (
            <div className="rounded border border-green-200 bg-green-50 p-3 text-green-800">
              {message}
            </div>
          )}

          {!running && error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-red-800">
              {error}
            </div>
          )}
        </div>

        {!running && (
          <div className="flex justify-end border-t px-5 py-4">
            <button
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportStatusModal;