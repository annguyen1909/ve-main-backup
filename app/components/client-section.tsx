import { useOutletContext } from "@remix-run/react";
import { AppContext } from "~/root";
import { Container } from "./ui/container";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useInView } from "motion/react";
import { ClientResource } from "~/types/clients";

interface ClientSectionProps {
  clients: Array<ClientResource>;
}

const ClientSection = forwardRef<HTMLElement, ClientSectionProps>(
  (props, forwardedRef) => {
    const ref = useRef<HTMLElement>(null);
    const { translations: t } = useOutletContext<AppContext>();
    const inView = useInView(ref, { amount: 1 });

    const clients = Array.isArray(props.clients) ? props.clients : [];

    useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

    useEffect(() => {
      const headerDom = document.getElementById("header");

      if (!headerDom || !inView) return;

      headerDom.dataset.variant = "light";
    }, [inView]);

    return (
      <section
        ref={ref}
        className="min-h-[80vh] flex py-0 sm:py-8 lg:pb-20"
        {...props}
      >
        <Container className="flex-none m-auto min-h-full flex flex-col w-full px-4 sm:px-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:mt-14 mb-4 sm:mb-6">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight uppercase">
              {/**
               * Render translation with `||` markers used to indicate highlighted segments.
               * Example in common.json: "Our team is dedicated to building ||strong, longlasting relationships|| with our partners." 
               */}
              {(() => {
                const raw = String(t["component.client.title"] ?? "");
                // If markers are used, respect them
                if (raw.includes("||")) {
                  return raw.split("||").map((part, i) =>
                    i % 2 === 1 ? (
                      <span key={i} className="text-red-500">
                        {part}
                      </span>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  );
                }

                // Fallback: if no markers, try to highlight the specific phrase from the english copy
                const phrase = "strong, lasting relationships";
                if (raw.includes(phrase)) {
                  const parts = raw.split(phrase);
                  return (
                    <>
                      {parts[0]}
                      <span className="text-red-500">{phrase}</span>
                      {parts[1]}
                    </>
                  );
                }

                return raw;
              })()}
            </h2>
            </div>
          </div>

          {/* dark panel wrapper matching design reference */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
            <div className="w-full bg-[#1f1f1f] rounded-lg p-4 sm:p-6 md:p-8 lg:p-8">
            {clients.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 md:gap-12 lg:gap-24 items-center justify-items-center">
                {clients.map((client, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6 w-full h-full"
                  >
                    <img
                      src={client.attachment_url}
                      alt={client.name}
                      loading="lazy"
                      className="max-h-12 sm:max-h-16 md:max-h-20 max-w-full object-contain mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white">No clients available</p>
            )}
            </div>
          </div>
        </Container>
      </section>
    );
  }
);

ClientSection.displayName = "ClientSection";

export { ClientSection };
