import { dictionaries, type Locale } from '@/content/i18n';

const projectNames = [
  'YUMIND',
  '@yumind_bot / Mini App',
  'YUMIND Reborn',
  'Crypto project',
  'Selected client work',
];

export function ProjectsPreviewPanel({ locale }: { locale: Locale }) {
  const labels = dictionaries[locale].career;
  return (
    <div className="projects-preview-panel">
      <small>CONFIRMED · 05</small>
      <h2>{labels.projectsTitle}</h2>
      <p>{labels.projectsCopy}</p>
      <ol>
        {projectNames.map((project, index) => (
          <li key={project}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{project}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}
