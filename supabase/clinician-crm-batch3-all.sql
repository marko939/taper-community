-- Batch 3: Oregon, New York, UK, Ireland, Australia additions
-- 11 Oregon + 11 NY + 15 UK + 7 Ireland + 9 Australia = 53 new entries

INSERT INTO public.clinician_crm (name, credentials, clinic, state, address, phone, email_website, description, source, category, practice_type, status)
VALUES

-- ═══════════════════════════════════════
-- OREGON batch 3 (11 entries)
-- ═══════════════════════════════════════

('Audry Van Houweling', 'PMHNP-BC', 'She Soars Psychiatry LLC', 'Oregon', 'Sisters, OR (also Silverton)', NULL, 'shesoarspsych.com', 'Holistic and integrative psychiatric care for women and girls. Functional medicine approach addressing nutrition, genetics, physiology, and environment alongside medication management. Specializes in trauma/PTSD and perinatal mental health.', 'psychologytoday.com', 'holistic psychiatry', 'Solo Practice', 'new'),

('Rebecca Moyes', 'PMHNP', 'Two Rivers Integrative Health', 'Oregon', 'Corvallis, OR', NULL, 'tworiverspsychiatry.com', 'Integrative mental health practice addressing mind, body, and spirit. 23 years clinical experience. Personalized treatment plans for depression, anxiety, PTSD, OCD, ADHD, bipolar.', 'tworiverspsychiatry.com', 'holistic psychiatry', 'Solo Practice', 'new'),

('Dr. Conor Hegewald', 'DO, Board-Certified Psychiatrist', 'Transformative Health & Wellness', 'Oregon', 'Corvallis, OR', '(541) 605-2705', 'transformativehw.com', 'Integrative, patient-centered approach combining medication management, psychotherapy, and lifestyle interventions. Treats mood/anxiety disorders, OCD, ADHD, PTSD, bipolar. Free 15-min consultations.', 'transformativehw.com', 'holistic psychiatry', 'Group Practice', 'new'),

('Amber Hashizume', 'PMHNP', 'Pacific Crest Psychiatry LLC', 'Oregon', 'Albany, OR (telehealth, serves Corvallis area)', '(541) 909-8449', NULL, 'Integrative psychiatry considering the whole person, environment, and life situation. Specializes in anxiety, bipolar, depression, ADHD, PTSD, autism.', 'psychologytoday.com', 'holistic psychiatry', 'Solo Practice', 'new'),

('Tamara Rasmussen', 'PMHNP', 'Skycloud Mental Health', 'Oregon', 'Grants Pass, OR (telehealth statewide)', '(541) 655-3270', 'skycloudhealth.com', 'Holistic medication management specializing in anxiety, depression, PTSD, ADHD, insomnia, chronic pain. Rarely uses benzodiazepines, focuses on thoughtful medication management. Licensed in OR, WA, UT, MN, NV.', 'psychologytoday.com', 'holistic psychiatry', 'Solo Practice', 'new'),

('Jodie Butler', 'PMHNP', 'Jodie Butler PMHNP', 'Oregon', 'Hood River, OR', '(971) 299-1275', 'jodieb.org', 'Mental health medication management for children and adults. Focus on early identification and timely support for anxiety, depression, ADHD, and childhood trauma. In-person and telehealth in OR and WA.', 'jodieb.org', 'pmhnp', 'Solo Practice', 'new'),

('Robin Finney', 'PMHNP', 'Compass Rose Psychiatry', 'Oregon', '320 Central Ave Ste 212, Coos Bay, OR', '(541) 252-8775', 'compassrosepsych.com', '17 years clinical experience treating patients of all ages and conditions. Family-owned practice serving Coos County. In-person and telehealth for southern Oregon coast.', 'compassrosepsych.com', 'pmhnp', 'Solo Practice', 'new'),

