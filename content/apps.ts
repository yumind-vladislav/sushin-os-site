import type { IconKind } from './icon-manifest';
import type { LocalizedText } from './site-content';

export const appIds = [
  'fact',
  'vladislav',
  'cv',
  'projects',
  'social',
  'contact',
  'skills',
  'news',
  'stickies',
  'calendar',
  'calculator',
  'minesweeper',
  'synth',
  'paint',
  'ipod',
  'winamp',
  'videos',
] as const;

export type AppId = (typeof appIds)[number];

export function isAppId(value: unknown): value is AppId {
  return appIds.includes(value as AppId);
}

export type MenuAction =
  | { type: 'command'; command: string }
  | { type: 'open'; app: AppId }
  | { type: 'href'; href: string; download?: boolean; external?: boolean }
  | { type: 'minimize' }
  | { type: 'close' };

export type MenuItem =
  | { label: LocalizedText; action: MenuAction; shortcut?: string }
  | 'separator';

export type AppMenu = { id: string; label: LocalizedText; items: MenuItem[] };

export type AppDefinition = {
  id: AppId;
  icon: IconKind;
  title: LocalizedText;
  /** Extra words Spotlight and the assistant match against. */
  keywords: string[];
  /** One line the assistant can use to describe the app. */
  summary: LocalizedText;
  position: { x: number; y: number };
  menus: AppMenu[];
};

const text = (ru: string, en: string): LocalizedText => ({ ru, en });
const command = (command: string): MenuAction => ({ type: 'command', command });

const fileMenu = (...items: MenuItem[]): AppMenu => ({
  id: 'file',
  label: text('Файл', 'File'),
  items: [
    ...items,
    ...(items.length ? (['separator'] as MenuItem[]) : []),
    { label: text('Свернуть', 'Minimize'), action: { type: 'minimize' }, shortcut: '⌘M' },
    { label: text('Закрыть окно', 'Close window'), action: { type: 'close' }, shortcut: '⌘W' },
  ],
});

