// Shared region resolver and lookup tables.
//
// Region matching is NOT distance-based. A member and a clinician "match" when
// they share the same US state, the same Canadian province, or (for everyone
// else) the same country. One canonical `region_code` per profile/clinician
// makes the analytics aggregation a single indexed GROUP BY.
//
// Code scheme:
//   - US states  : ISO-3166-2 code   e.g. "US-CA"
//   - CA provinces : ISO-3166-2 code e.g. "CA-ON"
//   - Other countries : ISO-3166-1 alpha-2 e.g. "GB", "AU", "DE"

export const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota',
  'Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon',
  'Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah',
  'Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

export const US_ABBR_TO_STATE = {
  'al':'Alabama','ak':'Alaska','az':'Arizona','ar':'Arkansas','ca':'California','co':'Colorado',
  'ct':'Connecticut','de':'Delaware','dc':'District of Columbia','fl':'Florida','ga':'Georgia',
  'hi':'Hawaii','id':'Idaho','il':'Illinois','in':'Indiana','ia':'Iowa','ks':'Kansas',
  'ky':'Kentucky','la':'Louisiana','me':'Maine','md':'Maryland','ma':'Massachusetts',
  'mi':'Michigan','mn':'Minnesota','ms':'Mississippi','mo':'Missouri','mt':'Montana',
  'ne':'Nebraska','nv':'Nevada','nh':'New Hampshire','nj':'New Jersey','nm':'New Mexico',
  'ny':'New York','nc':'North Carolina','nd':'North Dakota','oh':'Ohio','ok':'Oklahoma',
  'or':'Oregon','pa':'Pennsylvania','ri':'Rhode Island','sc':'South Carolina','sd':'South Dakota',
  'tn':'Tennessee','tx':'Texas','ut':'Utah','vt':'Vermont','va':'Virginia','wa':'Washington',
  'wv':'West Virginia','wi':'Wisconsin','wy':'Wyoming',
};

// Inverse map: full state name → 2-letter abbreviation (lowercase keys).
const US_STATE_TO_ABBR = Object.fromEntries(
  Object.entries(US_ABBR_TO_STATE).map(([abbr, name]) => [name.toLowerCase(), abbr.toUpperCase()])
);

export const CA_PROVINCES = [
  'Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador',
  'Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan',
  'Northwest Territories','Nunavut','Yukon',
];

export const CA_ABBR = {
  'ab':'Alberta','bc':'British Columbia','mb':'Manitoba','nb':'New Brunswick',
  'nl':'Newfoundland and Labrador','ns':'Nova Scotia','on':'Ontario',
  'pe':'Prince Edward Island','qc':'Quebec','sk':'Saskatchewan',
  'nt':'Northwest Territories','nu':'Nunavut','yt':'Yukon',
};

const CA_PROVINCE_TO_ABBR = Object.fromEntries(
  Object.entries(CA_ABBR).map(([abbr, name]) => [name.toLowerCase(), abbr.toUpperCase()])
);

// Country name → ISO-3166-1 alpha-2. Extend as needed — unresolved countries
// fall back to `null` and bucket under "Unknown" in the analytics panel.
export const COUNTRY_NAME_TO_CODE = {
  'united kingdom':'GB','england':'GB','scotland':'GB','wales':'GB','northern ireland':'GB','uk':'GB',
  'ireland':'IE',
  'australia':'AU',
  'new zealand':'NZ',
  'denmark':'DK',
  'norway':'NO',
  'sweden':'SE',
  'finland':'FI',
  'netherlands':'NL','holland':'NL',
  'germany':'DE',
  'france':'FR',
  'italy':'IT',
  'poland':'PL',
  'spain':'ES',
  'portugal':'PT',
  'switzerland':'CH',
  'austria':'AT',
  'belgium':'BE',
  'greece':'GR',
  'czech republic':'CZ','czechia':'CZ',
  'romania':'RO',
  'hungary':'HU',
  'south africa':'ZA',
  'india':'IN',
};

// ISO-3166-1 alpha-2 code → canonical display name. Keep in sync with above.
export const COUNTRY_CODE_TO_NAME = {
  'GB':'United Kingdom','IE':'Ireland','AU':'Australia','NZ':'New Zealand',
  'DK':'Denmark','NO':'Norway','SE':'Sweden','FI':'Finland','NL':'Netherlands',
  'DE':'Germany','FR':'France','IT':'Italy','PL':'Poland','ES':'Spain','PT':'Portugal',
  'CH':'Switzerland','AT':'Austria','BE':'Belgium','GR':'Greece',
  'CZ':'Czech Republic','RO':'Romania','HU':'Hungary','ZA':'South Africa','IN':'India',
};

