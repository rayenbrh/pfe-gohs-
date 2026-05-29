import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

import { COLORS } from '@/lib/design-system';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
);

export const chartColors = {
  grid: 'rgba(138, 92, 246, 0.08)',
  text: COLORS.textMuted,
  brand400: COLORS.purple400,
  brandFill: 'rgba(124, 58, 237, 0.15)',
  success: COLORS.success,
  danger: COLORS.danger,
  warning: COLORS.warning,
  info: COLORS.info,
  cyan: COLORS.cyan400,
};

export const statusChartColors: Record<string, string> = {
  confirmed: COLORS.purple400,
  active: COLORS.success,
  completed: COLORS.info,
  cancelled: COLORS.danger,
  pending: COLORS.warning,
};
