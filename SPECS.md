# Budget Simulator — Project Specifications

## Vision

Interactive civic tool for election year. Citizens explore national/regional budget, customize allocations, and see financial impact of policy proposals in real-time.

## Core Features

### 1. Budget Visualization (MVP)
- **Current Budget Overview**
  - Total budget, major spending categories (defense, healthcare, education, infrastructure, social services, etc.)
  - Pie/bar charts showing % allocation
  - Year selector (current year + historical data if available)
  - Show absolute values (USD/EUR) and % of budget
  
- **Interactive Breakdown**
  - Click category → drill down into sub-categories
  - Category details: amount, % of budget, trend (up/down YoY)

### 2. Custom Budget Builder
- **User Budget Allocator**
  - Drag sliders for each category (healthcare, defense, education, etc.)
  - Real-time total enforcement (all allocations must = 100% of budget)
  - Visual feedback: color-coded if over/under
  - "Save scenario" → store in localStorage or Supabase

- **Comparison View**
  - Side-by-side: current vs. user's custom budget
  - Difference visualization: +/- per category
  - Total revenue required (if custom spending > current budget)

### 3. Policy Proposal Explorer
- **Text-to-Impact**
  - User enters policy idea (e.g., "Universal healthcare for all")
  - AI/rule-based impact calculator estimates budget changes
  - Shows: affected categories, estimated cost, revenue sources
  - Visual: updated pie chart with projected allocation

- **Preset Policy Proposals**
  - Pre-defined proposals from political platforms (optional for MVP)
  - User selects → see financial breakdown
  - Examples: "increase defense 10%", "free college tuition", "green energy transition"

### 4. Scenario Management
- **Save/Share**
  - User scenario: name, custom budget, proposals applied
  - Export as JSON or shareable link
  - Compare multiple scenarios side-by-side

## Data Model

### Budget Structure
```typescript
interface Budget {
  id: string;
  year: number;
  totalBudget: number; // in millions/billions
  currency: string; // USD, EUR, etc.
  categories: Category[];
  lastUpdated: date;
}

interface Category {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  subcategories?: Category[];
  trend?: { year: number; amount: number }[];
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  impact: {
    categoryId: string;
    changePercent: number; // +/- %
    estimatedCost: number; // in millions/billions
  }[];
  source?: string; // platform name, user, etc.
  createdAt: date;
}

interface UserScenario {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  customBudget: { [categoryId]: number };
  appliedProposals: string[]; // proposal IDs
  createdAt: date;
  shared?: boolean;
}
```

## Development Blocks (MVP)

### Block 1: Project Setup & Layout
- SvelteKit app structure
- TailwindCSS + DaisyUI configured
- Base layout: header, nav, footer
- Mock data for budget (JSON)
- TypeScript strict mode configured

### Block 2: Budget Visualization
- Home page: current budget overview
- Pie/bar charts using Chart.js or Recharts
- Category details modal/page
- Budget year selector

### Block 3: Budget Customizer
- Slider-based budget allocator
- Real-time total enforcement
- Comparison view (current vs. custom)
- Save to localStorage

### Block 4: Policy Proposals
- Proposal list/explorer
- Proposal detail view
- Manual proposal entry (text field, impact estimation)
- Apply proposal → update custom budget

### Block 5: Scenario Management
- Save custom scenarios (localStorage initially)
- Compare 2-3 scenarios side-by-side
- Export scenario as JSON/link
- Scenario history

### Block 6: Polish & Data Integration
- Responsive design (mobile-first)
- Accessibility audit (WCAG)
- Real budget data (via API or CSV)
- Supabase integration (optional for MVP)

## UI/UX Approach

### Pages
- `/` — Home: current budget visualization
- `/customize` — Custom budget builder
- `/proposals` — Policy proposals explorer
- `/scenarios` — Save/manage/compare scenarios
- `/about` — Project info & data sources

### Components (Reusable)
- `BudgetChart` — Pie/bar chart wrapper
- `CategoryCard` — Category detail card
- `BudgetSlider` — Single category slider
- `ProposalCard` — Proposal preview
- `ScenarioCard` — Saved scenario preview

## Data Sources (TBD)

- **Budget Data:** 
  - Real government budget (US, EU, specific country)
  - Start with mock data, integrate real data later
  
- **Policy Proposals:**
  - User-generated initially
  - Pre-built proposals from platforms (optional)

## Success Metrics

- Interactive, responsive budget visualization
- Intuitive policy/budget customization
- Real-time impact feedback
- Shareable scenarios
- Mobile-friendly

## Out of Scope (Post-MVP)

- AI policy analysis (complex)
- Multi-country/regional budgets
- Historical budget trends
- Civic engagement (voting, petitions)
- Social sharing integrations
- Authentication (unless needed for scenarios)

---

**Status:** Ready for block-by-block development
