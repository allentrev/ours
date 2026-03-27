import { Search } from 'lucide-react';

type FilterOption = {
  key: string;
  label: string;
};

type FilterBarProps = {
  filterText: string;
  setFilterText: (text: string) => void;
  filterKey: string;
  setFilterKey: (key: string) => void;
  filterOptions: FilterOption[];
};

export default function FilterBar({
  filterText,
  setFilterText,
  filterKey,
  setFilterKey,
  filterOptions,
}: FilterBarProps) {
  return (
    <div className="mb-6 space-y-2">
      <div className="flex gap-2">
        <select
          className="p-2 border rounded"
          value={filterKey}
          onChange={(e) => setFilterKey(e.target.value)}
        >
          {filterOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter filter text"
            className="w-full p-2 pr-10 border rounded"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
