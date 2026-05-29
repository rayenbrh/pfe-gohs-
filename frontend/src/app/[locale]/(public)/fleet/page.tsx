'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { FleetCategoryChips } from '@/components/fleet/FleetCategoryChips';
import { FleetEmptyState } from '@/components/fleet/FleetEmptyState';
import { FleetPagination } from '@/components/fleet/FleetPagination';
import { VehicleFilters } from '@/components/fleet/VehicleFilters';
import { VehicleGrid } from '@/components/fleet/VehicleGrid';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { fleetVehicles } from '@/lib/fleet-data';
import { filterVehicles, paginateVehicles, resetFleetFilters, sortVehicles } from '@/lib/fleet-utils';
import type { FleetFilters, SortOption, VehicleCategory } from '@/types/vehicle';
import { DEFAULT_FLEET_FILTERS } from '@/types/vehicle';

const PER_PAGE = 9;

export default function FleetPage() {
  const t = useTranslations('fleet');
  const [draftFilters, setDraftFilters] = useState<FleetFilters>(DEFAULT_FLEET_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FleetFilters>(DEFAULT_FLEET_FILTERS);
  const [sort, setSort] = useState<SortOption>('popular');
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = filterVehicles(fleetVehicles, appliedFilters);
    return sortVehicles(list, sort);
  }, [appliedFilters, sort]);

  const { items, totalPages, total, page: safePage } = useMemo(
    () => paginateVehicles(filtered, page, PER_PAGE),
    [filtered, page],
  );

  const handleApply = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
    setSheetOpen(false);
  };

  const handleReset = () => {
    const reset = resetFleetFilters();
    setDraftFilters(reset);
    setAppliedFilters(reset);
    setPage(1);
  };

  const handleChipChange = (category: VehicleCategory | 'all') => {
    const next = { ...appliedFilters, category };
    setDraftFilters(next);
    setAppliedFilters(next);
    setPage(1);
  };

  const filterPanel = (
    <VehicleFilters
      filters={draftFilters}
      onChange={setDraftFilters}
      onApply={handleApply}
      onReset={handleReset}
    />
  );

  const sheetFooter = (
    <div className="flex gap-3">
      <Button variant="ghost" fullWidth onClick={handleReset}>
        {t('reset_filters')}
      </Button>
      <Button fullWidth onClick={handleApply}>
        {t('apply_filters')}
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] overflow-x-hidden px-4 py-10">
      <PageHeader title={t('title')} />

      <FleetCategoryChips
        active={appliedFilters.category}
        onChange={handleChipChange}
        onOpenFilters={() => {
          setDraftFilters(appliedFilters);
          setSheetOpen(true);
        }}
      />

      <div className="mb-6 hidden items-center justify-between lg:flex">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="touch-target inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-primary"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('filters')}
        </button>
      </div>

      <div className="flex gap-8">
        <div className="hidden w-[280px] shrink-0 lg:block">{filterPanel}</div>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="font-display text-sm text-text-muted">
              {t('found_count', { count: total })}
            </p>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortOption);
                setPage(1);
              }}
              className="touch-target min-h-[44px] rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary"
            >
              <option value="price_asc">{t('sort_price_asc')}</option>
              <option value="price_desc">{t('sort_price_desc')}</option>
              <option value="newest">{t('sort_newest')}</option>
              <option value="popular">{t('sort_popular')}</option>
            </select>
          </div>

          {items.length === 0 ? (
            <FleetEmptyState onReset={handleReset} />
          ) : (
            <>
              <VehicleGrid vehicles={items} size="large" />
              <FleetPagination
                page={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} footer={sheetFooter}>
        <h2 className="mb-4 font-display text-lg text-text-primary">{t('filters')}</h2>
        {filterPanel}
      </BottomSheet>
    </div>
  );
}
