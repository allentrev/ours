import { useState } from "react"

interface Page {
  title: string
  content: React.ReactNode
}

interface Props {
  pages: Page[]
}

const TypePagedCard = ({ pages }: Props) => {
  const [pageIndex, setPageIndex] = useState(0)
  console.log("Typed", pages);

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {pages[pageIndex].title}
        </h2>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((p) => p - 1)}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            ◀
          </button>

          <button
            type="button"
            disabled={pageIndex === pages.length - 1}
            onClick={() => setPageIndex((p) => p + 1)}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Content */}
      <div>{pages[pageIndex].content}</div>
    </div>
  )
}

export default TypePagedCard