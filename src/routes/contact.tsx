import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Future Autos — Book a Viewing" },
      {
        name: "description",
        content:
          "Call, email or message Future Autos to book a viewing or ask about any car in stock.",
      },
      { property: "og:title", content: "Contact Future Autos" },
      {
        property: "og:description",
        content: "Book a viewing or ask about any car in stock at Future Autos.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSending(true);
    const { error } = await supabase.from("inquiries").insert({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      message: String(fd.get("message") ?? ""),
    });
    setSending(false);
    if (error) {
      toast.error("Could not send your message. Please try again.");
      return;
    }
    toast.success("Message sent — we'll be in touch shortly.");
    form.reset();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-4xl">Contact us</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Weekdays 9am–7pm, Saturday 10am–5pm.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {[
            { icon: Phone, label: "Phone", value: "+1 (555) 018-2240" },
            { icon: Mail, label: "Email", value: "sales@futureautos.com" },
            { icon: MapPin, label: "Showroom", value: "48 Riverside Drive, Unit 7" },
          ].map((item) => (
            <div key={item.label} className="surface-panel flex gap-4 rounded-xl p-5">
              <item.icon className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form className="surface-panel space-y-4 rounded-xl p-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" name="email" type="email" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-phone">Phone (optional)</Label>
            <Input id="c-phone" name="phone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-message">How can we help?</Label>
            <Textarea id="c-message" name="message" rows={5} required />
          </div>
          <Button type="submit" disabled={sending} className="w-full sm:w-auto">
            {sending ? "Sending…" : "Send message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
