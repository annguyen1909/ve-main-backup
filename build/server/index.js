import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { PassThrough } from 'stream';
import { createReadableStreamFromReadable, redirect, json } from '@remix-run/node';
import { RemixServer, useOutletContext, Link as Link$1, useNavigation, useNavigate, useLocation, useLoaderData, useMatches, Meta, Links, Outlet, ScrollRestoration, Scripts, useRouteError, isRouteErrorResponse, useSearchParams, useActionData, Form } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { createInstance } from 'i18next';
import Backend from 'i18next-fs-backend';
import { resolve } from 'node:path';
import { RemixI18Next } from 'remix-i18next/server';
import { initReactI18next, I18nextProvider, useTranslation } from 'react-i18next';
import { useChangeLanguage } from 'remix-i18next/react';
import axios, { isAxiosError } from 'axios';
import * as React from 'react';
import React__default, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as motion from 'motion/react-client';
import { AnimatePresence, useMotionValue, animate, motion as motion$1, useAnimation } from 'framer-motion';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronRight, Check, Circle, X, MinusIcon, PlusIcon, UploadCloudIcon, ChevronDown, ChevronUp, ArrowRight, ChevronLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Toaster$1, toast } from 'sonner';
import useEmblaCarousel from 'embla-carousel-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useInView, AnimatePresence as AnimatePresence$1 } from 'motion/react';
import { generateHTML } from '@tiptap/html';
import { Image } from '@tiptap/extension-image';
import StarterKitModule from '@tiptap/starter-kit';
import { Node } from '@tiptap/core';
import * as SelectPrimitive from '@radix-ui/react-select';

const i18n = {
  // This is the list of languages your application supports
  supportedLngs: ["en", "ko"],
  // This is the language you want to use in case
  // if the user language is not in the supportedLngs
  fallbackLng: "en",
  // The default namespace of i18next is "translation", but you can customize it here
  defaultNS: "common"
};

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng
  },
  i18next: {
    ...i18n,
    backend: {
      loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json")
    }
  },
  plugins: [Backend]
});

const ABORT_DELAY = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  const callbackName = isbot(request.headers.get("user-agent")) ? "onAllReady" : "onShellReady";
  const instance = createInstance();
  const lng = await i18next.getLocale(request);
  const ns = i18next.getRouteNamespaces(remixContext);
  await instance.use(initReactI18next).use(Backend).init({
    ...i18n,
    // spread the configuration
    lng,
    // The locale we detected above
    ns,
    // The namespaces the routes about to render wants to use
    backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") }
  });
  return new Promise((resolve2, reject) => {
    let didError = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(I18nextProvider, { i18n: instance, children: /* @__PURE__ */ jsx(RemixServer, { context: remixContext, url: request.url }) }),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve2(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = true;
          console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

const entryServer = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: 'Module' }));

class Api {
  instance;
  constructor() {
    this.instance = axios.create({
      baseURL: process.env.BASE_API_URL ?? "https://api.visualennode.com",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      withCredentials: true,
      // set a sensible default timeout so transient network issues fail fast
      timeout: 1e4
    });
  }
  isValidationResponse(error) {
    return (
      // eslint-disable-next-line import/no-named-as-default-member
      axios.isAxiosError(error) && !!error.response && error.response.status === 422
    );
  }
  isTooManyRequestsResponse(error) {
    return (
      // eslint-disable-next-line import/no-named-as-default-member
      axios.isAxiosError(error) && !!error.response && error.response.status === 429
    );
  }
  isInternalServerErrorResponse(error) {
    return (
      // eslint-disable-next-line import/no-named-as-default-member
      axios.isAxiosError(error) && !!error.response && [500].includes(error.response.status)
    );
  }
  getConfiguration() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve({
          brand: {
            data: {
              url: "/favicon-dark.png",
              description: "Visual Ennode"
            }
          }
        });
      }, 100);
    });
  }
  getBanners() {
    return this.instance.get("/public/attachments?group=banner");
  }
  getClients(locale) {
    return this.instance.get(
      "/public/clients",
      {
        headers: {
          "Accept-Language": locale
        }
      }
    );
  }
  getWorks(locale, slug_category, query, tagId) {
    return this.instance.get(
      "/public/works",
      {
        headers: {
          "Accept-Language": locale
        },
        params: {
          "slug_category": slug_category,
          keywords: query,
          tag_id: tagId
        }
      }
    );
  }
  getWork(locale, slug_work) {
    return this.instance.get(
      `/public/works/${slug_work}`,
      {
        headers: {
          "Accept-Language": locale
        }
      }
    );
  }
  getCategories(locale) {
    return this.instance.get(
      "/public/categories",
      {
        headers: {
          "Accept-Language": locale
        }
      }
    );
  }
  getEmployees(locale) {
    return this.instance.get(
      "/public/employees",
      {
        headers: {
          "Accept-Language": locale
        }
      }
    );
  }
  // send contact email with a small retry for transient network errors
  async sendEmailContactApi(data, locale) {
    const url = "/public/mails/send-contact";
    const headers = {
      "Accept-Language": locale
    };
    const maxAttempts = 2;
    let attempt = 0;
    let lastErr = null;
    while (attempt < maxAttempts) {
      try {
        return await this.instance.post(url, data, { headers });
      } catch (err) {
        lastErr = err;
        attempt += 1;
        const isAxiosErr = isAxiosError(err);
        const status = isAxiosErr && err.response ? err.response.status : null;
        const shouldRetry = !isAxiosErr || !err.response || status !== null && status >= 500;
        if (!shouldRetry || attempt >= maxAttempts) break;
        await new Promise((res) => setTimeout(res, 300 * attempt));
      }
    }
    throw lastErr;
  }
  sendEmailCVApi(data, locale) {
    return this.instance.post("/public/mails/send-cv", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept-Language": locale
      }
    });
  }
  getTags(locale) {
    return this.instance.get(
      "/public/tags",
      {
        headers: {
          "Accept-Language": locale
        }
      }
    );
  }
  getNewsList(locale, query, page = 1) {
    return this.instance.get(
      "/public/posts",
      {
        headers: {
          "Accept-Language": locale
        },
        params: {
          keywords: query,
          page
        }
      }
    );
  }
  getNews(locale, slug) {
    return this.instance.get(
      `/public/posts/${slug}`,
      {
        headers: {
          "Accept-Language": locale
        }
      }
    );
  }
  getFlatforms(locale) {
    return this.instance.get(
      "/public/platforms",
      {
        headers: {
          "Accept-Language": locale
        }
      }
    );
  }
}

function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function title(title2 = "", withoutSuffix = false) {
  if (!title2) return "Visual Ennode";
  return withoutSuffix ? title2 : `${title2} | Visual Ennode`;
}
function localePath(locale, to) {
  let path = `/${locale}/${to.replace(/^\/|\/$/g, "")}`;
  if (locale === i18n.fallbackLng) {
    path = `/${to.replace(/^\/|\/$/g, "")}`;
  }
  return path.replace(/\/$/g, "").replace("//", "");
}
function montserratIfKo(text, locale) {
  if (!text || !locale || locale !== "ko") return "";
  return /[A-Za-z]/.test(text) ? "montserrat-for-en" : "";
}

const containerVariants = cva("mx-auto px-5 py-3 sm:px-10 sm:py-5", {
  variants: {
    variant: {
      default: "container",
      fluid: "w-full",
      "2xl": "container max-w-screen-2xl",
      xl: "container max-w-screen-xl",
      lg: "container max-w-screen-lg",
      md: "container max-w-screen-md",
      sm: "container max-w-screen-sm",
      hero: "flex items-center justify-center w-full grow"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
const Container = React.forwardRef(
  ({ className, variant, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(containerVariants({ variant, className })),
        ref,
        ...props
      }
    );
  }
);
Container.displayName = "Container";

function HamburgerMenuIcon(props) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      ...props,
      viewBox: "0 0 15 15",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ jsx(
        "path",
        {
          d: "M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z",
          fill: "currentColor",
          fillRule: "evenodd",
          clipRule: "evenodd"
        }
      )
    }
  );
}
function CrossIcon(props) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      ...props,
      viewBox: "0 0 25 25",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ jsx(
        "path",
        {
          d: "M24.091 1.59089L22.5 0L12.0455 10.4545L1.59103 0L0 1.59089L10.4546 12.0454L0 22.5L1.59103 24.0909L12.0455 13.6364L22.5 24.0909L24.091 22.5L13.6365 12.0454L24.091 1.59089Z",
          fill: "white"
        }
      )
    }
  );
}
function MagnifyingGlassIcon(props) {
  return /* @__PURE__ */ jsx("svg", { ...props, strokeLinejoin: "round", viewBox: "0 0 16 16", children: /* @__PURE__ */ jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M1.5 6.5C1.5 3.73858 3.73858 1.5 6.5 1.5C9.26142 1.5 11.5 3.73858 11.5 6.5C11.5 9.26142 9.26142 11.5 6.5 11.5C3.73858 11.5 1.5 9.26142 1.5 6.5ZM6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C8.02469 13 9.42677 12.475 10.5353 11.596L13.9697 15.0303L14.5 15.5607L15.5607 14.5L15.0303 13.9697L11.596 10.5353C12.475 9.42677 13 8.02469 13 6.5C13 2.91015 10.0899 0 6.5 0Z",
      fill: "currentColor"
    }
  ) });
}
function GlobeIcon(props) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      ...props,
      viewBox: "0 0 26 26",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ jsx(
        "path",
        {
          d: "M13 0.25C10.4783 0.25 8.01321 0.997774 5.91648 2.39876C3.81976 3.79975 2.18556 5.79103 1.22054 8.12079C0.255524 10.4505 0.00303191 13.0141 0.494993 15.4874C0.986955 17.9607 2.20127 20.2325 3.98439 22.0156C5.76751 23.7987 8.03935 25.0131 10.5126 25.505C12.9859 25.997 15.5495 25.7445 17.8792 24.7795C20.209 23.8144 22.2003 22.1802 23.6012 20.0835C25.0022 17.9868 25.75 15.5217 25.75 13C25.746 9.61971 24.4015 6.379 22.0112 3.98877C19.621 1.59854 16.3803 0.25397 13 0.25ZM23.1963 8.25H18.1488C17.547 5.93113 16.4497 3.77026 14.9325 1.91625C16.7173 2.23095 18.4 2.97081 19.8384 4.07326C21.2768 5.17572 22.4285 6.60835 23.1963 8.25ZM24.25 13C24.2508 14.101 24.0895 15.196 23.7713 16.25H18.4763C18.8413 14.0987 18.8413 11.9013 18.4763 9.75H23.7713C24.0895 10.804 24.2508 11.899 24.25 13ZM13 23.9788C12.2779 23.2421 11.641 22.4266 11.1013 21.5475C10.3729 20.3627 9.80696 19.0855 9.41876 17.75H16.5813C16.193 19.0855 15.6272 20.3627 14.8988 21.5475C14.359 22.4266 13.7221 23.2421 13 23.9788ZM9.05626 16.25C8.64797 14.1026 8.64797 11.8974 9.05626 9.75H16.9438C17.352 11.8974 17.352 14.1026 16.9438 16.25H9.05626ZM1.75001 13C1.74916 11.899 1.91048 10.804 2.22876 9.75H7.52376C7.15868 11.9013 7.15868 14.0987 7.52376 16.25H2.22876C1.91048 15.196 1.74916 14.101 1.75001 13ZM13 2.02125C13.7221 2.75788 14.359 3.57343 14.8988 4.4525C15.6272 5.63726 16.193 6.91452 16.5813 8.25H9.41876C9.80696 6.91452 10.3729 5.63726 11.1013 4.4525C11.641 3.57343 12.2779 2.75788 13 2.02125ZM11.0675 1.91625C9.55029 3.77026 8.45301 5.93113 7.85126 8.25H2.80376C3.57147 6.60835 4.72323 5.17572 6.16162 4.07326C7.60002 2.97081 9.28275 2.23095 11.0675 1.91625ZM2.80376 17.75H7.85126C8.45301 20.0689 9.55029 22.2297 11.0675 24.0837C9.28275 23.7691 7.60002 23.0292 6.16162 21.9267C4.72323 20.8243 3.57147 19.3916 2.80376 17.75ZM14.9288 24.0837C16.4473 22.2301 17.5459 20.0692 18.1488 17.75H23.1963C22.4285 19.3916 21.2768 20.8243 19.8384 21.9267C18.4 23.0292 16.7173 23.7691 14.9325 24.0837H14.9288Z",
          fill: "white"
        }
      )
    }
  );
}
function ChevronLeftIcon(props) {
  return /* @__PURE__ */ jsx("svg", { ...props, strokeLinejoin: "round", viewBox: "0 0 16 16", children: /* @__PURE__ */ jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M10.5 14.0607L9.96966 13.5303L5.14644 8.7071C4.75592 8.31658 4.75592 7.68341 5.14644 7.29289L9.96966 2.46966L10.5 1.93933L11.5607 2.99999L11.0303 3.53032L6.56065 7.99999L11.0303 12.4697L11.5607 13L10.5 14.0607Z",
      fill: "currentColor"
    }
  ) });
}
function ChevronRightIcon(props) {
  return /* @__PURE__ */ jsx("svg", { ...props, strokeLinejoin: "round", viewBox: "0 0 16 16", children: /* @__PURE__ */ jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M5.50001 1.93933L6.03034 2.46966L10.8536 7.29288C11.2441 7.68341 11.2441 8.31657 10.8536 8.7071L6.03034 13.5303L5.50001 14.0607L4.43935 13L4.96968 12.4697L9.43935 7.99999L4.96968 3.53032L4.43935 2.99999L5.50001 1.93933Z",
      fill: "currentColor"
    }
  ) });
}
function SpinnerIcon({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx("div", { className: cn("w-4 h-4", className), ...props, children: /* @__PURE__ */ jsx("div", { className: "relative top-1/2 left-1/2 w-full h-full", children: Array(12).fill(0).map((_, index) => /* @__PURE__ */ jsx(
    "div",
    {
      className: "animate-spinner bg-current rounded-lg h-[8%] left-[-10%] absolute top-[-3.9%] w-[24%]"
    },
    index
  )) }) });
}

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

function ContactCtaSection(props) {
  const { translations: t, locale } = useOutletContext() ?? {
    translations: props.externalTranslations,
    locale: props.externalLocale
  };
  const column2Body = t?.["component.contact.column_2.body"];
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-stretch text-white gap-14", children: [
    /* @__PURE__ */ jsxs("div", { className: "grow lg:w-1/2", children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold text-base sm:text-2xl mb-2", "data-koreanable": true, children: t["component.contact.column_1.title"] }),
      /* @__PURE__ */ jsxs("div", { className: "font-extralight text-sm sm:text-base leading-7", children: [
        /* @__PURE__ */ jsx("p", { "data-koreanable": true, children: t["component.contact.column_1.body"] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2", children: [
          /* @__PURE__ */ jsx("span", { "data-koreanable": true, className: montserratIfKo(t["HR manager"], locale), children: t["HR manager"] }),
          ": ",
          /* @__PURE__ */ jsx("span", { className: montserratIfKo("jobs@visualennode.com", locale), children: "jobs@visualennode.com" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-5", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { "data-koreanable": true, className: montserratIfKo(t["Phone"], locale), children: t["Phone"] }),
            ": ",
            /* @__PURE__ */ jsx("span", { className: montserratIfKo("02-515-7400", locale), children: "02-515-7400" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 ml-auto", children: [
            /* @__PURE__ */ jsx(
              Link$1,
              {
                to: "https://instagram.com/visual_ennode",
                target: "_blank",
                rel: "noopener noreferrer",
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: "/images/instagram.svg",
                    loading: "lazy",
                    className: "size-5",
                    alt: "Instagram"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              Link$1,
              {
                to: "https://www.youtube.com/@visualennode",
                target: "_blank",
                rel: "noopener noreferrer",
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: "/images/youtube-square.svg",
                    loading: "lazy",
                    className: "size-5",
                    alt: "YouTube"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              Link$1,
              {
                to: "https://pf.kakao.com/_ggesn/chat",
                target: "_blank",
                rel: "noopener noreferrer",
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: "/images/talk.svg",
                    loading: "lazy",
                    className: "size-5",
                    alt: "Talk"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              Link$1,
              {
                to: "https://www.facebook.com/profile.php?id=61573221556208",
                target: "_blank",
                rel: "noopener noreferrer",
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: "/images/fb.svg",
                    loading: "lazy",
                    className: "size-5",
                    alt: "Facebook"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              Link$1,
              {
                to: "https://blog.naver.com/visualennode",
                target: "_blank",
                rel: "noopener noreferrer",
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: "/images/blog.svg",
                    loading: "lazy",
                    className: "size-5",
                    alt: "Blog"
                  }
                )
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grow lg:w-1/2 flex flex-col", children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold text-base sm:text-2xl mb-2", "data-koreanable": true, children: t["component.contact.column_2.title"] }),
      /* @__PURE__ */ jsxs("div", { className: "font-extralight text-sm sm:text-base leading-7 h-full flex flex-col", children: [
        (column2Body ?? "").split(/\r?\n/).map((line, i) => /* @__PURE__ */ jsx("p", { "data-koreanable": true, className: i === 0 ? void 0 : "mt-2", children: line }, i)),
        /* @__PURE__ */ jsxs("p", { className: "mt-auto", children: [
          /* @__PURE__ */ jsx("span", { "data-koreanable": true, children: t["component.contact.column_2.cta"] }),
          ":",
          " ",
          /* @__PURE__ */ jsx(
            Link$1,
            {
              to: localePath(locale, "career"),
              className: `font-semibold ${montserratIfKo(t["Career"], locale)}`,
              prefetch: "intent",
              children: t["Career"]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hidden lg:block w-96", children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold text-base sm:text-2xl mb-2", "data-koreanable": true, children: t["component.contact.column_3.title"] }),
      /* @__PURE__ */ jsx("div", { className: "font-extralight text-sm sm:text-base leading-7", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 w-56 space-y-1", children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Link$1, { to: localePath(locale, ""), className: `link-animation ${montserratIfKo(t["Home"], locale)}`, children: t["Home"] }) }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          Link$1,
          {
            to: localePath(locale, "career"),
            className: `link-animation ${montserratIfKo(t["Career"], locale)}`,
            children: t["Career"]
          }
        ) }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Link$1, { to: localePath(locale, "works"), className: `link-animation ${montserratIfKo(t["Works"], locale)}`, children: t["Works"] }) }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          Link$1,
          {
            to: localePath(locale, "contact"),
            className: `link-animation ${montserratIfKo(t["Contact us"], locale)}`,
            children: t["Contact us"]
          }
        ) }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Link$1, { to: localePath(locale, "about"), className: `link-animation ${montserratIfKo(t["About us"], locale)}`, children: t["About us"] }) }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          Link$1,
          {
            to: localePath(locale, "privacy"),
            className: `link-animation ${montserratIfKo(t["Privacy policy"], locale)}`,
            children: t["Privacy policy"]
          }
        ) })
      ] }) })
    ] })
  ] });
}

