const axios = require('axios');

const DEVPOST_BASE = 'https://devpost.com/api/hackathons';

exports.fetchDevpostHackathons = async ({ page = 1, status = 'open', search = '' } = {}) => {
  try {
    const { data } = await axios.get(DEVPOST_BASE, {
      params: { page, status, search, order_by: 'deadline' },
      headers: { 'Accept': 'application/json' },
      timeout: 10000
    });

    return (data.hackathons || []).map(h => ({
      id: `devpost_${h.id}`,
      source: 'Devpost',
      title: h.title,
      url: h.url,
      thumbnailUrl: h.thumbnail_url,
      deadline: h.submission_period_dates,
      prize: h.prize_amount,
      participants: h.registrations_count,
      themes: h.themes?.map(t => t.name) || [],
      eligibility: h.eligibility,
      location: h.displayed_location?.location || 'Online',
      status: h.open_state
    }));
  } catch (err) {
    console.error('[Devpost] Fetch error:', err.message);
    return [];
  }
};
