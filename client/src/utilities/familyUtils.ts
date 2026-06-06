import axios from "axios";

import type { FamilyTreeMode, FamilyTreeResponse } from "../types/familyTypes";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const searchFamilyPeople = async (
  query: string
) => {
  const res = await axios.get(
    `${API_URL}/family/search?q=${encodeURIComponent(query)}`
  );

  return res.data.data;
};

export const fetchFamilyTree = async (
  personHandle?: string,
  mode: FamilyTreeMode = "descendants"
): Promise<FamilyTreeResponse> => {
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