function Header({
  brand,
  translations: t,
  locale
}) {
  const [collapse, setCollapse] = useState(true);
  const [closing, setClosing] = useState(false);
  const navigation = useNavigation();
  const [lastHeaderVariant, setLastHeaderVariant] = useState();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === localePath(locale, "") || location.pathname === `/${locale}` || location.pathname === `/${locale}/`;
  function switchLocale(newLocale) {
    return navigate(
      localePath(
        newLocale,
        location.pathname.replace("/" + locale, "").replace(/\/$/g, "")
      )
    );
  }
  const CLOSE_EXIT_MS = 280;
  const closeTimerRef = useRef(null);
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    setCollapse(true);
    const headerDom = document.getElementById("header");
    if (!headerDom) return;
    if (!isHome) {
      headerDom.classList.remove("opacity-50");
      return;
    }
    if (document.documentElement.scrollTop > 0) {
      headerDom.classList.add("opacity-50");
    } else {
      headerDom.classList.remove("opacity-50");
    }
    setLastHeaderVariant(headerDom.dataset.variant);
    headerDom.dataset.variant = "light";
  }, [navigation.state, isHome]);
  useEffect(() => {
    const headerDom = document.getElementById("header");
    if (!headerDom) return;
    if (!collapse) {
      if (isHome) headerDom.dataset.variant = lastHeaderVariant ?? "light";
      return;
    }
    if (!isHome) {
      headerDom.classList.remove("opacity-50");
      return;
    }
    if (document.documentElement.scrollTop > 0) {
      headerDom.classList.add("opacity-50");
    } else {
      headerDom.classList.remove("opacity-50");
    }
  }, [collapse, lastHeaderVariant, isHome]);
  useEffect(() => {
    function determineIfHeaderBlurred() {
      const headerDom = document.getElementById("header");
      if (!headerDom) {
        return;
      }
      if (!isHome) {
        headerDom.classList.remove("opacity-50");
        return;
      }
      if (window.scrollY > 0 && collapse) {
        headerDom.classList.add("opacity-50");
      } else {
        headerDom.classList.remove("opacity-50");
      }
    }
    document.addEventListener("scroll", determineIfHeaderBlurred);
    return () => {
      document.removeEventListener("scroll", determineIfHeaderBlurred);
    };
  }, [collapse, isHome]);
  return /* @__PURE__ */ jsxs(
    "header",
    {
      className: cn(
        "fixed top-0 w-full h-20 left-0 z-40 group text-white overflow-visible min-w-0 transition-colors motion-safe:transition-all duration-300 ease-out hover:bg-black/20 hover:backdrop-blur-sm",
        !collapse
      ),
      id: "header",
      children: [
        /* @__PURE__ */ jsxs(
          Container,
          {
            variant: "fluid",
            className: "flex items-center bg-transparent h-full relative z-10 py-0 gap-7 min-w-0",
            children: [
              /* @__PURE__ */ jsxs(
                Link$1,
                {
                  to: localePath(locale, ""),
                  className: "flex items-center gap-2 flex-none lg:hidden",
                  children: [
                    /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: brand.url,
                        alt: brand.description,
                        className: "w-8 h-6 max-w-full motion-safe:transition-transform motion-safe:duration-300 motion-reduce:transition-none group-hover:scale-105"
                      }
                    ),
                    /* @__PURE__ */ jsx("h1", { className: "font-sans font-semibold uppercase tracking-wide text-sm motion-safe:transition-colors motion-reduce:transition-none group-hover:text-white/90", children: "Visual Ennode" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("nav", { className: "hidden lg:flex items-center gap-20 flex-1 justify-center relative", children: [
                /* @__PURE__ */ jsxs(
                  Link$1,
                  {
                    to: localePath(locale, ""),
                    className: "flex items-center gap-1 flex-none relative lg:hidden",
                    children: [
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: brand.url,
                          alt: brand.description,
                          className: cn(
                            "w-8 h-6 max-w-full motion-safe:transition-transform motion-safe:duration-300 motion-reduce:transition-none group-hover:scale-105",
                            !collapse ? "" : ""
                          )
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "h1",
                        {
                          className: cn(
                            "font-sans font-semibold uppercase tracking-wide text-sm",
                            !collapse ? "hidden sm:block" : "text-white"
                          ),
                          children: "Visual Ennode"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(Link$1, { to: localePath(locale, ""), className: "flex items-center gap-1 flex-none relative", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: brand.url,
                      alt: brand.description,
                      className: cn(
                        "w-8 h-6 motion-safe:transition-transform motion-safe:duration-300 motion-reduce:transition-none group-hover:scale-105",
                        !collapse ? "" : ""
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "h1",
                    {
                      className: cn(
                        "font-sans font-semibold uppercase tracking-wide text-sm",
                        /* hide when expanded */
                        !collapse ? "hidden sm:block" : "",
                        /* make the text follow the header variant so it matches the img logo color */
                        /* when header has data-variant=dark the img uses an invert filter; mirror color for text */
                        ""
                      ),
                      children: "Visual Ennode"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  Link$1,
                  {
                    to: localePath(locale, ""),
                    className: cn(
                      "font-light text-white/50 text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
                      location.pathname === localePath(locale, "") || location.pathname === `/${locale}` || location.pathname === `/${locale}/` ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white" : ""
                    ),
                    children: t["component.header.home"]
                  }
                ),
                /* @__PURE__ */ jsx(
                  Link$1,
                  {
                    to: localePath(locale, "works"),
                    className: cn(
                      "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
                      location.pathname.includes("/works") ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white" : ""
                    ),
                    children: t["component.header.works"]
                  }
                ),
                /* @__PURE__ */ jsx(
                  Link$1,
                  {
                    to: localePath(locale, "about"),
                    className: cn(
                      "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
                      location.pathname.includes("/about") ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white" : ""
                    ),
                    children: t["component.header.about"]
                  }
                ),
                /* @__PURE__ */ jsx(
                  Link$1,
                  {
                    to: localePath(locale, "news"),
                    className: cn(
                      "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
                      location.pathname.includes("/news") ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white" : "",
                      montserratIfKo(t["News"], locale)
                    ),
                    children: t["News"]
                  }
                ),
                /* @__PURE__ */ jsx(
                  Link$1,
                  {
                    to: localePath(locale, "career"),
                    className: cn(
                      "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
                      location.pathname.includes("/career") ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white" : ""
                    ),
                    children: t["component.header.career"]
                  }
                ),
                /* @__PURE__ */ jsx(
                  Link$1,
                  {
                    to: localePath(locale, "contact"),
                    className: cn(
                      "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
                      location.pathname.includes("/contact") ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white" : ""
                    ),
                    children: t["component.header.contact"]
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "hidden lg:block", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
                  /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
                    "button",
                    {
                      className: cn(
                        "flex items-center cursor-pointer gap-2 flex-none uppercase font-light text-sm tracking-wide hover:opacity-70 transition-opacity relative"
                      ),
                      children: [
                        /* @__PURE__ */ jsx(GlobeIcon, { className: "size-5" }),
                        " ",
                        locale
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxs(
                    DropdownMenuContent,
                    {
                      align: "end",
                      className: "w-36 mt-2 bg-[#111111]/60 rounded-none shadow-lg flex flex-col items-center border-none",
                      children: [
                        /* @__PURE__ */ jsx(
                          DropdownMenuItem,
                          {
                            onClick: () => switchLocale("en"),
                            className: cn(
                              "w-full text-center rounded-none text-base justify-center py-2 transition-colors",
                              locale === "en" ? "bg-white text-black" : "text-white/80 hover:bg-white/5"
                            ),
                            children: /* @__PURE__ */ jsx("span", { className: "montserrat-for-en", children: "English" })
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          DropdownMenuItem,
                          {
                            onClick: () => switchLocale("ko"),
                            className: cn(
                              "w-full text-center rounded-none text-base justify-center py-2 transition-colors",
                              locale === "ko" ? "bg-white text-black" : "text-white/80 hover:bg-white/5"
                            ),
                            children: /* @__PURE__ */ jsx("span", { className: "montserrat-for-en", children: "Korean" })
                          }
                        )
                      ]
                    }
                  )
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-7", children: [
                /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: !collapse && /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: { translateX: "4rem", opacity: 0 },
                    animate: { translateX: 0, opacity: 1 },
                    exit: { translateX: "4rem", opacity: 0 },
                    transition: { duration: 0.28 },
                    className: "flex items-center gap-7 lg:hidden",
                    children: [
                      /* @__PURE__ */ jsxs(DropdownMenu, { children: [
                        /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center cursor-pointer rounded-none gap-2 flex-none uppercase", children: [
                          /* @__PURE__ */ jsx(GlobeIcon, { className: "size-7" }),
                          " ",
                          locale
                        ] }) }),
                        /* @__PURE__ */ jsxs(
                          DropdownMenuContent,
                          {
                            align: "end",
                            className: "w-44 mt-2 rounded-none bg-[#111111] p-6 shadow-lg flex flex-col items-center gap-6",
                            children: [
                              /* @__PURE__ */ jsx(
                                DropdownMenuItem,
                                {
                                  onClick: () => switchLocale("en"),
                                  className: "w-full text-center text-lg py-3",
                                  children: /* @__PURE__ */ jsx("span", { className: "montserrat-for-en", children: "English" })
                                }
                              ),
                              /* @__PURE__ */ jsx(
                                DropdownMenuItem,
                                {
                                  onClick: () => switchLocale("ko"),
                                  className: cn(
                                    "w-full text-center text-xl font-medium py-4",
                                    locale === "ko" ? "bg-white text-black" : "text-white/80"
                                  ),
                                  children: /* @__PURE__ */ jsx("span", { className: "montserrat-for-en", children: "Korean" })
                                }
                              )
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsx(
                        CrossIcon,
                        {
                          className: "size-6 cursor-pointer select-none flex-none",
                          onClick: () => {
                            setClosing(true);
                            setCollapse(true);
                            if (closeTimerRef.current) {
                              clearTimeout(closeTimerRef.current);
                            }
                            closeTimerRef.current = window.setTimeout(() => {
                              setClosing(false);
                              closeTimerRef.current = null;
                            }, CLOSE_EXIT_MS + 30);
                          }
                        }
                      )
                    ]
                  },
                  "mobile-open"
                ) }),
                collapse && !closing && /* @__PURE__ */ jsx(
                  HamburgerMenuIcon,
                  {
                    className: "size-9 cursor-pointer select-none flex-none lg:hidden",
                    onClick: () => setCollapse(false)
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(AnimatePresence, { children: !collapse && /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.25 },
            className: "fixed inset-0 w-full pt-20 h-dvh max-h-screen bg-[#1B1B1B] @container/header overflow-hidden min-w-0",
            style: { containerType: "size" },
            children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full pb-14", children: [
              /* @__PURE__ */ jsx("div", { className: "p-0 lg:p-7 grow h-full flex items-center justify-center", children: /* @__PURE__ */ jsxs("ul", { className: "font-normal text-3xl tracking-wide flex flex-col items-center gap-10", children: [
                /* @__PURE__ */ jsx(
                  motion.li,
                  {
                    initial: { translateY: "-2rem", opacity: 0 },
                    whileInView: { translateY: 0, opacity: 1 },
                    transition: { duration: 0.5 },
                    children: /* @__PURE__ */ jsx(
                      Link$1,
                      {
                        to: localePath(locale, ""),
                        prefetch: "render",
                        preventScrollReset: false,
                        className: "link-animation after:h-0.5 after:-bottom-1",
                        onClick: () => {
                          setCollapse(true);
                          navigate(localePath(locale, ""));
                        },
                        children: t["component.header.home"]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  motion.li,
                  {
                    initial: { translateY: "-2rem", opacity: 0 },
                    whileInView: { translateY: 0, opacity: 1 },
                    transition: { duration: 0.2, delay: 0.1 },
                    children: /* @__PURE__ */ jsx(
                      Link$1,
                      {
                        to: localePath(locale, "works"),
                        prefetch: "render",
                        preventScrollReset: false,
                        className: "link-animation after:h-0.5 after:-bottom-1",
                        onClick: () => {
                          setCollapse(true);
                          navigate(localePath(locale, "works"));
                        },
                        children: t["component.header.works"]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  motion.li,
                  {
                    initial: { translateY: "-2rem", opacity: 0 },
                    whileInView: { translateY: 0, opacity: 1 },
                    transition: { duration: 0.2, delay: 0.1 },
                    children: /* @__PURE__ */ jsx(
                      Link$1,
                      {
                        to: localePath(locale, "news"),
                        prefetch: "render",
                        preventScrollReset: false,
                        className: `link-animation after:h-0.5 after:-bottom-1 ${montserratIfKo(t["News"], locale)}`,
                        onClick: () => {
                          setCollapse(true);
                          navigate(localePath(locale, "news"));
                        },
                        children: t["News"]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  motion.li,
                  {
                    initial: { translateY: "-2rem", opacity: 0 },
                    whileInView: { translateY: 0, opacity: 1 },
                    transition: { duration: 0.2, delay: 0.2 },
                    children: /* @__PURE__ */ jsx(
                      Link$1,
                      {
                        to: localePath(locale, "about"),
                        prefetch: "render",
                        preventScrollReset: false,
                        className: "link-animation after:h-0.5 after:-bottom-1",
                        onClick: () => {
                          setCollapse(true);
                          navigate(localePath(locale, "about"));
                        },
                        children: t["component.header.about"]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  motion.li,
                  {
                    initial: { translateY: "-2rem", opacity: 0 },
                    whileInView: { translateY: 0, opacity: 1 },
                    transition: { duration: 0.2, delay: 0.3 },
                    children: /* @__PURE__ */ jsx(
                      Link$1,
                      {
                        to: localePath(locale, "career"),
                        prefetch: "render",
                        preventScrollReset: false,
                        className: "link-animation after:h-0.5 after:-bottom-1",
                        onClick: () => {
                          setCollapse(true);
                          navigate(localePath(locale, "career"));
                        },
                        children: t["component.header.career"]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  motion.li,
                  {
                    initial: { translateY: "-2rem", opacity: 0 },
                    whileInView: { translateY: 0, opacity: 1 },
                    transition: { duration: 0.2, delay: 0.4 },
                    children: /* @__PURE__ */ jsx(
                      Link$1,
                      {
                        to: localePath(locale, "contact"),
                        className: "link-animation after:h-0.5 after:-bottom-1",
                        onClick: () => {
                          setCollapse(true);
                          navigate(localePath(locale, "contact"));
                        },
                        children: t["component.header.contact"]
                      }
                    )
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsx(
                Container,
                {
                  variant: "xl",
                  className: "flex-none mt-auto hidden lg:block",
                  id: "header-footer",
                  children: /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      initial: { translateY: "4rem", opacity: 0 },
                      whileInView: { translateY: 0, opacity: 1 },
                      transition: { duration: 1, delay: 3 },
                      children: /* @__PURE__ */ jsx(
                        ContactCtaSection,
                        {
                          externalTranslations: t,
                          externalLocale: locale
                        }
                      )
                    }
                  )
                }
              )
            ] })
          }
        ) })
      ]
    }
  );
}

const Home = "Home";
const Works$3 = "Works";
const Contact$1 = "Email";
const Phone = "Phone";
const Career$3 = "Career";
const Hotline = "Hotline";
const projects = "projects";
const Link = "Link";
const Consultation = "Consultation";
const Previous = "Previous";
const Next = "Next";
const News = "News";
const Kakaotalk = "Kakaotalk";
const Whatsapp = "Whatsapp";
const Instagram = "Instagram";
const Youtube = "Youtube";
const genericTranslations = {
	Home: Home,
	Works: Works$3,
	"Contact us": "Contact us",
	"About us": "About us",
	"Privacy policy": "Privacy policy",
	"Explore more": "Explore more",
	"See service": "See service",
	"See works": "See Works",
	Contact: Contact$1,
	"HR manager": "HR manager",
	Phone: Phone,
	Career: Career$3,
	Hotline: Hotline,
	"Fill out form": "Fill out form",
	"component.header.home": "Home",
	"component.header.works": "Works",
	"component.header.about": "About",
	"component.header.career": "Career",
	"component.header.contact": "Contact",
	"component.client.title": "Our team is dedicated to building strong, lasting relationships with our partners.",
	"component.client.subtitle": "We build strong, long-lasting partnerships.",
	"component.client.description": "We connect",
	"component.contact.title": "Contact",
	"component.contact.description": "Get connected",
	"component.contact.address_1.name": "Head Office (USA)",
	"component.contact.address_1.address": "2221 I St NW, Washington, DC 20037, USA",
	"component.contact.address_2.name": "Seoul Office (Korea)",
	"component.contact.address_2.address": "54, Gangnam-daero 136-gil, Gangnam-gu, Seoul, 06045, Republic of Korea",
	"component.contact.address_3.name": "Ho Chi Minh City Office (Vietnam)",
	"component.contact.address_3.address": "1D Nguyễn Duy, Phường 3, Bình Thạnh, Hồ Chí Minh City, 70000, Vietnam",
	"component.contact.column_1.title": "Let's connect",
	"component.contact.column_1.body": "Contact us today to discuss your next project and transform your ideas into stunning visual realities.",
	"component.contact.column_2.title": "Join us",
	"component.contact.column_2.body": "We're always on the lookout for passionate individuals to join our ever-growing team of creatives.",
	"component.contact.column_2.cta": "Check out the available at",
	"component.contact.column_3.title": "Quick links",
	"home.page.title": "Architectural Visualization Studio | Visual Ennode",
	"home.page.description": "We transform architecture into cinematic stories. Visual Ennode creates photorealistic renderings and high-end CG videos tailored for real estate marketing.",
	"home.page.og.title": "Visual Ennode | Architectural Rendering & Cinematic Videos",
	"home.page.og.description": "From CG to cinematic storytelling — we bring your architecture to life with compelling visuals and strategic content.",
	"home.page.twitter.title": "Visual Ennode | Rendering & CG Video Studio",
	"home.page.twitter.description": "Discover how your architecture can tell a story. Explore our high-end 3D visuals and cinematic video production.",
	"home.hero-section.visual.slogan": "We visualize",
	"home.hero-section.ennode.slogan": "We connect",
	"home.hero-section.visual.cta": "See works",
	"home.hero-section.ennode.cta": "More about us",
	"home.hero.title": "ARCHVIZ\nSTUDIO",
	"home.hero.subtitle": "We unite diverse departments for seamless collaboration",
	"home.categories.still_image": "Still Image",
	"home.categories.animation": "Animation",
	"home.categories.cinematic": "Cinematic",
	"home.categories.product": "Product",
	"home.categories.vfx": "VFX",
	"home.summary.services": "SERVICES",
	"home.service.title": "SELECTED WORKS",
	"home.service.description": "Explore the impressive portfolio of Our 3D Rendering Company to see how VISUAL ENNODE brings architectural visions to life with precision and creativity. Dive into our projects to experience the high-quality visualizations that set us apart.",
	"ceo.name": "YOONCHANG CHUNG",
	"ceo.title": "CEO | FOUNDER",
	"ceo.message.1": "Visual Ennode is the crystallization between architectural art and cinema language, where each frame not only reproduces the space but also tells a story. We do not merely create images, but also arouse emotions, turn quiet designs into vivid, attractive movies.",
	"ceo.message.2": "With the combination of advanced technology and sophisticated art thinking, we bring a high-class visual experience, helping architects, real estate developers and brands to convey ideas of the idea.",
	"about.definition.title": "What is Visual Ennode",
	"about.definition.description": "Visual Ennode is the crystallization between architectural art and cinema language, where each frame not only reproduces the space but also tells a story. We do not merely create images, but also arouse emotions, turn quiet designs into vivid, attractive movies.\nWith the combination of advanced technology and sophisticated art thinking, we bring a high -class visual experience, helping architects, real estate developers and brands to convey ideas of the idea. I follow the strongest and most emotional way.",
	"about.page.title": "About | Visual Ennode Architectural Visualization Studio",
	"about.page.description": "We are a visualization studio turning architectural philosophy into cinematic expression. Specializing in 3D rendering, perspectives, and CG films.",
	"about.page.og.title": "About Us | Visual Ennode CG Studio",
	"about.page.og.description": "Beyond renderings. Meet the team and philosophy behind Visual Ennode’s story-driven CG and film production.",
	"about.page.twitter.title": "Visual Ennode | Architectural Visualization Studio",
	"about.page.twitter.description": "CG meets cinematic storytelling. Discover how we bring architectural philosophy to life through visuals.",
	"about.value.title": "Our value",
	"about.value.description": "<strong class=\"font-medium\">Unique aesthetics</strong> - we do not only stop at beauty, but also towards the beauty of depth, in light, layout and movement and blend to honor the soul of each space.\n<strong class=\"font-medium\">Leading technology</strong> - Combining movie engineering techniques and advanced 3D simulation technology, we offer realistic, vivid visual experiences, helping your work shine in the most impressive way.\n<strong class=\"font-medium\">Storytelling</strong> - architecture is not only lines and structures, but also contains enthusiasm, philosophy and vision. We help each project to speak out, fully convey its spirit and identity.\n<strong class=\"font-medium\">Customer value</strong> - we not only create products, but also accompany customers to turn bold ideas into reality. Each project is a creative journey, where we and you shape a separate impression in the architectural world.",
	"about.team.title": "Our Team",
	"about.team.description": "We specializes in visualization services, supported by a diverse team of architects, archviz experts, creative directors, and editors.\nWe focus on transforming design concepts into captivating images and videos, enabling clients to visualize spaces before construction begins.\nOur architects ensure aesthetic and functional integrity, while our archviz team creates realistic and immersive visuals. Creative directors guide the strategic direction, and editors refine content to effectively communicate the design narrative. Through this collaboration, we deliver high-quality visual products that elevate the value of every architectural project.",
	"career.page.title": "Join Our Creative Team | Visual Ennode Careers",
	"career.page.description": "We’re hiring architects, 3D artists, editors, and creatives who believe in cinematic storytelling. Discover open positions and apply today.",
	"career.page.og.title": "Careers at Visual Ennode | CG & Video Production Team",
	"career.page.og.description": "Join our mission to elevate architecture through film. Submit your portfolio and become part of a dynamic creative team.",
	"career.page.twitter.title": "Careers | Visual Ennode",
	"career.page.twitter.description": "Join the creative team at Visual Ennode. We're hiring talented designers, editors, and project managers.",
	"career.form.title": "Job application",
	"career.form.position": "Position",
	"career.form.position_1.label": "Position 1",
	"career.form.position_2.label": "Position 2",
	"career.form.position_3.label": "Position 3",
	"career.form.position_4.label": "Position 4",
	"career.form.full_name": "Full Name",
	"career.form.first_name": "First Name",
	"career.form.middle_name": "Middle Name",
	"career.form.last_name": "Last Name",
	"career.form.nationality": "Nationality",
	"career.form.email": "Email Address",
	"career.form.portfolio": "Your Portfolio",
	"career.form.cv": "Your CV - PDF",
	"career.form.comment": "Your Comment",
	"career.form.agreement": "By clicking this button, I agree to terms & conditions.",
	"career.form.submit": "Submit",
	"contact.page.title": "Contact | Visual Ennode CG & Video Production",
	"contact.page.description": "Request a quote or discuss your architectural visualization needs. Contact Visual Ennode today.",
	"contact.page.og.title": "Request a Project | Contact Visual Ennode",
	"contact.page.og.description": "Have a project in mind? Our team is ready to support your marketing goals with stunning CG and video content.",
	"contact.form.title": "Let's talk",
	"contact.form.description": "Get connected",
	"contact.form.name": "What's your name",
	"contact.form.email": "Your email",
	"contact.form.phone": "Your phone number",
	"contact.form.company": "Your company",
	"contact.form.note": "Let's discuss about your project",
	"contact.form.submit": "Send",
	"contact.outline.title": "Contact us",
	"news.page.title": "News | Visual Ennode",
	"news.page.description": "Stay updated with the latest projects, announcements, and visual storytelling from Visual Ennode.",
	"news.section.subtitle": "Latest news and updates",
	"news.page.og.title": "Latest News | Visual Ennode",
	"news.page.og.description": "Discover our recent work, creative insights, and behind-the-scenes updates from the Visual Ennode team.",
	"news.page.twitter.title": "Visual Ennode | News & Updates",
	"news.page.twitter.description": "Explore our most recent updates and stories from architecture to cinematic visuals.",
	"ennode.arc.title": "ARC+",
	"ennode.arc.description": "We unite diverse departments for seamless collaboration",
	"ennode.digital.title": "Digital",
	"ennode.digital.description": "We are available on variable flatform",
	"digital.title": "Our Flatform",
	"digital.body": "At Visual Ennode, we not only create images, but also create experiences. We are a combination of architectural art and technological strength, between creative thinking and absolute accuracy.\n<strong class='font-bold'>We gather a diverse team</strong> - from architectural artist, creative director to talented editors. Each person is an important piece, together creating deep visual stories, turning ideas into vivid and charismatic footage.\nWith a deep understanding of the architecture and film editing techniques, we bring products that are not only true but also emotional convey. Each image, each motion is meticulously calculated to fully reproduce the spirit of the project, helping customers not only see but also feel the future space.\n<strong class='font-bold'>We are not only a design unit</strong> - we are stories in images, a bridge between ideas and reality, helping architects and real estate developers with their vision to closer to the world.",
	"work.page.title": "Portfolio | Architectural CG, Rendering & Cinematic Works",
	"work.page.description": "Explore our portfolio of cinematic architecture videos, 3D renderings, and marketing visuals for real estate and design.",
	"work.page.og.title": "Works | Visual Ennode Portfolio",
	"work.page.og.description": "See how we visualize architecture. From renderings to cinematic storytelling, explore our past projects.",
	"Search & Filter": "Search & Filter",
	projects: projects,
	"Search works...": "Search works...",
	Link: Link,
	"Please input all required fields": "Please input all required fields",
	"Send successfully, we will reply soon": "Send successfully, we will reply soon",
	"Too many requests, please try again tomorrow": "Too many requests, please try again tomorrow",
	"Several fields invalid, please check": "Several fields invalid, please check",
	"An unexpected error occurred, please contact us to help": "An unexpected error occurred, please contact us to help",
	"Thank you for your information": "Thank you for your information",
	"We have received your information,": "We have received your information,",
	"we will contact with you soon": "we will contact with you soon",
	"See us at": "See us at",
	"Current openning": "Current openning",
	"We always looking for potential designers so don't hesitate to send us your portfolio and CV.": "We always looking for potential designers so don't hesitate to send us your portfolio and CV.",
	"career.form.Archviz": "Archviz",
	"career.form.Parttime_Archviz": "Parttime Archviz",
	"career.form.Editor": "Editor",
	"career.form.Project_Manager": "Project Manager",
	"component.process.title": "Our process",
	"Image rendering": "Image rendering",
	"Contract – Work Commencement – Interim Review – Revisions – Final Inspection": "Contract – Work Commencement – Interim Review – Revisions – Final Inspection",
	"Work process": "Work process",
	Consultation: Consultation,
	"We discuss the client's requirements, project objectives, and scope. The optimal solution is proposed based on the project style, timeline, and budget. A final quotation is sent, and mutual agreement is reached before proceeding.": "We discuss the client's requirements, project objectives, and scope. The optimal solution is proposed based on the project style, timeline, and budget. A final quotation is sent, and mutual agreement is reached before proceeding.",
	"Contract Signing": "Contract Signing",
	"Once the scope and pricing are agreed upon, a formal contract is signed. An initial deposit is made to confirm the project. The production schedule and key milestones are finalized and shared.": "Once the scope and pricing are agreed upon, a formal contract is signed. An initial deposit is made to confirm the project. The production schedule and key milestones are finalized and shared.",
	"Project Kickoff": "Project Kickoff",
	"We collect and analyze essential materials (blueprints, reference images, etc.). The initial project brief is created and distributed to the CG and editing teams. Basic modeling, scene setup, and primary composition begin.": "We collect and analyze essential materials (blueprints, reference images, etc.). The initial project brief is created and distributed to the CG and editing teams. Basic modeling, scene setup, and primary composition begin.",
	"Interim Review": "Interim Review",
	"The first draft is produced and shared with the client (key scenes, camera movement, color scheme, etc.). Client feedback is incorporated, and secondary revisions are implemented. Lighting, textures, and detailed refinements enhance the realism and quality of the video.": "The first draft is produced and shared with the client (key scenes, camera movement, color scheme, etc.). Client feedback is incorporated, and secondary revisions are implemented. Lighting, textures, and detailed refinements enhance the realism and quality of the video.",
	"Final Adjustments": "Final Adjustments",
	"The second draft is delivered for the final round of client feedback. Sound design, color correction, and final edits are applied. Once the client approves the final version, encoding and file formatting are completed.": "The second draft is delivered for the final round of client feedback. Sound design, color correction, and final edits are applied. Once the client approves the final version, encoding and file formatting are completed.",
	"Delivery & Final Payment": "Delivery & Final Payment",
	"The client makes the final payment after reviewing the completed work. All files are organized and delivered in the requested format (Full HD / 4K, etc.). Post-delivery support and additional client requests are reviewed.": "The client makes the final payment after reviewing the completed work. All files are organized and delivered in the requested format (Full HD / 4K, etc.). Post-delivery support and additional client requests are reviewed.",
	"New update": "New update",
	"See more": "See more",
	Previous: Previous,
	Next: Next,
	"Our flatforms": "Our flatforms",
	"Visual Ennode flatforms": "Visual Ennode flatforms",
	"VisualEnnode. Company Profile 2024": "VisualEnnode. Company Profile 2024",
	News: News,
	"The latest news of Visual Ennode": "The latest news of Visual Ennode",
	"STORY MAKE VALUE": "STORY MAKE VALUE",
	Kakaotalk: Kakaotalk,
	Whatsapp: Whatsapp,
	Instagram: Instagram,
	Youtube: Youtube,
	"Graphics, more than just value": "Graphics, more than just value"
};

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      theme,
      className: "toaster group",
      "data-koreanable": true,
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg !text-base !items-center !gap-3",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};

function GlobalParallax() {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pointer = useRef({
    x: 0,
    y: 0,
    // outer (ring) smoothed
    ox: -9999,
    oy: -9999,
    // inner (dot) smoothed
    ix: -9999,
    iy: -9999
  });
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0 || window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const isFine = window.matchMedia ? window.matchMedia("(pointer: fine)").matches : true;
    const isWide = typeof window.innerWidth === "number" ? window.innerWidth >= 640 : true;
    const shouldEnable = !isTouch && isFine && isWide;
    setEnabled(shouldEnable);
    if (!shouldEnable) return;
    let raf = 0;
    function onMove(e) {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    const outerEase = 0.125;
    const innerEase = 0.1625;
    function loop() {
      const p = pointer.current;
      if (p.ox === -9999) {
        p.ox = p.x;
        p.oy = p.y;
        p.ix = p.x;
        p.iy = p.y;
      }
      p.ox += (p.x - p.ox) * outerEase;
      p.oy += (p.y - p.oy) * outerEase;
      p.ix += (p.ox - p.ix) * innerEase;
      p.iy += (p.oy - p.iy) * innerEase;
      if (outerRef.current) {
        outerRef.current.style.transform = `translate3d(${p.ox}px, ${p.oy}px, 0) translate(-50%, -50%)`;
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${p.ix}px, ${p.iy}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);
  if (!mounted || !enabled) return null;
  return /* @__PURE__ */ jsxs("div", { "aria-hidden": true, className: "pointer-events-none", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: outerRef,
        className: "global-cursor fixed left-0 top-0 z-[9999] w-10 h-10 rounded-full border-2 border-gray-300/60",
        style: { transform: "translate3d(-50%, -50%, 0)", willChange: "transform" }
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: innerRef,
        className: "fixed left-0 top-0 z-[9999] w-6 h-6 rounded-full bg-gray-300/60",
        style: { transform: "translate3d(-50%, -50%, 0)", willChange: "transform" }
      }
    )
  ] });
}

function LoadingCounter({ onFinish }) {
  const count = useMotionValue(0);
  const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (typeof window === "undefined") return;
    const controls = animate(count, 100, { duration: 1.5, ease: "easeOut" });
    const unsubscribe = count.onChange((v) => {
      if (v >= 100) {
        onFinish?.();
        controls.stop();
      }
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, onFinish, prefersReduced]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "img",
      "aria-label": "Loading",
      "aria-live": "polite",
      className: "flex items-center justify-center",
      style: { width: "100%", height: "100%" },
      children: /* @__PURE__ */ jsx("div", { className: "relative w-96 h-96 sm:w-96 sm:h-96 select-none flex items-center justify-center", children: /* @__PURE__ */ jsxs(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 907.09 748.35",
          className: "w-48 h-48 md:w-80 md:h-80",
          role: "img",
          "aria-label": "logo",
          children: [
            /* @__PURE__ */ jsx("style", { children: `
              .fill { fill: #fff }
              /* fallback style in case JS animation doesn't run */
              .mask-fallback { transform-box: fill-box; transform-origin: 50% 100%; }
            ` }),
            /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("mask", { id: "revealMask", children: [
              /* @__PURE__ */ jsx("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: "black" }),
              /* @__PURE__ */ jsx(
                motion$1.rect,
                {
                  className: "mask-fallback",
                  x: "0",
                  y: "0",
                  width: "100%",
                  height: "100%",
                  fill: "white",
                  initial: { translateY: "100%" },
                  animate: { translateY: "0%" },
                  transition: { duration: 1, delay: 0.3, ease: "easeOut" }
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxs("g", { mask: "url(#revealMask)", children: [
              /* @__PURE__ */ jsx("polygon", { className: "fill", points: "373.32 650.33 448.15 423.18 800.59 423.18 800.59 325.16 480.44 325.16 555.27 98.02 693.47 98.02 693.47 0 506.15 0 506.15 0 467.33 0 290.05 538.12 288.53 542.99 288.49 542.86 228.41 725.22 236.03 748.35 341.03 748.35 341.03 748.35 907.71 748.35 907.71 650.33 373.32 650.33" }),
              /* @__PURE__ */ jsx("polygon", { className: "fill", points: "168.5 542.36 228.42 350.23 119.2 0 -.63 0 168.5 542.36" })
            ] })
          ]
        }
      ) })
    }
  );
}

const links = () => [
  {
    rel: "icon",
    href: "/favicon-dark.jpg",
    type: "image/jpeg",
    id: "light-scheme-icon"
  },
  {
    rel: "icon",
    href: "/favicon.jpg",
    type: "image/jpeg",
    id: "dark-scheme-icon"
  }
];
const handle$1 = {
  i18n: "common"
};
async function loader$b({ request, params }) {
  const api = new Api();
  const url = new URL(request.url);
  const hasLocaleParam = Boolean(params.locale);
  if (!hasLocaleParam) {
    const target = `/${i18n.fallbackLng}${url.pathname === "/" ? "" : url.pathname}${url.search}`;
    return redirect(target);
  }
  const locale = params.locale ?? i18n.fallbackLng;
  if (!i18n.supportedLngs.includes(locale)) {
    return redirect(`/${i18n.fallbackLng}${url.pathname}${url.search}`);
  }
  const t = await i18next.getFixedT(locale);
  const banners = await api.getBanners().then((res) => res.data.data) ?? [];
  const base = Object.fromEntries(
    Object.keys(genericTranslations).map((key) => [key, t(key)])
  );
  let localeExtras = {};
  try {
    const localeFile = await import(
      /* @vite-ignore */
      `public/locales/${locale}/common.json`
    );
    localeExtras = localeFile && (localeFile.default ?? localeFile);
  } catch (err) {
  }
  const translations = {
    ...base,
    // only add keys that are not already present in base so t(key) continues
    // to control canonical string translations, but arrays/objects from the
    // locale file will be available as extras (e.g. about.process.steps)
    ...Object.fromEntries(
      Object.keys(localeExtras).filter((k) => !(k in base)).map((k) => [k, localeExtras[k]])
    )
  };
  return {
    configuration: await api.getConfiguration(),
    translations,
    locale,
    banners
  };
}
function App() {
  const { locale, configuration, translations, banners } = useLoaderData();
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  const { i18n: i18n2 } = useTranslation();
  const scrollableRouteIds = [
    "routes/($locale).works.$category",
    "routes/($locale).works.$category.$work",
    "routes/($locale).career._index",
    "routes/($locale).contact._index",
    "routes/($locale).about._index",
    "routes/($locale).news._index",
    "routes/($locale).news.$slug._index"
  ];
  const scrollable = scrollableRouteIds.includes(lastMatch.id);
  useChangeLanguage(locale);
  const [overlayVisible, setOverlayVisible] = useState(locale === "ko");
  useEffect(() => {
  }, [locale]);
  useEffect(() => {
    if (!document) return;
    const lightSchemeIcon = document.querySelector("link#light-scheme-icon");
    const darkSchemeIcon = document.querySelector("link#dark-scheme-icon");
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    matcher.addEventListener("change", onUpdate);
    function onUpdate() {
      if (matcher.matches) {
        lightSchemeIcon.remove();
        document.head.append(darkSchemeIcon);
      } else {
        document.head.append(lightSchemeIcon);
        darkSchemeIcon?.remove();
      }
    }
    return () => {
      matcher.removeEventListener("change", onUpdate);
    };
  }, []);
  return /* @__PURE__ */ jsxs("html", { suppressHydrationWarning: true, lang: locale, dir: i18n2.dir(), className: cn("overscroll-none scroll-smooth", locale === "ko" ? "ko-solid" : ""), translate: "no", style: { scrollBehavior: "smooth" }, children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx("meta", { name: "mobile-web-app-capable", content: "yes" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, minimal-ui" }),
      /* @__PURE__ */ jsx("meta", { property: "og:title", content: "Visual Ennode: We visualize - We connect" }),
      /* @__PURE__ */ jsx("meta", { property: "og:type", content: "article" }),
      /* @__PURE__ */ jsx("meta", { property: "og:image", content: "https://visualennode.com/images/thumbnail.jpg" }),
      /* @__PURE__ */ jsx("meta", { property: "og:url", content: "https://visualennode.com/" }),
      /* @__PURE__ */ jsx("meta", { property: "og:description", content: "Contact us today to discuss your next project and transform your ideas into stunning visual realities." }),
      /* @__PURE__ */ jsx("meta", { property: "og:site_name", content: "Visual Ennode Co., LTD" }),
      /* @__PURE__ */ jsx("meta", { name: "google", content: "notranslate" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx("link", { rel: "alternate", hrefLang: "en", href: `https://visualennode.com/en/` }),
      /* @__PURE__ */ jsx("link", { rel: "alternate", hrefLang: "ko", href: `https://visualennode.com/ko/` }),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs(
      "body",
      {
        suppressHydrationWarning: true,
        className: cn(
          scrollable ? "" : "lock-scroll"
        ),
        children: [
          /* @__PURE__ */ jsx(Header, { brand: configuration.brand.data, translations, locale }),
          overlayVisible && /* @__PURE__ */ jsx("div", { className: "text-center max-w-screen-md w-full mx-auto my-8", children: /* @__PURE__ */ jsx(LoadingCounter, { onFinish: () => setOverlayVisible(false) }) }),
          /* @__PURE__ */ jsx(
            Outlet,
            {
              context: {
                brand: configuration.brand.data,
                translations,
                locale,
                banners
              }
            }
          ),
          /* @__PURE__ */ jsx(GlobalParallax, {}),
          /* @__PURE__ */ jsx(Toaster, { richColors: true, position: "top-right", icons: {
            error: /* @__PURE__ */ jsx("svg", { "data-testid": "geist-icon", className: "size-5", strokeLinejoin: "round", viewBox: "0 0 16 16", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M8.55846 0.5C9.13413 0.5 9.65902 0.829456 9.90929 1.34788L15.8073 13.5653C16.1279 14.2293 15.6441 15 14.9068 15H1.09316C0.355835 15 -0.127943 14.2293 0.192608 13.5653L6.09065 1.34787C6.34092 0.829454 6.86581 0.5 7.44148 0.5H8.55846ZM8.74997 4.75V5.5V8V8.75H7.24997V8V5.5V4.75H8.74997ZM7.99997 12C8.55226 12 8.99997 11.5523 8.99997 11C8.99997 10.4477 8.55226 10 7.99997 10C7.44769 10 6.99997 10.4477 6.99997 11C6.99997 11.5523 7.44769 12 7.99997 12Z", fill: "currentColor" }) })
          } }),
          /* @__PURE__ */ jsx(ScrollRestoration, {}),
          /* @__PURE__ */ jsx(Scripts, {})
        ]
      }
    )
  ] });
}
function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("h1", { children: [
        error.status,
        " ",
        error.statusText
      ] }),
      /* @__PURE__ */ jsx("p", { children: error.data })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("h1", { children: "Error!" }),
    /* @__PURE__ */ jsx("p", { children: error?.message ?? "Unknown error" })
  ] });
}

const route0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: App,
  handle: handle$1,
  links,
  loader: loader$b
}, Symbol.toStringTag, { value: 'Module' }));

const CarouselContext = React.createContext(null);
function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}
const Carousel = React.forwardRef(
  ({
    orientation = "horizontal",
    opts,
    setApi,
    plugins,
    className,
    children,
    ...props
  }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y"
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const onSelect = React.useCallback((api2) => {
      if (!api2) {
        return;
      }
      setCanScrollPrev(api2.canScrollPrev());
      setCanScrollNext(api2.canScrollNext());
    }, []);
    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);
    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);
    const handleKeyDown = React.useCallback(
      (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );
    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }
      setApi(api);
    }, [api, setApi]);
    React.useEffect(() => {
      if (!api) {
        return;
      }
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);
      return () => {
        api?.off("select", onSelect);
      };
    }, [api, onSelect]);
    return /* @__PURE__ */ jsx(
      CarouselContext.Provider,
      {
        value: {
          carouselRef,
          api,
          opts,
          orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext
        },
        children: /* @__PURE__ */ jsx(
          "div",
          {
            ref,
            onKeyDownCapture: handleKeyDown,
            className: cn("relative", className),
            role: "region",
            "aria-roledescription": "carousel",
            ...props,
            children
          }
        )
      }
    );
  }
);
Carousel.displayName = "Carousel";
const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return /* @__PURE__ */ jsx("div", { ref: carouselRef, className: "overflow-hidden h-full", children: /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn(
        "flex",
        orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
        className
      ),
      ...props
    }
  ) });
});
CarouselContent.displayName = "CarouselContent";
const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      role: "group",
      "aria-roledescription": "slide",
      className: cn(
        // make the item a positioned container so absolutely-positioned
        // children (like a close button) are placed relative to the slide
        "relative min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      ),
      ...props
    }
  );
});
CarouselItem.displayName = "CarouselItem";
const CarouselPrevious = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref,
      className: cn(
        "absolute h-[calc(100%_+_2px)] flex items-center justify-center w-14 md:w-40 !p-0 rounded-none bg-gradient-to-r from-[#1b1b1b] via-[33%] via-[#1b1b1b] to-transparent",
        orientation === "horizontal" ? "left-0 top-1/2 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        !canScrollPrev ? "opacity-0" : "",
        className
      ),
      disabled: !canScrollPrev,
      onClick: scrollPrev,
      ...props,
      children: [
        /* @__PURE__ */ jsx("svg", { width: "22", height: "43", viewBox: "0 0 22 43", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "-scale-x-100", children: /* @__PURE__ */ jsx("path", { d: "M1.70795 0.300026L21.7067 20.7757C21.7997 20.8708 21.8735 20.9837 21.9238 21.108C21.9741 21.2322 22 21.3655 22 21.5C22 21.6345 21.9741 21.7678 21.9238 21.892C21.8735 22.0163 21.7997 22.1292 21.7067 22.2243L1.70795 42.7C1.61505 42.7951 1.50475 42.8705 1.38337 42.922C1.26198 42.9735 1.13188 43 1.0005 43C0.869109 43 0.739008 42.9735 0.617623 42.922C0.496237 42.8705 0.385943 42.7951 0.293039 42.7C0.105409 42.5079 0 42.2473 0 41.9756C0 41.8411 0.02588 41.7079 0.0761596 41.5836C0.126439 41.4594 0.200134 41.3464 0.293039 41.2513L19.5844 21.5L0.293039 1.74868C0.200134 1.65356 0.126439 1.54063 0.0761596 1.41636C0.02588 1.29208 0 1.15887 0 1.02435C0 0.889832 0.02588 0.75663 0.0761596 0.632351C0.126439 0.508072 0.200134 0.395145 0.293039 0.300026C0.385943 0.204906 0.496237 0.129456 0.617623 0.0779762C0.739008 0.0264969 0.869109 0 1.0005 0C1.13188 0 1.26198 0.0264969 1.38337 0.0779762C1.50475 0.129456 1.61505 0.204906 1.70795 0.300026Z", fill: "white", fillOpacity: "0.25" }) }),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Previous slide" })
      ]
    }
  );
});
CarouselPrevious.displayName = "CarouselPrevious";
const CarouselNext = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref,
      className: cn(
        "absolute h-[calc(100%_+_2px)] flex items-center justify-center w-14 md:w-40 !p-0 rounded-none bg-gradient-to-r from-transparent via-[66%] via-[#1b1b1b] to-[#1b1b1b]",
        orientation === "horizontal" ? "right-0 top-1/2 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        !canScrollNext ? "opacity-0" : "",
        className
      ),
      disabled: !canScrollNext,
      onClick: scrollNext,
      ...props,
      children: [
        /* @__PURE__ */ jsx("svg", { width: "22", height: "43", viewBox: "0 0 22 43", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M1.70795 0.300026L21.7067 20.7757C21.7997 20.8708 21.8735 20.9837 21.9238 21.108C21.9741 21.2322 22 21.3655 22 21.5C22 21.6345 21.9741 21.7678 21.9238 21.892C21.8735 22.0163 21.7997 22.1292 21.7067 22.2243L1.70795 42.7C1.61505 42.7951 1.50475 42.8705 1.38337 42.922C1.26198 42.9735 1.13188 43 1.0005 43C0.869109 43 0.739008 42.9735 0.617623 42.922C0.496237 42.8705 0.385943 42.7951 0.293039 42.7C0.105409 42.5079 0 42.2473 0 41.9756C0 41.8411 0.02588 41.7079 0.0761596 41.5836C0.126439 41.4594 0.200134 41.3464 0.293039 41.2513L19.5844 21.5L0.293039 1.74868C0.200134 1.65356 0.126439 1.54063 0.0761596 1.41636C0.02588 1.29208 0 1.15887 0 1.02435C0 0.889832 0.02588 0.75663 0.0761596 0.632351C0.126439 0.508072 0.200134 0.395145 0.293039 0.300026C0.385943 0.204906 0.496237 0.129456 0.617623 0.0779762C0.739008 0.0264969 0.869109 0 1.0005 0C1.13188 0 1.26198 0.0264969 1.38337 0.0779762C1.50475 0.129456 1.61505 0.204906 1.70795 0.300026Z", fill: "white", fillOpacity: "0.25" }) }),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Next slide" })
      ]
    }
  );
});
CarouselNext.displayName = "CarouselNext";

const MOBILE_BREAKPOINT = 768;
function useIsMobile(breakpoint) {
  breakpoint = breakpoint ?? MOBILE_BREAKPOINT;
  const [isMobile, setIsMobile] = React.useState(void 0);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < breakpoint);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}

const loader$a = async ({ params }) => {
  try {
    const locale = params.locale || "en";
    const api = new Api();
    const flatforms = await api.getFlatforms(locale).then((res) => res.data.data);
    return { flatforms };
  } catch (error) {
    return { flatforms: [] };
  }
};
const meta$a = ({ matches }) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;
  return [
    { title: title(rootMatch.translations["Our flatforms"]) },
    { name: "description", content: rootMatch.translations["Visual Ennode flatforms"] }
  ];
};
function Career$2() {
  const { translations: t } = useOutletContext();
  const { flatforms } = useLoaderData();
  const isMobile = useIsMobile();
  return /* @__PURE__ */ jsx("section", { className: "h-dvh max-h-dvh bg-[#1b1b1b] text-white overflow-auto", children: /* @__PURE__ */ jsxs(Container, { className: "h-dvh max-h-dvh grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-36 !py-0", children: [
    /* @__PURE__ */ jsx("div", { className: "h-full flex items-center justify-center", "data-koreanable": true, children: /* @__PURE__ */ jsxs("div", { className: "pt-32 lg:pt-0", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-bold text-2xl mb-7", children: t["digital.title"] }),
      t["digital.body"].split("\n").map((row, index) => /* @__PURE__ */ jsx("p", { className: "font-extralight text-[15px] leading-loose mb-7 last:mb-0", dangerouslySetInnerHTML: { __html: row } }, index))
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: cn("pb-20 lg:pb-0", !isMobile ? "h-dvh" : ""), children: /* @__PURE__ */ jsxs(
      Carousel,
      {
        opts: {
          active: !isMobile,
          align: "start"
        },
        orientation: "vertical",
        className: "h-full",
        children: [
          /* @__PURE__ */ jsx(CarouselContent, { className: "h-full -mt-5 relative", children: flatforms.map((flatform, index) => {
            return /* @__PURE__ */ jsx(CarouselItem, { className: "pt-5 basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsx("img", { src: flatform.attachment_url, className: "mb-1", alt: flatform.title }),
              /* @__PURE__ */ jsx("a", { href: flatform.link_platform, target: "_blank", rel: "noreferrer", className: "font-bold", children: flatform.title }),
              /* @__PURE__ */ jsx("a", { href: flatform.link_platform, className: "font-extralight", target: "_blank", rel: "noreferrer", children: flatform.link_platform })
            ] }) }, index);
          }) }),
          !isMobile ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(CarouselPrevious, { className: "absolute top-0 !w-full !h-14 !rotate-0 *:rotate-90 !z-40 bg-gradient-to-b" }),
            /* @__PURE__ */ jsx(CarouselNext, { className: "absolute bottom-0 !w-full !h-14 !rotate-0 *:rotate-90 bg-gradient-to-b" })
          ] }) : null
        ]
      }
    ) })
  ] }) });
}

const route1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Career$2,
  loader: loader$a,
  meta: meta$a
}, Symbol.toStringTag, { value: 'Module' }));

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute group-[.custom-close]:hidden right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

async function loader$9({ params }) {
  const workSlug = params.work ?? "";
  const categorySlug = params.category ?? "";
  const locale = params.locale ?? "en";
  const api = new Api();
  let categories;
  let work;
  try {
    categories = await api.getCategories(locale).then((response) => response.data.data);
  } catch {
    throw new Response("Not Found", { status: 404 });
  }
  const category = categories.find((category2) => category2.slug === categorySlug);
  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }
  try {
    work = await api.getWork(locale, workSlug).then((response) => response.data.data);
  } catch {
    throw new Response("Not Found", { status: 404 });
  }
  return {
    work,
    category
  };
}
const meta$9 = ({ data }) => {
  return [
    { title: title(data?.work.title) },
    { name: "description", content: data?.work.description }
  ];
};
function Works$2() {
  const navigate = useNavigate();
  const { work, category } = useLoaderData();
  const [loaded, setLoaded] = useState(!work.optimize_attachment_url);
  const [open, setOpen] = useState(true);
  const videoRef = useRef(null);
  function handleClickOutside(event) {
    event.preventDefault();
    const element = event.target;
    if (element && element.classList.contains("overlay")) {
      setOpen(false);
    }
  }
  function handeLoadImage() {
    setLoaded(true);
  }
  useEffect(() => {
    if (!open) {
      navigate("../", {
        preventScrollReset: true,
        replace: true
      });
    }
  }, [open, navigate]);
  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const left = document.querySelector(".work-nav-left");
        if (left) left.click();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const right = document.querySelector(".work-nav-right");
        if (right) right.click();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(
    DialogContent,
    {
      className: "overlay outline-none max-w-full p-0 h-[calc(100dvh_-_theme('spacing.32'))] max-h-[calc(100dvh_-_theme('spacing.32'))] flex items-center justify-center bg-transparent border-none rounded-none w-full group custom-close",
      onClick: handleClickOutside,
      children: [
        /* @__PURE__ */ jsx(DialogTitle, { className: "hidden h-0", children: /* @__PURE__ */ jsx(DialogDescription, {}) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Close",
            onClick: () => setOpen(false),
            className: "absolute right-6 top-6 z-50 bg-black/40 hover:bg-black/60 rounded-full p-2",
            children: /* @__PURE__ */ jsx(CrossIcon, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          Link$1,
          {
            to: { pathname: `/works/image/work-a` },
            className: "work-nav-left flex-none text-white absolute left-2 cursor-pointer",
            preventScrollReset: true,
            viewTransition: true,
            children: /* @__PURE__ */ jsx(ChevronLeftIcon, { className: "size-10 drop-shadow" })
          }
        ),
        category.slug === "image" ? /* @__PURE__ */ jsx(
          motion.img,
          {
            src: loaded ? work.attachment_url : work.optimize_attachment_url ? work.optimize_attachment_url : work.attachment_url,
            alt: work.title,
            className: "max-h-full mx-auto",
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              x: 0
            },
            fetchPriority: "high",
            onLoad: handeLoadImage,
            exit: { opacity: 0 }
          }
        ) : /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0 },
            className: "max-h-full mx-auto relative",
            children: [
              /* @__PURE__ */ jsx(
                "video",
                {
                  ref: videoRef,
                  src: work.attachment_url,
                  autoPlay: true,
                  loop: true,
                  playsInline: true,
                  disablePictureInPicture: true,
                  onContextMenu: (e) => e.preventDefault(),
                  className: "max-h-full mx-auto w-full",
                  children: /* @__PURE__ */ jsx("track", { kind: "captions", src: "/empty.vtt", srcLang: "en", label: "English captions" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": "Toggle play",
                  onClick: (ev) => {
                    ev.stopPropagation();
                    const v = videoRef.current;
                    if (!v) return;
                    if (v.paused) {
                      void v.play();
                    } else {
                      v.pause();
                    }
                  },
                  className: "absolute left-4 bottom-4 z-50 bg-black/40 hover:bg-black/60 rounded-full p-2 text-white",
                  children: "▶︎/▮▮"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          Link$1,
          {
            to: { pathname: `/works/image/work-b` },
            className: "work-nav-right flex-none text-white absolute right-2 cursor-pointer",
            preventScrollReset: true,
            viewTransition: true,
            children: /* @__PURE__ */ jsx(ChevronRightIcon, { className: "size-10 drop-shadow" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute text-white flex-col sm:flex-row -bottom-16 h-16 flex items-center justify-center gap-1", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-sm sm:text-base font-semibold", children: work.title }),
          /* @__PURE__ */ jsx("span", { className: "text-sm sm:text-base font-extralight", children: work.description })
        ] })
      ]
    }
  ) });
}

const route2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Works$2,
  loader: loader$9,
  meta: meta$9
}, Symbol.toStringTag, { value: 'Module' }));

const TeamSection = forwardRef((props, ref) => {
  const { translations: t } = useOutletContext();
  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      ref,
      className: "min-h-screen bg-[#1b1b1b] flex flex-col items-center py-20 overflow-x-hidden relative overscroll-none",
      ...props,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "absolute z-0 w-1/2 h-4/5 2xl:h-auto right-0 top-0 hidden xl:block", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-[#1b1b1b] via-[#1b1b1b]/80 to-[#1b1b1b]/40 absolute w-1/2 left-0 top-0 h-full" }),
          /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-l from-[#1b1b1b] via-[#1b1b1b]/80 to-[#1b1b1b]/40 absolute w-1/2 right-0 top-0 h-full" }),
          /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-t from-[#1b1b1b] via-[#1b1b1b]/60 to-transparent absolute h-1/2 bottom-0 w-full" }),
          /* @__PURE__ */ jsx("img", { src: "/images/value-about.jpg", className: "w-full object-cover h-full", alt: "" })
        ] }),
        /* @__PURE__ */ jsx(Container, { className: "text-white lg:h-full", ref: containerRef, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col xl:w-1/2 text-justify justify-end h-full", "data-koreanable": true, children: [
          /* @__PURE__ */ jsx("h2", { className: "font-bold text-2xl mb-7 mt-auto", children: t["about.team.title"] }),
          t["about.team.description"].split("\n").map((row, index) => /* @__PURE__ */ jsx("p", { className: "font-light text-base leading-loose mb-7 last:mb-0", children: row }, index))
        ] }) }),
        /* @__PURE__ */ jsxs(
          Carousel,
          {
            className: "w-full transition-[width] text-white duration-500 mt-14 mb-14",
            ref: carouselRef,
            opts: {
              // align start so multiple items can be visible and swiped
              align: "start",
              containScroll: "trimSnaps",
              slidesToScroll: 1
            },
            children: [
              /* @__PURE__ */ jsx(CarouselContent, { className: "mx-auto container px-5 bg-[#1b1b1b]", children: (props.teams ?? []).map((member, index) => {
                return /* @__PURE__ */ jsxs(
                  CarouselItem,
                  {
                    className: "basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6",
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "aspect-[3/4] bg-black/90", children: /* @__PURE__ */ jsx("img", { src: member.attachment_url, alt: member.name, className: "object-cover w-full h-full" }) }),
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-col mt-4", children: [
                        /* @__PURE__ */ jsx("h3", { className: "font-bold", children: member.name }),
                        /* @__PURE__ */ jsx("p", { className: "font-light", children: member.tags[0] })
                      ] })
                    ]
                  },
                  index
                );
              }) }),
              /* @__PURE__ */ jsx(CarouselPrevious, {}),
              /* @__PURE__ */ jsx(CarouselNext, {})
            ]
          }
        )
      ]
    }
  );
});
TeamSection.displayName = "TeamSection";

