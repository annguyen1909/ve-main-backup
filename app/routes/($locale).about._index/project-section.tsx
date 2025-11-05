import { forwardRef } from "react";

const ProjectSection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section
      className="h-full max-h-full bg-yellow-500 overflow-auto"
      ref={ref}
      {...props}
    ></section>
  );
});

ProjectSection.displayName = "ProjectSection";

export { ProjectSection };
