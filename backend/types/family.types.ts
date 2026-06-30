import mongoose, { HydratedDocument } from "mongoose";

export type FamilyRecordOrigin = "gramps" | "local";

export interface LocalRecordFields {
  origin: FamilyRecordOrigin;
  localId?: string;
}

export interface ImportBatchRef {
  importBatchId?: mongoose.Types.ObjectId;
}
//  ------------------------------------- Person -----------------------------
//
export interface RawGrampsPerson {
  handle: string;
  grampsId: string;
  gender?: string;
  firstName?: string;
  surname?: string;
  displayName: string;
  birthDate?: string;
  deathDate?: string;
  birthPlaceHandle?: string;
  deathPlaceHandle?: string;
  noteHandles?: string[];
  mediaHandles?: string[];
  primaryPhotoUrl?: string;
}

export interface PersonRecord
  extends RawGrampsPerson,
    LocalRecordFields,
    ImportBatchRef {
      deceased: boolean;
      thumbnailUrl?: string;
    }

export type PersonDocument = HydratedDocument<PersonRecord>;
//  ------------------------------------- Family -----------------------------
//
export interface RawGrampsFamily {
  handle: string;
  grampsId?: string;
  fatherHandle?: string;
  motherHandle?: string;
  childHandles: string[];
  relationshipType: string;
  relationshipDate?: string;
  relationshipPlaceHandle?: string;
  noteHandles?: string[];
  mediaHandles?: string[];
}
export interface FamilyRecord
  extends RawGrampsFamily,
    LocalRecordFields,
    ImportBatchRef {grampsId: string}

export type FamilyDocument = HydratedDocument<FamilyRecord>;
//  ------------------------------------- Place -----------------------------
//
export interface RawGrampsPlace {
  handle: string;
  grampsId?: string;
  type: string;
  line1?: string;
  line2?: string;
  urbanArea?: string;     // village | town | city
  county?: string;       // county | region
  country?: string[]; 
  code?: string;
  displayPlace: string;
  name: string;
  shortName: string;
  geoPlace?: string;
  latitude?: number;
  longitude?: number;
  noteHandles?: string[];
}
export interface PlaceRecord
  extends RawGrampsPlace,
    LocalRecordFields,
    ImportBatchRef {grampsId: string}

export type PlaceDocument = HydratedDocument<PlaceRecord>;

//  ------------------------------------- Note -----------------------------
//
export interface RawGrampsNote {
  handle: string;
  grampsId?: string;
  text: string;
  type?: string;
}
export interface NoteRecord
  extends RawGrampsNote,
    LocalRecordFields,
    ImportBatchRef {grampsId: string}

export type NoteDocument = HydratedDocument<NoteRecord>;

//  ------------------------------------- Media -----------------------------
//
export interface RawGrampsMedia {
  handle: string;
  grampsId?: string;
  title?: string;
  path?: string;
  mimeType?: string;
  description?: string;
}

export interface MediaRecord
  extends RawGrampsMedia,
    LocalRecordFields,
    ImportBatchRef {
      grampsId: string;
      thumbnailUrl?: string;
      noteHandles?: string[];
    }

export type MediaDocument = HydratedDocument<MediaRecord>;

//  ------------------------------------- Import Batch -----------------------------
//
export interface ImportBatchRecord {
    source: string;
    filename: string;

    peopleCount: number;
    familyCount: number;
    placeCount: number;
    noteCount: number;
    mediaCount: number;
 }

export type ImportBatchDocument = HydratedDocument<ImportBatchRecord>;

//  ------------------------------------- Other -----------------------------
//
export interface ParsedGrampsData {
  people: RawGrampsPerson[];
  families: RawGrampsFamily[];
  places: RawGrampsPlace[];
  notes: RawGrampsNote[];
  media: RawGrampsMedia[];
}

export interface RawRelationship {
  fromHandle: string;
  toHandle: string;
  relationshipType: "parent" | "child" | "spouse";
}

export interface MappedFamilyData {
  people: RawGrampsPerson[];
  relationships: RawRelationship[];
  families: FamilyGroup[];
}

export interface FamilyTreeNode {
  id: string;
  label: string;
  gender?: string;
  birthDate?: string;
  deathDate?: string;
  depth: number;
  noPartners: number
}

export interface FamilyTreeEdge {
  source: string;
  target: string;
  relationshipType: "parent" | "child" | "spouse";
}

export interface FamilyTreeResponse {
  nodes: FamilyTreeNode[];
  edges: FamilyTreeEdge[];
  families?: FamilyGroup[];
}

export interface FamilyGroup {
  id: string;
  fatherHandle?: string;
  motherHandle?: string;
  childHandles: string[];
}
