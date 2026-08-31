import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';
import { absoluteUrl } from '@/lib/site';

const canonical = absoluteUrl('/privacy/');

export const metadata: Metadata = {
  title: 'Privacy — Sushin OS',
  description: 'Как Sushin OS работает с локальными настройками, Spotify и Yandex Metrica.',
  alternates: { canonical },
  openGraph: {
    type: 'article',
    url: canonical,
    title: 'Privacy — Sushin OS',
    description: 'Privacy-информация персонального сайта Владислава Сушина.',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy — Sushin OS',
    description: 'Privacy-информация персонального сайта Владислава Сушина.',
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="SUSHIN OS · PRIVACY"
      summary="Здесь коротко и прямо описано, какие данные нужны сайту и когда включаются внешние сервисы."
      title="Privacy"
    >
      <section>
        <h2>Что сайт хранит</h2>
        <p>
          На сайте нет аккаунтов, контактной формы и хранилища входящих сообщений.
          Настройки языка, окон, оформления и звука сохраняются только в localStorage
          вашего браузера. Их можно удалить через настройки браузера.
        </p>
      </section>
      <section>
        <h2>Yandex Metrica</h2>
        <p>
          Счетчик загружается только если владелец сайта задаст публичный counter ID.
          Без него analytics-адаптер ничего не отправляет. При включенном Do Not Track
          Metrica не запускается. События содержат только тип действия и ограниченные
          технические идентификаторы формата, проекта, канала или статьи — без текста
          сообщений и пользовательского ввода. Webvisor отключен.
        </p>
      </section>
      <section>
        <h2>Spotify</h2>
        <p>
          Spotify Embed и запрос к Spotify появляются только после вашего нажатия на
          Music Utility. После этого Spotify может обрабатывать данные по своим
          правилам. Если не хотите обращаться к Spotify, не запускайте плеер.
        </p>
      </section>
      <section>
        <h2>Прямые ссылки</h2>
        <p>
          Telegram, GitHub, LinkedIn, Instagram, X и email открываются только по вашему
          действию. Дальнейшая обработка на внешнем сайте регулируется его правилами.
        </p>
      </section>
    </LegalPage>
  );
}
