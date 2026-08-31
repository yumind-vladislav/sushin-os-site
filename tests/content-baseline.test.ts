import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveLocale } from '../content/i18n';
import { calculateAge, siteContent } from '../content/site-content';
import { sushinFacts } from '../content/sushin-os-content';

void describe('Sushin OS content baseline', () => {
  void it('keeps a complete, stable fact pool', () => {
    assert.equal(sushinFacts.length, 20);
    assert.equal(new Set(sushinFacts.map(({ id }) => id)).size, 20);
    assert.ok(sushinFacts.every(({ id, text }) => id.length > 0 && text.length > 0));
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
});