export const appDefinitions: Record<AppId, AppDefinition> = {
  fact: {
    id: 'fact',
    icon: 'facts',
    title: text('Random Fact', 'Random Fact'),
    keywords: ['факт', 'случайный', 'fact', 'random'],
    summary: text(
      'Случайный подтвержденный факт о Владиславе.',
      'A random confirmed fact about Vladislav.',
    ),
    position: { x: 356, y: 96 },
    menus: [
      fileMenu(),
      {
        id: 'fact',
        label: text('Факт', 'Fact'),
        items: [
          { label: text('Следующий факт', 'Next fact'), action: command('next'), shortcut: '⌘R' },
          { label: text('Звук вкл/выкл', 'Toggle sound'), action: command('toggle-sound') },
        ],
      },
    ],
  },
  vladislav: {
    id: 'vladislav',
    icon: 'vladislav',
    title: text('Владислав', 'Vladislav'),
    keywords: ['обо мне', 'профиль', 'about', 'profile', 'сушин'],
    summary: text(
      'Профиль: роль, возраст, статус и короткая хронология.',
      'Profile: role, age, status and a short timeline.',
    ),
    position: { x: 126, y: 138 },
    menus: [
      fileMenu(),
      {
        id: 'go',
        label: text('Переход', 'Go'),
        items: [
          { label: text('CV', 'CV'), action: { type: 'open', app: 'cv' } },
          { label: text('Проекты', 'Projects'), action: { type: 'open', app: 'projects' } },
          { label: text('Написать мне', 'Write to me'), action: { type: 'open', app: 'contact' } },
        ],
      },
    ],
  },
  cv: {
    id: 'cv',
    icon: 'cv',
    title: text('CV Finder', 'CV Finder'),
    keywords: ['резюме', 'cv', 'resume', 'pdf', 'docx'],
    summary: text(
      'Резюме Project Manager: HTML, PDF и DOCX.',
      'Project Manager CV: HTML, PDF and DOCX.',
    ),
    position: { x: 178, y: 70 },
    menus: [
      fileMenu(
        {
          label: text('Скачать PDF', 'Download PDF'),
          action: { type: 'href', href: '/cv/vladislav-sushin-project-manager-2026.pdf', download: true },
        },
        {
          label: text('Скачать DOCX', 'Download DOCX'),
          action: { type: 'href', href: '/cv/vladislav-sushin-project-manager-2026.docx', download: true },
        },
        {
          label: text('Открыть HTML-версию', 'Open HTML version'),
          action: { type: 'href', href: '/cv/' },
        },
      ),
    ],
  },
  projects: {
    id: 'projects',
    icon: 'projects',
    title: text('Проекты', 'Projects'),
    keywords: ['проекты', 'кейсы', 'projects', 'yumind', 'работы'],
    summary: text(
      'Пять подтвержденных проектов: роль, вклад, доказательства.',
      'Five confirmed projects: role, contribution, proof.',
    ),
    position: { x: 220, y: 110 },
    menus: [fileMenu()],
  },
  social: {
    id: 'social',
    icon: 'social',
    title: text('Социальные сети', 'Social Media'),
    keywords: ['соцсети', 'telegram', 'instagram', 'social', 'каналы'],
    summary: text('Семь каналов Владислава.', 'Vladislav’s seven channels.'),
    position: { x: 270, y: 84 },
    menus: [fileMenu()],
  },
  contact: {
    id: 'contact',
    icon: 'write',
    title: text('Написать мне', 'Write to me'),
    keywords: ['контакты', 'написать', 'почта', 'contact', 'email', 'telegram'],
    summary: text('Telegram и почта для связи.', 'Telegram and email for contact.'),
    position: { x: 318, y: 150 },
    menus: [fileMenu()],
  },
  skills: {
    id: 'skills',
    icon: 'skills',
    title: text('Что я умею', 'What I can do'),
    keywords: ['навыки', 'умения', 'skills', 'capabilities', 'стек'],
    summary: text('Семь рабочих направлений и стек.', 'Seven working areas and the stack.'),
    position: { x: 240, y: 92 },
    menus: [fileMenu()],
  },
  news: {
    id: 'news',
    icon: 'news',
    title: text('Box News', 'Box News'),
    keywords: ['новости', 'блог', 'news', 'статьи', 'telegram'],
    summary: text('Архив публикаций Box News.', 'The Box News archive.'),
    position: { x: 194, y: 72 },
    menus: [fileMenu()],
  },
  stickies: {
    id: 'stickies',
    icon: 'stickies',
    title: text('Записки', 'Stickies'),
    keywords: ['записки', 'заметки', 'стикеры', 'notes', 'stickies'],
    summary: text(
      'Желтые записки. Сохраняются в браузере.',
      'Yellow notes, saved in the browser.',
    ),
    position: { x: 300, y: 80 },
    menus: [
      fileMenu({ label: text('Новая записка', 'New note'), action: command('new'), shortcut: '⌘N' }),
      {
        id: 'note',
        label: text('Записка', 'Note'),
        items: [
          { label: text('Удалить текущую', 'Delete current'), action: command('delete') },
          'separator',
          { label: text('Желтая', 'Yellow'), action: command('color:yellow') },
          { label: text('Голубая', 'Blue'), action: command('color:blue') },
          { label: text('Зеленая', 'Green'), action: command('color:green') },
          { label: text('Розовая', 'Pink'), action: command('color:pink') },
        ],
      },
    ],
  },
  calendar: {
    id: 'calendar',
    icon: 'calendar',
    title: text('Календарь', 'Calendar'),
    keywords: ['календарь', 'дата', 'события', 'calendar', 'events'],
    summary: text(
      'Месячный календарь с личными событиями в браузере.',
      'A month calendar with personal events stored in the browser.',
    ),
    position: { x: 260, y: 64 },
    menus: [
      fileMenu({ label: text('Новое событие', 'New event'), action: command('new-event'), shortcut: '⌘N' }),
      {
        id: 'go',
        label: text('Переход', 'Go'),
        items: [
          { label: text('Сегодня', 'Today'), action: command('today'), shortcut: '⌘T' },
          { label: text('Предыдущий месяц', 'Previous month'), action: command('prev') },
          { label: text('Следующий месяц', 'Next month'), action: command('next') },
        ],
      },
    ],
  },
  calculator: {
    id: 'calculator',
    icon: 'calculator',
    title: text('Калькулятор', 'Calculator'),
    keywords: ['калькулятор', 'посчитать', 'calculator', 'math'],
    summary: text('Обычный калькулятор, работает с клавиатуры.', 'A basic calculator with keyboard input.'),
    position: { x: 420, y: 90 },
    menus: [
      fileMenu(),
      {
        id: 'edit',
        label: text('Правка', 'Edit'),
        items: [
          { label: text('Скопировать результат', 'Copy result'), action: command('copy'), shortcut: '⌘C' },
          { label: text('Очистить', 'Clear'), action: command('clear'), shortcut: 'Esc' },
        ],
      },
    ],
  },
  minesweeper: {
    id: 'minesweeper',
    icon: 'minesweeper',
    title: text('Сапер', 'Minesweeper'),
    keywords: ['сапер', 'игра', 'мины', 'minesweeper', 'game'],
    summary: text('Классический «Сапер» 9×9, 10 мин.', 'Classic 9×9 Minesweeper with 10 mines.'),
    position: { x: 380, y: 70 },
    menus: [
      fileMenu(),
      {
        id: 'game',
        label: text('Игра', 'Game'),
        items: [
          { label: text('Новая игра', 'New game'), action: command('new'), shortcut: 'F2' },
          'separator',
          { label: text('Новичок 9×9', 'Beginner 9×9'), action: command('level:beginner') },
          { label: text('Любитель 16×16', 'Intermediate 16×16'), action: command('level:intermediate') },
        ],
      },
    ],
  },
  synth: {
    id: 'synth',
    icon: 'synth',
    title: text('Синтезатор', 'Synth'),
    keywords: ['синтезатор', 'музыка', 'клавиши', 'synth', 'piano'],
    summary: text(
      'Синтезатор на две октавы: играется мышкой и клавишами A–K.',
      'A two-octave synth: play with the mouse or keys A–K.',
    ),
    position: { x: 200, y: 120 },
    menus: [
      fileMenu(),
      {
        id: 'wave',
        label: text('Волна', 'Wave'),
        items: [
          { label: text('Синус', 'Sine'), action: command('wave:sine') },
          { label: text('Квадрат', 'Square'), action: command('wave:square') },
          { label: text('Пила', 'Sawtooth'), action: command('wave:sawtooth') },
          { label: text('Треугольник', 'Triangle'), action: command('wave:triangle') },
        ],
      },
      {
        id: 'octave',
        label: text('Октава', 'Octave'),
        items: [
          { label: text('Выше', 'Up'), action: command('octave:up'), shortcut: 'X' },
          { label: text('Ниже', 'Down'), action: command('octave:down'), shortcut: 'Z' },
        ],
      },
    ],
  },
  paint: {
    id: 'paint',
    icon: 'paint',
    title: text('Рисование', 'Paint'),
    keywords: ['рисование', 'рисовать', 'paint', 'draw', 'холст'],
    summary: text(
      'Растровая рисовалка: кисть, ластик, заливка, сохранение в PNG.',
      'A bitmap editor: brush, eraser, fill, PNG export.',
    ),
    position: { x: 150, y: 60 },
    menus: [
      fileMenu(
        { label: text('Новый холст', 'New canvas'), action: command('clear') },
        { label: text('Сохранить PNG', 'Save PNG'), action: command('save'), shortcut: '⌘S' },
      ),
      {
        id: 'edit',
        label: text('Правка', 'Edit'),
        items: [{ label: text('Отменить', 'Undo'), action: command('undo'), shortcut: '⌘Z' }],
      },
      {
        id: 'tools',
        label: text('Инструменты', 'Tools'),
        items: [
          { label: text('Карандаш', 'Pencil'), action: command('tool:pencil') },
          { label: text('Кисть', 'Brush'), action: command('tool:brush') },
          { label: text('Ластик', 'Eraser'), action: command('tool:eraser') },
          { label: text('Заливка', 'Fill'), action: command('tool:fill') },
        ],
      },
    ],
  },
  ipod: {
    id: 'ipod',
    icon: 'ipod',
    title: text('iPod', 'iPod'),
    keywords: ['ipod', 'музыка', 'плеер', 'music', 'песни'],
    summary: text('Плеер в виде iPod с колесом прокрутки.', 'A music player shaped like an iPod.'),
    position: { x: 520, y: 70 },
    menus: [
      fileMenu(),
      {
        id: 'controls',
        label: text('Управление', 'Controls'),
        items: [
          { label: text('Играть / пауза', 'Play / pause'), action: command('toggle'), shortcut: 'Space' },
          { label: text('Следующий трек', 'Next track'), action: command('next') },
          { label: text('Предыдущий трек', 'Previous track'), action: command('prev') },
        ],
      },
    ],
  },
  winamp: {
    id: 'winamp',
    icon: 'winamp',
    title: text('Winamp', 'Winamp'),
    keywords: ['winamp', 'музыка', 'плеер', 'mp3', 'music'],
    summary: text('Классический медиаплеер Winamp.', 'The classic Winamp media player.'),
    position: { x: 480, y: 140 },
    menus: [
      fileMenu(),
      {
        id: 'controls',
        label: text('Управление', 'Controls'),
        items: [
          { label: text('Играть / пауза', 'Play / pause'), action: command('toggle'), shortcut: 'C' },
          { label: text('Следующий трек', 'Next track'), action: command('next'), shortcut: 'B' },
          { label: text('Предыдущий трек', 'Previous track'), action: command('prev'), shortcut: 'Z' },
        ],
      },
    ],
  },
  videos: {
    id: 'videos',
    icon: 'videos',
    title: text('Видео', 'Videos'),
    keywords: ['видео', 'youtube', 'videos', 'кино', 'ролики'],
    summary: text('Видеоплеер с плейлистом YouTube.', 'A video player with a YouTube playlist.'),
    position: { x: 240, y: 76 },
    menus: [
      fileMenu(),
      {
        id: 'controls',
        label: text('Управление', 'Controls'),
        items: [
          { label: text('Играть / пауза', 'Play / pause'), action: command('toggle') },
          { label: text('Следующее видео', 'Next video'), action: command('next') },
          { label: text('Предыдущее видео', 'Previous video'), action: command('prev') },
        ],
      },
    ],
  },
};

/** Personal content lives on the desktop; small utilities live in the Dock. */
export const dockApps: readonly AppId[] = [
  'stickies',
  'calendar',
  'calculator',
  'paint',
  'synth',
  'minesweeper',
  'ipod',
  'winamp',
  'videos',
];
