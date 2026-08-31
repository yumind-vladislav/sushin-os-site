import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';
import { absoluteUrl } from '@/lib/site';

const canonical = absoluteUrl('/terms/');

export const metadata: Metadata = {
  title: 'Terms — Sushin OS',
  description: 'Условия использования персонального сайта Sushin OS.',
  alternates: { canonical },
  openGraph: {
    type: 'article',
    url: canonical,
    title: 'Terms — Sushin OS',
    description: 'Условия использования персонального сайта Владислава Сушина.',
  },
  twitter: {
    card: 'summary',
    title: 'Terms — Sushin OS',
    description: 'Условия использования персонального сайта Владислава Сушина.',
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="SUSHIN OS · TERMS"
      summary="Sushin OS — персональное портфолио и редакционный архив, а не сервис с пользовательскими аккаунтами."
      title="Terms"
    >
      <section>
        <h2>Назначение</h2>
        <p>
          Сайт представляет опыт, проекты, CV и публикации Владислава Сушина. Материалы
          размещены для знакомства, профессионального общения и обсуждения возможного
          сотрудничества; они не являются публичной офертой или профессиональной
          финансовой, юридической либо медицинской консультацией.
        </p>
      </section>
      <section>
        <h2>Контент и ссылки</h2>
        <p>
          Авторский текст, оригинальные обои и структура сайта не предназначены для
          перепубликации целиком без согласования. Названия сторонних продуктов и
          сервисов принадлежат их владельцам. Внешние ссылки могут изменяться или
          становиться недоступными независимо от Sushin OS.
        </p>
      </section>
      <section>
        <h2>Доступность</h2>
        <p>
          Сайт предоставляется в текущем виде. Владелец может исправлять ошибки,
          обновлять материалы и скрывать устаревшие публикации, сохраняя стабильные URL
          там, где это возможно. Непрерывная работа внешних Spotify, Telegram и других
          ссылок не гарантируется.
        </p>
      </section>
      <section>
        <h2>Связь</h2>
        <p>
          Для обсуждения работы используйте контакты в Sushin OS. Для вопросов об этих
          условиях или privacy используйте отдельный legal email внизу страницы.
        </p>
      </section>
    </LegalPage>
  );
}
