import path from "path";

import { parseGrampsFile } from "./grampsParser.js";
import { mapFamilyTreeData } from "./familyTreeMapper.js";

import {
  buildAncestorTree,
  buildDescendantTree,
} from "../services/familyTree.service.js";

const run = async () => {
  const filePath = path.join(process.cwd(), "test-data", "data.gramps");

  const parsed = await parseGrampsFile(filePath);

  const mapped = mapFamilyTreeData(parsed);

  const testPerson = mapped.people[0];

  console.log(`\nSelected person: ${testPerson.displayName}`);

  const ancestors = buildAncestorTree(mapped, testPerson.handle);

  console.log("\nAncestor tree:");
  console.log(`Nodes: ${ancestors.nodes.length}`);
  console.log(`Edges: ${ancestors.edges.length}`);

  console.table(ancestors.nodes);

  const descendants = buildDescendantTree(
    mapped,
    testPerson.handle
  );

  console.log("\nDescendant tree:");
  console.log(`Nodes: ${descendants.nodes.length}`);
  console.log(`Edges: ${descendants.edges.length}`);

  console.table(descendants.nodes);
};

run().catch(console.error);