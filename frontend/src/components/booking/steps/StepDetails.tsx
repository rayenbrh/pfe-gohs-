'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createBookingDetailsSchema, type BookingDetailsForm } from '@/lib/booking-schema';

interface StepDetailsProps {
  onBack: () => void;
  onSubmit: (data: BookingDetailsForm) => void;
}

export function StepDetails({ onBack, onSubmit }: StepDetailsProps) {
  const t = useTranslations('booking');
  const v = useTranslations('booking.validation');

  const schema = createBookingDetailsSchema({
    firstName: v('first_name'),
    lastName: v('last_name'),
    email: v('email'),
    phone: v('phone'),
    nationality: v('nationality'),
    idNumber: v('id_number'),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingDetailsForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      idType: 'cin',
    },
  });

  const idType = watch('idType');

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('first_name')} error={errors.firstName?.message} {...register('firstName')} />
          <Input label={t('last_name')} error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Input label={t('email')} type="email" error={errors.email?.message} {...register('email')} />
        <Input label={t('phone')} error={errors.phone?.message} {...register('phone')} />
        <Input
          label={t('nationality')}
          error={errors.nationality?.message}
          {...register('nationality')}
        />

        <div>
          <p className="mb-2 text-sm text-text-muted">{t('id_type')}</p>
          <div className="flex gap-4">
            {(['cin', 'passport'] as const).map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  value={type}
                  checked={idType === type}
                  onChange={() => setValue('idType', type)}
                  className="accent-brand-600"
                />
                <span className="text-sm text-text-secondary">
                  {t(type === 'cin' ? 'id_cin' : 'id_passport')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Input
          label={t('id_number')}
          error={errors.idNumber?.message}
          {...register('idNumber')}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onBack}>
            {t('back')}
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            {t('continue_payment')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
