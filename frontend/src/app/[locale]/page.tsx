import { redirect } from '@/i18n/routing';

interface HomePageProps {
  params: { locale: string };
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  redirect({ href: '/landing', locale });
}
