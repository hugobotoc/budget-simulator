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
    title: 'Universal Healthcare System',
    description: 'Replace Medicare and Medicaid with a single-payer universal healthcare system. Would expand coverage to all US citizens.',
    impact: [
      { categoryId: 'medicare', changePercent: 150, estimatedCost: 800, description: 'Expanded universal coverage' },
      { categoryId: 'medicaid', changePercent: -100, estimatedCost: -616, description: 'Merged into universal system' }
    ],
    createdAt: new Date('2024-01-15'),
    author: 'Democratic Platform'
  },
  {
    id: 'prop-2',
    title: 'Increase Defense Spending 15%',
    description: 'Boost military budget for enhanced readiness, personnel, equipment modernization, and cyber defense capabilities.',
    impact: [
      { categoryId: 'defense', changePercent: 15, estimatedCost: 123, description: 'Personnel, equipment, modernization' }
    ],
    createdAt: new Date('2024-02-01'),
    author: 'Republican Platform'
  },
  {
    id: 'prop-3',
    title: 'Green Energy Transition Fund',
    description: 'Invest $500B over 10 years in renewable energy infrastructure, electric vehicle networks, and clean technology R&D.',
    impact: [
      { categoryId: 'infrastructure', changePercent: 100, estimatedCost: 206, description: 'Renewable energy projects' },
      { categoryId: 'science', changePercent: 75, estimatedCost: 145, description: 'Clean tech R&D' }
    ],
    createdAt: new Date('2024-01-20'),
    author: 'Green Party'
  },
  {
    id: 'prop-4',
    title: 'Defense Spending Reduction 10%',
    description: 'Cut defense spending by 10% through reduced military operations abroad, consolidation of bases, and efficiency improvements.',
    impact: [
      { categoryId: 'defense', changePercent: -10, estimatedCost: -82, description: 'Reduced overseas operations and consolidation' }
    ],
    createdAt: new Date('2024-02-05'),
    author: 'Progressive Coalition'
  },
  {
    id: 'prop-5',
    title: 'Social Security Expansion',
    description: 'Increase Social Security benefits by 25% for seniors living below the poverty line. Target: improve retirement security.',
    impact: [
      { categoryId: 'social-security', changePercent: 20, estimatedCost: 269, description: 'Enhanced benefits for low-income seniors' }
    ],
    createdAt: new Date('2024-01-25'),
    author: 'Democratic Platform'
  },
  {
    id: 'prop-6',
    title: 'Medicare for All Ages',
    description: 'Expand Medicare eligibility to all Americans regardless of age. Replaces private insurance system.',
    impact: [
      { categoryId: 'medicare', changePercent: 200, estimatedCost: 1696, description: 'Universal Medicare coverage' },
      { categoryId: 'medicaid', changePercent: -100, estimatedCost: -616, description: 'Absorbed into Medicare for All' }
    ],
    createdAt: new Date('2024-02-10'),
    author: 'Progressive Coalition'
  },
  {
    id: 'prop-7',
    title: 'Infrastructure Modernization 2.0',
    description: '$2 trillion over 8 years for roads, bridges, rail, ports, and broadband expansion. Create 4M jobs.',
    impact: [
      { categoryId: 'infrastructure', changePercent: 400, estimatedCost: 824, description: 'Roads, bridges, rail, broadband' },
      { categoryId: 'education', changePercent: 50, estimatedCost: 119, description: 'STEM training programs' }
    ],
    createdAt: new Date('2024-02-08'),
    author: 'Bipartisan Coalition'
  },
  {
    id: 'prop-8',
    title: 'K-12 Education Investment',
    description: 'Increase federal education funding by 50%. Focus on under-resourced schools, teacher salaries, and STEM programs.',
    impact: [
      { categoryId: 'education', changePercent: 50, estimatedCost: 119, description: 'Teacher salaries, school infrastructure, STEM' }
    ],
    createdAt: new Date('2024-01-30'),
    author: 'Teachers Union'
  },
  {
    id: 'prop-9',
    title: 'Veterans Benefits Increase',
    description: 'Increase veterans benefits by 30%. Cover mental health services, housing support, and job training programs.',
    impact: [
      { categoryId: 'veterans', changePercent: 30, estimatedCost: 90, description: 'Mental health, housing, job training' }
    ],
    createdAt: new Date('2024-02-12'),
    author: 'Veterans Advocacy Group'
  },
  {
    id: 'prop-10',
    title: 'Net Interest on Debt Reduction',
    description: 'Deficit reduction measures to lower debt servicing costs over time. Includes modest revenue increases.',
    impact: [
      { categoryId: 'interest', changePercent: -15, estimatedCost: -99, description: 'Deficit reduction measures' }
    ],
    createdAt: new Date('2024-02-14'),
    author: 'Fiscal Conservatives'
  },
  {
    id: 'prop-11',
    title: 'Medicaid Expansion',
    description: 'Expand Medicaid eligibility to 400% of federal poverty level. Covers 15M additional Americans.',
    impact: [
      { categoryId: 'medicaid', changePercent: 50, estimatedCost: 308, description: 'Expanded coverage for working families' }
    ],
    createdAt: new Date('2024-01-28'),
    author: 'Healthcare Advocates'
  },
  {
    id: 'prop-12',
    title: 'Climate Research Initiative',
    description: 'Triple federal funding for climate research and adaptation technologies. Focus on carbon capture and resilience.',
    impact: [
      { categoryId: 'science', changePercent: 100, estimatedCost: 193, description: 'Climate research and carbon tech' },
      { categoryId: 'infrastructure', changePercent: 25, estimatedCost: 52, description: 'Climate-resilient infrastructure' }
    ],
    createdAt: new Date('2024-02-03'),
    author: 'Climate Scientists Coalition'
  },
  {
    id: 'prop-13',
    title: 'Military Base Consolidation',
    description: 'Close redundant military bases and consolidate operations. Reduce overhead while maintaining readiness.',
    impact: [
      { categoryId: 'defense', changePercent: -8, estimatedCost: -66, description: 'Base consolidation and efficiency' }
    ],
    createdAt: new Date('2024-02-06'),
    author: 'Government Efficiency Task Force'
  },
  {
    id: 'prop-14',
    title: 'Housing First Initiative',
    description: 'Federal program to provide permanent housing for homeless population. Includes supportive services.',
    impact: [
      { categoryId: 'other', changePercent: 15, estimatedCost: 108, description: 'Housing and supportive services' }
    ],
    createdAt: new Date('2024-02-11'),
    author: 'Housing Advocates'
  },
  {
    id: 'prop-15',
    title: 'Debt Service Cost Control',
    description: 'Comprehensive fiscal reform to stabilize debt trajectory. Includes spending controls and revenue measures.',
    impact: [
      { categoryId: 'interest', changePercent: -20, estimatedCost: -132, description: 'Fiscal consolidation measures' },
      { categoryId: 'other', changePercent: -5, estimatedCost: -36, description: 'Operational efficiency' }
    ],
    createdAt: new Date('2024-02-15'),
    author: 'Congressional Budget Office'
  }
];
