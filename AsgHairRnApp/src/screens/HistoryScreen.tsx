import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
} from 'react-native';
import { THEME } from '../config/theme';

const STAGE_DETAILS: Record<string, { title: string; desc: string; symptoms: string[]; care: string }> = {
  'Norwood I':        { title: 'Norwood I: Minimal Loss',             desc: 'No visible recession. Follicles are highly active.',                          symptoms: ['Symmetrical density','Intact hairline','Minimal daily shedding'],             care: 'Standard biotin support, high-protein nutrition, and mild shampoos.' },
  'Norwood II':       { title: 'Norwood II: Mild Temple Recession',   desc: 'Symmetrical temple recession; M/V shape beginning.',                          symptoms: ['Mild temple recession','Preserved crown density','V-shape beginning'],        care: 'DHT blocker serums, scalp stimulation, and multivitamins.' },
  'Norwood III':      { title: 'Norwood III: Moderate Recession',     desc: 'Deep recession forming a distinct M, U, or V shape. Clinical alopecia.',      symptoms: ['Deep temple recession','Frontal hairline thinning','Visible scalp under light'], care: 'Medical DHT-blocker therapies or minor FUE transplant.' },
  'Norwood III Vertex':{ title: 'Norwood III Vertex: Crown Loss',     desc: 'Recessed temple hairline combined with crown thinning.',                      symptoms: ['Temple recession','Crown vertex thinning','Frontal hairline intact'],         care: 'PRP/GFC therapy combined with micro-needling or crown FUE.' },
  'Norwood IV':       { title: 'Norwood IV: Frontal & Crown',         desc: 'Significant baldness at both the front hairline and crown with hair bridge.', symptoms: ['Temples receded deeply','Crown bald spot visible','Hair bridge intact'],      care: 'Sapphire FUE transplant recommended (1,800 – 2,500 grafts).' },
  'Norwood V':        { title: 'Norwood V: Severe Hair Loss',         desc: 'Separating hair bridge becomes very thin and sparse.',                        symptoms: ['Frontal and vertex areas enlarge','Bridge thins out','Horseshoe outline'],    care: 'High-density Sapphire FUE / DHI transplant (2,500 – 3,500 grafts).' },
  'Norwood VI':       { title: 'Norwood VI: Conjoined Baldness',      desc: 'Bridge completely gone; front and crown merge into one large bald zone.',     symptoms: ['Merged front-to-back baldness','Sparse top coverage','Donor sides intact'],  care: 'Extensive Sapphire FUE transplant (3,500 – 4,500 grafts) over 2 days.' },
  'Norwood VII':      { title: 'Norwood VII: Extensive Baldness',     desc: 'Only a narrow horseshoe band of hair remains on the sides and back.',         symptoms: ['Complete top baldness','Lower donor boundary','Wispy side texture'],         care: 'Combination of scalp and beard/body hair FUE megasession.' },
  UNCERTAIN:          { title: 'Diffuse Thinning / Uncertain',        desc: 'Pattern presents diffuse thinning rather than standard hairline recession.',  symptoms: ['Reduced density overall','Intact hairline shape','Visible scalp under light'], care: 'PRP/GFC therapy sessions combined with topical clinical hair boosters.' },
};

const ITEMS_PER_PAGE = 3;

type Props = {
  allAnalyses: any[];
  onDrawerOpen: () => void;
  onBack: () => void;
};

function ReportDetail({ result }: { result: any }) {
  const info = STAGE_DETAILS[result?.norwoodStage] || STAGE_DETAILS.UNCERTAIN;
  const graftMin = result?.estimatedGraftRequirement?.minimumGrafts ?? '–';
  const graftMax = result?.estimatedGraftRequirement?.maximumGrafts ?? '–';
  const donorRating = result?.donorArea?.rating ?? '–';
  const density = result?.donorArea?.densityEstimateGraftsPerCm2 ?? null;
  const rec = result?.procedureAssessment?.preliminaryRecommendation ?? '–';

  const rows: [string, string][] = [
    ['Norwood Stage', result?.norwoodStage ?? '–'],
    ['Graft Range', `${graftMin} – ${graftMax} grafts`],
    ['Donor Rating', donorRating],
    ...(density ? [['Hair Density', `${density} grafts/cm²`] as [string,string]] : []),
    ['Procedure', rec],
  ];

  return (
    <View>
      <View style={rd.infoBox}>
        <Text style={rd.infoTitle}>{info.title}</Text>
        <Text style={rd.infoDesc}>{info.desc}</Text>
      </View>
      {rows.map(([label, value], i) => (
        <View key={i}>
          <View style={rd.row}>
            <Text style={rd.rowLabel}>{label}</Text>
            <Text style={rd.rowValue}>{value}</Text>
          </View>
          <View style={rd.div} />
        </View>
      ))}
      <View style={rd.infoBox}>
        <Text style={rd.infoTitle}>Clinical Observations</Text>
        {info.symptoms.map((s, i) => <Text key={i} style={rd.obs}>• {s}</Text>)}
      </View>
      <View style={rd.infoBox}>
        <Text style={rd.infoTitle}>Recommended Next Step</Text>
        <Text style={rd.infoDesc}>{info.care}</Text>
      </View>
    </View>
  );
}

