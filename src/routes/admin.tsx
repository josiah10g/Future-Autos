import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { carsQuery, formatPrice, type Car } from "@/lib/cars";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Future Autos" },
      { name: "description", content: "Manage Future Autos car listings and customer enquiries." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Dashboard — Future Autos" },
      { property: "og:description", content: "Manage listings and enquiries." },
    ],
  }),
  component: AdminPage,
});

type Inquiry = {
  id: string;
  car_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="mx-auto h-64 max-w-5xl animate-pulse px-4 py-16" />;
  }

  if (!user) {
    return (
      <Gate
        title="Sign in required"
        body="You need to sign in with an admin account to manage the showroom."
        action={
          <Button asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
        }
      />
    );
  }

  if (!isAdmin) {
    return (
      <Gate
        title="Admin access only"
        body="This account doesn't have admin permissions for Future Autos."
        action={
          <Button asChild variant="secondary">
            <Link to="/">Back home</Link>
          </Button>
        }
      />
    );
  }

  return <AdminDashboard />;
}

function Gate({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{body}</p>
      <div className="mt-6 flex justify-center">{action}</div>
    </div>
  );
}

const emptyCar = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  price: 0,
  mileage: 0,
  fuel_type: "Petrol",
  transmission: "Automatic",
  body_type: "Sedan",
  color: "",
  description: "",
  image_url: "",
  featured: false,
  status: "available" as const,
};

function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: cars } = useQuery(carsQuery);
  const { data: inquiries } = useQuery({
    queryKey: ["inquiries"],
    queryFn: async (): Promise<Inquiry[]> => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Inquiry[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Car | null>(null);

  const saveCar = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (editing) {
        const { error } = await supabase.from("cars").update(values).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cars").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Listing updated" : "Listing added");
      setOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: () => toast.error("Could not save the listing."),
  });

  const removeCar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Listing removed");
      void queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: () => toast.error("Could not remove the listing."),
  });

  function submitCar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveCar.mutate({
      make: String(fd.get("make")),
      model: String(fd.get("model")),
      year: Number(fd.get("year")),
      price: Number(fd.get("price")),
      mileage: Number(fd.get("mileage")),
      fuel_type: String(fd.get("fuel_type")),
      transmission: String(fd.get("transmission")),
      body_type: String(fd.get("body_type")),
      color: String(fd.get("color")),
      description: String(fd.get("description")),
      image_url: String(fd.get("image_url")) || null,
      featured: fd.get("featured") === "on",
      status: String(fd.get("status")),
    });
  }

  const current = editing ?? emptyCar;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage listings and enquiries.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add car
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit listing" : "New listing"}</DialogTitle>
            </DialogHeader>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitCar}>
              {(
                [
                  ["make", "Make", "text"],
                  ["model", "Model", "text"],
                  ["year", "Year", "number"],
                  ["price", "Price (USD)", "number"],
                  ["mileage", "Mileage", "number"],
                  ["color", "Colour", "text"],
                  ["fuel_type", "Fuel type", "text"],
                  ["transmission", "Transmission", "text"],
                  ["body_type", "Body type", "text"],
                  ["status", "Status (available/reserved/sold)", "text"],
                ] as const
              ).map(([name, label, type]) => (
                <div key={name} className="space-y-2">
                  <Label htmlFor={name}>{label}</Label>
                  <Input
                    id={name}
                    name={name}
                    type={type}
                    required
                    defaultValue={String(current[name as keyof typeof current] ?? "")}
                  />
                </div>
              ))}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input id="image_url" name="image_url" defaultValue={current.image_url ?? ""} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={current.description}
                />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={current.featured}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Feature this car on the homepage
              </label>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full" disabled={saveCar.isPending}>
                  {saveCar.isPending ? "Saving…" : "Save listing"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="cars" className="mt-8">
        <TabsList>
          <TabsTrigger value="cars">Listings ({cars?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="inquiries">Enquiries ({inquiries?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="cars" className="mt-6 space-y-3">
          {(cars ?? []).map((car) => (
            <div
              key={car.id}
              className="surface-panel flex flex-wrap items-center justify-between gap-4 rounded-xl p-4"
            >
              <div>
                <p className="font-medium">
                  {car.year} {car.make} {car.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(car.price)} &middot;{" "}
                  <span className="capitalize">{car.status}</span>
                </p>
              </div>
              <div className="flex gap-2">
                {car.featured && <Badge className="self-center">Featured</Badge>}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditing(car);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeCar.mutate(car.id)}
                  disabled={removeCar.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="inquiries" className="mt-6 space-y-3">
          {(inquiries ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No enquiries yet.</p>
          )}
          {(inquiries ?? []).map((q) => (
            <div key={q.id} className="surface-panel rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{q.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(q.created_at).toLocaleString()}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {q.email}
                {q.phone ? ` · ${q.phone}` : ""}
              </p>
              <p className="mt-3 text-sm">{q.message}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
