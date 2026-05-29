'use client';

import type { ChartData, ChartOptions } from 'chart.js';
import { useTranslations } from 'next-intl';
import { Doughnut, Line } from 'react-chartjs-2';

import { useLocaleFormat } from '@/hooks/useLocaleFormat';

import '@/lib/chart-config';
import { chartColors, statusChartColors } from '@/lib/chart-config';
import { COLORS, FONTS } from '@/lib/design-system';
import type { ReservationStatusCount, RevenueChartPoint } from '@/types/admin';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: COLORS.bgSurface,
        border: `1px solid ${COLORS.borderDefault}`,
        borderRadius: 14,
        padding: 20,
      }}
    >
      <h3
        className="mb-4 text-base font-semibold text-text-primary"
        style={{ fontFamily: FONTS.body }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

interface RevenueLineChartProps {
  data: RevenueChartPoint[];
}

export function RevenueLineChart({ data }: RevenueLineChartProps) {
  const t = useTranslations('charts');
  const tCommon = useTranslations('common');
  const { formatPrice } = useLocaleFormat();

  const safeData = data ?? [];

  if (safeData.length === 0) {
    return (
      <ChartCard title={t('revenue_overview')}>
        <div
          style={{
            height: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B648A',
            fontSize: '14px',
          }}
        >
          {tCommon('no_data')}
        </div>
      </ChartCard>
    );
  }

  const chartData: ChartData<'line'> = {
    labels: safeData.map((d) => d.month),
    datasets: [
      {
        label: t('revenue_label'),
        data: safeData.map((d) => d.revenue),
        borderColor: chartColors.brand400,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 280);
          gradient.addColorStop(0, chartColors.brandFill);
          gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: COLORS.purple600,
        pointBorderColor: COLORS.textPrimary,
        pointBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: COLORS.bgElevated,
        titleColor: COLORS.textPrimary,
        bodyColor: COLORS.textSecondary,
        borderColor: COLORS.borderDefault,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => formatPrice(Number(ctx.parsed.y)),
        },
      },
    },
    scales: {
      x: {
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.text, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: chartColors.grid },
        ticks: {
          color: chartColors.text,
          font: { size: 11 },
          callback: (v) => `${Number(v) / 1000}k`,
        },
        border: { display: false },
      },
    },
  };

  return (
    <ChartCard title={t('revenue_overview')}>
      <div className="h-[280px]">
        <Line data={chartData} options={options} />
      </div>
    </ChartCard>
  );
}

interface ReservationDonutChartProps {
  data: ReservationStatusCount[];
  statusLabels: Record<string, string>;
}

export function ReservationDonutChart({
  data,
  statusLabels,
}: ReservationDonutChartProps) {
  const t = useTranslations('charts');
  const tCommon = useTranslations('common');
  const safeData = data ?? [];
  const total = safeData.reduce((s, d) => s + d.count, 0);

  if (total === 0) {
    return (
      <ChartCard title={t('reservation_status')}>
        <div
          style={{
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B648A',
            fontSize: '14px',
          }}
        >
          {tCommon('no_data')}
        </div>
      </ChartCard>
    );
  }

  const chartData: ChartData<'doughnut'> = {
    labels: safeData.map((d) => statusLabels[d.status] ?? d.status),
    datasets: [
      {
        data: safeData.map((d) => d.count),
        backgroundColor: safeData.map((d) => statusChartColors[d.status] ?? COLORS.textMuted),
        borderColor: COLORS.bgSurface,
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: COLORS.bgElevated,
        titleColor: COLORS.textPrimary,
        bodyColor: COLORS.textSecondary,
        borderColor: COLORS.borderDefault,
        borderWidth: 1,
      },
    },
  };

  return (
    <ChartCard title={t('reservation_status')}>
      <div className="relative mx-auto h-[200px] max-w-[220px]">
        <Doughnut data={chartData} options={options} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-[28px] font-bold text-text-primary"
            style={{ fontFamily: FONTS.display }}
          >
            {total}
          </span>
          <span className="text-xs text-text-muted">{tCommon('total_label')}</span>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {safeData.map((item) => (
          <li
            key={item.status}
            className="flex items-center justify-between text-sm"
            style={{ fontFamily: FONTS.body }}
          >
            <span className="flex items-center gap-2 text-text-secondary">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: statusChartColors[item.status] }}
              />
              {statusLabels[item.status]}
            </span>
            <span className="text-text-primary">{item.count}</span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}

