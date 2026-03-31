import type { Proposal } from '$types';

export const mockProposals: Proposal[] = [
  {
    id: 'prop-001',
    title: 'Healthcare Expansion',
    description: 'Universal healthcare program for all citizens',
    impact: [
      { categoryId: 'medicare', changePercent: 25, estimatedCost: 212, description: 'Medicare expansion' },
      { categoryId: 'medicaid', changePercent: 30, estimatedCost: 185, description: 'Medicaid coverage increase' }
    ],
    source: 'Health Reform Platform',
    createdAt: new Date('2024-01-15'),
    author: 'Health Advocacy Coalition'
  },
  {
    id: 'prop-002',
    title: 'Defense Budget Cut',
    description: 'Reduce defense spending by 10%',
    impact: [
      { categoryId: 'defense', changePercent: -10, estimatedCost: -82, description: 'Defense reduction' }
    ],
    source: 'Peace Initiative',
    createdAt: new Date('2024-02-01'),
    author: 'International Peace Council'
  },
  {
    id: 'prop-003',
    title: 'Education Investment',
    description: 'Increase education and training funding for workforce development',
    impact: [
      { categoryId: 'education', changePercent: 50, estimatedCost: 119, description: 'Education expansion' }
    ],
    source: 'Education First Coalition',
    createdAt: new Date('2024-01-20'),
    author: 'American Education Association'
  },
  {
    id: 'prop-004',
    title: 'Infrastructure Modernization',
    description: 'Major investment in roads, bridges, and public transit',
    impact: [
      { categoryId: 'transportation', changePercent: 35, estimatedCost: 99, description: 'Transportation infrastructure' }
    ],
    source: 'Build America Platform',
    createdAt: new Date('2024-01-10'),
    author: 'Infrastructure Workers Alliance'
  },
  {
    id: 'prop-005',
    title: 'Tax Cuts',
    description: 'Across-the-board tax reduction for all income levels',
    impact: [
      { categoryId: 'social-security', changePercent: -5, estimatedCost: -67, description: 'Social Security reduction' },
      { categoryId: 'medicare', changePercent: -5, estimatedCost: -42, description: 'Medicare reduction' }
    ],
    source: 'Fiscal Conservative Coalition',
    createdAt: new Date('2024-01-25'),
    author: 'Tax Reform Movement'
  },
  {
    id: 'prop-006',
    title: 'Veteran Support Increase',
    description: 'Enhanced benefits and services for military veterans',
    impact: [
      { categoryId: 'veterans', changePercent: 40, estimatedCost: 120, description: 'Veterans benefits expansion' }
    ],
    source: 'Veterans Affairs Coalition',
    createdAt: new Date('2024-02-05'),
    author: 'American Legion'
  },
  {
    id: 'prop-007',
    title: 'Environmental Protection',
    description: 'Invest in clean energy, pollution reduction, and climate initiatives',
    impact: [
      { categoryId: 'environment', changePercent: 60, estimatedCost: 144, description: 'Environment & energy funding' }
    ],
    source: 'Climate Action Network',
    createdAt: new Date('2024-02-10'),
    author: 'Environmental Defense Fund'
  },
  {
    id: 'prop-008',
    title: 'Social Safety Net',
    description: 'Strengthen assistance programs for low-income families',
    impact: [
      { categoryId: 'welfare', changePercent: 20, estimatedCost: 80, description: 'Welfare program expansion' },
      { categoryId: 'food-assistance', changePercent: 25, estimatedCost: 50, description: 'Food assistance increase' }
    ],
    source: 'Poverty Action Alliance',
    createdAt: new Date('2024-02-08'),
    author: 'National Poverty Center'
  }
];
