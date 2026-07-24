import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProfilePhoto({
  src,
  initials = "MF",
  className,
  priority = false,
  size = 480,
}: {
  src: string | null;
  initials?: string;
  className?: string;
  priority?: boolean;
  size?: number;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-brand/25 via-brand/10 to-transparent",
          className
        )}
        aria-hidden
      >
        <span className="text-6xl font-semibold text-brand/70">{initials}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt="Mohamad Fildza Azman"
      width={size}
      height={size}
      priority={priority}
      className={cn("rounded-[2rem] object-cover", className)}
    />
  );
}
