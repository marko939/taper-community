'use client';

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

const PURPLE = '#5B2E91';
const PURPLE_LIGHT = '#EDE5F4';
const PURPLE_GHOST = '#F7F3FB';
const TEXT_COLOR = '#1E1B2E';
const TEXT_MUTED = '#6B6580';
const BORDER = '#E8E5F0';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: TEXT_COLOR },

  // Header / branding
  headerBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1.5, borderBottomColor: PURPLE },
  logoBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoText: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  brandName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: PURPLE },
  brandSub: { fontSize: 9, color: TEXT_MUTED, marginTop: 1 },

  // Patient info
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, padding: 14, backgroundColor: PURPLE_GHOST, borderRadius: 8 },
  infoCol: {},
  infoLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: TEXT_COLOR },

  // Section headers
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: PURPLE, marginTop: 20, marginBottom: 10, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: BORDER },

  // Summary
  summaryBox: { padding: 14, backgroundColor: PURPLE_GHOST, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: PURPLE, marginBottom: 16 },
  summaryLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: PURPLE, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  summaryText: { fontSize: 10, color: TEXT_COLOR, lineHeight: 1.6 },

  // Drug history
  signature: { fontSize: 9, color: TEXT_MUTED, fontStyle: 'italic', marginBottom: 12, padding: 10, backgroundColor: PURPLE_GHOST, borderRadius: 6 },

  // Charts
  chartContainer: { marginBottom: 16 },
  chartImage: { width: '100%', borderRadius: 6, border: `1px solid ${BORDER}` },
  chartLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: TEXT_MUTED, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Tables
  table: { marginBottom: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: PURPLE, padding: 7, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  tableHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tableRowAlt: { flexDirection: 'row', padding: 6, borderBottomWidth: 0.5, borderBottomColor: BORDER, backgroundColor: PURPLE_GHOST },
  colDate: { width: '18%', fontSize: 9 },
  colDose: { width: '15%', fontSize: 9 },
  colMood: { width: '12%', fontSize: 9 },
  colSymptoms: { width: '55%', fontSize: 9, color: TEXT_MUTED },

  // Assessment table
  colAType: { width: '20%', fontSize: 9 },
  colAScore: { width: '15%', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  colASeverity: { width: '25%', fontSize: 9, color: TEXT_MUTED },

  // Notes
  noteBlock: { marginBottom: 8, padding: 10, backgroundColor: PURPLE_GHOST, borderRadius: 6 },
  noteDate: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: PURPLE, marginBottom: 3 },
  noteText: { fontSize: 9, color: TEXT_COLOR, lineHeight: 1.5 },

  // Disclaimer
  disclaimer: { marginTop: 20, padding: 12, backgroundColor: '#FEF3C7', borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#D97706' },
  disclaimerTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  disclaimerText: { fontSize: 8, color: '#92400E', lineHeight: 1.5 },

  // Footer
  footer: { position: 'absolute', bottom: 28, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 7, color: TEXT_MUTED },
  footerBrand: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: PURPLE },
});

