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

  -- Other countries (ISO-3166-1 alpha-2)
  RETURN QUERY SELECT c, l FROM (VALUES
    ('GB','United Kingdom','united kingdom|\mengland\M|\mscotland\M|\mwales\M|\buk\b|\mgb\M'),
    ('IE','Ireland','\mireland\M|\mie\M'),
    ('AU','Australia','\maustralia\M|\mau\M'),
    ('NZ','New Zealand','new zealand|\mnz\M'),
    ('DK','Denmark','denmark|\mdk\M'),
    ('NO','Norway','norway|\mno\M'),
    ('SE','Sweden','sweden|\mse\M'),
    ('FI','Finland','finland|\mfi\M'),
    ('NL','Netherlands','netherlands|holland|\mnl\M'),
    ('DE','Germany','germany|\mde\M'),
    ('FR','France','france|\mfr\M'),
    ('IT','Italy','italy|\mit\M'),
    ('PL','Poland','poland|\mpl\M'),
    ('ES','Spain','spain|\mes\M'),
    ('PT','Portugal','portugal|\mpt\M'),
    ('CH','Switzerland','switzerland|\mch\M'),
    ('AT','Austria','austria|\mat\M'),
    ('BE','Belgium','belgium|\mbe\M'),
    ('GR','Greece','greece|\mgr\M'),
    ('CZ','Czech Republic','czech|\mcz\M'),
    ('RO','Romania','romania|\mro\M'),
    ('HU','Hungary','hungary|\mhu\M'),
    ('ZA','South Africa','south africa|\mza\M'),
    ('IN','India','\mindia\M|\min\M')
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
