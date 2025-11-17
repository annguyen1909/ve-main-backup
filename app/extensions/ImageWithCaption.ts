import { Node, mergeAttributes } from '@tiptap/core'

export const ImageWithCaption = Node.create({
  name: 'imageWithCaption',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },

      textAlign: {
        default: 'center',
        parseHTML: element => element.style.textAlign || "center",
        renderHTML: attributes => {
          const style = `
          text-align: ${attributes.textAlign}; 
          display: block; 
          margin: ${attributes.textAlign === 'center'
              ? '0 auto'
              : attributes.textAlign === 'right'
                ? '0 0 0 auto'
                : '0'
            };
          `;
          return { style };
        },
      },

      imageCaption: {
        default: '',
        parseHTML: (element) => element.getAttribute("data-imageCaption") || '',
        renderHTML: (attributes) => ({
          "data-imageCaption": attributes.imageCaption,
        }),
      }
    };
  },

  parseHTML() {
    return [{ tag: "figure" },];
  },

  renderHTML({ HTMLAttributes }) {
    const imageCaption = HTMLAttributes["data-imageCaption"];

    if (imageCaption) {
      return [
        "figure",
        { class: "image-container" },
        [
          "img",
          mergeAttributes(HTMLAttributes, {
            class: "mx-auto"
          }),
        ],
        [
          "figcaption",
          {
            class:
              "image-caption mt-2 text-sm text-white italic text-center select-none"
          },
          imageCaption,
        ],
      ];
    }


    // No caption

    return [
      "figure",
      { class: "image-container" },
      [
        "img",
        mergeAttributes(HTMLAttributes, {
          class: "mx-auto"
        }),
      ],
    ];
  },
});