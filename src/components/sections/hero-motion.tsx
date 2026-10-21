/**
 * Hero entrance animations are plain CSS (tw-animate-css) rather than framer-motion,
 * so the headline, photo and calls to action are painted by the server-rendered HTML
 * immediately instead of staying invisible until JavaScript has loaded.
 */
export function HeroEntrance({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex animate-in flex-col items-start gap-6 fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none">
      {children}
    </div>
  );
}

export function HeroPhotoFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-sm animate-in fade-in zoom-in-95 delay-150 duration-700 fill-mode-backwards lg:mx-0 motion-reduce:animate-none">
      {children}
    </div>
  );
}
