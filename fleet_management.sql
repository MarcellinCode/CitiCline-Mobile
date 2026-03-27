-- 🚚 CITICLINE : Schéma de Gestion du Parc Automobile

-- 1. Table des Véhicules
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plate_number TEXT UNIQUE NOT NULL,
    model TEXT NOT NULL, -- ex: "Toyota Hilux", "Benne Ordures"
    current_mileage INTEGER DEFAULT 0,
    last_oil_change_mileage INTEGER DEFAULT 0,
    next_oil_change_mileage INTEGER, -- Calculé ou défini manuellement
    insurance_expiry DATE,
    technical_control_expiry DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Logs d'Entretien (Carnet d'entretien)
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'vidange', 'pneus', 'freins', 'reparation'
    description TEXT,
    mileage INTEGER NOT NULL,
    cost NUMERIC DEFAULT 0,
    maintenance_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Checklists de Sécurité (Prise de Poste quotidienne)
CREATE TABLE IF NOT EXISTS public.vehicle_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    checks JSONB NOT NULL, -- ex: {"oil": true, "fuel_level": "75%", "tires": true}
    mileage_at_start INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Sécurité RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_checklists ENABLE ROW LEVEL SECURITY;

-- Politiques : Les organisations voient leurs véhicules, les agents voient tout (lecture)
CREATE POLICY "Orgs manage their vehicles" ON public.vehicles FOR ALL USING (organization_id = auth.uid());
CREATE POLICY "Agents view all vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Agents insert checklists" ON public.vehicle_checklists FOR INSERT WITH CHECK (auth.uid() = agent_id);