('Kora Vanek', 'PMHNP', 'LifeStance Health', 'Oregon', 'Gladstone, OR (near Oregon City)', '(503) 659-5515', 'lifestance.com', 'Integrative mental health combining medication management with evidence-based supplements, lifestyle modifications, and mindfulness. Addresses emotional, psychological, biological, and spiritual well-being.', 'lifestance.com', 'holistic psychiatry', 'Group Practice', 'new'),

('Oregon Psychiatric Partners', 'PAs and PMHNPs', 'Oregon Psychiatric Partners LLP', 'Oregon', 'Eugene, OR (telehealth statewide incl. Roseburg, Medford)', '(541) 726-9912', 'oppclinic.com', 'Psychiatric medication management for adults across Oregon via secure telehealth. Multiple providers covering underserved areas including Roseburg and rural communities.', 'oppclinic.com', 'pmhnp', 'Group Practice', 'new'),

('Dr. Jaimie Yung', 'MD, Board-Certified Psychiatrist', 'Transformative Health & Wellness', 'Oregon', 'Corvallis, OR', '(541) 227-6331', 'transformativehw.com', 'Integrative clinic offering psychiatry, EMDR, ketamine therapy, osteopathic manipulation, dance/art therapy alongside medication management. Multi-modality approach to mental wellness.', 'transformativehw.com', 'holistic psychiatry', 'Group Practice', 'new'),

('SEVA Mental Health & Wellness Group', 'Counselors and PMHNPs', 'SEVA Mental Health & Wellness Group', 'Oregon', 'Tigard, OR (also Sellwood/SE Portland)', '(971) 257-1389', 'sevamhwg.com', 'Counseling and psychiatric medication management with insight-based, client-centered approach. Free 15-minute consultations. Accepts OHP and private insurance.', 'sevamhwg.com', 'holistic psychiatry', 'Group Practice', 'new'),

-- ═══════════════════════════════════════
-- NEW YORK batch 3 (11 entries)
-- ═══════════════════════════════════════

('Dr. Will Siu', 'MD (Harvard/MGH-trained Psychiatrist)', 'Will Siu MD', 'New York', 'Beacon, NY (Hudson Valley; also serves NYC, CO, CT)', NULL, 'willsiumd.com', 'Integrative psychiatrist who views medications as temporary supports and actively manages medication discontinuation for patients who are ready. Former Harvard Medical School faculty.', 'willsiumd.com', 'deprescribing', 'Solo Practice', 'new'),

('Omer Margolin', 'NP (Psychiatric + Family dual-certified)', 'Blue Heron Integrative Psychiatry', 'New York', 'Rhinebeck, NY (Hudson Valley)', '(845) 584-5900', 'blueheronpsych.org', 'Integrative, holistic, and individualized psychiatric care. Services include CBT, DBT, medication management, mindfulness, and holistic integrative approaches. Accepts Aetna, Cigna, Optum.', 'blueheronpsych.org', 'holistic psychiatry', 'Solo Practice', 'new'),

('Brigitte Gordon', 'DNP, PMHNP-BC', 'Hudson Mental Wellness', 'New York', 'Dobbs Ferry, NY (Westchester / Hudson Valley)', '(845) 537-8104', 'hudsonmentalwellness.com', 'Integrative psychiatry practice offering medication management, therapy, and evidence-based integrative modalities. Holistic approach focusing on mind, body, and social factors.', 'hudsonmentalwellness.com', 'holistic psychiatry', 'Solo Practice', 'new'),

('Dr. Naureen Jaffri', 'DO, 20+ years experience', 'Mindful Connections Psychiatry', 'New York', 'Williamsville, NY (Buffalo area)', '(716) 670-5374', 'mindfulconnectionspsychiatry.com', 'Holistic, evidence-based psychiatric care encompassing psychotherapy, medication management, relaxation techniques, CBT, and DBT. Telehealth available.', 'mindfulconnectionspsychiatry.com', 'holistic psychiatry', 'Solo Practice', 'new'),

