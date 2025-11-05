
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useChangeLanguage } from "remix-i18next/react";
import { useTranslation } from "react-i18next";
import i18next from "~/i18next.server";
import "./tailwind.css";
import { Api } from "./lib/api";
import Header from "./components/header";
import { Attachment } from "./types/resources";
import { redirect } from "@remix-run/node";
// GlobalProgressIndicator removed per request (blue loading bar)
import { cn } from "./lib/utils";
import genericTranslations from "public/locales/en/common.json"
import i18n from "~/i18n";
import { useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import GlobalParallax from "./components/global-parallax";
import LoadingCounter from "./components/loading-counter";
import { /* AnimatePresence, motion */ } from "framer-motion";
 

export const links: LinksFunction = () => [
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

export const handle = {
  i18n: "common",
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const api = new Api();
  const url = new URL(request.url);
  // If the incoming URL doesn't contain a locale param (e.g. visiting '/'),
  // redirect to the fallback locale so the site has explicit language-prefixed URLs
  const hasLocaleParam = Boolean(params.locale);
  if (!hasLocaleParam) {
    const target = `/${i18n.fallbackLng}${url.pathname === "/" ? "" : url.pathname}${url.search}`;
    return redirect(target);
  }

  const locale = params.locale ?? i18n.fallbackLng;

  // If someone navigates to an unsupported locale, redirect to the fallback
  if (!i18n.supportedLngs.includes(locale)) {
    return redirect(`/${i18n.fallbackLng}${url.pathname}${url.search}`);
  }

  const t = await i18next.getFixedT(locale);

  const banners = await api.getBanners().then(res => res.data.data) ?? [];

  // Build the translations object. Start with the keys defined in the English
  // genericTranslations (so t(key) works for all of those), then also import
  // the locale-specific JSON and merge any keys that are present there but not
  // in the English file (this preserves arrays/objects like about.process.steps).
  const base = Object.fromEntries(
    Object.keys(genericTranslations).map((key) => [key, t(key)])
  ) as Record<string, unknown>;

  let localeExtras: Record<string, unknown> = {};
  try {
    // dynamic import of locale JSON (keeps arrays/objects intact)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // import path is from project root 'public/locales/<locale>/common.json'
      // use require to ensure JSON is loaded on the server at runtime
      // (Vite/Remix will include the file in the build)
    const localeFile = await import(/* @vite-ignore */ `public/locales/${locale}/common.json`);
    localeExtras = (localeFile && (localeFile.default ?? localeFile)) as Record<string, unknown>;
  } catch (err) {
    // If the locale file doesn't exist or can't be imported, ignore and fall
    // back to base translations only.
  }

  const translations = {
    ...base,
    // only add keys that are not already present in base so t(key) continues
    // to control canonical string translations, but arrays/objects from the
    // locale file will be available as extras (e.g. about.process.steps)
    ...Object.fromEntries(
      Object.keys(localeExtras).filter((k) => !(k in base)).map((k) => [k, localeExtras[k]])
    ),
  } as typeof genericTranslations & Record<string, unknown>;

  return {
    configuration: await api.getConfiguration(),
    translations,
    locale,
    banners,
  };
}

export interface AppContext {
  brand: Attachment;
  heroCover: Attachment;
  translations: typeof genericTranslations;
  locale: typeof i18n.supportedLngs[number];
  banners: Array<{ group: string; url: string }>;
}

export default function App() {
  const { locale, configuration, translations, banners } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  const { i18n } = useTranslation();

  const scrollableRouteIds = [
    "routes/($locale).works.$category",
    "routes/($locale).works.$category.$work",
    "routes/($locale).career._index",
    "routes/($locale).contact._index",
    "routes/($locale).about._index",
    "routes/($locale).news._index",
    "routes/($locale).news.$slug._index",
  ];

  const scrollable = scrollableRouteIds.includes(lastMatch.id);

  useChangeLanguage(locale);

    // Show a one-time loading overlay for the Korean site across all routes.
    // This central overlay runs on the client and will hide itself when
    // the `LoadingCounter` signals onFinish. We initialize visible only for
    // Korean locale so it doesn't affect other languages (which may render
    // their own page-level loaders).
    const [overlayVisible, setOverlayVisible] = useState<boolean>(locale === "ko");

  useEffect(() => {



      // run only once on client mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale]);

  useEffect(() => {
    if (!document) return;

    const lightSchemeIcon = document.querySelector('link#light-scheme-icon')!;
    const darkSchemeIcon = document.querySelector('link#dark-scheme-icon')!;

    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    matcher.addEventListener('change', onUpdate);

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
      matcher.removeEventListener('change', onUpdate);
    };
  }, []);

  return (
    <html suppressHydrationWarning lang={locale} dir={i18n.dir()} className={cn("overscroll-none scroll-smooth", locale === "ko" ? "ko-solid" : "")} translate="no" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, minimal-ui" />

        <meta property="og:title" content="Visual Ennode: We visualize - We connect" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://visualennode.com/images/thumbnail.jpg" />
        <meta property="og:url" content="https://visualennode.com/" />
        <meta property="og:description" content="Contact us today to discuss your next project and transform your ideas into stunning visual realities." />
        <meta property="og:site_name" content="Visual Ennode Co., LTD" />
        <meta name="google" content="notranslate" />
        
  <Meta />
  {/* Alternate language links for SEO */}
  <link rel="alternate" hrefLang="en" href={`https://visualennode.com/en/`} />
  <link rel="alternate" hrefLang="ko" href={`https://visualennode.com/ko/`} />
        <Links />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          scrollable ? "" : "lock-scroll"
        )}
      >
        <Header brand={configuration.brand.data} translations={translations} locale={locale} />

        {overlayVisible && (
          <div className="text-center max-w-screen-md w-full mx-auto my-8">
            <LoadingCounter onFinish={() => setOverlayVisible(false)} />
          </div>
        )}

        <Outlet
          context={{
            brand: configuration.brand.data,
            translations,
            locale,
            banners,
          }}
        />
        <GlobalParallax />
        <Toaster richColors position="top-right" icons={{
          error: <svg data-testid="geist-icon" className="size-5" strokeLinejoin="round" viewBox="0 0 16 16" ><path fillRule="evenodd" clipRule="evenodd" d="M8.55846 0.5C9.13413 0.5 9.65902 0.829456 9.90929 1.34788L15.8073 13.5653C16.1279 14.2293 15.6441 15 14.9068 15H1.09316C0.355835 15 -0.127943 14.2293 0.192608 13.5653L6.09065 1.34787C6.34092 0.829454 6.86581 0.5 7.44148 0.5H8.55846ZM8.74997 4.75V5.5V8V8.75H7.24997V8V5.5V4.75H8.74997ZM7.99997 12C8.55226 12 8.99997 11.5523 8.99997 11C8.99997 10.4477 8.55226 10 7.99997 10C7.44769 10 6.99997 10.4477 6.99997 11C6.99997 11.5523 7.44769 12 7.99997 12Z" fill="currentColor"></path></svg>
        }} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  }

  return (
    <>
      <h1>Error!</h1>
      <p>{(error as Error)?.message ?? "Unknown error"}</p>
    </>
  );
}
