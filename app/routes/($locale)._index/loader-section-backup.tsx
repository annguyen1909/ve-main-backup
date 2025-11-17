import { useNavigation, useOutletContext } from "@remix-run/react";
import { Container } from "~/components/ui/container";
import { AppContext } from "~/root";
import * as motion from "motion/react-client";
import { cn } from "~/lib/utils";
import { forwardRef, useState } from "react";

const LoaderSection = forwardRef<HTMLElement>((props, ref) => {
  const { brand, heroCover } = useOutletContext<AppContext>();
  const navigation = useNavigation();
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);

  return (
    <section
      ref={ref}
      className="h-full"
      style={{
        background: `center/cover no-repeat url(${heroCover.url})`,
      }}
      {...props}
    >
      <Container className="flex items-center justify-center h-full">
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 2,
            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
          }}
          className={cn(animationComplete ? "" : "z-40")}
        >
          <img
            src={brand.url}
            alt={brand.description}
            className="w-52 sm:w-80 select-none"
          />
        </motion.div>
      </Container>

      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        onAnimationComplete={() => setAnimationComplete(true)}
        transition={{ duration: navigation.state === "loading" ? 0 : 5 }}
        className={cn(
          "bg-black top-0 left-0 absolute w-full h-full",
          animationComplete ? "" : "z-30"
        )}
      ></motion.div>
    </section>
  );
});

LoaderSection.displayName = "LoaderSection";

export { LoaderSection };
