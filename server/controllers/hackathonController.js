const { fetchDevpostHackathons } = require('../services/devpostService');
const { fetchUnstopHackathons } = require('../services/unstopService');

let cache = { data: null, fetchedAt: null };
const CACHE_TTL = 15 * 60 * 1000;

exports.getHackathons = async (req, res) => {
  try {
    const { page = 1, search = '', source = 'all', domain = '' } = req.query;

    if (cache.data && (Date.now() - cache.fetchedAt) < CACHE_TTL) {
      return res.json({
        hackathons: filterHackathons(cache.data, { search, source, domain }),
        sources: { devpost: true, unstop: true },
        cached: true
      });
    }

    // Fetch from both sources in parallel
    const [devpostResult, unstopResult] = await Promise.allSettled([
      fetchDevpostHackathons({ page, search }),
      fetchUnstopHackathons({ page, search })
    ]);

    const devpost = devpostResult.status === 'fulfilled' ? devpostResult.value : [];
    const unstop = unstopResult.status === 'fulfilled' ? unstopResult.value : [];

    if (!devpost.length) {
      console.warn('[Hackathons] Devpost returned no results');
    }
    if (!unstop.length) {
      console.warn('[Hackathons] Unstop returned no results');
    }

    // Merge and deduplicate
    const merged = deduplicateByTitle([...devpost, ...unstop]);

    cache = { data: merged, fetchedAt: Date.now() };

    res.json({
      hackathons: filterHackathons(merged, { search, source, domain }),
      sources: {
        devpost: devpost.length > 0,
        unstop: unstop.length > 0
      },
      cached: false
    });

  } catch (err) {
    console.error('[Hackathons] Controller error:', err.message);
    res.status(500).json({ message: 'Failed to fetch hackathons', error: err.message });
  }
};

exports.getHackathonById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check cache first
    if (cache.data) {
      const found = cache.data.find(h => h.id === id);
      if (found) return res.json(found);
    }

    res.status(404).json({ message: 'Hackathon not found. Try refreshing the list.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch hackathon', error: err.message });
  }
};

exports.clearCache = async (req, res) => {
  cache = { data: null, fetchedAt: null };
  res.json({ message: 'Cache cleared successfully' });
};

function deduplicateByTitle(hackathons) {
  const seen = new Set();
  return hackathons.filter(h => {
    const key = h.title.toLowerCase().replace(/\s+/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function filterHackathons(hackathons, { search, source, domain }) {
  return hackathons.filter(h => {
    if (source !== 'all' && h.source.toLowerCase() !== source.toLowerCase()) return false;
    if (search && !h.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (domain && !h.themes?.some(t => t.toLowerCase().includes(domain.toLowerCase()))) return false;
    return true;
  });
}