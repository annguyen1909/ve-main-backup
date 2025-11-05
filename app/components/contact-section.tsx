import { useOutletContext } from "@remix-run/react"
import { AppContext } from "~/root"
import { Container } from "./ui/container"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { useInView } from "motion/react"
import { ContactCtaSection } from "./contact-cta-section"

const ContactSection = forwardRef<HTMLElement>((props, forwardedRef) => {
  const ref = useRef<HTMLElement>(null);
  const { translations: t } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 1 })

  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom || !inView) return;

    headerDom.dataset.variant = "light";
  }, [inView]);

  return <section ref={ref} className="flex" {...props}>
    <Container className="flex-none flex flex-col lg:h-full mt-8 py-6 sm:mt-12">
      <div className="text-center mb-8" data-koreanable>
        <h3 className="font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 md:mb-3">{t['component.contact.title']}</h3>
        <p className="font-normal text-sm sm:text-base md:text-lg text-[#959595] uppercase">{t['component.contact.description']}</p>
      </div>

      <div className="mt-auto mb-14">
        <div className="flex flex-col gap-4 text-white text-sm sm:text-base font-extralight">
          <div>
            <p>{t['component.contact.address_1.name']}</p>
            <p>{t['component.contact.address_1.address']}</p>
          </div>
          <div>
            <p>{t['component.contact.address_2.name']}</p>
            <p>{t['component.contact.address_2.address']}</p>
          </div>
          <div>
            <p>{t['component.contact.address_3.name']}</p>
            <p>{t['component.contact.address_3.address']}</p>
          </div>
        </div>
      </div>

      <ContactCtaSection />
    </Container>
  </section>
});

ContactSection.displayName = "ContactSection";

export { ContactSection };