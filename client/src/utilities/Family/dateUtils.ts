export type GenealogyDateMode =
  | "exact"
  | "about"
  | "before"
  | "after"
  | "between";

export interface GenealogyDate {
  mode: GenealogyDateMode;
  day: string;
  month: string;
  year: string;
  endDay: string;
  endMonth: string;
  endYear: string;
}

export const emptyGenealogyDate = (): GenealogyDate => ({
  mode: "exact",
  day: "",
  month: "",
  year: "",
  endDay: "",
  endMonth: "",
  endYear: "",
});

const MONTHS = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type GenealogyDateStringField =
  | "day"
  | "month"
  | "year"
  | "endDay"
  | "endMonth"
  | "endYear";

const parseSingleDate = (
  text: string,
  target: GenealogyDate,
  prefix: "" | "end" = ""
) => {
  const set = (key: "day" | "month" | "year", value: string) => {
    const field: GenealogyDateStringField =
      prefix === "end"
        ? (`end${key[0].toUpperCase()}${key.slice(1)}` as GenealogyDateStringField)
        : key;

    target[field] = value;
  };

  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) {
    set("year", match[1]);
    set("month", MONTHS[Number(match[2])] ?? "");
    set("day", String(Number(match[3])));
    return;
  }

  match = text.match(/^(\d{4})$/);

  if (match) {
    set("year", match[1]);
    return;
  }

  match = text.match(
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i
  );

  if (match) {
    set("month", match[1]);
    set("year", match[2]);
    return;
  }

  match = text.match(
    /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i
  );

  if (match) {
    set("day", match[1]);
    set("month", match[2]);
    set("year", match[3]);
  }
};

export const parseGenealogyDate = (value: string): GenealogyDate => {
  const result = emptyGenealogyDate();
  let text = value.trim();

  if (!text) return result;

  if (text.startsWith("abt ")) {
    result.mode = "about";
    text = text.substring(4);
  } else if (text.startsWith("before ")) {
    result.mode = "before";
    text = text.substring(7);
  } else if (text.startsWith("after ")) {
    result.mode = "after";
    text = text.substring(6);
  } else if (text.startsWith("between ")) {
    result.mode = "between";

    const match = text.match(/^between (.+) and (.+)$/);

    if (match) {
      parseSingleDate(match[1], result);
      parseSingleDate(match[2], result, "end");
    }

    return result;
  }

  parseSingleDate(text, result);

  return result;
};

const buildSingleDateString = (
  day: string,
  month: string,
  year: string
): string => {
  return [day, month, year].filter(Boolean).join(" ");
};

export const formatGenealogyDate = (date: GenealogyDate): string => {
  const startDate = buildSingleDateString(
    date.day,
    date.month,
    date.year
  );

  const endDate = buildSingleDateString(
    date.endDay,
    date.endMonth,
    date.endYear
  );

  if (!startDate) return "";

  switch (date.mode) {
    case "about":
      return `abt ${startDate}`;

    case "before":
      return `before ${startDate}`;

    case "after":
      return `after ${startDate}`;

    case "between":
      return endDate
        ? `between ${startDate} and ${endDate}`
        : "";

    case "exact":
    default:
      return startDate;
  }
};