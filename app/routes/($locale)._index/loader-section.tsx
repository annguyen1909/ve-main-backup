import { useOutletContext } from "@remix-run/react";
import { Container } from "~/components/ui/container";
import { AppContext } from "~/root";
import { forwardRef } from "react";

const LoaderSection = forwardRef<HTMLElement>((props, ref) => {
  const { brand, heroCover } = useOutletContext<AppContext>();

  return (
    <section
      ref={ref}
      className="h-dvh max-h-dvh z-50 relative"
      style={{
        background: `center/cover no-repeat url(${heroCover.url})`,
      }}
      {...props}
    >
      <Container className="flex items-center justify-center h-full">
        <img
          src={brand.url}
          alt={brand.description}
          className="w-52 sm:w-80 select-none"
        />
      </Container>
    </section>
  );
});

LoaderSection.displayName = "LoaderSection";

export { LoaderSection };
