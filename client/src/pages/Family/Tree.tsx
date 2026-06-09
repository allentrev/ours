import { useState } from "react";

import TreeLayout from "../../layouts/Family/TreeLayout";
import TreeViewer from "../../components/Family/TreeViewer";
import Search from "../../components/Family/Search";
import DetailsPanel from "../../components/Family/DetailsPanel";
import Toolbar from "../../components/Family/Toolbar";

import type {
  TreePerson,
  TreeMode,
} from "../../types/familyTypes";

const Tree = () => {
  const [selectedPersonHandle, setSelectedPersonHandle] = useState("");
  const [selectedPerson, setSelectedPerson] =
    useState<TreePerson | null>(null);

  const [mode, setMode] =
    useState<TreeMode>("descendants");
  console.log("Tree Page");
  return (
    <TreeLayout>
      <div className="w-full h-full flex flex-col "> {/* this is the main panel div */}
        <Toolbar mode={mode} onModeChange={setMode} />
        <Search onSearch={setSelectedPersonHandle} />

          <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-4 overflow-y-auto lg:overflow-hidden">
            <div className="w-full lg:flex-1 h-[55vh] lg:h-full min-h-[350px] shrink-0">
            <TreeViewer
              selectedPersonHandle={selectedPersonHandle}
              mode={mode}
              onSelectedPersonChange={setSelectedPerson}
              onPersonSelect={setSelectedPersonHandle}
            />
          </div>

          <div className="w-full lg:w-80 lg:h-full">
            <DetailsPanel person={selectedPerson} />
          </div>
        </div>
      </div>
    </TreeLayout>
  );
};

export default Tree;