import path from "path";
import { parseGrampsFile } from "./grampsParser.js";
import { mapFamilyTreeData } from "./familyTreeMapper.js";

const run = async () => {
  const filePath = path.join(process.cwd(), "test-data", "test4.gramps");

  console.log(`Loading file: ${filePath}`);

  const parsedData = await parseGrampsFile(filePath);

  const mappedData = mapFamilyTreeData(parsedData);

  console.log(`\nPeople found: ${mappedData.people.length}`);
  console.log(
    `Relationships found: ${mappedData.relationships.length}`
  );

  console.log("\nFirst 10 people:");
  console.table(mappedData.people.slice(0, 100));

  console.log("\nFirst 20 relationships:");
  console.table(mappedData.relationships.slice(0, 2));
};

run().catch((error) => {
  console.error("\nParser failed:");
  console.error(error);
});