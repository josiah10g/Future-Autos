import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Future Autos — Our Showroom Story" },
      {
        name: "description",
        content:
          "Future Autos is an independent premium car showroom built on inspected stock and honest, transparent pricing.",
      },
      { property: "og:title", content: "About Future Autos" },
      {
        property: "og:description",
        content: "An independent premium car showroom built on inspected stock and honest pricing.",
      },
    ],
  }),
  component: AboutPage,
});

const stats = [
  ["12+", "Years selling cars"],
  ["150", "Point inspection"],
  ["2,400+", "Happy owners"],
  ["6 mo", "Minimum warranty"],
] as const;

function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-4xl">About Future Autos</h1>
      <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
        Future Autos started as a single workshop bay and a stubborn belief: buying a used premium
        car should feel as good as buying a new one. We buy selectively, inspect obsessively and
        publish every price openly, so the conversation stays about the car instead of the haggle.
      </p>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
        Every vehicle in the showroom is road-tested by our own technicians, photographed as it
        actually stands, and listed with its full history. If something isn't right, we say so in
        the description.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="bg-card p-6">
            <p className="font-display text-2xl font-semibold text-primary">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="surface-panel mt-12 rounded-xl p-8">
        <h2 className="text-xl font-semibold">Come and see the cars</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Book a viewing or ask about anything in stock — we answer every message.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/inventory">Browse inventory</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