// Flat country list for dropdown consumers that previously hardcoded this set.
export const COUNTRIES = [
  'Australia','Austria','Belgium','Czech Republic','Denmark','Finland','France','Germany',
  'Greece','Hungary','India','Ireland','Italy','Netherlands','New Zealand','Norway','Poland',
  'Portugal','Romania','South Africa','Spain','Sweden','Switzerland','United Kingdom',
];

/**
 * Resolve a user profile's IP-derived metadata into a canonical region.
 *
 * @param {object} input
 * @param {string|null} input.ipLocation - Vercel-formatted "City, RegionCode, CountryCode".
 * @param {string|null} input.location   - Optional user-entered location text (takes lower priority than IP).
 * @returns {{ code: string, label: string } | null}
 */
export function resolveRegion({ ipLocation, location } = {}) {
  const ip = (ipLocation || '').trim();
  const loc = (location || '').trim();
  if (!ip && !loc) return null;

  const ipParts = ip.split(',').map((s) => s.trim()).filter(Boolean);
  const combined = `${loc} ${ip}`.toLowerCase();
  const lastPart = (ipParts[ipParts.length - 1] || '').toLowerCase();

  // --- Country classification ---
  const isUS = lastPart === 'us' || lastPart === 'usa' || combined.includes('united states');
  const isCA = !isUS && (lastPart === 'ca' || combined.includes('canada'));

  // --- US: resolve to state ---
  if (isUS) {
    // Try any ip part as a 2-letter abbreviation (but skip the trailing "US" itself).
    for (const part of ipParts) {
      const code = part.toLowerCase();
      if (code !== 'us' && code !== 'usa' && US_ABBR_TO_STATE[code]) {
        const label = US_ABBR_TO_STATE[code];
        return { code: `US-${code.toUpperCase()}`, label };
      }
    }
    // Try full state names anywhere in the combined text.
    for (const st of US_STATES) {
      if (combined.includes(st.toLowerCase())) {
        return { code: `US-${US_STATE_TO_ABBR[st.toLowerCase()]}`, label: st };
      }
    }
    // Try state abbreviations with word boundary.
    for (const [abbr, full] of Object.entries(US_ABBR_TO_STATE)) {
      const re = new RegExp(`\\b${abbr}\\b`, 'i');
      if (re.test(loc) || re.test(ip)) {
        return { code: `US-${abbr.toUpperCase()}`, label: full };
      }
    }
    return { code: 'US', label: 'USA (unspecified)' };
  }

  // --- Canada: resolve to province ---
  if (isCA) {
    for (const part of ipParts) {
      const code = part.toLowerCase();
      if (code !== 'ca' && CA_ABBR[code]) {
        return { code: `CA-${code.toUpperCase()}`, label: CA_ABBR[code] };
      }
    }
    for (const prov of CA_PROVINCES) {
      if (combined.includes(prov.toLowerCase())) {
        return { code: `CA-${CA_PROVINCE_TO_ABBR[prov.toLowerCase()]}`, label: prov };
      }
    }
    for (const [abbr, full] of Object.entries(CA_ABBR)) {
      const re = new RegExp(`\\b${abbr}\\b`, 'i');
      if (re.test(loc) || re.test(ip)) {
        return { code: `CA-${abbr.toUpperCase()}`, label: full };
      }
    }
    return { code: 'CA', label: 'Canada (unspecified)' };
  }

  // --- Other countries: resolve to ISO alpha-2 ---
  // First try the trailing ip part as a country code.
  if (lastPart && lastPart.length === 2 && COUNTRY_CODE_TO_NAME[lastPart.toUpperCase()]) {
    const code = lastPart.toUpperCase();
    return { code, label: COUNTRY_CODE_TO_NAME[code] };
  }
  // Then try full country names in the combined text.
  for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
    if (combined.includes(name)) {
      return { code, label: COUNTRY_CODE_TO_NAME[code] || name };
    }
  }
  // Last resort: if the trailing ip part looks like a 2-letter code we don't know,
  // return it raw so the admin can spot new countries.
  if (lastPart && lastPart.length === 2 && /^[a-z]{2}$/.test(lastPart)) {
    return { code: lastPart.toUpperCase(), label: lastPart.toUpperCase() };
  }
  return null;
}

/**
 * Back-compat shim for existing admin pages that treat the resolved region as a
 * plain display string. Also honors `assigned_location` as an explicit manual
 * override, matching the prior `deriveRegion` contract in match-requests.
 *
 * @param {object} req - A match-request / profile-shaped record.
 * @returns {string|null}
 */
export function resolveRegionLegacy(req) {
  if (!req) return null;
  if (req.assigned_location) return req.assigned_location;
  const resolved = resolveRegion({
    ipLocation: req.profile?.ip_location,
    location: req.profile?.location,
  });
  return resolved ? resolved.label : null;
}
