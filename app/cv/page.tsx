import type { Metadata } from 'next';
import Link from 'next/link';
import { CvDocument } from '@/components/cv/cv-document';

export const metadata: Metadata = {
  title: 'CV — Владислав Сушин, Project Manager',
  description:
    'Резюме Владислава Сушина: Project Manager в AI-разработке. Актуально в августе 2026 года.',
};

export default function CvPage() {
  return (
    <main className="cv-route">
      <nav className="cv-route-nav">
        <Link href="/">← Sushin OS</Link>
        <a download href="/cv/vladislav-sushin-project-manager-2026.docx">
          Скачать DOCX
        </a>
        <Link href="/cv/vladislav-sushin-project-manager-2026.pdf">
          Открыть PDF
        </Link>
      </nav>
      <CvDocument />
    </main>
  );
}
