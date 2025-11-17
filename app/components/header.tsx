import { Attachment } from "~/types/resources";
import { Container } from "./ui/container";
import { CrossIcon, GlobeIcon, HamburgerMenuIcon } from "./ui/icon";
import { useEffect, useState, useRef } from "react";
import { cn, localePath, montserratIfKo } from "~/lib/utils";
import {
  Link,
  useLocation,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import * as motion from "motion/react-client";
import { AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { AppContext } from "~/root";
import { ContactCtaSection } from "./contact-cta-section";

interface HeaderProps {
  brand: Attachment;
  translations: AppContext["translations"];
  locale: string;
}

export default function Header({
  brand,
  translations: t,
  locale,
}: HeaderProps) {
  const [collapse, setCollapse] = useState<boolean>(true);
  const [closing, setClosing] = useState<boolean>(false);
  const navigation = useNavigation();
  const [lastHeaderVariant, setLastHeaderVariant] = useState<
    string | undefined
  >();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome =
    location.pathname === localePath(locale, "") ||
    location.pathname === `/${locale}` ||
    location.pathname === `/${locale}/`;

  function switchLocale(newLocale: string) {
    return navigate(
      localePath(
        newLocale,
        location.pathname.replace("/" + locale, "").replace(/\/$/g, "")
      )
    );
  }

  const CLOSE_EXIT_MS = 280; // match motion exit duration (ms)
  const closeTimerRef = useRef<number | null>(null);

  // Ensure we clear any pending timers when unmounting
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

    // If not on the homepage, force solid header and skip dataset.variant changes.
    if (!isHome) {
      headerDom.classList.remove("opacity-50");
      // make it visually solid (background/text colors are handled in React render via classes)
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
      // ensure solid on non-home pages
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
        // keep non-home header solid
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

  return (
    <header
      className={cn(
        "fixed top-0 w-full h-20 left-0 z-40 group text-white overflow-visible min-w-0 transition-colors motion-safe:transition-all duration-300 ease-out hover:bg-black/20 hover:backdrop-blur-sm",
        !collapse
      )}
      id="header"
    >
      <Container
        variant="fluid"
        className="flex items-center bg-transparent h-full relative z-10 py-0 gap-7 min-w-0"
      >
        {/* extended underline removed per design request */}

        {/* Mobile Logo - visible on mobile only */}
        <Link
          to={localePath(locale, "")}
          className="flex items-center gap-2 flex-none lg:hidden"
        >
          <img
            src={brand.url}
            alt={brand.description}
            className="w-8 h-6 max-w-full motion-safe:transition-transform motion-safe:duration-300 motion-reduce:transition-none group-hover:scale-105"
          />
          <h1 className="font-sans font-semibold uppercase tracking-wide text-sm motion-safe:transition-colors motion-reduce:transition-none group-hover:text-white/90">
            Visual Ennode
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-20 flex-1 justify-center relative">
          <Link
            to={localePath(locale, "")}
            className="flex items-center gap-1 flex-none relative lg:hidden"
          >
            <img
              src={brand.url}
              alt={brand.description}
              className={cn(
                "w-8 h-6 max-w-full motion-safe:transition-transform motion-safe:duration-300 motion-reduce:transition-none group-hover:scale-105",
                !collapse ? "" : ""
              )}
            />
            <h1
              className={cn(
                "font-sans font-semibold uppercase tracking-wide text-sm",
                !collapse ? "hidden sm:block" : "text-white",
              )}
            >
              Visual Ennode
            </h1>
          </Link>
          <Link to={localePath(locale, "")} className="flex items-center gap-1 flex-none relative">
            <img
              src={brand.url}
              alt={brand.description}
              className={cn(
                "w-8 h-6 motion-safe:transition-transform motion-safe:duration-300 motion-reduce:transition-none group-hover:scale-105",
                !collapse ? "" : ""
              )}
            />
            <h1
              className={cn(
                "font-sans font-semibold uppercase tracking-wide text-sm",
                /* hide when expanded */
                !collapse ? "hidden sm:block" : "",
                /* make the text follow the header variant so it matches the img logo color */
                /* when header has data-variant=dark the img uses an invert filter; mirror color for text */
                ""
              )}
            >
              Visual Ennode
            </h1>
          </Link>
          <Link
            to={localePath(locale, "")}
            className={cn(
              "font-light text-white/50 text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
              location.pathname === localePath(locale, "") ||
                location.pathname === `/${locale}` ||
                location.pathname === `/${locale}/`
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : ""
            )}
          >
            {t["component.header.home"]}
          </Link>
          <Link
            to={localePath(locale, "works")}
            className={cn(
              "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
              location.pathname.includes("/works")
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : ""
            )}
          >
            {t["component.header.works"]}
          </Link>
          <Link
            to={localePath(locale, "about")}
            className={cn(
              "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
              location.pathname.includes("/about")
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : ""
            )}
          >
            {t["component.header.about"]}
          </Link>
          <Link
            to={localePath(locale, "news")}
            className={cn(
              "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
              location.pathname.includes("/news")
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : "",
              montserratIfKo(t["News"] as string, locale)
            )}
          >
            {t["News"]}
          </Link>
          <Link
            to={localePath(locale, "career")}
            className={cn(
              "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
              location.pathname.includes("/career")
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : ""
            )}
          >
            {t["component.header.career"]}
          </Link>
          <Link
            to={localePath(locale, "contact")}
            className={cn(
              "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
              location.pathname.includes("/contact")
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : ""
            )}
          >
            {t["component.header.contact"]}
          </Link>
          {/* Desktop Language Selector */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center cursor-pointer gap-2 flex-none uppercase font-light text-sm tracking-wide hover:opacity-70 transition-opacity relative"
                  )}
                >
                  <GlobeIcon className="size-5" /> {locale}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 mt-2 bg-[#111111]/60 rounded-sm shadow-none flex flex-col items-center border-0"
              >
                <DropdownMenuItem
                  onClick={() => switchLocale("en")}
                  className={cn(
                    "w-full text-center rounded-sm text-base justify-center py-2 transition-colors",
                    // Use a subtle dark highlight and white text for the active locale
                    locale === "en"
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/80 hover:bg-white/5"
                  )}
                >
                  <span className="montserrat-for-en">English</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => switchLocale("ko")}
                  className={cn(
                    "w-full text-center rounded-sm text-base justify-center py-2 transition-colors",
                    // Use the same subtle dark highlight for Korean when active
                    locale === "ko"
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/80 hover:bg-white/5"
                  )}
                >
                  <span className="montserrat-for-en">Korean</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Mobile Controls */}
        <div className="ml-auto flex items-center gap-7">
          <AnimatePresence initial={false}>
            {!collapse && (
              <motion.div
                key="mobile-open"
                initial={{ translateX: "4rem", opacity: 0 }}
                animate={{ translateX: 0, opacity: 1 }}
                exit={{ translateX: "4rem", opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="flex items-center gap-7 lg:hidden"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center cursor-pointer rounded-none gap-2 flex-none uppercase">
                      <GlobeIcon className="size-7" /> {locale}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 mt-2 rounded-sm bg-[#111111] p-6 shadow-none flex flex-col items-center gap-6 border-0"
                  >
                    <DropdownMenuItem
                      onClick={() => switchLocale("en")}
                      className={cn(
                        "w-full text-center text-lg py-3",
                        // mobile menu: make selected locale white on subtle dark bg
                        locale === "en" ? "bg-white/10 text-white font-medium rounded-sm" : "text-white/80"
                      )}
                    >
                      <span className="montserrat-for-en">English</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => switchLocale("ko")}
                      className={cn(
                        "w-full text-center text-xl font-medium py-4",
                        // mobile menu: keep selected item readable on dark background
                        locale === "ko" ? "bg-white/10 text-white font-medium rounded-sm" : "text-white/80"
                      )}
                    >
                      <span className="montserrat-for-en">Korean</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <CrossIcon
                  className="size-6 cursor-pointer select-none flex-none"
                  onClick={() => {
                    // start coordinated close: mark closing so the hamburger doesn't flash,
                    // then collapse (which will trigger AnimatePresence exit). Keep `closing`
                    // true for the duration of the exit animation.
                    setClosing(true);
                    setCollapse(true);
                    if (closeTimerRef.current) {
                      clearTimeout(closeTimerRef.current);
                    }
                    closeTimerRef.current = window.setTimeout(() => {
                      setClosing(false);
                      closeTimerRef.current = null;
                    }, CLOSE_EXIT_MS + 30);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {collapse && !closing && (
            <HamburgerMenuIcon
              className="size-9 cursor-pointer select-none flex-none lg:hidden"
              onClick={() => setCollapse(false)}
            />
          )}
        </div>
      </Container>

      <AnimatePresence>
        {!collapse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={"fixed inset-0 w-full pt-20 h-dvh max-h-screen bg-[#1B1B1B] @container/header overflow-hidden min-w-0"}
            style={{ containerType: "size" }}
          >
            <div className="flex flex-col h-full pb-14">
          <div className="p-0 lg:p-7 grow h-full flex items-center justify-center">
            <ul className="font-normal text-3xl tracking-wide flex flex-col items-center gap-10">
              <motion.li
                initial={{ translateY: "-2rem", opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  to={localePath(locale, "")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                  onClick={() => {
                    setCollapse(true);
                    navigate(localePath(locale, ""));
                  }}
                >
                  {t["component.header.home"]}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: "-2rem", opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Link
                  to={localePath(locale, "works")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                  onClick={() => {
                    setCollapse(true);
                    navigate(localePath(locale, "works"));
                  }}
                >
                  {t["component.header.works"]}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: "-2rem", opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Link
                  to={localePath(locale, "news")}
                  prefetch="render"
                  preventScrollReset={false}
                  className={`link-animation after:h-0.5 after:-bottom-1 ${montserratIfKo(t["News"] as string, locale)}`}
                  onClick={() => {
                    setCollapse(true);
                    navigate(localePath(locale, "news"));
                  }}
                >
                  {t["News"]}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: "-2rem", opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <Link
                  to={localePath(locale, "about")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                  onClick={() => {
                    setCollapse(true);
                    navigate(localePath(locale, "about"));
                  }}
                >
                  {t["component.header.about"]}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: "-2rem", opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              >
                <Link
                  to={localePath(locale, "career")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                  onClick={() => {
                    setCollapse(true);
                    navigate(localePath(locale, "career"));
                  }}
                >
                  {t["component.header.career"]}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: "-2rem", opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.4 }}
              >
                <Link
                  to={localePath(locale, "contact")}
                  className="link-animation after:h-0.5 after:-bottom-1"
                  onClick={() => {
                    setCollapse(true);
                    navigate(localePath(locale, "contact"));
                  }}
                >
                  {t["component.header.contact"]}
                </Link>
              </motion.li>
            </ul>
          </div>
          <Container
            variant="xl"
            className="flex-none mt-auto hidden lg:block"
            id="header-footer"
          >
            <motion.div
              initial={{ translateY: "4rem", opacity: 0 }}
              whileInView={{ translateY: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 3 }}
            >
              <ContactCtaSection
                externalTranslations={t}
                externalLocale={locale}
              />
            </motion.div>
          </Container>
        </div>
    </motion.div>
      )}
    </AnimatePresence>
    </header>
  );
}
