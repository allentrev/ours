import axios from "axios";

import type {
  TreeMode,
  TreeResponse,
  TreeResponseFamily,
  PersonRecord,
  PlaceRecord,
  PersonActorData,
  NoteRecord,
  FamilyRecord,
  PlaceOptions,
  CreateSimplePlaceRequest,
  CreateSimplePlaceResponse,
  CreateRelatedPersonRequest,
  CreateRelatedPersonResponse,
  NewNoteInput,
  FamilyDetailsData,
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
  //console.log("utitlies/Family/utils/fetchTree backend response, res.data.data");
  //console.log(res.data.data)
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
  const result = selectedFamilies?.find(item =>
    (item.fatherHandle === personHandle || item.motherHandle === personHandle))?.id;

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
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/person`;

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

export const readPersonRelationships = async (
  personId: string
): Promise<PersonActorData> => {
  const funcName = "readPersonRelationships";

  const url =
    `${import.meta.env.VITE_BACKEND_URL}` +
    `/family/person/${encodeURIComponent(personId)}/relationships`;

  try {
    const res = await fetch(url, {
      method: "GET",
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(
        result.message ??
        `Request failed with status ${res.status}`
      );
    }

    return result.data as PersonActorData;
  } catch (err) {
    throw new Error(
      `${modName}${funcName} catch error: ${err instanceof Error
        ? err.message
        : String(err)
      }`
    );
  }
};

export const createPerson = async (
  person: Partial<PersonRecord>,
  newNotes: NewNoteInput[] = [],
  token: string | null,
): Promise<PersonRecord> => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/person`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ person, newNotes }),
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

export const readPerson = async (
  personId: string
): Promise<PersonRecord> => {
  const res = await axios.get(
    `${API_URL}/family/person/${encodeURIComponent(personId)}`
  );

  return res.data.data;
};

export const updatePerson = async (
  person: Partial<PersonRecord>,
  newNotes: NewNoteInput[] = [],
  token: string | null,
): Promise<PersonRecord> => {
  const funcName = "/utilities/Family/utils/updatePerson";
  const personId = person.handle || "";

  const url = `${import.meta.env.VITE_BACKEND_URL}/family/person/${encodeURIComponent(personId)}`;
  console.log(`${funcName} person,newnotes, token`, person, newNotes, token);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ person, newNotes }),
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

export const deletePerson = async (
  personId: string,
  token: string | null
): Promise<void> => {
  if (!personId) throw new Error("PersonId is required for deletion.");

  const url = `${import.meta.env.VITE_BACKEND_URL}/family/person/${encodeURIComponent(personId)}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete family person: ${errorText}`);
    }
  } catch (err) {
    throw new Error(`deletePerson error: ${err}`);
  }
};

export const createRelatedPerson = async (
  input: CreateRelatedPersonRequest,
  token: string
): Promise<CreateRelatedPersonResponse> => {
  const funcName = "createRelatedPerson";
  console.log(`${modName}${funcName}`, token);
  const url =
    `${import.meta.env.VITE_BACKEND_URL}` +
    "/family/person/relationship";


  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    const data = await response.json();
    console.log(`${modName}${funcName} data from fetch is ${data}`);

    if (!response.ok) {
      throw new Error(
        data.message ??
        `Request failed with status ${response.status}`
      );
    }

    return data as CreateRelatedPersonResponse;
  } catch (error) {
    throw new Error(
      `${modName}${funcName} catch error: ${error}`
    );
  }
};

export const outFormPhotoMarker = (url: string | undefined): string => {
  // this routine takes in the url from the database and 
  // if undefined returns "N", else it returns "Y" for display in the Maintain Entity List.
  if (url) { return "Y" }
  else { return "N" };
}
//  ----------------------------- Family -----------------------------------
//
export const getAllFamilies = async (): Promise<FamilyRecord[]> => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/family`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    //console.log("utils getAllFamilies", data);
    return res.ok ? (data as FamilyRecord[]) : [];
  } catch (err) {
    throw new Error(`getAllFamilies error: ${err}`);
  }
};

export const createFamily = async (
  item: FamilyRecord,
  token: string | null,
): Promise<FamilyRecord> => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/family`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create family: ${errorText}`);
    }

    return await res.json();
  } catch (err) {
    throw new Error(`createFamily error: ${err}`);
  }
};

export const readFamily = async (
  familyHandle: string
): Promise<FamilyDetailsData> => {
  const funcName = "readFamily";

  const url =
    `${import.meta.env.VITE_BACKEND_URL}/family/family/${familyHandle}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message ??
          "Failed to read family."
      );
    }

    return data.data as FamilyDetailsData;
  } catch (err) {
    throw new Error(
      `${modName}${funcName}: ${err}`
    );
  }
};