export default function ProviderPDF({ entries = [], profile = {}, assessments = [], summary = '', moodChartImage = null, assessmentChartImage = null }) {
  const drug = profile.drug || 'Medication';
  const name = profile.display_name || 'Patient';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstDate = sorted.length > 0 ? new Date(sorted[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const lastDate = sorted.length > 0 ? new Date(sorted[sorted.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const sortedAssessments = [...assessments].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Branded Header ── */}
        <View style={styles.headerBar}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <View>
            <Text style={styles.brandName}>TaperCommunity</Text>
            <Text style={styles.brandSub}>Medication Taper Report</Text>
          </View>
        </View>

        {/* ── Patient Info Bar ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Patient</Text>
            <Text style={styles.infoValue}>{name}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Medication</Text>
            <Text style={styles.infoValue}>{drug}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Tracking Period</Text>
            <Text style={styles.infoValue}>{firstDate} — {lastDate}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Generated</Text>
            <Text style={styles.infoValue}>{today}</Text>
          </View>
        </View>

        {/* ── AI Summary ── */}
        {summary ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Clinical Summary (AI-Generated)</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}

        {/* ── Drug History ── */}
        {profile.drug_signature && (
          <View>
            <Text style={styles.sectionTitle}>Drug History</Text>
            <Text style={styles.signature}>{profile.drug_signature}</Text>
          </View>
        )}

        {/* ── Dose & Mood Chart ── */}
        {moodChartImage && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Dose & Mood Over Time</Text>
            <Image src={moodChartImage} style={styles.chartImage} />
          </View>
        )}

        {/* ── Assessment Chart ── */}
        {assessmentChartImage && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Mental Health Assessments</Text>
            <Image src={assessmentChartImage} style={styles.chartImage} />
          </View>
        )}

        {/* ── Dose & Mood Log Table ── */}
        <Text style={styles.sectionTitle}>Dose & Mood Log ({sorted.length} entries)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDate, styles.tableHeaderText]}>Date</Text>
            <Text style={[styles.colDose, styles.tableHeaderText]}>Dose</Text>
            <Text style={[styles.colMood, styles.tableHeaderText]}>Mood</Text>
            <Text style={[styles.colSymptoms, styles.tableHeaderText]}>Symptoms</Text>
          </View>
          {sorted.map((entry, i) => (
            <View key={entry.id || i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.colDate}>
                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
              </Text>
              <Text style={styles.colDose}>{entry.current_dose || `${entry.dose_numeric || '—'}mg`}</Text>
              <Text style={[styles.colMood, { color: entry.mood_score <= 3 ? '#DC2626' : entry.mood_score >= 7 ? '#16A34A' : TEXT_COLOR }]}>
                {entry.mood_score}/10
              </Text>
              <Text style={styles.colSymptoms}>
                {(entry.symptoms || []).slice(0, 5).join(', ') || 'None'}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Assessment Scores Table ── */}
        {sortedAssessments.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Assessment Scores ({sortedAssessments.length} results)</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colDate, styles.tableHeaderText]}>Date</Text>
                <Text style={[styles.colAType, styles.tableHeaderText]}>Assessment</Text>
                <Text style={[styles.colAScore, styles.tableHeaderText]}>Score</Text>
                <Text style={[styles.colASeverity, styles.tableHeaderText]}>Severity</Text>
              </View>
              {sortedAssessments.map((a, i) => {
                const severity = a.type === 'phq9'
                  ? (a.score <= 4 ? 'Minimal' : a.score <= 9 ? 'Mild' : a.score <= 14 ? 'Moderate' : a.score <= 19 ? 'Mod. Severe' : 'Severe')
                  : (a.score <= 4 ? 'Minimal' : a.score <= 9 ? 'Mild' : a.score <= 14 ? 'Moderate' : 'Severe');
                const sevColor = a.score <= 4 ? '#16A34A' : a.score <= 9 ? '#CA8A04' : a.score <= 14 ? '#EA580C' : '#DC2626';
                return (
                  <View key={a.id || i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                    <Text style={styles.colDate}>
                      {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </Text>
                    <Text style={styles.colAType}>{a.type === 'phq9' ? 'PHQ-9 (Depression)' : 'GAD-7 (Anxiety)'}</Text>
                    <Text style={[styles.colAScore, { color: sevColor }]}>{a.score}/{a.type === 'phq9' ? '27' : '21'}</Text>
                    <Text style={[styles.colASeverity, { color: sevColor }]}>{severity}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Journal Notes ── */}
        {sorted.some((e) => e.notes) && (
          <View>
            <Text style={styles.sectionTitle}>Journal Notes</Text>
            {sorted.filter((e) => e.notes).slice(-10).map((entry, i) => (
              <View key={entry.id || i} style={styles.noteBlock}>
                <Text style={styles.noteDate}>
                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {entry.drug ? ` — ${entry.drug} ${entry.current_dose || ''}` : ''}
                </Text>
                <Text style={styles.noteText}>{entry.notes}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Disclaimer ── */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Important Notice</Text>
          <Text style={styles.disclaimerText}>
            This report contains self-reported data from TaperCommunity and is not a medical record.
            The AI-generated summary is for informational purposes only and should not be considered clinical advice.
            All information should be verified by a qualified clinician. This report is intended to support
            conversations between patients and their healthcare providers.
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Self-reported data — not a medical record</Text>
          <Text style={styles.footerBrand}>TaperCommunity — tapercommunity.com</Text>
        </View>
      </Page>
    </Document>
  );
}
