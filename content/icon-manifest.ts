export type IconKind =
  | 'vladislav'
  | 'cv'
  | 'projects'
  | 'facts'
  | 'news'
  | 'social'
  | 'about'
  | 'write'
  | 'skills';

export type IconDirectionId = 'system' | 'editorial' | 'instrument';

export type IconDefinition = {
  id: IconKind;
  label: string;
  role: string;
};

export type IconDirection = {
  id: IconDirectionId;
  number: string;
  title: string;
  shortTitle: string;
  mood: string;
  principle: string;
  risk: string;
  recommended?: boolean;
  selected?: boolean;
};

export const iconDefinitions: IconDefinition[] = [
  { id: 'vladislav', label: 'Vladislav', role: 'Profile / identity' },
  { id: 'cv', label: 'CV', role: 'Documents' },
  { id: 'projects', label: 'Projects', role: 'Built work' },
  { id: 'facts', label: 'Random Fact', role: 'Core interaction' },
  { id: 'news', label: 'Box News', role: 'Owned media' },
  { id: 'social', label: 'Social Media', role: 'Channels' },
  { id: 'about', label: 'About', role: 'Dock / profile' },
  { id: 'write', label: 'Write', role: 'Dock / contact' },
  { id: 'skills', label: 'Skills', role: 'Dock / capabilities' },
];

export const iconDirections: IconDirection[] = [
  {
    id: 'system',
    number: 'A',
    title: 'Catalina Object Fidelity',
    shortTitle: 'System Objects',
    mood: 'Знакомо · насыщенно · утилитарно',
    principle:
      'Каждое действие представлено отдельным физическим объектом: документом, терминалом, компасом, газетой или адресной книгой.',
    risk:
      'Самое понятное направление, но без авторских деталей может выглядеть как аккуратная реконструкция чужой системы.',
    selected: true,
  },
  {
    id: 'editorial',
    number: 'B',
    title: 'Personal Editorial Objects',
    shortTitle: 'Editorial Objects',
    mood: 'Лично · редакционно · собрано руками',
    principle:
      'Catalina-глубина соединяется с рабочими артефактами Владислава: папками, штампами, заметками, схемами и Box News.',
    risk:
      'Нужно удержать материальность и не свалиться в декоративный скрапбук.',
    recommended: true,
  },
  {
    id: 'instrument',
    number: 'C',
    title: 'Instrument Panel',
    shortTitle: 'Instruments',
    mood: 'Точно · темно · технологично',
    principle:
      'Иконки выглядят как самостоятельные измерительные приборы: радар, консоль, передатчик, гироскоп и модульная панель.',
    risk:
      'Сильнее всего работает ночью, но может увести образ в sci-fi и generic AI, если добавить лишнее свечение.',
  },
];

export const auditNotes = [
  'Текущий CSS-набор смешивает плоские и объёмные объекты.',
  'Dock-иконки заметно слабее и проще desktop-набора.',
  'Детализация распадается при 32–48 px.',
  'Оптический вес между кругом, документом и терминалом не выровнен.',
  'У набора пока нет собственного авторского признака Sushin OS.',
];

export const approvalCriteria = [
  'Узнаваемый силуэт без подписи',
  'Сопоставимый вес в Dock-size',
  'Свет сверху-слева',
  'Детали выживают при 32 px',
  'Нет общей squircle-рамки',
  'Нет копирования Apple assets',
];
