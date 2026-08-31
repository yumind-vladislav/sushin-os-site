import { careerContent } from '@/content/career-content';

export function CvDocument({ compact = false }: { compact?: boolean }) {
  return (
    <article className={compact ? 'cv-document is-compact' : 'cv-document'} lang="ru">
      <header className="cv-header" id="cv-top">
        <div>
          <p className="cv-kicker">PROJECT MANAGER · CV</p>
          <h1>Владислав Сушин</h1>
          <p className="cv-role">Project Manager</p>
        </div>
        <p className="cv-current">Актуально: {careerContent.actuality}</p>
      </header>

      <nav aria-label="Контакты Владислава" className="cv-contacts">
        {careerContent.contacts.map((contact) => (
          <a
            href={contact.href}
            key={contact.href}
            rel={contact.href.startsWith('http') ? 'noreferrer' : undefined}
            target={contact.href.startsWith('http') ? '_blank' : undefined}
          >
            {contact.label}
          </a>
        ))}
      </nav>

      <section id="profile">
        <h2>Профессиональный профиль</h2>
        <p>{careerContent.profile}</p>
      </section>

      <section id="experience">
        <h2>Опыт и проекты</h2>
        <div className="cv-experience-list">
          {careerContent.experience.map((experience) => (
            <article id={experience.id} key={experience.id}>
              <header>
                <div>
                  <h3>{experience.title}</h3>
                  <p>{experience.role}</p>
                </div>
                <time>{experience.period}</time>
              </header>
              <p className="cv-summary">{experience.summary}</p>
              <ul>
                {experience.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="skills">
        <h2>AI и технологии</h2>
        <ul>
          {careerContent.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </section>

      <div className="cv-closing-grid">
        <section id="education">
          <h2>Образование</h2>
          <p>
            <strong>{careerContent.education.institution}</strong>
            <br />
            {careerContent.education.program}
            <br />
            {careerContent.education.status}
          </p>
        </section>
        <section id="languages">
          <h2>Языки</h2>
          <ul>
            {careerContent.languages.map((language) => (
              <li key={language}>{language}</li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
