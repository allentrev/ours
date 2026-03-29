import { useState, useMemo } from "react"

interface Props {
  label: string
  items: string[]
  setItems: (items: string[]) => void
  mode?: "single" | "multi"
  options?: string[]
}

const ItemSelector = ({
  label,
  items,
  setItems,
  mode = "multi",
  options = []
}: Props) => {
  const [input, setInput] = useState("")

  // 🔍 filter suggestions based on input
  const filteredOptions = useMemo(() => {
    if (!input.trim()) return []
    return options
      .filter((o) =>
        o.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 5)
  }, [input, options])

  const addItem = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    if (mode === "single") {
      setItems([trimmed])
    } else {
      if (!items.includes(trimmed)) {
        setItems([...items, trimmed])
      }
    }

    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addItem(input)
    }
  }

  const removeItem = (item: string) => {
    if (mode === "single") {
      setItems([])
    } else {
      setItems(items.filter((i) => i !== item))
    }
  }

  return (
    <div className="grid gap-2 relative">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* INPUT */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Type ${label}...`}
        className="p-2 border rounded-lg"
      />

      {/* SUGGESTIONS */}
      {filteredOptions.length > 0 && (
        <div className="border rounded-lg bg-white shadow-sm">
          {filteredOptions.map((opt) => (
            <div
              key={opt}
              onClick={() => addItem(opt)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      {/* SELECTED ITEMS */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="px-3 py-1 bg-gray-200 rounded-full flex items-center gap-2"
          >
            {item}
            <button onClick={() => removeItem(item)}>×</button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default ItemSelector