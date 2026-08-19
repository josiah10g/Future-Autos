import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/car-card";
import { carsQuery } from "@/lib/cars";
import heroCar from "@/assets/hero-car.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Future Autos — Premium Cars for Sale" },
      {
        name: "description",
        content:
          "Future Autos sells hand-picked premium cars with transparent pricing. Browse the current stock and enquire online.",
      },
      { property: "og:title", content: "Future Autos — Premium Cars for Sale" },
      {
        property: "og:description",
        content: "Hand-picked premium cars with transparent pricing. Browse the current stock.",
      },
    ],
  }),
  component: Index,
});

const perks = [
  {
    icon: BadgeCheck,
    title: "Inspected & certified",
    body: "Every vehicle passes a 150-point mechanical and cosmetic inspection before listing.",
  },
  {
    icon: Wallet,
    title: "Transparent pricing",
    body: "The price you see is the price you pay. No hidden dealer fees, ever.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty backed",
    body: "Drive away with a minimum 6-month powertrain warranty on eligible cars.",
  },
];

function Index() {
  const { data: cars } = useQuery(carsQuery);
  const featured = (cars ?? []).filter((c) => c.status === "available").slice(0, 3);

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroCar}
          alt="Black luxury sedan lit by blue lights in a showroom"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-scrim absolute inset-0" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Future Autos</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
            The next car you own should feel like <span className="text-gradient-blue">an upgrade</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            A curated showroom of premium sedans, coupes and SUVs — each one inspected, priced
            openly and ready to drive today.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="glow-blue">
              <Link to="/inventory">
                View inventory <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {perks.map((p) => (
            <div key={p.title} className="surface-panel rounded-xl p-6">
              <p.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-base font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Latest arrivals</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fresh into the showroom this month.
            </p>
          </div>
          <Link
            to="/inventory"
            className="hidden shrink-0 text-sm text-primary hover:underline sm:inline"
          >
            See all cars
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
        <div className="mt-8 sm:hidden">
          <Button asChild variant="secondary" className="w-full">
            <Link to="/inventory">See all cars</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
