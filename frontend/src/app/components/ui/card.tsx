import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

/**
 * TREKKERS SQUAD CARD COMPONENT
 * Elevation levels: 1, 2, 3 (10%, 20%, 30% opacity shadows)
 * Variants: default, trip, about, interactive
 * Radius: 12px (--radius-lg)
 */

const cardVariants = cva(
  [
    "rounded-[var(--radius-lg)]",
    "bg-white",
    "transition-all duration-300",
  ].join(" "),
  {
    variants: {
      elevation: {
        1: "shadow-[var(--shadow-card-1)]",
        2: "shadow-[var(--shadow-card-2)]",
        3: "shadow-[var(--shadow-card-3)]",
        none: "",
      },
      variant: {
        default: "border border-[var(--color-stone-300)]",
        trip: "overflow-hidden hover:shadow-[var(--shadow-xl)] hover:-translate-y-1",
        about: "overflow-hidden",
        interactive: "cursor-pointer hover:shadow-[var(--shadow-xl)] hover:-translate-y-0.5",
      },
    },
    defaultVariants: {
      elevation: 1,
      variant: "default",
    },
  }
);

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, elevation, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ elevation, variant }), className)}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-heading font-semibold text-xl leading-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-[var(--color-ink-600)] leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/**
 * TripCard - Specialized card for trip listings
 * Includes image, title, meta info, badges, and CTA
 */
interface TripCardImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
}

const TripCardImage = React.forwardRef<HTMLDivElement, TripCardImageProps>(
  ({ className, src, alt, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative aspect-[4/3] overflow-hidden", className)}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {children}
    </div>
  )
);
TripCardImage.displayName = "TripCardImage";

/**
 * AboutAccordionCard - Specialized card for About page
 * 2x4 grid layout with expandable content
 */
const AboutAccordionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon?: React.ReactNode;
    isExpanded?: boolean;
  }
>(({ className, icon, isExpanded, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[var(--radius-lg)] border border-[var(--color-stone-300)]",
      "bg-white p-6 transition-all duration-300",
      "hover:shadow-[var(--shadow-card-3)] cursor-pointer",
      isExpanded && "shadow-[var(--shadow-card-2)]",
      className
    )}
    {...props}
  >
    <div className="flex items-start gap-4">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-forest-600)] to-[var(--color-navy-500)] flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110">
          <span className="text-white [&>svg]:size-6">{icon}</span>
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  </div>
));
AboutAccordionCard.displayName = "AboutAccordionCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  TripCardImage,
  AboutAccordionCard,
  cardVariants,
};