('Manar Salah', 'PMHNP-BC', 'Integrative NP in Psychiatry', 'New York', 'Lancaster, NY (Buffalo area)', NULL, 'intnppsych.com', 'Holistic, evidence-based, trauma-informed psychiatric care for adults 18+. Comprehensive psychiatric evaluations, medication management, and psychotherapy through integrative approaches.', 'psychologytoday.com', 'holistic psychiatry', 'Solo Practice', 'new'),

('Maureen Conway', 'PMHNP (Vanderbilt, 20+ years)', 'Resilient Psychiatry', 'New York', 'Lewiston & Buffalo, NY', '(716) 454-1876', 'resilientpsychiatryny.com', 'Adult psychiatry with integrative medication management. Specializes in PTSD, anxiety, depression, mood disorders, insomnia, ADHD, OCD. Telemedicine statewide.', 'resilientpsychiatryny.com', 'holistic psychiatry', 'Solo Practice', 'new'),

('Regional Psychiatry PLLC', 'Board-certified psychiatrists and PMHNPs', 'Regional Psychiatry PLLC', 'New York', 'Manhattan & Staten Island, NY (all NYC boroughs)', '(646) 452-8200', 'regionalpsychny.com', 'Psychiatry services including medication management across all NYC boroughs. In-office and telemedicine. Accepts Aetna, Cigna, UHC, BCBS.', 'regionalpsychny.com', 'pmhnp', 'Group Practice', 'new'),

('Dr. Sheenie Ambardar', 'MD (Stanford/Baylor)', 'The Happiness Psychiatrist', 'New York', 'New York, NY (telehealth statewide)', '(646) 956-3585', 'happinesspsychiatrist.com', 'Concierge integrative psychiatry using low-dose medications combined with psychotherapy, inner child work, CBT, walking therapy, meditation, and Kundalini yoga.', 'psychologytoday.com', 'holistic psychiatry', 'Solo Practice', 'new'),

('Dr. Caroline Stamu-O''Brien', 'MD (Mount Sinai, psychopharmacology fellowship)', 'Integrative Psychiatry of NY', 'New York', 'New York, NY (telehealth available)', '(646) 430-5684', 'integrativepsychiatry-ny.com', 'State-of-the-art medication management for all psychiatric disorders. Psychopharmacology, psychodynamic therapy, CBT, supportive psychotherapy, crisis management.', 'integrativepsychiatry-ny.com', 'holistic psychiatry', 'Solo Practice', 'new'),

('Hudson Mind', 'Board-certified psychiatrists (Dr. Marcel Green, Dr. Jonathann Kuo)', 'Hudson Mind', 'New York', 'New York, NY', '(646) 596-7386', 'mind.hudson.health', 'Integrative psychiatry combining evidence-based pharmaceutical care, psychotherapy, and holistic lifestyle intervention. Also offers TMS, ketamine, and psychedelic therapies for treatment-resistant conditions.', 'mind.hudson.health', 'holistic psychiatry', 'Group Practice', 'new'),

('Dr. Magdolna Saringer', 'MD, Board Certified Integrative & Holistic Medicine, IFMCP', 'Magdolna Saringer MD', 'New York', '154 W 70th St, New York City, NY', NULL, 'drsaringer.com', 'Functional medicine psychiatry, root cause analysis (genetics, epigenetics, gut-immune-brain connection, hormonal status). Personalized plans including lifestyle modifications, nutrition, targeted supplements. 41 years experience.', 'drsaringer.com', 'holistic psychiatry', 'Solo Practice', 'new'),

-- ═══════════════════════════════════════
-- UK batch 2 (15 entries)
-- ═══════════════════════════════════════

