"use client";
import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

const Carousel = React.forwardRef(
  ({ orientation = "horizontal", className, children, ...props }, ref) => {
    const containerRef = React.useRef(null);
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(true);

    const checkScrollability = React.useCallback(() => {
      const el = containerRef.current;
      if (!el) return;

      if (orientation === "horizontal") {
        setCanScrollPrev(el.scrollLeft > 0);
        setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
      } else {
        setCanScrollPrev(el.scrollTop > 0);
        setCanScrollNext(el.scrollTop < el.scrollHeight - el.clientHeight - 1);
      }
    }, [orientation]);

    const scrollPrev = React.useCallback(() => {
      const el = containerRef.current;
      if (!el) return;
      const amount = orientation === "horizontal" ? el.clientWidth : el.clientHeight;
      el.scrollBy({
        left: orientation === "horizontal" ? -amount : 0,
        top: orientation === "vertical" ? -amount : 0,
        behavior: "smooth",
      });
    }, [orientation]);

    const scrollNext = React.useCallback(() => {
      const el = containerRef.current;
      if (!el) return;
      const amount = orientation === "horizontal" ? el.clientWidth : el.clientHeight;
      el.scrollBy({
        left: orientation === "horizontal" ? amount : 0,
        top: orientation === "vertical" ? amount : 0,
        behavior: "smooth",
      });
    }, [orientation]);

    React.useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      checkScrollability();
      el.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);

      return () => {
        el.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }, [checkScrollability]);

    return (
      <CarouselContext.Provider
        value={{
          containerRef,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { containerRef, orientation } = useCarousel();

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        "no-scrollbar flex snap-mandatory scroll-smooth overflow-x-auto",
        orientation === "horizontal"
          ? "snap-x flex-row"
          : "snap-y flex-col overflow-y-auto overflow-x-hidden",
        className
      )}
      {...props}
    />
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-full snap-start", className)}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute size-8 rounded-full z-10",
          orientation === "horizontal"
            ? "top-1/2 -left-12 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  }
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute size-8 rounded-full z-10",
          orientation === "horizontal"
            ? "top-1/2 -right-12 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  }
);
CarouselNext.displayName = "CarouselNext";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};