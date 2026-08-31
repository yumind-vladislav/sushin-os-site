import { ExternalLink } from 'lucide-react';
import { dictionaries, type Locale } from '@/content/i18n';
import { projectCards } from '@/content/work-content';
import { trackAnalyticsEvent } from '@/lib/analytics';

export function ProjectsPanel({ locale }: { locale: Locale }) {
  const labels = dictionaries[locale].work;

  return (
    <div className="projects-panel">
      <header className="projects-panel-intro">
        <small>CONFIRMED CASES · 01–05</small>
        <h2>{dictionaries[locale].career.projectsTitle}</h2>
        <p>{dictionaries[locale].career.projectsCopy}</p>
      </header>

      <div className="project-card-list">
        {projectCards.map((project, index) => (
          <article className="project-card" id={`project-${project.id}`} key={project.id}>
            <header>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{project.title}</h3>
                <time>{project.period[locale]}</time>
              </div>
            </header>

            <dl>
              <div>
                <dt>{labels.role}</dt>
                <dd>{project.role[locale]}</dd>
              </div>
              <div>
                <dt>{labels.challenge}</dt>
                <dd>{project.challenge[locale]}</dd>
              </div>
              <div>
                <dt>{labels.contribution}</dt>
                <dd>
                  <ul>
                    {project.contribution.map((item) => (
                      <li key={item.en}>{item[locale]}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>{labels.proof}</dt>
                <dd>{project.proof[locale]}</dd>
              </div>
              <div>
                <dt>{labels.status}</dt>
                <dd>{project.status[locale]}</dd>
              </div>
            </dl>

            <footer>
              <strong>{labels.links}</strong>
              {project.links.length ? (
                <div>
                  {project.links.map((link) => (
                    <a
                      href={link.href}
                      key={link.href}
                      onClick={() =>
                        trackAnalyticsEvent('project_open', {
                          project_id: project.id,
                        })
                      }
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                      <ExternalLink aria-hidden="true" />
                    </a>
                  ))}
                </div>
              ) : (
                <span>{labels.noLinks}</span>
              )}
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