('BOWS (Benzodiazepine & Opiate Withdrawal Service)', 'NHS specialist multidisciplinary team', 'North London Mental Health / NCL ICB', NULL, 'Camden & Islington, London, England, United Kingdom', NULL, NULL, 'NHS service across 20 GP surgeries providing specialist benzodiazepine, opiate, Z-drug and gabapentinoid deprescribing. Offers full medication reviews, CBT for insomnia, psychology, and support groups.', 'mentalhealthcamden.co.uk', 'deprescribing', 'NHS Service', 'new'),

('REST (Recovery Experience Sleeping Pills & Tranquillisers)', 'Specialist support workers (peer support)', 'Change Grow Live', NULL, 'Camden & Islington, London, England, United Kingdom', NULL, 'changegrowlive.org', 'Support service for people dependent on benzodiazepines, tranquillisers and sleeping tablets. Provides 1:1 tapering advice, weekly evening support groups, and information for those withdrawing.', 'madintheuk.com', 'deprescribing', 'Charity/Support', 'new'),

('Postscript360 (Bristol & District Tranquilliser Project)', 'Specialist prescribed drug dependence charity (est. 1986)', 'Postscript360', NULL, 'Bristol, England, United Kingdom (helpline UK-wide)', '0117 950 0002', 'postscript360.org.uk', 'Specialises in benzodiazepines, Z-drugs, pregabalin, gabapentin and opiate painkiller dependence and withdrawal. Free UK-wide telephone helpline and face-to-face support in Bristol.', 'btpinfo.org.uk', 'deprescribing', 'Charity/Support', 'new'),

('Dr Wayne Kampers', 'MBChB, Consultant Psychiatrist, 25+ years', 'Dr Wayne Kampers Psychiatry', NULL, '10 Harley Street, London, England, United Kingdom', NULL, 'drwaynekampers.co.uk', 'Integrative consultant psychiatrist combining conventional psychiatry with complementary therapies, genetics-based precision medicine. Specialises in chronic pain, ADHD in women, and autonomic nervous system dysfunction.', 'drwaynekampers.co.uk', 'holistic psychiatry', 'Solo Practice', 'new'),

('Dr Peter McCann', 'MBBS, MSc, MRCPsych', 'Private Practice / Castle Craig', NULL, 'Edinburgh, Scotland, United Kingdom (also online UK-wide)', NULL, 'drpetermccann.com', 'Holistic, biological and CBT approach, exploring psycho-education, talking therapy, and lifestyle changes before considering new medications. Specialises in addictions, dependencies, depression, anxiety, PTSD, bipolar.', 'drpetermccann.com', 'holistic psychiatry', 'Solo Practice', 'new'),

('Dr Saleem Tareen MBE', 'MRCPsych, Consultant Psychiatrist (since 1995)', 'Psych Consult Belfast', NULL, '142 Malone Road, Belfast BT9 5LH, Northern Ireland, United Kingdom', '028 9066 7676', 'psychconsultbelfast.co.uk', 'Holistic management plans designed for individual needs. Psychiatric assessments, individualised treatment plans, medication reviews, and second opinions. EMDR-accredited practice.', 'psychconsultbelfast.co.uk', 'holistic psychiatry', 'Solo Practice', 'new'),

('Dr Edward Noble', 'MRCPsych, MSc Psychotherapeutic Approaches', 'Holywood Private Clinic', NULL, 'Holywood (near Belfast), Northern Ireland, United Kingdom', '028 9042 2500', 'holywoodprivateclinic.com', 'General adult psychiatrist using psychotherapeutic approaches in diagnosis and treatment. Treats depression, anxiety, OCD, bipolar, psychosis with an integrative mindset.', 'holywoodprivateclinic.com', 'holistic psychiatry', 'Group Practice', 'new'),

('Dr Raman Sakhuja', 'Consultant Psychiatrist (General Adult + Addiction)', 'Wales Psychiatry Centre', NULL, 'Cardiff, South Wales, United Kingdom', NULL, 'walespsychiatrycentre.com', 'First psychiatry centre in Wales with multi-disciplinary team. Holistic approach to recovery from mental health difficulties. Also covers addiction psychiatry relevant for prescribed drug dependence.', 'walespsychiatrycentre.com', 'holistic psychiatry', 'Group Practice', 'new'),

