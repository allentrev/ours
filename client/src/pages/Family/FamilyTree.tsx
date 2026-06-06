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

        <div className="flex-1 flex min-h-0">
          <div className="flex-1">
            <FamilyTreeViewer
              selectedPersonHandle={selectedPersonHandle}
              mode={mode}
              onSelectedPersonChange={setSelectedPerson}
              onPersonSelect={setSelectedPersonHandle}
            />
          </div>

          <FamilyDetailsPanel person={selectedPerson} />
        </div>
      </div>
    </FamilyTreeLayout>
  );
};

export default FamilyTree;