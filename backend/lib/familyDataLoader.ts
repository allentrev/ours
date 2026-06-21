// backend/lib/familyDataLoader.ts

import path from "path";

import { parseGrampsFile } from "./grampsParser.js";
import { loadParsedFamilyDataFromDb } from "./familyTreeDBMapper.js";

import type { ParsedGrampsData } from "../types/family.types.js";

type FamilyDataSource = "db" | "gramps";

export const loadParsedFamilyData =
  async (): Promise<ParsedGrampsData> => {
    const source =
      (process.env.FAMILY_DATA_SOURCE as FamilyDataSource) ?? "db";

    if (source === "gramps") {
      const filePath = path.join(
        process.cwd(),
        "test-data",
        "test4.gramps"
      );

      return parseGrampsFile(filePath);
    }

    return loadParsedFamilyDataFromDb();
  };