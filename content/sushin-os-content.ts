export type SushinFact = {
  id: string;
  text: string;
};

export const sushinFacts: SushinFact[] = [
  {
    id: 'viewport',
    text: 'Sushin OS занимает ровно один viewport. Страница не скроллится — скролл живёт внутри окон.',
  },
  {
    id: 'core-object',
    text: 'Random Fact — главный объект рабочего стола и самый быстрый способ начать исследование Sushin OS.',
  },
  {
    id: 'music-consent',
    text: 'Музыка здесь никогда не начнётся сама: центральная utility-капсула ждёт явного действия пользователя.',
  },
  {
    id: 'mobile-window',
    text: 'На мобильном метафора desktop сохраняется, но открытым остаётся только одно почти полноэкранное окно.',
  },
  {
    id: 'original-assets',
    text: 'Catalina задаёт память о материале и поведении, но иконки Sushin OS нарисованы заново и не копируют Apple assets.',
  },
  {
    id: 'content-gate',
    text: 'Личные факты появятся только после подтверждения Владислава. Пока этот слот проверяет механику без выдуманной биографии.',
  },
  {
    id: 'appearance',
    text: 'Appearance переключает Aqua и Dark Aqua и позволяет настроить яркость, контраст и интенсивность wallpaper.',
  },
  {
    id: 'local-time',
    text: 'Time Zone показывает локальные время, дату и часовой пояс посетителя автоматически.',
  },
  {
    id: 'drag',
    text: 'На desktop окна можно перетаскивать, не выпуская их заголовок за безопасные границы экрана.',
  },
  {
    id: 'focus',
    text: 'Клик по окну переводит его на передний план: активное окно получает новый z-index и более выраженную тень.',
  },
  {
    id: 'window-controls',
    text: 'Красная, жёлтая и зелёная кнопки закрывают, сворачивают и разворачивают окно — как ожидается от desktop-среды.',
  },
  {
    id: 'scroll-boundary',
    text: 'Длинный контент не двигает весь рабочий стол: прокрутка остаётся внутри конкретного окна.',
  },
  {
    id: 'cv-formats',
    text: 'CV Finder запланирован в трёх форматах: PDF, DOC и отдельная HTML-версия с предпросмотром.',
  },
  {
    id: 'projects-audit',
    text: 'Projects получит реальные GitHub-работы только после отдельного контент-аудита — без случайных репозиториев.',
  },
  {
    id: 'box-news',
    text: 'Box News задуман как text-first окно, а каждую публикацию можно будет открыть по отдельному индексируемому URL.',
  },
  {
    id: 'dock',
    text: 'Dock собирает три основных входа: About, Write to Me и What I Can Do. Остальное остаётся вторичным.',
  },
  {
    id: 'legal-fold',
    text: 'Privacy, cookies, terms и контакты будут спрятаны под загнутым углом Legal Fold, но останутся доступными с клавиатуры.',
  },
  {
    id: 'alternative-reality',
    text: 'Alternative Reality — скрытая lyrics/blog-сцена. Она живёт в Apple/app menu и не конкурирует с основным интерфейсом.',
  },
  {
    id: 'spotify',
    text: 'Следующая интеграция Music Utility — видимый Spotify Embed внутри компактной авторской капсулы.',
  },
  {
    id: 'localhost',
    text: 'Сейчас Sushin OS существует только локально: никакого production или публикации до отдельного решения.',
  },
];

export const vladislavProfile = {
  name: 'Vladislav Sushin',
  role: 'Project Manager in AI development',
  birthdayLabel: '31 MAY',
  ageLabel: 'YEAR TO CONFIRM',
  intro:
    'Фотография, биографический текст и год рождения ожидают подтверждения. Роль и структура окна уже зафиксированы.',
  contentStatus: [
    { label: 'ROLE', value: 'CONFIRMED' },
    { label: 'PHOTO', value: 'REQUIRED' },
    { label: 'BIO', value: 'REQUIRED' },
  ],
} as const;
