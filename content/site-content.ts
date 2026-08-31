import type { Locale } from './i18n';

export type LocalizedText = Record<Locale, string>;

type SiteContent = {
  schemaVersion: 1;
  profile: {
    name: LocalizedText;
    role: LocalizedText;
    dateOfBirth: `${number}-${number}-${number}`;
    availability: LocalizedText;
    summary: LocalizedText;
  };
};

export const siteContent = {
  schemaVersion: 1,
  profile: {
    name: {
      ru: 'Владислав Сушин',
      en: 'Vladislav Sushin',
    },
    role: {
      ru: 'Project Manager в AI-разработке',
      en: 'Project Manager in AI development',
    },
    dateOfBirth: '2000-05-31',
    availability: {
      ru: 'Открыт к предложениям',
      en: 'Open to work',
    },
    summary: {
      ru: 'Я Project Manager в AI-разработке: довожу AI-продукты от идеи до первых пользователей, выстраиваю понятные процессы и помогаю командам внедрять новые инструменты в реальную работу. Не продаю магию — сначала проверяю решения на практике, затем честно показываю результат и ограничения.',
      en: 'I am a Project Manager in AI development. I take AI products from an idea to their first users, build clear delivery processes, and help teams bring new tools into real work. I test solutions in practice first, then communicate both results and limitations honestly.',
    },
  },
} as const satisfies SiteContent;

export function calculateAge(dateOfBirth: string, now = new Date()): number {
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  let age = now.getUTCFullYear() - year;
  const birthdayHasPassed =
    now.getUTCMonth() + 1 > month ||
    (now.getUTCMonth() + 1 === month && now.getUTCDate() >= day);
  if (!birthdayHasPassed) age -= 1;
  return age;
}