async function loader$8({ params }) {
  const api = new Api();
  const locale = params.locale ?? "en";
  const teams = await api.getEmployees(locale).then((res) => res.data.data);
  return {
    teams
  };
}
function Career$1() {
  const { teams } = useLoaderData();
  return /* @__PURE__ */ jsx(TeamSection, { teams });
}

const route3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Career$1,
  loader: loader$8
}, Symbol.toStringTag, { value: 'Module' }));

const ContactSection = forwardRef((props, forwardedRef) => {
  const ref = useRef(null);
  const { translations: t, locale } = useOutletContext();
  const inView = useInView(ref, { amount: 1 });
  useImperativeHandle(forwardedRef, () => ref.current);
  useEffect(() => {
    const headerDom = document.getElementById("header");
    if (!headerDom || !inView) return;
    headerDom.dataset.variant = "light";
  }, [inView]);
  return /* @__PURE__ */ jsx("section", { ref, className: "flex", ...props, children: /* @__PURE__ */ jsxs(Container, { className: "flex-none flex flex-col lg:h-full mt-8 py-6 sm:mt-12", children: [
    (() => {
      const titleText = t["component.contact.title"];
      if (locale === "ko" && /[A-Za-z]/.test(titleText)) {
        return /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", "data-koreanable": true, children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 md:mb-3", children: /* @__PURE__ */ jsx("span", { className: "montserrat-for-en", children: titleText }) }),
          /* @__PURE__ */ jsx("p", { className: "font-normal text-sm sm:text-base md:text-lg text-[#959595] uppercase", children: t["component.contact.description"] })
        ] });
      }
      return /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", "data-koreanable": true, children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 md:mb-3", children: titleText }),
        /* @__PURE__ */ jsx("p", { className: "font-normal text-sm sm:text-base md:text-lg text-[#959595] uppercase", children: t["component.contact.description"] })
      ] });
    })(),
    /* @__PURE__ */ jsx("div", { className: "mt-auto mb-14", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 text-white text-sm sm:text-base font-extralight", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: montserratIfKo(t["component.contact.address_1.name"], locale), children: t["component.contact.address_1.name"] }),
        /* @__PURE__ */ jsx("p", { className: montserratIfKo(t["component.contact.address_1.address"], locale), children: t["component.contact.address_1.address"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: montserratIfKo(t["component.contact.address_2.name"], locale), children: t["component.contact.address_2.name"] }),
        /* @__PURE__ */ jsx("p", { className: montserratIfKo(t["component.contact.address_2.address"], locale), children: t["component.contact.address_2.address"] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: montserratIfKo(t["component.contact.address_3.name"], locale), children: t["component.contact.address_3.name"] }),
        /* @__PURE__ */ jsx("p", { className: montserratIfKo(t["component.contact.address_3.address"], locale), children: t["component.contact.address_3.address"] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(ContactCtaSection, {})
  ] }) });
});
ContactSection.displayName = "ContactSection";

