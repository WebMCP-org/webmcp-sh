/**
 * Category color mappings using design system colors
 * Material Design inspired palette
 */

export const CATEGORY_COLORS = {
  fact: {
    tailwind: 'chart-5',
    hex: '#ff9800', // Orange
  },
  preference: {
    tailwind: 'brand',
    hex: '#f17463', // Brand color
  },
  skill: {
    tailwind: 'chart-3',
    hex: '#2196f3', // Blue
  },
  rule: {
    tailwind: 'brand',
    hex: '#f17463', // Brand color
  },
  context: {
    tailwind: 'chart-2',
    hex: '#9c27b0', // Purple
  },
  person: {
    tailwind: 'chart-4',
    hex: '#4caf50', // Green
  },
  project: {
    tailwind: 'chart-3',
    hex: '#2196f3', // Blue
  },
  goal: {
    tailwind: 'chart-5',
    hex: '#ff9800', // Orange
  },
} as const;

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]?.hex || '#6b7280';
}
