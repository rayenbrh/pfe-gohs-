'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { getVehicleById } from '@/lib/fleet-data';
import { countDaysBetween, parseDateISO } from '@/lib/fleet-utils';
import type { BookingDetailsForm } from '@/lib/booking-schema';

import { WizardProgress } from './WizardProgress';
import { StepConfirmation } from './steps/StepConfirmation';
import { StepDetails } from './steps/StepDetails';
import { StepPayment } from './steps/StepPayment';
import { StepVehicle } from './steps/StepVehicle';

const slideVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

export function BookingWizard() {
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId') ?? '1';
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');

  const vehicle = useMemo(() => getVehicleById(vehicleId) ?? getVehicleById('1')!, [vehicleId]);

  const startDate = startParam ? parseDateISO(startParam) : null;
  const endDate = endParam ? parseDateISO(endParam) : null;
  const days =
    startDate && endDate ? countDaysBetween(startDate, endDate) : 3;
  const total = days * vehicle.pricePerDay;

  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<BookingDetailsForm | null>(null);
  const [reservationRef, setReservationRef] = useState('');

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-3xl px-1 sm:min-h-0 sm:px-0">
      <WizardProgress currentStep={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          {step === 0 ? (
            <StepVehicle
              vehicle={vehicle}
              startDate={startDate}
              endDate={endDate}
              days={days}
              total={total}
              onContinue={next}
            />
          ) : null}
          {step === 1 ? (
            <StepDetails
              onBack={back}
              onSubmit={(data) => {
                setDetails(data);
                next();
              }}
            />
          ) : null}
          {step === 2 ? (
            <StepPayment
              vehicle={vehicle}
              days={days}
              total={total}
              details={details}
              onBack={back}
              onComplete={(ref) => {
                setReservationRef(ref);
                next();
              }}
            />
          ) : null}
          {step === 3 ? (
            <StepConfirmation
              reservationRef={reservationRef || tCommon('reservation_ref_fallback')}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
