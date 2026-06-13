// Disposable / throwaway email domain blocklist.
// Ported from the original optin.js. ~160 entries, covers the vast majority of
// services that bots use to bypass single opt-in.

const DISPOSABLE_DOMAINS = new Set([
  '0-mail.com','10minutemail.com','10minutemail.net','20minutemail.com',
  '33mail.com','anonbox.net','byom.de','deadaddress.com','despam.it',
  'disposableinbox.com','dispostable.com','dontsendmespam.de','e4ward.com',
  'emailondeck.com','fakeinbox.com','fastmail.fm','filzmail.com',
  'getairmail.com','getnada.com','grr.la','guerrillamail.biz','guerrillamail.com',
  'guerrillamail.de','guerrillamail.info','guerrillamail.net','guerrillamail.org',
  'guerrillamailblock.com','harakirimail.com','hidemail.de','imgof.com',
  'inboxalias.com','inboxbear.com','jetable.org','kasmail.com','kurzepost.de',
  'lookugly.com','mail-temporaire.fr','mail.bccto.me','mail.com','mailcatch.com',
  'maildrop.cc','maileater.com','mailexpire.com','mailforspam.com','mailfree.org',
  'mailguard.me','mailimate.com','mailin8r.com','mailinater.com','mailinator.com',
  'mailinator.net','mailinator.org','mailinator2.com','mailmoat.com','mailnesia.com',
  'mailnull.com','mailshell.com','mailsiphon.com','mailtemp.info','mailtothis.com',
  'mailzilla.com','mailzilla.org','meltmail.com','mintemail.com','mohmal.com',
  'mt2014.com','mt2015.com','mytemp.email','mytrashmail.com','no-spam.ws',
  'noclickemail.com','nomail.xl.cx','nospam.ze.tc','notmailinator.com',
  'objectmail.com','obobbo.com','oneoffemail.com','onewaymail.com','opayq.com',
  'pjjkp.com','privacy.net','proxymail.eu','rcpt.at','recursor.net','sendspamhere.com',
  'sharklasers.com','shieldedmail.com','shieldemail.com','shitmail.me','shitware.nl',
  'sneakemail.com','sofimail.com','sogetthis.com','spam4.me','spambob.com','spambog.com',
  'spambog.de','spambog.net','spambog.ru','spambox.us','spamcero.com','spamday.com',
  'spamex.com','spamfree24.com','spamfree24.de','spamfree24.eu','spamfree24.info',
  'spamfree24.net','spamfree24.org','spamgourmet.com','spamhole.com','spamify.com',
  'spaml.com','spaml.de','spammotel.com','spamspot.com','spamthis.co.uk','spamthisplease.com',
  'speed.1s.fr','superrito.com','sweetxxx.de','tafmail.com','teleworm.com','teleworm.us',
  'temp-mail.org','temp-mail.ru','tempemail.com','tempemail.net','tempinbox.co.uk',
  'tempinbox.com','tempmail.eu','tempmaildemo.com','tempmailer.com','tempmailer.de',
  'tempomail.fr','tempsky.com','temporarily.de','temporarioemail.com.br','temporaryemail.net',
  'temporaryforwarding.com','temporaryinbox.com','temporarymailaddress.com','tempthe.net',
  'thanksnospam.info','thankyou2010.com','thelimestones.com','thisisnotmyrealemail.com',
  'throwam.com','throwawayemailaddress.com','throwawaymail.com','tilien.com','tradermail.info',
  'trash-mail.at','trash-mail.com','trash-mail.de','trash2009.com','trashemail.de',
  'trashmail.at','trashmail.com','trashmail.de','trashmail.me','trashmail.net','trashmail.org',
  'trashmail.ws','trashmailer.com','trashymail.com','tyldd.com','uggsrock.com','wegwerfadresse.de',
  'wegwerfemail.de','wegwerfmail.de','wegwerfmail.info','wegwerfmail.net','wegwerfmail.org',
  'wh4f.org','whyspam.me','willhackforfood.biz','willselfdestruct.com','winemaven.info',
  'wronghead.com','www.e4ward.com','www.gishpuppy.com','www.mailinator.com','wuzup.net',
  'wuzupmail.net','xagloo.com','xemaps.com','xents.com','xmaily.com','xoxy.net','yep.it',
  'yopmail.com','yopmail.fr','yopmail.net','yuurok.com','zehnminutenmail.de','zippymail.in',
  'zoemail.org','zomg.info','yahoo.co.kr.fakemail.com','dropmail.me','spamgourmet.net',
  'spamgourmet.org','spam.la','tempr.email','linshiyou.com','mvrht.net','mvrht.com',
  'temail.com','tempinbox.xyz','vmailing.info',
]);

function isPlausibleEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 6 || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

function isDisposable(email) {
  const at = email.indexOf('@');
  if (at < 0) return false;
  return DISPOSABLE_DOMAINS.has(email.slice(at + 1).toLowerCase());
}

module.exports = { isPlausibleEmail, isDisposable };
