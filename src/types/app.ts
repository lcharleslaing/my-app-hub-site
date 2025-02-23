// App Categories
interface AppCategory {
  id: string;
  name: string;
  description: string;
  type: 'Public' | 'Private' | 'Pro';
  order: number;
  createdAt: string;
  updatedAt?: string;
}

// Subscription Plans
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  categories: string[]; // Category IDs this plan has access to
  createdAt: string;
  updatedAt?: string;
}

// Updated App interface
interface App {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string | null;
  categories: string[]; // Category IDs
  allowedRoles: string[];
  isActive: boolean;
  order?: number;
  createdAt: string;
  updatedAt?: string;
}

export type { App, AppCategory, SubscriptionPlan };