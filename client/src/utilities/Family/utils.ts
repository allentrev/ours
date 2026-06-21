import axios from "axios";

import type { TreeMode, TreeResponse, TreeResponseFamily } from "../../types/familyTypes";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const searchFamilyPeople = async (
  query: string
) => {
  const res = await axios.get(
    `${API_URL}/family/search?q=${encodeURIComponent(query)}`
  );

  return res.data.data;
};

export const fetchTree = async (
  personHandle?: string,
  mode: TreeMode = "descendants"
): Promise<TreeResponse> => {
  const params = new URLSearchParams();

  if (personHandle) {
    params.set("personHandle", personHandle);
  }

  params.set("mode", mode);

  const res = await axios.get(
    `${API_URL}/family/tree?${params.toString()}`
  );
  console.log("Family tree response from familyUtils:");
  console.log(res.data.data)
  return res.data.data;
};

export const getDisplayNodeId = (
  personHandle: string,
  selectedPersonHandle: string,
  familyId: string,
  useExpandedLayout: boolean
) => {
  // --------------------------------------------------
  // Helper function for relationship nodes:
  //
  // --------------------------------------------------    
  if (
    useExpandedLayout &&
    personHandle === selectedPersonHandle
  ) {
    return `${personHandle}::${familyId}`;
  }

  return personHandle;
};

export const getFamilyId = (
  personHandle: string,
  selectedFamilies: TreeResponseFamily[] | undefined
) => {
  const result = selectedFamilies?.find( item =>
     (item.fatherHandle === personHandle || item.motherHandle === personHandle) )?.id;

  return result ? result : "";   
};

export const importGrampsFile = async (file: File) => {
  const formData = new FormData();

  formData.append("grampsFile", file);

  const res = await axios.post(
    `${API_URL}/family/import/gramps`,
    formData
  );

  return res.data.data;
};