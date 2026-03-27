export type Profile = {
  id: string;
  full_name: string;
  role: 'vendeur' | 'collecteur' | 'entreprise' | 'mairie' | 'organisation_admin' | 'agent_collecteur' | 'super_admin';
  city: string;
  wallet_balance: number;
  eco_points: number;
  subscription_tier: 'starter' | 'pro' | 'business';
  updated_at: string;
  avatar_url?: string;
  phone?: string;
  district?: string;
  vehicle_type?: string;
  id_number?: string;
  rccm?: string;
  contact_person?: string;
  agent_count?: string;
  official_department?: string;
};

export type WasteType = {
  id: number;
  name: string;
  price_per_kg: number;
  emoji: string;
};

export type Waste = {
  id: string;
  seller_id: string;
  collector_id: string | null;
  type_id: number;
  estimated_weight: number;
  final_weight: number | null;
  status: 'published' | 'reserved' | 'collected' | 'cancelled';
  location: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  created_at: string;
  // Joined fields
  waste_types?: WasteType;
  profiles?: Profile;
};

export type Message = {
  id: number;
  waste_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
};
