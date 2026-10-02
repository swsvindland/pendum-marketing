import Image from "next/image";
import { cn } from "./cn";

/**
 * An app icon as the stores show it: the square source under the system's continuous-corner mask (Apple geometry,
 * §4.4), with a 1pt keyline so a light icon holds its edge on the white canvas. `dark` swaps in the dark variant
 * under the dark appearance. `priority` (above the fold) raises the fetch priority; it never preloads, because
 * with a light/dark pair that would load both images (Next 16 image docs).
 */
export function AppIcon({
  src,
  dark,
  alt,
  size = 56,
  priority = false,
  className,
}: {
  src: string;
  dark?: string;
  alt: string;
  size?: 32 | 40 | 48 | 56 | 64 | 80 | 96 | 128;
  priority?: boolean;
  className?: string;
}) {
  const shape = "rounded-[22.37%] outline outline-1 -outline-offset-1 outline-border";
  return (
    <span className={cn("relative inline-block shrink-0", className)} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        fetchPriority={priority ? "high" : undefined}
        loading={priority && !dark ? "eager" : undefined}
        className={cn(shape, dark && "dark:hidden")}
      />
      {dark ? (
        <Image
          src={dark}
          alt={alt}
          width={size}
          height={size}
          fetchPriority={priority ? "high" : undefined}
          className={cn(shape, "hidden dark:block")}
        />
      ) : null}
    </span>
  );
}