('Dr Tayyeb Tahir', 'Consultant Psychiatrist', 'Cardiff Psychiatrist', NULL, 'Cardiff, Wales, United Kingdom', NULL, 'cardiffpsychiatrist.co.uk', 'Bio-psychosocial approach working with patients holistically. Manages psychological consequences of chronic physical illness, chronic pain, chronic fatigue, health anxiety. Remote and face-to-face consultations.', 'cardiffpsychiatrist.co.uk', 'holistic psychiatry', 'Solo Practice', 'new'),

('Integrative Health Online', 'Multi-practitioner integrative health practice', 'Integrative Health Online (Dialogos Ltd)', NULL, '66A High Street, Tunbridge Wells, Kent, England, United Kingdom', '+44 7803 432347', 'integrativehealthonline.uk', 'Integrative medicine approach to psychiatry blending conventional medication with holistic focus. Services include counselling, psychotherapy, neurodiversity support, and integrative GP/psychiatry.', 'integrativehealthonline.uk', 'holistic psychiatry', 'Group Practice', 'new'),

('Antidepressant Risks Support Groups (Katinka Blackford Newman)', 'Peer support / advocacy', 'Antidepressant Risks', NULL, 'London (Online UK-wide), England, United Kingdom', NULL, 'antidepressantrisks.org', 'Peer support groups for people tapering off and withdrawing from psychiatric medication. Research influenced BBC Panorama and NICE guidelines on safe antidepressant tapering.', 'antidepressantrisks.org', 'deprescribing', 'Charity/Support', 'new'),

('Pall Mall Medical Psychiatry', 'CQC-rated Good, team of consultant psychiatrists', 'Pall Mall Medical', NULL, 'Manchester and Liverpool, England, United Kingdom', '0161 394 0314', 'pallmallmedical.co.uk', 'Private psychiatry with no waiting lists and no GP referral required. Medication reviews, psychiatric assessments, flexible appointment times including evenings and weekends.', 'pallmallmedical.co.uk', 'holistic psychiatry', 'Group Practice', 'new'),

('The Bridge Project', 'Registered charity (est. 1985)', 'The Bridge Project', NULL, 'Bradford, West Yorkshire, England, United Kingdom', NULL, 'thebridgeproject.org.uk', 'Independent charity helping patients safely withdraw from prescribed medications. Works with GP practices to identify and support patients on long-term prescribed drugs associated with dependence.', 'bjgp.org', 'deprescribing', 'Charity/Support', 'new'),

('The St Andrews Practice', 'Clinical Psychologists, Psychiatrists, OTs', 'The St Andrews Practice', NULL, 'St Andrews, Fife, Scotland, United Kingdom (remote UK-wide)', NULL, 'thestandrewspractice.com', 'Award-winning multi-disciplinary mental health and neurodiversity service. Assessments, psychological interventions, medication management including titration with whole-person integrative approach.', 'thestandrewspractice.com', 'holistic psychiatry', 'Group Practice', 'new'),

('Outro Health UK', 'Clinical team trained in hyperbolic tapering (Dr Mark Horowitz)', 'Outro Health', NULL, 'Online UK-wide, United Kingdom', NULL, 'outro.com', 'Evidence-based antidepressant tapering platform using the hyperbolic tapering method. Pairs patients with trained clinicians for personalised dose-reduction plans with ongoing monitoring and support.', 'outro.com', 'deprescribing', 'Virtual Practice', 'new'),

-- ═══════════════════════════════════════
-- IRELAND batch 2 (7 entries)
-- ═══════════════════════════════════════

