import type { LocalizedText } from './site-content';

export type SushinFact = {
  id: string;
  text: LocalizedText;
  cvHref?: `/cv/#${string}`;
};

export const sushinFacts: readonly SushinFact[] = [
  {
    id: 'birthday',
    text: {
      ru: 'Владислав родился 31 мая 2000 года, а возраст на сайте рассчитывается динамически.',
      en: 'Vladislav was born on 31 May 2000, and the site calculates his age dynamically.',
    },
  },
  {
    id: 'combat-sports',
    text: {
      ru: 'С раннего возраста Владислав занимается единоборствами.',
      en: 'Vladislav has practiced combat sports from an early age.',
    },
  },
  {
    id: 'copywriter',
    text: {
      ru: 'В 18 лет он работал копирайтером для местных и независимых медиа.',
      en: 'At 18, he worked as a copywriter for local and independent media.',
    },
  },
  {
    id: 'cinema-art',
    text: {
      ru: 'Кино и искусство интересуют его с детства; примерно в 2024 году он активно писал о них.',
      en: 'Cinema and art have been interests since childhood; around 2024 he wrote about them actively.',
    },
  },
  {
    id: 'university',
    cvHref: '/cv/#education',
    text: {
      ru: 'Владислав ушёл из университета на четвёртом курсе.',
      en: 'Vladislav left university during his fourth year.',
    },
  },
  {
    id: 'ai-harnesses',
    text: {
      ru: 'Новые AI-harnesses и инструменты он регулярно проверяет на реальных задачах.',
      en: 'He regularly tests new AI harnesses and tools on real tasks.',
    },
  },
  {
    id: 'two-weeks',
    cvHref: '/cv/#experience-miniapp',
    text: {
      ru: 'Один AI-продукт дошёл от идеи до production и первых пользователей за две недели.',
      en: 'One AI product reached production and its first users in two weeks.',
    },
  },
  {
    id: 'memory-system',
    cvHref: '/cv/#experience-miniapp',
    text: {
      ru: 'Внутри этого продукта работала собственная система памяти AI-агента.',
      en: 'That product included a custom AI-agent memory system.',
    },
  },
  {
    id: 'access-count',
    cvHref: '/cv/#experience-miniapp',
    text: {
      ru: 'На 7 августа 2026 года доступ к боту имели 96 пользовательских аккаунтов и один администратор. Это не 97 MAU.',
      en: 'On 7 August 2026, 96 user accounts and one administrator had bot access. That was not 97 MAU.',
    },
  },
  {
    id: 'confirmed-use',
    cvHref: '/cv/#experience-miniapp',
    text: {
      ru: 'На ту же дату использование продукта подтвердили 70 уникальных аккаунтов.',
      en: 'On the same date, 70 unique accounts had confirmed product use.',
    },
  },
  {
    id: 'miniapp-authors',
    cvHref: '/cv/#experience-miniapp',
    text: {
      ru: 'Mini App использовали 46 уникальных пользователей, а заметки создавали 36 авторов.',
      en: 'The Mini App had 46 unique users and 36 note authors.',
    },
  },
  {
    id: 'notes',
    cvHref: '/cv/#experience-miniapp',
    text: {
      ru: 'В продукте было 274 существующие неудалённые заметки.',
      en: 'The product contained 274 existing, non-deleted notes.',
    },
  },
  {
    id: 'active-30-days',
    cvHref: '/cv/#experience-miniapp',
    text: {
      ru: 'На 7 августа 2026 года 22 аккаунта были активны в течение предыдущих 30 дней.',
      en: 'As of 7 August 2026, 22 accounts were active during the previous 30 days.',
    },
  },
  {
    id: 'aggregate-metrics',
    text: {
      ru: 'Продуктовые метрики проверялись только в агрегированном виде — без чтения пользовательского контента.',
      en: 'Product metrics were checked only as aggregates, without reading user content.',
    },
  },
  {
    id: 'yumind-origin',
    cvHref: '/cv/#experience-yumind',
    text: {
      ru: 'YUMIND начинался как проект автоматизации отдела продаж.',
      en: 'YUMIND began as a sales-department automation project.',
    },
  },
  {
    id: 'notion-migration',
    cvHref: '/cv/#experience-yumind',
    text: {
      ru: 'В YUMIND управление задачами перенесли из Telegram в Notion.',
      en: 'YUMIND moved task management from Telegram into Notion.',
    },
  },
  {
    id: 'custdev',
    cvHref: '/cv/#experience-yumind',
    text: {
      ru: 'Владислав стандартизировал CustDev-интервью и фиксацию результатов.',
      en: 'Vladislav standardized CustDev interviews and result capture.',
    },
  },
  {
    id: 'crypto-team',
    cvHref: '/cv/#experience-crypto',
    text: {
      ru: 'Crypto-проект запустила команда из трёх человек без стартовых инвестиций.',
      en: 'The crypto project launched with three people and no initial investment.',
    },
  },
  {
    id: 'horeca',
    cvHref: '/cv/#experience-horeca',
    text: {
      ru: 'С января 2019 года Владислав работает в HoReCa и выполняет функции лидера смены — актуально по CV за август 2026 года.',
      en: 'Vladislav has worked in HoReCa and performed shift-lead functions since January 2019, current as of the August 2026 CV.',
    },
  },
  {
    id: 'viewport',
    text: {
      ru: 'Sushin OS занимает один viewport: длинный контент прокручивается внутри окон.',
      en: 'Sushin OS occupies one viewport; long content scrolls inside its windows.',
    },
  },
];
