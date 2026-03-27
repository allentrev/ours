// components/TiptapEditorWithToolbar.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import ImageResize from 'tiptap-extension-resize-image'
import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { importFile } from '../utilities/galleryUtils'

interface TiptapEditorProps {
  content: string,
  readOnly?: boolean,
  onChange?: (html: string) => void,
}

const TiptapEditorWithToolbar = ({ content, readOnly, onChange }: TiptapEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      ImageResize.configure({
        inline: false,
        preserveAspectRatio: true,
        handleSize: 8,
        minWidth: 50,
        minHeight: 50,
      }),
      Placeholder.configure({
        placeholder: 'Start typing here...',
      }),
    ],
    content,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-tight max-w-full focus:outline-none',
        
      },
    },
    onUpdate({ editor }) {
      if( !readOnly && onChange ) {
        onChange(editor.getHTML())
      }
    },
  })

  useEffect(() => {
    if (!editor) return
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!readOnly)
  }, [readOnly, editor])


  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    console.log("TipTapEditor uploadImage", file);
    if (!file) return

    try {
      const result = await importFile(file, '/content/images')
      if (!result?.url) {
        toast.error('Upload failed')
        return
      }

      editor
        ?.chain()
        .focus()
        .setImage({ src: result.url })
        .createParagraphNear()
        .run()

      toast.success('Image uploaded')
    } catch (err) {
      console.error(err)
      toast.error('Image upload failed')
    }

    if (input) input.value = "";
  }

  if (!editor) return null

  return (
    <div className="w-full border rounded-xl overflow-hidden">
      
      {/* Toolbar (only in edit mode) */}
      {!readOnly && (
        <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="px-2 py-1 border rounded"
          >
            B
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="px-2 py-1 border rounded"
          >
            I
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className="px-2 py-1 border rounded"
          >
            H2
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 border rounded"
          >
            🖼️
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={uploadImage}
            className="hidden"
          />
        </div>
      )}

      {/* Editor content */}
      <div className="p-4 min-h-[300px]">
        <EditorContent editor={editor} />
      </div>

    </div>
  )
}

export default TiptapEditorWithToolbar