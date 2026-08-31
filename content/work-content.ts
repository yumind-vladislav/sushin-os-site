import type { LocalizedText } from './site-content';

export type ProjectId =
  | 'yumind'
  | 'yumind-bot'
  | 'yumind-reborn'
  | 'crypto'
  | 'selected-client-work';

export type ProjectCard = {
  id: ProjectId;
  title: string;
  period: LocalizedText;
  role: LocalizedText;
  challenge: LocalizedText;
  contribution: readonly LocalizedText[];
  proof: LocalizedText;
  status: LocalizedText;
  links: readonly { label: string; href: string }[];
};

export const projectCards: readonly ProjectCard[] = [
  {
    id: 'yumind',
    title: 'YUMIND',
    period: { ru: 'май — декабрь 2025', en: 'May — December 2025' },
    role: {
      ru: 'Сооснователь; функции Project Manager и Product Manager',
      en: 'Cofounder; Project Manager and Product Manager functions',
    },
    challenge: {
      ru: 'Создать стартап для автоматизации отдела продаж в команде из четырёх сооснователей без формально назначенных должностей.',
      en: 'Build a sales-department automation startup with four cofounders and no formally assigned titles.',
    },
    contribution: [
      {
        ru: 'Документация, декомпозиция, координация команды и контроль сроков и зависимостей.',
        en: 'Documentation, decomposition, team coordination, and control of deadlines and dependencies.',
      },
      {
        ru: 'Перенос задач из Telegram в Notion, CustDev, переговоры и работа над продуктовым видением.',
        en: 'Moving tasks from Telegram to Notion, CustDev, negotiations, and product-vision work.',
      },
      {
        ru: 'Тестирование AI-инструментов и помощь команде с их внедрением.',
        en: 'Testing AI tools and helping the team adopt them.',
      },
    ],
    proof: {
      ru: 'Работа команды и решений стала прозрачнее после переноса управления задачами в Notion; процессы CustDev и фиксации результатов были стандартизированы.',
      en: 'Task management became transparent after the move to Notion; CustDev and result-capture processes were standardized.',
    },
    status: {
      ru: 'Проектный период завершён в декабре 2025 года.',
      en: 'The project period ended in December 2025.',
    },
    links: [],
  },
  {
    id: 'yumind-bot',
    title: '@yumind_bot / Mini App',
    period: { ru: 'май — июль 2026', en: 'May — July 2026' },
    role: {
      ru: 'Автор продукта; функции Project Manager и Product Manager',
      en: 'Product creator; Project Manager and Product Manager functions',
    },
    challenge: {
      ru: 'Довести AI-продукт с собственной системой памяти агента от идеи до production и первых пользователей.',
      en: 'Take an AI product with a custom agent-memory system from idea to production and first users.',
    },
    contribution: [
      {
        ru: 'Продуктовая логика, техническая реализация, тестирование, запуск и сопровождение.',
        en: 'Product logic, technical implementation, testing, launch, and support.',
      },
      {
        ru: 'Проверка AI-моделей и подходов к памяти; собственная production-система памяти AI-агента.',
        en: 'Testing AI models and memory approaches; a custom production AI-agent memory system.',
      },
    ],
    proof: {
      ru: 'От идеи до первых пользователей — 2 недели. На 7 августа 2026, 14:33 МСК: доступ у 96 пользовательских аккаунтов и 1 администратора (не MAU); 70 уникальных аккаунтов подтвердили использование, 46 использовали Mini App, 36 создавали заметки, существовало 274 неудалённые заметки, 22 аккаунта были активны за предыдущие 30 дней. Телеметрия Mini App — с 12 июня, счётчик заметок — с 9 мая 2026.',
      en: 'Idea to first users: 2 weeks. As of 7 August 2026, 14:33 Moscow time: 96 user accounts plus 1 administrator had access (not MAU); 70 unique accounts confirmed use, 46 used the Mini App, 36 authored notes, 274 non-deleted notes existed, and 22 accounts were active during the previous 30 days. Mini App telemetry began on 12 June and the note counter on 9 May 2026.',
    },
    status: {
      ru: 'Продуктовый этап завершён; экосистема YUMIND Reborn продолжает развиваться.',
      en: 'The product stage is complete; the YUMIND Reborn ecosystem continues.',
    },
    links: [{ label: '@yumind_bot', href: 'https://t.me/yumind_bot' }],
  },
  {
    id: 'yumind-reborn',
    title: 'YUMIND Reborn',
    period: { ru: '2026 — настоящее время', en: '2026 — present' },
    role: {
      ru: 'Автор зонтичной экосистемы личного бренда',
      en: 'Creator of the personal-brand umbrella ecosystem',
    },
    challenge: {
      ru: 'Развивать единую экосистему, в которой pet-проекты становятся отдельными ветками продукта.',
      en: 'Develop one ecosystem where pet projects become separate product branches.',
    },
    contribution: [
      {
        ru: 'Связывает AI-эксперименты, production-заметки и самостоятельные проектные ветки.',
        en: 'Connects AI experiments, production notes, and independent project branches.',
      },
      {
        ru: 'Разделяет жизненный цикл отдельных продуктов и продолжающееся развитие экосистемы.',
        en: 'Separates individual product life cycles from the ecosystem’s continued development.',
      },
    ],
    proof: {
      ru: 'Этап @yumind_bot / Mini App завершился в июле 2026 года, но не являлся завершением YUMIND Reborn.',
      en: 'The @yumind_bot / Mini App stage ended in July 2026, but that did not end YUMIND Reborn.',
    },
    status: { ru: 'Продолжается.', en: 'Ongoing.' },
    links: [
      { label: 'Telegram · YUMIND Reborn', href: 'https://t.me/yumind_reborn' },
    ],
  },
  {
    id: 'crypto',
    title: 'Crypto project',
    period: { ru: 'май — ноябрь 2024', en: 'May — November 2024' },
    role: {
      ru: 'Сооснователь и координатор проекта',
      en: 'Cofounder and project coordinator',
    },
    challenge: {
      ru: 'Запустить проект командой из трёх человек без стартовых инвестиций.',
      en: 'Launch a project with a three-person team and no initial investment.',
    },
    contribution: [
      {
        ru: 'Распределение зон ответственности, задач и приоритетов.',
        en: 'Allocation of responsibilities, tasks, and priorities.',
      },
      {
        ru: 'Мониторинг рынка и участие в решении о своевременном завершении проекта.',
        en: 'Market monitoring and participation in the decision to close the project at the right time.',
      },
    ],
    proof: {
      ru: 'За шесть месяцев команда получила совокупный доход 20 000 USD без стартовых вложений.',
      en: 'Over six months, the team earned a combined USD 20,000 without initial investment.',
    },
    status: {
      ru: 'Завершён в ноябре 2024 года; публичное название не раскрывается.',
      en: 'Closed in November 2024; the public name remains undisclosed.',
    },
    links: [],
  },
  {
    id: 'selected-client-work',
    title: 'Selected client work',
    period: { ru: 'Подтверждённые клиентские работы', en: 'Confirmed client work' },
    role: {
      ru: 'Разработка и автоматизация в рамках клиентских задач',
      en: 'Development and automation within client-defined scopes',
    },
    challenge: {
      ru: 'Реализовать четыре разных продукта, сохраняя конфиденциальность клиентов и не публикуя неподтверждённые результаты.',
      en: 'Deliver four different products while preserving client confidentiality and withholding unverified results.',
    },
    contribution: [
      {
        ru: 'Telegram-бот для платного курса инфлюенсера и сайт-визитка для блогера.',
        en: 'A Telegram bot for an influencer’s paid course and a business-card site for a blogger.',
      },
      {
        ru: 'Сайт цветочного магазина и автоматизированная 18+ система генерации контента.',
        en: 'A flower-shop website and an automated 18+ content-generation system.',
      },
    ],
    proof: {
      ru: 'Все четыре проекта закрыты по инициативе клиентов. Метрики, имена, логотипы, отзывы, скриншоты и клиентские ассеты не публикуются.',
      en: 'All four projects were closed at the clients’ initiative. Metrics, names, logos, testimonials, screenshots, and client assets are not published.',
    },
    status: {
      ru: 'Закрыты клиентами; карточка намеренно анонимна.',
      en: 'Closed by clients; the card is intentionally anonymized.',
    },
    links: [],
  },
];

