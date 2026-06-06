import {
  FamilyTreeEdge,
  FamilyTreeNode,
  FamilyTreeResponse,
  MappedFamilyData,
  RawRelationship,
} from "../types/family.types.js";

//--------------------------------------------------------------------------
// Helpfunctions
//--------------------------------------------------------------------------
const findPersonByHandle = (
  people: MappedFamilyData["people"],
  handle: string
) => {
  return people.find((person) => person.handle === handle);
};

const getNoPartners = (
  relationships: MappedFamilyData["relationships"],
  handle: string
) => {
  const partnerHandles = relationships
    .filter(
      (relationship) =>
        relationship.relationshipType === "spouse" &&
        relationship.fromHandle === handle
    )
    .map((relationship) => relationship.toHandle);

  return new Set(partnerHandles).size;
};

const createNode = (
  data: MappedFamilyData,
  handle: string,
  depth: number
): FamilyTreeNode | null => {
  const person = findPersonByHandle(data.people, handle);

  if (!person) return null;

  return {
    id: person.handle,
    label: person.displayName,
    gender: person.gender,
    birthDate: person.birthDate,
    deathDate: person.deathDate,
    depth,
    noPartners: getNoPartners(data.relationships, handle),
  };
};

const addNodeIfMissing = (
  nodes: FamilyTreeNode[],
  node: FamilyTreeNode
) => {
  const exists = nodes.some((n) => n.id === node.id);

  if (!exists) {
    nodes.push(node);
  }
};

const addEdgeIfMissing = (
  edges: FamilyTreeEdge[],
  edge: FamilyTreeEdge
) => {
  const exists = edges.some(
    (e) =>
      e.source === edge.source &&
      e.target === edge.target &&
      e.relationshipType === edge.relationshipType
  );

  if (!exists) {
    edges.push(edge);
  }
};

export const buildAncestorTree = (
  data: MappedFamilyData,
  personHandle: string,
  maxDepth = 5
): FamilyTreeResponse => {
  //console.log("Building ancestor tree for handle:", personHandle);
  const nodes: FamilyTreeNode[] = [];
  const edges: FamilyTreeEdge[] = [];

  const visited = new Set<string>();

  const walk = (currentHandle: string, depth: number) => {
    if (depth > maxDepth) return;
    if (visited.has(currentHandle)) return;
  //console.log(`Adding handle: ${currentHandle} at depth: ${depth}`);
    visited.add(currentHandle);

    const currentNode = createNode(data, currentHandle, depth);

    //console.log(`Creating node for handle: ${currentHandle} at depth: ${depth}`);
    if (!currentNode) return;

    addNodeIfMissing(nodes, currentNode);

    addSpousesForPerson(
      data,
      currentHandle,
      depth,
      nodes,
      edges
    );

    const parentRelationships = data.relationships.filter(
      (relationship) =>
        relationship.relationshipType === "child" &&
        relationship.fromHandle === currentHandle
    );

    parentRelationships.forEach((relationship) => {
      const parentHandle = relationship.toHandle;

      const parentNode = createNode(data, parentHandle, depth + 1);

      if (!parentNode) return;

      addNodeIfMissing(nodes, parentNode);

      addSpousesForPerson(
        data,
        currentHandle,
        depth,
        nodes,
        edges
      );

      addEdgeIfMissing(edges, {
        source: parentHandle,
        target: currentHandle,
        relationshipType: "parent",
      });

      walk(parentHandle, depth + 1);
    });
  };

  walk(personHandle, 0);

  return {
    nodes,
    edges,
    families: data.families.filter((family) =>
      nodes.some((node) => node.id === family.fatherHandle) ||
      nodes.some((node) => node.id === family.motherHandle) ||
      family.childHandles.some((childHandle) =>
        nodes.some((node) => node.id === childHandle)
      )
    ),
  };
};

export const buildDescendantTree = (
  data: MappedFamilyData,
  personHandle: string,
  maxDepth = 4
): FamilyTreeResponse => {
  const nodes: FamilyTreeNode[] = [];
  const edges: FamilyTreeEdge[] = [];

  const visited = new Set<string>();

  const walk = (currentHandle: string, depth: number) => {
    if (depth > maxDepth) return;
    if (visited.has(currentHandle)) return;

    visited.add(currentHandle);

    const currentNode = createNode(data, currentHandle, depth);

    if (!currentNode) return;

    addNodeIfMissing(nodes, currentNode);

    const spouseRelationships = data.relationships.filter(
      (relationship) =>
        relationship.relationshipType === "spouse" &&
        relationship.fromHandle === currentHandle
    );

    spouseRelationships.forEach((relationship) => {
      const spouseNode = createNode(
        data,
        relationship.toHandle,
        depth
      );

      if (spouseNode) {
        addNodeIfMissing(nodes, spouseNode);
      }
    });
   
  const childRelationships = data.relationships.filter(
      (relationship) =>
        relationship.relationshipType === "parent" &&
        relationship.fromHandle === currentHandle
    );

    childRelationships.forEach((relationship) => {
      const childHandle = relationship.toHandle;

      const childNode = createNode(data, childHandle, depth + 1);

      if (!childNode) return;

      addNodeIfMissing(nodes, childNode);

      addEdgeIfMissing(edges, {
        source: currentHandle,
        target: childHandle,
        relationshipType: "parent",
      });

      walk(childHandle, depth + 1);
    });
  };

  walk(personHandle, 0);

  return {
    nodes,
    edges,
    families: data.families.filter((family) =>
      nodes.some((node) => node.id === family.fatherHandle) ||
      nodes.some((node) => node.id === family.motherHandle) ||
      family.childHandles.some((childHandle) =>
        nodes.some((node) => node.id === childHandle)
      )
    ),
  };
};

const addSpousesForPerson = (
  data: MappedFamilyData,
  currentHandle: string,
  currentDepth: number,
  nodes: FamilyTreeNode[],
  edges: FamilyTreeEdge[]
) => {
  //console.log(`Adding spouses for handle: ${currentHandle} at depth: ${currentDepth}`);
  const spouseRelationships = data.relationships.filter(
    (relationship) =>
      relationship.relationshipType === "spouse" &&
      relationship.fromHandle === currentHandle
  );

  spouseRelationships.forEach((relationship) => {
    const spouseHandle = relationship.toHandle;

    const spouseNode = createNode(
      data,
      spouseHandle,
      currentDepth
    );

    if (!spouseNode) return;

    addNodeIfMissing(nodes, spouseNode);

    addEdgeIfMissing(edges, {
      source: currentHandle,
      target: spouseHandle,
      relationshipType: "spouse",
    });
  });
};