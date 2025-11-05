import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

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
      hero: "flex items-center justify-center w-full grow",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof containerVariants> {
  //
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        className={cn(containerVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Container.displayName = "Container";

export { Container };
