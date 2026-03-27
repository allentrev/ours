import { useRef } from "react"

const CoverUploader = ({ onUpload }) => {

  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e) => {

    const file = e.target.files?.[0]

    if (!file) return

    onUpload(file)
  }

  return (
    <div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        Add Cover
      </button>

      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={handleFile}
      />

    </div>
  )
}

export default CoverUploader
