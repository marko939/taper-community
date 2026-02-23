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

  headerBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1.5, borderBottomColor: PURPLE },
  logoBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoText: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  brandName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: PURPLE },
  brandSub: { fontSize: 9, color: TEXT_MUTED, marginTop: 1 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, padding: 14, backgroundColor: PURPLE_GHOST, borderRadius: 8 },
  infoCol: {},
  infoLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: TEXT_COLOR },

  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: PURPLE, marginTop: 20, marginBottom: 10, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: BORDER },

  reviewBox: { padding: 20, backgroundColor: PURPLE_GHOST, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: PURPLE, marginBottom: 20 },
  reviewLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: PURPLE, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  reviewText: { fontSize: 11, color: TEXT_COLOR, lineHeight: 1.8 },

  chartContainer: { marginBottom: 16 },
  chartImage: { width: '100%', borderRadius: 6, border: `1px solid ${BORDER}` },
  chartLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: TEXT_MUTED, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { flex: 1, marginHorizontal: 4, padding: 12, backgroundColor: PURPLE_GHOST, borderRadius: 8, alignItems: 'center' },
  statValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: PURPLE },
  statLabel: { fontSize: 7, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 3, textAlign: 'center' },

  disclaimer: { marginTop: 24, padding: 12, backgroundColor: '#FEF3C7', borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#D97706' },
  disclaimerTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  disclaimerText: { fontSize: 8, color: '#92400E', lineHeight: 1.5 },

  footer: { position: 'absolute', bottom: 28, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 7, color: TEXT_MUTED },
  footerBrand: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: PURPLE },
});

export default function AIReviewPDF({ profile = {}, review = '', entries = [], assessments = [], moodChartImage = null, assessmentChartImage = null }) {
  const name = profile.display_name || 'Patient';
  const drug = profile.drug || 'Medication';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstDose = sorted.find((e) => e.dose_numeric)?.dose_numeric;
  const lastDose = [...sorted].reverse().find((e) => e.dose_numeric)?.dose_numeric;
  const avgMood = sorted.length > 0
    ? (sorted.reduce((sum, e) => sum + (e.mood_score || 0), 0) / sorted.length).toFixed(1)
    : '—';
  const doseReduction = firstDose && lastDose && firstDose > lastDose
    ? Math.round(((firstDose - lastDose) / firstDose) * 100)
    : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBar}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <View>
            <Text style={styles.brandName}>TaperCommunity</Text>
            <Text style={styles.brandSub}>AI Clinical Review</Text>
          </View>
        </View>

        {/* Patient Info */}
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
            <Text style={styles.infoLabel}>Total Entries</Text>
            <Text style={styles.infoValue}>{entries.length}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Review Date</Text>
            <Text style={styles.infoValue}>{today}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {firstDose && (
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{firstDose}mg</Text>
              <Text style={styles.statLabel}>Starting Dose</Text>
            </View>
          )}
          {lastDose && (
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{lastDose}mg</Text>
              <Text style={styles.statLabel}>Current Dose</Text>
            </View>
          )}
          {doseReduction && (
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{doseReduction}%</Text>
              <Text style={styles.statLabel}>Dose Reduced</Text>
            </View>
          )}
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{avgMood}</Text>
            <Text style={styles.statLabel}>Avg Mood (/10)</Text>
          </View>
          {assessments.length > 0 && (
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{assessments.length}</Text>
              <Text style={styles.statLabel}>Assessments</Text>
            </View>
          )}
        </View>

        {/* AI Review */}
        <View style={styles.reviewBox}>
          <Text style={styles.reviewLabel}>AI-Generated Clinical Review</Text>
          <Text style={styles.reviewText}>{review}</Text>
        </View>

        {/* Charts */}
        {moodChartImage && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Dose & Mood Over Time</Text>
            <Image src={moodChartImage} style={styles.chartImage} />
          </View>
        )}

        {assessmentChartImage && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Mental Health Assessments</Text>
            <Image src={assessmentChartImage} style={styles.chartImage} />
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Important Notice</Text>
          <Text style={styles.disclaimerText}>
            This AI-generated review is based on self-reported patient data from TaperCommunity and is not a medical assessment.
            It is intended to support conversations between patients and their healthcare providers. All clinical decisions
            should be made by a qualified healthcare professional based on their own evaluation.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>AI-generated review — not a medical assessment</Text>
          <Text style={styles.footerBrand}>TaperCommunity — tapercommunity.com</Text>
        </View>
      </Page>
    </Document>
  );
}