async function loader$7({ params }) {
  const locale = params.locale ?? "en";
  const slug = params.slug;
  let news;
  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }
  const api = new Api();
  try {
    news = await api.getNews(locale, slug).then(async (response) => {
      return response.data.data;
    });
  } catch {
    throw new Response("Not Found", { status: 404 });
  }
  return {
    news
  };
}
const meta$8 = ({ data }) => {
  return [
    { title: title(data?.news.title) },
    { name: "description", content: data?.news.description }
  ];
};
function NewsDetailPage() {
  const { news } = useLoaderData();
  useOutletContext();
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function renderMarks(text, marks) {
    if (!marks || !marks.length) return escapeHtml(text);
    return marks.reduce((acc, mark) => {
      if (mark.type === "bold" || mark.type === "strong") return `<strong>${acc}</strong>`;
      if (mark.type === "italic" || mark.type === "em") return `<em>${acc}</em>`;
      if (mark.type === "strike" || mark.type === "s") return `<s>${acc}</s>`;
      if (mark.type === "link") return `<a href="${escapeHtml(mark.attrs?.href || "#")}">${acc}</a>`;
      return acc;
    }, escapeHtml(text));
  }
  function renderInline(node) {
    if (!node) return "";
    if (node.type === "text") return renderMarks(node.text || "", node.marks);
    if (node.type === "hardBreak") return "<br/>";
    if (Array.isArray(node.content)) return node.content.map(renderInline).join("");
    return "";
  }
  function renderNode(node) {
    if (!node) return "";
    const type = node.type;
    switch (type) {
      case "doc":
        return (node.content || []).map(renderNode).join("");
      case "paragraph":
        return `<p>${(node.content || []).map(renderInline).join("")}</p>`;
      case "heading": {
        const level = node.attrs?.level || 1;
        return `<h${level}>${(node.content || []).map(renderInline).join("")}</h${level}>`;
      }
      case "bulletList":
        return `<ul>${(node.content || []).map(renderNode).join("")}</ul>`;
      case "orderedList":
        return `<ol>${(node.content || []).map(renderNode).join("")}</ol>`;
      case "listItem":
        return `<li>${(node.content || []).map(renderInline).join("")}</li>`;
      case "horizontalRule":
        return "<hr/>";
      case "blockquote":
        return `<blockquote>${(node.content || []).map(renderNode).join("")}</blockquote>`;
      case "codeBlock":
        return `<pre><code>${escapeHtml((node.content || []).map((c) => c.text || "").join("\n"))}</code></pre>`;
      case "image":
        return `<figure><img src="${escapeHtml(node.attrs?.src || "")}" alt="${escapeHtml(node.attrs?.alt || "")}"/></figure>`;
      case "customVideo": {
        const src = node.attrs?.src || "";
        return `<div style="position:relative;padding-top:56.25%"><iframe src="${escapeHtml(src)}" style="position:absolute;left:0;top:0;width:100%;height:100%;border:0;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
      }
      default:
        if (Array.isArray(node.content)) return node.content.map(renderNode).join("");
        return "";
    }
  }
  let contentHtml = "";
  try {
    if (news.content) {
      const parsed = JSON.parse(news.content);
      const CustomVideo = Node.create({
        name: "customVideo",
        group: "block",
        atom: true,
        addAttributes() {
          return {
            src: { default: null },
            textAlign: { default: null }
          };
        },
        parseHTML() {
          return [{ tag: "div[data-custom-video]" }];
        },
        renderHTML({ node }) {
          const src = node.attrs.src || "";
          return [
            "div",
            { style: "position:relative;padding-top:56.25%;" },
            [
              "iframe",
              {
                src,
                style: "position:absolute;left:0;top:0;width:100%;height:100%;border:0;",
                allow: "autoplay; fullscreen; picture-in-picture",
                allowFullScreen: "true"
              }
            ]
          ];
        }
      });
      try {
        contentHtml = generateHTML(parsed, [StarterKitModule, Image, CustomVideo]);
      } catch (innerErr) {
        console.error("generateHTML failed, falling back to simple renderer:", innerErr);
        try {
          contentHtml = renderNode(parsed);
        } catch (renderErr) {
          console.error("fallback render failed:", renderErr);
          contentHtml = news.content ?? "";
        }
      }
    }
  } catch (err) {
    console.error("news content -> generateHTML error:", err);
    contentHtml = news.content ?? "";
  }
  useEffect(() => {
    function onContext(e) {
      e.preventDefault();
    }
    document.addEventListener("contextmenu", onContext);
    return () => document.removeEventListener("contextmenu", onContext);
  }, []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("section", { className: "h-dvh overflow-auto", children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "w-full h-full max-h-[65%] relative flex items-center justify-center bg-no-repeat bg-top bg-fixed",
          style: { backgroundImage: `url(${news.attachment_url})` },
          children: [
            /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-t from-[#1b1b1b]/0 to-[#1b1b1b] absolute inset-0" }),
            /* @__PURE__ */ jsxs(Container, { className: "relative", variant: "lg", children: [
              /* @__PURE__ */ jsx("span", { className: "text-white font-extralight text-xs mb-5 xl:mb-7 inline-block", children: new Date(news.published_at).toLocaleDateString("vi-VN", {
                month: "2-digit",
                year: "numeric",
                day: "2-digit"
              }) }),
              /* @__PURE__ */ jsx("h1", { className: "text-4xl xl:text-5xl font-black text-white", "data-koreanable": true, children: news.title })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        Container,
        {
          className: "prose prose-invert prose-md py-7 sm:py-14 xl:py-20",
          "data-koreanable": true,
          variant: "lg",
          dangerouslySetInnerHTML: { __html: contentHtml }
        }
      )
    ] }),
    /* @__PURE__ */ jsx(ContactSection, {})
  ] });
}

const route4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: NewsDetailPage,
  loader: loader$7,
  meta: meta$8
}, Symbol.toStringTag, { value: 'Module' }));

function getProjectPriority(projectTitle) {
  const priorityOrder = {
    "Battery Warehouse": 1,
    "Solar Panel Balcony": 2,
    "Parking lot": 3,
    "Warm house": 4,
    "Takaho Brand Showroom": 5,
    "Basement": 6,
    // This covers both Basement and Basement Renovation
    "Post Office": 7,
    "Commercial Building": 8,
    "Evergreen Nursing Hospital": 9,
    "Office Center": 10,
    "Party Club": 11,
    "Complex Apartment": 12,
    "Gyeonggi-do 00 Jugong Apartment Reconstruction": 13,
    "S-Factory": 14,
    "Etispace House": 15,
    "MOA Town Plan (Gireum-dong, Seongbuk-gu)": 16,
    "MOA Town Plan (Samseon-dong, Seongbuk-gu)": 17,
    "RIV Office": 18,
    "Police Office": 19,
    "Yeosu Expo": 20,
    "Office Building": 21,
    "Osan-si, Gyeonggi-do Apartment plan in": 22,
    "Daemyoung Energy Battery Plant": 23,
    "Geoje Island Café": 24,
    "T.K E&C Aerial View": 25,
    "Wedding Hall Renovation": 26
  };
  if (priorityOrder[projectTitle]) {
    return priorityOrder[projectTitle];
  }
  for (const [priorityTitle, priority] of Object.entries(priorityOrder)) {
    if (projectTitle.includes(priorityTitle) || priorityTitle.includes(projectTitle)) {
      return priority;
    }
  }
  if (projectTitle.toLowerCase().includes("basement")) {
    return priorityOrder["Basement"];
  }
  if (projectTitle.toLowerCase().includes("daemyoung energy")) {
    return priorityOrder["Daemyoung Energy Battery Plant"];
  }
  return null;
}
function groupWorksByProject(works) {
  const projectMap = /* @__PURE__ */ new Map();
  works.forEach((work) => {
    const normalizedTitle = normalizeProjectTitle(work.title);
    if (!projectMap.has(normalizedTitle)) {
      projectMap.set(normalizedTitle, []);
    }
    projectMap.get(normalizedTitle).push(work);
  });
  const organizedProjectsWithKey = [];
  projectMap.forEach((projectWorks, projectTitle) => {
    const sortedWorks = sortWorksWithinProject(projectWorks);
    const images = sortedWorks.map((work) => {
      const linkVideo = typeof work.link_video === "string" && work.link_video !== "" && work.link_video !== "null" ? work.link_video : null;
      const optimizeCandidate = String(work.optimize_attachment_url || "");
      const attachmentCandidate = String(work.attachment_url || "");
      const isOptimizeVideo = /\.(mp4|webm|m3u8)(\?|$)/i.test(optimizeCandidate);
      const isAttachmentVideo = /\.(mp4|webm|m3u8)(\?|$)/i.test(attachmentCandidate);
      let resolvedVideoUrl = null;
      if (isAttachmentVideo) {
        resolvedVideoUrl = attachmentCandidate;
      } else if (isOptimizeVideo) {
        resolvedVideoUrl = optimizeCandidate;
      } else if (linkVideo) {
        resolvedVideoUrl = linkVideo;
      }
      return {
        id: work.slug,
        // use the optimized attachment as the poster/thumbnail
        url: work.optimize_attachment_url || work.attachment_url,
        mediaType: resolvedVideoUrl ? "video" : "image",
        videoUrl: resolvedVideoUrl ?? null,
        title: work.title,
        description: work.description,
        type: detectImageTypeFromWork(work),
        tags: work.tags.map((tag) => tag.name.en)
      };
    });
    const projectObj = {
      title: projectTitle,
      description: sortedWorks[0]?.description ?? "",
      images,
      totalImages: images.length
    };
    const representativeKey = sortedWorks[0] && sortedWorks[0].slug ? sortedWorks[0].slug : projectTitle;
    organizedProjectsWithKey.push({ project: projectObj, key: representativeKey });
  });
  organizedProjectsWithKey.sort((a, b) => {
    const priorityA = getProjectPriority(a.project.title);
    const priorityB = getProjectPriority(b.project.title);
    if (priorityA !== null && priorityB !== null) {
      return priorityB - priorityA;
    }
    if (priorityA !== null && priorityB === null) return -1;
    if (priorityA === null && priorityB !== null) return 1;
    return a.project.title.localeCompare(b.project.title, void 0, { sensitivity: "base" });
  });
  return organizedProjectsWithKey.map((p) => p.project);
}
function normalizeProjectTitle(title) {
  const normalized = title.replace(/-\d+$/, "").replace(/\s+\d+$/, "").trim();
  const specialCases = {
    "Dongdeamun Design Plaza": "Dongdaemun Design Plaza",
    "Dongdaemun Design Plaza": "Dongdaemun Design Plaza",
    "VE Residence Building": "VE Residence Building",
    "Lom.Haijai Residences": "Lom.Haijai Residences",
    "A-Frame Evolution": "A-Frame Evolution",
    "Modern Apartment": "Modern Apartment",
    "Tropical House": "Tropical House",
    "AMOS Lobby Renovation": "AMOS Lobby Renovation",
    "Wedding Hall Renovation": "Wedding Hall Renovation",
    "T.K E&C Aerial View": "T.K E&C Aerial View",
    "Geoje Island Café": "Geoje Island Café",
    "Daemyoung Energy Battery Plant": "Daemyoung Energy Battery Plant",
    "RIV Office": "RIV Office",
    "Office Center": "Office Center",
    "Solar Panel Balcony": "Solar Panel Balcony",
    "Car Parking Lot": "Car Parking Lot",
    "Ino Block": "Ino Block",
    "Complex apartment": "Complex Apartment",
    "Osan apartment": "Osan Apartment",
    "Osan-si, Gyeonggi-do Apartment plan in": "Osan-si, Gyeonggi-do Apartment plan in",
    "S-Factory": "S-Factory",
    "Battery Warehouse": "Battery Warehouse",
    "Parking lot": "Parking lot",
    "Warm house": "Warm house",
    "Takaho Brand Showroom": "Takaho Brand Showroom",
    "Basement": "Basement",
    "Basement Renovation": "Basement",
    "Post Office": "Post Office",
    "Commercial Building": "Commercial Building",
    "Evergreen Nursing Hospital": "Evergreen Nursing Hospital",
    "Party Club": "Party Club",
    "Etispace House": "Etispace House",
    "Police Office": "Police Office",
    "Yeosu Expo": "Yeosu Expo",
    "Office Building": "Office Building"
  };
  return specialCases[normalized] || normalized;
}
function sortWorksWithinProject(works) {
  const typePriority = {
    "Hero": 1,
    "Aerial": 2,
    "Exterior": 3,
    "Interior": 4,
    "Detail": 5,
    "Concept": 6
  };
  return works.sort((a, b) => {
    if (a.link_video && !b.link_video) return -1;
    if (!a.link_video && b.link_video) return 1;
    const aType = detectImageTypeFromWork(a);
    const bType = detectImageTypeFromWork(b);
    return typePriority[aType] - typePriority[bType];
  });
}
function detectImageTypeFromWork(work) {
  const tags = work.tags.map((tag) => tag.name.en.toLowerCase());
  const title = work.title.toLowerCase();
  if (tags.includes("aerial")) return "Aerial";
  if (tags.includes("exterior")) return "Exterior";
  if (tags.includes("interior")) return "Interior";
  if (title.includes("aerial") || title.includes("bird")) return "Aerial";
  if (title.includes("exterior") || title.includes("outside") || title.includes("facade")) return "Exterior";
  if (title.includes("interior") || title.includes("inside") || title.includes("room")) return "Interior";
  if (title.includes("detail") || title.includes("close")) return "Detail";
  if (title.includes("concept") || title.includes("sketch")) return "Concept";
  return "Hero";
}

async function loader$6({ params, request }) {
  const slug = params.category ?? "";
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const tagId = url.searchParams.get("tag_id") ?? "";
  const locale = params.locale ?? "en";
  const api = new Api();
  const categories = await api.getCategories(locale).then((response) => response.data.data);
  const category = categories.find(
    (category2) => category2.slug === slug
  );
  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }
  const works = await api.getWorks(locale, category.slug, query, tagId).then((response) => response.data.data);
  const tags = await api.getTags(locale).then((response) => response.data.data);
  const projects = groupWorksByProject(works);
  return {
    locale,
    category,
    projects,
    tags
  };
}
const meta$7 = ({
  data
}) => {
  return [
    {
      title: title(
        data?.locale === "ko" ? data.category.slug === "image" ? "조감도 | 투시도 | 건축CG | 분양CG" : "건축CG영상" : data?.category.title
      )
    },
    { name: "description", content: data?.category.description }
  ];
};
function Works$1() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { translations: t } = useOutletContext();
  const { projects, tags } = useLoaderData();
  const [showSearch, setShowSearch] = useState(searchParams.get("q") ?? false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [emblaApi, setEmblaApi] = useState(null);
  function handleImageClick(project, imageIndex = 0) {
    setSelectedProject(project);
    setSelectedImageIndex(imageIndex);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setSelectedProject(null);
    setSelectedImageIndex(0);
  }
  const navigateImage = useCallback(
    (direction) => {
      if (!selectedProject) return;
      const totalImages = selectedProject.images.length;
      if (emblaApi) {
        if (direction === "prev") emblaApi.scrollPrev();
        else emblaApi.scrollNext();
        return;
      }
      if (direction === "prev") {
        setSelectedImageIndex((prev) => prev > 0 ? prev - 1 : totalImages - 1);
      } else {
        setSelectedImageIndex((prev) => prev < totalImages - 1 ? prev + 1 : 0);
      }
    },
    [selectedProject, emblaApi]
  );
  useEffect(() => {
    if (!showSearch) {
      setSearchParams(new URLSearchParams());
    }
  }, [showSearch, setSearchParams]);
  useEffect(() => {
    function handleKey(e) {
      if (!showModal) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateImage("prev");
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateImage("next");
      }
    }
    if (showModal) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [showModal, navigateImage]);
  useEffect(() => {
    function onContextMenu(e) {
      e.preventDefault();
    }
    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, []);
  return /* @__PURE__ */ jsxs("section", { className: "min-h-dvh h-auto text-white pt-20", children: [
    /* @__PURE__ */ jsxs(
      Container,
      {
        variant: "fluid",
        className: "sm:!px-10 mt-4 !py-0 flex flex-col md:flex-row md:items-center gap-5 md:gap-7",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5 flex-none", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: "font-semibold text-lg 2xl:text-xl flex items-center cursor-pointer",
                onClick: () => setShowSearch(!showSearch),
                children: [
                  showSearch ? /* @__PURE__ */ jsx(MinusIcon, { className: "size-5 mr-2" }) : /* @__PURE__ */ jsx(PlusIcon, { className: "size-5 mr-2" }),
                  t["Search & Filter"]
                ]
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "font-light text-sm 2xl:text-base", children: [
              projects.length,
              " ",
              t["projects"]
            ] })
          ] }),
          /* @__PURE__ */ jsx(AnimatePresence$1, { children: showSearch ? /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: "flex-none items-center gap-7 flex max-w-full grow",
              initial: { translateX: "-10%", opacity: 0 },
              animate: { translateX: "0%", opacity: 100 },
              exit: { translateX: "-10%", opacity: 0 },
              transition: { duration: 0.5 },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-32 flex-none", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "search",
                      className: "outline-none bg-transparent border-b border-b-white py-0.5 rounded-none",
                      placeholder: t["Search works..."],
                      defaultValue: searchParams.get("q") ?? "",
                      "data-koreanable": true,
                      onChange: (event) => {
                        const params = searchParams;
                        params.set("q", event.target.value.trim());
                        setSearchParams(params);
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(MagnifyingGlassIcon, { className: "-scale-x-100 text-white size-5" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-5 font-extralight overflow-auto max-w-full", children: tags.map((tag) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      const params = searchParams;
                      params.set("tag_id", tag.id);
                      setSearchParams(params);
                    },
                    children: tag.name
                  },
                  tag.id
                )) })
              ]
            }
          ) : null })
        ]
      }
    ),
    /* @__PURE__ */ jsx(Container, { variant: "fluid", className: "sm:!px-10", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2", children: projects.map((project, projectIndex) => {
      const coverImage = project.images[0];
      const isVideoCover = coverImage.mediaType === "video" && !!coverImage.videoUrl;
      return /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => handleImageClick(project, 0),
          className: "group cursor-pointer",
          onMouseEnter: () => {
            const vid = document.querySelector(`video[data-project-index="${projectIndex}"]`);
            if (vid) {
              vid.play().catch(() => {
              });
            }
          },
          onMouseLeave: () => {
            const vid = document.querySelector(`video[data-project-index="${projectIndex}"]`);
            if (vid) {
              vid.pause();
            }
          },
          children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: `aspect-[4/3] relative overflow-hidden transition-all duration-300 ${isVideoCover ? "group-hover:shadow-2xl" : "group-hover:shadow-2xl group-hover:bg-white/60"}`,
              children: [
                coverImage.mediaType === "video" && coverImage.videoUrl ? (
                  // If the videoUrl is a YouTube or Vimeo link, embed via iframe; otherwise use a native <video>
                  /youtube\.com|youtu\.be|vimeo\.com/i.test(coverImage.videoUrl) ? /* @__PURE__ */ jsx(
                    "iframe",
                    {
                      className: "w-full h-full object-cover",
                      src: coverImage.videoUrl.includes("youtu") ? coverImage.videoUrl.replace(/watch\?v=/, "embed/").replace("youtu.be/", "www.youtube.com/embed/") : coverImage.videoUrl.includes("vimeo") ? coverImage.videoUrl.replace(/vimeo\.com\//, "player.vimeo.com/video/") : coverImage.videoUrl,
                      title: project.title,
                      frameBorder: "0",
                      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                      allowFullScreen: true
                    }
                  ) : /* @__PURE__ */ jsx(
                    "video",
                    {
                      className: "w-full h-full object-cover",
                      src: coverImage.videoUrl,
                      muted: true,
                      playsInline: true,
                      loop: true,
                      preload: "metadata",
                      "data-project-index": projectIndex,
                      onLoadedMetadata: (e) => {
                        try {
                          const v = e.currentTarget;
                          if (v.readyState >= 1) {
                            v.currentTime = 0.05;
                            v.pause();
                          }
                        } catch (err) {
                        }
                      }
                    }
                  )
                ) : /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: coverImage.url,
                    alt: project.title,
                    className: "w-full h-full group-hover:scale-105 group-hover:blur-[1.5px] object-cover transition-transform duration-300",
                    loading: "lazy"
                  }
                ),
                isVideoCover ? (
                  // For video covers we hide the dark background but still show the title on hover
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none", children: /* @__PURE__ */ jsx("div", { className: "absolute bottom-[40%] left-0 right-0 p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out", children: /* @__PURE__ */ jsx(
                    "h3",
                    {
                      className: "font-medium text-lg mb-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out",
                      "data-koreanable": true,
                      children: project.title
                    }
                  ) }) })
                ) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out", children: /* @__PURE__ */ jsx("div", { className: "absolute bottom-[40%] left-0 right-0 p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out", children: /* @__PURE__ */ jsx(
                  "h3",
                  {
                    className: "font-medium text-lg mb-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out",
                    "data-koreanable": true,
                    children: project.title
                  }
                ) }) })
              ]
            }
          )
        },
        project.title
      );
    }) }) }),
    /* @__PURE__ */ jsx(AnimatePresence$1, { children: showModal && selectedProject && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.3, ease: "easeOut" },
        className: "fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4",
        onClick: (e) => {
          if (e.target === e.currentTarget) {
            closeModal();
          }
        },
        children: /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full max-w-7xl max-h-full flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center mb-4 px-4", children: [
            /* @__PURE__ */ jsx(
              "h2",
              {
                className: "text-2xl lg:text-3xl font-medium text-white mb-2",
                "data-koreanable": true,
                children: selectedProject.title
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-sm lg:text-base font-light", children: selectedProject.description })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center min-h-0 mb-6 relative", children: /* @__PURE__ */ jsx(
            Carousel,
            {
              setApi: (api) => {
                if (!api) return;
                setEmblaApi(api);
                if (typeof api.on === "function") {
                  api.on("select", () => {
                    const idx = api.selectedScrollSnap?.();
                    setSelectedImageIndex(typeof idx === "number" ? idx : 0);
                  });
                }
                if (typeof api.scrollTo === "function") {
                  api.scrollTo(selectedImageIndex || 0);
                }
              },
              children: /* @__PURE__ */ jsx(CarouselContent, { className: "h-full", children: selectedProject.images.map((img) => /* @__PURE__ */ jsx(CarouselItem, { className: "relative w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "relative inline-block max-w-full", children: [
                img.mediaType === "video" && img.videoUrl ? /youtube\.com|youtu\.be|vimeo\.com/i.test(img.videoUrl) ? /* @__PURE__ */ jsx(
                  "iframe",
                  {
                    src: img.videoUrl.includes("youtu") ? img.videoUrl.replace(/watch\?v=/, "embed/").replace("youtu.be/", "www.youtube.com/embed/") : img.videoUrl.includes("vimeo") ? img.videoUrl.replace(/vimeo\.com\//, "player.vimeo.com/video/") : img.videoUrl,
                    className: "max-w-full max-h-[60vh] object-contain rounded-lg",
                    title: selectedProject.title,
                    frameBorder: "0",
                    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                    allowFullScreen: true
                  }
                ) : /* @__PURE__ */ jsx(
                  "video",
                  {
                    src: img.videoUrl || void 0,
                    className: "max-w-full max-h-[60vh] object-contain rounded-lg",
                    controls: true,
                    autoPlay: true,
                    playsInline: true,
                    controlsList: "nodownload",
                    muted: true
                  }
                ) : /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: img.url,
                    alt: img.title,
                    className: "max-w-full max-h-[60vh] object-contain rounded-lg"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: closeModal,
                    "aria-label": "Close",
                    className: "absolute right-3 top-3 z-50 text-white transition-colors bg-black/40 hover:bg-black/60 rounded-full p-3 cursor-pointer ring-2 ring-white/20",
                    children: /* @__PURE__ */ jsx(CrossIcon, { className: "w-4 h-4" })
                  }
                )
              ] }) }, img.id)) })
            }
          ) }),
          selectedProject.images.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => navigateImage("prev"),
                className: "absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3",
                children: /* @__PURE__ */ jsx(ChevronLeftIcon, { className: "w-6 h-6" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => navigateImage("next"),
                className: "absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3",
                children: /* @__PURE__ */ jsx(ChevronRightIcon, { className: "w-6 h-6" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-none px-2 sm:px-4 pb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex gap-1 sm:gap-2 justify-start sm:justify-center scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pb-2", children: selectedProject.images.map((image, index) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  if (emblaApi && typeof emblaApi.scrollTo === "function") {
                    emblaApi.scrollTo(index);
                  } else {
                    setSelectedImageIndex(index);
                  }
                },
                className: `flex-none w-16 h-12 sm:w-20 sm:h-16 rounded-md overflow-hidden transition-all duration-200 hover:scale-105 ${index === selectedImageIndex ? "ring-2 ring-white ring-offset-1 sm:ring-offset-2 ring-offset-black" : "opacity-70 hover:opacity-100"}`,
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: image.url,
                    alt: image.title,
                    className: "w-full h-full object-cover",
                    loading: "lazy",
                    onError: (e) => {
                      const img = e.target;
                      if (img.src.includes("optimize_attachment_url")) {
                        const fallbackSrc = image.url.replace(/optimize_attachment_url/g, "attachment_url");
                        img.src = fallbackSrc;
                      }
                    }
                  }
                )
              },
              image.id
            )) }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 sm:mt-4 text-center text-gray-300", children: /* @__PURE__ */ jsx("span", { className: "text-xs sm:text-sm", children: (() => {
              const imgs = selectedProject.images;
              const imageCount = imgs.filter((it) => it.mediaType === "image").length;
              const videoCount = imgs.filter((it) => it.mediaType === "video").length;
              if (videoCount > 0 && imageCount === 0) {
                return `${videoCount} ${videoCount === 1 ? "video" : "videos"}`;
              }
              if (imageCount > 0 && videoCount === 0) {
                return `${imageCount} ${imageCount === 1 ? "image" : "images"}`;
              }
              return `${videoCount} ${videoCount === 1 ? "video" : "videos"} · ${imageCount} ${imageCount === 1 ? "image" : "images"}`;
            })() }) })
          ] })
        ] })
      }
    ) })
  ] });
}

const route5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Works$1,
  loader: loader$6,
  meta: meta$7
}, Symbol.toStringTag, { value: 'Module' }));

function LottieThankYou() {
  const playerRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ensureScript = () => {
      if (document.querySelector("script[data-lottie]") || typeof customElements !== "undefined" && customElements.get("lottie-player")) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        const s = document.createElement("script");
        s.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
        s.async = true;
        s.setAttribute("data-lottie", "1");
        s.onload = () => resolve();
        document.body.appendChild(s);
      });
    };
    ensureScript().catch(() => {
    });
    const captured = playerRef.current;
    return () => {
      try {
        const el = captured;
        const obs = el?.__lottieScaleObserver;
        if (obs && typeof obs.disconnect === "function") obs.disconnect();
      } catch (err) {
      }
    };
  }, []);
  return /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "mb-4 h-24", children: /* @__PURE__ */ jsx(
    "lottie-player",
    {
      ref: playerRef,
      src: "/videos/waiting sand.json",
      background: "transparent",
      speed: "1",
      loop: true,
      autoplay: true,
      "aria-hidden": true,
      style: { width: "100%", height: "100%", display: "block" },
      className: "object-cover bg-transparent"
    }
  ) });
}
const meta$6 = ({
  matches
}) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;
  return [
    { title: title(rootMatch.translations["contact.page.title"]) },
    {
      name: "description",
      content: rootMatch.translations["contact.page.description"]
    },
    {
      property: "og:title",
      content: rootMatch.translations["contact.page.og.title"]
    },
    {
      property: "og:description",
      content: rootMatch.translations["contact.page.og.description"]
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com/contact" },
    {
      property: "og:image",
      content: "https://www.visualennode.com/images/og-cover.jpg"
    },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: rootMatch.translations["contact.page.og.title"]
    },
    {
      name: "twitter:description",
      content: rootMatch.translations["contact.page.og.description"]
    },
    {
      name: "twitter:image",
      content: "https://www.visualennode.com/images/og-cover.jpg"
    }
  ];
};
async function action$1({ request, params }) {
  const api = new Api();
  const formData = await request.formData();
  const locale = params.locale ?? "en";
  const name = formData.get("name");
  const company_name = formData.get("company_name");
  let phone = formData.get("phone");
  phone = phone ? phone.replace(/-/g, "") : "";
  const email = formData.get("email")?.trim() ?? "";
  const emailDomain = formData.get("email_domain")?.trim() ?? "";
  const discuss = formData.get("discuss");
  if (!name || !company_name || !phone || !email || !discuss || !emailDomain) {
    return {
      errorCode: 422
    };
  }
  const _crypto = typeof crypto !== "undefined" ? crypto : void 0;
  const debugId = _crypto && typeof _crypto.randomUUID === "function" ? _crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const data = {
    name,
    email: email + "@" + emailDomain,
    phone,
    company_name,
    discuss,
    debug_id: debugId
  };
  console.log("[contact] outgoing payload", {
    debugId,
    name,
    email: data.email,
    phone,
    company_name
  });
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json") || request.headers.get("X-Requested-With") === "XMLHttpRequest";
  return await api.sendEmailContactApi(data, locale).then((res) => {
    console.log("[contact] backend response", {
      debugId,
      status: res.status,
      data: res.data
    });
    const ok = { errorCode: 0, debugId };
    return wantsJson ? json(ok) : ok;
  }).catch((err) => {
    console.log("[contact] error", { debugId, err });
    if (api.isValidationResponse(err)) {
      const resp2 = {
        errorCode: 422,
        message: err.response?.data.message,
        debugId
      };
      return wantsJson ? json(resp2, { status: 422 }) : resp2;
    }
    if (api.isTooManyRequestsResponse(err)) {
      const resp2 = { errorCode: 429, debugId };
      return wantsJson ? json(resp2, { status: 429 }) : resp2;
    }
    const resp = { errorCode: 500, debugId };
    return wantsJson ? json(resp, { status: 500 }) : resp;
  });
}
function Contact() {
  const { translations: tRaw, locale } = useOutletContext();
  const t = tRaw;
  const emailLabel = t["Email"] ?? "Email";
  const actionData = useActionData();
  const navigation = useNavigation();
  const formRef = useRef(null);
  const [success, setSuccess] = useState(false);
  const isMobile = useIsMobile(1024);
  useEffect(() => {
    if (!actionData) return;
    if (actionData.errorCode != 0) {
      let message;
      if (actionData.errorCode === 429) {
        message = t["Too many requests, please try again tomorrow"];
      } else if (actionData.errorCode === 422) {
        message = "message" in actionData ? actionData.message : t["Please input all required fields"];
      } else {
        message = t["An unexpected error occurred, please contact us to help"];
      }
      toast.error(message);
      return;
    }
    setSuccess(true);
    formRef.current?.reset();
  }, [actionData, t]);
  return /* @__PURE__ */ jsxs("div", { className: locale === "ko" ? "ko-solid" : "", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "fixed inset-0 bg-[#1b1b1b] hidden flex-col justify-center items-center z-10 py-12 px-5",
          success && "flex"
        ),
        children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-5xl mx-auto p-4 md:p-6 flex items-center justify-center h-full", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center w-full", children: [
          /* @__PURE__ */ jsx(LottieThankYou, {}),
          /* @__PURE__ */ jsx("h2", { className: `text-white font-extrabold text-4xl md:text-6xl tracking-tight mb-4 ${montserratIfKo("THANK YOU", locale)}`, children: "THANK YOU" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[#bcbcbc] text-base md:text-xl max-w-xl mb-6", children: [
            /* @__PURE__ */ jsx("span", { className: "md:block", children: t["We have received your information,"] }),
            " ",
            t["we will contact with you soon"]
          ] }),
          /* @__PURE__ */ jsx(
            Link$1,
            {
              to: localePath(locale, "index"),
              className: `px-4 py-2 bg-white text-[#1b1b1b] rounded-none text-xs font-semibold ${montserratIfKo("BACK TO HOME", locale)}`,
              children: "BACK TO HOME"
            }
          )
        ] }) })
      }
    ),
    /* @__PURE__ */ jsx("div", { children: isMobile ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "section",
        {
          className: "h-dvh max-w-dvh overflow-auto flex",
          "data-koreanable": true,
          children: /* @__PURE__ */ jsxs(Container, { className: "!py-20 text-white my-auto", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start w-full 2xl:mb-14", children: [
              /* @__PURE__ */ jsx("div", { className: "w-80 flex-none hidden lg:block" }),
              /* @__PURE__ */ jsx("div", { className: "grow w-full", children: /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-5 mt-14 lg:mt-0 mb-14 4xl:mb-30", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 md:mb-3", children: t["contact.form.title"] }),
                /* @__PURE__ */ jsx("p", { className: "font-normal text-sm sm:text-base md:text-lg text-[#959595] uppercase", children: t["contact.form.description"] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start w-full", children: [
              /* @__PURE__ */ jsxs("div", { className: "w-80 flex-none hidden lg:block", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-2xl mb-7", children: t["contact.outline.title"] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-7", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(t["Hotline"], locale)}`, children: t["Hotline"] }),
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-base ${montserratIfKo("+82 2 515 7400", locale)}`, children: "+82 2 515 7400" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(t["Email"], locale)}`, children: t["Email"] }),
                    /* @__PURE__ */ jsx("p", { className: "font-extralight text-base font-sans", children: "contact@visualennode.com" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(t["Kakaotalk"], locale)}`, children: t["Kakaotalk"] }),
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-base font-sans ${montserratIfKo("visualennode", locale)}`, children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://pf.kakao.com/_ggesn/chat",
                        target: "_blank",
                        rel: "noreferrer",
                        className: "underline underline-offset-4 decoration-[#878787] decoration-1",
                        children: "visualennode"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(t["Whatsapp"], locale)}`, children: t["Whatsapp"] }),
                    /* @__PURE__ */ jsx("p", { className: "font-extralight text-base font-sans", children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://wa.me/message/UPCT3MQH3LGSF1",
                        target: "_blank",
                        rel: "noreferrer",
                        className: "underline underline-offset-4 decoration-[#878787] decoration-1",
                        children: "+82 2 515 7400"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(t["Instagram"], locale)}`, children: t["Instagram"] }),
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-base font-sans ${montserratIfKo("visual_ennode", locale)}`, children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://www.instagram.com/visual_ennode",
                        target: "_blank",
                        rel: "noreferrer",
                        className: "underline underline-offset-4 decoration-[#878787] decoration-1",
                        children: "visual_ennode"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(t["Youtube"], locale)}`, children: t["Youtube"] }),
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-base font-sans ${montserratIfKo("visual_ennode", locale)}`, children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://www.youtube.com/@visualennode",
                        target: "_blank",
                        rel: "noreferrer",
                        className: "underline underline-offset-4 decoration-[#878787] decoration-1",
                        children: "visual_ennode"
                      }
                    ) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grow w-full", children: /* @__PURE__ */ jsxs(Form, { method: "post", ref: formRef, children: [
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 md:gap-x-36 gap-y-14", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-full text-base md:text-xl flex-none", children: t["contact.form.name"] }),
                    /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "name",
                        name: "name",
                        className: "text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]",
                        spellCheck: "false",
                        autoComplete: "off"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-full text-base md:text-xl flex-none", children: t["contact.form.company"] }),
                    /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "company_name",
                        name: "company_name",
                        className: "text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]",
                        spellCheck: "false",
                        autoComplete: "off"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-full text-base md:text-xl flex-none", children: t["contact.form.phone"] }),
                    /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "phone",
                        name: "phone",
                        className: "text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]",
                        spellCheck: "false",
                        autoComplete: "off",
                        type: "text",
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                        }
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-full text-base md:text-xl flex-none", children: t["contact.form.email"] }),
                    /* @__PURE__ */ jsxs("div", { className: "grow w-full flex items-end", children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          id: "email",
                          name: "email",
                          type: "text",
                          className: "text-lg rounded-none py-1 pr-2 bg-transparent outline-none border-b border-[#878787] w-full",
                          spellCheck: "false",
                          autoComplete: "off"
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "py-1.5 inline-block border-b border-[#878787] flex-none", children: "@" }),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          name: "email_domain",
                          type: "text",
                          className: "text-lg rounded-none py-1 pl-2 bg-transparent outline-none border-b border-[#878787] w-full sm:w-36",
                          spellCheck: "false",
                          autoComplete: "off",
                          placeholder: "example.com"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "xl:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-full text-base md:text-xl flex-none", children: t["contact.form.note"] }),
                    /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        name: "discuss",
                        id: "discuss",
                        className: "rounded-none bg-transparent outline-none border-b border-[#878787] py-1",
                        rows: 4
                      }
                    ) })
                  ] }) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start mt-14", children: /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "submit",
                    disabled: navigation.state === "submitting",
                    className: "border-2 border-white hover:bg-transparent hover:text-white uppercase bg-white text-[#1b1b1b] flex items-center gap-2 px-3 py-2 font-medium text-2xl",
                    children: [
                      navigation.state === "submitting" ? /* @__PURE__ */ jsx(SpinnerIcon, { className: "size-6" }) : null,
                      " ",
                      t["contact.form.submit"]
                    ]
                  }
                ) })
              ] }) })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        "section",
        {
          className: cn(
            "lg:hidden h-dvh max-h-dvh overflow-auto flex py-7 sm:py-14 lg:py-20",
            isMobile ? "page-scroller-skip" : ""
          ),
          "data-koreanable": true,
          children: /* @__PURE__ */ jsxs(Container, { className: "flex-none m-auto", children: [
            /* @__PURE__ */ jsx("div", { className: "text-center my-14", children: /* @__PURE__ */ jsx("h3", { className: "font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 md:mb-3", children: t["contact.outline.title"] }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-7 xs:gap-14", children: [
              /* @__PURE__ */ jsxs(
                Link$1,
                {
                  to: "tel:+821030702402",
                  className: "flex flex-col text-center items-center",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: "/images/hotline.svg",
                        alt: "Hotline",
                        className: "size-10 sm:size-16"
                      }
                    ) }),
                    /* @__PURE__ */ jsx("span", { className: `font-medium text-lg sm:text-2xl text-[#c3c3c3] ${montserratIfKo(t["Hotline"], locale)}`, children: t["Hotline"] }),
                    /* @__PURE__ */ jsx("span", { className: `font-light text-sm sm:text-lg text-[#c3c3c3] ${montserratIfKo("+82 2 515 7400", locale)}`, children: "+82 2 515 7400" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Link$1,
                {
                  to: "mailto:contact@visualennode.com",
                  className: "flex flex-col text-center items-center",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: "/images/mail.svg",
                        alt: emailLabel,
                        className: "size-10 sm:size-16"
                      }
                    ) }),
                    /* @__PURE__ */ jsx("span", { className: `font-medium text-lg sm:text-2xl text-[#c3c3c3] ${montserratIfKo(emailLabel, locale)}`, children: emailLabel }),
                    /* @__PURE__ */ jsx("span", { className: `font-light text-sm sm:text-lg text-[#c3c3c3] font-sans ${montserratIfKo("contact@visualennode.com", locale)}`, children: "contact@visualennode.com" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Link$1,
                {
                  to: "https://pf.kakao.com/_ggesn/chat",
                  target: "_blank",
                  rel: "noreferrer",
                  className: "flex flex-col text-center items-center",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: "/images/talk.svg",
                        alt: "Kakaotalk",
                        className: "size-10 sm:size-16"
                      }
                    ) }),
                    /* @__PURE__ */ jsx("span", { className: `font-medium text-lg sm:text-2xl text-[#c3c3c3] ${montserratIfKo(t["Kakaotalk"], locale)}`, children: t["Kakaotalk"] }),
                    /* @__PURE__ */ jsx("span", { className: `font-light text-sm sm:text-lg text-[#c3c3c3] font-sans ${montserratIfKo("visualennode", locale)}`, children: "visualennode" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Link$1,
                {
                  to: "https://wa.me/+821030702402",
                  target: "_blank",
                  rel: "noreferrer",
                  className: "flex flex-col text-center items-center",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: "/images/whatsapp.svg",
                        alt: "Whatsapp",
                        className: "size-10 sm:size-16"
                      }
                    ) }),
                    /* @__PURE__ */ jsx("span", { className: `font-medium text-lg sm:text-2xl text-[#c3c3c3] ${montserratIfKo(t["Whatsapp"], locale)}`, children: t["Whatsapp"] }),
                    /* @__PURE__ */ jsx("span", { className: `font-light text-sm sm:text-lg text-[#c3c3c3] font-sans ${montserratIfKo("+82 2 515 7400", locale)}`, children: "+82 2 515 7400" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Link$1,
                {
                  to: "https://instagram.com/visual_ennode",
                  target: "_blank",
                  rel: "noreferrer",
                  className: "flex flex-col text-center items-center",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: "/images/instagram.svg",
                        alt: "Instagram",
                        className: "size-10 sm:size-16"
                      }
                    ) }),
                    /* @__PURE__ */ jsx("span", { className: `font-medium text-lg sm:text-2xl text-[#c3c3c3] ${montserratIfKo(t["Instagram"], locale)}`, children: t["Instagram"] }),
                    /* @__PURE__ */ jsx("span", { className: `font-light text-sm sm:text-lg text-[#c3c3c3] font-sans ${montserratIfKo("visual_ennode", locale)}`, children: "visual_ennode" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Link$1,
                {
                  to: "https://youtube.com/visual_ennode",
                  target: "_blank",
                  rel: "noreferrer",
                  className: "flex flex-col text-center items-center",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: "/images/youtube.svg",
                        alt: "Youtube",
                        className: "size-10 sm:size-16"
                      }
                    ) }),
                    /* @__PURE__ */ jsx("span", { className: `font-medium text-lg sm:text-2xl text-[#c3c3c3] ${montserratIfKo(t["Youtube"], locale)}`, children: t["Youtube"] }),
                    /* @__PURE__ */ jsx("span", { className: `font-light text-sm sm:text-lg text-[#c3c3c3] font-sans ${montserratIfKo("visual_ennode", locale)}`, children: "visual_ennode" })
                  ]
                }
              )
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(ContactSection, {})
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "section",
        {
          className: "h-dvh max-w-dvh overflow-auto flex",
          "data-koreanable": true,
          children: /* @__PURE__ */ jsxs(Container, { className: "!py-20 text-white my-auto", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start w-full 2xl:mb-14", children: [
              /* @__PURE__ */ jsx("div", { className: "w-80 flex-none hidden lg:block" }),
              /* @__PURE__ */ jsx("div", { className: "grow w-full", children: /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-5 mt-14 lg:mt-0 mb-14 4xl:mb-30", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 md:mb-3", children: t["contact.form.title"] }),
                /* @__PURE__ */ jsx("p", { className: "font-normal text-sm sm:text-base md:text-lg text-[#959595] uppercase", children: t["contact.form.description"] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start w-full", children: [
              /* @__PURE__ */ jsxs("div", { className: "w-80 flex-none hidden lg:block", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-2xl mb-7", children: t["contact.outline.title"] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-7", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(t["Hotline"], locale)}`, children: t["Hotline"] }),
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-base font-sans ${montserratIfKo("+82 2 515 7400", locale)}`, children: "+82 2 515 7400" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(emailLabel, locale)}`, children: emailLabel }),
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-base font-sans ${montserratIfKo("contact@visualennode.com", locale)}`, children: "contact@visualennode.com" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(t["Kakaotalk"], locale)}`, children: t["Kakaotalk"] }),
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-base ${montserratIfKo("visualennode", locale)}`, children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://pf.kakao.com/_ggesn/chat",
                        target: "_blank",
                        rel: "noreferrer",
                        className: "underline underline-offset-4 decoration-[#878787] decoration-1 font-sans",
                        children: "visualennode"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(t["Whatsapp"], locale)}`, children: t["Whatsapp"] }),
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-base ${montserratIfKo("+82 2 515 7400", locale)}`, children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://wa.me/message/UPCT3MQH3LGSF1",
                        target: "_blank",
                        rel: "noreferrer",
                        className: "underline underline-offset-4 decoration-[#878787] decoration-1 font-sans",
                        children: "+82 2 515 7400"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(t["Instagram"], locale)}`, children: t["Instagram"] }),
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-base ${montserratIfKo("visual_ennode", locale)}`, children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://www.instagram.com/visual_ennode",
                        target: "_blank",
                        rel: "noreferrer",
                        className: "underline underline-offset-4 decoration-[#878787] decoration-1 font-sans",
                        children: "visual_ennode"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-xl ${montserratIfKo(t["Youtube"], locale)}`, children: t["Youtube"] }),
                    /* @__PURE__ */ jsx("p", { className: `font-extralight text-base ${montserratIfKo("visual_ennode", locale)}`, children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://www.youtube.com/@visualennode",
                        target: "_blank",
                        rel: "noreferrer",
                        className: "underline underline-offset-4 decoration-[#878787] decoration-1 font-sans",
                        children: "visual_ennode"
                      }
                    ) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grow w-full", children: /* @__PURE__ */ jsxs(Form, { method: "post", ref: formRef, children: [
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 md:gap-x-36 gap-y-14", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-full text-base md:text-xl flex-none", children: t["contact.form.name"] }),
                    /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "name",
                        name: "name",
                        className: "text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]",
                        spellCheck: "false",
                        autoComplete: "off"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-full text-base md:text-xl flex-none", children: t["contact.form.company"] }),
                    /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "company_name",
                        name: "company_name",
                        className: "text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]",
                        spellCheck: "false",
                        autoComplete: "off"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-full text-base md:text-xl flex-none", children: t["contact.form.phone"] }),
                    /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "phone",
                        name: "phone",
                        className: "text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]",
                        spellCheck: "false",
                        autoComplete: "off",
                        type: "text",
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                        }
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-full text-base md:text-xl flex-none", children: t["contact.form.email"] }),
                    /* @__PURE__ */ jsxs("div", { className: "grow w-full flex items-end", children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          id: "email",
                          name: "email",
                          type: "text",
                          className: "text-lg rounded-none py-1 pr-2 bg-transparent outline-none border-b border-[#878787] w-full",
                          spellCheck: "false",
                          autoComplete: "off"
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "py-1.5 inline-block border-b border-[#878787] flex-none", children: "@" }),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          name: "email_domain",
                          type: "text",
                          className: "text-lg rounded-none py-1 pl-2 bg-transparent outline-none border-b border-[#878787] w-full sm:w-36",
                          spellCheck: "false",
                          autoComplete: "off",
                          placeholder: "example.com"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "xl:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-full text-base md:text-xl flex-none", children: t["contact.form.note"] }),
                    /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        name: "discuss",
                        id: "discuss",
                        className: "rounded-none bg-transparent outline-none border-b border-[#878787] py-1",
                        rows: 4
                      }
                    ) })
                  ] }) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start mt-14", children: /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "submit",
                    disabled: navigation.state === "submitting",
                    className: "border-2 border-white hover:bg-transparent hover:text-white uppercase bg-white text-[#1b1b1b] flex items-center gap-2 px-3 py-2 font-medium text-2xl",
                    children: [
                      navigation.state === "submitting" ? /* @__PURE__ */ jsx(SpinnerIcon, { className: "size-6" }) : null,
                      " ",
                      t["contact.form.submit"]
                    ]
                  }
                ) })
              ] }) })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(ContactSection, {})
    ] }) })
  ] });
}

const route6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: Contact,
  meta: meta$6
}, Symbol.toStringTag, { value: 'Module' }));

function UploadInput({ id, name, onFileSelect }) {
  const [file, setFile] = useState(null);
  const handleChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    console.log(selectedFile);
    setFile(selectedFile);
    onFileSelect(name, selectedFile);
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-5 bg-[#282828] relative border border-black", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        id,
        name,
        type: "file",
        className: "opacity-0 inset-0 absolute",
        onChange: handleChange
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
      /* @__PURE__ */ jsx(UploadCloudIcon, { className: "size-10" }),
      /* @__PURE__ */ jsx("span", { className: "font-medium text-base", children: "Upload" }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-extralight", children: "Drag and drop file here" })
    ] }),
    file && /* @__PURE__ */ jsx("p", { className: "text-sm mt-2", children: file.name })
  ] });
}

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap border-b border-[#878787] bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-0 focus:border-[#878787] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

async function action({ request, params }) {
  const api = new Api();
  const formData = await request.formData();
  const locale = params.locale ?? "en";
  const last_name = formData.get("last_name");
  const first_name = formData.get("first_name");
  const middle_name = formData.get("middle_name");
  const email_address = formData.get("email_address");
  const position = formData.get("position");
  const nationality = formData.get("nationality");
  const comment = formData.get("comment");
  const cv = formData.get("cv");
  const portfolio = formData.get("portfolio");
  const data = new FormData();
  data.append("last_name", last_name);
  data.append("first_name", first_name);
  data.append("middle_name", middle_name);
  data.append("email_address", email_address);
  data.append("position", position);
  data.append("nationality", nationality);
  data.append("cv", cv);
  data.append("portfolio", portfolio);
  data.append("comment", comment);
  return await api.sendEmailCVApi(data, locale).then(async () => {
    return {
      errorCode: 0
    };
  }).catch((err) => {
    if (api.isValidationResponse(err)) {
      return {
        errorCode: 422,
        message: err.response?.data.message
      };
    }
    if (api.isTooManyRequestsResponse(err)) {
      return {
        errorCode: 429
      };
    }
    return {
      errorCode: 500
    };
  });
}
const meta$5 = ({ matches }) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;
  return [
    { title: title(rootMatch.translations["career.page.title"]) },
    { name: "description", content: rootMatch.translations["career.page.description"] },
    { property: "og:title", content: rootMatch.translations["career.page.og.title"] },
    { property: "og:description", content: rootMatch.translations["career.page.og.description"] },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com/career" },
    { property: "og:image", content: "https://www.visualennode.com/images/og-cover.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: rootMatch.translations["career.page.twitter.title"] },
    { name: "twitter:description", content: rootMatch.translations["career.page.twitter.description"] },
    { name: "twitter:image", content: "https://www.visualennode.com/images/og-cover.jpg" }
  ];
};
function Career() {
  const actionData = useActionData();
  const formRef = useRef(null);
  const { translations: t, brand, locale } = useOutletContext();
  const careerBlurb = t?.["We always looking for potential designers so don't hesitate to send us your portfolio and CV."];
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (!actionData) return;
    if (actionData.errorCode != 0) {
      let message;
      if (actionData.errorCode === 429) {
        message = t["Too many requests, please try again tomorrow"];
      } else if (actionData.errorCode === 422) {
        message = "message" in actionData ? actionData.message : t["Please input all required fields"];
      } else {
        message = t["An unexpected error occurred, please contact us to help"];
      }
      toast.error(message);
      return;
    }
    setSuccess(true);
    formRef.current?.reset();
  }, [actionData, t]);
  const [, setFiles] = useState({
    cv: null,
    portfolio: null
  });
  const handleFileSelect = (name, file) => {
    if (name !== "cv" && name !== "portfolio") {
      console.warn(`Unexpected file input name: ${name}`);
      return;
    }
    setFiles((prevFiles) => ({ ...prevFiles, [name]: file }));
  };
  const positions = ["Archviz", "Parttime Archviz", "Editor", "Project Manager"];
  return /* @__PURE__ */ jsxs("div", { className: locale === "ko" ? "ko-solid" : "", children: [
    /* @__PURE__ */ jsxs("div", { className: cn("fixed inset-0 bg-[#1b1b1b] flex-col justify-between z-10 py-20 px-5 hidden", success && "flex"), children: [
      /* @__PURE__ */ jsx("div", {}),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", "data-koreanable": true, children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: brand.url,
            alt: brand.description,
            className: "w-20 mb-10 lg:w-32 lg:mb-14"
          }
        ),
        /* @__PURE__ */ jsx("h3", { className: `text-[#bcbcbc] text-center font-semibold text-3xl md:text-5xl mb-2 md:mb-5 ${montserratIfKo(t["Thank you for your information"], locale)}`, children: t["Thank you for your information"] }),
        /* @__PURE__ */ jsxs("p", { className: "text-[#959595] text-xl md:text-3xl font-light text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "md:block", children: t["We have received your information,"] }),
          " ",
          t["we will contact with you soon"]
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center text-[#959595]", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl mr-4 md:text-3xl md:mr-7", children: t["See us at"] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 ml-auto", children: [
          /* @__PURE__ */ jsx(Link$1, { to: "https://instagram.com/visual_ennode", target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsx("img", { src: "/images/instagram.svg", className: "size-6 md:size-8", alt: "Instagram" }) }),
          /* @__PURE__ */ jsx(Link$1, { to: "https://www.youtube.com/@visualennode", target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsx("img", { src: "/images/youtube-square.svg", className: "size-6 md:size-8", alt: "YouTube" }) }),
          /* @__PURE__ */ jsx(Link$1, { to: "https://pf.kakao.com/_ggesn/chat", target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsx("img", { src: "/images/talk.svg", className: "size-6 md:size-8", alt: "Talk" }) }),
          /* @__PURE__ */ jsx(Link$1, { to: "https://www.facebook.com/profile.php?id=61573221556208", target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsx("img", { src: "/images/fb.svg", className: "size-6 md:size-8", alt: "Facebook" }) }),
          /* @__PURE__ */ jsx(Link$1, { to: "https://blog.naver.com/visualennode", target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsx("img", { src: "/images/blog.svg", className: "size-6 md:size-8", alt: "Blog" }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("section", { children: /* @__PURE__ */ jsxs(Container, { variant: "md", className: "!py-20", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-xl mb-7 text-white", "data-koreanable": true, children: t["Current openning"] }),
        (careerBlurb ?? "").split(/\r?\n/).map((line, i) => /* @__PURE__ */ jsx("p", { className: `text-base font-extralight leading-loose text-white ${i === 0 ? "" : "mt-0"}`, "data-koreanable": true, children: line }, i))
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-medium my-14 text-white", "data-koreanable": true, children: t["career.form.title"] }),
      /* @__PURE__ */ jsxs(Form, { method: "post", encType: "multipart/form-data", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4 md:gap-7 items-start", children: [
          /* @__PURE__ */ jsxs("div", { className: "w-full md:w-56 text-base md:text-xl flex-none text-white", "data-koreanable": true, children: [
            t["career.form.position"],
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-red-600", children: "*" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1 text-white", children: positions.map((pos) => /* @__PURE__ */ jsxs("label", { className: "flex items-center font-extralight gap-2 cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                name: "position",
                value: pos,
                onChange: () => setSelectedPositions([pos]),
                checked: selectedPositions.includes(pos)
              }
            ),
            t[`career.form.${pos.replace(/\s+/g, "_")}`] || pos
          ] }, pos)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 md:gap-7 items-start mt-14 text-white", children: [
          /* @__PURE__ */ jsxs("div", { className: "w-full text-base md:text-xl flex-none", "data-koreanable": true, children: [
            t["career.form.full_name"],
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-red-600", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grow w-full grid grid-cols-1 sm:grid-cols-3 gap-7", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("input", { id: "first_name", name: "first_name", type: "text", className: "rounded-none text-lg py-1 bg-transparent outline-none border-b border-[#878787]", spellCheck: "false", autoComplete: "off", "data-koreanable": true }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-extralight", children: t["career.form.first_name"] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("input", { id: "middle_name", name: "middle_name", type: "text", className: "rounded-none text-lg py-1 bg-transparent outline-none border-b border-[#878787]", spellCheck: "false", autoComplete: "off", "data-koreanable": true }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-extralight", children: t["career.form.middle_name"] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("input", { id: "last_name", name: "last_name", type: "text", className: "rounded-none text-lg py-1 bg-transparent outline-none border-b border-[#878787]", spellCheck: "false", autoComplete: "off", "data-koreanable": true }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-extralight", children: t["career.form.last_name"] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4 md:gap-7 items-start mt-14", children: [
          /* @__PURE__ */ jsxs("div", { className: "w-full md:w-56 text-base md:text-xl flex-none text-white", "data-koreanable": true, children: [
            t["career.form.nationality"],
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-red-600", children: "*" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsxs(Select, { defaultValue: "korea", name: "nationality", children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full text-white", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { className: "w-full text-white bg-black !border-none", children: /* @__PURE__ */ jsxs(SelectGroup, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "korea", children: "Korea" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "vietnam", children: "Vietnam" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "usa", children: "The United States" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "canada", children: "Canada" })
            ] }) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4 md:gap-7 items-start mt-14 text-white", "data-koreanable": true, children: [
          /* @__PURE__ */ jsxs("div", { className: "w-full md:w-56 text-base md:text-xl flex-none", children: [
            t["career.form.email"],
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-red-600", children: "*" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsx("input", { id: "email_address", name: "email_address", type: "email", className: "rounded-none text-lg py-1 bg-transparent outline-none border-b border-[#878787]", spellCheck: "false", autoComplete: "off" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4 md:gap-7 items-start mt-14 text-white", "data-koreanable": true, children: [
          /* @__PURE__ */ jsxs("div", { className: "w-full md:w-56 text-base md:text-xl flex-none", children: [
            t["career.form.portfolio"],
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-red-600", children: "*" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsx(UploadInput, { id: "portfolio", name: "portfolio", onFileSelect: handleFileSelect }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4 md:gap-7 items-start mt-14 text-white", "data-koreanable": true, children: [
          /* @__PURE__ */ jsxs("div", { className: "w-full md:w-56 text-base md:text-xl flex-none", children: [
            t["career.form.cv"],
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-red-600", children: "*" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grow w-full flex flex-col gap-1", children: /* @__PURE__ */ jsx(UploadInput, { id: "cv", name: "cv", onFileSelect: handleFileSelect }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4 md:gap-7 items-start mt-14 text-white", "data-koreanable": true, children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-none w-full md:w-56 text-base md:text-xl flex-none", children: t["career.form.comment"] }),
          /* @__PURE__ */ jsxs("div", { className: "grow w-full flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx("textarea", { name: "comment", id: "comment", className: "bg-[#282828] border border-black text-lg p-3", rows: 4 }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center text-[10px] text-[#7d7d7d] font-extralight gap-2", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", className: "text-transparent size-3" }),
              " ",
              t["career.form.agreement"]
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center mt-14 text-white", children: /* @__PURE__ */ jsx("button", { type: "submit", className: `border-2 hover:bg-white hover:text-[#1b1b1b] border-white uppercase bg-transparent px-3 py-2 font-medium text-2xl ${montserratIfKo(t["career.form.submit"], locale)}`, children: t["career.form.submit"] }) })
      ] })
    ] }) })
  ] });
}

const route7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  action,
  default: Career,
  meta: meta$5
}, Symbol.toStringTag, { value: 'Module' }));

const meta$4 = ({ matches }) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;
  return [
    { title: title(rootMatch.translations["Graphics, more than just value"]) },
    { name: "description", content: rootMatch.translations["Visual Ennode flatforms"] }
  ];
};
function Ennode() {
  const { translations: t, locale, banners } = useOutletContext();
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: "h-dvh max-h-dvh relative",
      children: [
        /* @__PURE__ */ jsx("video", { muted: true, autoPlay: true, playsInline: true, loop: true, preload: "none", className: cn("object-cover h-dvh w-full max-h-dvh"), children: /* @__PURE__ */ jsx("source", { src: banners.find((banner) => banner.group === "ennode")?.url ?? "", type: "video/mp4" }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50", children: /* @__PURE__ */ jsx(Container, { variant: "fluid", className: "text-white flex w-full h-full items-center lg:items-end justify-center lg:justify-start !p-20 md:p-28 lg:!p-36", children: /* @__PURE__ */ jsxs("div", { className: "max-w-lg w-full", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:gap-3 xl:gap-4 2xl:gap-5 group", children: [
            /* @__PURE__ */ jsx(Link$1, { to: localePath(locale, "about"), className: "inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow group-hover:mb-2 duration-300", children: t["ennode.arc.title"] }),
            /* @__PURE__ */ jsxs("div", { className: "opacity-0 group-hover:opacity-100 duration-300 translate-y-4 group-hover:translate-y-0", children: [
              /* @__PURE__ */ jsx("p", { className: "font-light text-base sm:text-lg md:text-xl xl:text-2xl 2xl:text-3xl mb-2", children: t["ennode.arc.description"] }),
              /* @__PURE__ */ jsxs(Link$1, { to: localePath(locale, "about"), className: `inline-flex items-center font-light text-base sm:text-lg md:text-xl text-white/80 mt-7 ${montserratIfKo(t["See service"], locale)}`, children: [
                t["See service"],
                " ",
                /* @__PURE__ */ jsx(ArrowRight, { className: "size-3 ml-1" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:gap-3 xl:gap-4 2xl:gap-5 group mt-14", children: [
            /* @__PURE__ */ jsx(Link$1, { to: localePath(locale, "ennode/digital"), className: "inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow group-hover:mb-2 duration-300", children: t["ennode.digital.title"] }),
            /* @__PURE__ */ jsxs("div", { className: "opacity-0 group-hover:opacity-100 duration-300 translate-y-4 group-hover:translate-y-0", children: [
              /* @__PURE__ */ jsx("p", { className: "font-light text-base sm:text-lg md:text-xl xl:text-2xl 2xl:text-3xl mb-2", children: t["ennode.digital.description"] }),
              /* @__PURE__ */ jsxs(Link$1, { to: localePath(locale, "ennode/digital"), className: `inline-flex items-center font-light text-base sm:text-lg md:text-xl text-white/80 mt-7 ${montserratIfKo(t["See service"], locale)}`, children: [
                t["See service"],
                " ",
                /* @__PURE__ */ jsx(ArrowRight, { className: "size-3 ml-1" })
              ] })
            ] })
          ] })
        ] }) }) })
      ]
    }
  );
}

const route8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Ennode,
  meta: meta$4
}, Symbol.toStringTag, { value: 'Module' }));

async function loader$5({ params }) {
  const rawName = params.name ?? "";
  const lower = rawName.toLowerCase();
  if (lower.startsWith("dark")) {
    return redirect(`/favicon-dark.jpg`, 301);
  }
  return redirect(`/favicon.jpg`, 301);
}
const handle = { raw: true };

const route9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  handle,
  loader: loader$5
}, Symbol.toStringTag, { value: 'Module' }));

const DefinitionSection = forwardRef((props, ref) => {
  const { translations } = useOutletContext();
  return /* @__PURE__ */ jsx(
    "section",
    {
      ref,
      className: "h-screen relative bg-no-repeat bg-[length:150%_auto] bg-[position:100%_20%] lg:bg-[length:55%_auto] xl:bg-[length:55%_auto] 2xl:bg-[length:auto_50%] bg-[url('/images/definition-about.png')] lg:bg-right xl:bg-[position:80%] overflow-auto overscroll-none",
      ...props,
      children: /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-t from-30% from-[#1b1b1b] via-[#1b1b1b] via-40% to-[#1b1b1b]/30 md:via-20% lg:via-0% sm:from-10% lg:bg-gradient-to-r lg:from-25% w-full h-full flex flex-col justify-end lg:flex-row lg:items-center text-white", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": true,
            className: "lg:hidden pointer-events-none absolute left-0 right-0 top-0 h-1/2"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-t from-90% from-[#1b1b1b] lg:from-transparent w-full", children: /* @__PURE__ */ jsx(Container, { children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "lg:w-[28rem] flex-none text-justify",
            "data-koreanable": true,
            children: [
              /* @__PURE__ */ jsx("h2", { className: "font-bold text-2xl mb-7", children: translations["about.definition.title"] }),
              translations["about.definition.description"].split("\n").map((row, index) => /* @__PURE__ */ jsx(
                "p",
                {
                  className: "font-light leading-loose text-[15px] mb-7",
                  dangerouslySetInnerHTML: { __html: row }
                },
                index
              ))
            ]
          }
        ) }) }),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": true,
            className: "pointer-events-none absolute left-0 right-0 bottom-0 h-20 bg-gradient-to-b from-[#1b1b1b] to-transparent z-10"
          }
        )
      ] })
    }
  );
});
DefinitionSection.displayName = "DefinitionSection";

const ValueSection = forwardRef((props, ref) => {
  const { translations: t, locale } = useOutletContext();
  return /* @__PURE__ */ jsx(
    "section",
    {
      ref,
      className: "w-full flex lg:block bg-no-repeat bg-center bg-cover bg-[url(/images/value-about.jpg)] relative",
      ...props,
      children: /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-t from-30% via-[#1b1b1b] via-40% to-[#1b1b1b]/30 lg:bg-gradient-to-r from-[#1b1b1b] lg:from-20% w-full flex items-end lg:items-center text-white flex-none flex-col lg:flex-row min-h-full", children: [
        /* @__PURE__ */ jsx("div", { className: "h-1/2 lg:hidden flex-none" }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "bg-gradient-to-t mx-0 px-0 from-90% from-[#1b1b1b] lg:from-transparent py-20 w-full h-full",
            "data-koreanable": true,
            children: /* @__PURE__ */ jsx(Container, { className: "bg-[#1b1b1b] lg:bg-transparent", children: /* @__PURE__ */ jsxs("div", { className: "lg:w-[28rem] flex-none text-justify", children: [
              /* @__PURE__ */ jsx("h2", { className: "font-bold text-2xl mb-7", children: t["about.value.title"] }),
              t["about.value.description"].split("\n").map((row, index) => /* @__PURE__ */ jsx(
                "p",
                {
                  className: "font-light text-[15px] leading-loose mb-7",
                  dangerouslySetInnerHTML: { __html: row }
                },
                index
              )),
              /* @__PURE__ */ jsx("div", { className: "w-9/12 bg-[url(/images/sign.png)] bg-no-repeat bg-contain aspect-[3/1] pointer-events-none" }),
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: `text-lg sm:text-[25px] font-extrabold mt-14 block ${montserratIfKo(t["STORY MAKE VALUE"], locale)}`,
                  "data-koreanable": true,
                  children: [
                    '" ',
                    t["STORY MAKE VALUE"],
                    ' "'
                  ]
                }
              )
            ] }) })
          }
        )
      ] })
    }
  );
});
ValueSection.displayName = "ValueSection";

