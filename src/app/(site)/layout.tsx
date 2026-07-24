import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="top" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
