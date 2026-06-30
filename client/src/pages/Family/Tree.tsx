import { useEffect, useState } from "react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import { importGrampsFile } from "../../utilities/Family/utils";

import TreeLayout from "../../layouts/Family/TreeLayout";
import TreeViewer from "../../components/Family/TreeViewer";
import Search from "../../components/Family/Search";
import DetailsPanel from "../../components/Family/DetailsPanel";
import Toolbar from "../../components/Family/Toolbar";
import ImportStatusModal from "../../components/Family/ImportStatusModal";

import type {
  TreePerson,
  TreeMode,
} from "../../types/familyTypes";

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
}

type TransferAction = "import" | "export";

type TransferState = "idle" | "running" | "success" | "error";

interface TransferStatus {
  action: TransferAction;
  state: TransferState;
  message: string;
}

const MIN_PANEL_SIZE = 220;
const MAX_PANEL_SIZE = 600;

const Tree = () => {
  const modName = "/pages/Family/Tree/";
  const [selectedPersonHandle, setSelectedPersonHandle] = useState("");
  const [selectedPerson, setSelectedPerson] =
    useState<TreePerson | null>(null);

  const [mode, setMode] = useState<TreeMode>("descendants");
  const [refreshKey, setRefreshKey] = useState(0);  

  const [detailsOpen, setDetailsOpen] = useState(true);
  const [detailsSize, setDetailsSize] = useState(320);
  const [isDragging, setIsDragging] = useState(false);

  const [transferStatus, setTransferStatus] =
    useState<TransferStatus>({
      action: "import",
      state: "idle",
      message: "",
    });  
  
  const importing =
    transferStatus.action === "import" &&
    transferStatus.state === "running";

  const exporting =
    transferStatus.action === "export" &&
    transferStatus.state === "running";

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      const isDesktop = window.innerWidth >= 1024;

      if (isDesktop) {
        const newWidth = window.innerWidth - event.clientX;

        setDetailsSize(
          Math.min(Math.max(newWidth, MIN_PANEL_SIZE), MAX_PANEL_SIZE)
        );
      } else {
        const newHeight = window.innerHeight - event.clientY;

        setDetailsSize(
          Math.min(Math.max(newHeight, MIN_PANEL_SIZE), MAX_PANEL_SIZE)
        );
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);
    
  const handleImportGrampsFile = async (file: File) => {
    try {
      setTransferStatus({
        action: "import",
        state: "running",
        message: "",
      });

      const result = await importGrampsFile(file);

      setSelectedPersonHandle("");
      setRefreshKey((value) => value + 1);

      setTransferStatus({
        action: "import",
        state: "success",
        message:
          `Imported:\n` +
          `${result.mongoPeople} people\n` +
          `${result.mongoFamily} families\n` +
          `${result.mongoPlaces} places\n` +
          `${result.mongoNotes} notes`,
      });
    } catch (error) {
      console.error(error);

      setTransferStatus({
        action: "import",
        state: "error",
        message:
          "Import failed. Please check the Gramps file and try again.",
      });
    }
  };
  
  const handleCloseStatusModal = () => {
    setTransferStatus((current) => ({
      ...current,
      state: "idle",
      message: "",
    }));
  };

  const handleExportFamilyData = async () => {
    const funcName = "handleExportFamilyData";
    try {
      setTransferStatus({
        action: "export",
        state: "running",
        message: "",
      });

      if (!window.showDirectoryPicker) {
        throw new Error("Directory picker is not supported.");
      }

      const directoryHandle = await window.showDirectoryPicker();

      console.log(`${modName}${funcName} Selected export directory:`, directoryHandle);

      await new Promise((resolve) => setTimeout(resolve, 800));

      setTransferStatus({
        action: "export",
        state: "success",
        message:
          "Export folder selected. Export routine is not implemented yet.",
      });
    } catch (error) {
      console.error(error);

      setTransferStatus({
        action: "export",
        state: "error",
        message: "This feature is unavailable at the moment.",
      });
    }
  };

  return (
    <TreeLayout>
      <div className="w-full h-full flex flex-col">
        <Toolbar
          mode={mode}
          onModeChange={setMode}
          onImportGrampsFile={handleImportGrampsFile}
          onExportFamilyData={handleExportFamilyData}
          importing={importing}
          exporting={exporting}
        />
        <Search onSearch={setSelectedPersonHandle} />
        <ImportStatusModal
          action={transferStatus.action}
          running={transferStatus.state === "running"}
          message={
            transferStatus.state === "success"
              ? transferStatus.message
              : ""
          }
          error={
            transferStatus.state === "error"
              ? transferStatus.message
              : ""
          }
          onClose={handleCloseStatusModal}
        />
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          <div className="w-full lg:flex-1 h-[50vh] lg:h-full min-h-[300px] lg:min-h-0 shrink-0">
            <TreeViewer
              refreshKey={refreshKey}
              selectedPersonHandle={selectedPersonHandle}
              mode={mode}
              onSelectedPersonChange={setSelectedPerson}
              onPersonSelect={setSelectedPersonHandle}
            />
          </div>

          {detailsOpen ? (
            <>
              <div
                onMouseDown={() => setIsDragging(true)}
                className="
                  shrink-0
                  h-3 lg:h-full
                  w-full lg:w-3
                  bg-gray-300 hover:bg-gray-400
                  flex items-center justify-center
                  cursor-row-resize lg:cursor-col-resize
                "
              >
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  onMouseDown={(event) => event.stopPropagation()}
                  className="
                    text-xs
                    font-bold
                    select-none
                    hover:text-blue-600
                  "
                >
                  <span className="hidden lg:inline">
                    <ChevronRightIcon className="h-5 w-5" />
                  </span>
                  <span className="lg:hidden">
                    <ChevronDownIcon className="h-5 w-5" />
                  </span>
                </button>
              </div>

              <aside
                className="
                  shrink-0
                  bg-white
                  border-t lg:border-t-0 lg:border-l
                  overflow-hidden
                  w-full lg:w-auto
                  lg:h-full
                "
                style={{
                  width:
                    window.innerWidth >= 1024
                      ? `${detailsSize}px`
                      : undefined,
                  height:
                    window.innerWidth < 1024
                      ? `${detailsSize}px`
                      : undefined,
                }}
              >
                <div className="h-full w-full overflow-auto">
                  <div className="min-h-full w-full lg:h-full">
                    <DetailsPanel person={selectedPerson} />
                  </div>
                </div>
              </aside>
            </>
          ) : (
            <aside
              className="
                shrink-0
                bg-gray-300 hover:bg-gray-400
                flex items-center justify-center
                h-8 lg:h-full
                w-full lg:w-6
              "
            >
              <button
                type="button"
                aria-label="Show Detail Panel"
                onClick={() => setDetailsOpen(true)}
                className="
                  group
                  relative
                  text-xs
                  font-bold
                  select-none
                  hover:text-blue-600
                "
              >
                <span
                  className="
                    pointer-events-none
                    absolute
                    hidden lg:group-hover:block
                    whitespace-nowrap
                    rounded
                    bg-gray-800
                    px-2 py-1
                    text-xs
                    text-white
                    shadow
                    z-50
                    right-7
                    top-1/2
                    -translate-y-1/2
                  "
                >
                  Show Detail Panel
                </span>

                <span className="hidden lg:inline">
                  <ChevronLeftIcon className="h-5 w-5" />
                </span>

                <span className="lg:hidden">
                  <ChevronUpIcon className="h-5 w-5" />
                </span>
              </button>
            </aside>
          )}
        </div>
      </div>
    </TreeLayout>
  );
};

export default Tree;