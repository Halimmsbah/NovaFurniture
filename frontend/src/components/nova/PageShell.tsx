import { useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { applyMotionAttribute, logMotionDecision } from "@/lib/motion";

export function PageShell({ children, hideFooter = false }: { children: React.ReactNode; hideFooter?: boolean }) {
  useEffect(() => {
    applyMotionAttribute();
    logMotionDecision("PageShell");
  }, []);
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 lg:pt-20">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
