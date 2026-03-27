import { useState } from "react";

type Props<T extends string> = {
  label?: string;
  items: T[];
  setItems: (items: T[]) => void;
  suggestions?: T[];
  placeholder?: string;
  normalise?: (value: string) => T;
};


export default function ItemSelector<T extends string>({
  label = "Items",
  items = [],
  setItems,
  suggestions = [],
  placeholder = "Search or add...",
  normalise = (v) => v.trim().toLowerCase().replace(/\s+/g, "-") as T,
}: Props<T>) {
  const [input, setInput] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const addItem = (value: string) => {
    const normalised = normalise(value);

    if (!items.includes(normalised)) {
      setItems([...items, normalised]);
    }

    setInput("");
    setActiveIndex(-1);
  };

  const removeItem = (value: T) => {
    setItems(items.filter((i) => i !== value));
  };

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !items.includes(normalise(s))
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (filtered.length > 0 && activeIndex >= 0) {
        addItem(filtered[activeIndex]);
      } else if (input.trim()) {
        addItem(input);
      }
    }

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }

    if (e.key === "Backspace" && !input && items.length > 0) {
      removeItem(items[items.length - 1]);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}

      {/* Selected items */}
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item) => (
          <span
            key={item}
            className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-2"
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(item)}
              className="hover:text-gray-200"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2"
      />

      {/* Suggestions */}
      {input && (
        <div className="border rounded shadow bg-white mt-1 max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <div
                key={item}
                onClick={() => addItem(item)}
                className={`px-3 py-2 cursor-pointer ${
                  index === activeIndex
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                {item}
              </div>
            ))
          ) : (
            <div
              onClick={() => addItem(input)}
              className="px-3 py-2 cursor-pointer text-blue-600 hover:bg-gray-100"
            >
              Add "{input}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}