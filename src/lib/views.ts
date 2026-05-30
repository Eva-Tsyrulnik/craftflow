import type { OrderStatus, StageStatus } from "@/lib/database.types";
import { initials, type MasterCategory } from "@/lib/constants";

export interface MasterCard {
  id: string;
  name: string;
  categories: MasterCategory[];
  bio: string;
  priceFrom: number;
  rating: number;
  reviewsCount: number;
  isPro: boolean;
  isVerified: boolean;
  avatarInitials: string;
  portfolioUrls: string[];
}

export interface OrderCard {
  id: string;
  title: string;
  masterName: string;
  masterId: string;
  status: OrderStatus;
  budget: number;
  deadline: string;
  deadlineRaw: string;
  description?: string;
}

export interface OrderStageView {
  id: string;
  name: string;
  status: StageStatus;
  sortOrder: number;
}

export interface MessageView {
  id: string;
  senderId: string;
  body: string;
  time: string;
  isOwn: boolean;
}

export interface ReviewView {
  id: string;
  author: string;
  rating: number;
  text: string | null;
  date: string;
}

export function mapOrderRow(
  row: {
    id: string;
    title: string;
    master_id: string;
    status: OrderStatus;
    budget: number;
    deadline: string;
    description?: string;
    masters: { users: { name: string } | null } | null;
  }
): OrderCard {
  return {
    id: row.id,
    title: row.title,
    masterName: row.masters?.users?.name ?? "Мастер",
    masterId: row.master_id,
    status: row.status,
    budget: row.budget,
    deadline: new Date(row.deadline).toLocaleDateString("ru-RU"),
    deadlineRaw: row.deadline,
    description: row.description,
  };
}

export function mapMasterRow(
  row: {
    id: string;
    categories: string[];
    bio: string;
    portfolio_urls: string[] | null;
    price_from: number;
    rating: number | null;
    reviews_count: number;
    is_pro: boolean;
    is_verified: boolean;
    users: { name: string } | null;
  }
): MasterCard {
  const name = row.users?.name ?? "Мастер";
  return {
    id: row.id,
    name,
    categories: row.categories as MasterCategory[],
    bio: row.bio,
    priceFrom: row.price_from,
    rating: row.rating ?? 0,
    reviewsCount: row.reviews_count,
    isPro: row.is_pro,
    isVerified: row.is_verified,
    avatarInitials: initials(name),
    portfolioUrls: row.portfolio_urls ?? [],
  };
}
