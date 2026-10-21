import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPaletteLoader } from "@/components/layout/command-palette-loader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CommandPaletteLoader />
      <main id="top" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
