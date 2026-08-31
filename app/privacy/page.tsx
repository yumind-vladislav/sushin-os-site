import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';
import { absoluteUrl } from '@/lib/site';

const canonical = absoluteUrl('/privacy/');

export const metadata: Metadata = {
  title: 'Privacy — Sushin OS',
  description:
    'Как Sushin OS работает с локальными настройками, Spotify и Yandex Metrica.',
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
          На сайте нет аккаунтов, контактной формы и хранилища входящих
          сообщений. Настройки языка, окон, оформления и звука сохраняются
          только в localStorage вашего браузера. Их можно удалить через
          настройки браузера.
        </p>
      </section>
      <section>
        <h2>Yandex Metrica</h2>
        <p>
          Сейчас счетчик не включен. Даже при техническом включении он не
          запускается при активном Do Not Track, а Webvisor остается
          выключенным. Yandex Metrica может получать сведения о посещении и
          взаимодействиях: URL и заголовок страницы, источник перехода,
          просмотры, время на сайте, глубину просмотра, исходящие переходы и
          загрузки файлов. Также могут обрабатываться IP-адрес, примерное
          местоположение, тип и версия браузера и ОС, тип устройства, разрешение
          экрана, язык, часовой пояс и другие технические параметры.
        </p>
        <p>
          Для различения посетителей Metrica использует анонимные браузерные
          идентификаторы в cookie и localStorage, включая <code>_ym_uid</code> и
          свойства вида <code>_ym&lt;ID счетчика&gt;_lsid</code>. События Sushin
          OS содержат только тип действия и ограниченные идентификаторы формата,
          проекта, канала или статьи — без текста сообщений и пользовательского
          ввода.
        </p>
        <p>
          Официальные описания:{' '}
          <a href="https://yandex.com/support/metrica/en/code/data-collected">
            данные, собираемые Metrica
          </a>{' '}
          и{' '}
          <a href="https://yandex.com/support/metrica/en/general/cookie-usage">
            cookie и localStorage Metrica
          </a>
          , а также{' '}
          <a href="https://yandex.com/legal/metrica_termsofuse/en/">
            Metrica Terms of Use
          </a>
          .
        </p>
      </section>
      <section>
        <h2>Spotify</h2>
        <p>
          Spotify Embed и запрос к Spotify появляются только после вашего
          нажатия на Music Utility. После загрузки встроенного плеера Spotify и
          его сторонние партнеры могут размещать cookie и похожие технологии,
          получать сведения об устройстве, IP-адресе и взаимодействиях с embed и
          обрабатывать их по своим правилам. Sushin OS не получает данные вашего
          Spotify-аккаунта. Если не хотите обращаться к Spotify и связанным
          третьим сторонам, не запускайте плеер.
        </p>
        <p>
          Официальные документы Spotify:{' '}
          <a href="https://developer.spotify.com/documentation/embeds/terms">
            Embed Terms
          </a>
          ,{' '}
          <a href="https://www.spotify.com/legal/privacy-policy/">
            Privacy Policy
          </a>{' '}
          и{' '}
          <a href="https://www.spotify.com/legal/cookies-policy/">
            Cookies Policy
          </a>
          .
        </p>
      </section>
      <section>
        <h2>Прямые ссылки</h2>
        <p>
          Telegram, GitHub, LinkedIn, Instagram, X и email открываются только по
          вашему действию. Дальнейшая обработка на внешнем сайте регулируется
          его правилами.
        </p>
      </section>
    </LegalPage>
  );
}
