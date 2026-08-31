import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { sushinFacts, vladislavProfile } from '../content/sushin-os-content';

void describe('Sushin OS content baseline', () => {
  void it('keeps a complete, stable fact pool', () => {
    assert.equal(sushinFacts.length, 20);
    assert.equal(new Set(sushinFacts.map(({ id }) => id)).size, 20);
    assert.ok(sushinFacts.every(({ id, text }) => id.length > 0 && text.length > 0));
  });

  void it('keeps the confirmed public role', () => {
    assert.equal(vladislavProfile.role, 'Project Manager in AI development');
  });
});
