export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: 'producteur' | 'collecteur' | 'mairie' | 'organisation_admin' | 'agent_collecteur' | 'agent_police_verte' | 'super_admin';
  city: string;
  wallet_balance: number;
  eco_points: number;
  subscription_tier: 'starter' | 'pro' | 'business';
  updated_at: string;
  created_at: string;
  avatar_url?: string;
  phone?: string;
  district?: string;
  vehicle_type?: string;
  id_number?: string;
  rccm?: string;
  contact_person?: string;
  agent_count?: string;
  official_department?: string;
  zone_id?: string;
  organization_id?: string;
  status?: string;
  app_pin?: string;
  assigned_vehicle_id?: string;
  push_token?: string;
  address?: string;
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
  assigned_agent_id?: string | null;
  type_id: number;
  estimated_weight: number;
  final_weight: number | null;
  status: 'published' | 'reserved' | 'assigned' | 'in_progress' | 'collected' | 'cancelled';
  location: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  photo_url?: string | null;
  created_at: string;
  is_urgent?: boolean;
  mission_type?: string;
  // Joined fields
  waste_types?: WasteType;
  profiles?: Profile;
  seller?: Partial<Profile>;
};

export type Transaction = {
  id: string | number;
  profile_id?: string | null;
  user_id?: string | null;
  amount: number;
  type: 'income' | 'outcome' | 'credit' | 'debit' | 'deposit' | string;
  description?: string | null;
  status?: 'Pending' | 'Succeeded' | 'Failed' | 'Cancelled' | 'completed' | string | null;
  commission_amount?: number | null;
  created_at: string;
};

export type SubscriptionPlan = {
  id: string;
  concession_id?: string;
  name: string;
  price: number;
  price_cfa?: number;
  pickup_days?: string[];
  isMock?: boolean;
};

export type HouseholdSubscription = {
  id: string;
  profile_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | string;
  created_at?: string;
  subscription_plans?: SubscriptionPlan;
};

export type ServiceResult<T> = {
  data: T | null;
  error: string | null;
};

export type ActionResult<T = unknown> =
  | { success: true; data?: T; balance?: number }
  | { success: false; error: string };

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
