import axios from "axios";

import type { 
  TreeMode,
  TreeResponse,
  TreeResponseFamily,
  PersonRecord,
  PlaceRecord,
  PlaceOptions,
  CreateSimplePlaceRequest,
  CreateSimplePlaceResponse,
} from "../../types/familyTypes";

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
//  ----------------------------- Person -----------------------------------
//
export const getAllPersons = async (): Promise<PersonRecord[]> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/family/`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        //console.log("utils getAllPersons", data);
        return res.ok ? (data as PersonRecord[]) : [];
    } catch (err) {
        throw new Error(`getAllPersons error: ${err}`);
    }
};

export const createPerson = async (
    item: PersonRecord
): Promise<PersonRecord> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/family`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to create family person: ${errorText}`);
        }

        return await res.json();
    } catch (err) {
        throw new Error(`createPerson error: ${err}`);
    }
};

export const updatePerson = async (
    updatedRecord: PersonRecord
): Promise<PersonRecord> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/family/${   
        updatedRecord.grampsId
    }`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedRecord),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to update family person: ${errorText}`);
        }
        return await res.json();
    } catch (err) {
        throw new Error(`updatePerson error: ${err}`);
    }
};

/**
 * Deletes a family person record by its grmapsId.
 */
export const deletePerson = async (grampsId: string): Promise<void> => {
    if (!grampsId) throw new Error("grampsId is required for deletion.");

    const url = `${import.meta.env.VITE_BACKEND_URL}/family/place/${grampsId}`;

    try {
        const res = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to delete family person: ${errorText}`);
        }
    } catch (err) {
        throw new Error(`deletePerson error: ${err}`);
    }
};
//  ----------------------------- Place -----------------------------------
//
export const getAllPlaces = async (): Promise<PlaceRecord[]> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/family/place`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        //console.log("utils getAllPlaces", data);
        return res.ok ? (data as PlaceRecord[]) : [];
    } catch (err) {
        throw new Error(`getAllPlaces error: ${err}`);
    }
};

export const createPlace = async (
    item: PlaceRecord
): Promise<PlaceRecord> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/family/place`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to create place: ${errorText}`);
        }

        return await res.json();
    } catch (err) {
        throw new Error(`createPlace error: ${err}`);
    }
};

export const updatePlace = async (
    updatedRecord: PlaceRecord
): Promise<PlaceRecord> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/family/place/${
        updatedRecord.grampsId
    }`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedRecord),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to update place: ${errorText}`);
        }
        return await res.json();
    } catch (err) {
        throw new Error(`updatePlace error: ${err}`);
    }
};

export const deletePlace = async (grampsId: string): Promise<void> => {
    if (!grampsId) throw new Error("grampsId is required for deletion.");

    const url = `${import.meta.env.VITE_BACKEND_URL}/family/place/${grampsId}`;

    try {
        const res = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to delete place: ${errorText}`);
        }
    } catch (err) {
        throw new Error(`deletePlace error: ${err}`);
    }
};


export const searchFamilyPlaces = async (
  query: string
): Promise<PlaceRecord[]> => {
  const res = await axios.get(
    `${API_URL}/family/places/search?q=${encodeURIComponent(query)}`
  );

  return res.data.data;
};

export const createFamilyPlace = async (
  place: Partial<PlaceRecord>
): Promise<PlaceRecord> => {
  const res = await axios.post(`${API_URL}/family/places`, place);

  return res.data.data;
};

export const fetchFamilyPlaceOptions =
  async (): Promise<PlaceOptions> => {
    const res = await axios.get(`${API_URL}/family/places/options`);

    return res.data.data;
  };

export const createSimpleFamilyPlace = async (
  request: CreateSimplePlaceRequest
): Promise<CreateSimplePlaceResponse> => {
  const res = await axios.post(
    `${API_URL}/family/places/simple`,
    request
  );

  return res.data.data;
};
