import type { LocalizedText } from './site-content';

export type CvExperience = {
  id: string;
  title: string;
  role: string;
  period: string;
  summary: string;
  bullets: readonly string[];
};

export const careerContent = {
  schemaVersion: 1,
  actuality: 'август 2026',
  contacts: [
    {
      label: 'vladislav.sushin@gmail.com',
      href: 'mailto:vladislav.sushin@gmail.com',
    },
    { label: '+7 988 348-72-36', href: 'tel:+79883487236' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/vladislav-sushyn',
    },
    { label: 'GitHub', href: 'https://github.com/yumind-vladislav' },
  ],
  profile:
    'Project Manager с практическим опытом запуска AI-продуктов от идеи до первых пользователей, организации работы стартап-команды и выстраивания проектных процессов. Создаю документацию, декомпозирую задачи, фиксирую решения, контролирую сроки и зависимости, провожу CustDev и переговоры с клиентами. Практически работаю с AI-агентами, системами памяти, инструментами автоматизации и AI-разработки.',
  experience: [
    {
      id: 'experience-miniapp',
      title: '@yumind_bot / Mini App',
      role: 'автор продукта, функции Project Manager / Product Manager',
      period: 'май 2026 - июль 2026',
      summary:
        'Завершенный продуктовый этап внутри продолжающей развиваться экосистемы YUMIND Reborn: Telegram-бот и Mini App с собственной системой памяти AI-агента.',
      bullets: [
        'Довел продукт от идеи до production и первых пользователей за 2 недели.',
        'Отвечал за продуктовую логику, техническую реализацию, тестирование, запуск и сопровождение; партнер помогал с контентом.',
        'Реализовал собственную систему памяти AI-агента в production-версии.',
        'На 7 августа 2026 года доступ имели 96 пользовательских аккаунтов и один администратор; это не показатель MAU.',
        '70 уникальных аккаунтов подтвердили использование продукта, включая 46 пользователей Mini App и 36 авторов заметок.',
        'В продукте было 274 существующие неудаленные заметки; 22 аккаунта были активны за предыдущие 30 дней.',
      ],
    },
    {
      id: 'experience-yumind',
      title: 'YUMIND',
      role: 'сооснователь, функции Project Manager / Product Manager',
      period: 'май 2025 - декабрь 2025',
      summary:
        'Стартап для автоматизации отдела продаж, созданный четырьмя сооснователями без формально назначенных должностей.',
      bullets: [
        'Создавал проектную документацию и планы реализации задач.',
        'Координировал команду: проводил созвоны, фиксировал решения, контролировал статусы, сроки и зависимости.',
        'Перенес управление задачами из Telegram в Notion, сделав дедлайны, ответственность и статус работы прозрачными.',
        'Участвовал в переговорах с клиентами и формировании продуктового видения.',
        'Стандартизировал проведение CustDev и фиксацию результатов интервью.',
        'Тестировал AI-инструменты и помогал команде внедрять их в рабочие процессы.',
      ],
    },
    {
      id: 'experience-crypto',
      title: 'Crypto-проект',
      role: 'сооснователь / координатор проекта',
      period: 'май 2024 - ноябрь 2024',
      summary: 'Команда из трех человек; проект запущен без стартовых инвестиций.',
      bullets: [
        'Распределял зоны ответственности, задачи и приоритеты.',
        'Отслеживал изменения рынка и участвовал в решении о своевременном завершении проекта.',
        'За шесть месяцев команда получила совокупный доход 20 000 USD без стартовых вложений.',
      ],
    },
    {
      id: 'experience-horeca',
      title: 'HoReCa',
      role: 'официант / лидер смены',
      period: 'январь 2019 - настоящее время',
      summary: 'Операционная работа и функции лидера смены при высокой нагрузке.',
      bullets: [
        'Организую рабочие процессы внутри смены и помогаю сохранять качество обслуживания.',
        'Разрешаю внутренние конфликты и помогаю распределять задачи и приоритеты.',
        'Поддерживаю четкую коммуникацию внутри смены и со смежными подразделениями.',
      ],
    },
  ] as const satisfies readonly CvExperience[],
  skills: [
    'Project и Product Management: документация, декомпозиция, сроки, зависимости, CustDev и переговоры.',
    'AI-разработка: Codex, Claude Code, Cursor, MCP, plugins и skills.',
    'AI-агенты и автоматизация: Generative AI, системы памяти, прототипирование, тестирование и production.',
    'Продуктовые форматы: Telegram Bot, Telegram Mini App.',
    'Рабочие инструменты: Notion, Higgsfield, Freepik, Comfy.',
  ],
  education: {
    institution: 'Донецкий национальный технический университет',
    program: 'компьютерная инженерия',
    status: 'неоконченное высшее, 2017–2021',
  },
  languages: ['Русский - родной', 'Украинский - родной', 'Английский - B1'],
} as const;

