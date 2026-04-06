const twilio = require('twilio');

let client = null;

function getClient() {
  if (!client && process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch (err) {
      console.error('[Twilio] Client init failed:', err.message);
    }
  }
  return client;
}

exports.sendOTP = async (phone) => {
  const c = getClient();
  if (!c) {
    console.error('[Twilio] Not configured. TWILIO_SID:', !!process.env.TWILIO_SID, 'TWILIO_AUTH_TOKEN:', !!process.env.TWILIO_AUTH_TOKEN);
    throw new Error('Twilio not configured. Use Dev Login instead.');
  }
  try {
    const result = await c.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({ to: phone, channel: 'sms' });
    console.log(`[Twilio] OTP sent to ${phone}, status: ${result.status}`);
    return result;
  } catch (err) {
    console.error(`[Twilio] Send OTP failed for ${phone}:`, err.message);
    if (err.code === 20003) throw new Error('Twilio credentials expired or invalid. Use Dev Login.');
    if (err.code === 60200) throw new Error('Invalid phone number format. Use +91XXXXXXXXXX.');
    if (err.code === 60203) throw new Error('Max OTP attempts reached. Wait 10 minutes.');
    throw new Error(`OTP delivery failed: ${err.message}. Use Dev Login instead.`);
  }
};

exports.verifyOTP = async (phone, code) => {
  const c = getClient();
  if (!c) throw new Error('Twilio not configured. Use Dev Login instead.');
  try {
    const result = await c.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });
    return result.status === 'approved';
  } catch (err) {
    console.error(`[Twilio] Verify OTP failed for ${phone}:`, err.message);
    if (err.code === 20404) throw new Error('OTP expired. Request a new one.');
    throw new Error(`Verification failed: ${err.message}`);
  }
};
