import mongoose, { Document, HydratedDocument } from "mongoose";

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
  primaryPhotoMediaHandle?: string;
}

export interface PersonDocument extends RawGrampsPerson {
  deceased: boolean;
  primaryPhotoUrl?: string;
  thumbnailUrl?: string;
  importBatchId?: mongoose.Types.ObjectId;
}

export interface RawGrampsFamily {
  handle: string;
  grampsId?: string;
  fatherHandle?: string;
  motherHandle?: string;
  childHandles: string[];
  relationshipType:string;
  relationshipDate?: string;
  relationshipPlaceHandle?: string;
  noteHandles?: string[];
  mediaHandles?: string[];
}

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

export interface RawGrampsNote {
  handle: string;
  grampsId?: string;
  text: string;
  type?: string;
}

export interface RawGrampsMedia {
  handle: string;
  grampsId?: string;
  title?: string;
  path?: string;
  mimeType?: string;
  description?: string;
}

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
  noPartners:number
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

export interface FamilyDocument extends Document {
    handle: string;
    grampsId: string;

    fatherHandle?: string;
    motherHandle?: string;
    childHandles?: string[];

    relationshipType?: string; 
    relationshipDate?: string;
    relationshipPlaceHandle?: string;

    mediaHandles?: string[];
    noteHandles?: string[];

    importBatchId?: mongoose.Types.ObjectId;
}

export interface Place {
    handle: string;
    grampsId: string;
    type: string;
    line1?: string;
    line2?: string;
    urbanArea?: string;
    county?: string;
    country?: string[];
    code?: string;
    name: string;
    shortName: string;
    displayPlace: string;
    latitude?: number;
    longitude?: number;
    noteHandles?: string[];

    importBatchId?: mongoose.Types.ObjectId; 
}

export type PlaceDocument = HydratedDocument<Place>;

export interface NoteDocument extends Document {
    handle: string;
    grampsId: string;
    
    text: string;
    type?: string;

    importBatchId?: mongoose.Types.ObjectId;
}

export interface MediaDocument extends Document {
    handle: string;

    title?: string;
    path?: string;
    mimeType?: string;

    cdnUrl?: string;
    thumbnailUrl?: string;

    noteHandles?: string[];

    importBatchId?: string; 
}

export interface ImportBatchDocument extends Document {
    source: string;
    filename: string;

    peopleCount: number;
    familyCount: number;
    placeCount: number;
    noteCount: number;
    mediaCount: number;
 }