const ClientSection = forwardRef(
  (props, forwardedRef) => {
    const ref = useRef(null);
    const { translations: t } = useOutletContext();
    const inView = useInView(ref, { amount: 1 });
    const clients = Array.isArray(props.clients) ? props.clients : [];
    useImperativeHandle(forwardedRef, () => ref.current);
    useEffect(() => {
      const headerDom = document.getElementById("header");
      if (!headerDom || !inView) return;
      headerDom.dataset.variant = "light";
    }, [inView]);
    return /* @__PURE__ */ jsx(
      "section",
      {
        ref,
        className: "min-h-[80vh] flex py-0 sm:py-8 lg:pb-20",
        ...props,
        children: /* @__PURE__ */ jsxs(Container, { className: "flex-none m-auto min-h-full flex flex-col w-full px-4 sm:px-6", children: [
          /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:mt-14 mb-4 sm:mb-6", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight uppercase text-center", children: (() => {
              const raw = String(t["component.client.title"] ?? "");
              if (raw.includes("||")) {
                return raw.split("||").map(
                  (part, i) => i % 2 === 1 ? /* @__PURE__ */ jsx("span", { className: "text-red-500", children: part }, i) : /* @__PURE__ */ jsx("span", { children: part }, i)
                );
              }
              const phrase = "strong, lasting relationships";
              if (raw.includes(phrase)) {
                const parts = raw.split(phrase);
                return /* @__PURE__ */ jsxs(Fragment, { children: [
                  parts[0],
                  /* @__PURE__ */ jsx("span", { className: "text-red-500", children: phrase }),
                  parts[1]
                ] });
              }
              return raw;
            })() }),
            /* @__PURE__ */ jsx("h3", { id: "client-subtitle", "data-testid": "client-subtitle", className: "mt-4 text-lg sm:text-xl text-white/80 font-normal", children: String(t["component.client.subtitle"] ?? "Client subtitle") })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 md:px-12", children: /* @__PURE__ */ jsx("div", { className: "w-full bg-[#1f1f1f] rounded-lg p-4 sm:p-6 md:p-8 lg:p-8", children: clients.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 md:gap-12 lg:gap-24 items-center justify-items-center", children: clients.map((client, index) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex items-center justify-center px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6 w-full h-full",
              children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: client.attachment_url,
                  alt: client.name,
                  loading: "lazy",
                  className: "max-h-12 sm:max-h-16 md:max-h-20 max-w-full object-contain mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
                }
              )
            },
            index
          )) }) : /* @__PURE__ */ jsx("p", { className: "text-white", children: "No clients available" }) }) })
        ] })
      }
    );
  }
);
ClientSection.displayName = "ClientSection";