('Dr. Helena Medjugorac', 'Consultant Psychiatrist', 'MH Clinic', NULL, 'Dublin, Ireland', NULL, 'mhclinic.ie', 'Integrative, trauma-informed psychiatrist specializing in adult mental health including ADHD, depression, complex trauma. Holistic, patient-centered approach with personalized treatment plans.', 'mhclinic.ie', 'holistic psychiatry', 'Solo Practice', 'new'),

('Dr. Josip Dujmovic', 'Consultant Psychiatrist, Member College of Psychiatrists of Ireland', 'Private Psychiatric Practice', NULL, '71 Dame Street, Dublin 2, Ireland', NULL, 'josipdujmovic.ie', 'Psychoanalytically-oriented, trauma-competent psychiatrist who focuses on precise and pragmatic use of medication. Emphasizes understanding root causes rather than symptom suppression alone.', 'josipdujmovic.ie', 'holistic psychiatry', 'Solo Practice', 'new'),

('Dr. Vaiva Bugaite', 'Consultant Psychiatrist', 'Private Therapy Clinic Ireland', NULL, 'Nenagh, Co. Tipperary, Ireland (also online)', NULL, 'privatetherapyclinic.ie', 'CBT-based psychotherapy for anxiety, mood, and personality difficulties. Part of holistic multidisciplinary team. Where clinically appropriate, supports clients wishing to safely taper off long-term medication.', 'privatetherapyclinic.ie', 'holistic psychiatry', 'Group Practice', 'new'),

('BetterCare', 'Team of licensed psychiatrists, psychologists, psychotherapists', 'BetterCare', NULL, 'Dublin, Ireland (online and in-person across Ireland)', NULL, 'bettercare.ie', 'Ireland''s private mental health platform integrating counselling, psychotherapy, psychology, and psychiatry. Holistic approach with collaborative care, medication management, and therapeutic guidance.', 'bettercare.ie', 'holistic psychiatry', 'Group Practice', 'new'),

('RuMu Psychiatry', 'Consultant Psychiatrist-led multidisciplinary team', 'RuMu Psychiatry', NULL, 'Dublin, Galway, Cork, and the Midlands, Ireland', NULL, 'rumu-psychiatry.ie', 'Holistic approach to psychiatric healthcare with private clinics in multiple Irish cities. Multidisciplinary team led by consultant psychiatrists.', 'rumu-psychiatry.ie', 'holistic psychiatry', 'Group Practice', 'new'),

('The Goldsmith Clinic', 'Consultant Psychiatrist, Member RCPsych', 'The Goldsmith Clinic', NULL, 'Stillorgan, South Dublin, Ireland', NULL, 'thegoldsmithclinic.ie', 'Outpatient clinic providing holistic care for addiction, depression, anxiety, eating disorders, trauma. Combines consultant psychiatrist review with individual, group, and family therapy.', 'thegoldsmithclinic.ie', 'holistic psychiatry', 'Group Practice', 'new'),

('Taper Safer / PROTECT Study (Trinity College Dublin)', 'Prof. Agnes Higgins, Dr. Cathal Cadogan', 'Trinity College Dublin (Research)', NULL, 'Dublin, Ireland', NULL, 'tapersafer.org', 'Ireland''s leading research initiative on safely reducing and stopping psychiatric medications. PROTECT study identifies priorities for future deprescribing research. Key resource for Irish patients seeking tapering information.', 'tapersafer.org', 'deprescribing', 'Research/Resource', 'new'),

-- ═══════════════════════════════════════
-- AUSTRALIA batch 2 (9 entries)
-- ═══════════════════════════════════════

('TaperMate Clinic', 'Pharmacist-led deprescribing service', 'TaperMate Clinic', NULL, 'Canberra, ACT, Australia (telehealth Australia-wide)', NULL, 'tapermate.com.au', 'Pharmacist-led telehealth deprescribing service specifically for patients wanting to stop psychotropic medications. Creates personalized tapering plans following the Maudsley Deprescribing approach (hyperbolic tapering).', 'tapermate.com.au', 'deprescribing', 'Virtual Practice', 'new'),

