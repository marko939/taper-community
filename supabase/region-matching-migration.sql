-- =============================================================================
-- Region matching migration
-- =============================================================================
-- Adds structured region columns to `profiles` and `clinicians`, plus a one-time
-- backfill driven by the existing text fields.
--
-- Code scheme:
--   US states  : ISO-3166-2 code e.g. "US-CA"
--   CA provinces : ISO-3166-2 code e.g. "CA-ON"
--   Other countries : ISO-3166-1 alpha-2 e.g. "GB", "AU"
--
-- Mirrors the JS resolver in `src/lib/regions.js`. Keep the two in sync.
-- =============================================================================

-- 1. Add columns ---------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS region_code text,
  ADD COLUMN IF NOT EXISTS region_label text,
  ADD COLUMN IF NOT EXISTS region_source text CHECK (region_source IN ('ip', 'self', 'admin'));

CREATE INDEX IF NOT EXISTS idx_profiles_region_code
  ON public.profiles(region_code) WHERE region_code IS NOT NULL;

ALTER TABLE public.clinicians
  ADD COLUMN IF NOT EXISTS region_code text,
  ADD COLUMN IF NOT EXISTS region_label text;

CREATE INDEX IF NOT EXISTS idx_clinicians_region_code
  ON public.clinicians(region_code) WHERE is_active = true AND region_code IS NOT NULL;

-- 2. Helper function -----------------------------------------------------------
--
-- Resolves a free-text location blob to {code, label}. We concat the source text
-- and inspect it once; the CASE cascades state → province → country.

CREATE OR REPLACE FUNCTION public.resolve_region(text_input text)
RETURNS TABLE(region_code text, region_label text)
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  t text := lower(coalesce(text_input, ''));
  is_us boolean;
  is_ca boolean;
