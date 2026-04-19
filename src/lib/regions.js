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

// ISO-3166-1 alpha-2 code → canonical display name. Full ISO list (249 codes)
// so nothing gets dropped. The resolver also has a raw-2-letter-code fallback
// for future codes we miss.
export const COUNTRY_CODE_TO_NAME = {
  'AD':'Andorra','AE':'United Arab Emirates','AF':'Afghanistan','AG':'Antigua and Barbuda',
  'AI':'Anguilla','AL':'Albania','AM':'Armenia','AO':'Angola','AQ':'Antarctica','AR':'Argentina',
  'AS':'American Samoa','AT':'Austria','AU':'Australia','AW':'Aruba','AX':'Åland Islands','AZ':'Azerbaijan',
  'BA':'Bosnia and Herzegovina','BB':'Barbados','BD':'Bangladesh','BE':'Belgium','BF':'Burkina Faso',
  'BG':'Bulgaria','BH':'Bahrain','BI':'Burundi','BJ':'Benin','BL':'Saint Barthélemy','BM':'Bermuda',
  'BN':'Brunei','BO':'Bolivia','BQ':'Caribbean Netherlands','BR':'Brazil','BS':'Bahamas','BT':'Bhutan',
  'BV':'Bouvet Island','BW':'Botswana','BY':'Belarus','BZ':'Belize',
  'CC':'Cocos (Keeling) Islands','CD':'DR Congo','CF':'Central African Republic','CG':'Republic of Congo',
  'CH':'Switzerland','CI':'Ivory Coast','CK':'Cook Islands','CL':'Chile','CM':'Cameroon','CN':'China',
  'CO':'Colombia','CR':'Costa Rica','CU':'Cuba','CV':'Cape Verde','CW':'Curaçao','CX':'Christmas Island',
  'CY':'Cyprus','CZ':'Czech Republic',
  'DE':'Germany','DJ':'Djibouti','DK':'Denmark','DM':'Dominica','DO':'Dominican Republic','DZ':'Algeria',
  'EC':'Ecuador','EE':'Estonia','EG':'Egypt','EH':'Western Sahara','ER':'Eritrea','ES':'Spain','ET':'Ethiopia',
  'FI':'Finland','FJ':'Fiji','FK':'Falkland Islands','FM':'Micronesia','FO':'Faroe Islands','FR':'France',
  'GA':'Gabon','GB':'United Kingdom','GD':'Grenada','GE':'Georgia','GF':'French Guiana','GG':'Guernsey',
  'GH':'Ghana','GI':'Gibraltar','GL':'Greenland','GM':'Gambia','GN':'Guinea','GP':'Guadeloupe',
  'GQ':'Equatorial Guinea','GR':'Greece','GS':'South Georgia','GT':'Guatemala','GU':'Guam','GW':'Guinea-Bissau',
  'GY':'Guyana',
  'HK':'Hong Kong','HM':'Heard & McDonald Islands','HN':'Honduras','HR':'Croatia','HT':'Haiti','HU':'Hungary',
  'ID':'Indonesia','IE':'Ireland','IL':'Israel','IM':'Isle of Man','IN':'India','IO':'British Indian Ocean Territory',
  'IQ':'Iraq','IR':'Iran','IS':'Iceland','IT':'Italy',
  'JE':'Jersey','JM':'Jamaica','JO':'Jordan','JP':'Japan',
  'KE':'Kenya','KG':'Kyrgyzstan','KH':'Cambodia','KI':'Kiribati','KM':'Comoros','KN':'Saint Kitts and Nevis',
  'KP':'North Korea','KR':'South Korea','KW':'Kuwait','KY':'Cayman Islands','KZ':'Kazakhstan',
  'LA':'Laos','LB':'Lebanon','LC':'Saint Lucia','LI':'Liechtenstein','LK':'Sri Lanka','LR':'Liberia',
  'LS':'Lesotho','LT':'Lithuania','LU':'Luxembourg','LV':'Latvia','LY':'Libya',
  'MA':'Morocco','MC':'Monaco','MD':'Moldova','ME':'Montenegro','MF':'Saint Martin','MG':'Madagascar',
  'MH':'Marshall Islands','MK':'North Macedonia','ML':'Mali','MM':'Myanmar','MN':'Mongolia','MO':'Macao',
  'MP':'Northern Mariana Islands','MQ':'Martinique','MR':'Mauritania','MS':'Montserrat','MT':'Malta','MU':'Mauritius',
  'MV':'Maldives','MW':'Malawi','MX':'Mexico','MY':'Malaysia','MZ':'Mozambique',
  'NA':'Namibia','NC':'New Caledonia','NE':'Niger','NF':'Norfolk Island','NG':'Nigeria','NI':'Nicaragua',
  'NL':'Netherlands','NO':'Norway','NP':'Nepal','NR':'Nauru','NU':'Niue','NZ':'New Zealand',
  'OM':'Oman',
  'PA':'Panama','PE':'Peru','PF':'French Polynesia','PG':'Papua New Guinea','PH':'Philippines','PK':'Pakistan',
  'PL':'Poland','PM':'Saint Pierre and Miquelon','PN':'Pitcairn','PR':'Puerto Rico','PS':'Palestine','PT':'Portugal',
  'PW':'Palau','PY':'Paraguay',
  'QA':'Qatar',
  'RE':'Réunion','RO':'Romania','RS':'Serbia','RU':'Russia','RW':'Rwanda',
  'SA':'Saudi Arabia','SB':'Solomon Islands','SC':'Seychelles','SD':'Sudan','SE':'Sweden','SG':'Singapore',
  'SH':'Saint Helena','SI':'Slovenia','SJ':'Svalbard and Jan Mayen','SK':'Slovakia','SL':'Sierra Leone',
  'SM':'San Marino','SN':'Senegal','SO':'Somalia','SR':'Suriname','SS':'South Sudan','ST':'São Tomé and Príncipe',
  'SV':'El Salvador','SX':'Sint Maarten','SY':'Syria','SZ':'Eswatini',
  'TC':'Turks and Caicos','TD':'Chad','TF':'French Southern Territories','TG':'Togo','TH':'Thailand','TJ':'Tajikistan',
  'TK':'Tokelau','TL':'Timor-Leste','TM':'Turkmenistan','TN':'Tunisia','TO':'Tonga','TR':'Turkey',
  'TT':'Trinidad and Tobago','TV':'Tuvalu','TW':'Taiwan','TZ':'Tanzania',
  'UA':'Ukraine','UG':'Uganda','UM':'U.S. Minor Outlying Islands','UY':'Uruguay','UZ':'Uzbekistan',
  'VA':'Vatican City','VC':'Saint Vincent and the Grenadines','VE':'Venezuela','VG':'British Virgin Islands',
  'VI':'U.S. Virgin Islands','VN':'Vietnam','VU':'Vanuatu',
  'WF':'Wallis and Futuna','WS':'Samoa',
  'XK':'Kosovo',
  'YE':'Yemen','YT':'Mayotte',
  'ZA':'South Africa','ZM':'Zambia','ZW':'Zimbabwe',
};

// Inverse map for matching free-text mentions.
export const COUNTRY_NAME_TO_CODE = Object.fromEntries(
  Object.entries(COUNTRY_CODE_TO_NAME).map(([code, name]) => [name.toLowerCase(), code])
);
// A few common aliases the inverse map won't catch.
Object.assign(COUNTRY_NAME_TO_CODE, {
  'england':'GB','scotland':'GB','wales':'GB','northern ireland':'GB','uk':'GB',
  'holland':'NL','czechia':'CZ','burma':'MM','macedonia':'MK','cape verde':'CV',
  'ivory coast':'CI',"côte d'ivoire":'CI','dr congo':'CD','drc':'CD',
  'democratic republic of congo':'CD','republic of congo':'CG',
  'united arab emirates':'AE','uae':'AE',
  'south korea':'KR','korea':'KR','north korea':'KP',
  'united states':'US','usa':'US','america':'US',
  'vatican':'VA','vatican city':'VA',
});

// Flat alphabetical list for dropdown consumers.
export const COUNTRIES = Object.values(COUNTRY_CODE_TO_NAME)
  .filter((v, i, arr) => arr.indexOf(v) === i)
  .sort((a, b) => a.localeCompare(b));

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