function useCheckpointObserver(count, options) {
  const [visibleItems, setVisibleItems] = useState(new Array(count).fill(false));
  const itemRefs = useRef([]);
  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => {
                const newVisible = [...prev];
                newVisible[index] = true;
                return newVisible;
              });
            }
          });
        },
        options || {
          threshold: 0.5,
          rootMargin: "0px 0px -200px 0px"
        }
      );
      observer.observe(ref);
      return observer;
    });
    return () => {
      observers.forEach((observer, index) => {
        if (observer && itemRefs.current[index]) {
          observer.unobserve(itemRefs.current[index]);
        }
      });
    };
  }, [count, options]);
  return [visibleItems, itemRefs];
}

const defaultItems = [
  {
    title: "BUDGET CONSULATION",
    subtitles: [
      "BUDGET & SCHEDULE CONSULTATION",
      "VIEW LOCK / IMAGE RANGE CONSULTATION"
    ]
  },
  {
    title: "PLANNING & WORK",
    subtitles: [
      "3D WORK & PROJECT PLANNING START"
    ]
  },
  {
    title: "DRAFT & REVISIONS",
    subtitles: [
      "FIRST DRAFT DELIVERY",
      "SECOND DRAFT DELIVERY",
      "FINAL IMAGE HIGH RESOLUTION"
    ]
  },
  {
    title: "FINAL INSPECTION",
    subtitles: [
      "CONTRACT TERMINATION",
      "VIEW LOCK / IMAGE RANGE CONSULTATION",
      "FINAL PAYMENT TRANSFER / LICENSE TRANSFER"
    ]
  }
];
const localizedItems = {
  ko: [
    {
      title: "작업 의뢰",
      subtitles: ["예산 및 일정 상담", "장면 및 구도 / 범위 상담"]
    },
    {
      title: "작업 기획",
      subtitles: ["프로젝트 컨셉 기획, 3D 작업"]
    },
    {
      title: "시안 공유 및 수정",
      subtitles: ["1차 시안 전달", "2차 시안 전달", "최종 고해상도 이미지 전달"]
    },
    {
      title: "최종 검토 및 납품",
      subtitles: ["최종 검토", "최종 결제 및 라이선스 이전"]
    }
  ]
};
function itemsForLocale(locale) {
  if (!locale) return defaultItems;
  return localizedItems[locale] ?? defaultItems;
}

function WorkProcess({
  items = defaultItems,
  className,
  ...props
}) {
  const { translations, locale } = useOutletContext();
  const sectionTitle = translations["about.process.title"];
  let titleBefore = null;
  let titleMatch = null;
  let titleAfter = null;
  if (sectionTitle) {
    const korMatch = (() => {
      const candidates = ["프로세스", "작업 프로세스", "작업", "프로세스"];
      for (const w of candidates) {
        const idx = sectionTitle.indexOf(w);
        if (idx >= 0) return { w, idx };
      }
      return null;
    })();
    if (korMatch) {
      titleBefore = sectionTitle.slice(0, korMatch.idx);
      titleMatch = korMatch.w;
      titleAfter = sectionTitle.slice(korMatch.idx + korMatch.w.length);
    } else {
      const eng = sectionTitle.match(/PROCESS/i);
      if (eng && typeof eng.index === "number") {
        titleBefore = sectionTitle.slice(0, eng.index);
        titleMatch = eng[0];
        titleAfter = sectionTitle.slice(eng.index + titleMatch.length);
      }
    }
  }
  const [visibleItems, itemRefs] = useCheckpointObserver(items.length, {
    threshold: 0.5,
    rootMargin: "0px 0px -200px 0px"
  });
  const [orderMap, setOrderMap] = React__default.useState([]);
  React__default.useEffect(() => {
    const measure = () => {
      const nodes = itemRefs.current;
      if (!nodes || !nodes.length) return;
      const rects = nodes.map((n, i) => {
        if (!n) return { i, top: Infinity, left: Infinity };
        const r = n.getBoundingClientRect();
        return { i, top: Math.round(r.top), left: Math.round(r.left) };
      });
      const sorted = [...rects].sort((a, b) => {
        const topDiff = a.top - b.top;
        if (Math.abs(topDiff) > 20) return topDiff;
        return a.left - b.left;
      });
      const map = new Array(nodes.length).fill(0);
      sorted.forEach((s, order) => {
        map[s.i] = order;
      });
      setOrderMap(map);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [itemRefs, items.length]);
  const ROW_ORDER_DELAY = 300;
  const SUBTITLE_STAGGER = 200;
  const TRANSITION_DURATION = 1200;
  return /* @__PURE__ */ jsx("section", { className: "pt-12 md:py-16 relative mb-12 md:mb-0", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 md:px-0", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "hidden md:block absolute max-w-7xl mt-6 mx-auto px-4 sm:px-6 md:px-12 left-0 right-0 pointer-events-none",
        style: {
          background: `url('/images/grid-deco.svg') center/contain no-repeat`,
          height: "21rem",
          opacity: 1,
          transition: "none",
          animation: "none",
          willChange: "auto"
        }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("div", { children: sectionTitle ? /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight text-center mb-8 sm:mb-10 md:mb-12", children: titleMatch ? /* @__PURE__ */ jsxs(Fragment, { children: [
        titleBefore,
        /* @__PURE__ */ jsx("span", { className: "text-red-500", children: titleMatch }),
        titleAfter
      ] }) : sectionTitle }) : /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight text-center mb-8 sm:mb-10 md:mb-12", children: locale === "ko" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "text-white", children: "프로젝트 " }),
        /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "진행 과정" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "text-white", children: "OUR WORK " }),
        /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "PROCESS" })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: cn("w-full max-w-7xl mx-auto", className), ...props, children: /* @__PURE__ */ jsx("div", { className: "relative w-full", children: /* @__PURE__ */ jsx("div", { className: "relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(22,1fr)] gap-6 sm:gap-8 md:gap-0 pt-0 sm:pt-8 md:pt-12", children: items.map((item, index) => {
        const isVisible = visibleItems[index];
        const colSpanClasses = [
          "lg:[grid-column:1/6]",
          "lg:[grid-column:6/13]",
          "lg:[grid-column:13/18]",
          "lg:[grid-column:18/23]"
        ];
        return /* @__PURE__ */ jsx(
          "div",
          {
            ref: (el) => itemRefs.current[index] = el,
            className: cn("relative", colSpanClasses[index % 4]),
            children: /* @__PURE__ */ jsxs("div", { className: "pt-4 sm:pt-8 md:pt-[11.5rem]", children: [
              /* @__PURE__ */ jsx(
                "h3",
                {
                  className: cn(
                    "text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-2 leading-tight w-full sm:max-w-[200px] md:max-w-[200px]",
                    index < 2 && "md:ml-2"
                  ),
                  children: item.title
                }
              ),
              /* @__PURE__ */ jsx("div", { className: cn(index < 2 && "md:ml-2"), children: item.subtitles.map((text, idx) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: cn(
                    "relative left-[1px] transition-all duration-1000 ease-out",
                    isVisible ? "translate-y-4 opacity-100" : "translate-y-0 opacity-0"
                  ),
                  style: {
                    transitionDelay: isVisible ? `${(orderMap && orderMap[index] ? orderMap[index] * ROW_ORDER_DELAY : index * ROW_ORDER_DELAY) + idx * SUBTITLE_STAGGER}ms` : "0ms",
                    transitionDuration: `${TRANSITION_DURATION}ms`
                  },
                  children: [
                    idx > 0 && /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "w-px bg-gray-500 h-12 sm:h-16 md:h-20 mt-1",
                        style: { width: "1px" }
                      }
                    ),
                    idx === 0 && /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "w-px bg-gray-500 h-3 sm:h-4 mt-1",
                        style: { width: "1px" }
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                      /* @__PURE__ */ jsx("div", { className: "w-1 h-1 -left-[5px] bg-gray-500 rounded-full flex-shrink-0" }),
                      /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400 leading-relaxed w-full sm:max-w-[240px] md:max-w-[180px] pl-2", children: text })
                    ] })
                  ]
                },
                idx
              )) })
            ] })
          },
          index
        );
      }) }) }) })
    ] })
  ] }) });
}

const meta$3 = ({
  matches
}) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;
  return [
    { title: title(rootMatch?.translations["about.page.title"]) },
    {
      name: "description",
      content: rootMatch?.translations["about.page.description"]
    },
    // ✅ Open Graph
    {
      property: "og:title",
      content: rootMatch?.translations["about.page.og.title"]
    },
    {
      property: "og:description",
      content: rootMatch?.translations["about.page.og.description"]
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com/about" },
    {
      property: "og:image",
      content: "https://www.visualennode.com/images/og-cover.jpg"
    },
    // ✅ Twitter
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: rootMatch?.translations["about.page.twitter.title"] ?? rootMatch?.translations["about.page.title"]
    },
    {
      name: "twitter:description",
      content: rootMatch?.translations["about.page.twitter.description"] ?? rootMatch?.translations["about.page.description"]
    },
    {
      name: "twitter:image",
      content: "https://www.visualennode.com/images/og-cover.jpg"
    }
  ];
};
async function loader$4({ params }) {
  const locale = params.locale ?? "en";
  const api = new Api();
  const teams = await api.getEmployees(locale).then((res) => res.data.data);
  const clients = await api.getClients(locale).then((response) => response.data.data);
  return {
    teams,
    clients
  };
}
function Index$2() {
  const { clients, teams } = useLoaderData();
  const { translations, locale } = useOutletContext();
  let processItems = translations["about.process.steps"];
  if (!processItems) processItems = itemsForLocale(locale);
  return /* @__PURE__ */ jsxs("div", { className: locale === "ko" ? "ko-solid" : "", children: [
    /* @__PURE__ */ jsx(DefinitionSection, {}),
    /* @__PURE__ */ jsx(ValueSection, {}),
    /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "w-full h-20 bg-gradient-to-b from-[#1b1b1b] to-transparent" }),
    /* @__PURE__ */ jsx(TeamSection, { teams }),
    /* @__PURE__ */ jsx(WorkProcess, { items: processItems }),
    /* @__PURE__ */ jsx(ClientSection, { clients }),
    /* @__PURE__ */ jsx(ContactSection, {})
  ] });
}

const route10 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Index$2,
  loader: loader$4,
  meta: meta$3
}, Symbol.toStringTag, { value: 'Module' }));

const CARD_ANIMATION_SECONDS$1 = 0.5;
async function loader$3({ params }) {
  const api = new Api();
  const locale = params.locale ?? "en";
  const categories = await api.getCategories(locale).then((res) => res.data.data);
  const imageCategory = categories.find(
    (category) => category.slug === "image"
  );
  const cinematicCategory = categories.find(
    (category) => category.slug === "cinematic"
  );
  return {
    imageCategory,
    cinematicCategory
  };
}
const meta$2 = ({
  matches
}) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;
  return [
    { title: title(rootMatch.translations["work.page.title"]) },
    {
      name: "description",
      content: rootMatch.translations["work.page.description"]
    },
    // ✅ Open Graph
    {
      property: "og:title",
      content: rootMatch.translations["work.page.og.title"]
    },
    {
      property: "og:description",
      content: rootMatch.translations["work.page.og.description"]
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com/works" },
    {
      property: "og:image",
      content: "https://www.visualennode.com/images/og-cover.jpg"
    },
    // ✅ Twitter
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: rootMatch.translations["work.page.og.title"]
    },
    {
      name: "twitter:description",
      content: rootMatch.translations["work.page.og.description"]
    },
    {
      name: "twitter:image",
      content: "https://www.visualennode.com/images/og-cover.jpg"
    }
  ];
};
function Works() {
  const { translations: t, locale } = useOutletContext();
  const navigate = useNavigate();
  const { imageCategory, cinematicCategory } = useLoaderData();
  const { t: i18nT } = useTranslation();
  const trans = t;
  const imageTitleLocal = trans["work.page.categories.still_image"] ?? i18nT("work.page.categories.still_image");
  const imageDescLocal = trans["work.page.categories.still_image_description"] ?? i18nT("work.page.categories.still_image_description");
  const cinematicTitleLocal = trans["work.page.categories.cinematic"] ?? i18nT("work.page.categories.cinematic");
  const cinematicDescLocal = trans["work.page.categories.cinematic_description"] ?? i18nT("work.page.categories.cinematic_description");
  const isKoreanLocale = Boolean(locale && locale.startsWith("ko"));
  if (process.env.NODE_ENV !== "production" && isKoreanLocale) {
    if (!imageTitleLocal) {
      console.warn("Missing translation: work.page.categories.still_image");
    }
    if (!imageDescLocal) {
      console.warn("Missing translation: work.page.categories.still_image_description");
    }
    if (!cinematicTitleLocal) {
      console.warn("Missing translation: work.page.categories.cinematic");
    }
    if (!cinematicDescLocal) {
      console.warn("Missing translation: work.page.categories.cinematic_description");
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: isKoreanLocale ? "ko-solid" : "", children: [
    /* @__PURE__ */ jsxs("section", { className: "h-dvh overflow-hidden max-h-dvh grid grid-cols-1 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        imageCategory?.attachment_url ? /* @__PURE__ */ jsx(
          "video",
          {
            muted: true,
            playsInline: true,
            autoPlay: true,
            loop: true,
            preload: "auto",
            className: cn(
              "absolute p-6 md:p-0 inset-0 object-cover h-dvh w-full max-h-dvh"
            ),
            children: /* @__PURE__ */ jsx("source", { src: imageCategory.attachment_url, type: "video/mp4" })
          }
        ) : null,
        /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "hover:bg-black/60 bg-black/30 relative group h-full cursor-pointer",
            initial: { translateX: "-10%" },
            animate: { translateX: 0 },
            transition: { translateX: { duration: CARD_ANIMATION_SECONDS$1 } },
            onClick: () => navigate(localePath(locale, "/works/image")),
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(localePath(locale, "/works/image"));
              }
            },
            role: "link",
            tabIndex: 0,
            children: /* @__PURE__ */ jsx("div", { className: "h-full flex items-center justify-center lg:items-end lg:justify-start lg:px-24 lg:py-40", children: /* @__PURE__ */ jsxs("div", { className: "", children: [
              /* @__PURE__ */ jsx(
                Link$1,
                {
                  to: localePath(locale, "/works/image"),
                  className: "inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow duration-500 lg:group-hover:mb-7",
                  children: isKoreanLocale ? imageTitleLocal : imageCategory?.title ?? "IMAGE"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "opacity-0 translate-y-4 h-0 group-hover:h-auto group-hover:translate-y-0 group-hover:opacity-100 duration-300", children: [
                /* @__PURE__ */ jsx("p", { className: "text-3xl hidden lg:block text-white/80", children: isKoreanLocale ? imageDescLocal : imageCategory?.description ?? "" }),
                /* @__PURE__ */ jsxs(
                  Link$1,
                  {
                    to: localePath(locale, "/works/image"),
                    className: `hidden lg:inline-flex items-center text-xl text-white/80 font-light mt-7`,
                    children: [
                      "See Works ",
                      /* @__PURE__ */ jsx(ArrowRight, { className: "size-3 ml-1" })
                    ]
                  }
                )
              ] })
            ] }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        cinematicCategory?.attachment_url ? /* @__PURE__ */ jsx(
          "video",
          {
            muted: true,
            playsInline: true,
            autoPlay: true,
            loop: true,
            preload: "auto",
            className: cn(
              "absolute p-6 md:p-0 inset-0 object-cover h-dvh w-full max-h-dvh"
            ),
            children: /* @__PURE__ */ jsx("source", { src: cinematicCategory.attachment_url, type: "video/mp4" })
          }
        ) : null,
        /* @__PURE__ */ jsx(
          motion.div,
          {
            className: "hover:bg-black/60 bg-black/30 relative group h-full cursor-pointer",
            initial: { translateX: "10%" },
            animate: { translateX: 0 },
            transition: { translateX: { duration: CARD_ANIMATION_SECONDS$1 } },
            onClick: () => navigate(localePath(locale, "/works/cinematic")),
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(localePath(locale, "/works/cinematic"));
              }
            },
            role: "link",
            tabIndex: 0,
            children: /* @__PURE__ */ jsx("div", { className: "h-full flex items-center justify-center lg:items-end lg:justify-start lg:px-24 lg:py-40", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(
                Link$1,
                {
                  to: localePath(locale, "/works/cinematic"),
                  className: "inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow duration-500 lg:group-hover:mb-7",
                  children: isKoreanLocale ? cinematicTitleLocal : cinematicCategory?.title ?? "CINEMATIC"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "opacity-0 translate-y-4 h-0 group-hover:h-auto group-hover:translate-y-0 group-hover:opacity-100 duration-300", children: [
                /* @__PURE__ */ jsx("p", { className: "text-3xl hidden lg:block text-white/80", children: isKoreanLocale ? cinematicDescLocal : cinematicCategory?.description ?? "" }),
                /* @__PURE__ */ jsxs(
                  Link$1,
                  {
                    to: localePath(locale, "/works/cinematic"),
                    className: `hidden lg:inline-flex items-center text-xl text-white/80 font-light mt-7`,
                    children: [
                      "See Works",
                      /* @__PURE__ */ jsx(ArrowRight, { className: "size-3 ml-1" })
                    ]
                  }
                )
              ] })
            ] }) })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: "absolute inset-x-0 bottom-0 h-[12%] bg-gradient-to-b from-transparent to-[#1b1b1b] pointer-events-none z-10"
      }
    ),
    /* @__PURE__ */ jsx(ContactSection, {})
  ] });
}

const route11 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Works,
  loader: loader$3,
  meta: meta$2
}, Symbol.toStringTag, { value: 'Module' }));

async function loader$2() {
  return redirect(`/favicon.jpg`, 301);
}

const route12 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  loader: loader$2
}, Symbol.toStringTag, { value: 'Module' }));

const meta$1 = ({
  matches
}) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;
  return [
    { title: title(rootMatch.translations["news.page.title"]) },
    {
      name: "description",
      content: rootMatch.translations["news.page.description"]
    },
    {
      property: "og:title",
      content: rootMatch.translations["news.page.og.title"]
    },
    {
      property: "og:description",
      content: rootMatch.translations["news.page.og.description"]
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com/news" },
    {
      property: "og:image",
      content: "https://www.visualennode.com/images/og-cover.jpg"
    },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: rootMatch.translations["news.page.twitter.title"]
    },
    {
      name: "twitter:description",
      content: rootMatch.translations["news.page.twitter.description"]
    },
    {
      name: "twitter:image",
      content: "https://www.visualennode.com/images/og-cover.jpg"
    }
  ];
};
async function loader$1({ request, params }) {
  const url = new URL(request.url);
  const locale = params.locale ?? "en";
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const api = new Api();
  const newsPagination = await api.getNewsList(locale, "", page).then(async (response) => {
    return response.data;
  });
  return {
    newsPagination
  };
}
function Index$1() {
  const { newsPagination } = useLoaderData();
  const { translations: t, locale } = useOutletContext();
  return /* @__PURE__ */ jsxs("div", { className: locale === "ko" ? "ko-solid" : "", children: [
    /* @__PURE__ */ jsx("section", { className: "flex py-7 sm:py-14", children: /* @__PURE__ */ jsxs(
      Container,
      {
        className: "flex-none m-auto min-h-full flex flex-col",
        variant: "fluid",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center mt-14 mb-2", children: [
            /* @__PURE__ */ jsx(
              "h3",
              {
                className: `font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 ${montserratIfKo("New update", locale)}`,
                "data-koreanable": true,
                children: t["New update"]
              }
            ),
            /* @__PURE__ */ jsx("h4", { className: "text-white/70 text-base sm:text-lg mt-2", "data-koreanable": true, children: String(t["news.section.subtitle"] ?? "Latest news and updates") })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 my-auto", children: (newsPagination?.data ?? []).map((news, index) => /* @__PURE__ */ jsxs(
            Link$1,
            {
              to: localePath(locale, `news/${news.slug}`),
              className: "h-full flex flex-col group",
              children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    className: "aspect-[4/3] w-full object-cover transition-transform duration-300 ease-out transform group-hover:scale-105",
                    src: news.optimize_attachment_url ?? news.attachment_url,
                    alt: news.title
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "grow", children: /* @__PURE__ */ jsxs("div", { className: "p-2 xl:p-4", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-white font-medium text-xs mb-2 xl:mb-4 inline-block transition-colors duration-200 group-hover:text-white/70", children: new Date(news.published_at).toLocaleDateString("vi-VN", {
                    month: "2-digit",
                    year: "numeric",
                    day: "2-digit"
                  }) }),
                  /* @__PURE__ */ jsx(
                    "h4",
                    {
                      className: "font-semibold text-white text-base sm:text-lg lg:text-base xl:text-xl 2xl:text-2xl line-clamp-4 transition-colors duration-200 group-hover:text-white/70",
                      "data-koreanable": true,
                      children: news.title
                    }
                  )
                ] }) })
              ]
            },
            index
          )) }),
          newsPagination?.meta && newsPagination.meta.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-2 mt-7 lg:mt-10", children: [
            /* @__PURE__ */ jsxs(
              Link$1,
              {
                to: {
                  search: `page=${newsPagination.meta.current_page === 1 ? 1 : newsPagination.meta.current_page - 1}`
                },
                className: cn(
                  "border-2 border-white uppercase bg-transparent text-white inline-flex items-center gap-2 px-3 py-2 font-medium text-xl md:text-2xl",
                  montserratIfKo(t["Previous"], locale),
                  newsPagination.meta.current_page === 1 ? "opacity-10 cursor-not-allowed disabled" : " hover:bg-white hover:text-[#1b1b1b]"
                ),
                children: [
                  /* @__PURE__ */ jsx(ChevronLeft, { className: "size-6 md:size-8" }),
                  " ",
                  t["Previous"]
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Link$1,
              {
                to: {
                  search: `page=${newsPagination.meta.current_page === newsPagination.meta.last_page ? newsPagination.meta.last_page : newsPagination.meta.current_page + 1}`
                },
                className: cn(
                  "border-2 border-white uppercase bg-transparent text-white inline-flex items-center px-3 py-2 font-medium text-xl md:text-2xl",
                  montserratIfKo(t["Next"], locale),
                  newsPagination.meta.current_page === newsPagination.meta.last_page ? "opacity-10 cursor-not-allowed disabled" : " hover:bg-white hover:text-[#1b1b1b]"
                ),
                children: [
                  t["Next"],
                  " ",
                  /* @__PURE__ */ jsx(ChevronRight, { className: "size-6 md:size-8" })
                ]
              }
            )
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(ContactSection, {})
  ] });
}

const route13 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Index$1,
  loader: loader$1,
  meta: meta$1
}, Symbol.toStringTag, { value: 'Module' }));

