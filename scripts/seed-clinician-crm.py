#!/usr/bin/env python3
"""
Parse clinician data from:
  1. ~/Desktop/Clinicians/*.numbers (5 files)
  2. src/lib/deprescribers.js (DEPRESCRIBERS array)

Deduplicate by provider name, merge fields, output SQL seed file.
"""

import numbers_parser
import json
import re
import os
import sys

NUMBERS_DIR = os.path.expanduser('~/Desktop/Clinicians')
DEPRESCRIBERS_JS = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'deprescribers.js')
OUTPUT_SQL = os.path.join(os.path.dirname(__file__), '..', 'supabase', 'clinician-crm-seed.sql')

US_STATES = {
    'alabama': 'Alabama', 'alaska': 'Alaska', 'arizona': 'Arizona', 'arkansas': 'Arkansas',
    'california': 'California', 'colorado': 'Colorado', 'connecticut': 'Connecticut',
    'delaware': 'Delaware', 'florida': 'Florida', 'georgia': 'Georgia', 'hawaii': 'Hawaii',
    'idaho': 'Idaho', 'illinois': 'Illinois', 'indiana': 'Indiana', 'iowa': 'Iowa',
    'kansas': 'Kansas', 'kentucky': 'Kentucky', 'louisiana': 'Louisiana', 'maine': 'Maine',
    'maryland': 'Maryland', 'massachusetts': 'Massachusetts', 'michigan': 'Michigan',
    'minnesota': 'Minnesota', 'mississippi': 'Mississippi', 'missouri': 'Missouri',
    'montana': 'Montana', 'nebraska': 'Nebraska', 'nevada': 'Nevada', 'new hampshire': 'New Hampshire',
    'new jersey': 'New Jersey', 'new mexico': 'New Mexico', 'new york': 'New York',
    'north carolina': 'North Carolina', 'north dakota': 'North Dakota', 'ohio': 'Ohio',
    'oklahoma': 'Oklahoma', 'oregon': 'Oregon', 'pennsylvania': 'Pennsylvania',
    'rhode island': 'Rhode Island', 'south carolina': 'South Carolina', 'south dakota': 'South Dakota',
    'tennessee': 'Tennessee', 'texas': 'Texas', 'utah': 'Utah', 'vermont': 'Vermont',
    'virginia': 'Virginia', 'washington': 'Washington', 'west virginia': 'West Virginia',
    'wisconsin': 'Wisconsin', 'wyoming': 'Wyoming', 'district of columbia': 'District of Columbia',
}

STATE_ABBREVS = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire',
    'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina',
    'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania',
    'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee',
    'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington',
    'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
}


def normalize_state(state_str):
    """Normalize state name from various formats."""
    if not state_str:
        return ''
    s = state_str.strip()
    # Check direct match
    if s.lower() in US_STATES:
        return US_STATES[s.lower()]
    # Check abbreviation
    if s.upper() in STATE_ABBREVS:
        return STATE_ABBREVS[s.upper()]
    return s


def extract_state_from_location(location):
    """Extract US state from a location string like 'Denver, Colorado, USA'."""
    if not location:
        return ''
    # Try to find state name in location
    loc_lower = location.lower()
    for state_lower, state_name in US_STATES.items():
        if state_lower in loc_lower:
            return state_name
    # Try abbreviations (e.g., ", CO,")
    for abbrev, state_name in STATE_ABBREVS.items():
        if re.search(r'\b' + abbrev + r'\b', location):
            return state_name
    return ''


def dedup_key(name):
    """Normalize a provider name for dedup matching."""
    if not name:
        return ''
    k = name.strip().lower()
    k = re.sub(r'[^a-z0-9\s]', '', k)
    k = re.sub(r'\s+', ' ', k).strip()
    return k


