import type {
  FamilyRecord,
} from "../../types/familyTypes";

export const validateFamilyDraft = (
  family: FamilyRecord
): string | null => {
  const fatherHandle =
    family.fatherHandle?.trim();

  const motherHandle =
    family.motherHandle?.trim();

  const childHandles =
    (family.childHandles ?? [])
      .map((handle) => handle.trim())
      .filter(Boolean);

  if (
    fatherHandle &&
    motherHandle &&
    fatherHandle === motherHandle
  ) {
    return "The same person cannot be both parents.";
  }

  if (
    fatherHandle &&
    childHandles.includes(fatherHandle)
  ) {
    return "The father cannot also be a child in this family.";
  }

  if (
    motherHandle &&
    childHandles.includes(motherHandle)
  ) {
    return "The mother cannot also be a child in this family.";
  }

  if (
    new Set(childHandles).size !==
    childHandles.length
  ) {
    return "The same child cannot be added more than once.";
  }

  if (
    !fatherHandle &&
    !motherHandle &&
    childHandles.length === 0
  ) {
    return "A family must contain at least one parent or child.";
  }

  return null;
};