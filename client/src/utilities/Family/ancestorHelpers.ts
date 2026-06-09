import type {
    TreeResponse,
    TreeResponseNode
} from "../../types/familyTypes";


export const isADescendantOf = (potentialDescendantHandle: string, ancestorHandle: string, data: TreeResponse): boolean => {
  const visited = new Set<string>();
  const toVisit = [potentialDescendantHandle];

  while (toVisit.length > 0) {
    const currentHandle = toVisit.pop()!;
    if (currentHandle === ancestorHandle) {
      return true;
    }
    visited.add(currentHandle);

    const parentFamilies = data.families?.filter((family) =>
      family.childHandles.includes(currentHandle)
    ) ?? [];

    parentFamilies.forEach((family) => {
      const parentHandles = [family.fatherHandle, family.motherHandle].filter(Boolean) as string[];
      parentHandles.forEach((parentHandle) => {
        if (!visited.has(parentHandle)) {
          toVisit.push(parentHandle);
        }
      });
    });
  }

  return false;
}

export const buildAncestorTree = (
  data: TreeResponse
): TreeResponseNode[] => {
  const selectedPersonHandle = data.selectedPerson.handle;

  const ancestorMap = new Map<string, TreeResponseNode[][number]>();

  const addAncestors = (personHandle: string, depth: number) => {
    if (depth > 6) return;
    //console.log("addAncestors called for:", personHandle, "at depth:", depth);

    const family = data.families?.find((family) =>
      family.childHandles.includes(personHandle)
    );
    //console.log("Fanily", family);
    if (!family) { return };

    const parentHandles = [
      family.fatherHandle,
      family.motherHandle,
    ].filter(Boolean) as string[];

    parentHandles.forEach((parentHandle) => {
      //console.log(`Processing parent handle: ${parentHandle} for child: ${personHandle}`);
      const person = data.nodes.find((node) => node.id === parentHandle);

      if (!person) { return; }

      const dummyPerson: TreeResponseNode[][number] = {
        id: `multiple-partner-${person.id}`,
        label: "Dummy",
        gender: person.gender === "M" ? "F" : "M",
        birthDate: "",
        deathDate: "",
        depth,
        noPartners: (depth === 0) ? person.noPartners : person.noPartners,
      };

      if (!ancestorMap.has(person.id)) {
        if (person.noPartners > 2) {
          // console.log("add dummy", dummyPerson);
          ancestorMap.set(dummyPerson.id, { ...dummyPerson, depth, });
        }
        ancestorMap.set(person.id, {
          ...person,
          depth,
        });
        //console.log(`Added ancestor: ${person.id} at depth: ${depth}`);
        addAncestors(parentHandle, depth + 1);
      } else {
        //console.log(`Already processed ancestor: ${person.id}, skipping.`);
        addAncestors(parentHandle, depth + 1);
      }
    });
  };

  addAncestors(selectedPersonHandle, 1);

  return Array.from(ancestorMap.values());
};
