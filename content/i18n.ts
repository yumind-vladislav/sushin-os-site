export const supportedLocales = ['ru', 'en'] as const;

export type Locale = (typeof supportedLocales)[number];

export function isLocale(value: unknown): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function resolveLocale(
  languages: readonly string[],
  storedLocale?: string | null,
): Locale {
  if (isLocale(storedLocale)) return storedLocale;
  return languages.some((language) => language.toLowerCase().startsWith('ru'))
    ? 'ru'
    : 'en';
}

const ru = {
  localeName: 'RU',
  menus: {
    app: 'Владислав',
    file: 'Файл',
    view: 'Вид',
    window: 'Окно',
  },
  actions: {
    about: 'О Владиславе',
    randomFact: 'Random Fact',
    resetOs: 'Перезапустить Sushin OS',
    openFact: 'Открыть Random Fact',
    openProfile: 'Открыть Владислава',
    closeFront: 'Закрыть активное окно',
    resetDesktop: 'Сбросить рабочий стол',
    restoreAbout: 'Восстановить About',
    restoreFact: 'Восстановить Random Fact',
    nextFact: 'Следующий факт',
    choosingFact: 'Выбираем...',
    backToFacts: 'Вернуться к Random Fact',
    soundOff: 'Выключить звук',
    soundOn: 'Включить звук',
    closeWindow: 'Закрыть',
    minimizeWindow: 'Свернуть',
    maximizeWindow: 'Развернуть',
    restoreWindow: 'Восстановить',
  },
  controls: {
    osMenu: 'Меню Sushin OS',
    appearance: 'Оформление',
    wallpaper: 'Обои',
    aqua: 'Aqua',
    darkAqua: 'Dark Aqua',
    day: 'День',
    night: 'Ночь',
    switchToAqua: 'Включить Aqua',
    switchToDark: 'Включить Dark Aqua',
    language: 'Язык интерфейса',
  },
  music: {
    title: 'MUSIC UTILITY',
    loading: 'загружаем треки, будь готов',
  },
  desktop: {
    cv: 'CV',
    projects: 'Проекты',
    social: 'Социальные сети',
    profile: 'Владислав',
    news: 'Box News',
    write: 'Написать мне',
    skills: 'Что я умею',
    next: 'СКОРО',
    open: 'Открыть',
    wallpaperCredit: 'ВРЕМЕННЫЙ ЛОКАЛЬНЫЙ ФОН',
  },
  profile: {
    eyebrow: 'ПРОФИЛЬ · ПОДТВЕРЖДЕННЫЙ КОНТЕНТ',
    birthday: 'ДАТА РОЖДЕНИЯ',
    age: 'ВОЗРАСТ',
    status: 'СТАТУС',
    openToWork: 'OPEN TO WORK',
    languageNote: '',
  },
  states: {
    loadingTitle: 'Sushin OS запускается',
    loadingCopy: 'Подготавливаем рабочий стол и локальные данные.',
    errorTitle: 'Окно не открылось',
    errorCopy: 'Можно безопасно повторить попытку — ваши настройки останутся на устройстве.',
    retry: 'Повторить',
    notFoundCode: 'ОШИБКА 404',
    notFoundTitle: 'Такого объекта нет на рабочем столе',
    notFoundCopy: 'Ссылка могла устареть. Вернитесь в Sushin OS и откройте нужное окно оттуда.',
    home: 'Вернуться в Sushin OS',
    empty: 'Здесь пока нет опубликованных материалов.',
    unavailable: 'Сервис сейчас недоступен.',
    malformed: 'Материал не прошел проверку и временно скрыт.',
  },
} as const;

type WidenStrings<T> = T extends string
  ? string
  : { [Key in keyof T]: WidenStrings<T[Key]> };

export type UiDictionary = WidenStrings<typeof ru>;

const en: UiDictionary = {
  localeName: 'EN',
  menus: {
    app: 'Vladislav',
    file: 'File',
    view: 'View',
    window: 'Window',
  },
  actions: {
    about: 'About Vladislav',
    randomFact: 'Random Fact',
    resetOs: 'Reset Sushin OS',
    openFact: 'Open Random Fact',
    openProfile: 'Open Vladislav',
    closeFront: 'Close Front Window',
    resetDesktop: 'Reset Desktop',
    restoreAbout: 'Restore About',
    restoreFact: 'Restore Random Fact',
    nextFact: 'Next fact',
    choosingFact: 'Choosing...',
    backToFacts: 'Back to Random Fact',
    soundOff: 'Mute sound',
    soundOn: 'Enable sound',
    closeWindow: 'Close',
    minimizeWindow: 'Minimize',
    maximizeWindow: 'Maximize',
    restoreWindow: 'Restore',
  },
  controls: {
    osMenu: 'Sushin OS menu',
    appearance: 'Appearance',
    wallpaper: 'Wallpaper',
    aqua: 'Aqua',
    darkAqua: 'Dark Aqua',
    day: 'Day',
    night: 'Night',
    switchToAqua: 'Switch to Aqua',
    switchToDark: 'Switch to Dark Aqua',
    language: 'Interface language',
  },
  music: {
    title: 'MUSIC UTILITY',
    loading: 'loading tracks, be ready',
  },
  desktop: {
    cv: 'CV',
    projects: 'Projects',
    social: 'Social Media',
    profile: 'Vladislav',
    news: 'Box News',
    write: 'Write to Me',
    skills: 'What I Can Do',
    next: 'NEXT',
    open: 'Open',
    wallpaperCredit: 'TEMPORARY LOCAL WALLPAPER',
  },
  profile: {
    eyebrow: 'PROFILE · CONFIRMED CONTENT',
    birthday: 'DATE OF BIRTH',
    age: 'AGE',
    status: 'STATUS',
    openToWork: 'OPEN TO WORK',
    languageNote: '',
  },
  states: {
    loadingTitle: 'Sushin OS is starting',
    loadingCopy: 'Preparing the desktop and local data.',
    errorTitle: 'The window did not open',
    errorCopy: 'It is safe to try again — your preferences remain on this device.',
    retry: 'Try again',
    notFoundCode: 'ERROR 404',
    notFoundTitle: 'That object is not on the desktop',
    notFoundCopy: 'The link may be stale. Return to Sushin OS and open the window from there.',
    home: 'Return to Sushin OS',
    empty: 'There are no published materials here yet.',
    unavailable: 'The service is currently unavailable.',
    malformed: 'This item did not pass validation and is temporarily hidden.',
  },
};

export const dictionaries: Record<Locale, UiDictionary> = { ru, en };
