import {
  approvalCriteria,
  auditNotes,
  iconDefinitions,
  iconDirections,
} from '@/content/icon-manifest';
import { StudyIcon } from './study-icon';

export function IconStudySheet() {
  return (
    <main className="icon-sheet">
      <header className="sheet-header">
        <a className="sheet-brand" href="#top" aria-label="К началу component sheet">
          <span aria-hidden="true" className="brand-orbit" />
          <span>SUSHIN OS</span>
        </a>
        <nav aria-label="Направления иконок" className="sheet-nav">
          {iconDirections.map((direction) => (
            <a href={`#direction-${direction.id}`} key={direction.id}>
              {direction.number}
            </a>
          ))}
        </nav>
        <span className="sheet-status">ICON GATE · 01</span>
      </header>

      <section className="sheet-hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">COMPONENT SHEET · LOCALHOST REVIEW</span>
          <h1>
            ОДНА СИСТЕМА.
            <br />
            <em>ТРИ ХАРАКТЕРА.</em>
          </h1>
          <p>
            Сравниваем не цветовые вариации, а три разных ответа на один вопрос:
            какими должны быть иконки персональной Catalina-системы Владислава.
          </p>
        </div>
        <aside className="hero-audit" aria-labelledby="audit-title">
          <span className="panel-index">00</span>
          <h2 id="audit-title">Что исправляем</h2>
          <ol>
            {auditNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="criteria-strip" aria-label="Критерии утверждения">
        {approvalCriteria.map((criterion, index) => (
          <span key={criterion}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            {criterion}
          </span>
        ))}
      </section>

      {iconDirections.map((direction) => (
        <section
          className={`direction direction-${direction.id}`}
          id={`direction-${direction.id}`}
          key={direction.id}
        >
          <header className="direction-header">
            <div className="direction-mark" aria-hidden="true">
              {direction.number}
            </div>
            <div>
              <span className="eyebrow">DIRECTION {direction.number}</span>
              <h2>{direction.title}</h2>
              <p className="direction-mood">{direction.mood}</p>
            </div>
            <div className="direction-rationale">
              {direction.selected && <b>ВЫБРАНО · 29 AUG 2026</b>}
              {!direction.selected && direction.recommended && <b>ПЕРВОНАЧАЛЬНАЯ РЕКОМЕНДАЦИЯ</b>}
              <p>{direction.principle}</p>
              <small>Риск: {direction.risk}</small>
            </div>
          </header>

          <ul className="icon-gallery">
            {iconDefinitions.map((icon, index) => (
              <li className="icon-card" key={icon.id}>
                <div className="icon-stage">
                  <StudyIcon direction={direction.id} kind={icon.id} />
                </div>
                <div className="icon-meta">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{icon.label}</h3>
                    <p>{icon.role}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="scale-tests">
            <article className="dock-test">
              <header>
                <span>DOCK TEST · 48 PX</span>
                <b>{direction.shortTitle}</b>
              </header>
              <div className="wallpaper-stage">
                <div className="mini-menu">
                  <b>Vladislav</b>
                  <span>Sat 15:51</span>
                </div>
                <div className="study-dock">
                  {iconDefinitions.map((icon) => (
                    <span className="dock-item" key={icon.id} title={icon.label}>
                      <StudyIcon direction={direction.id} kind={icon.id} size={48} />
                    </span>
                  ))}
                </div>
                <span className="reference-only">CATALINA WALLPAPER · LOCAL REFERENCE ONLY</span>
              </div>
            </article>

            <article className="silhouette-test">
              <header>
                <span>SILHOUETTE · 32 PX</span>
                <b>Без цвета и подписи</b>
              </header>
              <div className="silhouette-row">
                {iconDefinitions.map((icon) => (
                  <span key={icon.id} title={icon.label}>
                    <StudyIcon
                      className="is-silhouette"
                      direction={direction.id}
                      kind={icon.id}
                      size={32}
                    />
                  </span>
                ))}
              </div>
              <p>
                Если объекты перестают различаться здесь, насыщенность и тень уже не спасут
                набор в настоящем Dock.
              </p>
            </article>
          </div>
        </section>
      ))}

      <section className="decision-gate" id="decision">
        <div>
          <span className="eyebrow">CHECKPOINT · DIRECTION LOCKED</span>
          <h2>Выбран A: ясные системные объекты Catalina.</h2>
        </div>
        <ol>
          <li className="is-recommended">
            <b>A</b>
            Выбран Владиславом · 29 августа 2026
          </li>
          <li>
            <b>B</b>
            Рассмотрен · не выбран
          </li>
          <li>
            <b>C</b>
            Самый технологичный и ночной
          </li>
        </ol>
        <p>
          Решение дизайн-гейта: <strong>A</strong> становится production icon layer. Разные
          силуэты, насыщенный цвет и свет сверху-слева сохраняются; Apple assets не
          копируются.
        </p>
      </section>

      <footer className="sheet-footer">
        <span>SUSHIN OS · CATALINA MEMORY</span>
        <span>SVG-FIRST · NO APPLE ASSETS COPIED</span>
        <a href="#top">В начало</a>
      </footer>
    </main>
  );
}
