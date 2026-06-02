import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/nova/PageShell";
import { Field } from "@/components/nova/Field";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Nova" }] }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10 lg:pt-16">
        <p className="text-xs uppercase tracking-[0.32em] text-primary/80">Contact</p>
        <h1 className="mt-2 font-display text-4xl font-light md:text-5xl">Let's talk.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Questions about a piece, custom orders, or trade enquiries — we're here.</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_1.2fr] lg:px-10">
        <div className="space-y-4">
          {[
            { Icon: Mail, label: "Email", value: "hello@nova-furniture.eg" },
            { Icon: Phone, label: "Phone", value: "+20 100 123 4567" },
            { Icon: MapPin, label: "Showroom", value: "Sheikh Zayed, 6th October City, Egypt" },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/40 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary"><c.Icon className="h-5 w-5" /></span>
              <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p><p className="mt-1 text-foreground">{c.value}</p></div>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="rounded-2xl border border-border/60 bg-card/40 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" placeholder="Your name" />
            <Field label="Email" type="email" placeholder="you@email.com" />
            <div className="sm:col-span-2"><Field label="Subject" placeholder="How can we help?" /></div>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Message</span>
              <textarea rows={5} placeholder="Tell us what you're looking for..." className="w-full rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25" />
            </label>
          </div>
          <Button className="mt-6 h-12 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow">Send message</Button>
        </form>
      </div>
    </PageShell>
  ),
});
