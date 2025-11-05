import { useEffect, useRef } from "react";
import categoryCover from "/images/category-section.png";
import visualPlaceHolder from "/images/visual-placeholder.png";
import ennodePlaceHolder from "/images/ennode-placeholder.png";
import { useInView } from "motion/react";
import { __, cn } from "~/lib/utils";
import { Link } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";

export function CategorySection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 1 });

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom) return;

    headerDom.dataset.variant = inView ? "dark" : "light";
  }, [inView]);

  return (
    <section
      className="h-full overflow-hidden max-h-full grid grid-cols-1 lg:grid-cols-2"
      style={{
        background: `center/cover no-repeat url(${categoryCover})`,
      }}
      ref={ref}
    >
      <motion.div
        style={{
          background: `center/cover no-repeat url(${visualPlaceHolder})`,
        }}
        initial={{ translateY: "-50%" }}
        animate={{ translateY: inView ? 0 : "-50%" }}
        transition={{ type: "spring", translateY: { duration: 0.5 } }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-6xl font-semibold text-white uppercase">
              VISUAL
            </h3>
            <p className="uppercase text-2xl text-[#959595] mt-7">
              {__("We visualize")}
            </p>
            <Link
              to="/works"
              className="inline-flex items-center text-base text-white/80 opacity-65 font-light mt-1"
            >
              {__("See works")} <ArrowRight className="size-3 ml-1" />
            </Link>
          </div>
        </div>
      </motion.div>
      <motion.div
        style={{
          background: `center/cover no-repeat url(${ennodePlaceHolder})`,
        }}
        initial={{ translateY: "50%" }}
        animate={{ translateY: inView ? 0 : "50%" }}
        transition={{ type: "spring", translateY: { duration: 0.5 } }}
      >
        <div className="bg-black/60 h-full flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-6xl font-semibold text-white uppercase">
              ENNODE
            </h3>
            <p className="uppercase text-2xl text-[#959595] mt-7">
              {__("We connect")}
            </p>
            <Link
              to=""
              className="inline-flex items-center text-base text-white/80 opacity-65 font-light mt-1"
            >
              {__("More about us")} <ArrowRight className="size-3 ml-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
