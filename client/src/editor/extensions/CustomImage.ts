import Image from '@tiptap/extension-image'

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      alignment: {
        default: 'center',
        parseHTML: element =>
          element.getAttribute('data-align') || 'center',
        renderHTML: attributes => {
          return {
            'data-align': attributes.alignment,
            class: `img-align-${attributes.alignment}`,
          }
        },
      },
    }
  },
})