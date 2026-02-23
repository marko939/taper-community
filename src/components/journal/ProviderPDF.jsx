'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#64748b', marginBottom: 2 },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 16, marginBottom: 8, color: '#1e293b' },
  signature: { fontSize: 9, color: '#64748b', fontStyle: 'italic', marginBottom: 12, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4 },
  table: { marginBottom: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tableRow: { flexDirection: 'row', padding: 5, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  tableRowAlt: { flexDirection: 'row', padding: 5, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9', backgroundColor: '#fafafa' },
  colDate: { width: '18%', fontSize: 9 },
  colDose: { width: '15%', fontSize: 9 },
  colMood: { width: '12%', fontSize: 9 },
  colSymptoms: { width: '55%', fontSize: 9 },
  colHeader: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#475569' },
  noteBlock: { marginBottom: 8, padding: 8, backgroundColor: '#fafafa', borderRadius: 3 },
  noteDate: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#475569', marginBottom: 2 },
  noteText: { fontSize: 9, color: '#334155', lineHeight: 1.4 },
  disclaimer: { marginTop: 24, padding: 10, backgroundColor: '#fef3c7', borderRadius: 4 },
  disclaimerText: { fontSize: 8, color: '#92400e', lineHeight: 1.4 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#94a3b8', textAlign: 'center' },
});

export default function ProviderPDF({ entries = [], profile = {}, assessments = [] }) {
  const drug = profile.drug || 'Medication';
  const name = profile.display_name || 'Patient';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Medication Taper Report</Text>
          <Text style={styles.subtitle}>Patient: {name}</Text>
          <Text style={styles.subtitle}>Primary medication: {drug}</Text>
          <Text style={styles.subtitle}>Generated: {today}</Text>
          <Text style={styles.subtitle}>Source: TaperCommunity (self-reported)</Text>
        </View>

        {/* Drug History Signature */}
        {profile.drug_signature && (
          <View>
            <Text style={styles.sectionTitle}>Drug History</Text>
            <Text style={styles.signature}>{profile.drug_signature}</Text>
          </View>
        )}

        {/* Dose & Mood Log Table */}
        <Text style={styles.sectionTitle}>Dose & Mood Log</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDate, styles.colHeader]}>Date</Text>
            <Text style={[styles.colDose, styles.colHeader]}>Dose</Text>
            <Text style={[styles.colMood, styles.colHeader]}>Mood</Text>
            <Text style={[styles.colSymptoms, styles.colHeader]}>Symptoms</Text>
          </View>
          {sorted.map((entry, i) => (
            <View key={entry.id || i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.colDate}>
                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
              </Text>
              <Text style={styles.colDose}>{entry.current_dose || `${entry.dose_numeric || '—'}mg`}</Text>
              <Text style={styles.colMood}>{entry.mood_score}/10</Text>
              <Text style={styles.colSymptoms}>
                {(entry.symptoms || []).slice(0, 5).join(', ') || 'None'}
              </Text>
            </View>
          ))}
        </View>

        {/* Assessment Scores */}
        {assessments.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Assessment Scores</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colDate, styles.colHeader]}>Date</Text>
                <Text style={[styles.colDose, styles.colHeader]}>Type</Text>
                <Text style={[styles.colMood, styles.colHeader]}>Score</Text>
                <Text style={[styles.colSymptoms, styles.colHeader]}>Severity</Text>
              </View>
              {assessments.map((a, i) => (
                <View key={a.id || i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={styles.colDate}>
                    {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </Text>
                  <Text style={styles.colDose}>{a.type === 'phq9' ? 'PHQ-9' : 'GAD-7'}</Text>
                  <Text style={styles.colMood}>{a.score}</Text>
                  <Text style={styles.colSymptoms}>
                    {a.type === 'phq9'
                      ? (a.score <= 4 ? 'Minimal' : a.score <= 9 ? 'Mild' : a.score <= 14 ? 'Moderate' : a.score <= 19 ? 'Mod. Severe' : 'Severe')
                      : (a.score <= 4 ? 'Minimal' : a.score <= 9 ? 'Mild' : a.score <= 14 ? 'Moderate' : 'Severe')
                    }
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Journal Notes */}
        {sorted.some((e) => e.notes) && (
          <View>
            <Text style={styles.sectionTitle}>Journal Notes</Text>
            {sorted.filter((e) => e.notes).map((entry, i) => (
              <View key={entry.id || i} style={styles.noteBlock}>
                <Text style={styles.noteDate}>
                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {entry.drug ? ` — ${entry.drug}` : ''}
                </Text>
                <Text style={styles.noteText}>{entry.notes}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Disclaimer: This report contains self-reported data from TaperCommunity and is not a medical record.
            It is intended to support conversations between patients and their healthcare providers.
            All information should be verified by a qualified clinician.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by TaperCommunity — tapercommunity.com
        </Text>
      </Page>
    </Document>
  );
}
