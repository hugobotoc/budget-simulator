import type { Budget } from '$types';

// Mock US Federal Budget 2024 (simplified)
export const mockBudget: Budget = {
  id: 'us-federal-2024',
  year: 2024,
  totalBudget: 6750, // billions USD
  currency: 'USD',
  source: 'US Federal Budget 2024 (Simplified)',
  lastUpdated: new Date('2024-02-01'),
  categories: [
    {
      id: 'social-security',
      name: 'Social Security',
      amount: 1344,
      percentage: 20,
      color: '#3B82F6',
      trend: [
        { year: 2020, amount: 1200 },
        { year: 2021, amount: 1250 },
        { year: 2022, amount: 1300 },
        { year: 2023, amount: 1320 },
        { year: 2024, amount: 1344 }
      ]
    },
    {
      id: 'medicare',
      name: 'Medicare',
      amount: 848,
      percentage: 12.6,
      color: '#10B981',
      trend: [
        { year: 2020, amount: 720 },
        { year: 2021, amount: 770 },
        { year: 2022, amount: 800 },
        { year: 2023, amount: 825 },
        { year: 2024, amount: 848 }
      ]
    },
    {
      id: 'medicaid',
      name: 'Medicaid',
      amount: 616,
      percentage: 9.1,
      color: '#8B5CF6',
      trend: [
        { year: 2020, amount: 500 },
        { year: 2021, amount: 550 },
        { year: 2022, amount: 580 },
        { year: 2023, amount: 600 },
        { year: 2024, amount: 616 }
      ]
    },
    {
      id: 'defense',
      name: 'Defense',
      amount: 822,
      percentage: 12.2,
      color: '#EF4444',
      trend: [
        { year: 2020, amount: 740 },
        { year: 2021, amount: 770 },
        { year: 2022, amount: 800 },
        { year: 2023, amount: 810 },
        { year: 2024, amount: 822 }
      ]
    },
    {
      id: 'veterans',
      name: 'Veterans Benefits',
      amount: 301,
      percentage: 4.5,
      color: '#F59E0B'
    },
    {
      id: 'education',
      name: 'Education & Training',
      amount: 238,
      percentage: 3.5,
      color: '#06B6D4'
    },
    {
      id: 'infrastructure',
      name: 'Transportation & Infrastructure',
      amount: 206,
      percentage: 3.1,
      color: '#6366F1'
    },
    {
      id: 'science',
      name: 'Science & Medical Research',
      amount: 193,
      percentage: 2.9,
      color: '#14B8A6'
    },
    {
      id: 'interest',
      name: 'Net Interest on Debt',
      amount: 659,
      percentage: 9.8,
      color: '#D97706'
    },
    {
      id: 'other',
      name: 'Other (misc., housing, etc.)',
      amount: 722,
      percentage: 10.7,
      color: '#64748B'
    }
  ]
};

export const mockProposals = [
  {
    id: 'prop-1',
    title: 'Universal Healthcare',
    description: 'Expand healthcare coverage to all US citizens. Would replace Medicare/Medicaid system.',
    impact: [
      { categoryId: 'medicare', changePercent: 50, description: 'Merged into new universal system' },
      { categoryId: 'medicaid', changePercent: -100, description: 'Replaced by universal coverage' },
      { categoryId: 'defense', changePercent: 0 }
    ],
    createdAt: new Date(),
    author: 'Democratic Platform'
  },
  {
    id: 'prop-2',
    title: 'Increase Defense Spending',
    description: 'Boost military budget by 15% for enhanced readiness.',
    impact: [
      { categoryId: 'defense', changePercent: 15, description: 'Personnel, equipment, modernization' }
    ],
    createdAt: new Date(),
    author: 'Republican Platform'
  },
  {
    id: 'prop-3',
    title: 'Green Energy Transition',
    description: 'Invest $500B over 5 years in renewable energy and clean infrastructure.',
    impact: [
      { categoryId: 'infrastructure', changePercent: 100, description: 'Renewable energy projects' },
      { categoryId: 'science', changePercent: 50, description: 'Clean tech R&D' }
    ],
    createdAt: new Date(),
    author: 'Green Party'
  }
];
