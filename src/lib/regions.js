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

// City → state for US cities. Used when Vercel sends `City, US` with no
// region token (smaller cities, certain ISPs). Disambiguates by largest
// population for cases like "Athens" (GA) or "Springfield" (MO).
// Keys lower-cased and URL-decoded for direct lookup.
export const US_CITY_TO_STATE = {
  // Cities seen in production that hit "USA (unspecified)"
  'coatesville':'PA','murfreesboro':'TN','los angeles':'CA','tiverton':'RI',
  'durham':'NC','brooklyn':'NY','west orange':'NJ','san jose':'CA','athens':'GA',
  'bernardsville':'NJ','saint paul':'MN','st paul':'MN','st. paul':'MN','irvine':'CA',
  'ballwin':'MO','olympia':'WA','chicago':'IL','storrs':'CT','port orange':'FL',
  // Top 100 US cities by population (covers most future signups)
  'new york':'NY','manhattan':'NY','queens':'NY','bronx':'NY','staten island':'NY',
  'houston':'TX','phoenix':'AZ','philadelphia':'PA','san antonio':'TX','san diego':'CA',
  'dallas':'TX','austin':'TX','jacksonville':'FL','fort worth':'TX','columbus':'OH',
  'charlotte':'NC','indianapolis':'IN','san francisco':'CA','seattle':'WA','denver':'CO',
  'washington':'DC','boston':'MA','el paso':'TX','nashville':'TN','detroit':'MI',
  'oklahoma city':'OK','portland':'OR','las vegas':'NV','memphis':'TN','louisville':'KY',
  'baltimore':'MD','milwaukee':'WI','albuquerque':'NM','tucson':'AZ','fresno':'CA',
  'sacramento':'CA','mesa':'AZ','kansas city':'MO','atlanta':'GA','miami':'FL',
  'raleigh':'NC','omaha':'NE','long beach':'CA','virginia beach':'VA','oakland':'CA',
  'minneapolis':'MN','tulsa':'OK','arlington':'TX','tampa':'FL','new orleans':'LA',
  'wichita':'KS','cleveland':'OH','bakersfield':'CA','aurora':'CO','anaheim':'CA',
  'honolulu':'HI','santa ana':'CA','riverside':'CA','corpus christi':'TX','lexington':'KY',
  'stockton':'CA','henderson':'NV','st louis':'MO','st. louis':'MO','saint louis':'MO',
  'pittsburgh':'PA','cincinnati':'OH','anchorage':'AK','greensboro':'NC','plano':'TX',
  'newark':'NJ','lincoln':'NE','toledo':'OH','orlando':'FL','chula vista':'CA',
  'jersey city':'NJ','chandler':'AZ','fort wayne':'IN','buffalo':'NY','st petersburg':'FL',
  'st. petersburg':'FL','saint petersburg':'FL','laredo':'TX','lubbock':'TX','madison':'WI',
  'norfolk':'VA','reno':'NV','winston-salem':'NC','glendale':'AZ','hialeah':'FL',
  'garland':'TX','scottsdale':'AZ','irving':'TX','chesapeake':'VA','north las vegas':'NV',
  'fremont':'CA','boise':'ID','richmond':'VA','baton rouge':'LA','spokane':'WA',
  'des moines':'IA','tacoma':'WA','san bernardino':'CA','modesto':'CA','fontana':'CA',
  'santa clarita':'CA','birmingham':'AL','rochester':'NY','grand rapids':'MI',
  'salt lake city':'UT','huntsville':'AL','frisco':'TX','yonkers':'NY',
  'amarillo':'TX','glendale':'AZ','huntington beach':'CA','mckinney':'TX','montgomery':'AL',
  // State capitals not yet covered
  'juneau':'AK','little rock':'AR','hartford':'CT','dover':'DE','tallahassee':'FL',
  'frankfort':'KY','augusta':'ME','annapolis':'MD','lansing':'MI','jackson':'MS',
  'jefferson city':'MO','helena':'MT','carson city':'NV','concord':'NH','trenton':'NJ',
  'santa fe':'NM','albany':'NY','bismarck':'ND','salem':'OR','columbia':'SC',
  'pierre':'SD','montpelier':'VT','charleston':'WV','cheyenne':'WY','topeka':'KS',
  'olympia':'WA','providence':'RI','harrisburg':'PA',
  // Notable university towns and other small cities
  'cambridge':'MA','berkeley':'CA','gainesville':'FL','ann arbor':'MI','tuscaloosa':'AL',
  'boulder':'CO','princeton':'NJ','new haven':'CT','iowa city':'IA','lawrence':'KS',
  'college station':'TX','auburn':'AL','norman':'OK','fayetteville':'AR','state college':'PA',
  'tempe':'AZ','ithaca':'NY','east lansing':'MI','provo':'UT','manhattan ks':'KS',
  'palo alto':'CA','mountain view':'CA','sunnyvale':'CA','santa monica':'CA','pasadena':'CA',
  'beverly hills':'CA','santa barbara':'CA','santa cruz':'CA','santa rosa':'CA',
  'boca raton':'FL','fort lauderdale':'FL','west palm beach':'FL','sarasota':'FL',
  'naples':'FL','tampa bay':'FL','clearwater':'FL','pensacola':'FL','daytona beach':'FL',
  'asheville':'NC','wilmington':'NC','greenville':'SC',
  'cary':'NC','chapel hill':'NC','high point':'NC',
  'savannah':'GA','macon':'GA','augusta ga':'GA',
  'mobile':'AL',
};

