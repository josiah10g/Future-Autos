import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMiles, formatPrice, type Car } from "@/lib/cars";

export function CarCard({ car }: { car: Car }) {
  return (
    <Link
      to="/inventory/$carId"
      params={{ carId: car.id }}
      className="group surface-panel overflow-hidden rounded-xl transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {car.image_url ? (
          <img
            src={car.image_url}
            alt={`${car.year} ${car.make} ${car.model}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            {car.make} {car.model}
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {car.featured && <Badge className="bg-primary text-primary-foreground">Featured</Badge>}
          {car.status !== "available" && (
            <Badge variant="secondary" className="capitalize">
              {car.status}
            </Badge>
          )}
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">
              {car.make} {car.model}
            </h3>
            <p className="text-sm text-muted-foreground">
              {car.year} &middot; {car.body_type}
            </p>
          </div>
          <p className="whitespace-nowrap font-display text-lg font-semibold text-primary">
            {formatPrice(car.price)}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5" /> {formatMiles(car.mileage)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5" /> {car.fuel_type}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5" /> {car.transmission}
          </span>
        </div>
      </div>
    </Link>
  );
}
