// SurvivalKitBounceHandler — receives SES bounce/complaint events via SNS,
// auto-prunes the subscriber store so sender reputation stays healthy.

const subscribers = require('./lib/subscribers');

exports.handler = async (event) => {
  for (const record of event.Records || []) {
    if (record.EventSource !== 'aws:sns') continue;
    let payload;
    try {
      payload = JSON.parse(record.Sns.Message);
    } catch (err) {
      console.error('SNS Message not JSON', err);
      continue;
    }

    const eventType = payload.eventType || payload.notificationType;
    if (eventType === 'Bounce') {
      // Permanent bounces are dead addresses. Transient bounces SES retries —
      // ignore so we don't punish a temporary mailbox-full / rate-limit.
      const bounceType = payload.bounce?.bounceType;
      if (bounceType !== 'Permanent') {
        console.log('Ignoring non-permanent bounce', bounceType);
        continue;
      }
      const recipients = payload.bounce?.bouncedRecipients || [];
      for (const r of recipients) {
        await prune(r.emailAddress, { complaint: false, reason: 'bounce' });
      }
    } else if (eventType === 'Complaint') {
      // Spam-marked: harshest signal. Never email this address again, even on re-opt-in.
      const recipients = payload.complaint?.complainedRecipients || [];
      for (const r of recipients) {
        await prune(r.emailAddress, { complaint: true, reason: 'complaint' });
      }
    } else if (eventType === 'Delivery') {
      // Informational only — no state change.
    } else {
      console.warn('Unknown SES event type', eventType);
    }
  }
  return { statusCode: 200 };
};

async function prune(emailAddress, { complaint, reason }) {
  if (!emailAddress) return;
  try {
    const result = await subscribers.markUnsubscribed(emailAddress, { complaint });
    if (result) {
      console.log(`Pruned ${emailAddress} (${reason})`);
    } else {
      console.log(`No subscriber found for ${emailAddress} (${reason}) — no-op`);
    }
  } catch (err) {
    console.error(`Failed to prune ${emailAddress}`, err);
  }
}
