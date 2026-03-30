import { useRef } from "react"

interface CoverUploaderProps {
  onUpload: (file: File) => void | Promise<void>;
}

const CoverUploader = ({ onUpload }: CoverUploaderProps) => {

  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {

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
        accept="image/*"
        hidden
        onChange={handleFile}
      />

    </div>
  )
}

export default CoverUploader