export type CapabilityGroup = {
  id: string;
  title: LocalizedText;
  items: readonly LocalizedText[];
};

export const capabilityGroups: readonly CapabilityGroup[] = [
  {
    id: 'project-delivery',
    title: { ru: 'Project Delivery', en: 'Project Delivery' },
    items: [
      { ru: 'Документация, декомпозиция, сроки и зависимости', en: 'Documentation, decomposition, deadlines, and dependencies' },
      { ru: 'Прототип → тестирование → production → поддержка', en: 'Prototype → testing → production → support' },
    ],
  },
  {
    id: 'product-work',
    title: { ru: 'Product Work', en: 'Product Work' },
    items: [
      { ru: 'Project и Product Management', en: 'Project and Product Management' },
      { ru: 'CustDev, product discovery и Telegram-продукты', en: 'CustDev, product discovery, and Telegram products' },
    ],
  },
  {
    id: 'ai-systems',
    title: { ru: 'AI Systems', en: 'AI Systems' },
    items: [
      { ru: 'AI-агенты, автоматизация и системы памяти', en: 'AI agents, automation, and memory systems' },
    ],
  },
  {
    id: 'development-workflow',
    title: { ru: 'Development Workflow', en: 'Development Workflow' },
    items: [
      { ru: 'Codex, Claude Code, Cursor, MCP, plugins и skills', en: 'Codex, Claude Code, Cursor, MCP, plugins, and skills' },
    ],
  },
  {
    id: 'knowledge-systems',
    title: { ru: 'Knowledge Systems', en: 'Knowledge Systems' },
    items: [{ ru: 'Notion-системы и работа со знаниями', en: 'Notion systems and knowledge workflows' }],
  },
  {
    id: 'research',
    title: { ru: 'Research', en: 'Research' },
    items: [{ ru: 'Исследование аудитории и анализ рынка', en: 'Audience research and market analysis' }],
  },
  {
    id: 'creative-work',
    title: { ru: 'AI-assisted Creative Work', en: 'AI-assisted Creative Work' },
    items: [
      { ru: 'Дизайн с AI и social-media workflows', en: 'Design with AI and social-media workflows' },
    ],
  },
];