def parse_numbers_files():
    """Parse all .numbers files and return list of dicts."""
    entries = []
    files = [
        'deprescribing_providers.numbers',
        'deprescribing_providers_extended.numbers',
        'deprescribing_providers_enhanced.numbers',
        'pmhnp_medication_management_database (1).numbers',
        'pmhnp_medication_management_database (2).numbers',
    ]

    for fname in files:
        fpath = os.path.join(NUMBERS_DIR, fname)
        if not os.path.exists(fpath):
            print(f'  SKIP: {fname} not found')
            continue

        doc = numbers_parser.Document(fpath)
        for sheet in doc.sheets:
            for table in sheet.tables:
                # Find header row
                headers = []
                header_row = -1
                for r in range(min(5, table.num_rows)):
                    row_vals = []
                    for c in range(table.num_cols):
                        try:
                            cell = table.cell(r, c)
                            row_vals.append(str(cell.value) if cell.value is not None else '')
                        except:
                            row_vals.append('')
                    non_empty = [v for v in row_vals if v.strip()]
                    if len(non_empty) >= 3 and any(k in ' '.join(non_empty).lower() for k in ['provider name', 'state']):
                        headers = [v.strip() for v in row_vals]
                        header_row = r
                        break

                if header_row < 0:
                    continue

                # Map headers to standard field names
                header_map = {}
                for i, h in enumerate(headers):
                    hl = h.lower()
                    if 'state' in hl:
                        header_map[i] = 'state'
                    elif 'provider name' in hl:
                        header_map[i] = 'name'
                    elif 'credential' in hl:
                        header_map[i] = 'credentials'
                    elif 'clinic' in hl or 'practice' in hl:
                        header_map[i] = 'clinic'
                    elif 'address' in hl:
                        header_map[i] = 'address'
                    elif 'phone' in hl:
                        header_map[i] = 'phone'
                    elif 'email' in hl or 'website' in hl:
                        header_map[i] = 'email_website'
                    elif 'evidence' in hl or 'services' in hl or 'focus' in hl:
                        header_map[i] = 'description'
                    elif 'practice type' in hl:
                        header_map[i] = 'practice_type'
                    elif 'category' in hl:
                        header_map[i] = 'category'
                    elif 'source' in hl:
                        header_map[i] = 'source'
                    elif 'citation' in hl:
                        header_map[i] = 'source'

                for r in range(header_row + 1, table.num_rows):
                    entry = {'_source_file': fname}
                    for c in range(table.num_cols):
                        if c not in header_map:
                            continue
                        try:
                            cell = table.cell(r, c)
                            v = str(cell.value).strip() if cell.value is not None else ''
                            if v and v != 'None':
                                entry[header_map[c]] = v
                        except:
                            pass

                    # Skip empty/summary rows
                    if not entry.get('name') or entry['name'].lower() in ('count', 'total'):
                        continue
                    # Skip numeric-only names (summary rows)
                    if re.match(r'^[\d.]+$', entry.get('name', '')):
                        continue

                    entries.append(entry)

    return entries


def parse_deprescribers_js():
    """Parse the DEPRESCRIBERS array from deprescribers.js."""
    entries = []
    js_path = os.path.abspath(DEPRESCRIBERS_JS)
    if not os.path.exists(js_path):
        print(f'  SKIP: deprescribers.js not found at {js_path}')
        return entries

    with open(js_path, 'r') as f:
        content = f.read()

    # Extract the JSON array
    match = re.search(r'export const DEPRESCRIBERS\s*=\s*(\[.*\])', content, re.DOTALL)
    if not match:
        print('  SKIP: Could not find DEPRESCRIBERS array')
        return entries

    try:
        arr = json.loads(match.group(1))
    except json.JSONDecodeError:
        print('  SKIP: Could not parse DEPRESCRIBERS JSON')
        return entries

    for item in arr:
        entry = {
            'name': item.get('name', ''),
            'credentials': item.get('role', ''),
            'clinic': item.get('clinic', ''),
            'address': item.get('location', ''),
            'description': item.get('description', ''),
            'source': item.get('source', ''),
            'latitude': item.get('latitude'),
            'longitude': item.get('longitude'),
            '_source_file': 'deprescribers.js',
        }
        # Extract state from location
        entry['state'] = extract_state_from_location(item.get('location', ''))
        entries.append(entry)

    return entries


def merge_entries(existing, new_entry):
    """Merge new_entry fields into existing, keeping the most complete version."""
    for key, val in new_entry.items():
        if key.startswith('_'):
            # Track all source files
            if key == '_source_file':
                existing.setdefault('_source_files', set())
                existing['_source_files'].add(val)
                if '_source_file' in existing:
                    existing['_source_files'].add(existing['_source_file'])
            continue
        if not val:
            continue
        existing_val = existing.get(key, '')
        if not existing_val:
            existing[key] = val
        elif len(str(val)) > len(str(existing_val)):
            existing[key] = val


