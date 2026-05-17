export type Product = {
  id: string;
  name: string;
  team: string;
  league: string;
  season: string;
  kit: string;
  price: number;
  old_price: number | null;
  stock: number;
  player: string | null;
  year: number | null;
  image_url: string | null;
  images: string[];
  sizes: string[];
  badge: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export const ADULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export const KID_SIZES = ["4A", "6A", "8A", "10A", "12A", "14A"] as const;
export const SIZES = [...ADULT_SIZES, ...KID_SIZES] as const;
