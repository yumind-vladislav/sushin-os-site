import type { Metadata } from 'next';
import { CvRouteActions } from '@/components/analytics/route-signals';
import { CvDocument } from '@/components/cv/cv-document';
import { absoluteUrl } from '@/lib/site';

const canonical = absoluteUrl('/cv/');

export const metadata: Metadata = {
  title: 'CV — Владислав Сушин, Project Manager',
  description:
    'Резюме Владислава Сушина: Project Manager в AI-разработке. Актуально в августе 2026 года.',
  alternates: { canonical },
  openGraph: {
    type: 'profile',
    url: canonical,
    title: 'CV — Владислав Сушин, Project Manager',
    description:
      'Project Manager в AI-разработке: опыт, проекты, навыки и прямые контакты.',
  },
  twitter: {
    card: 'summary',
    title: 'CV — Владислав Сушин, Project Manager',
    description:
      'Project Manager в AI-разработке: опыт, проекты, навыки и прямые контакты.',
  },
};

export default function CvPage() {
  return (
    <main className="cv-route">
      <nav className="cv-route-nav">
        <CvRouteActions />
      </nav>
      <CvDocument />
    </main>
  );
}
