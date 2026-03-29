// Budget & Spending Data Types

export interface Category {
  id: string;
  name: string;
  amount: number; // in millions/billions
  percentage: number; // % of total budget
  subcategories?: Category[];
  trend?: TrendPoint[];
  color?: string; // for charts
}

export interface TrendPoint {
  year: number;
  amount: number;
}

export interface Budget {
  id: string;
  year: number;
  totalBudget: number; // in millions/billions
  currency: string; // USD, EUR, etc.
  categories: Category[];
  lastUpdated: Date;
  source?: string; // e.g., "US Federal Budget 2024"
}

// Policy & Proposals

export interface PolicyImpact {
  categoryId: string;
  changePercent: number; // +/- percentage change
  estimatedCost?: number; // in millions/billions
  description?: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  impact: PolicyImpact[];
  source?: string; // political platform, user, etc.
  createdAt: Date;
  author?: string;
}

// User Scenarios

export interface UserScenario {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  budgetAllocations: Record<string, number>; // categoryId -> amount
  appliedProposals: string[]; // proposal IDs
  createdAt: Date;
  updatedAt: Date;
  shared?: boolean;
  shareToken?: string;
}

// Chart Data

export interface ChartDataPoint {
  label: string;
  value: number;
  percentage: number;
  color?: string;
}
