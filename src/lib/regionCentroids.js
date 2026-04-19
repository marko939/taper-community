// Lat/lng centroids for each region_code in the canonical scheme from
// `src/lib/regions.js`. Approximate values — good enough for "put a bubble
// somewhere visibly inside this region on a world map." Extend as new codes
// appear in the analytics payload (see console warnings in RegionMap).

export const REGION_CENTROIDS = {
  // -- US states (ISO-3166-2) --
  'US-AL': [32.806, -86.791],
  'US-AK': [61.370, -152.404],
  'US-AZ': [33.729, -111.431],
  'US-AR': [34.969, -92.373],
  'US-CA': [36.778, -119.418],
  'US-CO': [39.059, -105.311],
  'US-CT': [41.597, -72.755],
  'US-DE': [39.318, -75.507],
  'US-DC': [38.897, -77.036],
  'US-FL': [27.766, -81.686],
  'US-GA': [33.040, -83.643],
  'US-HI': [21.094, -157.498],
  'US-ID': [44.240, -114.478],
  'US-IL': [40.349, -88.986],
  'US-IN': [39.849, -86.258],
  'US-IA': [42.011, -93.210],
  'US-KS': [38.526, -96.726],
  'US-KY': [37.668, -84.670],
  'US-LA': [31.169, -91.867],
  'US-ME': [44.693, -69.381],
  'US-MD': [39.063, -76.802],
  'US-MA': [42.230, -71.530],
  'US-MI': [43.326, -84.536],
  'US-MN': [45.694, -93.900],
  'US-MS': [32.741, -89.678],
  'US-MO': [38.456, -92.288],
  'US-MT': [46.921, -110.454],
  'US-NE': [41.125, -98.268],
  'US-NV': [38.313, -117.055],
  'US-NH': [43.452, -71.563],
  'US-NJ': [40.298, -74.521],
  'US-NM': [34.840, -106.248],
  'US-NY': [42.165, -74.948],
  'US-NC': [35.630, -79.806],
  'US-ND': [47.528, -99.784],
  'US-OH': [40.388, -82.764],
  'US-OK': [35.565, -96.928],
  'US-OR': [44.572, -122.070],
  'US-PA': [40.590, -77.209],
  'US-RI': [41.680, -71.512],
  'US-SC': [33.856, -80.945],
  'US-SD': [44.299, -99.438],
  'US-TN': [35.747, -86.692],
  'US-TX': [31.054, -97.563],
  'US-UT': [40.150, -111.862],
  'US-VT': [44.045, -72.710],
  'US-VA': [37.769, -78.170],
  'US-WA': [47.400, -121.490],
  'US-WV': [38.491, -80.954],
  'US-WI': [44.268, -89.616],
  'US-WY': [42.756, -107.302],
  'US': [39.828, -98.579], // fallback — geographic center of contiguous US

  // -- Canadian provinces & territories (ISO-3166-2) --
  'CA-AB': [53.933, -116.576],
  'CA-BC': [53.726, -127.647],
  'CA-MB': [53.761, -98.814],
  'CA-NB': [46.498, -66.159],
  'CA-NL': [53.135, -57.660],
  'CA-NS': [44.682, -63.744],
  'CA-ON': [50.000, -85.323],
  'CA-PE': [46.510, -63.416],
  'CA-QC': [52.939, -73.549],
  'CA-SK': [52.935, -106.388],
  'CA-NT': [64.825, -124.846],
  'CA-NU': [70.299, -83.107],
  'CA-YT': [64.282, -135.000],
  'CA': [56.130, -106.347], // fallback — geographic center of Canada

  // -- Countries (ISO-3166-1 alpha-2) --
  'GB': [54.559, -2.428],
  'IE': [53.412, -8.243],
  'AU': [-25.275, 133.775],
  'NZ': [-40.901, 174.886],
  'DK': [56.264, 9.502],
  'NO': [60.472, 8.469],
  'SE': [60.128, 18.644],
  'FI': [61.924, 25.748],
  'NL': [52.133, 5.291],
  'DE': [51.166, 10.452],
  'FR': [46.603, 1.888],
  'IT': [41.872, 12.568],
  'PL': [51.919, 19.145],
  'ES': [40.464, -3.750],
  'PT': [39.399, -8.224],
  'CH': [46.818, 8.228],
  'AT': [47.516, 14.550],
  'BE': [50.503, 4.470],
  'GR': [39.074, 21.824],
  'CZ': [49.817, 15.473],
  'RO': [45.943, 24.967],
  'HU': [47.162, 19.503],
  'ZA': [-30.560, 22.937],
  'IN': [20.594, 78.963],
};

/**
 * Look up a centroid; returns `null` if we don't have one yet (caller should
 * skip + optionally warn so we can fill the gap later).
 */
export function getCentroid(regionCode) {
  return REGION_CENTROIDS[regionCode] || null;
}
