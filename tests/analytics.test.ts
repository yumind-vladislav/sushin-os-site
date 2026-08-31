import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  allowsAnalytics,
  parseMetricaCounterId,
  trackAnalyticsEvent,
} from '../lib/analytics';

void describe('privacy-first analytics adapter', () => {
  void it('accepts only positive numeric public counter ids', () => {
    assert.equal(parseMetricaCounterId('12345678'), 12345678);
    assert.equal(parseMetricaCounterId('0'), null);
    assert.equal(parseMetricaCounterId('-1'), null);
    assert.equal(parseMetricaCounterId('counter'), null);
    assert.equal(parseMetricaCounterId(undefined), null);
  });

  void it('honors standard do-not-track values', () => {
    assert.equal(allowsAnalytics('1'), false);
    assert.equal(allowsAnalytics('yes'), false);
    assert.equal(allowsAnalytics('0'), true);
    assert.equal(allowsAnalytics(null), true);
  });

  void it('is a safe no-op without a configured browser counter', () => {
    assert.equal(trackAnalyticsEvent('profile_open', {}), false);
    assert.equal(
      trackAnalyticsEvent('contact_click', { channel: 'telegram' }),
      false,
    );
  });
});
