CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TYPE public.car_status AS ENUM ('available','sold','reserved');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  mileage INT NOT NULL DEFAULT 0,
  fuel_type TEXT NOT NULL DEFAULT 'Petrol',
  transmission TEXT NOT NULL DEFAULT 'Automatic',
  body_type TEXT NOT NULL DEFAULT 'Sedan',
  color TEXT NOT NULL DEFAULT 'Black',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  status public.car_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cars TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cars TO authenticated;
GRANT ALL ON public.cars TO service_role;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cars public read" ON public.cars FOR SELECT USING (true);
CREATE POLICY "cars admin insert" ON public.cars FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "cars admin update" ON public.cars FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "cars admin delete" ON public.cars FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER cars_updated_at BEFORE UPDATE ON public.cars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.cars (make, model, year, price, mileage, fuel_type, transmission, body_type, color, description, featured, status) VALUES
('Mercedes-Benz','S 580 4MATIC',2023,118500,8200,'Petrol','Automatic','Sedan','Obsidian Black','Flagship luxury saloon with executive rear seating, Burmester 4D sound and full service history.',true,'available'),
('BMW','M4 Competition',2022,89900,14500,'Petrol','Automatic','Coupe','Sao Paulo Yellow','510hp twin-turbo straight six, carbon bucket seats, immaculate condition.',true,'available'),
('Tesla','Model S Plaid',2023,104000,6100,'Electric','Automatic','Sedan','Pearl White','1,020hp tri-motor, 0-60 in under 2 seconds, full self-driving hardware.',true,'available'),
('Toyota','Land Cruiser 300 GR',2023,96500,21000,'Diesel','Automatic','SUV','Precious White','Go-anywhere flagship SUV, seven seats, factory warranty remaining.',false,'available'),
('Range Rover','Sport HSE',2021,72000,38900,'Diesel','Automatic','SUV','Santorini Black','Refined performance SUV with panoramic roof and Meridian audio.',true,'available'),
('Porsche','911 Carrera S',2020,132000,26400,'Petrol','Automatic','Coupe','Guards Red','992-generation Carrera S with sport chrono and PASM suspension.',false,'available'),
('Lexus','RX 350 F Sport',2022,61500,29800,'Hybrid','Automatic','SUV','Nightfall Mica','Quiet, efficient and beautifully finished family SUV.',false,'available'),
('Honda','Accord Touring',2021,32500,41200,'Petrol','Automatic','Sedan','Platinum Silver','Reliable daily driver, fully loaded Touring trim, one owner.',false,'sold');