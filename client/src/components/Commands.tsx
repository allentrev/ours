import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CommandsProps {
  editMode: boolean;
  imageMode: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSetCover?: boolean;
  canDeleteImages?: boolean;
  onCreate: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onSave: () => void;
  onCancel: () => void;
  onSetCover?: () => void;
  onUploadCSV?: (file: File) => Promise<void>;
  onUploadFile?: (files: File[]) => Promise<void>; // multiple files
  onOpenImages?: () => void;
  uploadProgress?: number;
  uploadTarget?: number;
}

export function Commands({
  editMode,
  imageMode,
  canEdit,
  canDelete,
  canSetCover,
  canDeleteImages,
  onCreate,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onSetCover,
  onUploadCSV,
  onUploadFile,
  onOpenImages,
  uploadProgress = 0,
  uploadTarget = 0,
}: CommandsProps) {
  const navigate = useNavigate();

  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const buttonsDisabled = uploadProgress > 0;

  const Btn = ({
    disabled,
    label,
    onClick,
  }: {
    disabled?: boolean;
    label: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded w-full ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-yellow-500 text-white hover:bg-yellow-600"
      }`}
    >
      {label}
    </button>
  );

  /** Handle file input change (multi-file) */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setPendingFiles(files);
    setSelectedFileName(files[0].name);
    setModalVisible(true);
    e.target.value = "";
  };

  const startUpload = async () => {
    setModalVisible(false);
    if (onUploadFile) {
      await onUploadFile(pendingFiles);
    }
    setPendingFiles([]);
    setSelectedFileName(null);
  };

  const cancelUpload = () => {
    setModalVisible(false);
    setPendingFiles([]);
    setSelectedFileName(null);
  };

  const UploadConfirmModal = () =>
    modalVisible && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 w-96 text-center">
          <h2 className="text-lg font-bold mb-3">Confirm Upload</h2>
          <p className="mb-2">
            📁 <strong>{selectedFileName}</strong>
          </p>
          <p className="mb-4">Files to upload: {pendingFiles.length}</p>

          <div className="flex justify-center gap-4">
            <button
              onClick={cancelUpload}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={startUpload}
              className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    );

  const DefaultActions = () => (
    <>
      {Btn({ disabled: buttonsDisabled, label: "New", onClick: onCreate })}
      {Btn({ disabled: !canEdit || buttonsDisabled, label: "Edit", onClick: onEdit })}
      {Btn({ disabled: !canDelete || buttonsDisabled, label: "Delete", onClick: () => onDelete?.() })}
      {onOpenImages &&
        Btn({ disabled: !canEdit || buttonsDisabled, label: "Images", onClick: onOpenImages })}

      {onUploadCSV && (
        <>
          {Btn({ disabled: buttonsDisabled, label: "Upload CSV", onClick: () => csvInputRef.current?.click() })}
          <input ref={csvInputRef} type="file" accept=".csv" onChange={(e) => onUploadCSV(e.target.files![0])} style={{ display: "none" }} />
        </>
      )}

      {onUploadFile && (
        <>
          {Btn({ disabled: !canEdit || buttonsDisabled, label: "Upload File(s)", onClick: () => fileInputRef.current?.click() })}
          <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} style={{ display: "none" }} />
          {uploadProgress > 0 && uploadTarget > 0 && (
            <div className="w-full mb-2 flex items-center justify-between gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.round((uploadProgress / uploadTarget) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-700 min-w-[50px] text-right">
                {uploadProgress}/{uploadTarget}
              </p>
            </div>
          )}
        </>
      )}
    </>
  );

  const EditActions = () => (
    <>
      {Btn({ disabled: buttonsDisabled, label: "Save", onClick: onSave })}
      {Btn({ disabled: buttonsDisabled, label: "Cancel", onClick: onCancel })}
    </>
  );

  const ImageActions = () => (
    <>
      {Btn({ disabled: !(canSetCover ?? false) || buttonsDisabled, label: "Set Cover", onClick: () => onSetCover?.() })}
      {Btn({ disabled: !(canDeleteImages ?? false) || buttonsDisabled, label: "Delete", onClick: () => onDelete?.() })}
      {Btn({ label: "Cancel", onClick: onCancel })}
    </>
  );

  return (
    <>
      <UploadConfirmModal />
      <div className="bg-white bg-opacity-80 rounded-2xl shadow-lg p-4 w-full md:w-64 flex flex-col items-stretch">
        <h2 className="text-lg font-bold text-center text-gray-800 mb-4">Actions</h2>
        <div className="flex flex-row md:flex-col gap-2 mb-4">
          {editMode ? <EditActions /> : imageMode ? <ImageActions /> : <DefaultActions />}
        </div>
        <div className="border-t border-gray-300 pt-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Go To:</p>
          {Btn({ disabled: buttonsDisabled, label: "Menu", onClick: () => navigate("/admin") })}
        </div>
      </div>
    </>
  );
}
