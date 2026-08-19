import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CarCard } from "@/components/car-card";
import { carsQuery } from "@/lib/cars";

export const Route = createFileRoute("/inventory/")({
  head: () => ({
    meta: [
      { title: "Cars for Sale — Future Autos Inventory" },
      {
        name: "description",
        content:
          "Browse every car currently for sale at Future Autos, with prices, mileage and specs.",
      },
      { property: "og:title", content: "Cars for Sale — Future Autos Inventory" },
      {
        property: "og:description",
        content: "Browse every car currently for sale at Future Autos, with prices and specs.",
      },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const { data: cars, isLoading } = useQuery(carsQuery);
  const [search, setSearch] = useState("");
  const [body, setBody] = useState("all");
  const [sort, setSort] = useState("newest");

  const bodyTypes = useMemo(
    () => Array.from(new Set((cars ?? []).map((c) => c.body_type))).sort(),
    [cars],
  );

  const visible = useMemo(() => {
    let list = (cars ?? []).filter((c) => {
      const q = search.trim().toLowerCase();
      const matches =
        !q || `${c.make} ${c.model} ${c.year} ${c.color}`.toLowerCase().includes(q);
      return matches && (body === "all" || c.body_type === body);
    });
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.created_at.localeCompare(a.created_at);
    });
    return list;
  }, [cars, search, body, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-4xl">Inventory</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {cars ? `${cars.length} vehicles in the showroom` : "Loading the showroom…"}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search make, model, year…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={body} onValueChange={setBody}>
          <SelectTrigger>
            <SelectValue placeholder="Body type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All body types</SelectItem>
            {bodyTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface-panel h-80 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">
          No cars match those filters.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