export const updateFamily = async (
  updatedRecord: FamilyRecord,
  token: string,
): Promise<FamilyRecord> => {
  console.log("utilities/Family/utils/updateFamily updatedRecord:", updatedRecord);
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/family/${updatedRecord.handle
    }`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updatedRecord),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update family: ${errorText}`);
    }
    const response = await res.json();
    return response.data as FamilyRecord;
  } catch (err) {
    throw new Error(`updateFamily error: ${err}`);
  }
};

export const deleteFamily = async (
  handle: string,
  token: string | null
): Promise<void> => {
  if (!handle) throw new Error("Handle is required for deletion.");

  const url = `${import.meta.env.VITE_BACKEND_URL}/family/family/${encodeURIComponent(handle)}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete family: ${errorText}`);
    }
  } catch (err) {
    throw new Error(`deleteFamily error: ${err}`);
  }
};

//  ----------------------------- Place -----------------------------------
//
export const getAllPlaces = async (): Promise<PlaceRecord[]> => {
  //const funcName  = "getAllPlaces";
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/place`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    //console.log(`${modName}${funcName}, data`, data);
    return res.ok ? (data as PlaceRecord[]) : [];
  } catch (err) {
    throw new Error(`getAllPlaces error: ${err}`);
  }
};

export const createPlace = async (
  item: PlaceRecord,
  token: string | null,
): Promise<PlaceRecord> => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/place`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
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
  updatedRecord: PlaceRecord,
  token: string | null,
): Promise<PlaceRecord> => {
  console.log("utilities/Family/utils/updatePlace updatedRecord:", updatedRecord);
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/place/${updatedRecord.handle
    }`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
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

export const deletePlace = async (
  handle: string,
  token: string | null
): Promise<void> => {
  if (!handle) throw new Error("Handle is required for deletion.");

  const url = `${import.meta.env.VITE_BACKEND_URL}/family/place/${encodeURIComponent(handle)}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
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

//TODO: this can be removed alongwith controller and router
export const createFamilyPlace = async (
  place: PlaceRecord,
  token: string | null,
): Promise<PlaceRecord> => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/places`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(place),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create family place: ${errorText}`);
    }

    return await res.json();
  } catch (err) {
    throw new Error(`createFamilyPlace error: ${err}`);
  }
};

export const fetchFamilyPlaceOptions = async (): Promise<PlaceOptions> => {
  const funcName  = "fetchFamilyPlaceOptions";
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/places/options`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    return data.data;
  } catch (err) {
    throw new Error(`${funcName} catch error: ${err}`);
  }
};

export const createSimpleFamilyPlace = async (
  request: CreateSimplePlaceRequest,
  token: string | null,
): Promise<CreateSimplePlaceResponse> => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/places/simple`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create simple family place: ${errorText}`);
    }

    return await res.json();
  } catch (err) {
    throw new Error(`createSimpleFamilyPlace error: ${err}`);
  }
};

export const getPlaceName = (
  nameType: string,
  handle: string,
  places: PlaceRecord[],
): string => {

  const place = places.find(
    (item) => item.handle === handle
  );
  if (!place) { return "Not found" };
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

//  ----------------------------- Note -----------------------------------
//
export const getAllNotes = async (): Promise<NoteRecord[]> => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/note`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    //console.log("utils getAllNotes", data);
    return res.ok ? (data as NoteRecord[]) : [];
  } catch (err) {
    throw new Error(`getAllNotes error: ${err}`);
  }
};

export const createNote = async (
  item: NoteRecord,
  token: string | null,
): Promise<NoteRecord> => {
  const funcName = "/utilities/Family/utils/createNote";
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/note`;
  if (!token) {
    throw new Error("Token is required to create a note.");
  }
  console.log("util", token);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create note: ${errorText}`);
    }

    return await res.json();
  } catch (err) {
    throw new Error(`${funcName} catch error: ${err}`);
  }
};

export const readNote = async (
  handle: string
): Promise<NoteRecord> => {
  const res = await axios.get(
    `${API_URL}/family/note/${encodeURIComponent(handle)}`
  );

  return res.data.data;
};

export const updateNote = async (
  updatedRecord: NoteRecord,
  token: string | null,
): Promise<NoteRecord> => {
  //console.log("utilities/Family/utils/updateNote updatedRecord:", updatedRecord);
  const url = `${import.meta.env.VITE_BACKEND_URL}/family/note/${updatedRecord.handle
    }`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updatedRecord),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update note: ${errorText}`);
    }
    return await res.json();
  } catch (err) {
    throw new Error(`updateNote error: ${err}`);
  }
};

export const deleteNote = async (
  handle: string,
  token: string | null
): Promise<void> => {
  if (!handle) throw new Error("Handle is required for deletion.");

  const url = `${import.meta.env.VITE_BACKEND_URL}/family/note/${encodeURIComponent(handle)}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete note: ${errorText}`);
    }
  } catch (err) {
    throw new Error(`deleteNote error: ${err}`);
  }
};
