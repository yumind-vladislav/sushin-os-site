'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { dictionaries, type Locale } from '@/content/i18n';
import { trackAnalyticsEvent } from '@/lib/analytics';

const playlistUrl =
  'https://open.spotify.com/playlist/37i9dQZF1EIURi4iOpY7wW?si=5b25bf57f4d840ae';
const embedUrl =
  'https://open.spotify.com/embed/playlist/37i9dQZF1EIURi4iOpY7wW?utm_source=generator&theme=0';
const issueUrl =
  'https://github.com/yumind-vladislav/sushin-os-site/issues/new?title=Spotify%20embed%20is%20blocked&body=The%20Spotify%20playlist%20did%20not%20load%20in%20Sushin%20OS.%20No%20private%20data%20is%20included.';

type MusicState = 'idle' | 'loading' | 'ready' | 'blocked';

export function MusicUtility({ locale }: { locale: Locale }) {
  const [state, setState] = useState<MusicState>('idle');
  const blockedTracked = useRef(false);
  const labels = dictionaries[locale].music;

  const showBlockedState = useCallback(() => {
    if (!blockedTracked.current) {
      trackAnalyticsEvent('music_blocked', {});
      blockedTracked.current = true;
    }
    setState('blocked');
  }, []);

  useEffect(() => {
    if (state !== 'loading') return;
    const timeout = window.setTimeout(showBlockedState, 10_000);
    return () => window.clearTimeout(timeout);
  }, [showBlockedState, state]);

  const activate = () => {
    if (state === 'idle' || state === 'blocked') {
      blockedTracked.current = false;
      trackAnalyticsEvent('music_start', {});
      setState('loading');
    }
  };

  return (
    <div className={`music-utility is-${state}`}>
      <button
        aria-controls={state === 'idle' ? undefined : 'music-popover'}
        aria-expanded={state !== 'idle'}
        aria-label={labels.activate}
        className="music-capsule"
        onClick={activate}
        type="button"
      >
        <span className="capsule-play" aria-hidden="true">
          {state === 'loading' ? '···' : '▶'}
        </span>
        <span className="capsule-copy">
          <b>{labels.title}</b>
          <small>
            {state === 'idle'
              ? labels.loading
              : state === 'blocked'
                ? labels.blockedTitle
                : labels[state]}
          </small>
        </span>
        <span className="capsule-eq" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>

      {state !== 'idle' && (
        <section aria-live="polite" className="music-popover" id="music-popover">
          {state === 'blocked' ? (
            <div className="music-blocked-state">
              <strong>{labels.blockedTitle}</strong>
              <p>{labels.blockedCopy}</p>
              <div>
                <button onClick={activate} type="button">
                  {labels.retry}
                </button>
                <a href={playlistUrl} rel="noreferrer" target="_blank">
                  {labels.openPlaylist}
                </a>
                <a href={issueUrl} rel="noreferrer" target="_blank">
                  {labels.reportIssue}
                </a>
              </div>
            </div>
          ) : (
            <>
              {state === 'loading' && (
                <span className="music-loading-state">{labels.loadingEmbed}</span>
              )}
              <iframe
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                height="152"
                loading="eager"
                onError={showBlockedState}
                onLoad={() => setState('ready')}
                src={embedUrl}
                title={labels.frameTitle}
                width="100%"
              />
              {state === 'ready' && (
                <button
                  className="music-help-trigger"
                  onClick={showBlockedState}
                  type="button"
                >
                  {labels.blockedHelp}
                </button>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
