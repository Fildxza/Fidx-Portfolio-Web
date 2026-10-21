import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/layout/command-palette";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CommandPalette />
      <main id="top" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
