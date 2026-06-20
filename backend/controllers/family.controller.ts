import path from "path";
import type { Request, Response } from "express";

import { parseGrampsFile } from "../lib/grampsParser.js";
import { mapFamilyTreeData } from "../lib/familyTreeMapper.js";
import {
  buildAncestorTree,
  buildDescendantTree,
} from "../services/familyTree.service.js";

export const getFamilyTree = async (req: Request, res: Response) => {
  try {
    //const filePath = path.join(process.cwd(), "test-data", "data.gramps");
    const filePath = path.join(process.cwd(), "test-data", "test4.gramps");

    const parsed = await parseGrampsFile(filePath);
    const mapped = mapFamilyTreeData(parsed);

    const personHandle =
      typeof req.query.personHandle === "string"
        ? req.query.personHandle
        : undefined;
    const startPerson =
      mapped.people.find((person) => person.handle === personHandle) ??
      mapped.people[mapped.people.length - 1];

    const mode =
      req.query.mode === "ancestors" ? "ancestors" : "descendants";

    const tree =
      mode === "ancestors"
        ? buildAncestorTree(mapped, startPerson.handle)
        : buildDescendantTree(mapped, startPerson.handle);

    return res.status(200).json({
      success: true,
      message: "Family tree retrieved successfully",
      data: {
        selectedPerson: startPerson,
        ...tree,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve family tree",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const searchFamilyPeople = async (
  req: Request,
  res: Response
) => {
  try {
    const query =
      typeof req.query.q === "string"
        ? req.query.q.trim().toLowerCase()
        : "";

    const filePath = path.join(
      process.cwd(),
      "test-data",
      "test4.gramps"
    );

    const parsed = await parseGrampsFile(filePath);

    const mapped = mapFamilyTreeData(parsed);

    console.log("People parsed:", mapped.people.length);
    console.log(
      mapped.people
        .filter((person) =>
          person.displayName.toLowerCase().includes("janet")
        )
        .map((person) => person.displayName)
    );

    const results = mapped.people
      .filter((person) =>
        person.displayName.toLowerCase().includes(query)
      )
      .slice(0, 20);

    return res.status(200).json({
      success: true,
      message: "Family people retrieved successfully",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search family people",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};