'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Link } from '@/i18n/routing';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const t = useTranslations('auth');

  const registerSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(2),
          email: z.string().email(),
          password: z.string().min(6),
          confirmPassword: z.string().min(6),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('password_mismatch'),
          path: ['confirmPassword'],
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    console.log(data);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <PageHeader title={t('register_title')} />
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label={t('name')} error={errors.name?.message} {...register('name')} />
          <Input label={t('email')} type="email" error={errors.email?.message} {...register('email')} />
          <Input
            label={t('password')}
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label={t('confirm_password')}
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {t('register_btn')}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-text-muted">
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300">
            {t('login_title')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