BEGIN
  IF t = '' THEN
    RETURN QUERY SELECT NULL::text, NULL::text;
    RETURN;
  END IF;

  is_us := t ~* '\m(us|usa|united states)\M' OR t LIKE '%, us' OR t LIKE '%, usa';
  is_ca := NOT is_us AND (t ~* '\mca\M.*$' OR t LIKE '%, ca' OR t LIKE '%canada%');

  -- US states
  IF is_us THEN
    -- First, try direct token extraction. Vercel sends ip_location as
    -- "City, ST, US" — so the second-to-last comma-separated part IS the
    -- state code. This is the strongest signal and avoids false positives
    -- from free-text pattern matching.
    DECLARE
      us_parts text[] := string_to_array(t, ',');
      us_last text := upper(trim(us_parts[array_length(us_parts, 1)]));
      us_state text;
      us_label text;
    BEGIN
      IF (us_last = 'US' OR us_last = 'USA') AND array_length(us_parts, 1) >= 2 THEN
        us_state := upper(trim(us_parts[array_length(us_parts, 1) - 1]));
        IF us_state ~ '^[A-Z]{2}$' THEN
          us_label := CASE us_state
            WHEN 'AL' THEN 'Alabama' WHEN 'AK' THEN 'Alaska' WHEN 'AZ' THEN 'Arizona'
            WHEN 'AR' THEN 'Arkansas' WHEN 'CA' THEN 'California' WHEN 'CO' THEN 'Colorado'
            WHEN 'CT' THEN 'Connecticut' WHEN 'DE' THEN 'Delaware' WHEN 'DC' THEN 'District of Columbia'
            WHEN 'FL' THEN 'Florida' WHEN 'GA' THEN 'Georgia' WHEN 'HI' THEN 'Hawaii'
            WHEN 'ID' THEN 'Idaho' WHEN 'IL' THEN 'Illinois' WHEN 'IN' THEN 'Indiana'
            WHEN 'IA' THEN 'Iowa' WHEN 'KS' THEN 'Kansas' WHEN 'KY' THEN 'Kentucky'
            WHEN 'LA' THEN 'Louisiana' WHEN 'ME' THEN 'Maine' WHEN 'MD' THEN 'Maryland'
            WHEN 'MA' THEN 'Massachusetts' WHEN 'MI' THEN 'Michigan' WHEN 'MN' THEN 'Minnesota'
            WHEN 'MS' THEN 'Mississippi' WHEN 'MO' THEN 'Missouri' WHEN 'MT' THEN 'Montana'
            WHEN 'NE' THEN 'Nebraska' WHEN 'NV' THEN 'Nevada' WHEN 'NH' THEN 'New Hampshire'
            WHEN 'NJ' THEN 'New Jersey' WHEN 'NM' THEN 'New Mexico' WHEN 'NY' THEN 'New York'
            WHEN 'NC' THEN 'North Carolina' WHEN 'ND' THEN 'North Dakota' WHEN 'OH' THEN 'Ohio'
            WHEN 'OK' THEN 'Oklahoma' WHEN 'OR' THEN 'Oregon' WHEN 'PA' THEN 'Pennsylvania'
            WHEN 'RI' THEN 'Rhode Island' WHEN 'SC' THEN 'South Carolina' WHEN 'SD' THEN 'South Dakota'
            WHEN 'TN' THEN 'Tennessee' WHEN 'TX' THEN 'Texas' WHEN 'UT' THEN 'Utah'
            WHEN 'VT' THEN 'Vermont' WHEN 'VA' THEN 'Virginia' WHEN 'WA' THEN 'Washington'
            WHEN 'WV' THEN 'West Virginia' WHEN 'WI' THEN 'Wisconsin' WHEN 'WY' THEN 'Wyoming'
            ELSE NULL
          END;
          IF us_label IS NOT NULL THEN
            RETURN QUERY SELECT 'US-' || us_state, us_label;
            RETURN;
          END IF;
        END IF;
      END IF;
    END;

    -- City → state recovery: when Vercel only sends "City, US" (no region
    -- token), look up the city. Handles URL-encoded spaces (%20).
    DECLARE
      city_parts text[] := string_to_array(t, ',');
      city_key text;
      city_state text;
    BEGIN
      IF array_length(city_parts, 1) >= 2 THEN
        city_key := lower(trim(replace(city_parts[1], '%20', ' ')));
        city_state := CASE city_key
          -- Currently unmapped users
          WHEN 'coatesville' THEN 'PA' WHEN 'murfreesboro' THEN 'TN'
          WHEN 'los angeles' THEN 'CA' WHEN 'tiverton' THEN 'RI'
          WHEN 'durham' THEN 'NC' WHEN 'brooklyn' THEN 'NY'
          WHEN 'west orange' THEN 'NJ' WHEN 'san jose' THEN 'CA'
          WHEN 'athens' THEN 'GA' WHEN 'bernardsville' THEN 'NJ'
          WHEN 'saint paul' THEN 'MN' WHEN 'st paul' THEN 'MN' WHEN 'st. paul' THEN 'MN'
          WHEN 'irvine' THEN 'CA' WHEN 'ballwin' THEN 'MO'
          WHEN 'olympia' THEN 'WA' WHEN 'chicago' THEN 'IL'
          WHEN 'storrs' THEN 'CT' WHEN 'port orange' THEN 'FL'
          -- Top US cities (covers most future signups)
          WHEN 'new york' THEN 'NY' WHEN 'manhattan' THEN 'NY' WHEN 'queens' THEN 'NY'
          WHEN 'bronx' THEN 'NY' WHEN 'staten island' THEN 'NY'
          WHEN 'houston' THEN 'TX' WHEN 'phoenix' THEN 'AZ' WHEN 'philadelphia' THEN 'PA'
          WHEN 'san antonio' THEN 'TX' WHEN 'san diego' THEN 'CA' WHEN 'dallas' THEN 'TX'
          WHEN 'austin' THEN 'TX' WHEN 'jacksonville' THEN 'FL' WHEN 'fort worth' THEN 'TX'
          WHEN 'columbus' THEN 'OH' WHEN 'charlotte' THEN 'NC' WHEN 'indianapolis' THEN 'IN'
          WHEN 'san francisco' THEN 'CA' WHEN 'seattle' THEN 'WA' WHEN 'denver' THEN 'CO'
          WHEN 'washington' THEN 'DC' WHEN 'boston' THEN 'MA' WHEN 'el paso' THEN 'TX'
          WHEN 'nashville' THEN 'TN' WHEN 'detroit' THEN 'MI' WHEN 'oklahoma city' THEN 'OK'
          WHEN 'portland' THEN 'OR' WHEN 'las vegas' THEN 'NV' WHEN 'memphis' THEN 'TN'
          WHEN 'louisville' THEN 'KY' WHEN 'baltimore' THEN 'MD' WHEN 'milwaukee' THEN 'WI'
          WHEN 'albuquerque' THEN 'NM' WHEN 'tucson' THEN 'AZ' WHEN 'fresno' THEN 'CA'
          WHEN 'sacramento' THEN 'CA' WHEN 'mesa' THEN 'AZ' WHEN 'kansas city' THEN 'MO'
          WHEN 'atlanta' THEN 'GA' WHEN 'miami' THEN 'FL' WHEN 'raleigh' THEN 'NC'
          WHEN 'omaha' THEN 'NE' WHEN 'long beach' THEN 'CA' WHEN 'virginia beach' THEN 'VA'
          WHEN 'oakland' THEN 'CA' WHEN 'minneapolis' THEN 'MN' WHEN 'tulsa' THEN 'OK'
          WHEN 'arlington' THEN 'TX' WHEN 'tampa' THEN 'FL' WHEN 'new orleans' THEN 'LA'
          WHEN 'wichita' THEN 'KS' WHEN 'cleveland' THEN 'OH' WHEN 'bakersfield' THEN 'CA'
          WHEN 'aurora' THEN 'CO' WHEN 'anaheim' THEN 'CA' WHEN 'honolulu' THEN 'HI'
          WHEN 'santa ana' THEN 'CA' WHEN 'riverside' THEN 'CA' WHEN 'corpus christi' THEN 'TX'
          WHEN 'lexington' THEN 'KY' WHEN 'stockton' THEN 'CA' WHEN 'henderson' THEN 'NV'
          WHEN 'st louis' THEN 'MO' WHEN 'st. louis' THEN 'MO' WHEN 'saint louis' THEN 'MO'
          WHEN 'pittsburgh' THEN 'PA' WHEN 'cincinnati' THEN 'OH' WHEN 'anchorage' THEN 'AK'
          WHEN 'greensboro' THEN 'NC' WHEN 'plano' THEN 'TX' WHEN 'newark' THEN 'NJ'
          WHEN 'lincoln' THEN 'NE' WHEN 'toledo' THEN 'OH' WHEN 'orlando' THEN 'FL'
          WHEN 'chula vista' THEN 'CA' WHEN 'jersey city' THEN 'NJ' WHEN 'chandler' THEN 'AZ'
          WHEN 'fort wayne' THEN 'IN' WHEN 'buffalo' THEN 'NY' WHEN 'st petersburg' THEN 'FL'
          WHEN 'st. petersburg' THEN 'FL' WHEN 'saint petersburg' THEN 'FL' WHEN 'laredo' THEN 'TX'
          WHEN 'lubbock' THEN 'TX' WHEN 'madison' THEN 'WI' WHEN 'norfolk' THEN 'VA'
          WHEN 'reno' THEN 'NV' WHEN 'winston-salem' THEN 'NC' WHEN 'glendale' THEN 'AZ'
          WHEN 'hialeah' THEN 'FL' WHEN 'garland' THEN 'TX' WHEN 'scottsdale' THEN 'AZ'
          WHEN 'irving' THEN 'TX' WHEN 'chesapeake' THEN 'VA' WHEN 'north las vegas' THEN 'NV'
          WHEN 'fremont' THEN 'CA' WHEN 'boise' THEN 'ID' WHEN 'richmond' THEN 'VA'
          WHEN 'baton rouge' THEN 'LA' WHEN 'spokane' THEN 'WA' WHEN 'des moines' THEN 'IA'
          WHEN 'tacoma' THEN 'WA' WHEN 'san bernardino' THEN 'CA' WHEN 'modesto' THEN 'CA'
          WHEN 'fontana' THEN 'CA' WHEN 'santa clarita' THEN 'CA' WHEN 'birmingham' THEN 'AL'
          WHEN 'rochester' THEN 'NY' WHEN 'grand rapids' THEN 'MI' WHEN 'salt lake city' THEN 'UT'
          WHEN 'huntsville' THEN 'AL' WHEN 'frisco' THEN 'TX' WHEN 'yonkers' THEN 'NY'
          WHEN 'amarillo' THEN 'TX' WHEN 'huntington beach' THEN 'CA' WHEN 'mckinney' THEN 'TX'
          WHEN 'montgomery' THEN 'AL'
          -- State capitals not yet covered
          WHEN 'juneau' THEN 'AK' WHEN 'little rock' THEN 'AR' WHEN 'hartford' THEN 'CT'
          WHEN 'dover' THEN 'DE' WHEN 'tallahassee' THEN 'FL' WHEN 'frankfort' THEN 'KY'
          WHEN 'augusta' THEN 'ME' WHEN 'annapolis' THEN 'MD' WHEN 'lansing' THEN 'MI'
          WHEN 'jackson' THEN 'MS' WHEN 'jefferson city' THEN 'MO' WHEN 'helena' THEN 'MT'
          WHEN 'carson city' THEN 'NV' WHEN 'concord' THEN 'NH' WHEN 'trenton' THEN 'NJ'
          WHEN 'santa fe' THEN 'NM' WHEN 'albany' THEN 'NY' WHEN 'bismarck' THEN 'ND'
          WHEN 'salem' THEN 'OR' WHEN 'columbia' THEN 'SC' WHEN 'pierre' THEN 'SD'
          WHEN 'montpelier' THEN 'VT' WHEN 'charleston' THEN 'WV' WHEN 'cheyenne' THEN 'WY'
          WHEN 'topeka' THEN 'KS' WHEN 'providence' THEN 'RI' WHEN 'harrisburg' THEN 'PA'
          -- University towns and other notable smaller cities
          WHEN 'cambridge' THEN 'MA' WHEN 'berkeley' THEN 'CA' WHEN 'gainesville' THEN 'FL'
          WHEN 'ann arbor' THEN 'MI' WHEN 'tuscaloosa' THEN 'AL' WHEN 'boulder' THEN 'CO'
          WHEN 'princeton' THEN 'NJ' WHEN 'new haven' THEN 'CT' WHEN 'iowa city' THEN 'IA'
          WHEN 'lawrence' THEN 'KS' WHEN 'college station' THEN 'TX' WHEN 'auburn' THEN 'AL'
          WHEN 'norman' THEN 'OK' WHEN 'fayetteville' THEN 'AR' WHEN 'state college' THEN 'PA'
          WHEN 'tempe' THEN 'AZ' WHEN 'ithaca' THEN 'NY' WHEN 'east lansing' THEN 'MI'
          WHEN 'provo' THEN 'UT'
          WHEN 'palo alto' THEN 'CA' WHEN 'mountain view' THEN 'CA' WHEN 'sunnyvale' THEN 'CA'
          WHEN 'santa monica' THEN 'CA' WHEN 'pasadena' THEN 'CA' WHEN 'beverly hills' THEN 'CA'
          WHEN 'santa barbara' THEN 'CA' WHEN 'santa cruz' THEN 'CA' WHEN 'santa rosa' THEN 'CA'
          WHEN 'boca raton' THEN 'FL' WHEN 'fort lauderdale' THEN 'FL' WHEN 'west palm beach' THEN 'FL'
          WHEN 'sarasota' THEN 'FL' WHEN 'naples' THEN 'FL' WHEN 'clearwater' THEN 'FL'
          WHEN 'pensacola' THEN 'FL' WHEN 'daytona beach' THEN 'FL'
          WHEN 'asheville' THEN 'NC' WHEN 'wilmington' THEN 'NC' WHEN 'greenville' THEN 'SC'
          WHEN 'cary' THEN 'NC' WHEN 'chapel hill' THEN 'NC' WHEN 'high point' THEN 'NC'
          WHEN 'savannah' THEN 'GA' WHEN 'macon' THEN 'GA' WHEN 'mobile' THEN 'AL'
          ELSE NULL
        END;
        IF city_state IS NOT NULL THEN
          RETURN QUERY SELECT 'US-' || city_state,
            CASE city_state
              WHEN 'AL' THEN 'Alabama' WHEN 'AK' THEN 'Alaska' WHEN 'AZ' THEN 'Arizona'
              WHEN 'AR' THEN 'Arkansas' WHEN 'CA' THEN 'California' WHEN 'CO' THEN 'Colorado'
              WHEN 'CT' THEN 'Connecticut' WHEN 'DE' THEN 'Delaware' WHEN 'DC' THEN 'District of Columbia'
              WHEN 'FL' THEN 'Florida' WHEN 'GA' THEN 'Georgia' WHEN 'HI' THEN 'Hawaii'
              WHEN 'ID' THEN 'Idaho' WHEN 'IL' THEN 'Illinois' WHEN 'IN' THEN 'Indiana'
              WHEN 'IA' THEN 'Iowa' WHEN 'KS' THEN 'Kansas' WHEN 'KY' THEN 'Kentucky'
              WHEN 'LA' THEN 'Louisiana' WHEN 'ME' THEN 'Maine' WHEN 'MD' THEN 'Maryland'
              WHEN 'MA' THEN 'Massachusetts' WHEN 'MI' THEN 'Michigan' WHEN 'MN' THEN 'Minnesota'
              WHEN 'MS' THEN 'Mississippi' WHEN 'MO' THEN 'Missouri' WHEN 'MT' THEN 'Montana'
              WHEN 'NE' THEN 'Nebraska' WHEN 'NV' THEN 'Nevada' WHEN 'NH' THEN 'New Hampshire'
              WHEN 'NJ' THEN 'New Jersey' WHEN 'NM' THEN 'New Mexico' WHEN 'NY' THEN 'New York'
              WHEN 'NC' THEN 'North Carolina' WHEN 'ND' THEN 'North Dakota' WHEN 'OH' THEN 'Ohio'
              WHEN 'OK' THEN 'Oklahoma' WHEN 'OR' THEN 'Oregon' WHEN 'PA' THEN 'Pennsylvania'
              WHEN 'RI' THEN 'Rhode Island' WHEN 'SC' THEN 'South Carolina' WHEN 'SD' THEN 'South Dakota'
              WHEN 'TN' THEN 'Tennessee' WHEN 'TX' THEN 'Texas' WHEN 'UT' THEN 'Utah'
              WHEN 'VT' THEN 'Vermont' WHEN 'VA' THEN 'Virginia' WHEN 'WA' THEN 'Washington'
              WHEN 'WV' THEN 'West Virginia' WHEN 'WI' THEN 'Wisconsin' WHEN 'WY' THEN 'Wyoming'
              ELSE city_state
            END;
          RETURN;
        END IF;
      END IF;
    END;

    -- Fall back to free-text pattern matching (covers users with only a
    -- manual `location` field like "Austin, Texas" and no ip_location).
    RETURN QUERY SELECT c, l FROM (VALUES
      ('US-AL','Alabama','alabama|\malabama\M|\mal\M'),
      ('US-AK','Alaska','alaska|\mak\M'),
      ('US-AZ','Arizona','arizona|\maz\M'),
      ('US-AR','Arkansas','arkansas|\mar\M'),
      ('US-CA','California','california|\mca\M'),
      ('US-CO','Colorado','colorado|\mco\M'),
      ('US-CT','Connecticut','connecticut|\mct\M'),
      ('US-DE','Delaware','delaware|\mde\M'),
      ('US-DC','District of Columbia','district of columbia|washington, dc|\mdc\M'),
      ('US-FL','Florida','florida|\mfl\M'),
      ('US-GA','Georgia','georgia|\mga\M'),
      ('US-HI','Hawaii','hawaii|\mhi\M'),
      ('US-ID','Idaho','idaho|\mid\M'),
      ('US-IL','Illinois','illinois|\mil\M'),
      ('US-IN','Indiana','indiana|\min\M'),
      ('US-IA','Iowa','iowa|\mia\M'),
      ('US-KS','Kansas','kansas|\mks\M'),
      ('US-KY','Kentucky','kentucky|\mky\M'),
      ('US-LA','Louisiana','louisiana|\mla\M'),
      ('US-ME','Maine','\bmaine\b|\mme\M'),
      ('US-MD','Maryland','maryland|\mmd\M'),
      ('US-MA','Massachusetts','massachusetts|\mma\M'),
      ('US-MI','Michigan','michigan|\mmi\M'),
      ('US-MN','Minnesota','minnesota|\mmn\M'),
      ('US-MS','Mississippi','mississippi|\mms\M'),
      ('US-MO','Missouri','missouri|\mmo\M'),
      ('US-MT','Montana','montana|\mmt\M'),
      ('US-NE','Nebraska','nebraska|\mne\M'),
      ('US-NV','Nevada','nevada|\mnv\M'),
      ('US-NH','New Hampshire','new hampshire|\mnh\M'),
      ('US-NJ','New Jersey','new jersey|\mnj\M'),
      ('US-NM','New Mexico','new mexico|\mnm\M'),
      ('US-NY','New York','new york|\mny\M'),
      ('US-NC','North Carolina','north carolina|\mnc\M'),
      ('US-ND','North Dakota','north dakota|\mnd\M'),
      ('US-OH','Ohio','\mohio\M|\moh\M'),
      ('US-OK','Oklahoma','oklahoma|\mok\M'),
      ('US-OR','Oregon','oregon|\mor\M'),
      ('US-PA','Pennsylvania','pennsylvania|\mpa\M'),
      ('US-RI','Rhode Island','rhode island|\mri\M'),
      ('US-SC','South Carolina','south carolina|\msc\M'),
      ('US-SD','South Dakota','south dakota|\msd\M'),
      ('US-TN','Tennessee','tennessee|\mtn\M'),
      ('US-TX','Texas','texas|\mtx\M'),
      ('US-UT','Utah','\mutah\M|\mut\M'),
      ('US-VT','Vermont','vermont|\mvt\M'),
      ('US-VA','Virginia','virginia|\mva\M'),
      ('US-WA','Washington','washington|\mwa\M'),
      ('US-WV','West Virginia','west virginia|\mwv\M'),
      ('US-WI','Wisconsin','wisconsin|\mwi\M'),
      ('US-WY','Wyoming','wyoming|\mwy\M')
    ) AS s(c, l, pat)
    WHERE t ~* pat
    LIMIT 1;
    -- If nothing matched, flag as generic US.
    IF NOT FOUND THEN
      RETURN QUERY SELECT 'US'::text, 'USA (unspecified)'::text;
    END IF;
    RETURN;
  END IF;

  -- Canadian provinces
  IF is_ca THEN
    -- Direct token extraction first, same idea as the US branch.
    DECLARE
      ca_parts text[] := string_to_array(t, ',');
      ca_last text := upper(trim(ca_parts[array_length(ca_parts, 1)]));
      ca_prov text;
      ca_label text;
    BEGIN
      IF ca_last = 'CA' AND array_length(ca_parts, 1) >= 2 THEN
        ca_prov := upper(trim(ca_parts[array_length(ca_parts, 1) - 1]));
        IF ca_prov ~ '^[A-Z]{2}$' THEN
          ca_label := CASE ca_prov
            WHEN 'AB' THEN 'Alberta' WHEN 'BC' THEN 'British Columbia' WHEN 'MB' THEN 'Manitoba'
            WHEN 'NB' THEN 'New Brunswick' WHEN 'NL' THEN 'Newfoundland and Labrador'
            WHEN 'NS' THEN 'Nova Scotia' WHEN 'ON' THEN 'Ontario' WHEN 'PE' THEN 'Prince Edward Island'
            WHEN 'QC' THEN 'Quebec' WHEN 'SK' THEN 'Saskatchewan'
            WHEN 'NT' THEN 'Northwest Territories' WHEN 'NU' THEN 'Nunavut' WHEN 'YT' THEN 'Yukon'
            ELSE NULL
          END;
          IF ca_label IS NOT NULL THEN
            RETURN QUERY SELECT 'CA-' || ca_prov, ca_label;
            RETURN;
          END IF;
        END IF;
      END IF;
    END;

    RETURN QUERY SELECT c, l FROM (VALUES
      ('CA-AB','Alberta','alberta|\mab\M'),
      ('CA-BC','British Columbia','british columbia|\mbc\M'),
      ('CA-MB','Manitoba','manitoba|\mmb\M'),
      ('CA-NB','New Brunswick','new brunswick|\mnb\M'),
      ('CA-NL','Newfoundland and Labrador','newfoundland|\mnl\M'),
      ('CA-NS','Nova Scotia','nova scotia|\mns\M'),
      ('CA-ON','Ontario','ontario|\mon\M'),
      ('CA-PE','Prince Edward Island','prince edward|\mpe\M'),
      ('CA-QC','Quebec','quebec|\mqc\M'),
      ('CA-SK','Saskatchewan','saskatchewan|\msk\M'),
      ('CA-NT','Northwest Territories','northwest territories|\mnt\M'),
      ('CA-NU','Nunavut','nunavut|\mnu\M'),
      ('CA-YT','Yukon','yukon|\myt\M')
    ) AS s(c, l, pat)
    WHERE t ~* pat
    LIMIT 1;
    IF NOT FOUND THEN
      RETURN QUERY SELECT 'CA'::text, 'Canada (unspecified)'::text;
    END IF;
    RETURN;
  END IF;

  -- Other countries: prefer the trailing 2-letter code from ip_location
  -- (Vercel sends ISO-3166-1 alpha-2 in `x-vercel-ip-country`). Fall back to
  -- free-text country-name matching for users whose only signal is the manual
  -- `location` field.
  DECLARE
    parts text[];
    last_tok text;
    pretty text;
  BEGIN
    parts := string_to_array(t, ',');
    last_tok := upper(trim(parts[array_length(parts, 1)]));

    IF last_tok ~ '^[A-Z]{2}$' AND last_tok NOT IN ('US', 'CA') THEN
      pretty := CASE last_tok
        WHEN 'AD' THEN 'Andorra' WHEN 'AE' THEN 'United Arab Emirates' WHEN 'AF' THEN 'Afghanistan'
        WHEN 'AG' THEN 'Antigua and Barbuda' WHEN 'AI' THEN 'Anguilla' WHEN 'AL' THEN 'Albania'
        WHEN 'AM' THEN 'Armenia' WHEN 'AO' THEN 'Angola' WHEN 'AQ' THEN 'Antarctica' WHEN 'AR' THEN 'Argentina'
        WHEN 'AS' THEN 'American Samoa' WHEN 'AT' THEN 'Austria' WHEN 'AU' THEN 'Australia' WHEN 'AW' THEN 'Aruba'
        WHEN 'AX' THEN 'Åland Islands' WHEN 'AZ' THEN 'Azerbaijan'
        WHEN 'BA' THEN 'Bosnia and Herzegovina' WHEN 'BB' THEN 'Barbados' WHEN 'BD' THEN 'Bangladesh'
        WHEN 'BE' THEN 'Belgium' WHEN 'BF' THEN 'Burkina Faso' WHEN 'BG' THEN 'Bulgaria' WHEN 'BH' THEN 'Bahrain'
        WHEN 'BI' THEN 'Burundi' WHEN 'BJ' THEN 'Benin' WHEN 'BL' THEN 'Saint Barthélemy' WHEN 'BM' THEN 'Bermuda'
        WHEN 'BN' THEN 'Brunei' WHEN 'BO' THEN 'Bolivia' WHEN 'BQ' THEN 'Caribbean Netherlands' WHEN 'BR' THEN 'Brazil'
        WHEN 'BS' THEN 'Bahamas' WHEN 'BT' THEN 'Bhutan' WHEN 'BV' THEN 'Bouvet Island' WHEN 'BW' THEN 'Botswana'
        WHEN 'BY' THEN 'Belarus' WHEN 'BZ' THEN 'Belize'
        WHEN 'CC' THEN 'Cocos (Keeling) Islands' WHEN 'CD' THEN 'DR Congo' WHEN 'CF' THEN 'Central African Republic'
        WHEN 'CG' THEN 'Republic of Congo' WHEN 'CH' THEN 'Switzerland' WHEN 'CI' THEN 'Ivory Coast'
        WHEN 'CK' THEN 'Cook Islands' WHEN 'CL' THEN 'Chile' WHEN 'CM' THEN 'Cameroon' WHEN 'CN' THEN 'China'
        WHEN 'CO' THEN 'Colombia' WHEN 'CR' THEN 'Costa Rica' WHEN 'CU' THEN 'Cuba' WHEN 'CV' THEN 'Cape Verde'
        WHEN 'CW' THEN 'Curaçao' WHEN 'CX' THEN 'Christmas Island' WHEN 'CY' THEN 'Cyprus' WHEN 'CZ' THEN 'Czech Republic'
        WHEN 'DE' THEN 'Germany' WHEN 'DJ' THEN 'Djibouti' WHEN 'DK' THEN 'Denmark' WHEN 'DM' THEN 'Dominica'
        WHEN 'DO' THEN 'Dominican Republic' WHEN 'DZ' THEN 'Algeria'
        WHEN 'EC' THEN 'Ecuador' WHEN 'EE' THEN 'Estonia' WHEN 'EG' THEN 'Egypt' WHEN 'EH' THEN 'Western Sahara'
        WHEN 'ER' THEN 'Eritrea' WHEN 'ES' THEN 'Spain' WHEN 'ET' THEN 'Ethiopia'
        WHEN 'FI' THEN 'Finland' WHEN 'FJ' THEN 'Fiji' WHEN 'FK' THEN 'Falkland Islands' WHEN 'FM' THEN 'Micronesia'
        WHEN 'FO' THEN 'Faroe Islands' WHEN 'FR' THEN 'France'
        WHEN 'GA' THEN 'Gabon' WHEN 'GB' THEN 'United Kingdom' WHEN 'GD' THEN 'Grenada' WHEN 'GE' THEN 'Georgia'
        WHEN 'GF' THEN 'French Guiana' WHEN 'GG' THEN 'Guernsey' WHEN 'GH' THEN 'Ghana' WHEN 'GI' THEN 'Gibraltar'
        WHEN 'GL' THEN 'Greenland' WHEN 'GM' THEN 'Gambia' WHEN 'GN' THEN 'Guinea' WHEN 'GP' THEN 'Guadeloupe'
        WHEN 'GQ' THEN 'Equatorial Guinea' WHEN 'GR' THEN 'Greece' WHEN 'GS' THEN 'South Georgia' WHEN 'GT' THEN 'Guatemala'
        WHEN 'GU' THEN 'Guam' WHEN 'GW' THEN 'Guinea-Bissau' WHEN 'GY' THEN 'Guyana'
        WHEN 'HK' THEN 'Hong Kong' WHEN 'HM' THEN 'Heard & McDonald Islands' WHEN 'HN' THEN 'Honduras'
        WHEN 'HR' THEN 'Croatia' WHEN 'HT' THEN 'Haiti' WHEN 'HU' THEN 'Hungary'
        WHEN 'ID' THEN 'Indonesia' WHEN 'IE' THEN 'Ireland' WHEN 'IL' THEN 'Israel' WHEN 'IM' THEN 'Isle of Man'
        WHEN 'IN' THEN 'India' WHEN 'IO' THEN 'British Indian Ocean Territory' WHEN 'IQ' THEN 'Iraq'
        WHEN 'IR' THEN 'Iran' WHEN 'IS' THEN 'Iceland' WHEN 'IT' THEN 'Italy'
        WHEN 'JE' THEN 'Jersey' WHEN 'JM' THEN 'Jamaica' WHEN 'JO' THEN 'Jordan' WHEN 'JP' THEN 'Japan'
        WHEN 'KE' THEN 'Kenya' WHEN 'KG' THEN 'Kyrgyzstan' WHEN 'KH' THEN 'Cambodia' WHEN 'KI' THEN 'Kiribati'
        WHEN 'KM' THEN 'Comoros' WHEN 'KN' THEN 'Saint Kitts and Nevis' WHEN 'KP' THEN 'North Korea'
        WHEN 'KR' THEN 'South Korea' WHEN 'KW' THEN 'Kuwait' WHEN 'KY' THEN 'Cayman Islands' WHEN 'KZ' THEN 'Kazakhstan'
        WHEN 'LA' THEN 'Laos' WHEN 'LB' THEN 'Lebanon' WHEN 'LC' THEN 'Saint Lucia' WHEN 'LI' THEN 'Liechtenstein'
        WHEN 'LK' THEN 'Sri Lanka' WHEN 'LR' THEN 'Liberia' WHEN 'LS' THEN 'Lesotho' WHEN 'LT' THEN 'Lithuania'
        WHEN 'LU' THEN 'Luxembourg' WHEN 'LV' THEN 'Latvia' WHEN 'LY' THEN 'Libya'
        WHEN 'MA' THEN 'Morocco' WHEN 'MC' THEN 'Monaco' WHEN 'MD' THEN 'Moldova' WHEN 'ME' THEN 'Montenegro'
        WHEN 'MF' THEN 'Saint Martin' WHEN 'MG' THEN 'Madagascar' WHEN 'MH' THEN 'Marshall Islands'
        WHEN 'MK' THEN 'North Macedonia' WHEN 'ML' THEN 'Mali' WHEN 'MM' THEN 'Myanmar' WHEN 'MN' THEN 'Mongolia'
        WHEN 'MO' THEN 'Macao' WHEN 'MP' THEN 'Northern Mariana Islands' WHEN 'MQ' THEN 'Martinique'
        WHEN 'MR' THEN 'Mauritania' WHEN 'MS' THEN 'Montserrat' WHEN 'MT' THEN 'Malta' WHEN 'MU' THEN 'Mauritius'
        WHEN 'MV' THEN 'Maldives' WHEN 'MW' THEN 'Malawi' WHEN 'MX' THEN 'Mexico' WHEN 'MY' THEN 'Malaysia'
        WHEN 'MZ' THEN 'Mozambique'
        WHEN 'NA' THEN 'Namibia' WHEN 'NC' THEN 'New Caledonia' WHEN 'NE' THEN 'Niger' WHEN 'NF' THEN 'Norfolk Island'
        WHEN 'NG' THEN 'Nigeria' WHEN 'NI' THEN 'Nicaragua' WHEN 'NL' THEN 'Netherlands' WHEN 'NO' THEN 'Norway'
        WHEN 'NP' THEN 'Nepal' WHEN 'NR' THEN 'Nauru' WHEN 'NU' THEN 'Niue' WHEN 'NZ' THEN 'New Zealand'
        WHEN 'OM' THEN 'Oman'
        WHEN 'PA' THEN 'Panama' WHEN 'PE' THEN 'Peru' WHEN 'PF' THEN 'French Polynesia' WHEN 'PG' THEN 'Papua New Guinea'
        WHEN 'PH' THEN 'Philippines' WHEN 'PK' THEN 'Pakistan' WHEN 'PL' THEN 'Poland'
        WHEN 'PM' THEN 'Saint Pierre and Miquelon' WHEN 'PN' THEN 'Pitcairn' WHEN 'PR' THEN 'Puerto Rico'
        WHEN 'PS' THEN 'Palestine' WHEN 'PT' THEN 'Portugal' WHEN 'PW' THEN 'Palau' WHEN 'PY' THEN 'Paraguay'
        WHEN 'QA' THEN 'Qatar'
        WHEN 'RE' THEN 'Réunion' WHEN 'RO' THEN 'Romania' WHEN 'RS' THEN 'Serbia' WHEN 'RU' THEN 'Russia'
        WHEN 'RW' THEN 'Rwanda'
        WHEN 'SA' THEN 'Saudi Arabia' WHEN 'SB' THEN 'Solomon Islands' WHEN 'SC' THEN 'Seychelles' WHEN 'SD' THEN 'Sudan'
        WHEN 'SE' THEN 'Sweden' WHEN 'SG' THEN 'Singapore' WHEN 'SH' THEN 'Saint Helena' WHEN 'SI' THEN 'Slovenia'
        WHEN 'SJ' THEN 'Svalbard and Jan Mayen' WHEN 'SK' THEN 'Slovakia' WHEN 'SL' THEN 'Sierra Leone'
        WHEN 'SM' THEN 'San Marino' WHEN 'SN' THEN 'Senegal' WHEN 'SO' THEN 'Somalia' WHEN 'SR' THEN 'Suriname'
        WHEN 'SS' THEN 'South Sudan' WHEN 'ST' THEN 'São Tomé and Príncipe' WHEN 'SV' THEN 'El Salvador'
        WHEN 'SX' THEN 'Sint Maarten' WHEN 'SY' THEN 'Syria' WHEN 'SZ' THEN 'Eswatini'
        WHEN 'TC' THEN 'Turks and Caicos' WHEN 'TD' THEN 'Chad' WHEN 'TF' THEN 'French Southern Territories'
        WHEN 'TG' THEN 'Togo' WHEN 'TH' THEN 'Thailand' WHEN 'TJ' THEN 'Tajikistan' WHEN 'TK' THEN 'Tokelau'
        WHEN 'TL' THEN 'Timor-Leste' WHEN 'TM' THEN 'Turkmenistan' WHEN 'TN' THEN 'Tunisia' WHEN 'TO' THEN 'Tonga'
        WHEN 'TR' THEN 'Turkey' WHEN 'TT' THEN 'Trinidad and Tobago' WHEN 'TV' THEN 'Tuvalu' WHEN 'TW' THEN 'Taiwan'
        WHEN 'TZ' THEN 'Tanzania'
        WHEN 'UA' THEN 'Ukraine' WHEN 'UG' THEN 'Uganda' WHEN 'UM' THEN 'U.S. Minor Outlying Islands'
        WHEN 'UY' THEN 'Uruguay' WHEN 'UZ' THEN 'Uzbekistan'
        WHEN 'VA' THEN 'Vatican City' WHEN 'VC' THEN 'Saint Vincent and the Grenadines' WHEN 'VE' THEN 'Venezuela'
        WHEN 'VG' THEN 'British Virgin Islands' WHEN 'VI' THEN 'U.S. Virgin Islands' WHEN 'VN' THEN 'Vietnam'
        WHEN 'VU' THEN 'Vanuatu'
        WHEN 'WF' THEN 'Wallis and Futuna' WHEN 'WS' THEN 'Samoa'
        WHEN 'XK' THEN 'Kosovo'
        WHEN 'YE' THEN 'Yemen' WHEN 'YT' THEN 'Mayotte'
        WHEN 'ZA' THEN 'South Africa' WHEN 'ZM' THEN 'Zambia' WHEN 'ZW' THEN 'Zimbabwe'
        ELSE last_tok  -- raw code for any future ISO addition we haven't named yet
      END;
      RETURN QUERY SELECT last_tok, pretty;
      RETURN;
    END IF;
  END;

  -- Last-resort: free-text country name matches (for users with only a manual
  -- `location` field, no ip_location). Patterns tuned to avoid US/CA collisions
  -- since those branches handled them above.
  RETURN QUERY SELECT c, l FROM (VALUES
    ('GB','United Kingdom','united kingdom|\mengland\M|\mscotland\M|\mwales\M|\buk\b'),
    ('IE','Ireland','\mireland\M'),
    ('AU','Australia','\maustralia\M'),
    ('NZ','New Zealand','new zealand'),
    ('JP','Japan','\mjapan\M'),
    ('KR','South Korea','south korea|\mkorea\M'),
    ('CN','China','\mchina\M'),
    ('IN','India','\mindia\M'),
    ('BR','Brazil','\mbrazil\M'),
    ('MX','Mexico','\mmexico\M'),
    ('DE','Germany','\mgermany\M'),
    ('FR','France','\mfrance\M'),
    ('IT','Italy','\mitaly\M'),
    ('ES','Spain','\mspain\M'),
    ('NL','Netherlands','netherlands|holland'),
    ('SE','Sweden','\msweden\M'),
    ('NO','Norway','\mnorway\M'),
    ('DK','Denmark','\mdenmark\M'),
    ('FI','Finland','\mfinland\M'),
    ('PL','Poland','\mpoland\M'),
    ('CH','Switzerland','\mswitzerland\M'),
    ('AT','Austria','\maustria\M'),
    ('BE','Belgium','\mbelgium\M'),
    ('PT','Portugal','\mportugal\M'),
    ('GR','Greece','\mgreece\M'),
    ('CZ','Czech Republic','\mczech\M'),
    ('RO','Romania','\mromania\M'),
    ('HU','Hungary','\mhungary\M'),
    ('TR','Turkey','\mturkey\M'),
    ('RU','Russia','\mrussia\M'),
    ('UA','Ukraine','\mukraine\M'),
    ('IL','Israel','\misrael\M'),
    ('AE','United Arab Emirates','united arab emirates|\muae\M'),
    ('SA','Saudi Arabia','saudi arabia'),
    ('EG','Egypt','\megypt\M'),
    ('ZA','South Africa','south africa'),
    ('NG','Nigeria','\mnigeria\M'),
    ('AR','Argentina','\margentina\M'),
    ('CL','Chile','\mchile\M'),
    ('CO','Colombia','\mcolombia\M'),
    ('PE','Peru','\mperu\M'),
    ('SG','Singapore','\msingapore\M'),
    ('MY','Malaysia','\mmalaysia\M'),
    ('TH','Thailand','\mthailand\M'),
    ('VN','Vietnam','\mvietnam\M'),
    ('ID','Indonesia','\mindonesia\M'),
    ('PH','Philippines','\mphilippines\M'),
    ('PK','Pakistan','\mpakistan\M'),
    ('BD','Bangladesh','\mbangladesh\M')
  ) AS s(c, l, pat)
  WHERE t ~* pat
  LIMIT 1;
