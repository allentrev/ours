import type {
    TreeResponse,
    TreeResponseNode,
    TreeResponseFamily,
    TreeMode,
} from "../../types/familyTypes";

import type {
  TwoPartnerResult,
  MultiPartnerSpouseMapEntry
} from "../../utilities/Family/layoutTypes";
 
import { isADescendantOf } from "./ancestorHelpers";

export const getSpouseNodesForPerson = (
  personHandle: string,
  data: TreeResponse,
  depth: number
): TreeResponseNode[] => {
  const spouseHandles =
    data.families
      ?.filter(
        (family) =>
          family.fatherHandle === personHandle ||
          family.motherHandle === personHandle
      )
      .map((family) =>
        family.fatherHandle === personHandle
          ? family.motherHandle
          : family.fatherHandle
      )
      .filter((handle): handle is string => Boolean(handle)) ?? [];

  const uniqueSpouseHandles = [...new Set(spouseHandles)];

  if (uniqueSpouseHandles.length > 2) {
    const person = data.nodes.find((node) => node.id === personHandle);

    return [
      {
        id: `multiple-partner-${personHandle}`,
        label: "Dummy",
        gender: person?.gender === "M" ? "F" : "M",
        birthDate: "",
        deathDate: "",
        depth,
        noPartners: uniqueSpouseHandles.length,
      },
    ];
  }
  // else return either 0,1 or 2 spouse nodes
  return uniqueSpouseHandles
    .map((spouseHandle) => {
      const spouse = data.nodes.find((node) => node.id === spouseHandle);

      if (!spouse) return null;

      return {
        ...spouse,
        depth,
      };
    })
    .filter((node): node is TreeResponseNode => node !== null);
};


export function getMultiPartnerSpouseMap(
  data: TreeResponse,
  mode: TreeMode
): MultiPartnerSpouseMapEntry[] {
  const { nodes, families, selectedPerson } = data;

  return nodes
    .filter((node) => node.noPartners > 2)
    .map((node) => {
      const partnerHandle = node.id;

      const otherSpouseIds =
        families
          ?.filter(
            (family) =>
              family.fatherHandle === partnerHandle ||
              family.motherHandle === partnerHandle
          )
          .map((family) =>
            family.fatherHandle === partnerHandle
              ? family.motherHandle
              : family.fatherHandle
          )
          .filter((otherHandle): otherHandle is string => {
            if (!otherHandle) return false;

            if (mode === "ancestors") {
              return !isADescendantOf(
                selectedPerson.handle,
                otherHandle,
                data
              );
            }

            return true;
          }) ?? [];

      return {
        [partnerHandle]: [...new Set(otherSpouseIds)],
      };
    });
}



export const manageTwoPartnerPersons = (
  visibleWorkNodes: TreeResponseNode[],
  visibleFamilies: TreeResponseFamily[] | undefined,
  visibleworkNodeIds: Set<string>,
  initialNodes: TreeResponseNode[],
): TwoPartnerResult => {
  // --------------------------------------------------
  // Any visible person with exactly 2 partners
  //
  // Layout:
  //
  // Spouse1 ─ Person ─ Spouse2
  //
  // Applies in BOTH ancestor and descendant mode
  //
  // The resultant node array will only contain one instance of the persons involved in these relationships
  // --------------------------------------------------
  // console.log("manageTwoPartnerPersons")
  // GET ARRAY OF PERSONS WITH = 2 PARTNER
  const twoPartnerArray = visibleWorkNodes.filter(        // array of person nodes with 2 spouses
    (node) =>
      //node.id !== selectedPersonHandle &&
      Number(node.noPartners ?? 0) === 2
  );
  // console.log("Persons with 2 partners:", twoPartnerArray);
  // for each person with 2 partners, find their families and reposition spouses if both are visible
  twoPartnerArray.forEach((personNode) => {
    const personHandle = personNode.id;

    const personFamilies = visibleFamilies?.filter(     // get their families
      (family) =>
        family.fatherHandle === personHandle ||
        family.motherHandle === personHandle
    );

    if (personFamilies && personFamilies.length !== 2) return;
    //console.log("PersonFamilies2:", personFamilies);

    // Get spouse handles
    const spouseHandles = personFamilies?.map((family) =>
      family.fatherHandle === personHandle
        ? family.motherHandle
        : family.fatherHandle
    );
    //console.log("Spouse nodes for person with 2 partners:", spouseHandles);
    const spouse1Handle = spouseHandles?.[0];
    const spouse2Handle = spouseHandles?.[1];
    // Remove these node fom visibleWorkNodes if they are there, we will add them back after repositioning
    const spouse1 = initialNodes.find((node) => node.id === spouse1Handle);
    const spouse2 = initialNodes.find((node) => node.id === spouse2Handle);
    const insertionArray = [spouse1, personNode, spouse2].filter(Boolean) as typeof initialNodes;

    //console.log("Spouse 1 node:", spouse1);
    //console.log("Spouse 2 node:", spouse2);

    //remove spouses
    visibleWorkNodes = visibleWorkNodes.filter(
      (node) =>
        node.id !== spouse1Handle && node.id !== spouse2Handle
    );
    visibleworkNodeIds.delete(spouse1Handle!);
    visibleworkNodeIds.delete(spouse2Handle!);

    const insertionPoint = visibleWorkNodes.findIndex(
      (node) => node.id === personHandle
    );
    //console.log("Insertion point for 2-partner person:", insertionPoint);

    //console.log("Visible work nodes after removing spouses for 2-partner person:", visibleWorkNodes);

    const leftHandArray = visibleWorkNodes.slice(0, insertionPoint);
    const rightHandArray = visibleWorkNodes.slice(insertionPoint + 1);
    //console.log("Left hand array:", leftHandArray);
    //console.log("Right hand array:", rightHandArray);

    visibleWorkNodes = [...leftHandArray, ...insertionArray, ...rightHandArray];
    //console.log("Visible work nodes after adding back 2-partner person and spouses:", visibleWorkNodes);

    visibleworkNodeIds = new Set(
      visibleWorkNodes.map((node) => node.id)
    );
  })
  return { visibleWorkNodes, visibleworkNodeIds };
}