const ANIMATION_DELAY_SECONDS = 0.75;
const CARD_ANIMATION_SECONDS = 0.5;
const HERO_TITLE_DELAY = ANIMATION_DELAY_SECONDS + 0.5;
const HERO_SUB_DELAY = ANIMATION_DELAY_SECONDS + 0.5;
const HeroSection = forwardRef((props, ref) => {
  const { locale, translations } = useOutletContext();
  const [cardAnimationStart, setCardAnimationStart] = useState(
    props.ready ?? false
  );
  const videoRef = useRef(null);
  const [animationEnd, setAnimationEnd] = useState(
    props.ready ?? false
  );
  useEffect(() => {
    const headerDom = document.getElementById("header");
    if (!headerDom) return;
    headerDom.dataset.variant = "dark";
  }, []);
  useEffect(() => {
    if (props.ready) {
      setTimeout(() => {
        setAnimationEnd(true);
        setCardAnimationStart(true);
        setTimeout(
          () => setCardAnimationStart(false),
          CARD_ANIMATION_SECONDS * 0.5
        );
      }, ANIMATION_DELAY_SECONDS * 1e3);
    }
  }, [props.ready]);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: cn(
        "min-h-screen relative",
        animationEnd && !cardAnimationStart ? "" : "page-scroller-disabled"
      ),
      ref,
      children: [
        /* @__PURE__ */ jsx(
          "video",
          {
            muted: true,
            playsInline: true,
            loop: true,
            autoPlay: true,
            preload: "none",
            className: cn(
              "absolute inset-0 object-cover h-full w-full",
              animationEnd ? "" : "z-10"
            ),
            ref: videoRef,
            children: /* @__PURE__ */ jsx("source", { src: "/videos/hero-video.mp4", type: "video/mp4" })
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": true,
            className: "absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-[#1b1b1b] pointer-events-none z-10"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-transparent to-[#1b1b1b]" }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-30 h-full min-h-screen flex flex-col justify-center sm:justify-between p-4 sm:p-8 lg:py-36 lg:px-20", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              "aria-hidden": true,
              className: "hidden lg:block pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 z-10",
              style: { width: 520, height: 520 },
              children: /* @__PURE__ */ jsxs(
                "svg",
                {
                  viewBox: "0 0 600 600",
                  className: "w-full h-full opacity-30 filter blur-2xl",
                  children: [
                    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "g1", x1: "0%", x2: "100%", y1: "0%", y2: "100%", children: [
                      /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#ff6b6b", stopOpacity: "0.25" }),
                      /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#ff4757", stopOpacity: "0.18" })
                    ] }) }),
                    /* @__PURE__ */ jsx("g", { transform: "translate(300,300)", children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        d: "M120,-160C160,-120,180,-60,170,-10C160,40,120,80,80,120C40,160,-10,200,-60,200C-110,200,-160,160,-190,110C-220,60,-230,-10,-200,-60C-170,-110,-110,-150,-50,-180C10,-210,70,-200,120,-160Z",
                        fill: "url(#g1)"
                      }
                    ) })
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "h-0 sm:h-20 md:h-24" }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center sm:justify-start", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl text-center sm:text-left space-y-8 sm:space-y-0", children: [
            /* @__PURE__ */ jsx(
              motion.h1,
              {
                className: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white uppercase mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-tight px-4 sm:px-0 sm:ml-12",
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 1, delay: HERO_TITLE_DELAY },
                children: (() => {
                  const title = translations?.["home.hero.title"] ?? "ARCHVIZ\nSTUDIO";
                  return title.split("\n").map((line, i) => /* @__PURE__ */ jsxs(
                    "span",
                    {
                      className: "leading-tight",
                      style: {
                        fontFamily: '"Montserrat", "Gilroy", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                      },
                      children: [
                        line,
                        /* @__PURE__ */ jsx("br", {})
                      ]
                    },
                    i
                  ));
                })()
              }
            ),
            /* @__PURE__ */ jsx(
              motion.p,
              {
                className: "text-base sm:text-base md:text-lg lg:text-xl text-gray-200 max-w-sm sm:max-w-2xl leading-relaxed font-light px-4 sm:px-0 sm:ml-12 mb-8 sm:mb-0",
                initial: { opacity: 0, y: 30 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 1, delay: HERO_SUB_DELAY },
                children: translations?.["home.hero.subtitle"] ?? "We unite diverse departments for seamless collaboration"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "sm:hidden flex flex-col gap-4 px-4 mt-8", children: [
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  className: "group cursor-pointer touch-manipulation",
                  initial: { opacity: 0, y: 30 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 1, delay: HERO_SUB_DELAY },
                  children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-300 uppercase tracking-wider mb-1 font-medium", children: translations?.["home.hero-section.visual.slogan"] ?? "WE VISUALIZE" }),
                    /* @__PURE__ */ jsxs(
                      Link$1,
                      {
                        to: localePath(locale, "works"),
                        className: "text-lg text-white font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300 hover:text-gray-200 active:text-gray-300",
                        children: [
                          translations?.["home.hero-section.visual.cta"] ?? "SEE WORKS",
                          " ",
                          /* @__PURE__ */ jsx(ArrowRight, { className: "size-5" })
                        ]
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  className: "group cursor-pointer touch-manipulation",
                  initial: { opacity: 0, y: 30 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 1, delay: HERO_SUB_DELAY },
                  children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-300 uppercase tracking-wider mb-1 font-medium", children: translations?.["home.hero-section.ennode.slogan"] ?? "WE CONNECT" }),
                    /* @__PURE__ */ jsxs(
                      Link$1,
                      {
                        to: localePath(locale, "about"),
                        className: "text-lg text-white font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300 hover:text-gray-200 active:text-gray-300",
                        children: [
                          translations?.["home.hero-section.ennode.cta"] ?? "MORE ABOUT US",
                          " ",
                          /* @__PURE__ */ jsx(ArrowRight, { className: "size-5" })
                        ]
                      }
                    )
                  ]
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "hidden sm:flex flex-col gap-8 lg:gap-16 pb-12 lg:pb-16 px-0 ml-12", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-16", children: [
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                className: "group cursor-pointer touch-manipulation",
                initial: { opacity: 0, y: 30 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 1, delay: 2 },
                children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300 uppercase tracking-wider mb-3 font-medium", children: translations?.["home.hero-section.visual.slogan"] ?? "WE VISUALIZE" }),
                  /* @__PURE__ */ jsxs(
                    Link$1,
                    {
                      to: localePath(locale, "works"),
                      className: "text-2xl lg:text-3xl text-white font-medium inline-flex items-center gap-4 group-hover:gap-6 transition-all duration-300 hover:text-gray-200 active:text-gray-300",
                      children: [
                        translations?.["home.hero-section.visual.cta"] ?? "SEE WORKS",
                        " ",
                        /* @__PURE__ */ jsx(ArrowRight, { className: "size-6" })
                      ]
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                className: "group cursor-pointer touch-manipulation",
                initial: { opacity: 0, y: 30 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 1, delay: 2 },
                children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-300 uppercase tracking-wider mb-3 font-medium", children: translations?.["home.hero-section.ennode.slogan"] ?? "WE CONNECT" }),
                  /* @__PURE__ */ jsxs(
                    Link$1,
                    {
                      to: localePath(locale, "about"),
                      className: "text-2xl lg:text-3xl text-white font-medium inline-flex items-center gap-4 group-hover:gap-6 transition-all duration-300 hover:text-gray-200 active:text-gray-300",
                      children: [
                        translations?.["home.hero-section.ennode.cta"] ?? "MORE ABOUT US",
                        " ",
                        /* @__PURE__ */ jsx(ArrowRight, { className: "size-6" })
                      ]
                    }
                  )
                ]
              }
            )
          ] }) })
        ] })
      ]
    }
  );
});
HeroSection.displayName = "HeroSection";

const SummarySection = forwardRef((props, forwardedRef) => {
  const ref = useRef(null);
  const { translations, locale } = useOutletContext();
  const inView = useInView(ref, { amount: 1 });
  useImperativeHandle(forwardedRef, () => ref.current);
  useEffect(() => {
    const headerDom = document.getElementById("header");
    if (!headerDom || !inView) return;
    headerDom.dataset.variant = "dark";
  }, [inView]);
  const categories = [
    translations["home.categories.still_image"] ?? "Still Image",
    translations["home.categories.animation"] ?? "Animation",
    translations["home.categories.cinematic"] ?? "Cinematic",
    translations["home.categories.product"] ?? "Product",
    translations["home.categories.vfx"] ?? "VFX"
  ];
  const videos = [
    "/videos/still%20image.mp4",
    "/videos/animation.mp4",
    "/videos/cinematic.mp4",
    "/videos/product.mp4",
    "/videos/vfx.mp4"
  ];
  const videoRefs = useRef([]);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const visibleIndex = hovered ?? selected ?? 0;
  useEffect(() => {
    videoRefs.current.forEach((v, idx) => {
      if (!v) return;
      const shouldPlay = hovered === idx || visibleIndex === idx;
      if (shouldPlay) {
        try {
          v.currentTime = 0;
          const p = v.play();
          if (p && typeof p.catch === "function")
            p.catch(() => {
            });
        } catch (e) {
        }
      } else {
        try {
          v.pause();
          v.currentTime = 0;
        } catch (e) {
        }
      }
    });
  }, [hovered, visibleIndex]);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchMoved = useRef(false);
  const lastTouchX = useRef(null);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchMoved.current = false;
    lastTouchX.current = null;
    if (typeof window !== "undefined")
      console.debug(
        "[swipe] touchstart",
        touchStartX.current,
        touchStartY.current
      );
  };
  const onTouchMove = (e) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) > 10) touchMoved.current = true;
    lastTouchX.current = t.clientX;
    if (typeof window !== "undefined")
      console.debug(
        "[swipe] touchmove dx",
        dx,
        "dy",
        dy,
        "lastX",
        lastTouchX.current
      );
  };
  const onTouchEnd = () => {
    if (!touchMoved.current || touchStartX.current == null || lastTouchX.current == null) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchMoved.current = false;
      return;
    }
    const dx = lastTouchX.current - (touchStartX.current ?? 0);
    const threshold = 30;
    if (Math.abs(dx) >= threshold) {
      const len = videos.length;
      if (dx < 0) {
        setSelected((prev) => {
          const current = prev ?? 0;
          return (current + 1) % len;
        });
      } else {
        setSelected((prev) => {
          const current = prev ?? 0;
          return (current - 1 + len) % len;
        });
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    touchMoved.current = false;
    lastTouchX.current = null;
    if (typeof window !== "undefined") console.debug("[swipe] touchend dx", dx);
  };
  const onTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    touchMoved.current = false;
    lastTouchX.current = null;
    if (typeof window !== "undefined") console.debug("[swipe] touchcancel");
  };
  const onPointerDown = (e) => {
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    touchMoved.current = false;
    lastTouchX.current = null;
    if (typeof window !== "undefined")
      console.debug("[swipe] pointerdown", e.clientX, e.clientY);
  };
  const onPointerMove = (e) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const dx = e.clientX - touchStartX.current;
    const dy = e.clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) > 10) touchMoved.current = true;
    lastTouchX.current = e.clientX;
    if (typeof window !== "undefined")
      console.debug("[swipe] pointermove dx", dx, "dy", dy);
  };
  const onPointerUp = () => {
    if (!touchMoved.current || touchStartX.current == null || lastTouchX.current == null) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchMoved.current = false;
      return;
    }
    const dx = lastTouchX.current - (touchStartX.current ?? 0);
    const threshold = 30;
    if (Math.abs(dx) >= threshold) {
      const len = videos.length;
      if (dx < 0) {
        setSelected((prev) => ((prev ?? 0) + 1) % len);
      } else {
        setSelected((prev) => ((prev ?? 0) - 1 + len) % len);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    touchMoved.current = false;
    lastTouchX.current = null;
    if (typeof window !== "undefined")
      console.debug("[swipe] pointerup dx", dx);
  };
  return /* @__PURE__ */ jsx(
    "section",
    {
      className: "relative mt-8 md:mt-0 py-6 md:py-16 md:min-h-screen md:mb-0",
      ref,
      ...props,
      children: /* @__PURE__ */ jsx("div", { className: "relative h-full z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 min-w-0", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-12 items-start md:items-center md:min-h-[70vh] gap-8 md:gap-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-5 col-span-12 h-full hidden md:flex md:flex-col justify-between md:self-end md:relative order-2 md:order-1", children: [
          /* @__PURE__ */ jsx("div", {
            // ensure English words like "SERVICES" render with Montserrat on Korean pages
            children: (() => {
              const svc = translations["home.summary.services"] ?? "SERVICE";
              if (locale === "ko" && /[A-Za-z]/.test(svc)) {
                return /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight", children: /* @__PURE__ */ jsx("span", { className: "montserrat-for-en", children: svc }) });
              }
              return /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight", children: svc });
            })()
          }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2 md:space-y-4", children: categories.map((label, i) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onMouseEnter: (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const nx = (e.clientX - cx) / (rect.width / 2);
                const ny = (e.clientY - cy) / (rect.height / 2);
                setMouse({
                  x: Math.max(-1, Math.min(1, nx)),
                  y: Math.max(-1, Math.min(1, ny))
                });
                setHovered(i);
                setSelected(i);
              },
              onMouseMove: (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const nx = (e.clientX - cx) / (rect.width / 2);
                const ny = (e.clientY - cy) / (rect.height / 2);
                setMouse({
                  x: Math.max(-1, Math.min(1, nx)),
                  y: Math.max(-1, Math.min(1, ny))
                });
              },
              onMouseLeave: () => {
                setHovered(null);
                setMouse({ x: 0, y: 0 });
              },
              className: `text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors duration-500 ease-in-out flex items-center gap-4 md:gap-6 ${selected === i || hovered === i ? "text-white" : "text-white/60"}`,
              "aria-pressed": selected === i,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `text-[20px] md:text-5xl text-outline block transform ${selected === i || hovered === i ? "text-white/100" : "text-white/60"} ${montserratIfKo(label, locale)}`,
                    style: {
                      fontFamily: "'Gilroy', sans-serif",
                      letterSpacing: "-0.44px"
                    },
                    children: label
                  }
                ),
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: "/images/arrow.png",
                    alt: "",
                    "aria-hidden": "true",
                    className: "ml-2 w-5 h-5 transform transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-1"
                  }
                )
              ] })
            },
            label
          )) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-span-12 md:hidden", "aria-hidden": true }),
        /* @__PURE__ */ jsx("div", { className: "md:col-span-7 col-span-12 md:order-2 order-1 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-full overflow-hidden relative", children: [
          /* @__PURE__ */ jsx("div", { className: "hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 w-px h-3/4 bg-white/6" }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "relative h-[min(48vh,560px)] md:h-[min(80vh,720px)]",
              onTouchStart,
              onTouchMove,
              onTouchEnd,
              onTouchCancel,
              onPointerDown,
              onPointerMove,
              onPointerUp,
              style: { touchAction: "pan-y" },
              children: [
                /* @__PURE__ */ jsx("div", { className: "md:hidden absolute inset-x-0 top-0 h-28 pointer-events-none z-20" }),
                videos.map((src, i) => {
                  const isVisible = visibleIndex === i;
                  const intensity = isVisible && hovered !== null ? 18 : 6;
                  const offsetX = isVisible ? mouse.x * intensity : 0;
                  const offsetY = isVisible ? mouse.y * intensity : 0;
                  return /* @__PURE__ */ jsx(
                    "video",
                    {
                      ref: (el) => videoRefs.current[i] = el,
                      src,
                      muted: true,
                      playsInline: true,
                      loop: true,
                      autoPlay: true,
                      preload: "auto",
                      className: `pointer-events-none absolute inset-0 h-full w-full object-cover drop-shadow-2xl transition-all will-change-[opacity,transform] ${isVisible ? "opacity-100 z-10" : "opacity-0 z-0"}`,
                      style: {
                        transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${isVisible ? 1 : 0.98})`,
                        transition: isVisible ? "opacity 360ms cubic-bezier(.22,1,.36,1), transform 520ms cubic-bezier(.22,1,.36,1)" : "opacity 280ms ease-out, transform 360ms ease-out",
                        objectPosition: "center"
                      },
                      controls: false,
                      "aria-hidden": true
                    },
                    i
                  );
                }),
                /* @__PURE__ */ jsx("span", { className: "sr-only", "aria-live": "polite", children: categories[visibleIndex] ?? "" }),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "md:hidden absolute left-4 right-4 bottom-10 z-40 flex items-center justify-center",
                    style: { paddingBottom: "env(safe-area-inset-bottom)" },
                    children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          "aria-label": "Previous image",
                          onClick: () => {
                            const len = videos.length;
                            setSelected((prev) => {
                              const current = prev ?? 0;
                              return (current - 1 + len) % len;
                            });
                          },
                          className: "w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                          children: "‹"
                        }
                      ),
                      /* @__PURE__ */ jsx("div", { className: `mx-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm flex items-center gap-3 min-w-[120px] justify-center ${montserratIfKo(categories[visibleIndex] ?? "", locale)}`, children: /* @__PURE__ */ jsx("span", { className: "font-medium truncate", children: categories[visibleIndex] ?? "" }) }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          "aria-label": "Next image",
                          onClick: () => {
                            const len = videos.length;
                            setSelected((prev) => {
                              const current = prev ?? 0;
                              return (current + 1) % len;
                            });
                          },
                          className: "w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                          children: "›"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "md:hidden absolute left-0 right-0 bottom-3 flex justify-center gap-2 z-30", children: videos.map((_, idx) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setSelected(idx),
                    "aria-label": `Show ${categories[idx] ?? `image ${idx + 1}`}`,
                    className: `w-2.5 h-2.5 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${visibleIndex === idx ? "bg-white" : "bg-white/30"}`
                  },
                  idx
                )) })
              ]
            }
          )
        ] }) })
      ] }) })
    }
  );
});
SummarySection.displayName = "SummarySection";

const ServiceSection = forwardRef((props, forwardedRef) => {
  const ref = useRef(null);
  const { translations: t, locale, banners } = useOutletContext();
  const inView = useInView(ref, { amount: 0.25 });
  const controls = useAnimation();
  const [rowIdxMap, setRowIdxMap] = useState([]);
  const [delays, setDelays] = useState([]);
  const lottieRefs = useRef([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredTile, setHoveredTile] = useState(null);
  const [hasAnimatedOnce, setHasAnimatedOnce] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("serviceTilesAnimated") === "1";
  });
  useImperativeHandle(forwardedRef, () => ref.current);
  useEffect(() => {
    const headerDom = document.getElementById("header");
    if (!headerDom || !inView) return;
    headerDom.dataset.variant = "dark";
    requestAnimationFrame(() => {
      const container = ref.current;
      if (!container) {
        controls.start("visible");
        return;
      }
      const nodes = Array.from(
        container.querySelectorAll("[data-tile-index]")
      );
      if (!nodes.length) {
        controls.start("visible");
        return;
      }
      const containerTop = container.getBoundingClientRect().top;
      const tops = nodes.map(
        (n) => Math.round((n.getBoundingClientRect().top - containerTop) / 8) * 8
      );
      const tolerance = 12;
      const uniqueTops = [];
      tops.forEach((t2) => {
        if (!uniqueTops.some((u) => Math.abs(u - t2) <= tolerance)) {
          uniqueTops.push(t2);
        }
      });
      uniqueTops.sort((a, b) => a - b);
      const rows = uniqueTops.map(() => []);
      nodes.forEach((n, i) => {
        const rowIdx = uniqueTops.findIndex((u) => Math.abs(u - tops[i]) <= tolerance);
        if (rowIdx >= 0) rows[rowIdx].push(i);
      });
      rows.forEach(
        (r) => r.sort((a, b) => {
          const na = nodes[a].getBoundingClientRect();
          const nb = nodes[b].getBoundingClientRect();
          return na.left - nb.left;
        })
      );
      const rowIndexForNode = new Array(nodes.length).fill(0);
      const computedDelays = new Array(nodes.length).fill(0);
      const rowDelay = 0.12;
      const colDelay = 0.03;
      rows.forEach((r, rowIdx) => {
        r.forEach((nodeIdx, posInRow) => {
          rowIndexForNode[nodeIdx] = rowIdx;
          computedDelays[nodeIdx] = rowIdx * rowDelay + posInRow * colDelay;
        });
      });
      setRowIdxMap(rowIndexForNode);
      setDelays(computedDelays);
      const alreadyAnimated = typeof window !== "undefined" && sessionStorage.getItem("serviceTilesAnimated") === "1";
      if (!alreadyAnimated) {
        try {
          sessionStorage.setItem("serviceTilesAnimated", "1");
        } catch (e) {
        }
        setHasAnimatedOnce(true);
        controls.start("visible");
      }
    });
  }, [inView, controls]);
  const tiles = [
    { rowSpan: 6 },
    // large anchor left
    { rowSpan: 3 },
    // accent upper
    { rowSpan: 3 },
    // accent lower (stacks with previous)
    { rowSpan: 5 },
    // mid anchor
    { rowSpan: 2 },
    // small accent
    { rowSpan: 3 },
    // medium accent
    { rowSpan: 7 },
    // large anchor right
    { rowSpan: 2 },
    // small accent
    { rowSpan: 4 },
    // medium anchor
    { rowSpan: 3 },
    // accent
    { rowSpan: 5 },
    // large anchor right
    { rowSpan: 4 },
    // small accent
    { rowSpan: 4 },
    // medium anchor
    { rowSpan: 3 }
    // accent
  ];
  const imgs = [
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg",
    "/images/hero-4.jpg",
    "/images/hero-5.jpg",
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg",
    "/images/hero-3.jpg",
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg",
    "/images/hero-3.jpg",
    "/images/hero-1.jpg"
  ];
  const useServerBanners = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("useServerBanners") === "1";
  const tileImgs = useServerBanners && Array.isArray(banners) && banners.length > 0 ? banners.map((b) => b.url) : imgs;
  const [modalUrl, setModalUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const MODAL_ANIM_MS = 320;
  const serviceTitleRaw = t["home.service.title"];
  const serviceTitle = serviceTitleRaw ?? "SELECTED";
  const shouldAppendWorks = !serviceTitleRaw || !/work/i.test(serviceTitleRaw);
  let titleBefore = serviceTitle;
  let titleMatch = null;
  let titleAfter = "";
  if (serviceTitleRaw) {
    const engMatch = serviceTitleRaw.match(/works?|work/i);
    if (engMatch && typeof engMatch.index === "number") {
      titleBefore = serviceTitleRaw.slice(0, engMatch.index);
      titleMatch = engMatch[0];
      titleAfter = serviceTitleRaw.slice(engMatch.index + titleMatch.length);
    } else {
      const korCandidates = ["작품들", "작품"];
      const found = korCandidates.map((w) => ({ w, idx: serviceTitleRaw.indexOf(w) })).filter((x) => x.idx >= 0).sort((a, b) => a.idx - b.idx)[0];
      if (found) {
        titleBefore = serviceTitleRaw.slice(0, found.idx);
        titleMatch = found.w;
        titleAfter = serviceTitleRaw.slice(found.idx + found.w.length);
      } else {
        titleBefore = serviceTitle;
        titleMatch = null;
        titleAfter = "";
      }
    }
  }
  const renderMaybeMontserrat = (text) => {
    if (!text) return null;
    if (locale === "ko" && /[A-Za-z]/.test(text)) {
      return /* @__PURE__ */ jsx("span", { className: "montserrat-for-en", children: text });
    }
    return /* @__PURE__ */ jsx(Fragment, { children: text });
  };
  function openModal(url) {
    setModalUrl(url);
    requestAnimationFrame(() => setModalVisible(true));
  }
  function closeModal() {
    setModalVisible(false);
    setTimeout(() => setModalUrl(null), MODAL_ANIM_MS);
  }
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    if (modalUrl) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev;
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalUrl]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: "min-h-[700px] md:min-h-[1400px] py-12 md:py-16 relative bg-[#1b1b1b]",
      ref,
      ...props,
      onMouseMove: (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const normalizedX = (x - centerX) / centerX;
        const normalizedY = (y - centerY) / centerY;
        setMousePos({ x: normalizedX * 0.5, y: normalizedY * 0.5 });
      },
      onMouseLeave: () => {
        setMousePos({ x: 0, y: 0 });
        setHoveredTile(null);
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 min-w-0", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight", children: serviceTitleRaw ? titleMatch ? /* @__PURE__ */ jsxs(Fragment, { children: [
            renderMaybeMontserrat(titleBefore),
            /* @__PURE__ */ jsx("span", { className: "text-red-500", children: renderMaybeMontserrat(titleMatch) }),
            renderMaybeMontserrat(titleAfter)
          ] }) : /* @__PURE__ */ jsx(Fragment, { children: renderMaybeMontserrat(serviceTitle) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            renderMaybeMontserrat(serviceTitle),
            " ",
            shouldAppendWorks ? /* @__PURE__ */ jsx("span", { className: "text-red-500", children: renderMaybeMontserrat("WORKS") }) : null
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 sm:mt-4 max-w-[68rem] text-base sm:text-lg md:text-xl text-white/80 leading-relaxed", children: t["home.service.description"] ?? "Explore the impressive portfolio of Our 3D Rendering Company to see how VISUAL ENNODE brings architectural visions to life with precision and creativity. Dive into our projects to experience the high-quality visualizations that set us apart." })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 sm:mt-8 md:mt-10 w-full px-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "w-full relative overflow-hidden min-h-[1000px] md:min-h-[1800px] bg-[#1b1b1b]", children: [
            /* @__PURE__ */ jsx("div", { className: "w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px sm:gap-2 lg:gap-px auto-rows-[minmax(80px,1fr)] sm:auto-rows-[minmax(120px,1fr)] md:auto-rows-[minmax(160px,1fr)] lg:auto-rows-fr", children: tiles.map((tile, idx) => {
              const url = tileImgs[idx % tileImgs.length];
              const rowForThis = typeof rowIdxMap[idx] === "number" ? rowIdxMap[idx] : Math.floor(idx / 4);
              const handleMouseMove = (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const normalizedX = (x - centerX) / centerX;
                const normalizedY = (y - centerY) / centerY;
                setMousePos({ x: normalizedX, y: normalizedY });
                setHoveredTile(idx);
              };
              const handleMouseLeave = () => {
                setMousePos({ x: 0, y: 0 });
                setHoveredTile(null);
              };
              const isHovered = hoveredTile === idx;
              const isHeadingHovered = hoveredTile === -1;
              const moveX = isHovered ? mousePos.x * 20 : isHeadingHovered ? mousePos.x * 8 : 0;
              const moveY = isHovered ? mousePos.y * 20 : isHeadingHovered ? mousePos.y * 8 : 0;
              const scale = isHovered ? 1.15 : isHeadingHovered ? 1.05 : 1;
              return /* @__PURE__ */ jsx(
                motion$1.button,
                {
                  "data-tile-index": idx,
                  type: "button",
                  onClick: () => openModal(url),
                  onMouseMove: handleMouseMove,
                  onMouseLeave: () => {
                    handleMouseLeave();
                    lottieRefs.current[idx]?.pause?.();
                  },
                  onMouseEnter: () => {
                    lottieRefs.current[idx]?.play?.();
                    setHoveredTile(idx);
                  },
                  onFocus: () => lottieRefs.current[idx]?.play?.(),
                  onBlur: () => lottieRefs.current[idx]?.pause?.(),
                  className: `relative overflow-hidden rounded-none bg-gray-800 block group transition-all duration-300`,
                  style: { gridRowEnd: `span ${tile.rowSpan}` },
                  initial: { opacity: 0, scale: 0.9, y: 30 },
                  animate: hasAnimatedOnce ? { opacity: 1, scale: 1, y: 0 } : inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 30 },
                  transition: hasAnimatedOnce ? { duration: 0 } : {
                    delay: delays[idx] ?? rowForThis * 0.12,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1]
                  },
                  children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "w-full h-full",
                      style: {
                        transform: `translate(${moveX}px, ${moveY}px) scale(${scale})`,
                        transition: isHovered ? "transform 0.2s ease-out" : "transform 0.5s ease-out"
                      },
                      children: /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: url,
                          alt: `work-${idx + 1}`,
                          loading: "lazy",
                          onError: (e) => {
                            const target = e.target;
                            if (target && target.src && !target.dataset.fallback) {
                              target.dataset.fallback = "1";
                              target.src = "/images/visual-placeholder.webp";
                            }
                          },
                          className: "block w-full h-full object-cover"
                        }
                      )
                    }
                  )
                },
                idx
              );
            }) }),
            /* @__PURE__ */ jsx(
              "div",
              {
                "aria-hidden": true,
                className: "absolute left-0 bottom-0 right-0 md:right-12 lg:right-16 h-[40%] bg-gradient-to-b from-transparent to-[#1b1b1b] pointer-events-none z-10"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 sm:mt-8 md:mt-12 flex justify-center", children: /* @__PURE__ */ jsx(
            Link$1,
            {
              to: localePath(locale, "works"),
              className: `px-6 sm:px-8 py-2 sm:py-3 bg-white/10 hover:bg-white/20 rounded-full text-white uppercase text-xs sm:text-sm tracking-wide transition-all duration-300 ${montserratIfKo(
                locale === "ko" ? "더 알아보기" : t["Explore more"] ?? "explore more",
                locale
              )}`,
              children: locale === "ko" ? "더 알아보기" : t["Explore more"] ?? "explore more"
            }
          ) })
        ] }),
        modalUrl && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `absolute inset-0 bg-black/70 transition-opacity duration-300 ${modalVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`,
              onClick: () => closeModal(),
              "aria-hidden": true
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: `relative max-w-[min(1100px,90vw)] max-h-[90vh] w-full p-4 transform transition-all duration-300 ease-out ${modalVisible ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`,
              children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => closeModal(),
                    className: "absolute top-5 bg-black/10 right-5 z-10 text-white rounded-sm px-2",
                    "aria-label": "Close",
                    children: "✕"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: modalUrl,
                    alt: "tile",
                    className: "w-full h-full object-contain rounded-md bg-black"
                  }
                )
              ]
            }
          )
        ] })
      ]
    }
  );
});
ServiceSection.displayName = "ServiceSection";

function SmoothScrollLayout({ children, onIndexChange, className }) {
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sections = Array.from(container.children);
    const debug = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debugScroll");
    const observer = new IntersectionObserver(
      (entries) => {
        if (debug) {
          console.debug("[scroll-observer] entries", entries.length);
        }
        const containerRect = container.getBoundingClientRect();
        let bestIndex = -1;
        let bestRatio = -1;
        let bestDistance = Number.POSITIVE_INFINITY;
        sections.forEach((s, idx) => {
          const rect = s.getBoundingClientRect();
          const overlapTop = Math.max(rect.top, containerRect.top);
          const overlapBottom = Math.min(rect.bottom, containerRect.bottom);
          const visibleHeight = Math.max(0, overlapBottom - overlapTop);
          const ratio = rect.height > 0 ? visibleHeight / rect.height : 0;
          const elemCenterY = rect.top + rect.height / 2;
          const containerCenterY = containerRect.top + container.clientHeight / 2;
          const distance = Math.abs(elemCenterY - containerCenterY);
          if (debug) {
            console.debug("[scroll-observer] section", idx, { ratio, visibleHeight, rect, distance });
          }
          if (ratio > bestRatio || Math.abs(ratio - bestRatio) < 1e-6 && distance < bestDistance) {
            bestRatio = ratio;
            bestIndex = idx;
            bestDistance = distance;
          }
        });
        if (debug) {
          console.debug("[scroll-observer] best", { bestIndex, bestRatio, bestDistance });
        }
        if (bestIndex !== -1 && onIndexChange) {
          onIndexChange(bestIndex, sections.length);
        }
        if (bestIndex !== -1) {
          sections.forEach((s, i) => {
            if (i === bestIndex) s.dataset.scrollActive = "true";
            else delete s.dataset.scrollActive;
          });
        }
      },
      {
        threshold: [0, 0.05, 0.1, 0.25, 0.5],
        root: container,
        rootMargin: "0px 0px 0px 0px"
      }
    );
    sections.forEach((t) => observer.observe(t));
    return () => {
      observer.disconnect();
    };
  }, [onIndexChange]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: containerRef,
      "data-smooth-scroll": "true",
      className: cn(
        "overflow-y-auto scroll-smooth",
        // Remove fixed height, let content flow naturally
        className
      ),
      style: {
        scrollBehavior: "smooth",
        height: "100vh"
        // Only the container should be viewport height
      },
      children
    }
  );
}

function ScrollProgress({ currentIndex, totalSections, className, labels }) {
  return (
    // hide on small screens, show from md up
    /* @__PURE__ */ jsx("div", { className: cn("hidden md:block fixed right-8 lg:right-12 top-1/2 -translate-y-1/2 z-40", className), children: /* @__PURE__ */ jsx("div", { className: "relative flex flex-col gap-4", children: Array.from({ length: totalSections }, (_, index) => {
      const labelText = labels && labels[index] ? labels[index] : (index + 1).toString().padStart(1, "0");
      const onActivate = () => {
        const container = document.querySelector('[data-smooth-scroll="true"]');
        if (!container) return;
        const sections = Array.from(container.children);
        const target = sections[index];
        if (!target) return;
        const containerRect = container.getBoundingClientRect();
        const title = target.querySelector("h1, h2, .section-title");
        const referenceEl = title ?? target;
        const refRect = referenceEl.getBoundingClientRect();
        const offsetAdjustment = Math.round(container.clientHeight * 0.18);
        const desiredTop = container.scrollTop + (refRect.top - containerRect.top) - offsetAdjustment;
        container.scrollTo({ top: desiredTop, behavior: "smooth" });
        const focusable = target.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
      };
      return /* @__PURE__ */ jsx(
        motion.div,
        {
          role: "button",
          tabIndex: 0,
          onClick: onActivate,
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onActivate();
            }
          },
          className: cn(
            "relative text-right text-lg font-medium cursor-pointer min-h-[24px] flex items-center justify-end",
            index === currentIndex ? "text-white" : "text-white/60 hover:text-white/80"
          ),
          initial: { opacity: 0, x: 30 },
          animate: {
            opacity: 1,
            x: index === currentIndex ? 0 : 10,
            scale: index === currentIndex ? 1.5 : 1
          },
          transition: {
            duration: 0.5,
            ease: "easeOut",
            scale: { duration: 0.15 }
          },
          children: labelText
        },
        index
      );
    }) }) })
  );
}

const NewsSection = forwardRef((props, forwardedRef) => {
  const { newsList: propsNewsList, newsCount, imageWidthClass, ...domProps } = props;
  const ref = useRef(null);
  const { translations: t, locale } = useOutletContext();
  const inView = useInView(ref, { amount: 1 });
  const newsList = Array.isArray(propsNewsList) ? propsNewsList : [];
  const getT = (k) => t[k] ?? k;
  useImperativeHandle(forwardedRef, () => ref.current);
  useEffect(() => {
    const headerDom = document.getElementById("header");
    if (!headerDom || !inView) return;
    headerDom.dataset.variant = "light";
  }, [inView]);
  return /* @__PURE__ */ jsx("section", { ref, className: "min-h-screen flex py-12 md:py-16", ...domProps, children: /* @__PURE__ */ jsx(Container, { className: "m-auto w-full", variant: "fluid", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 md:px-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative mb-6 sm:mb-8 lg:mb-10", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-0 opacity-5 pointer-events-none hidden sm:block", children: /* @__PURE__ */ jsx("img", { src: "/images/ennode-placeholder.webp", alt: "", className: "w-32 sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 object-contain" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-4 sm:gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight", children: /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: locale === "ko" ? "montserrat-for-en" : "", children: "RELATED " }),
            /* @__PURE__ */ jsx("span", { className: (locale === "ko" ? "montserrat-for-en " : "") + "text-red-500", children: t["NEWS"] ?? "NEWS" })
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: `text-base sm:text-lg text-white/60 mt-2 sm:mt-3 ${montserratIfKo(t["New update"] ?? "Latest articles", locale)}`, children: t["New update"] ?? "Latest articles" })
        ] }),
        props.newsCount > 4 && /* @__PURE__ */ jsxs(Link$1, { to: localePath(locale, "news"), className: `text-xs sm:text-sm text-white/70 hover:text-white transition whitespace-nowrap ${montserratIfKo(t["See more"] ?? "See more", locale)}`, children: [
          t["See more"] ?? "See more",
          " (",
          props.newsCount,
          ")"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6", children: newsList.map((news, index) => /* @__PURE__ */ jsx("article", { className: "rounded-none mb-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300", children: /* @__PURE__ */ jsxs(Link$1, { to: localePath(locale, `news/${news.slug}`), className: "block focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `overflow-hidden rounded-none mx-auto w-full max-w-full ${imageWidthClass ?? ""} aspect-video`,
            children: /* @__PURE__ */ jsx("img", { src: news.optimize_attachment_url ?? news.attachment_url, alt: news.title, className: "w-full h-full object-cover transition-transform duration-500 hover:scale-105" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 sm:mt-3 md:mt-4", children: [
          /* @__PURE__ */ jsx("time", { className: "text-xs text-white/60 block mb-1 sm:mb-2", children: new Date(news.published_at).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric", day: "2-digit" }) }),
          /* @__PURE__ */ jsx("h4", { className: "text-white text-base sm:text-lg md:text-xl font-normal line-clamp-2", "data-koreanable": true, children: news.title })
        ] })
      ] }) }, index)) }),
      /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-b from-transparent to-[#1b1b1b] pointer-events-none z-10" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 sm:mt-5 lg:mt-6 flex justify-center", children: /* @__PURE__ */ jsx(Link$1, { to: localePath(locale, "news"), className: `px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-full text-white uppercase text-xs sm:text-sm tracking-wide transition-all duration-300 ${montserratIfKo(getT("Go to news"), locale)}`, children: getT("Go to news") }) })
  ] }) }) });
});
NewsSection.displayName = "NewsSection";

const meta = ({
  matches
}) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;
  const titleText = title(rootMatch.translations["home.page.title"], true);
  const descText = rootMatch.translations["home.page.description"];
  const ogTitle = rootMatch.translations["home.page.og.title"];
  const ogDesc = rootMatch.translations["home.page.og.description"];
  const twitterTitle = rootMatch.translations["home.page.twitter.title"];
  const twitterDesc = rootMatch.translations["home.page.twitter.description"];
  return [
    { title: titleText },
    { name: "description", content: descText },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDesc },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com" },
    {
      property: "og:image",
      content: "https://www.visualennode.com/images/og-cover.jpg"
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: twitterTitle },
    { name: "twitter:description", content: twitterDesc },
    {
      name: "twitter:image",
      content: "https://www.visualennode.com/images/og-cover.jpg"
    }
  ];
};
async function loader({ params }) {
  const locale = params.locale ?? "en";
  const api = new Api();
  let newsCount = 0;
  const clients = await api.getClients(locale).then(async (response) => {
    return response.data.data;
  });
  const newsList = await api.getNewsList(locale, "", 1).then(async (response) => {
    newsCount = response.data.meta.total;
    return response.data.data.splice(0, 6);
  });
  return {
    clients,
    newsList,
    newsCount
  };
}
function Index() {
  const [loaded, setLoaded] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [videosReady, setVideosReady] = useState(false);
  const [counterDone, setCounterDone] = useState(false);
  const { clients, newsList, newsCount } = useLoaderData();
  const { translations, locale } = useOutletContext();
  let processItems = translations["about.process.steps"];
  if (!processItems) processItems = itemsForLocale(locale);
  const handleIndexChange = (currentIndex, totalSections2) => {
    setCurrentSection(currentIndex);
    setTotalSections(totalSections2);
  };
  useEffect(() => {
    if (loaded) return;
    const videos = document.querySelectorAll("video");
    let videoLoadedCount = 0;
    let autoplayVideoCount = 0;
    videos.forEach((video) => {
      if (video.autoplay) {
        autoplayVideoCount++;
      }
    });
    function handleLoadedVideo() {
      videoLoadedCount++;
      if (videoLoadedCount === autoplayVideoCount) {
        if (counterDone) {
          setLoaded(true);
        } else {
          setVideosReady(true);
        }
      }
    }
    videos.forEach((video) => {
      if (video.autoplay) {
        if (video.readyState >= video.HAVE_FUTURE_DATA) {
          handleLoadedVideo();
          return;
        }
        video.addEventListener("canplaythrough", handleLoadedVideo);
      }
    });
    return () => {
      videos.forEach((video) => {
        if (video.autoplay) {
          video.removeEventListener("canplaythrough", handleLoadedVideo);
        }
      });
    };
  }, [loaded, counterDone, videosReady]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(AnimatePresence, { children: !loaded && locale !== "ko" && /* @__PURE__ */ jsx(
      motion$1.div,
      {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: {
          opacity: 0,
          y: -12,
          transition: { duration: 0.6, ease: "easeInOut" }
        },
        className: cn(
          "fixed inset-0 bg-[#1b1b1b] z-50 flex items-center justify-center",
          loaded ? "hidden" : ""
        ),
        children: /* @__PURE__ */ jsx("div", { className: "text-center max-w-screen-md w-full", children: /* @__PURE__ */ jsx(
          LoadingCounter,
          {
            onFinish: () => {
              if (videosReady) {
                setLoaded(true);
              } else {
                setCounterDone(true);
              }
            }
          }
        ) })
      },
      "loading-overlay"
    ) }),
    loaded && /* @__PURE__ */ jsx(
      ScrollProgress,
      {
        currentIndex: currentSection,
        totalSections,
        className: "z-40",
        labels: [
          "Home",
          "Services",
          "Works",
          "Clients",
          "Process",
          "News",
          "Contact"
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: locale === "ko" ? "ko-solid" : "", children: /* @__PURE__ */ jsxs(SmoothScrollLayout, { onIndexChange: handleIndexChange, children: [
      /* @__PURE__ */ jsx(HeroSection, { ready: loaded }),
      /* @__PURE__ */ jsx(SummarySection, {}),
      /* @__PURE__ */ jsx(ServiceSection, {}),
      /* @__PURE__ */ jsx(ClientSection, { clients }),
      /* @__PURE__ */ jsx(WorkProcess, { items: processItems }),
      /* @__PURE__ */ jsx(NewsSection, { newsList, newsCount }),
      /* @__PURE__ */ jsx(ContactSection, {})
    ] }) })
  ] });
}

const route14 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: Index,
  loader,
  meta
}, Symbol.toStringTag, { value: 'Module' }));

function DebugOverflow() {
  const [results, setResults] = useState([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => {
      const overs = [];
      const ww = document.documentElement.clientWidth;
      document.querySelectorAll("*").forEach((el) => {
        try {
          const r = el.getBoundingClientRect();
          if (r.right > ww + 1 || r.left < -1) {
            let selector = el.tagName.toLowerCase();
            if (el.id) selector += `#${el.id}`;
            else if (el.className && typeof el.className === "string") {
              const cls = el.className.split(" ")[0] || "";
              if (cls) selector += `.${cls.replace(/\s+/g, ".")}`;
            }
            overs.push({ selector, rect: r });
          }
        } catch (e) {
        }
      });
      setResults(overs);
    }, 250);
    return () => clearTimeout(t);
  }, []);
  return /* @__PURE__ */ jsxs("div", { style: { padding: 20, color: "white", background: "#111", minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsx("h1", { style: { fontSize: 18, marginBottom: 10 }, children: "Overflow debug" }),
    /* @__PURE__ */ jsx("p", { style: { marginBottom: 12, color: "#ccc" }, children: "This page scans the DOM and lists elements whose bounding box extends outside the viewport. Open this URL on the device where you see horizontal scrolling (mobile/emulator) and paste the first few results here." }),
    /* @__PURE__ */ jsx("div", { style: { marginBottom: 12 }, children: /* @__PURE__ */ jsxs("strong", { children: [
      "Results: ",
      results.length
    ] }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      results.length === 0 && /* @__PURE__ */ jsx("div", { style: { color: "#9aa" }, children: "No overflowing elements detected (or they appear briefly). Try toggling the mobile menu before loading this page." }),
      results.map((r, i) => /* @__PURE__ */ jsxs("div", { style: { padding: 8, borderRadius: 6, background: "#0e0e0e", marginBottom: 8 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontFamily: "monospace" }, children: r.selector }),
        /* @__PURE__ */ jsxs("div", { style: { color: "#9aa", fontSize: 12 }, children: [
          "left: ",
          Math.round(r.rect.left),
          ", right: ",
          Math.round(r.rect.right),
          ", width: ",
          Math.round(r.rect.width),
          ", top: ",
          Math.round(r.rect.top),
          ", height: ",
          Math.round(r.rect.height)
        ] })
      ] }, i))
    ] }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: 20 }, children: /* @__PURE__ */ jsx("small", { style: { color: "#777" }, children: "When you have results, paste the top 3 selectors here and I'll patch them." }) })
  ] });
}