END;
$$;

-- 3. Backfill profiles ---------------------------------------------------------
-- Postgres doesn't allow the UPDATE target to be referenced from a FROM entry,
-- so we precompute the resolution in a CTE (where a plain lateral join works)
-- and then join back to the target by id.

WITH resolved_profiles AS (
  SELECT p.id, r.region_code, r.region_label
  FROM public.profiles p,
       LATERAL public.resolve_region(
         coalesce(p.ip_location, '') || ' ' || coalesce(p.location, '')
       ) r
  WHERE p.region_code IS NULL
    AND (p.ip_location IS NOT NULL OR p.location IS NOT NULL)
    AND r.region_code IS NOT NULL
)
UPDATE public.profiles p
SET
  region_code = rp.region_code,
  region_label = rp.region_label,
  region_source = 'ip'
FROM resolved_profiles rp
WHERE p.id = rp.id;

-- 4. Backfill clinicians -------------------------------------------------------
-- `clinicians.location` is human-readable text like "Denver, Colorado, USA".

WITH resolved_clinicians AS (
  SELECT c.id, r.region_code, r.region_label
  FROM public.clinicians c,
       LATERAL public.resolve_region(coalesce(c.location, '')) r
  WHERE c.region_code IS NULL
    AND r.region_code IS NOT NULL
)
UPDATE public.clinicians c
SET
  region_code = rc.region_code,
  region_label = rc.region_label
FROM resolved_clinicians rc
WHERE c.id = rc.id;

-- 5. Sanity-check queries (run manually after the migration) -------------------
-- SELECT region_code, region_label, COUNT(*)
--   FROM public.profiles WHERE region_code IS NOT NULL
--   GROUP BY 1, 2 ORDER BY 3 DESC;
-- SELECT region_code, region_label, COUNT(*)
--   FROM public.clinicians WHERE is_active AND region_code IS NOT NULL
--   GROUP BY 1, 2 ORDER BY 3 DESC;
-- SELECT name, location
--   FROM public.clinicians WHERE is_active AND region_code IS NULL;
