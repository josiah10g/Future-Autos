import { supabase } from "@/integrations/supabase/client";

export type CarStatus = "available" | "sold" | "reserved";

export type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  description: string;
  image_url: string | null;
  featured: boolean;
  status: CarStatus;
  created_at: string;
};

export const DEMO_CARS: Car[] = [
  {
    id: "1",
    make: "Porsche",
    model: "Taycan 4S",
    year: 2024,
    price: 114500,
    mileage: 4200,
    fuel_type: "Electric",
    transmission: "Automatic",
    body_type: "Sedan",
    color: "Volcano Grey Metallic",
    description: "Flawless condition with Performance Battery Plus, panoramic glass roof, 21-inch Mission E design wheels, and 14-way comfort seats.",
    image_url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop",
    featured: true,
    status: "available",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    make: "Mercedes-AMG",
    model: "GT 63 S E-Performance",
    year: 2023,
    price: 148900,
    mileage: 8150,
    fuel_type: "Hybrid",
    transmission: "Automatic",
    body_type: "Coupe",
    color: "Designo Selenite Grey Magno",
    description: "4.0L V8 Biturbo with hybrid assist producing 831 HP. Carbon ceramic brakes, Burmester 3D Surround Sound, and AMG Aerodynamics package.",
    image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop",
    featured: true,
    status: "available",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    make: "BMW",
    model: "M8 Competition Gran Coupe",
    year: 2023,
    price: 129000,
    mileage: 11200,
    fuel_type: "Petrol",
    transmission: "Automatic",
    body_type: "Sedan",
    color: "Isle of Man Green",
    description: "617 HP Twin-Turbo V8 with M xDrive. Carbon roof, full Merino leather interior in Silverstone, Bowers & Wilkins audio system, and laser headlights.",
    image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop",
    featured: true,
    status: "available",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "4",
    make: "Audi",
    model: "RS e-tron GT",
    year: 2024,
    price: 135000,
    mileage: 3100,
    fuel_type: "Electric",
    transmission: "Automatic",
    body_type: "Coupe",
    color: "Daytona Grey Pearl",
    description: "Stunning electric grand tourer with 637 HP boost mode. Carbon styling package, tungsten carbide coated brakes, and Matrix LED lighting.",
    image_url: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    status: "available",
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "5",
    make: "Land Rover",
    model: "Range Rover Sport SV",
    year: 2024,
    price: 172000,
    mileage: 1800,
    fuel_type: "Petrol",
    transmission: "Automatic",
    body_type: "SUV",
    color: "Santorini Black",
    description: "Edition One with 23-inch carbon fiber wheels, carbon ceramic brakes, BASS Body and Soul seats, and 626 HP Twin-Turbo V8 engine.",
    image_url: "https://images.unsplash.com/photo-1541348263662-e0c82661cb25?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    status: "available",
    created_at: new Date(Date.now() - 345600000).toISOString(),
  },
];

export const carsQuery = {
  queryKey: ["cars"],
  queryFn: async (): Promise<Car[]> => {
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });
      if (error || !data || data.length === 0) {
        return DEMO_CARS;
      }
      return data as Car[];
    } catch {
      return DEMO_CARS;
    }
  },
};

export const carQuery = (id: string) => ({
  queryKey: ["cars", id],
  queryFn: async (): Promise<Car | null> => {
    try {
      const { data, error } = await supabase.from("cars").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        const demo = DEMO_CARS.find((c) => c.id === id);
        return demo ?? null;
      }
      return (data as Car) ?? null;
    } catch {
      const demo = DEMO_CARS.find((c) => c.id === id);
      return demo ?? null;
    }
  },
});

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMiles(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} mi`;
}