export type SocialChannel = {
  id: string;
  name: string;
  href: string;
  purpose: LocalizedText;
};

export const socialChannels: readonly SocialChannel[] = [
  {
    id: 'telegram-personal',
    name: 'Personal Telegram',
    href: 'https://t.me/takoikakvse1',
    purpose: {
      ru: 'Самый быстрый способ обсудить работу и сотрудничество.',
      en: 'The fastest way to discuss work and collaboration.',
    },
  },
  {
    id: 'telegram-blog',
    name: 'Telegram blog',
    href: 'https://t.me/yumind_reborn',
    purpose: {
      ru: 'AI-эксперименты, production-заметки, проекты и оригиналы Box News.',
      en: 'AI experiments, production notes, projects, and Box News originals.',
    },
  },
  {
    id: 'email',
    name: 'Email',
    href: 'mailto:vladislav.sushin@gmail.com',
    purpose: {
      ru: 'Формальная переписка и документы.',
      en: 'Formal communication and documents.',
    },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    href: 'https://instagram.com/takoikakvse',
    purpose: {
      ru: 'Короткие форматы и личная сторона процесса.',
      en: 'Short-form work and the personal side of the process.',
    },
  },
  {
    id: 'x',
    name: 'X',
    href: 'https://x.com/takoikakvse1',
    purpose: {
      ru: 'Короткие наблюдения и обсуждение AI.',
      en: 'Short observations and AI discussion.',
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/vladislav-sushyn',
    purpose: {
      ru: 'Профессиональный опыт и нетворкинг.',
      en: 'Professional experience and networking.',
    },
  },
  {
    id: 'github',
    name: 'GitHub',
    href: 'https://github.com/yumind-vladislav',
    purpose: {
      ru: 'Публичный код и прототипы.',
      en: 'Public code and prototypes.',
    },
  },
];

export const aboutTimeline = [
  {
    period: '2019 - now',
    title: { ru: 'Операционная работа в HoReCa', en: 'Operations in HoReCa' },
  },
  {
    period: '2024',
    title: { ru: 'Координация crypto-проекта', en: 'Crypto project coordination' },
  },
  {
    period: '2025',
    title: { ru: 'YUMIND: PM и Product-функции', en: 'YUMIND: PM and Product work' },
  },
  {
    period: '2026',
    title: { ru: 'AI-продукт от идеи до пользователей', en: 'AI product from idea to users' },
  },
] as const;

export const aboutPersonal: LocalizedText = {
  ru: 'Вне продуктовой работы я с детства занимаюсь единоборствами, интересуюсь кино и искусством. Новые AI-инструменты проверяю на реальных задачах: сначала практика, затем выводы без магии и завышенных обещаний.',
  en: 'Outside product work, I have practiced combat sports from an early age and have a long-standing interest in cinema and art. I test new AI tools on real tasks first, then share conclusions without magic or inflated promises.',
};
