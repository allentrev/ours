import { useState, useCallback } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

type Options = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Options | null>(null);
  const [resolvePromise, setResolvePromise] = useState<
    ((result: boolean) => void) | null
  >(null);

  const confirm = useCallback((opts: Options): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise?.(false);
  };

  const dialog = options ? (
    <ConfirmDialog
      open={isOpen}
      title={options.title}
      message={options.message}
      confirmLabel={options.confirmLabel}
      cancelLabel={options.cancelLabel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, dialog };
}