export default function HistoryScreen({ allAnalyses, onDrawerOpen, onBack }: Props) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(allAnalyses.length / ITEMS_PER_PAGE));
  const paged = allAnalyses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openReport = (analysis: any) => {
    const stage = analysis.hairLossStage || 'UNCERTAIN';
    const minG = analysis.estimatedMinGrafts || 1500;
    const maxG = analysis.estimatedMaxGrafts || 2000;
    let parsed: any = null;
    if (analysis.aiAnalysis) { try { parsed = JSON.parse(analysis.aiAnalysis); } catch (_) {} }
    if (!parsed) parsed = { norwoodStage: stage, estimatedGraftRequirement: { minimumGrafts: minG, maximumGrafts: maxG }, donorArea: { rating: analysis.donorAreaQuality || 'GOOD', densityEstimateGraftsPerCm2: analysis.hairDensity }, procedureAssessment: { preliminaryRecommendation: 'FUE' } };
    setSelected(parsed);
    setModalOpen(true);
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={onDrawerOpen}>
          <View style={s.hamLine} /><View style={s.hamLine} /><View style={s.hamLine} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Test History</Text>
          <Text style={s.headerSub}>All AI scalp analysis records</Text>
        </View>
        <View style={s.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {allAnalyses.length > 0 && (
          <View style={s.pageRow}>
            <Text style={s.pageInfo}>{allAnalyses.length} records found</Text>
            <Text style={s.pageInfo}>Page {page} of {totalPages}</Text>
          </View>
        )}

        {allAnalyses.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🧪</Text>
            <Text style={s.emptyTitle}>No Test Records</Text>
            <Text style={s.emptyDesc}>Take a hair test to receive your first AI scalp diagnostic report.</Text>
          </View>
        ) : (
          paged.map((analysis, idx) => {
            const dateStr = analysis.createdAt
              ? new Date(analysis.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : 'Unknown Date';
            const stage = analysis.hairLossStage || 'UNCERTAIN';
            const minG = analysis.estimatedMinGrafts || 1500;
            const maxG = analysis.estimatedMaxGrafts || 2000;
            const num = (page - 1) * ITEMS_PER_PAGE + idx + 1;
            return (
              <View key={analysis.id || idx} style={s.card}>
                <View style={s.cardTop}>
                  <View style={s.numBadge}><Text style={s.numBadgeText}>Test #{num}</Text></View>
                  <View style={s.stageBadge}><Text style={s.stageBadgeText}>{stage}</Text></View>
                </View>
                <Text style={s.cardDate}>{dateStr}</Text>
                <View style={s.statsRow}>
                  <View style={s.stat}><Text style={s.statL}>Est. Grafts</Text><Text style={s.statV}>{minG} – {maxG}</Text></View>
                  <View style={s.statDiv} />
                  <View style={s.stat}><Text style={s.statL}>Donor Area</Text><Text style={s.statV}>{analysis.donorAreaQuality || 'GOOD'}</Text></View>
                  <View style={s.statDiv} />
                  <View style={s.stat}><Text style={s.statL}>Procedure</Text><Text style={s.statV}>FUE</Text></View>
                </View>
                <TouchableOpacity style={s.reportBtn} onPress={() => openReport(analysis)}>
                  <Text style={s.reportBtnText}>View Full Report →</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={s.pagination}>
            <TouchableOpacity style={[s.pgBtn, page === 1 && s.pgBtnOff]} onPress={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <Text style={[s.pgBtnTxt, page === 1 && s.pgBtnTxtOff]}>‹ Prev</Text>
            </TouchableOpacity>
            <View style={s.dots}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setPage(i + 1)} style={[s.dot, page === i + 1 && s.dotActive]} />
              ))}
            </View>
            <TouchableOpacity style={[s.pgBtn, page === totalPages && s.pgBtnOff]} onPress={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <Text style={[s.pgBtnTxt, page === totalPages && s.pgBtnTxtOff]}>Next ›</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Text style={s.backBtnText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Report Modal */}
      <Modal animationType="slide" transparent visible={modalOpen} onRequestClose={() => { setModalOpen(false); setSelected(null); }}>
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHdr}>
              <Text style={s.modalTitle}>Full Diagnostics Report</Text>
              <TouchableOpacity style={s.closeBtn} onPress={() => { setModalOpen(false); setSelected(null); }}>
                <Text style={s.closeBtnTxt}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
              {selected && <ReportDetail result={selected} />}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ── Report-detail mini styles ──────────────────────────────────────────────── */
const rd = StyleSheet.create({
  infoBox: { backgroundColor: THEME.bg, borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 1, borderColor: THEME.cardBorder },
  infoTitle: { fontSize: 12, fontWeight: 'bold', color: THEME.primary, marginBottom: 6 },
  infoDesc: { fontSize: 11, color: THEME.textSecondary, lineHeight: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, alignItems: 'center' },
  rowLabel: { fontSize: 11, color: THEME.textSecondary, fontWeight: '600' },
  rowValue: { fontSize: 12, fontWeight: 'bold', color: THEME.textPrimary },
  div: { height: 1, backgroundColor: THEME.cardBorder },
  obs: { fontSize: 11, color: THEME.textSecondary, marginTop: 4 },
});

/* ── Screen styles ──────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: THEME.headerBg, paddingHorizontal: 16, paddingVertical: 14, paddingTop: 20,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  headerSub: { color: THEME.accent, fontSize: 10, fontWeight: 'bold', marginTop: 1 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hamLine: { width: 22, height: 2.5, backgroundColor: '#fff', borderRadius: 2, marginVertical: 2 },
  scroll: { padding: 20, paddingBottom: 50 },
  pageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  pageInfo: { fontSize: 11, color: THEME.textSecondary, fontWeight: 'bold' },
  empty: { alignItems: 'center', paddingVertical: 70 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.textPrimary, marginBottom: 8 },
  emptyDesc: { fontSize: 12, color: THEME.textSecondary, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
  card: {
    backgroundColor: THEME.card, borderRadius: 20, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: THEME.cardBorder,
    elevation: 3, shadowColor: THEME.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  numBadge: { backgroundColor: THEME.badge, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  numBadgeText: { fontSize: 11, fontWeight: 'bold', color: THEME.badgeText },
  stageBadge: { backgroundColor: 'rgba(232,160,32,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  stageBadgeText: { fontSize: 10, fontWeight: 'bold', color: THEME.accent },
  cardDate: { fontSize: 13, fontWeight: 'bold', color: THEME.textPrimary, marginBottom: 14 },
  statsRow: { flexDirection: 'row', backgroundColor: THEME.bg, borderRadius: 14, padding: 14, marginBottom: 14, alignItems: 'center', borderWidth: 1, borderColor: THEME.cardBorder },
  stat: { flex: 1, alignItems: 'center' },
  statL: { fontSize: 9, color: THEME.textSecondary, fontWeight: 'bold', marginBottom: 4 },
  statV: { fontSize: 11, fontWeight: 'bold', color: THEME.textPrimary, textAlign: 'center' },
  statDiv: { width: 1, height: 28, backgroundColor: THEME.cardBorder },
  reportBtn: {
    backgroundColor: THEME.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    elevation: 3, shadowColor: THEME.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  reportBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  pgBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: THEME.primary },
  pgBtnOff: { backgroundColor: THEME.disabled },
  pgBtnTxt: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  pgBtnTxtOff: { color: THEME.disabledText },
  dots: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.dotInactive, margin: 3 },
  dotActive: { backgroundColor: THEME.dotActive, width: 20, borderRadius: 4 },
  backBtn: { height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  backBtnText: { color: THEME.textSecondary, fontWeight: 'bold', fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(26,10,0,0.55)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '87%', paddingBottom: 40 },
  modalHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: THEME.cardBorder },
  modalTitle: { fontSize: 15, fontWeight: 'bold', color: THEME.textPrimary },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: THEME.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.cardBorder },
  closeBtnTxt: { fontSize: 12, color: THEME.textSecondary, fontWeight: 'bold' },
});
