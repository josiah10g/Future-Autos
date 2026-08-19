import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { carQuery, formatMiles, formatPrice } from "@/lib/cars";

export const Route = createFileRoute("/inventory/$carId")({
  head: () => ({
    meta: [
      { title: "Vehicle Details — Future Autos" },
      {
        name: "description",
        content: "Full specification, photos and pricing for this vehicle at Future Autos.",
      },
      { property: "og:title", content: "Vehicle Details — Future Autos" },
      {
        property: "og:description",
        content: "Full specification, photos and pricing for this Future Autos vehicle.",
      },
    ],
  }),
  component: CarDetail,
});

function CarDetail() {
  const { carId } = Route.useParams();
  const { data: car, isLoading } = useQuery(carQuery(carId));
  const [sending, setSending] = useState(false);

  async function handleInquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSending(true);
    const { error } = await supabase.from("inquiries").insert({
      car_id: carId,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      message: String(fd.get("message") ?? ""),
    });
    setSending(false);
    if (error) {
      toast.error("Could not send your enquiry. Please try again.");
      return;
    }
    toast.success("Enquiry sent — we'll be in touch shortly.");
    form.reset();
  }

  if (isLoading) {
    return <div className="mx-auto h-96 max-w-7xl animate-pulse px-4 py-12" />;
  }

  if (!car) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Vehicle not found</h1>
        <Button asChild className="mt-6">
          <Link to="/inventory">Back to inventory</Link>
        </Button>
      </div>
    );
  }

  const specs = [
    ["Year", String(car.year)],
    ["Mileage", formatMiles(car.mileage)],
    ["Body type", car.body_type],
    ["Fuel", car.fuel_type],
    ["Transmission", car.transmission],
    ["Colour", car.color],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        to="/inventory"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to inventory
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="surface-panel aspect-[16/10] overflow-hidden rounded-xl">
            {car.image_url ? (
              <img
                src={car.image_url}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Photos coming soon
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold sm:text-4xl">
                {car.make} {car.model}
              </h1>
              <Badge variant="secondary" className="capitalize">
                {car.status}
              </Badge>
            </div>
            <p className="mt-3 font-display text-2xl font-semibold text-primary">
              {formatPrice(car.price)}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {car.description}
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
              {specs.map(([label, value]) => (
                <div key={label} className="bg-card p-4">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <aside className="surface-panel h-fit rounded-xl p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Enquire about this car</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send a message and a sales advisor will reply.
          </p>
          <form className="mt-5 space-y-4" onSubmit={handleInquiry}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                required
                defaultValue={`I'm interested in the ${car.year} ${car.make} ${car.model}.`}
              />
            </div>
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Sending…" : "Send enquiry"}
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