// CA province → city (similar idea, used when only "City, CA" is reported)
export const CA_CITY_TO_PROVINCE = {
  'toronto':'ON','ottawa':'ON','mississauga':'ON','brampton':'ON','hamilton':'ON',
  'london':'ON','markham':'ON','vaughan':'ON','kitchener':'ON','windsor':'ON',
  'montreal':'QC','quebec city':'QC','quebec':'QC','laval':'QC','gatineau':'QC',
  'longueuil':'QC','sherbrooke':'QC','saguenay':'QC','levis':'QC','trois-rivieres':'QC',
  'vancouver':'BC','surrey':'BC','burnaby':'BC','richmond':'BC','victoria':'BC',
  'kelowna':'BC','nanaimo':'BC',
  'calgary':'AB','edmonton':'AB','red deer':'AB','lethbridge':'AB',
  'winnipeg':'MB','brandon':'MB',
  'saskatoon':'SK','regina':'SK',
  'halifax':'NS','sydney':'NS',
  'st johns':'NL',"st. john's":'NL',"saint john's":'NL',
  'fredericton':'NB','moncton':'NB','saint john':'NB',
  'charlottetown':'PE',
  'whitehorse':'YT','yellowknife':'NT','iqaluit':'NU',
};

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
    // City → state lookup. Vercel sometimes sends `City, US` with no region
    // token; recover the state from the city name. URL-decode first because
    // Vercel emits e.g. `Los%20Angeles`.
    for (const part of ipParts) {
      let cityKey;
      try { cityKey = decodeURIComponent(part).toLowerCase().trim(); }
      catch { cityKey = part.toLowerCase().trim(); }
      if (cityKey === 'us' || cityKey === 'usa') continue;
      const stateCode = US_CITY_TO_STATE[cityKey];
      if (stateCode) {
        return { code: `US-${stateCode}`, label: US_ABBR_TO_STATE[stateCode.toLowerCase()] };
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
    // City → province lookup for Vercel `City, CA` short format.
    for (const part of ipParts) {
      let cityKey;
      try { cityKey = decodeURIComponent(part).toLowerCase().trim(); }
      catch { cityKey = part.toLowerCase().trim(); }
      if (cityKey === 'ca') continue;
      const provCode = CA_CITY_TO_PROVINCE[cityKey];
      if (provCode) {
        return { code: `CA-${provCode}`, label: CA_ABBR[provCode.toLowerCase()] };
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
