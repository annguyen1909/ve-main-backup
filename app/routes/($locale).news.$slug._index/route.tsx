import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import type { AppContext } from "~/root";
import { ContactSection } from "~/components/contact-section";
import { Api } from "~/lib/api";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { useEffect } from "react";
import { NewsResource } from "~/types/news";
import { title } from "~/lib/utils";
import { Container } from "~/components/ui/container";
import { generateHTML } from '@tiptap/html'
import { Image } from '@tiptap/extension-image'
import StarterKitModule from '@tiptap/starter-kit'
import { Node } from '@tiptap/core'
/* eslint-disable @typescript-eslint/no-explicit-any */

export async function loader({ params }: LoaderFunctionArgs) {
  const locale = params.locale ?? "en";
  const slug = params.slug;
  let news: NewsResource;

  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const api = new Api();

  try {
    news = await api
      .getNews(locale, slug)
      .then(async (response) => {
        return response.data.data;
      })
  } catch {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    news,
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: title(data?.news.title) },
    { name: "description", content: data?.news.description },
  ];
};

export default function NewsDetailPage() {
  const { news } = useLoaderData<typeof loader>();
  useOutletContext<AppContext>();
  // -- Helpers: small fallback renderer for TipTap JSON docs
  function escapeHtml(str: string) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderMarks(text: string, marks?: any[]) {
    if (!marks || !marks.length) return escapeHtml(text);
    return marks.reduce((acc, mark) => {
      if (mark.type === 'bold' || mark.type === 'strong') return `<strong>${acc}</strong>`;
      if (mark.type === 'italic' || mark.type === 'em') return `<em>${acc}</em>`;
      if (mark.type === 'strike' || mark.type === 's') return `<s>${acc}</s>`;
      if (mark.type === 'link') return `<a href="${escapeHtml(mark.attrs?.href || '#')}">${acc}</a>`;
      return acc;
    }, escapeHtml(text));
  }

  function renderInline(node: any): string {
    if (!node) return '';
    if (node.type === 'text') return renderMarks(node.text || '', node.marks);
    if (node.type === 'hardBreak') return '<br/>';
    // fallback: render children
    if (Array.isArray(node.content)) return node.content.map(renderInline).join('');
    return '';
  }

  function renderNode(node: any): string {
    if (!node) return '';
    const type = node.type;
    switch (type) {
      case 'doc':
        return (node.content || []).map(renderNode).join('');
      case 'paragraph':
        return `<p>${(node.content || []).map(renderInline).join('')}</p>`;
      case 'heading': {
        const level = node.attrs?.level || 1;
        return `<h${level}>${(node.content || []).map(renderInline).join('')}</h${level}>`;
      }
      case 'bulletList':
        return `<ul>${(node.content || []).map(renderNode).join('')}</ul>`;
      case 'orderedList':
        return `<ol>${(node.content || []).map(renderNode).join('')}</ol>`;
      case 'listItem':
        return `<li>${(node.content || []).map(renderInline).join('')}</li>`;
      case 'horizontalRule':
        return '<hr/>';
      case 'blockquote':
        return `<blockquote>${(node.content || []).map(renderNode).join('')}</blockquote>`;
      case 'codeBlock':
        return `<pre><code>${escapeHtml((node.content || []).map((c: any) => c.text || '').join('\n'))}</code></pre>`;
      case 'image':
        return `<figure><img src="${escapeHtml(node.attrs?.src || '')}" alt="${escapeHtml(node.attrs?.alt || '')}"/></figure>`;
      case 'customVideo': {
        const src = node.attrs?.src || '';
        return `<div style="position:relative;padding-top:56.25%"><iframe src="${escapeHtml(src)}" style="position:absolute;left:0;top:0;width:100%;height:100%;border:0;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
      }
      default:
        // attempt to render children or inline content
        if (Array.isArray(node.content)) return node.content.map(renderNode).join('');
        return '';
    }
  }
  // Safely generate HTML from editor JSON. If parsing or generation fails,
  // fall back to the raw `news.content` (if it's already HTML) or an empty string.
  let contentHtml = "";
  try {
    if (news.content) {
      // Try parse as JSON (tiptap stores editor state as JSON). If it isn't JSON,
      // JSON.parse will throw and we'll fall back to using the raw string.
      const parsed = JSON.parse(news.content);

      // Create a small custom node extension to render any `customVideo` nodes
      // (these appear in some articles). This maps the node to an iframe embed.
      const CustomVideo = Node.create({
        name: "customVideo",
        group: "block",
        atom: true,
        addAttributes() {
          return {
            src: { default: null },
            textAlign: { default: null },
          };
        },
        parseHTML() {
          return [{ tag: "div[data-custom-video]" }];
        },
        renderHTML({ node }) {
          const src = node.attrs.src || "";
          // render a responsive iframe wrapper
          return [
            "div",
            { style: "position:relative;padding-top:56.25%;" },
            [
              "iframe",
              {
                src,
                style: "position:absolute;left:0;top:0;width:100%;height:100%;border:0;",
                allow: "autoplay; fullscreen; picture-in-picture",
                allowFullScreen: "true",
              },
            ],
          ];
        },
      });

      try {
        contentHtml = generateHTML(parsed, [StarterKitModule, Image, CustomVideo]);
      } catch (innerErr) {
        // eslint-disable-next-line no-console
        console.error('generateHTML failed, falling back to simple renderer:', innerErr);
        try {
          contentHtml = renderNode(parsed);
        } catch (renderErr) {
          // eslint-disable-next-line no-console
          console.error('fallback render failed:', renderErr);
          contentHtml = news.content ?? "";
        }
      }
    }
  } catch (err) {
    // Log server-side for diagnostics and fall back to using the raw content.
    // Avoid re-throwing so the page still renders.
    // eslint-disable-next-line no-console
    console.error("news content -> generateHTML error:", err);
    contentHtml = news.content ?? "";
  }

  // Disable right-click (context menu) while this page is mounted.
  useEffect(() => {
    function onContext(e: Event) {
      e.preventDefault();
    }
    document.addEventListener("contextmenu", onContext);
    return () => document.removeEventListener("contextmenu", onContext);
  }, []);

  return (
    <>
      <section className="h-dvh overflow-auto">
        <div
          className="w-full h-full max-h-[65%] relative flex items-center justify-center bg-no-repeat bg-top bg-fixed"
          style={{ backgroundImage: `url(${news.attachment_url})` }}
        >
          <div className="bg-gradient-to-t from-[#1b1b1b]/0 to-[#1b1b1b] absolute inset-0"></div>
          <Container className="relative" variant="lg">
            <span className="text-white font-extralight text-xs mb-5 xl:mb-7 inline-block">
              {new Date(news.published_at).toLocaleDateString("vi-VN", {
                month: "2-digit",
                year: "numeric",
                day: "2-digit",
              })}
            </span>
            <h1 className="text-4xl xl:text-5xl font-black text-white" data-koreanable>
              {news.title}
            </h1>
          </Container>
        </div>

        <Container
          className="prose prose-invert prose-md py-7 sm:py-14 xl:py-20"
          data-koreanable
          variant="lg"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </section>
      <ContactSection />
    </>
  );
}
