const MAX_REASONABLE_AGE = 100;

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

// familyDateUtils.ts

export const formatPersonDate = (
  date?: string,
  isLiving = false
) => {
  if (!date) return "";

  const d = new Date(date);

  return isLiving
    ? d.getFullYear().toString()
    : d.toLocaleDateString();
};

export const calculateAge = (
  isLiving: boolean,
  birthDate?: string,
  deathDate?: string,
): number | null => {
  if (!birthDate) return null;
  if (!deathDate && !isLiving) return null;

  const birth = new Date(birthDate);

  if (isNaN(birth.getTime())) {
    return null;
  }

  const endDate = deathDate
    ? new Date(deathDate)
    : new Date();

  let age =
    endDate.getFullYear() -
    birth.getFullYear();

  const monthDiff =
    endDate.getMonth() -
    birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 &&
      endDate.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
};

export const extractYear = (
  value?: string
): number | null => {
  if (!value) return null;

  const match = value.match(/\b\d{4}\b/);

  return match ? Number(match[0]) : null;
};

export const isPersonProbablyLiving = (
  birthDate?: string,
  deathDate?: string
): boolean => {
  if (deathDate) return false;

  const birthYear = extractYear(birthDate);

  if (!birthYear) return false;

  const currentYear = new Date().getFullYear();

  return currentYear - birthYear < MAX_REASONABLE_AGE;
};