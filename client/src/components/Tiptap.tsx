// components/TiptapEditorWithToolbar.tsx

import {
  useEffect,
  useRef,
} from "react";

import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import CodeBlock from "@tiptap/extension-code-block";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Bold,
  Code2,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  Unlink,
} from "lucide-react";

import {
  toast,
} from "react-toastify";

import {
  CustomImage,
} from "../editor/extensions/CustomImage";

import {
  importFile,
} from "../utilities/galleryUtils";

interface TiptapEditorProps {
  content: string;
  readOnly?: boolean;
  onChange?: (
    html: string
  ) => void;
}

interface ToolbarButtonProps {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const ToolbarButton = ({
  title,
  active = false,
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) => {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`
        flex h-9 w-9
        items-center justify-center
        rounded border
        transition-colors
        ${
          active
            ? "border-blue-500 bg-blue-100 text-blue-800"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
        }
        disabled:cursor-not-allowed
        disabled:opacity-40
      `}
    >
      {children}
    </button>
  );
};

const ToolbarDivider = () => {
  return (
    <div
      aria-hidden="true"
      className="mx-1 h-7 w-px shrink-0 bg-gray-300"
    />
  );
};

const TiptapEditorWithToolbar = ({
  content,
  readOnly = false,
  onChange,
}: TiptapEditorProps) => {
  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const editor = useEditor({
    extensions: [
      /*
       * Disable StarterKit's versions so
       * CodeBlock and Link can be configured
       * explicitly below.
       */
      StarterKit.configure({
        codeBlock: false,
        link: false,
      }),

      CodeBlock.configure({
        exitOnArrowDown: true,
        exitOnArrowUp: true,
        exitOnTripleEnter: true,
        enableTabIndentation: true,
        tabSize: 2,
      }),

      LinkExtension.configure({
        openOnClick: readOnly,
        autolink: true,
        linkOnPaste: true,

        HTMLAttributes: {
          class:
            "text-blue-800 underline hover:text-blue-600",
        },
      }),

      CustomImage,

      Placeholder.configure({
        placeholder:
          "Start typing here...",
      }),
    ],

    content,
    editable: !readOnly,

    editorProps: {
      attributes: {
        class:
          "prose prose-tight max-w-full min-h-[300px] focus:outline-none",
      },

      /*
       * Explicit Tab handling provides a
       * fallback if the CodeBlock option is
       * not intercepted by the browser.
       */
      handleKeyDown(
        view,
        event
      ) {
        if (
          event.key !== "Tab" ||
          event.shiftKey
        ) {
          return false;
        }

        const {
          $from,
        } = view.state.selection;

        if (
          $from.parent.type.name !==
          "codeBlock"
        ) {
          return false;
        }

        event.preventDefault();

        view.dispatch(
          view.state.tr.insertText(
            "  "
          )
        );

        return true;
      },
    },

    onUpdate({
      editor: updatedEditor,
    }) {
      if (
        !readOnly &&
        onChange
      ) {
        onChange(
          updatedEditor.getHTML()
        );
      }
    },
  });

  /*
   * Keep editor content synchronised when
   * the selected post changes externally.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    if (
      content !==
      editor.getHTML()
    ) {
      editor.commands.setContent(
        content
      );
    }
  }, [
    content,
    editor,
  ]);

  /*
   * Update editable state when the page
   * enters or leaves edit mode.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(
      !readOnly
    );
  }, [
    readOnly,
    editor,
  ]);

  const uploadImage = async (
    event:
      React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (
      !file ||
      !editor
    ) {
      return;
    }

    try {
      const result =
        await importFile(
          file,
          "/content/images"
        );

      if (!result?.url) {
        throw new Error(
          "The upload returned no image URL."
        );
      }

      editor
        .chain()
        .focus()
        .setImage({
          src: result.url,
        })
        .insertContent(
          "<p></p>"
        )
        .run();

      toast.success(
        "Image uploaded."
      );
    } catch (error) {
      console.error(
        "Image upload failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Image upload failed."
      );
    }

    event.target.value = "";
  };

  const setLink = () => {
    if (!editor) {
      return;
    }

    const existingUrl =
      editor.getAttributes(
        "link"
      ).href as
        | string
        | undefined;

    const url =
      window.prompt(
        "Enter the link URL:",
        existingUrl ?? ""
      );

    /*
     * Cancel was selected.
     */
    if (url === null) {
      return;
    }

    const trimmedUrl =
      url.trim();

    /*
     * An empty value removes the link.
     */
    if (!trimmedUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange(
          "link"
        )
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange(
        "link"
      )
      .setLink({
        href: trimmedUrl,
      })
      .run();
  };

  const removeLink = () => {
    editor
      ?.chain()
      .focus()
      .extendMarkRange(
        "link"
      )
      .unsetLink()
      .run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white">
      {/* Toolbar */}

      {!readOnly && (
        <div
          className="
            flex flex-wrap
            items-center gap-1.5
            border-b
            border-gray-300
            bg-gray-50 p-2
          "
        >
          {/* Text formatting */}

          <ToolbarButton
            title="Bold"
            active={
              editor.isActive(
                "bold"
              )
            }
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
          >
            <Bold size={18} />
          </ToolbarButton>

          <ToolbarButton
            title="Italic"
            active={
              editor.isActive(
                "italic"
              )
            }
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
          >
            <Italic size={18} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Structure */}

          <ToolbarButton
            title="Heading 2"
            active={
              editor.isActive(
                "heading",
                {
                  level: 2,
                }
              )
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 2,
                })
                .run()
            }
          >
            <Heading2 size={18} />
          </ToolbarButton>

          <ToolbarButton
            title="Blockquote"
            active={
              editor.isActive(
                "blockquote"
              )
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBlockquote()
                .run()
            }
          >
            <Quote size={18} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}

          <ToolbarButton
            title="Bullet list"
            active={
              editor.isActive(
                "bulletList"
              )
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBulletList()
                .run()
            }
          >
            <List size={18} />
          </ToolbarButton>

          <ToolbarButton
            title="Numbered list"
            active={
              editor.isActive(
                "orderedList"
              )
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
          >
            <ListOrdered
              size={18}
            />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Link controls */}

          <ToolbarButton
            title="Add or edit link"
            active={
              editor.isActive(
                "link"
              )
            }
            onClick={
              setLink
            }
          >
            <Link2 size={18} />
          </ToolbarButton>

          <ToolbarButton
            title="Remove link"
            disabled={
              !editor.isActive(
                "link"
              )
            }
            onClick={
              removeLink
            }
          >
            <Unlink size={18} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Code and images */}

          <ToolbarButton
            title="Code block"
            active={
              editor.isActive(
                "codeBlock"
              )
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleCodeBlock()
                .run()
            }
          >
            <Code2 size={18} />
          </ToolbarButton>

          <ToolbarButton
            title="Insert image"
            onClick={() =>
              fileInputRef.current
                ?.click()
            }
          >
            <ImagePlus
              size={18}
            />
          </ToolbarButton>

          <input
            ref={
              fileInputRef
            }
            type="file"
            accept="image/*"
            onChange={
              uploadImage
            }
            className="hidden"
          />

          <ToolbarDivider />

          {/* History */}

          <ToolbarButton
            title="Undo"
            disabled={
              !editor.can()
                .chain()
                .focus()
                .undo()
                .run()
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .undo()
                .run()
            }
          >
            <Undo2 size={18} />
          </ToolbarButton>

          <ToolbarButton
            title="Redo"
            disabled={
              !editor.can()
                .chain()
                .focus()
                .redo()
                .run()
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .redo()
                .run()
            }
          >
            <Redo2 size={18} />
          </ToolbarButton>
        </div>
      )}

      {/* Editor */}

      <div className="p-4">
        <EditorContent
          editor={editor}
        />
      </div>
    </div>
  );
};

export default TiptapEditorWithToolbar;