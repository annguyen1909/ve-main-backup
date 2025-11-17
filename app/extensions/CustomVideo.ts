// extensions/CustomVideo.ts
import { Node, mergeAttributes } from "@tiptap/core";
import { title } from "~/lib/utils";

export const CustomVideo = Node.create({
    name: "customVideo",

    group: "block",

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
                    const style = `text-align: ${attributes.textAlign}; display: block; margin: ${attributes.textAlign === 'center'
                            ? '0 auto'
                            : attributes.textAlign === 'right'
                                ? '0 0 0 auto'
                                : '0'
                        };`;
                    return { style };
                },
            },
            videoTitle: {
                default: '',
                parseHTML: element => element.getAttribute('data-videoTitle') || '',
                renderHTML: attributes => {
                    return {
                        'data-videoTitle': attributes.videoTitle,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "iframe[src]",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const videoTitle = HTMLAttributes['data-videoTitle'];

        if (videoTitle) {
            return [
                "div",
                { class: "video-container" },
                [
                    "iframe",
                    mergeAttributes(HTMLAttributes, {
                        allowfullscreen: "true",
                        frameborder: "0",
                        class: "w-full aspect-video",
                    }),
                ],
                [
                    "p",
                    { class: "mt-2 text-sm text-white italic text-center" },
                    videoTitle,
                ],
            ];
        }

        return [
            "iframe",
            mergeAttributes(HTMLAttributes, {
                allowfullscreen: "true",
                frameborder: "0",
                class: "w-full aspect-video",
            }),
        ];
    },
});
