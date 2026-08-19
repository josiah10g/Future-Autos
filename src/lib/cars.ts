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

export const carsQuery = {
  queryKey: ["cars"],
  queryFn: async (): Promise<Car[]> => {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Car[];
  },
};

export const carQuery = (id: string) => ({
  queryKey: ["cars", id],
  queryFn: async (): Promise<Car | null> => {
    const { data, error } = await supabase.from("cars").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Car) ?? null;
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