const route15 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: DebugOverflow
}, Symbol.toStringTag, { value: 'Module' }));

const serverManifest = {'entry':{'module':'/assets/entry.client-C0dgAWPW.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/i18n-DH-wL5Eu.js','/assets/context-DOdfq747.js'],'css':[]},'routes':{'root':{'id':'root','parentId':undefined,'path':'','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':true,'module':'/assets/root-DB28LDdh.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/i18n-DH-wL5Eu.js','/assets/context-DOdfq747.js','/assets/useTranslation-C2uTB0a1.js','/assets/container-2TlAo-hG.js','/assets/icon-CP4mJMRx.js','/assets/utils-tQ8evKDJ.js','/assets/Combination-Bn4r43AQ.js','/assets/check-BrZisPkV.js','/assets/index-BgzGjlS9.js','/assets/chevron-right-BxmQk4H8.js','/assets/createLucideIcon-C2Ywi-cO.js','/assets/contact-cta-section-BBuv_ViC.js','/assets/loading-counter-C7EV_7Hk.js','/assets/elements-Dbp8aVoy.js','/assets/index-D3ZRcz1e.js','/assets/resolve-elements-WL2ErOKm.js'],'css':['/assets/root-5BMW_LtI.css']},'routes/($locale).ennode.digital._index':{'id':'routes/($locale).ennode.digital._index','parentId':'root','path':':locale?/ennode/digital','index':true,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-CyQhggqy.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/carousel-9jwcCCO4.js','/assets/container-2TlAo-hG.js','/assets/utils-tQ8evKDJ.js','/assets/use-mobile-BaVIqU-6.js','/assets/i18n-DH-wL5Eu.js'],'css':[]},'routes/($locale).works.$category.$work':{'id':'routes/($locale).works.$category.$work','parentId':'routes/($locale).works.$category','path':':work','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-Bd1YvllV.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/Combination-Bn4r43AQ.js','/assets/index-BgzGjlS9.js','/assets/utils-tQ8evKDJ.js','/assets/createLucideIcon-C2Ywi-cO.js','/assets/icon-CP4mJMRx.js','/assets/i18n-DH-wL5Eu.js','/assets/elements-Dbp8aVoy.js','/assets/resolve-elements-WL2ErOKm.js'],'css':[]},'routes/($locale).ennode.arc._index':{'id':'routes/($locale).ennode.arc._index','parentId':'root','path':':locale?/ennode/arc','index':true,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-CnigBhY1.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/team-section-CkguuTle.js','/assets/i18n-DH-wL5Eu.js','/assets/container-2TlAo-hG.js','/assets/utils-tQ8evKDJ.js','/assets/carousel-9jwcCCO4.js'],'css':[]},'routes/($locale).news.$slug._index':{'id':'routes/($locale).news.$slug._index','parentId':'root','path':':locale?/news/:slug','index':true,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-DIYPAV94.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/contact-section-B-y5Wsm-.js','/assets/utils-tQ8evKDJ.js','/assets/container-2TlAo-hG.js','/assets/i18n-DH-wL5Eu.js','/assets/contact-cta-section-BBuv_ViC.js','/assets/resolve-elements-WL2ErOKm.js'],'css':[]},'routes/($locale).works.$category':{'id':'routes/($locale).works.$category','parentId':'root','path':':locale?/works/:category','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-BjgdLnI0.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/container-2TlAo-hG.js','/assets/icon-CP4mJMRx.js','/assets/utils-tQ8evKDJ.js','/assets/carousel-9jwcCCO4.js','/assets/i18n-DH-wL5Eu.js','/assets/createLucideIcon-C2Ywi-cO.js','/assets/elements-Dbp8aVoy.js','/assets/resolve-elements-WL2ErOKm.js'],'css':[]},'routes/($locale).contact._index':{'id':'routes/($locale).contact._index','parentId':'root','path':':locale?/contact','index':true,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-DB-XYw2H.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/contact-section-B-y5Wsm-.js','/assets/container-2TlAo-hG.js','/assets/index-D3ZRcz1e.js','/assets/utils-tQ8evKDJ.js','/assets/icon-CP4mJMRx.js','/assets/use-mobile-BaVIqU-6.js','/assets/i18n-DH-wL5Eu.js','/assets/contact-cta-section-BBuv_ViC.js','/assets/resolve-elements-WL2ErOKm.js'],'css':[]},'routes/($locale).career._index':{'id':'routes/($locale).career._index','parentId':'root','path':':locale?/career','index':true,'caseSensitive':undefined,'hasAction':true,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-D4fZkf_X.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/container-2TlAo-hG.js','/assets/createLucideIcon-C2Ywi-cO.js','/assets/index-D3ZRcz1e.js','/assets/i18n-DH-wL5Eu.js','/assets/Combination-Bn4r43AQ.js','/assets/check-BrZisPkV.js','/assets/utils-tQ8evKDJ.js'],'css':[]},'routes/($locale).ennode._index':{'id':'routes/($locale).ennode._index','parentId':'root','path':':locale?/ennode','index':true,'caseSensitive':undefined,'hasAction':false,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-oJw-tJEK.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/container-2TlAo-hG.js','/assets/utils-tQ8evKDJ.js','/assets/i18n-DH-wL5Eu.js','/assets/arrow-right-DofWVnUm.js','/assets/createLucideIcon-C2Ywi-cO.js'],'css':[]},'routes/($locale).favicon-$name':{'id':'routes/($locale).favicon-$name','parentId':'root','path':':locale?/favicon-$name','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/(_locale).favicon-_name-CZ0Ns0X4.js','imports':[],'css':[]},'routes/($locale).about._index':{'id':'routes/($locale).about._index','parentId':'root','path':':locale?/about','index':true,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-DRZoNbjt.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/container-2TlAo-hG.js','/assets/i18n-DH-wL5Eu.js','/assets/utils-tQ8evKDJ.js','/assets/process-section-DofGXUeg.js','/assets/team-section-CkguuTle.js','/assets/contact-section-B-y5Wsm-.js','/assets/carousel-9jwcCCO4.js','/assets/contact-cta-section-BBuv_ViC.js','/assets/resolve-elements-WL2ErOKm.js'],'css':[]},'routes/($locale).works._index':{'id':'routes/($locale).works._index','parentId':'root','path':':locale?/works','index':true,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-CTNqqIJh.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/utils-tQ8evKDJ.js','/assets/contact-section-B-y5Wsm-.js','/assets/i18n-DH-wL5Eu.js','/assets/useTranslation-C2uTB0a1.js','/assets/arrow-right-DofWVnUm.js','/assets/elements-Dbp8aVoy.js','/assets/container-2TlAo-hG.js','/assets/contact-cta-section-BBuv_ViC.js','/assets/resolve-elements-WL2ErOKm.js','/assets/context-DOdfq747.js','/assets/createLucideIcon-C2Ywi-cO.js'],'css':[]},'routes/($locale).favicon.ico':{'id':'routes/($locale).favicon.ico','parentId':'root','path':':locale?/favicon/ico','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/(_locale).favicon.ico-l0sNRNKZ.js','imports':[],'css':[]},'routes/($locale).news._index':{'id':'routes/($locale).news._index','parentId':'root','path':':locale?/news','index':true,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-DB7MG7Cd.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/utils-tQ8evKDJ.js','/assets/contact-section-B-y5Wsm-.js','/assets/container-2TlAo-hG.js','/assets/i18n-DH-wL5Eu.js','/assets/createLucideIcon-C2Ywi-cO.js','/assets/chevron-right-BxmQk4H8.js','/assets/contact-cta-section-BBuv_ViC.js','/assets/resolve-elements-WL2ErOKm.js'],'css':[]},'routes/($locale)._index':{'id':'routes/($locale)._index','parentId':'root','path':':locale?','index':true,'caseSensitive':undefined,'hasAction':false,'hasLoader':true,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/route-BRH-77qA.js','imports':['/assets/jsx-runtime-kF-aRxYe.js','/assets/utils-tQ8evKDJ.js','/assets/i18n-DH-wL5Eu.js','/assets/arrow-right-DofWVnUm.js','/assets/elements-Dbp8aVoy.js','/assets/contact-section-B-y5Wsm-.js','/assets/loading-counter-C7EV_7Hk.js','/assets/process-section-DofGXUeg.js','/assets/container-2TlAo-hG.js','/assets/createLucideIcon-C2Ywi-cO.js','/assets/resolve-elements-WL2ErOKm.js','/assets/contact-cta-section-BBuv_ViC.js'],'css':[]},'routes/debug.overflow':{'id':'routes/debug.overflow','parentId':'root','path':'debug/overflow','index':undefined,'caseSensitive':undefined,'hasAction':false,'hasLoader':false,'hasClientAction':false,'hasClientLoader':false,'hasErrorBoundary':false,'module':'/assets/debug.overflow-C_wAp7uD.js','imports':['/assets/jsx-runtime-kF-aRxYe.js'],'css':[]}},'url':'/assets/manifest-4228b6d7.js','version':'4228b6d7'};

/**
       * `mode` is only relevant for the old Remix compiler but
       * is included here to satisfy the `ServerBuild` typings.
       */
      const mode = "production";
      const assetsBuildDirectory = "build\\client";
      const basename = "/";
      const future = {"v3_fetcherPersist":true,"v3_relativeSplatPath":true,"v3_throwAbortReason":true,"v3_routeConfig":false,"v3_singleFetch":true,"v3_lazyRouteDiscovery":false,"unstable_optimizeDeps":false};
      const isSpaMode = false;
      const publicPath = "/";
      const entry = { module: entryServer };
      const routes = {
        "root": {
          id: "root",
          parentId: undefined,
          path: "",
          index: undefined,
          caseSensitive: undefined,
          module: route0
        },
  "routes/($locale).ennode.digital._index": {
          id: "routes/($locale).ennode.digital._index",
          parentId: "root",
          path: ":locale?/ennode/digital",
          index: true,
          caseSensitive: undefined,
          module: route1
        },
  "routes/($locale).works.$category.$work": {
          id: "routes/($locale).works.$category.$work",
          parentId: "routes/($locale).works.$category",
          path: ":work",
          index: undefined,
          caseSensitive: undefined,
          module: route2
        },
  "routes/($locale).ennode.arc._index": {
          id: "routes/($locale).ennode.arc._index",
          parentId: "root",
          path: ":locale?/ennode/arc",
          index: true,
          caseSensitive: undefined,
          module: route3
        },
  "routes/($locale).news.$slug._index": {
          id: "routes/($locale).news.$slug._index",
          parentId: "root",
          path: ":locale?/news/:slug",
          index: true,
          caseSensitive: undefined,
          module: route4
        },
  "routes/($locale).works.$category": {
          id: "routes/($locale).works.$category",
          parentId: "root",
          path: ":locale?/works/:category",
          index: undefined,
          caseSensitive: undefined,
          module: route5
        },
  "routes/($locale).contact._index": {
          id: "routes/($locale).contact._index",
          parentId: "root",
          path: ":locale?/contact",
          index: true,
          caseSensitive: undefined,
          module: route6
        },
  "routes/($locale).career._index": {
          id: "routes/($locale).career._index",
          parentId: "root",
          path: ":locale?/career",
          index: true,
          caseSensitive: undefined,
          module: route7
        },
  "routes/($locale).ennode._index": {
          id: "routes/($locale).ennode._index",
          parentId: "root",
          path: ":locale?/ennode",
          index: true,
          caseSensitive: undefined,
          module: route8
        },
  "routes/($locale).favicon-$name": {
          id: "routes/($locale).favicon-$name",
          parentId: "root",
          path: ":locale?/favicon-$name",
          index: undefined,
          caseSensitive: undefined,
          module: route9
        },
  "routes/($locale).about._index": {
          id: "routes/($locale).about._index",
          parentId: "root",
          path: ":locale?/about",
          index: true,
          caseSensitive: undefined,
          module: route10
        },
  "routes/($locale).works._index": {
          id: "routes/($locale).works._index",
          parentId: "root",
          path: ":locale?/works",
          index: true,
          caseSensitive: undefined,
          module: route11
        },
  "routes/($locale).favicon.ico": {
          id: "routes/($locale).favicon.ico",
          parentId: "root",
          path: ":locale?/favicon/ico",
          index: undefined,
          caseSensitive: undefined,
          module: route12
        },
  "routes/($locale).news._index": {
          id: "routes/($locale).news._index",
          parentId: "root",
          path: ":locale?/news",
          index: true,
          caseSensitive: undefined,
          module: route13
        },
  "routes/($locale)._index": {
          id: "routes/($locale)._index",
          parentId: "root",
          path: ":locale?",
          index: true,
          caseSensitive: undefined,
          module: route14
        },
  "routes/debug.overflow": {
          id: "routes/debug.overflow",
          parentId: "root",
          path: "debug/overflow",
          index: undefined,
          caseSensitive: undefined,
          module: route15
        }
      };

export { serverManifest as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, mode, publicPath, routes };