def escape_sql(s):
    """Escape a string for SQL single quotes."""
    if s is None:
        return 'NULL'
    s = str(s).strip()
    if not s:
        return 'NULL'
    return "'" + s.replace("'", "''") + "'"


def main():
    print('=== Parsing .numbers files ===')
    numbers_entries = parse_numbers_files()
    print(f'  Found {len(numbers_entries)} entries from .numbers files')

    print('\n=== Parsing deprescribers.js ===')
    js_entries = parse_deprescribers_js()
    print(f'  Found {len(js_entries)} entries from deprescribers.js')

    # Combine all entries
    all_entries = numbers_entries + js_entries
    print(f'\n=== Total raw entries: {len(all_entries)} ===')

    # Deduplicate by name
    deduped = {}
    for entry in all_entries:
        key = dedup_key(entry.get('name', ''))
        if not key:
            continue
        if key in deduped:
            merge_entries(deduped[key], entry)
        else:
            deduped[key] = entry.copy()
            deduped[key].setdefault('_source_files', set())
            if '_source_file' in entry:
                deduped[key]['_source_files'].add(entry['_source_file'])

    print(f'  After dedup: {len(deduped)} unique entries')

    # Normalize states
    for key, entry in deduped.items():
        raw_state = entry.get('state', '')
        entry['state'] = normalize_state(raw_state)
        # If no state, try to extract from address
        if not entry['state'] and entry.get('address'):
            entry['state'] = extract_state_from_location(entry['address'])

    # Sort by state then name
    sorted_entries = sorted(deduped.values(), key=lambda e: (e.get('state', 'ZZZ'), e.get('name', '')))

    # Count by state
    state_counts = {}
    for e in sorted_entries:
        s = e.get('state', 'Unknown')
        state_counts[s] = state_counts.get(s, 0) + 1
    print(f'\n=== Entries by state ===')
    for s in sorted(state_counts.keys()):
        print(f'  {s}: {state_counts[s]}')

    # Generate SQL
    print(f'\n=== Generating SQL seed file ===')
    lines = [
        '-- Clinician CRM seed data',
        '-- Generated by scripts/seed-clinician-crm.py',
        f'-- {len(sorted_entries)} unique entries after deduplication',
        '',
        'INSERT INTO public.clinician_crm (name, credentials, clinic, state, address, phone, email_website, description, source, category, practice_type, latitude, longitude, status)',
        'VALUES',
    ]

    value_lines = []
    for entry in sorted_entries:
        source_files = entry.get('_source_files', set())
        source = entry.get('source', '')
        if source_files:
            file_sources = ', '.join(sorted(source_files))
            source = f'{source} [{file_sources}]' if source else file_sources

        # Determine category
        category = entry.get('category', '')
        if not category:
            if any('deprescrib' in f for f in source_files):
                category = 'deprescribing'
            elif any('pmhnp' in f for f in source_files):
                category = 'pmhnp'
            elif 'deprescribers.js' in source_files:
                category = 'deprescribing'
            else:
                category = 'other'

        lat = entry.get('latitude')
        lng = entry.get('longitude')
        lat_sql = str(lat) if lat else 'NULL'
        lng_sql = str(lng) if lng else 'NULL'

        value_lines.append(
            f'({escape_sql(entry.get("name"))}, '
            f'{escape_sql(entry.get("credentials"))}, '
            f'{escape_sql(entry.get("clinic"))}, '
            f'{escape_sql(entry.get("state"))}, '
            f'{escape_sql(entry.get("address"))}, '
            f'{escape_sql(entry.get("phone"))}, '
            f'{escape_sql(entry.get("email_website"))}, '
            f'{escape_sql(entry.get("description"))}, '
            f'{escape_sql(source)}, '
            f'{escape_sql(category)}, '
            f'{escape_sql(entry.get("practice_type"))}, '
            f'{lat_sql}, {lng_sql}, '
            f"'new')"
        )

    lines.append(',\n'.join(value_lines) + ';')

    with open(os.path.abspath(OUTPUT_SQL), 'w') as f:
        f.write('\n'.join(lines) + '\n')

    print(f'  Written to: {os.path.abspath(OUTPUT_SQL)}')
    print(f'\nDone! {len(sorted_entries)} entries ready to seed.')


if __name__ == '__main__':
    main()