('Dr. Ana Musarevski', 'MBBS, FRANZCP', 'Nourishing Minds Psychiatry', NULL, 'North Sydney, NSW, Australia (telehealth only)', '02 9052 1893', 'nourishingminds.com.au', 'Integrative telehealth psychiatry combining Western medicine with Eastern wisdom and holistic approaches. Examines genetics, nutrient levels, metabolic/hormonal health, and gut-brain connection.', 'nourishingminds.com.au', 'holistic psychiatry', 'Solo Practice', 'new'),

('Dr. Neva Shebini', 'Consultant Psychiatrist, FRCPsych, EMDR certified', 'Peace of Mind Centre', NULL, 'Cairns, QLD, Australia (telehealth available)', NULL, 'drnevashebini.com.au', 'Integrative psychiatrist specializing in complex trauma, PTSD, dissociative disorders. Uses EMDR, internal family systems, somatic approaches and integrative medicine.', 'drnevashebini.com.au', 'holistic psychiatry', 'Solo Practice', 'new'),

('Dr. Chris Corcos', 'Consultant Psychiatrist, 25+ years', 'National Institute of Integrative Medicine (NIIM)', NULL, 'Hawthorn, Melbourne, VIC, Australia', '(03) 9804 0646', 'niim.com.au', 'Integrative psychiatrist at Australia''s leading integrative medicine institute. Special interest in complex trauma and holistic medical approach including psychotherapies and rational medication prescribing.', 'niim.com.au', 'holistic psychiatry', 'Group Practice', 'new'),

('Dr. Dona Biswas', 'Psychiatrist, Board-certified Neurofeedback, Functional & Integrative Psychiatry', 'ZenWaves Clinic', NULL, 'Blacktown, Sydney, NSW, Australia', NULL, 'zenwavesclinic.net', 'Integrative psychiatry combining supplements, diet, lifestyle changes, neurofeedback, and medication. Offers non-medication treatment options including neurofeedback brain training.', 'zenwavesclinic.net', 'holistic psychiatry', 'Solo Practice', 'new'),

('Dr. Charles Chan', 'Consultant Psychiatrist', 'Mind Oasis Clinic', NULL, 'Strathfield, Sydney, NSW, Australia', '1300 680 000', 'mindoasis.com.au', 'Integrated and holistic approach to mental health with multidisciplinary collaborative care. One of the few clinics in Australia offering collaborative mental health care under one roof.', 'mindoasis.com.au', 'holistic psychiatry', 'Group Practice', 'new'),

('Ascent Psychiatry (Dr. Philip Muller & Dr. Lee Williams)', 'Specialist Psychiatrists', 'Ascent Psychiatry', NULL, 'Robina, Gold Coast, QLD, Australia', NULL, 'ascentpsychiatry.com.au', 'Boutique private mental health clinic offering advanced medication management and integrative psychotherapy. Evidence-based treatment with emotion-focused therapy.', 'ascentpsychiatry.com.au', 'holistic psychiatry', 'Group Practice', 'new'),

('Integrative Psychology & Medicine', 'Team of psychologists and psychiatrists', 'Integrative Psychology & Medicine', NULL, 'East Melbourne, VIC, Australia', '(03) 9663 0355', 'integrativepsychology.net.au', 'Integrative mental health practice providing psychological therapy and psychiatric services. Treatment options discussed collaboratively with patients. Individual, couple, family, and group therapy.', 'integrativepsychology.net.au', 'holistic psychiatry', 'Group Practice', 'new'),

('Fluence Clinic', 'Team of psychiatrists', 'Fluence Clinic', NULL, 'Australia-wide (online telehealth)', NULL, 'fluenceclinic.com', 'Online psychiatry service with experienced psychiatrists providing assessments and treatment. Collaborative approach with GP involvement. Telehealth access across Australia including regional and rural areas.', 'fluenceclinic.com', 'holistic psychiatry', 'Virtual Practice', 'new');
