export const formatFamilyDate = (value?: string) => {
  if (!value) return "Unknown";

  return value;
};

export const formatLifeDates = (
  birthDate?: string,
  deathDate?: string
) => {
  const birth = birthDate || "?";
  const death = deathDate || "";

  return death ? `${birth} - ${death}` : birth;
};