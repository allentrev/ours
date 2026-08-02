// components/Family/GenealogyDatePickerModal.tsx

import {
  useEffect,
  useState,
} from "react";

import {
  emptyGenealogyDate,
  formatGenealogyDate,
  parseGenealogyDate,
  type GenealogyDate,
  type GenealogyDateMode,
} from "../../utilities/Family/dateUtils";

import type {
  GenealogicalDate,
  GenealogicalDateType,
} from "../../types/familyTypes";

interface GenealogyDatePickerModalProps {
  open: boolean;

  /*
   * Stored application date.
   */
  value?: GenealogicalDate;

  onClose: () => void;

  /*
   * Returns the stored application date,
   * not the modal's internal form state.
   */
  onSelect: (
    date?: GenealogicalDate
  ) => void;
}

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

const getMonthNumber = (
  month: string
): number => {
  const monthIndex =
    MONTHS.indexOf(month);

  return monthIndex > 0
    ? monthIndex
    : 0;
};

const buildDateValue = (
  date: GenealogyDate
): number | undefined => {
  const year =
    Number(date.year);

  if (
    !Number.isInteger(year) ||
    year <= 0
  ) {
    return undefined;
  }

  const month =
    getMonthNumber(
      date.month
    );

  const parsedDay =
    Number(date.day);

  const day =
    Number.isInteger(parsedDay) &&
    parsedDay >= 1 &&
    parsedDay <= 31
      ? parsedDay
      : 0;

  return (
    year * 10000 +
    month * 100 +
    day
  );
};

const getGenealogicalDateType = (
  mode: GenealogyDateMode
): GenealogicalDateType => {
  switch (mode) {
    case "about":
      return "about";

    case "before":
      return "before";

    case "after":
      return "after";

    case "exact":
    default:
      return "exact";
  }
};

export default function GenealogyDatePickerModal({
  open,
  value,
  onClose,
  onSelect,
}: GenealogyDatePickerModalProps) {
  const [
    date,
    setDate,
  ] = useState<GenealogyDate>(
    emptyGenealogyDate()
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    /*
     * parseGenealogyDate still works with
     * the displayed string representation.
     */
    setDate(
      parseGenealogyDate(
        value?.text ?? ""
      )
    );
  }, [
    open,
    value,
  ]);

  if (!open) {
    return null;
  }

  const selectedDateText =
    formatGenealogyDate(
      date
    );

  const updateDate = (
    field: keyof GenealogyDate,
    fieldValue: string
  ) => {
    setDate((current) => ({
      ...current,
      [field]:
        fieldValue,
    }));
  };

  const handleSelect = () => {
    if (!selectedDateText) {
      return;
    }

    const selectedDate:
      GenealogicalDate = {
        text:
          selectedDateText,

        value:
          buildDateValue(
            date
          ),

        type:
          getGenealogicalDateType(
            date.mode
          ),
      };

    onSelect(
      selectedDate
    );

    onClose();
  };

  const handleClear = () => {
    onSelect(
      undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[460px] max-w-[calc(100vw-2rem)] rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">
          Select Genealogy Date
        </h2>

        {value && (
          <div className="mb-4 rounded bg-gray-100 px-3 py-2 text-sm text-gray-700">
            Current:{" "}
            {value.text}
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700">
          Date type
        </label>

        <select
          value={date.mode}
          onChange={(event) =>
            updateDate(
              "mode",
              event.target
                .value as GenealogyDateMode
            )
          }
          className="mb-4 mt-1 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="exact">
            Exact
          </option>

          <option value="about">
            About
          </option>

          <option value="before">
            Before
          </option>

          <option value="after">
            After
          </option>
        </select>

        <div className="mb-4">
          <div className="mb-1 text-sm font-medium text-gray-700">
            Date
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              min="1"
              max="31"
              value={date.day}
              onChange={(event) =>
                updateDate(
                  "day",
                  event.target.value
                )
              }
              placeholder="Day"
              className="rounded border border-gray-300 px-3 py-2"
            />

            <select
              value={date.month}
              onChange={(event) =>
                updateDate(
                  "month",
                  event.target.value
                )
              }
              className="rounded border border-gray-300 px-3 py-2"
            >
              <option value="">
                Month
              </option>

              {MONTHS.slice(1).map(
                (monthName) => (
                  <option
                    key={
                      monthName
                    }
                    value={
                      monthName
                    }
                  >
                    {monthName}
                  </option>
                )
              )}
            </select>

            <input
              type="number"
              min="1"
              value={date.year}
              onChange={(event) =>
                updateDate(
                  "year",
                  event.target.value
                )
              }
              placeholder="Year"
              className="rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="mb-4 rounded bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Result:{" "}
          {selectedDateText ||
            "No date selected"}
        </div>

        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={
              handleClear
            }
            className="rounded border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
          >
            Clear Date
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded border px-4 py-2 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                handleSelect
              }
              disabled={
                !selectedDateText
              }
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}