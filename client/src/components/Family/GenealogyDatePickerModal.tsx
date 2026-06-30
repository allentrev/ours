import { useEffect, useState } from "react";

import {
  emptyGenealogyDate,
  formatGenealogyDate,
  parseGenealogyDate,
  type GenealogyDate,
  type GenealogyDateMode,
} from "../../utilities/Family/dateUtils";

interface GenealogyDatePickerModalProps {
  open: boolean;
  value: string;
  onClose: () => void;
  onSelect: (date: string) => void;
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

export default function GenealogyDatePickerModal({
  open,
  value,
  onClose,
  onSelect,
}: GenealogyDatePickerModalProps) {
  const [date, setDate] = useState<GenealogyDate>(
    emptyGenealogyDate()
  );

  useEffect(() => {
    if (!open) return;

    setDate(parseGenealogyDate(value));
  }, [open, value]);

  if (!open) return null;

  const selectedDate = formatGenealogyDate(date);

  const updateDate = (
    field: keyof GenealogyDate,
    value: string
  ) => {
    setDate((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[460px] rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">
          Select Genealogy Date
        </h2>

        {value && (
          <div className="mb-4 rounded bg-gray-100 px-3 py-2 text-sm text-gray-700">
            Current: {value}
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
              event.target.value as GenealogyDateMode
            )
          }
          className="mt-1 mb-4 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="exact">Exact</option>
          <option value="about">About</option>
          <option value="before">Before</option>
          <option value="after">After</option>
          <option value="between">Between</option>
        </select>

        <div className="mb-4">
          <div className="mb-1 text-sm font-medium text-gray-700">
            {date.mode === "between" ? "Start date" : "Date"}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              min="1"
              max="31"
              value={date.day}
              onChange={(event) =>
                updateDate("day", event.target.value)
              }
              placeholder="Day"
              className="rounded border border-gray-300 px-3 py-2"
            />

            <select
              value={date.month}
              onChange={(event) =>
                updateDate("month", event.target.value)
              }
              className="rounded border border-gray-300 px-3 py-2"
            >
              <option value="">Month</option>
              {MONTHS.slice(1).map((monthName) => (
                <option key={monthName} value={monthName}>
                  {monthName}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={date.year}
              onChange={(event) =>
                updateDate("year", event.target.value)
              }
              placeholder="Year"
              className="rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {date.mode === "between" && (
          <div className="mb-4">
            <div className="mb-1 text-sm font-medium text-gray-700">
              End date
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="1"
                max="31"
                value={date.endDay}
                onChange={(event) =>
                  updateDate("endDay", event.target.value)
                }
                placeholder="Day"
                className="rounded border border-gray-300 px-3 py-2"
              />

              <select
                value={date.endMonth}
                onChange={(event) =>
                  updateDate("endMonth", event.target.value)
                }
                className="rounded border border-gray-300 px-3 py-2"
              >
                <option value="">Month</option>
                {MONTHS.slice(1).map((monthName) => (
                  <option key={monthName} value={monthName}>
                    {monthName}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={date.endYear}
                onChange={(event) =>
                  updateDate("endYear", event.target.value)
                }
                placeholder="Year"
                className="rounded border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        )}

        <div className="mb-4 rounded bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Result: {selectedDate || "No date selected"}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onSelect(selectedDate);
              onClose();
            }}
            disabled={!selectedDate}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}