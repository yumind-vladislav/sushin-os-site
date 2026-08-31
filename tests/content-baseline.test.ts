import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SocialPanel } from '../components/sushin-os/social-panel';
import { careerContent, socialChannels } from '../content/career-content';
import { resolveLocale } from '../content/i18n';
import { calculateAge, siteContent } from '../content/site-content';
import { sushinFacts } from '../content/sushin-os-content';
import { capabilityGroups, projectCards } from '../content/work-content';
import { wallpaperForLocalHour } from '../lib/appearance';
import { nextFactIndex } from '../lib/random-fact';

const productBrief = readFileSync(
  new URL('../docs/PRODUCT_BRIEF.md', import.meta.url),
  'utf8',
);

void describe('Sushin OS content baseline', () => {
  void it('keeps a complete, stable fact pool', () => {
    assert.equal(sushinFacts.length, 20);
    assert.equal(new Set(sushinFacts.map(({ id }) => id)).size, 20);
    assert.ok(
      sushinFacts.every(
        ({ id, text }) => id.length > 0 && text.ru.length > 0 && text.en.length > 0,
      ),
    );
  });

  void it('keeps the confirmed public role', () => {
    assert.equal(
      siteContent.profile.role.en,
      'Project Manager in AI development',
    );
    assert.equal(siteContent.schemaVersion, 1);
  });

  void it('resolves browser locale unless a manual choice exists', () => {
    assert.equal(resolveLocale(['ru-RU']), 'ru');
    assert.equal(resolveLocale(['de-DE', 'en-US']), 'en');
    assert.equal(resolveLocale(['ru-RU'], 'en'), 'en');
  });

  void it('calculates age around the birthday boundary', () => {
    assert.equal(
      calculateAge(siteContent.profile.dateOfBirth, new Date('2026-05-30T12:00:00Z')),
      25,
    );
    assert.equal(
      calculateAge(siteContent.profile.dateOfBirth, new Date('2026-05-31T12:00:00Z')),
      26,
    );
  });

  void it('switches the automatic wallpaper at 04:00 and 17:00 local time', () => {
    assert.equal(wallpaperForLocalHour(3), 'night');
    assert.equal(wallpaperForLocalHour(4), 'day');
    assert.equal(wallpaperForLocalHour(16), 'day');
    assert.equal(wallpaperForLocalHour(17), 'night');
  });

  void it('keeps the approved career conversion exact', () => {
    assert.equal(careerContent.actuality, 'август 2026');
    assert.equal(
      careerContent.education.status,
      'неоконченное высшее, 2017–2021',
    );
    assert.equal(careerContent.contacts[0]?.label, 'vladislav.sushin@gmail.com');
    assert.equal(careerContent.experience[0]?.title, '@yumind_bot / Mini App');
  });

  void it('keeps the approved social order and direct-contact surface', () => {
    assert.deepEqual(
      socialChannels.map(({ id }) => id),
      [
        'telegram-personal',
        'telegram-blog',
        'email',
        'instagram',
        'x',
        'linkedin',
        'github',
      ],
    );
    const displayLabels = [
      't.me/takoikakvse1',
      't.me/yumind_reborn',
      'vladislav.sushin@gmail.com',
      '@takoikakvse',
      '@takoikakvse1',
      '/in/vladislav-sushyn',
      'yumind-vladislav',
    ];
    assert.deepEqual(
      socialChannels.map(({ displayLabel }) => displayLabel),
      displayLabels,
    );
    const socialHtml = renderToStaticMarkup(
      createElement(SocialPanel, { locale: 'en' }),
    );
    for (const displayLabel of displayLabels) {
      assert.ok(socialHtml.includes(displayLabel));
      assert.ok(productBrief.includes(`\`${displayLabel}\``));
    }
    assert.ok(socialChannels.every(({ href }) => !href.startsWith('/')));
  });

  void it('selects a different fact for every random boundary', () => {
    for (let current = 0; current < sushinFacts.length; current += 1) {
      for (const random of [0, 0.25, 0.5, 0.75, 0.999999]) {
        const next = nextFactIndex(sushinFacts.length, current, random);
        assert.notEqual(next, current);
        assert.ok(next >= 0 && next < sushinFacts.length);
      }
    }
  });

  void it('keeps five approved project cards and exact metric language', () => {
    assert.deepEqual(
      projectCards.map(({ id }) => id),
      ['yumind', 'yumind-bot', 'yumind-reborn', 'crypto', 'selected-client-work'],
    );
    const bot = projectCards.find(({ id }) => id === 'yumind-bot');
    assert.match(bot?.proof.en ?? '', /96 user accounts plus 1 administrator/);
    assert.match(bot?.proof.en ?? '', /not MAU/);
    assert.match(bot?.proof.en ?? '', /7 August 2026, 14:33 Moscow time/);
    const client = projectCards.find(({ id }) => id === 'selected-client-work');
    assert.equal(client?.links.length, 0);
    assert.match(client?.proof.en ?? '', /not published/);
  });

  void it('separates seven capability areas from their tool stack', () => {
    assert.equal(capabilityGroups.length, 7);
    assert.deepEqual(
      capabilityGroups.map(({ id }) => id),
      [
        'project-delivery',
        'product-work',
        'ai-systems',
        'development-workflow',
        'knowledge-systems',
        'research',
        'creative-work',
      ],
    );
  });
});
