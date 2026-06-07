import { useState } from "react";

import FamilyTreeLayout from "../../layouts/FamilyTreeLayout";
import FamilyTreeViewer from "../../components/Family/FamilyTreeViewer";
import FamilySearch from "../../components/Family/FamilySearch";
import FamilyDetailsPanel from "../../components/Family/FamilyDetailsPanel";
import FamilyToolbar from "../../components/Family/FamilyToolbar";

import type {
  FamilyPerson,
  FamilyTreeMode,
} from "../../types/familyTypes";

const FamilyTree = () => {
  const [selectedPersonHandle, setSelectedPersonHandle] = useState("");
  const [selectedPerson, setSelectedPerson] =
    useState<FamilyPerson | null>(null);

  const [mode, setMode] =
    useState<FamilyTreeMode>("descendants");

  return (
    <FamilyTreeLayout>
      <div className="w-full h-full flex flex-col">
        <FamilyToolbar mode={mode} onModeChange={setMode} />
        <FamilySearch onSearch={setSelectedPersonHandle} />

          <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-4 overflow-y-auto lg:overflow-hidden">
            <div className="w-full lg:flex-1 h-[55vh] lg:h-full min-h-[350px] shrink-0">
            <FamilyTreeViewer
              selectedPersonHandle={selectedPersonHandle}
              mode={mode}
              onSelectedPersonChange={setSelectedPerson}
              onPersonSelect={setSelectedPersonHandle}
            />
          </div>

          <div className="w-full lg:w-80 lg:h-full">
            <FamilyDetailsPanel person={selectedPerson} />
          </div>
        </div>
      </div>
    </FamilyTreeLayout>
  );
};

export default FamilyTree;