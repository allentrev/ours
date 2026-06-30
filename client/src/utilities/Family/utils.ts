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
const modName = "/utilities/Family/utils/";

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
  console.log("utitlies/Family/utils/fetchTree backend response, res.data.data");
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
            console.error(`utilities/Family/utils/updatePerson Failed to update family person: ${errorText}`)
            throw new Error(`Failed to update family person: ${errorText}`);
        }
        return await res.json();
    } catch (err) {
      console.error(`utilities/Family/utils/updatePerson updatePerson error: ${err}`)  
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

export const outFormPhotoMarker = (url: string | undefined): string => {
    // this routine takes in the url from the database and 
    // if undefined returns "N", else it returns "Y" for display in the Maintain Entity List.
        if (url) {return "Y" }
        else { return "N"};
}
//  ----------------------------- Place -----------------------------------
//
export const getAllPlaces = async (): Promise<PlaceRecord[]> => {
    const funcName  = "getAllPlaces";
    const url = `${import.meta.env.VITE_BACKEND_URL}/family/place`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        console.log(`${modName}${funcName}, data`, data);
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
    console.log("utilities/Family/utils/updatePlace updatedRecord:", updatedRecord);
    const url = `${import.meta.env.VITE_BACKEND_URL}/family/place/${
        updatedRecord.handle
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

export const getPlaceName = (
  nameType: string,
  handle: string,
  places: PlaceRecord[],
  ): string => {
  
  const place = places.find(
    (item) => item.handle === handle
  );
  if (!place) { return "Not found"};
  switch (nameType) {
    case "short":
      return place.shortName;
      break;
    case "name":
      return place.name;
      break
    default:
      return place.displayPlace;
      break;
  }
};
/*
export const getPlaceName =
    handle: string,
    placeOptions: PlaceOptions
  ): string | undefined => {
  
    return placeOptions.urbanAreas.find(
      (place) => place.handle === handle
    )?.displayPlace;
};
*/