import type {
  GenealogicalDate,
  GenealogicalDateType,
} from "../types/family.types.js";

const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

interface ParsedDateParts {
  year: number;
  month?: number;
  day?: number;
}

const removeDateModifier = (
  text: string
): string => {
  return text
    .trim()
    .replace(
      /^(about|abt|before|bef|after|aft)\s+/i,
      ""
    )
    .trim();
};

const getExplicitModifier = (
  text: string
):
  | "before"
  | "after"
  | undefined => {
  const normalised =
    text.trim().toLowerCase();

  if (
    normalised.startsWith("before ") ||
    normalised.startsWith("bef ")
  ) {
    return "before";
  }

  if (
    normalised.startsWith("after ") ||
    normalised.startsWith("aft ")
  ) {
    return "after";
  }

  return undefined;
};

const parseDateParts = (
  text: string
): ParsedDateParts | undefined => {
  const dateText =
    removeDateModifier(text);

  const match =
    dateText.match(
      /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/
    );

  if (!match) {
    return undefined;
  }

  const year =
    Number(match[1]);

  const month =
    match[2]
      ? Number(match[2])
      : undefined;

  const day =
    match[3]
      ? Number(match[3])
      : undefined;

  if (
    month !== undefined &&
    (
      month < 1 ||
      month > 12
    )
  ) {
    return undefined;
  }

  if (
    day !== undefined &&
    (
      day < 1 ||
      day > 31
    )
  ) {
    return undefined;
  }

  return {
    year,
    month,
    day,
  };
};


const buildDateValue = (
  parts?: ParsedDateParts
): number | undefined => {
  if (!parts) {
    return undefined;
  }

  return (
    parts.year * 10000 +
    (parts.month ?? 0) * 100 +
    (parts.day ?? 0)
  );
};

const determineDateType = (
  text: string,
  parts?: ParsedDateParts
): GenealogicalDateType => {
  const explicitModifier =
    getExplicitModifier(text);

  if (explicitModifier) {
    return explicitModifier;
  }

  const isCompleteDate =
    parts?.year !== undefined &&
    parts.month !== undefined &&
    parts.day !== undefined;

  return isCompleteDate
    ? "exact"
    : "about";
};

export const convertGrampsDate = (
  date?: string
): GenealogicalDate | undefined => {
  const text =
    date?.trim();

  if (!text) {
    return undefined;
  }

  const parts =
    parseDateParts(text);

  return {
    text,
    value:
      buildDateValue(parts),
    type:
      determineDateType(
        text,
        parts
      ),
  };
};