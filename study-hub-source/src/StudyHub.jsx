import React, { useState, useEffect, useCallback, useMemo } from 'react';

const COLORS = {
  cream: '#f0ece0',
  lavenderLight: '#e8d7e6',
  sage: '#8d7e97',
  azure: '#006a7f',
  lavender: '#bdb3c8',
  ink: '#2f2b26',
  white: '#ffffff',
};
const DISPLAY_FONT = "'Fraunces', 'Playfair Display', serif";
const BODY_FONT = "'Josefin Sans', sans-serif";
const DATA_FONT = "'IBM Plex Mono', monospace";
const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Josefin+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');";
const PRINT_STYLE = `
@media print {
  body * { visibility: hidden; }
  #synthesis-print-target, #synthesis-print-target * { visibility: visible; }
  #synthesis-print-target { position: absolute; top: 0; left: 0; }
}`;

const GRACE_LETTERS = ['Gather', 'Reckon', 'Address', 'Cultivate', 'Enrich'];
const SUB_QUESTIONS = [
  'SQ1 — Biomedical: what is physiologically happening in maternal burnout?',
  'SQ2 — Ancestral: what has traditional/ancestral practice historically offered?',
  'SQ3 — Evidence base: what does current clinical evidence say?',
  'SQ4 — Clinical application: what actually happens with real clients?',
  'SQ5 — Health equity: what does racialized chronic stress (weathering) mean for assessment and treatment?',
  'SQ6 — Generational-trauma framework: how does this function clinically, distinct from a biological-transmission claim?',
  'SQ7 — Epistemic boundary: what can/cannot honestly be claimed, and how does the protocol stay honest about that line?',
];

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'syllabus', label: 'Syllabus & calendar' },
  { id: 'checkpoints', label: 'Checkpoints' },
  { id: 'thesis', label: 'Thesis workspace' },
  { id: 'cases', label: 'Case log' },
  { id: 'media', label: 'Dissertation media journal' },
  { id: 'tbr', label: 'Living TBR' },
  { id: 'wordbank', label: 'Word Bank' },
  { id: 'foglog', label: 'Fog Log' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'synthesis', label: 'Weekly synthesis' },
  { id: 'framework', label: 'Framework builder' },
  { id: 'challenge', label: 'Challenge me' },
  { id: 'notes', label: 'Study notes' },
  { id: 'library', label: 'Library' },
  { id: 'citations', label: 'Citation bank' },
  { id: 'questions', label: 'Questions & answers' },
];

// ---------------- SEED DATA ----------------

const SEED_SYLLABUS = [
  // Q1
  { title: 'Hoffmann Ch. 1–2: Introduction + Plant Chemistry basics', quarter: 'Q1', source: 'Hoffmann', hours: 6, status: 'planned' },
  { title: 'Hoffmann Ch. 3–5: Phytochemistry foundations', quarter: 'Q1', source: 'Hoffmann', hours: 10, status: 'planned' },
  { title: 'Hoffmann Ch. 6–8: Phytochemistry, most intensive month', quarter: 'Q1', source: 'Hoffmann', hours: 14, status: 'planned' },
  { title: 'Ganora Phases 1–4', quarter: 'Q1', source: 'Ganora', hours: 20, status: 'planned' },
  { title: 'CWH Family Herbalist — program orientation', quarter: 'Q1', source: 'CWH', hours: 8, status: 'planned' },
  { title: 'Draft dissertation sub-questions 1 & 2', quarter: 'Q1', source: 'Dissertation', hours: 4, status: 'planned' },
  // Q2
  { title: 'Hoffmann Ch. 9–10: Pharmacology + Toxicity, build Safety Flag Page', quarter: 'Q2', source: 'Hoffmann', hours: 10, status: 'planned' },
  { title: 'Hoffmann Ch. 11–12: Formulation + Holistic Model', quarter: 'Q2', source: 'Hoffmann', hours: 10, status: 'planned' },
  { title: 'Hoffmann Ch. 13: Digestive System', quarter: 'Q2', source: 'Hoffmann', hours: 8, status: 'planned' },
  { title: 'CWH Digestive Health module', quarter: 'Q2', source: 'CWH', hours: 18, status: 'planned' },
  { title: 'First client case write-ups (new protocol)', quarter: 'Q2', source: 'Clinical', hours: 6, status: 'planned' },
  // Q3
  { title: 'Hoffmann Ch. 14: Cardiovascular System', quarter: 'Q3', source: 'Hoffmann', hours: 8, status: 'planned' },
  { title: 'Hoffmann Ch. 17: Urinary System', quarter: 'Q3', source: 'Hoffmann', hours: 8, status: 'planned' },
  { title: 'Hoffmann Ch. 15: Respiratory System', quarter: 'Q3', source: 'Hoffmann', hours: 8, status: 'planned' },
  { title: 'CWH corresponding body-system modules', quarter: 'Q3', source: 'CWH', hours: 24, status: 'planned' },
  { title: 'Literature Review Protocol applied to Q3 herb claims', quarter: 'Q3', source: 'Dissertation', hours: 6, status: 'planned' },
  // Q4
  { title: 'Hoffmann Ch. 21: Immune System', quarter: 'Q4', source: 'Hoffmann', hours: 8, status: 'planned' },
  { title: 'Hoffmann Ch. 16: Nervous System (2 months)', quarter: 'Q4', source: 'Hoffmann', hours: 16, status: 'planned' },
  { title: 'CWH Immune + Neurological/Emotional Health', quarter: 'Q4', source: 'CWH', hours: 24, status: 'planned' },
  { title: 'Self-Administered Comprehensive Exam #1', quarter: 'Q4', source: 'Dissertation', hours: 4, status: 'planned' },
  { title: 'Year One Annual Checkpoint', quarter: 'Q4', source: 'Dissertation', hours: 4, status: 'planned' },
  // Q5
  { title: 'Hoffmann Ch. 20: Skin', quarter: 'Q5', source: 'Hoffmann', hours: 8, status: 'planned' },
  { title: 'Hoffmann Ch. 19: Musculoskeletal', quarter: 'Q5', source: 'Hoffmann', hours: 8, status: 'planned' },
  { title: 'Hoffmann Ch. 23: Elderly (reference read)', quarter: 'Q5', source: 'Hoffmann', hours: 4, status: 'planned' },
  { title: 'Ganora Phases 5–7 complete', quarter: 'Q5', source: 'Ganora', hours: 20, status: 'planned' },
  { title: 'CWH Integumentary + Musculoskeletal', quarter: 'Q5', source: 'CWH', hours: 20, status: 'planned' },
  // Q6
  { title: 'Hoffmann Ch. 18: Reproductive System (spans quarter)', quarter: 'Q6', source: 'Hoffmann', hours: 16, status: 'planned' },
  { title: 'Hoffmann Ch. 22: Endocrine System', quarter: 'Q6', source: 'Hoffmann', hours: 8, status: 'planned' },
  { title: 'CWH Reproductive Health (75.5 hrs — its own quarter)', quarter: 'Q6', source: 'CWH', hours: 75.5, status: 'planned' },
  { title: 'Most clinically dense quarter — treat all cases as primary data', quarter: 'Q6', source: 'Dissertation', hours: 6, status: 'planned' },
  // Q7
  { title: 'Hoffmann Ch. 24: Children', quarter: 'Q7', source: 'Hoffmann', hours: 8, status: 'planned' },
  { title: "CWH Children's Health, studied alongside homeschool", quarter: 'Q7', source: 'CWH', hours: 20, status: 'planned' },
  { title: 'Family/lineage chapter drafting', quarter: 'Q7', source: 'Dissertation', hours: 6, status: 'planned' },
  // Q8
  { title: 'Hoffmann Ch. 25: Herbal Actions — build Actions Glossary', quarter: 'Q8', source: 'Hoffmann', hours: 8, status: 'planned' },
  { title: 'Hoffmann Ch. 26: Materia Medica — full 150-monograph review', quarter: 'Q8', source: 'Hoffmann', hours: 16, status: 'planned' },
  { title: 'Self-Administered Comprehensive Exam #2', quarter: 'Q8', source: 'Dissertation', hours: 4, status: 'planned' },
  { title: 'Capstone Synthesis, written', quarter: 'Q8', source: 'Dissertation', hours: 12, status: 'planned' },
  { title: 'AHG application compiled and submitted', quarter: 'Q8', source: 'AHG', hours: 6, status: 'planned' },
];

const SEED_CHECKPOINTS = [
  { title: 'Year One Annual Checkpoint', quarter: 'Q4', done: false,
    items: [
      'Write one-year clinical evolution letter to yourself',
      'AHG audit: educational hours, clinical hours, client count',
      'Phytochemistry progress review (Ganora phases complete)',
      'Content audit: best-performing templates and topics',
      'Self-Administered Comprehensive Exam #1 completed',
      'Dissertation sub-question 1 & 2 progress reviewed',
    ] },
  { title: 'Self-Administered Comprehensive Exam #1', quarter: 'Q4', done: false,
    items: [
      'Pick 3 conditions relevant to your practice',
      'Write constituents involved, from memory, no notes',
      'Write pharmacodynamics/mechanism for each',
      'Write safety and drug interaction profile for each',
      'Write formulation reasoning for each',
      'Write expected clinical outcome for each',
      'Compare to what peer-reviewed evidence actually supports',
    ] },
  { title: 'Year Two Annual Checkpoint', quarter: 'Q8', done: false,
    items: [
      'Full audit per Master Formation System structure',
      'Self-Administered Comprehensive Exam #2 completed',
      'GRACE framework evidence-trail completeness per letter reviewed',
      'Dissertation sub-question progress finalized',
    ] },
  { title: 'Capstone Synthesis', quarter: 'Q8', done: false,
    items: [
      'Draft the four sub-question chapters',
      'Select representative case write-ups (anonymized)',
      'Write honest accounting of where evidence supported/challenged you',
      'Write closing statement: what to study next',
      '15–25 page target reached',
    ] },
];

// ---------------- STORAGE HOOK ----------------

// Standalone build: persists to the browser's localStorage (this is a
// single-user local app with no backend). Data lives in this browser only —
// use the Export button on the dashboard regularly to back it up.
const STORAGE_PREFIX = 'rr-study-hub:';

function useStore(key, initialValue) {
  const fullKey = STORAGE_PREFIX + key;
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(fullKey);
      return raw ? JSON.parse(raw) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });
  const [loaded] = useState(true);

  const save = useCallback((newValue) => {
    setValue(newValue);
    try { localStorage.setItem(fullKey, JSON.stringify(newValue)); }
    catch (e) { console.error('Storage save failed', e); }
  }, [fullKey]);

  return [value, save, loaded];
}

function getAllHubData() {
  const data = {};
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith(STORAGE_PREFIX)) {
      try { data[k.slice(STORAGE_PREFIX.length)] = JSON.parse(localStorage.getItem(k)); }
      catch (e) { /* skip unreadable key */ }
    }
  });
  return data;
}

function restoreAllHubData(data) {
  Object.entries(data).forEach(([k, v]) => {
    localStorage.setItem(STORAGE_PREFIX + k, JSON.stringify(v));
  });
}

// ---------------- MERGE (combine two devices' data instead of overwriting) ----------------
// Used when joining an existing sync key on a device that already has its
// own data, so nothing typed on either device gets silently discarded.
// Arrays of objects with an `id` field are unioned by id — this covers the
// large majority of stores (citations, library, notes, cases, word bank,
// fog log, etc.), since ids are creation timestamps and real collisions
// across two independently-used devices are effectively impossible. Plain
// objects (e.g. { statement: '...' } or { entries: [...] }) are merged key
// by key, recursing into any nested arrays/objects. Scalar leaf values
// (plain strings/numbers, e.g. a thesis statement) can't be blindly
// combined — if both sides have a non-empty, DIFFERENT value, both are
// kept and logged as a conflict for the user to resolve by hand, rather
// than the merge quietly guessing which one was "right."
function mergeValues(path, a, b, conflicts) {
  if (a === undefined) return b;
  if (b === undefined) return a;
  if (JSON.stringify(a) === JSON.stringify(b)) return a;

  if (Array.isArray(a) && Array.isArray(b)) {
    const byId = new Map();
    const noId = [];
    [...a, ...b].forEach(item => {
      if (item && typeof item === 'object' && 'id' in item) {
        // on a genuine id collision, keep whichever object has more filled-in
        // fields, as a simple "more complete" heuristic — logged either way.
        if (byId.has(item.id)) {
          const existing = byId.get(item.id);
          if (JSON.stringify(existing) !== JSON.stringify(item)) {
            conflicts.push(`${path}: two different entries shared id ${item.id} — kept the more detailed one`);
          }
          // "more detailed" = longer serialized content, a simple proxy for
          // which version has more actually filled in. This case should be
          // rare in practice (ids are creation timestamps; two independent
          // devices producing the same id is effectively impossible), so
          // this tiebreak mainly matters for the flagged-conflict path above.
          byId.set(item.id, JSON.stringify(item).length > JSON.stringify(existing).length ? item : existing);
        } else {
          byId.set(item.id, item);
        }
      } else {
        noId.push(item);
      }
    });
    // de-dupe plain-value array entries (e.g. a bare array of strings)
    const dedupedNoId = [...new Set(noId.map(v => JSON.stringify(v)))].map(v => JSON.parse(v));
    return [...byId.values(), ...dedupedNoId];
  }

  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const merged = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    keys.forEach(k => { merged[k] = mergeValues(`${path}.${k}`, a[k], b[k], conflicts); });
    return merged;
  }

  // scalar mismatch (or array-vs-object type mismatch) — keep both, visibly
  if ((typeof a === 'string' && !a.trim()) || a == null) return b;
  if ((typeof b === 'string' && !b.trim()) || b == null) return a;
  conflicts.push(`${path}: local and cloud had different values — kept the cloud version; check this field ("${String(a).slice(0, 60)}" vs "${String(b).slice(0, 60)}")`);
  return b;
}

function mergeAllHubData(localData, cloudData) {
  const conflicts = [];
  const keys = new Set([...Object.keys(localData), ...Object.keys(cloudData)]);
  const merged = {};
  keys.forEach(k => { merged[k] = mergeValues(k, localData[k], cloudData[k], conflicts); });
  return { merged, conflicts };
}


// ---------------- SHARED UI ----------------

function SectionHeader({ children, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: 14 }}>
      <h3 style={{ margin: 0, fontFamily: DISPLAY_FONT, fontSize: 19, fontWeight: 600, color: COLORS.ink, textAlign: 'center' }}>
        {children}
      </h3>
      {right && <div style={{ position: 'absolute', right: 0 }}>{right}</div>}
    </div>
  );
}

function Section({ title, children, right }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <SectionHeader right={right}>{title}</SectionHeader>
      {children}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: COLORS.white, border: `1px solid ${COLORS.lavenderLight}`, borderRadius: 14,
      padding: '16px 18px', marginBottom: 10, textAlign: 'center', ...style,
    }}>
      {children}
    </div>
  );
}

function Collapsible({ title, defaultOpen = true, children, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 14 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
        fontFamily: DISPLAY_FONT, fontSize: 16, color: COLORS.ink,
      }}>
        <span style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', fontSize: 12, color: COLORS.sage }}>▶</span>
        {title}
        {badge != null && (
          <span style={{ fontSize: 11, fontFamily: DATA_FONT, background: COLORS.lavenderLight, color: COLORS.ink, borderRadius: 999, padding: '1px 8px' }}>{badge}</span>
        )}
      </button>
      {open && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
}

function Button({ children, onClick, variant = 'primary', style, type = 'button', disabled = false }) {
  const base = {
    border: 'none', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: BODY_FONT, opacity: disabled ? 0.6 : 1,
  };
  const variants = {
    primary: { background: COLORS.sage, color: '#fff' },
    secondary: { background: COLORS.lavenderLight, color: COLORS.ink },
    outline: { background: 'transparent', color: COLORS.azure, border: `1px solid ${COLORS.azure}` },
    danger: { background: '#fff', color: '#a0524a', border: '1px solid #e3b3b3' },
  };
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

const TextInput = React.forwardRef(function TextInput(props, ref) {
  return <input ref={ref} {...props} style={{
    width: '100%', padding: '9px 11px', borderRadius: 9, border: `1px solid ${COLORS.lavenderLight}`,
    fontSize: 13, fontFamily: BODY_FONT, boxSizing: 'border-box', textAlign: 'center', ...props.style,
  }} />;
});
function TextArea(props) {
  return <textarea {...props} style={{
    width: '100%', padding: '9px 11px', borderRadius: 9, border: `1px solid ${COLORS.lavenderLight}`,
    fontSize: 13, fontFamily: BODY_FONT, boxSizing: 'border-box', minHeight: 74, resize: 'vertical', textAlign: 'center', ...props.style,
  }} />;
}
function Select(props) {
  return <select {...props} style={{
    padding: '9px 11px', borderRadius: 9, border: `1px solid ${COLORS.lavenderLight}`,
    fontSize: 13, fontFamily: BODY_FONT, textAlign: 'center', ...props.style,
  }}>{props.children}</select>;
}
function Badge({ children, color, textColor }) {
  return <span style={{
    display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 999,
    background: color || COLORS.lavenderLight, color: textColor || COLORS.ink, margin: '0 4px 4px 0', fontFamily: BODY_FONT,
  }}>{children}</span>;
}

// ---------------- DASHBOARD ----------------

function Dashboard({ thesis, tasks, questions, checkpoints, cases, mediaJournal, synthesisLog, wordBank, fogLog, setTab, syncPanelProps }) {
  const openQuestions = questions.filter(q => !q.answer).length;
  const totalHours = tasks.reduce((s, t) => s + (Number(t.hours) || 0), 0);
  const doneHours = tasks.filter(t => t.status === 'done').reduce((s, t) => s + (Number(t.hours) || 0), 0);
  const openCheckpoints = checkpoints.filter(c => !c.done).length;
  const contradicting = mediaJournal.filter(m => m.stance === 'Contradicts' || m.stance === 'Complicates').length;
  const wordToRevisit = useMemo(() => {
    const undefined_ = wordBank.filter(w => !w.definition);
    const unpracticed = wordBank.filter(w => w.definition && !w.practiced);
    const pool = undefined_.length ? undefined_ : unpracticed;
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [wordBank]);
  const foggyToRevisit = useMemo(() => {
    const stillFoggy = fogLog.filter(f => f.status !== 'Explained it clean');
    if (stillFoggy.length === 0) return null;
    return stillFoggy[Math.floor(Math.random() * stillFoggy.length)];
  }, [fogLog]);

  return (
    <div>
      <Section title="Working dissertation statement">
        <Card>
          <p style={{ margin: 0, fontSize: 15, fontFamily: DISPLAY_FONT, fontStyle: 'italic', color: COLORS.ink, lineHeight: 1.6 }}>
            {thesis.statement || 'Not yet written — visit Thesis workspace to draft it.'}
          </p>
        </Card>
      </Section>
      <Section title="At a glance">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          <Card><div style={{ fontSize: 22, fontFamily: DATA_FONT, color: COLORS.azure }}>{doneHours}/{totalHours}</div><div style={{ fontSize: 12, color: COLORS.sage }}>Hours complete</div></Card>
          <Card><div style={{ fontSize: 22, fontFamily: DATA_FONT, color: COLORS.azure }}>{tasks.filter(t=>t.status==='done').length}/{tasks.length}</div><div style={{ fontSize: 12, color: COLORS.sage }}>Syllabus items</div></Card>
          <Card><div style={{ fontSize: 22, fontFamily: DATA_FONT, color: COLORS.azure }}>{cases.length}</div><div style={{ fontSize: 12, color: COLORS.sage }}>Cases logged</div></Card>
          <Card><div style={{ fontSize: 22, fontFamily: DATA_FONT, color: COLORS.azure }}>{openCheckpoints}</div><div style={{ fontSize: 12, color: COLORS.sage }}>Checkpoints open</div></Card>
          <Card><div style={{ fontSize: 22, fontFamily: DATA_FONT, color: COLORS.azure }}>{openQuestions}</div><div style={{ fontSize: 12, color: COLORS.sage }}>Open questions</div></Card>
        </div>
      </Section>
      <Section title="Dissertation media">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <Card><div style={{ fontSize: 22, fontFamily: DATA_FONT, color: COLORS.azure }}>{mediaJournal.length}</div><div style={{ fontSize: 12, color: COLORS.sage }}>Media logged</div></Card>
          <Card><div style={{ fontSize: 22, fontFamily: DATA_FONT, color: COLORS.azure }}>{contradicting}</div><div style={{ fontSize: 12, color: COLORS.sage }}>Complicate/contradict thesis</div></Card>
          <Card><div style={{ fontSize: 22, fontFamily: DATA_FONT, color: COLORS.azure }}>{synthesisLog.length}</div><div style={{ fontSize: 12, color: COLORS.sage }}>Weekly syntheses saved</div></Card>
        </div>
      </Section>
      <Section title="Word to revisit">
        {wordToRevisit ? (
          <Card>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, fontWeight: 600 }}>{wordToRevisit.word}</div>
            {wordToRevisit.definition
              ? <p style={{ fontSize: 13, marginTop: 6 }}>{wordToRevisit.definition}</p>
              : <p style={{ fontSize: 13, marginTop: 6, color: COLORS.sage, fontStyle: 'italic' }}>Not yet defined — visit the Word Bank.</p>}
            <div style={{ marginTop: 8 }}><Button variant="outline" onClick={() => setTab('wordbank')}>Open Word Bank</Button></div>
          </Card>
        ) : <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>No words logged yet.</p></Card>}
      </Section>
      <Section title="Something foggy to revisit">
        {foggyToRevisit ? (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, fontWeight: 600 }}>{foggyToRevisit.concept}</div>
              <span style={{ fontSize: 11, color: FOG_STATUS_COLORS[foggyToRevisit.status] || COLORS.sage }}>{foggyToRevisit.status}</span>
            </div>
            {foggyToRevisit.whatIsntClicking && <p style={{ fontSize: 13, marginTop: 6 }}>{foggyToRevisit.whatIsntClicking}</p>}
            <div style={{ marginTop: 8 }}><Button variant="outline" onClick={() => setTab('foglog')}>Open Fog Log</Button></div>
          </Card>
        ) : <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>Nothing foggy logged right now.</p></Card>}
      </Section>
      <Section title="Sync across devices">
        <SyncPanel {...syncPanelProps} />
      </Section>
      <Section title="Backup">
        <ExportImport />
      </Section>
      <Section title="G.R.A.C.E. evidence trail">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {GRACE_LETTERS.map(letter => {
            const count = (thesis.graceLog || []).filter(e => e.letter === letter).length;
            return <Card key={letter}><div style={{ fontSize: 18, fontFamily: DATA_FONT, color: COLORS.sage }}>{count}</div><div style={{ fontSize: 11, color: COLORS.ink }}>{letter}</div></Card>;
          })}
        </div>
      </Section>
      <Section title="Quick links">
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={() => setTab('challenge')}>Get challenged today</Button>
          <Button variant="outline" onClick={() => setTab('framework')}>Work on the framework</Button>
          <Button variant="outline" onClick={() => setTab('checkpoints')}>Review checkpoints</Button>
        </div>
      </Section>
    </div>
  );
}

// ---------------- SYLLABUS & CALENDAR ----------------

function Syllabus({ tasks, saveTasks }) {
  const [form, setForm] = useState({ title: '', quarter: 'Q1', source: '', hours: '', status: 'planned' });
  const quarters = ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'];
  const quarterLabels = {
    Q1: 'Q1 · Sep–Nov 2026 · Foundations', Q2: 'Q2 · Dec 2026–Feb 2027 · Pharmacology & Digestive',
    Q3: 'Q3 · Mar–May 2027 · Cardiovascular / Urinary / Respiratory', Q4: 'Q4 · Jun–Aug 2027 · Immune & Nervous + Year One Checkpoint',
    Q5: 'Q5 · Sep–Nov 2027 · Skin & Musculoskeletal', Q6: 'Q6 · Dec 2027–Feb 2028 · Reproductive & Hormonal',
    Q7: 'Q7 · Mar–May 2028 · Children\u2019s Health & Family', Q8: 'Q8 · Jun–Aug 2028 · Integration & AHG Application',
  };

  const addTask = () => {
    if (!form.title.trim()) return;
    saveTasks([...tasks, { ...form, id: Date.now() }]);
    setForm({ title: '', quarter: form.quarter, source: '', hours: '', status: 'planned' });
  };
  const updateStatus = (id, status) => saveTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  const removeTask = (id) => saveTasks(tasks.filter(t => t.id !== id));

  return (
    <div>
      <Section title="Add a syllabus item">
        <Card style={{ textAlign: 'left' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <TextInput placeholder="Reading, module, or milestone" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: 8 }}>
              <Select value={form.quarter} onChange={e => setForm({ ...form, quarter: e.target.value })}>{quarters.map(q => <option key={q} value={q}>{q}</option>)}</Select>
              <TextInput placeholder="Source" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
              <TextInput placeholder="Hrs" type="number" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} />
              <Button onClick={addTask}>Add</Button>
            </div>
          </div>
        </Card>
      </Section>
      {quarters.map(q => {
        const items = tasks.filter(t => t.quarter === q);
        if (items.length === 0) return null;
        const qHours = items.reduce((s, t) => s + (Number(t.hours) || 0), 0);
        return (
          <Collapsible key={q} title={quarterLabels[q] || q} badge={`${items.length} items · ${qHours} hrs`}>
            {items.map(t => (
              <Card key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.sage }}>{t.source} {t.hours ? `· ${t.hours} hrs` : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}>
                    <option value="planned">Planned</option><option value="in-progress">In progress</option><option value="done">Done</option>
                  </Select>
                  <Button variant="danger" onClick={() => removeTask(t.id)}>Remove</Button>
                </div>
              </Card>
            ))}
          </Collapsible>
        );
      })}
    </div>
  );
}

// ---------------- CHECKPOINTS ----------------

function Checkpoints({ checkpoints, saveCheckpoints, tasks = [] }) {
  const toggleItem = (cpId, idx) => {
    saveCheckpoints(checkpoints.map(cp => cp.id === cpId
      ? { ...cp, checked: { ...cp.checked, [idx]: !((cp.checked || {})[idx]) } }
      : cp));
  };
  const toggleDone = (cpId) => saveCheckpoints(checkpoints.map(cp => cp.id === cpId ? { ...cp, done: !cp.done } : cp));

  return (
    <div>
      <Section title="Interactive checkpoints">
        {checkpoints.map(cp => {
          const checked = cp.checked || {};
          const completedCount = cp.items.filter((_, i) => checked[i]).length;
          const quarterTasks = tasks.filter(t => t.quarter === cp.quarter);
          const quarterDone = quarterTasks.filter(t => t.status === 'done').length;
          return (
            <Card key={cp.id} style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: DISPLAY_FONT, fontSize: 16 }}>{cp.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.sage }}>{cp.quarter} · {completedCount}/{cp.items.length} complete</div>
                  {quarterTasks.length > 0 && (
                    <div style={{ fontSize: 11, color: COLORS.azure, marginTop: 2 }}>
                      {cp.quarter} syllabus progress: {quarterDone}/{quarterTasks.length} items done
                    </div>
                  )}
                </div>
                <Button variant={cp.done ? 'secondary' : 'primary'} onClick={() => toggleDone(cp.id)}>{cp.done ? 'Reopen' : 'Mark checkpoint done'}</Button>
              </div>
              {cp.items.map((item, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '4px 0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!checked[idx]} onChange={() => toggleItem(cp.id, idx)} />
                  <span style={{ textDecoration: checked[idx] ? 'line-through' : 'none', color: checked[idx] ? COLORS.sage : COLORS.ink }}>{item}</span>
                </label>
              ))}
            </Card>
          );
        })}
      </Section>
    </div>
  );
}

// ---------------- THESIS WORKSPACE ----------------

function Thesis({ thesis, saveThesis }) {
  const [draftStatement, setDraftStatement] = useState(thesis.statement || '');
  const [challenge, setChallenge] = useState('');
  const [graceEntry, setGraceEntry] = useState({ letter: 'Gather', note: '' });

  useEffect(() => setDraftStatement(thesis.statement || ''), [thesis.statement]);
  const saveStatement = () => saveThesis({ ...thesis, statement: draftStatement });

  const addChallenge = () => {
    if (!challenge.trim()) return;
    saveThesis({ ...thesis, challenges: [...(thesis.challenges || []), { id: Date.now(), text: challenge, date: new Date().toLocaleDateString() }] });
    setChallenge('');
  };
  const removeChallenge = (id) => saveThesis({ ...thesis, challenges: (thesis.challenges || []).filter(c => c.id !== id) });

  const addGraceEntry = () => {
    if (!graceEntry.note.trim()) return;
    saveThesis({ ...thesis, graceLog: [...(thesis.graceLog || []), { id: Date.now(), ...graceEntry, date: new Date().toLocaleDateString() }] });
    setGraceEntry({ letter: graceEntry.letter, note: '' });
  };
  const removeGraceEntry = (id) => saveThesis({ ...thesis, graceLog: (thesis.graceLog || []).filter(g => g.id !== id) });

  return (
    <div>
      <Section title="Working dissertation statement">
        <Card>
          <TextArea value={draftStatement} onChange={e => setDraftStatement(e.target.value)} placeholder="What does a clinically rigorous, ancestrally-informed herbal protocol for maternal burnout look like?" />
          <div style={{ marginTop: 8 }}><Button onClick={saveStatement}>Save statement</Button></div>
        </Card>
      </Section>
      <Section title="Challenge & revise">
        <Card>
          <TextArea value={challenge} onChange={e => setChallenge(e.target.value)} placeholder="Argue against your own statement, or note where it's proven too narrow or too broad." />
          <div style={{ marginTop: 8 }}><Button onClick={addChallenge}>Log this challenge</Button></div>
        </Card>
        {(thesis.challenges || []).slice().reverse().map(c => (
          <Card key={c.id}>
            <div style={{ fontSize: 12, color: COLORS.sage, marginBottom: 4 }}>{c.date}</div>
            <div style={{ fontSize: 13 }}>{c.text}</div>
            <div style={{ marginTop: 6 }}><Button variant="danger" onClick={() => removeChallenge(c.id)}>Remove</Button></div>
          </Card>
        ))}
      </Section>
      <Section title="G.R.A.C.E. letter log">
        <Card>
          <div style={{ display: 'grid', gap: 8 }}>
            <Select value={graceEntry.letter} onChange={e => setGraceEntry({ ...graceEntry, letter: e.target.value })}>{GRACE_LETTERS.map(l => <option key={l} value={l}>{l}</option>)}</Select>
            <TextInput placeholder="What sharpened your understanding of this letter?" value={graceEntry.note} onChange={e => setGraceEntry({ ...graceEntry, note: e.target.value })} />
            <Button onClick={addGraceEntry}>Log</Button>
          </div>
        </Card>
        {(thesis.graceLog || []).slice().reverse().map(g => (
          <Card key={g.id}>
            <Badge>{g.letter}</Badge><span style={{ fontSize: 12, color: COLORS.sage }}>{g.date}</span>
            <div style={{ fontSize: 13, marginTop: 4 }}>{g.note}</div>
            <div style={{ marginTop: 6 }}><Button variant="danger" onClick={() => removeGraceEntry(g.id)}>Remove</Button></div>
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ---------------- CASE LOG ----------------

const EMPTY_CASE = {
  clientLabel: '', complaint: '', history: '', protocol: '', constituentBasis: '',
  safetyCheck: '', outcome: '', confounds: '', dissertationNote: '', graceLetter: 'Gather',
};

function CaseLog({ cases, saveCases }) {
  const [form, setForm] = useState(EMPTY_CASE);
  const [expanded, setExpanded] = useState(false);

  const addCase = () => {
    if (!form.complaint.trim() && !form.clientLabel.trim()) return;
    saveCases([{ ...form, id: Date.now(), date: new Date().toLocaleDateString() }, ...cases]);
    setForm(EMPTY_CASE);
    setExpanded(false);
  };
  const removeCase = (id) => { if (window.confirm('Delete this case permanently? This cannot be undone.')) saveCases(cases.filter(c => c.id !== id)); };

  const fieldRow = (placeholder, key, area = true) => {
    const Input = area ? TextArea : TextInput;
    return <Input placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ marginBottom: 8 }} />;
  };

  return (
    <div>
      <Section title="Case write-up protocol">
        <Card>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>
            This is your original dissertation data. Every case gets the confounds line — it's the one that turns
            a folder of anecdotes into a real case series.
          </p>
        </Card>
      </Section>
      <Section title={expanded ? 'New case' : 'Log a new case'} right={
        <Button variant="outline" onClick={() => setExpanded(e => !e)}>{expanded ? 'Collapse' : 'Expand form'}</Button>
      }>
        <Card style={{ textAlign: 'left' }}>
          <TextInput placeholder="Client label (initials or code — never a full name)" value={form.clientLabel} onChange={e => setForm({ ...form, clientLabel: e.target.value })} style={{ marginBottom: 8 }} />
          {fieldRow('Presenting complaint', 'complaint')}
          {expanded && <>
            {fieldRow('Relevant history (from intake narrative)', 'history')}
            {fieldRow('Protocol given (herbs, %, form, dose)', 'protocol')}
            {fieldRow('Constituent basis (Ganora phase / Hoffmann chapter)', 'constituentBasis')}
            {fieldRow('Safety check performed (Karch cross-reference, contraindications)', 'safetyCheck')}
            {fieldRow('Outcome at follow-up', 'outcome')}
            {fieldRow('Confounds you could not rule out', 'confounds')}
            {fieldRow('What this adds to or challenges in your dissertation question', 'dissertationNote')}
            <Select value={form.graceLetter} onChange={e => setForm({ ...form, graceLetter: e.target.value })} style={{ marginBottom: 8 }}>
              {GRACE_LETTERS.map(l => <option key={l} value={l}>Most engaged letter: {l}</option>)}
            </Select>
          </>}
          <Button onClick={addCase}>Save case</Button>
        </Card>
      </Section>
      <Section title={`Case log (${cases.length})`}>
        {cases.map(c => (
          <Collapsible key={c.id} title={c.clientLabel || 'Unlabeled case'} badge={c.date} defaultOpen={false}>
            <Card style={{ textAlign: 'left' }}>
              {c.complaint && <p style={{ fontSize: 13 }}><b>Complaint:</b> {c.complaint}</p>}
              {c.history && <p style={{ fontSize: 13 }}><b>History:</b> {c.history}</p>}
              {c.protocol && <p style={{ fontSize: 13 }}><b>Protocol:</b> {c.protocol}</p>}
              {c.constituentBasis && <p style={{ fontSize: 13 }}><b>Constituent basis:</b> {c.constituentBasis}</p>}
              {c.safetyCheck && <p style={{ fontSize: 13 }}><b>Safety check:</b> {c.safetyCheck}</p>}
              {c.outcome && <p style={{ fontSize: 13 }}><b>Outcome:</b> {c.outcome}</p>}
              {c.confounds && <p style={{ fontSize: 13 }}><b>Confounds:</b> {c.confounds}</p>}
              {c.dissertationNote && <p style={{ fontSize: 13, color: COLORS.azure }}><b>Dissertation note:</b> {c.dissertationNote}</p>}
              <Badge>{c.graceLetter}</Badge>
              <div style={{ marginTop: 8 }}><Button variant="danger" onClick={() => removeCase(c.id)}>Remove</Button></div>
            </Card>
          </Collapsible>
        ))}
        {cases.length === 0 && <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>No cases logged yet.</p></Card>}
      </Section>
    </div>
  );
}

// ---------------- EXPORT / IMPORT ----------------

function SyncPanel({ syncKey, syncStatus, lastSyncedAt, onStartSync, onJoinSync, onMergeSync, onStopSync, onManualPush }) {
  const [joinInput, setJoinInput] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  if (!syncKey) {
    return (
      <Card>
        <p style={{ margin: '0 0 10px', fontSize: 13, color: COLORS.sage }}>
          Not syncing yet — this browser's data stays local until you set up a key. Use the same key on every
          device you want kept in sync, exactly like your Library Tracker's sync key.
        </p>
        {!showJoin ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button onClick={onStartSync}>Start syncing this device</Button>
            <Button variant="secondary" onClick={() => setShowJoin(true)}>I have a key already</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
            <TextInput placeholder="Paste your sync key" value={joinInput} onChange={e => setJoinInput(e.target.value)} style={{ maxWidth: 220 }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button onClick={() => onMergeSync(joinInput)}>Join &amp; merge (keep everything)</Button>
              <Button variant="secondary" onClick={() => onJoinSync(joinInput)}>Join &amp; replace with cloud</Button>
            </div>
            <p style={{ fontSize: 11, color: COLORS.sage, maxWidth: 320, margin: 0 }}>
              "Join &amp; merge" combines this device's data with the cloud copy — nothing on either side gets deleted.
              "Join &amp; replace" is the old behavior — this device's local data is discarded in favor of the cloud copy.
              Use merge unless you specifically want to wipe this device's local data.
            </p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <p style={{ margin: '0 0 6px', fontSize: 13, color: COLORS.sage }}>Sync key (use this on every device):</p>
      <p style={{ margin: '0 0 10px', fontFamily: DATA_FONT, fontSize: 15, color: COLORS.ink }}>{syncKey}</p>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: COLORS.sage }}>
        {syncStatus === 'saving' ? 'Syncing...' : syncStatus === 'error' ? 'Could not reach the sync server — this device still works, just not synced right now.' : lastSyncedAt ? `Last synced ${lastSyncedAt}` : 'Not yet synced'}
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="secondary" onClick={onManualPush}>Sync now</Button>
        <Button variant="danger" onClick={onStopSync}>Stop syncing this device</Button>
      </div>
    </Card>
  );
}

function ExportImport() {
  const [message, setMessage] = useState('');

  const doExport = () => {
    const data = getAllHubData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tulsi-grace-study-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Backup downloaded.');
  };

  const doImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!window.confirm('This will overwrite all current data in this browser with the backup file. Continue?')) return;
        restoreAllHubData(data);
        setMessage('Restored. Reloading...');
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        setMessage('That file could not be read as a backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: COLORS.sage }}>
        Everything here lives in this browser only. Back it up regularly — especially before clearing browser data or switching devices.
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button onClick={doExport}>Export all data</Button>
        <label style={{
          border: `1px solid ${COLORS.azure}`, color: COLORS.azure, borderRadius: 999, padding: '8px 16px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: BODY_FONT,
        }}>
          Import backup
          <input type="file" accept="application/json" onChange={doImport} style={{ display: 'none' }} />
        </label>
      </div>
      {message && <p style={{ fontSize: 12, color: COLORS.azure, marginTop: 8 }}>{message}</p>}
    </Card>
  );
}

// ---------------- DISSERTATION MEDIA JOURNAL ----------------

const MEDIA_TYPES = ['Book', 'Study/paper', 'Documentary', 'Podcast', 'Lecture/course', 'Article', 'Other'];
const EVIDENCE_TYPES = ['RCT', 'Cohort study', 'Case series', 'In-vitro', 'Systematic review', 'Traditional use', 'Memoir/narrative', 'Other'];
const THESIS_STANCE = ['Supports', 'Complicates', 'Contradicts', 'Unclear yet'];

const EMPTY_MEDIA = {
  title: '', creator: '', mediaType: 'Book', evidenceType: 'Other', stance: 'Supports',
  subQuestions: [], graceLetters: [], summary: '', critique: '', quote: '',
};

function LibraryBridgeImport({ bridge, saveBridge, onDraftFromImport }) {
  const [siteUrl, setSiteUrl] = useState(bridge.siteUrl || 'https://root-restore-library-tracker.netlify.app');
  const [libraryKey, setLibraryKey] = useState(bridge.libraryKey || '');
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const fetchPending = async () => {
    if (!libraryKey.trim()) { setError('Enter your Library Tracker key first.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${siteUrl.replace(/\/$/, '')}/api/library?key=${encodeURIComponent(libraryKey.trim())}`);
      const json = await res.json();
      const dailyLogs = (json.data && json.data.dailyLogs) || [];
      const importedIds = bridge.importedIds || [];
      const fresh = dailyLogs.filter(l => l.lane === 'Dissertation' && !importedIds.includes(l.id));
      setPending(fresh);
      saveBridge({ ...bridge, siteUrl, libraryKey: libraryKey.trim() });
    } catch (e) {
      setError('Could not reach your Library Tracker — check the site URL and key, and that the app is deployed.');
    } finally {
      setLoading(false);
    }
  };

  const markHandled = (id) => {
    saveBridge({ ...bridge, importedIds: [...(bridge.importedIds || []), id] });
    setPending(prev => prev.filter(p => p.id !== id));
  };

  const draft = (log) => {
    onDraftFromImport(log);
    markHandled(log.id);
  };

  return (
    <Section title="Import from Library Tracker">
      <Card style={{ textAlign: 'left' }}>
        <p style={{ margin: '0 0 10px', fontSize: 12, color: COLORS.sage }}>
          Pulls Dissertation-lane entries from your Daily Reading Log — the same sync key your Library Tracker
          already uses. Drafting an entry carries the title over; you still write the actual critique here.
        </p>
        {expanded && <>
          <TextInput placeholder="Library Tracker site URL" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} style={{ marginBottom: 8 }} />
        </>}
        <div style={{ display: 'flex', gap: 8 }}>
          <TextInput placeholder="Your Library Tracker key" value={libraryKey} onChange={e => setLibraryKey(e.target.value)} style={{ flex: 1 }} />
          <Button onClick={fetchPending} disabled={loading}>{loading ? 'Checking...' : 'Check for handoffs'}</Button>
        </div>
        <button onClick={() => setExpanded(x => !x)} style={{ border: 'none', background: 'none', color: COLORS.sage, fontSize: 11, textDecoration: 'underline', cursor: 'pointer', marginTop: 6, padding: 0 }}>
          {expanded ? 'Hide site URL setting' : 'Using a different site URL?'}
        </button>
        {error && <p style={{ fontSize: 12, color: '#a0524a', marginTop: 8 }}>{error}</p>}
      </Card>
      {pending.length > 0 && pending.map(log => (
        <Card key={log.id} style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{log.title}</div>
          <div style={{ fontSize: 12, color: COLORS.sage }}>{log.dateLabel} · Dissertation lane{log.takeaway ? ` · "${log.takeaway}"` : ''}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center' }}>
            <Button onClick={() => draft(log)}>Draft entry from this</Button>
            <Button variant="secondary" onClick={() => markHandled(log.id)}>Skip — don't ask again</Button>
          </div>
        </Card>
      ))}
    </Section>
  );
}

function DissertationMedia({ entries, saveEntries, onPromoteCitation, onPromoteFrameworkGap, bridge, saveBridge, draftSeed, onConsumeDraftSeed }) {
  const [form, setForm] = useState(EMPTY_MEDIA);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (draftSeed) {
      setForm({ ...EMPTY_MEDIA, title: draftSeed.title, creator: draftSeed.creator || '' });
      setExpanded(true);
      onConsumeDraftSeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftSeed]);

  const toggleMulti = (field, value) => {
    setForm(f => {
      const list = f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value];
      return { ...f, [field]: list };
    });
  };

  const addEntry = () => {
    if (!form.title.trim()) return;
    saveEntries([{ ...form, id: Date.now(), date: new Date().toLocaleDateString() }, ...entries]);
    setForm(EMPTY_MEDIA);
    setExpanded(false);
  };
  const removeEntry = (id) => { if (window.confirm('Delete this media journal entry permanently?')) saveEntries(entries.filter(e => e.id !== id)); };

  const draftFromImport = (log) => {
    setForm({ ...EMPTY_MEDIA, title: log.title });
    setExpanded(true);
  };

  return (
    <div>
      <LibraryBridgeImport bridge={bridge} saveBridge={saveBridge} onDraftFromImport={draftFromImport} />
      <Section title="Dissertation media journal">
        <Card>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>
            For media consumed specifically for the dissertation. This is a stronger, more demanding critique than
            general reading reflection — every entry has to take a stance on your working thesis, not just summarize.
          </p>
        </Card>
      </Section>
      <Section title={expanded ? 'New entry' : 'Log dissertation media'} right={
        <Button variant="outline" onClick={() => setExpanded(e => !e)}>{expanded ? 'Collapse' : 'Expand form'}</Button>
      }>
        <Card style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <TextInput placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ flex: 2 }} />
            <TextInput placeholder="Author/creator" value={form.creator} onChange={e => setForm({ ...form, creator: e.target.value })} style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Select value={form.mediaType} onChange={e => setForm({ ...form, mediaType: e.target.value })} style={{ flex: 1 }}>{MEDIA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</Select>
            <Select value={form.evidenceType} onChange={e => setForm({ ...form, evidenceType: e.target.value })} style={{ flex: 1 }}>{EVIDENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</Select>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: COLORS.azure, marginBottom: 4, textAlign: 'center' }}>Stance against your working thesis (required)</div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {THESIS_STANCE.map(s => (
                <button key={s} onClick={() => setForm({ ...form, stance: s })} style={{
                  border: `1px solid ${form.stance === s ? COLORS.sage : COLORS.lavenderLight}`,
                  background: form.stance === s ? COLORS.sage : '#fff', color: form.stance === s ? '#fff' : COLORS.ink,
                  borderRadius: 999, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: BODY_FONT,
                }}>{s}</button>
              ))}
            </div>
          </div>
          {expanded && <>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: COLORS.azure, marginBottom: 4, textAlign: 'center' }}>Dissertation sub-question(s) this speaks to</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {SUB_QUESTIONS.map(sq => (
                  <button key={sq} onClick={() => toggleMulti('subQuestions', sq)} style={{
                    border: `1px solid ${form.subQuestions.includes(sq) ? COLORS.azure : COLORS.lavenderLight}`,
                    background: form.subQuestions.includes(sq) ? COLORS.azure : '#fff', color: form.subQuestions.includes(sq) ? '#fff' : COLORS.ink,
                    borderRadius: 999, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: BODY_FONT,
                  }}>{sq.split(' — ')[0]}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: COLORS.azure, marginBottom: 4, textAlign: 'center' }}>G.R.A.C.E. letter(s) this bears on</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                {GRACE_LETTERS.map(l => (
                  <button key={l} onClick={() => toggleMulti('graceLetters', l)} style={{
                    border: `1px solid ${form.graceLetters.includes(l) ? COLORS.sage : COLORS.lavenderLight}`,
                    background: form.graceLetters.includes(l) ? COLORS.sage : '#fff', color: form.graceLetters.includes(l) ? '#fff' : COLORS.ink,
                    borderRadius: 999, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: BODY_FONT,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <TextArea placeholder="Summary — what does this actually say?" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} style={{ marginBottom: 8 }} />
            <TextArea placeholder="Critique — where is it strong, where is it thin, what would an honest peer reviewer say?" value={form.critique} onChange={e => setForm({ ...form, critique: e.target.value })} style={{ marginBottom: 8 }} />
            <TextArea placeholder="A quote or passage worth keeping (optional)" value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} style={{ marginBottom: 8 }} />
          </>}
          <Button onClick={addEntry}>Save entry</Button>
        </Card>
      </Section>
      <Section title={`Journal (${entries.length})`}>
        {entries.map(e => (
          <Collapsible key={e.id} title={e.title} badge={e.stance} defaultOpen={false}>
            <Card style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: 6 }}>
                <Badge>{e.mediaType}</Badge><Badge color={COLORS.lavender}>{e.evidenceType}</Badge>
                <Badge color={e.stance === 'Contradicts' ? '#f0d6d6' : COLORS.lavenderLight}>{e.stance}</Badge>
              </div>
              {e.creator && <p style={{ fontSize: 12, color: COLORS.sage, margin: '0 0 6px' }}>{e.creator} · {e.date}</p>}
              {(e.subQuestions || []).map(sq => <Badge key={sq} color={COLORS.lavenderLight}>{sq.split(' — ')[0]}</Badge>)}
              {(e.graceLetters || []).map(l => <Badge key={l}>{l}</Badge>)}
              {e.summary && <p style={{ fontSize: 13, marginTop: 6 }}><b>Summary:</b> {e.summary}</p>}
              {e.critique && <p style={{ fontSize: 13 }}><b>Critique:</b> {e.critique}</p>}
              {e.quote && <p style={{ fontSize: 13, fontStyle: 'italic', color: COLORS.azure }}>"{e.quote}"</p>}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={() => onPromoteCitation(e)}>Send to citation bank</Button>
                {e.stance !== 'Supports' && <Button variant="secondary" onClick={() => onPromoteFrameworkGap(e)}>Send to framework as gap</Button>}
                <Button variant="danger" onClick={() => removeEntry(e.id)}>Remove</Button>
              </div>
            </Card>
          </Collapsible>
        ))}
        {entries.length === 0 && <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>No dissertation media logged yet.</p></Card>}
      </Section>
    </div>
  );
}

// ---------------- WEEKLY SYNTHESIS ----------------

const SYNTHESIS_FORMATS = [
  { id: 'square', label: 'Square post', w: 1080, h: 1080 },
  { id: 'carousel', label: 'Carousel (multi-slide)', w: 1080, h: 1080 },
  { id: 'story', label: 'Story (vertical)', w: 1080, h: 1920 },
  { id: 'printable', label: 'Printable page', w: 850, h: 1100 },
];

function SynthesisSlide({ format, headline, insights, application, weekLabel, slideIndex, slideCount }) {
  const isPrintable = format.id === 'printable';
  const bg = isPrintable ? COLORS.white : COLORS.cream;
  return (
    <div style={{
      width: format.w / 2, height: format.h / 2, background: bg, position: 'relative',
      border: `1px solid ${COLORS.lavenderLight}`, padding: isPrintable ? 50 : 60, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', fontFamily: BODY_FONT,
    }}>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.sage, fontWeight: 700, marginBottom: 10 }}>
        Tulsi &amp; Grace · {weekLabel}{slideCount > 1 ? ` · ${slideIndex + 1}/${slideCount}` : ''}
      </div>
      <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: isPrintable ? 22 : 26, color: COLORS.ink, margin: '0 0 20px', lineHeight: 1.3 }}>{headline}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        {insights.map((ins, i) => (
          <p key={i} style={{ fontSize: isPrintable ? 13 : 15, color: COLORS.ink, margin: 0, lineHeight: 1.5, maxWidth: '90%' }}>
            {ins}
          </p>
        ))}
      </div>
      {application && (
        <p style={{ fontSize: 13, color: COLORS.azure, fontStyle: 'italic', marginTop: 20 }}>How I'm applying this: {application}</p>
      )}
    </div>
  );
}

// ---------------- LIVING TBR ----------------

const TBR_RELEVANCE = ['Y', 'Maybe', 'N'];
const EMPTY_TBR = { title: '', author: '', subject: '', owned: false, relevance: 'Maybe', howSupports: '', priority: 3 };

// ---------------- WORD BANK ----------------

const EMPTY_WORD = { word: '', source: '', definition: '', synonyms: '', antonyms: '', practiced: false };

function WordBankEntry({ entry, onUpdate, onRemove, onDraft }) {
  const [draft, setDraft] = useState(entry);
  const [drafting, setDrafting] = useState(false);
  const [confidence, setConfidence] = useState(null);
  const [draftError, setDraftError] = useState('');

  // Without this, an edit synced in from another device (or the bridge
  // importing a fresh word) would never show here — this component is
  // keyed by entry.id, so React reuses the same instance and its local
  // state otherwise never re-initializes from a changed prop.
  useEffect(() => { setDraft(entry); }, [entry]);

  const save = (patch) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    onUpdate(next);
  };

  const runDraft = async () => {
    setDrafting(true);
    setDraftError('');
    const result = await onDraft(entry.word, entry.source);
    if (result && !result.error) {
      save({
        definition: result.definition,
        synonyms: (result.synonyms || []).join(', '),
        antonyms: (result.antonyms || []).join(', '),
      });
      setConfidence(result.confidence);
    } else {
      setDraftError('Could not draft a definition right now — try again in a moment.');
    }
    setDrafting(false);
  };

  return (
    <Card style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 600 }}>{entry.word}</div>
          {entry.source && <div style={{ fontSize: 11, color: COLORS.sage }}>from {entry.source}</div>}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: COLORS.sage, cursor: 'pointer' }}>
          <input type="checkbox" checked={draft.practiced} onChange={e => save({ practiced: e.target.checked })} />
          Used it
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <TextArea placeholder="Definition" value={draft.definition} onChange={e => save({ definition: e.target.value })} style={{ marginBottom: 6, minHeight: 50 }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <TextInput placeholder="Synonyms, comma separated" value={draft.synonyms} onChange={e => save({ synonyms: e.target.value })} />
          <TextInput placeholder="Antonyms, comma separated" value={draft.antonyms} onChange={e => save({ antonyms: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Button variant="secondary" onClick={runDraft} disabled={drafting}>{drafting ? 'Drafting...' : 'AI draft'}</Button>
          <Button variant="danger" onClick={onRemove}>Remove</Button>
          {confidence && (
            <span style={{ fontSize: 11, color: confidence === 'low' ? '#a0524a' : COLORS.sage }}>
              {confidence === 'low' ? 'Low confidence — double-check this one' : `${confidence} confidence`}
            </span>
          )}
        </div>
        {draftError && <p style={{ fontSize: 12, color: '#a0524a', marginTop: 6 }}>{draftError}</p>}
      </div>
    </Card>
  );
}

function WordBankBridgeImport({ bridge, saveBridge, onImportWord, onGoToMediaJournal }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPending = async () => {
    if (!bridge.libraryKey) { setError('missing_key'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${bridge.siteUrl.replace(/\/$/, '')}/api/library?key=${encodeURIComponent(bridge.libraryKey)}`);
      const json = await res.json();
      const dailyLogs = (json.data && json.data.dailyLogs) || [];
      const importedWordIds = bridge.importedWordIds || [];
      const items = [];
      dailyLogs.forEach(log => {
        (log.words || []).forEach((word, idx) => {
          const id = `word-${log.id}-${idx}`;
          if (!importedWordIds.includes(id)) items.push({ id, word, source: log.title });
        });
      });
      setPending(items);
    } catch (e) {
      setError('Could not reach your Library Tracker.');
    } finally {
      setLoading(false);
    }
  };

  const markHandled = (id) => {
    saveBridge({ ...bridge, importedWordIds: [...(bridge.importedWordIds || []), id] });
    setPending(prev => prev.filter(p => p.id !== id));
  };

  const importWord = (item) => {
    onImportWord(item.word, item.source);
    markHandled(item.id);
  };

  return (
    <Section title="Pull in words from your Daily Reading Log">
      <Card style={{ textAlign: 'left' }}>
        <p style={{ margin: '0 0 10px', fontSize: 12, color: COLORS.sage }}>
          Words logged during any lane of daily reading — Pleasure, Dissertation, or Business — show up here.
        </p>
        <Button onClick={fetchPending} disabled={loading}>{loading ? 'Checking...' : 'Check for new words'}</Button>
        {error === 'missing_key' && (
          <p style={{ fontSize: 12, color: '#a0524a', marginTop: 8 }}>
            Connect your Library Tracker key first —{' '}
            <button onClick={onGoToMediaJournal} style={{ border: 'none', background: 'none', color: COLORS.azure, textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 12 }}>
              go to Dissertation Media Journal
            </button>.
          </p>
        )}
        {error && error !== 'missing_key' && <p style={{ fontSize: 12, color: '#a0524a', marginTop: 8 }}>{error}</p>}
      </Card>
      {pending.map(item => (
        <Card key={item.id} style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{item.word}</div>
              <div style={{ fontSize: 11, color: COLORS.sage }}>from {item.source}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Button onClick={() => importWord(item)}>Add</Button>
              <Button variant="secondary" onClick={() => markHandled(item.id)}>Skip</Button>
            </div>
          </div>
        </Card>
      ))}
    </Section>
  );
}

function WordBank({ words, saveWords, bridge, saveBridge, onGoToMediaJournal }) {
  const [form, setForm] = useState(EMPTY_WORD);
  const [filter, setFilter] = useState('all'); // all | undefined | unpracticed

  const addWord = () => {
    if (!form.word.trim()) return;
    saveWords([{ ...form, id: Date.now(), date: new Date().toLocaleDateString() }, ...words]);
    setForm(EMPTY_WORD);
  };
  const updateWord = (id, patch) => saveWords(words.map(w => w.id === id ? { ...w, ...patch } : w));
  const removeWord = (id) => { if (window.confirm('Remove this word permanently?')) saveWords(words.filter(w => w.id !== id)); };

  const draftDefinition = async (word, source) => {
    try {
      const res = await fetch('/api/word-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, context: source }),
      });
      return await res.json();
    } catch (e) {
      return { error: true };
    }
  };

  const revisitWord = useMemo(() => {
    const undefined_ = words.filter(w => !w.definition);
    const unpracticed = words.filter(w => w.definition && !w.practiced);
    const pool = undefined_.length ? undefined_ : unpracticed;
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [words]);

  const filtered = words.filter(w => {
    if (filter === 'undefined') return !w.definition;
    if (filter === 'unpracticed') return w.definition && !w.practiced;
    return true;
  });

  return (
    <div>
      <Section title="Word Bank">
        <Card>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>
            Every word you underlined and never came back to — now with somewhere to actually come back to.
          </p>
        </Card>
      </Section>

      <WordBankBridgeImport
        bridge={bridge} saveBridge={saveBridge}
        onImportWord={(word, source) => saveWords([{ ...EMPTY_WORD, word, source, id: Date.now(), date: new Date().toLocaleDateString() }, ...words])}
        onGoToMediaJournal={onGoToMediaJournal}
      />

      {revisitWord && (
        <Section title="Revisit">
          <Card>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, fontWeight: 600 }}>{revisitWord.word}</div>
            {revisitWord.definition
              ? <p style={{ fontSize: 13, marginTop: 6 }}>{revisitWord.definition}</p>
              : <p style={{ fontSize: 13, marginTop: 6, color: COLORS.sage, fontStyle: 'italic' }}>No definition yet — scroll down to add one.</p>}
          </Card>
        </Section>
      )}

      <Section title="Add a word">
        <Card style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <TextInput placeholder="Word" value={form.word} onChange={e => setForm({ ...form, word: e.target.value })} style={{ flex: 1 }} />
            <TextInput placeholder="Source (book/article)" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={{ flex: 1 }} />
          </div>
          <Button onClick={addWord}>Add to Word Bank</Button>
        </Card>
      </Section>

      <Section title="Filter">
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All words</option>
            <option value="undefined">Not yet defined</option>
            <option value="unpracticed">Defined but not used yet</option>
          </Select>
        </div>
      </Section>

      <Section title={`Words (${filtered.length})`}>
        {filtered.map(w => (
          <WordBankEntry key={w.id} entry={w} onUpdate={(patch) => updateWord(w.id, patch)} onRemove={() => removeWord(w.id)} onDraft={draftDefinition} />
        ))}
        {filtered.length === 0 && <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>Nothing here yet.</p></Card>}
      </Section>
    </div>
  );
}

// ---------------- FOG LOG ----------------
// Captures concepts/ideas/words that aren't sticking, so struggle becomes
// visible and revisitable instead of silently forgotten. Three status
// stages mirror the underlying 3-step method: Still foggy -> Getting
// clearer -> Explained it clean. The "Explain it back" flow is the actual
// Feynman mechanism: type your current explanation BEFORE seeing your last
// one, so the comparison is honest rather than just re-reading old notes.

const FOG_STATUSES = ['Still foggy', 'Getting clearer', 'Explained it clean'];
const FOG_STATUS_COLORS = { 'Still foggy': '#a0524a', 'Getting clearer': COLORS.lavender, 'Explained it clean': COLORS.sage };
const emptyFog = () => ({ concept: '', context: '', whatIsntClicking: '', seeAlso: '', status: 'Still foggy', explanations: [] });

function FogLogEntry({ entry, onUpdate, onRemove, onCheck }) {
  const [draft, setDraft] = useState(entry);
  const [attempting, setAttempting] = useState(false);
  const [pendingExplanation, setPendingExplanation] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState('');

  // Same fix as WordBankEntry — this component is keyed by entry.id, so
  // without this, an update synced in from another device would never show.
  useEffect(() => { setDraft(entry); }, [entry]);

  const save = (patch) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    onUpdate(next);
  };

  const lastExplanation = draft.explanations && draft.explanations.length
    ? draft.explanations[draft.explanations.length - 1]
    : null;

  const startAttempt = () => {
    setPendingExplanation('');
    setCheckResult(null);
    setCheckError('');
    setAttempting(true);
  };

  const submitAttempt = () => {
    if (!pendingExplanation.trim()) return;
    const nextExplanations = [...(draft.explanations || []), { text: pendingExplanation.trim(), date: new Date().toISOString() }];
    save({ explanations: nextExplanations });
    setAttempting(false);
  };

  const runCheck = async () => {
    if (!pendingExplanation.trim()) return;
    setChecking(true);
    setCheckError('');
    const result = await onCheck(draft.concept, pendingExplanation.trim());
    if (result && !result.error) {
      setCheckResult(result);
    } else {
      setCheckError('Could not get a check right now — try again in a moment.');
    }
    setChecking(false);
  };

  const runCheckOnLast = async () => {
    if (!lastExplanation) return;
    setChecking(true);
    setCheckError('');
    setCheckResult(null);
    const result = await onCheck(draft.concept, lastExplanation.text);
    if (result && !result.error) {
      setCheckResult(result);
    } else {
      setCheckError('Could not get a check right now — try again in a moment.');
    }
    setChecking(false);
  };

  return (
    <Card style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 600 }}>{entry.concept}</div>
          {entry.context && <div style={{ fontSize: 11, color: COLORS.sage }}>from {entry.context}</div>}
        </div>
        <Select value={draft.status} onChange={e => save({ status: e.target.value })} style={{ width: 160 }}>
          {FOG_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {draft.whatIsntClicking && (
        <p style={{ fontSize: 13, marginTop: 8, color: COLORS.ink }}>{draft.whatIsntClicking}</p>
      )}

      <div style={{ marginTop: 10, borderTop: `1px solid ${COLORS.lavenderLight}`, paddingTop: 10 }}>
        <div style={{ fontSize: 12, color: COLORS.sage, marginBottom: 6 }}>
          {draft.explanations && draft.explanations.length > 0
            ? `${draft.explanations.length} explanation attempt${draft.explanations.length === 1 ? '' : 's'} logged`
            : 'No explanation attempts yet'}
        </div>

        {!attempting && (
          <Button variant="secondary" onClick={startAttempt}>
            {lastExplanation ? 'Explain it again' : 'Explain it back'}
          </Button>
        )}

        {attempting && (
          <div style={{ display: 'grid', gap: 8 }}>
            <TextArea
              placeholder="Explain this in your own words — you'll see your last attempt after you submit, not before."
              value={pendingExplanation}
              onChange={e => setPendingExplanation(e.target.value)}
              style={{ minHeight: 70 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <Button onClick={submitAttempt} disabled={!pendingExplanation.trim()}>Save this attempt</Button>
              <Button variant="secondary" onClick={runCheck} disabled={checking || !pendingExplanation.trim()}>
                {checking ? 'Checking...' : 'AI gut-check'}
              </Button>
              <Button variant="danger" onClick={() => setAttempting(false)}>Cancel</Button>
            </div>
            {checkResult && (
              <div style={{ fontSize: 12, background: COLORS.lavenderLight, borderRadius: 9, padding: '8px 12px' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Peer check {checkResult.confidence === 'low' && '(low confidence — double-check this one yourself)'}
                </div>
                {checkResult.feedback}
              </div>
            )}
            {checkError && <p style={{ fontSize: 12, color: '#a0524a' }}>{checkError}</p>}
          </div>
        )}

        {!attempting && lastExplanation && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: COLORS.ink, fontStyle: 'italic' }}>
              Last attempt ({new Date(lastExplanation.date).toLocaleDateString()}): {lastExplanation.text}
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={runCheckOnLast} disabled={checking}>
                {checking ? 'Checking...' : 'Gut-check last attempt'}
              </Button>
            </div>
            {checkResult && (
              <div style={{ fontSize: 12, background: COLORS.lavenderLight, borderRadius: 9, padding: '8px 12px', marginTop: 6 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Peer check {checkResult.confidence === 'low' && '(low confidence — double-check this one yourself)'}
                </div>
                {checkResult.feedback}
              </div>
            )}
            {checkError && <p style={{ fontSize: 12, color: '#a0524a' }}>{checkError}</p>}
          </div>
        )}
      </div>

      {draft.seeAlso && (
        <div style={{ fontSize: 11, color: COLORS.sage, marginTop: 8 }}>See also: {draft.seeAlso}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <Button variant="danger" onClick={onRemove}>Remove</Button>
      </div>
    </Card>
  );
}

function FogLog({ entries, saveEntries }) {
  const [form, setForm] = useState(emptyFog());
  const [filterStatus, setFilterStatus] = useState('All');

  const addEntry = () => {
    if (!form.concept.trim()) return;
    saveEntries([{ ...form, id: Date.now() }, ...entries]);
    setForm(emptyFog());
  };
  const removeEntry = (id) => { if (window.confirm('Remove this from the Fog Log?')) saveEntries(entries.filter(e => e.id !== id)); };
  const updateEntry = (id, patch) => saveEntries(entries.map(e => e.id === id ? { ...e, ...patch } : e));

  const runCheck = async (concept, explanation) => {
    try {
      const res = await fetch('/api/fog-log-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, explanation }),
      });
      const data = await res.json();
      if (data.error) return { error: data.error };
      return data;
    } catch {
      return { error: 'network' };
    }
  };

  const filtered = filterStatus === 'All' ? entries : entries.filter(e => e.status === filterStatus);

  return (
    <div>
      <Section title="Log a sticking point">
        <Card style={{ textAlign: 'left' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <TextInput placeholder="Concept, idea, or word that isn't clicking" value={form.concept} onChange={e => setForm({ ...form, concept: e.target.value })} />
            <TextInput placeholder="Where you hit it (reading, chapter, source)" value={form.context} onChange={e => setForm({ ...form, context: e.target.value })} />
            <TextArea placeholder="What specifically isn't landing? One or two lines is plenty." value={form.whatIsntClicking} onChange={e => setForm({ ...form, whatIsntClicking: e.target.value })} style={{ minHeight: 50 }} />
            <TextInput placeholder="See also (optional — a related Word Bank term, citation, etc.)" value={form.seeAlso} onChange={e => setForm({ ...form, seeAlso: e.target.value })} />
            <Button onClick={addEntry}>Add to Fog Log</Button>
          </div>
        </Card>
      </Section>
      <Section
        title={`Fog Log (${entries.length})`}
        right={
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
            <option value="All">All statuses</option>
            {FOG_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        }
      >
        {filtered.map(e => (
          <FogLogEntry key={e.id} entry={e} onUpdate={(patch) => updateEntry(e.id, patch)} onRemove={() => removeEntry(e.id)} onCheck={runCheck} />
        ))}
        {filtered.length === 0 && <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>Nothing here yet — that's a good thing.</p></Card>}
      </Section>
    </div>
  );
}

function LivingTBR({ items, saveItems, onPromoteToMedia }) {
  const [form, setForm] = useState(EMPTY_TBR);
  const [expanded, setExpanded] = useState(false);
  const [filterOwned, setFilterOwned] = useState('All');
  const [filterRelevance, setFilterRelevance] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');

  const allSubjects = useMemo(() => {
    const set = new Set();
    items.forEach(i => (i.subject || '').split(',').map(s => s.trim()).filter(Boolean).forEach(s => set.add(s)));
    return Array.from(set).sort();
  }, [items]);

  const addItem = () => {
    if (!form.title.trim()) return;
    saveItems([{ ...form, id: Date.now() }, ...items]);
    setForm(EMPTY_TBR);
    setExpanded(false);
  };
  const removeItem = (id) => { if (window.confirm('Remove this from your TBR permanently?')) saveItems(items.filter(i => i.id !== id)); };
  const toggleOwned = (id) => saveItems(items.map(i => i.id === id ? { ...i, owned: !i.owned } : i));

  const filtered = items.filter(i => {
    const ownedMatch = filterOwned === 'All' || (filterOwned === 'Owned' ? i.owned : !i.owned);
    const relMatch = filterRelevance === 'All' || i.relevance === filterRelevance;
    const subjMatch = filterSubject === 'All' || (i.subject || '').split(',').map(s => s.trim()).includes(filterSubject);
    return ownedMatch && relMatch && subjMatch;
  });

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(i => {
      const subjects = (i.subject || 'Unsorted').split(',').map(s => s.trim()).filter(Boolean);
      const keys = subjects.length ? subjects : ['Unsorted'];
      keys.forEach(k => { if (!map[k]) map[k] = []; map[k].push(i); });
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div>
      <Section title="Living TBR">
        <Card>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>
            Every book worth reading, grouped by subject — whether you own it yet, and whether it actually
            supports the dissertation. Filter down when it gets long.
          </p>
        </Card>
      </Section>
      <Section title={expanded ? 'New TBR entry' : 'Add to TBR'} right={
        <Button variant="outline" onClick={() => setExpanded(e => !e)}>{expanded ? 'Collapse' : 'Expand form'}</Button>
      }>
        <Card style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <TextInput placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ flex: 2 }} />
            <TextInput placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} style={{ flex: 1 }} />
          </div>
          <TextInput placeholder="Subject tags, comma separated" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={{ marginBottom: 8 }} />
          {expanded && <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: COLORS.sage }}>
                <input type="checkbox" checked={form.owned} onChange={e => setForm({ ...form, owned: e.target.checked })} /> Already own it
              </label>
              <Select value={form.relevance} onChange={e => setForm({ ...form, relevance: e.target.value })}>
                {TBR_RELEVANCE.map(r => <option key={r} value={r}>Dissertation relevance: {r}</option>)}
              </Select>
              <Select value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) })}>
                {[5,4,3,2,1].map(p => <option key={p} value={p}>Priority {p}</option>)}
              </Select>
            </div>
            <TextArea placeholder="How it supports the dissertation (optional)" value={form.howSupports} onChange={e => setForm({ ...form, howSupports: e.target.value })} style={{ marginBottom: 8 }} />
          </>}
          <Button onClick={addItem}>Add to TBR</Button>
        </Card>
      </Section>
      <Section title="Filter">
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Select value={filterOwned} onChange={e => setFilterOwned(e.target.value)}>
            <option value="All">Owned: All</option><option value="Owned">Owned</option><option value="Not owned">Not owned</option>
          </Select>
          <Select value={filterRelevance} onChange={e => setFilterRelevance(e.target.value)}>
            <option value="All">Relevance: All</option>{TBR_RELEVANCE.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
            <option value="All">Subject: All</option>{allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </Section>
      {grouped.map(([subject, books]) => (
        <Collapsible key={subject} title={subject} badge={books.length} defaultOpen={false}>
          {books.map(b => (
            <Card key={b.id} style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{b.title}</div>
                  {b.author && <div style={{ fontSize: 12, color: COLORS.sage }}>{b.author}</div>}
                </div>
                <Badge color={b.owned ? COLORS.lavenderLight : COLORS.lavender}>{b.owned ? 'Owned' : 'Not owned'}</Badge>
              </div>
              <div style={{ marginTop: 6 }}>
                <Badge color={b.relevance === 'Y' ? COLORS.sage : b.relevance === 'Maybe' ? COLORS.lavenderLight : '#e8e8e8'} textColor={b.relevance === 'Y' ? '#fff' : COLORS.ink}>
                  Relevance: {b.relevance}
                </Badge>
                <Badge>Priority {b.priority}</Badge>
              </div>
              {b.howSupports && <p style={{ fontSize: 13, marginTop: 6, color: COLORS.ink }}>{b.howSupports}</p>}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={() => toggleOwned(b.id)}>{b.owned ? 'Mark not owned' : 'Mark owned'}</Button>
                {b.relevance !== 'N' && <Button variant="secondary" onClick={() => onPromoteToMedia(b)}>Start dissertation critique</Button>}
                <Button variant="danger" onClick={() => removeItem(b.id)}>Remove</Button>
              </div>
            </Card>
          ))}
        </Collapsible>
      ))}
      {filtered.length === 0 && <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>Nothing matches this filter yet.</p></Card>}
    </div>
  );
}

// ---------------- DISSERTATION RECOMMENDATIONS ----------------

function DissertationRecommendations({ thesis, framework, mediaJournal, tbr, onAddToTbr }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedTitles, setAddedTitles] = useState([]);

  const fetchRecommendations = async () => {
    if (!thesis.statement) { setError('Write your dissertation statement first, in Thesis Workspace.'); return; }
    setLoading(true); setError('');
    try {
      const gaps = (framework.entries || []).filter(e => e.field === 'gap').map(e => `[${e.letter}] ${e.text}`);
      const strengths = (framework.entries || []).filter(e => e.field === 'strength').map(e => `[${e.letter}] ${e.text}`);
      const highRelevanceTitles = [
        ...tbr.filter(t => t.relevance === 'Y').map(t => t.title),
        ...mediaJournal.map(m => m.title),
      ];
      const contradictingMedia = mediaJournal.filter(m => m.stance === 'Contradicts' || m.stance === 'Complicates').map(m => `${m.title}: ${m.critique || m.summary}`);

      const res = await fetch('/api/dissertation-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thesisStatement: thesis.statement, gaps, strengths, highRelevanceTitles, contradictingMedia }),
      });
      const json = await res.json();
      if (json.error === 'missing_api_key') { setError('GROQ_API_KEY is not set on this Netlify site yet.'); return; }
      if (json.error) { setError('Could not generate recommendations right now — try again in a moment.'); return; }
      setResult(json);
    } catch (e) {
      setError('Could not reach the recommendations engine.');
    } finally {
      setLoading(false);
    }
  };

  const addBookToTbr = (book) => {
    onAddToTbr({
      title: book.title, author: book.creator, subject: '', owned: false,
      relevance: 'Maybe', howSupports: book.why, priority: 3,
    });
    setAddedTitles(prev => [...prev, book.title]);
  };

  return (
    <div>
      <Section title="Dissertation recommendations">
        <Card>
          <p style={{ margin: '0 0 6px', fontSize: 13, color: COLORS.sage }}>
            Books and media are real, nameable works — check them before assuming, but they're safe to browse.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.azure, fontWeight: 600 }}>
            Research directions are deliberately NOT named studies — an AI asked to name specific papers will
            confidently invent ones that don't exist. You'll get topics to search yourself, never fabricated citations.
          </p>
        </Card>
      </Section>
      <Section title="Get suggestions based on your current thesis and framework gaps">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Button onClick={fetchRecommendations} disabled={loading}>
            {loading ? 'Thinking...' : 'Get recommendations'}
          </Button>
        </div>
        {error && <Card><p style={{ margin: 0, fontSize: 13, color: '#a0524a' }}>{error}</p></Card>}
      </Section>

      {result && (
        <>
          <Section title="Books & media">
            {result.booksAndMedia.length === 0 && <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>No suggestions this time — try again.</p></Card>}
            {result.booksAndMedia.map((b, i) => (
              <Card key={i} style={{ textAlign: 'left' }}>
                <Badge>{b.type}</Badge>
                <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>{b.title}</div>
                {b.creator && <div style={{ fontSize: 12, color: COLORS.sage }}>{b.creator}</div>}
                {b.why && <p style={{ fontSize: 13, marginTop: 6 }}>{b.why}</p>}
                <div style={{ marginTop: 8 }}>
                  <Button
                    variant={addedTitles.includes(b.title) ? 'secondary' : 'primary'}
                    onClick={() => addBookToTbr(b)}
                    style={{ opacity: addedTitles.includes(b.title) ? 0.6 : 1 }}
                  >
                    {addedTitles.includes(b.title) ? 'Added to TBR ✓' : 'Add to Living TBR'}
                  </Button>
                </div>
              </Card>
            ))}
          </Section>
          <Section title="Research directions to search yourself">
            {result.researchDirections.length === 0 && <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>No directions this time — try again.</p></Card>}
            {result.researchDirections.map((r, i) => (
              <Card key={i} style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.topic}</div>
                {r.why && <p style={{ fontSize: 13, marginTop: 6, color: COLORS.sage }}>{r.why}</p>}
                <div style={{ marginTop: 8 }}>
                  <a
                    href={`https://scholar.google.com/scholar?q=${encodeURIComponent(r.topic)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: COLORS.azure, textDecoration: 'underline' }}
                  >
                    Search this on Google Scholar →
                  </a>
                </div>
              </Card>
            ))}
          </Section>
        </>
      )}
    </div>
  );
}

function WeeklySynthesis({ synthesisLog, saveSynthesisLog }) {
  const [headline, setHeadline] = useState('');
  const [insightsRaw, setInsightsRaw] = useState('');
  const [application, setApplication] = useState('');
  const [formatId, setFormatId] = useState('square');
  const [exporting, setExporting] = useState(false);
  const previewRef = React.useRef(null);

  const insights = insightsRaw.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 5);
  const format = SYNTHESIS_FORMATS.find(f => f.id === formatId);
  const weekLabel = `Week of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Carousel splits insights across slides: one per slide, plus a title
  // slide and a closing "how I'm applying this" slide if present.
  const carouselSlides = useMemo(() => {
    if (formatId !== 'carousel') return null;
    const slides = [{ headline, insights: [], application: null }];
    insights.forEach(ins => slides.push({ headline: '', insights: [ins], application: null }));
    if (application) slides.push({ headline: 'This week, I\'m applying it by...', insights: [], application });
    return slides;
  }, [formatId, headline, insights, application]);

  const saveToLog = () => {
    if (!headline.trim() && insights.length === 0) return;
    saveSynthesisLog([{ id: Date.now(), date: new Date().toLocaleDateString(), headline, insights, application, formatId }, ...synthesisLog]);
  };
  const removeSynthesis = (id) => { if (window.confirm('Delete this saved synthesis permanently?')) saveSynthesisLog(synthesisLog.filter(s => s.id !== id)); };

  const exportImage = async (node, filename) => {
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: null });
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export failed', e);
      alert('Image export failed. Try again, or use the Printable format and print/save as PDF instead.');
    } finally {
      setExporting(false);
    }
  };

  const doExport = async () => {
    if (formatId === 'printable') { window.print(); return; }
    if (formatId === 'carousel' && carouselSlides) {
      for (let i = 0; i < carouselSlides.length; i++) {
        const node = document.getElementById(`synthesis-slide-${i}`);
        if (node) await exportImage(node, `synthesis-${weekLabel.replace(/\s+/g, '-')}-slide${i + 1}.png`);
      }
      return;
    }
    const node = document.getElementById('synthesis-slide-0');
    if (node) await exportImage(node, `synthesis-${weekLabel.replace(/\s+/g, '-')}.png`);
  };

  return (
    <div>
      <Section title="This week's synthesis">
        <Card>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>
            Across pleasure, dissertation, and business reading this week — what's one thing that actually
            changed how you think? Write it once, then export it in whichever shape fits where you're sharing it.
          </p>
        </Card>
      </Section>
      <Section title="Compose">
        <Card style={{ textAlign: 'left' }}>
          <TextInput placeholder="Headline — the one big idea from this week" value={headline} onChange={e => setHeadline(e.target.value)} style={{ marginBottom: 8 }} />
          <TextArea placeholder="Key insights, one per line (up to 5)" value={insightsRaw} onChange={e => setInsightsRaw(e.target.value)} style={{ marginBottom: 8, minHeight: 100 }} />
          <TextInput placeholder="How I'm applying this (optional)" value={application} onChange={e => setApplication(e.target.value)} style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Button variant="secondary" onClick={saveToLog}>Save to log</Button>
          </div>
        </Card>
      </Section>
      <Section title="Choose a shareable format">
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          {SYNTHESIS_FORMATS.map(f => (
            <button key={f.id} onClick={() => setFormatId(f.id)} style={{
              border: `1px solid ${formatId === f.id ? COLORS.sage : COLORS.lavenderLight}`,
              background: formatId === f.id ? COLORS.sage : '#fff', color: formatId === f.id ? '#fff' : COLORS.ink,
              borderRadius: 999, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: BODY_FONT,
            }}>{f.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Button onClick={doExport} disabled={exporting}>
            {exporting ? 'Exporting...' : formatId === 'printable' ? 'Print / save as PDF' : 'Download image'}
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }} ref={previewRef} id={formatId === 'printable' ? 'synthesis-print-target' : undefined}>
          {formatId === 'carousel' && carouselSlides
            ? carouselSlides.map((s, i) => (
                <div key={i} id={`synthesis-slide-${i}`}>
                  <SynthesisSlide format={format} headline={s.headline} insights={s.insights} application={s.application} weekLabel={weekLabel} slideIndex={i} slideCount={carouselSlides.length} />
                </div>
              ))
            : (
                <div id="synthesis-slide-0">
                  <SynthesisSlide format={format} headline={headline || 'This week\'s synthesis'} insights={insights} application={application} weekLabel={weekLabel} slideIndex={0} slideCount={1} />
                </div>
              )}
        </div>
      </Section>
      <Section title={`Past syntheses (${synthesisLog.length})`}>
        {synthesisLog.map(s => (
          <Card key={s.id}>
            <div style={{ fontSize: 12, color: COLORS.sage }}>{s.date}</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 16, marginTop: 4 }}>{s.headline}</div>
            {s.insights.map((ins, i) => <p key={i} style={{ fontSize: 13, margin: '4px 0' }}>{ins}</p>)}
            <div style={{ marginTop: 6 }}><Button variant="danger" onClick={() => removeSynthesis(s.id)}>Remove</Button></div>
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ---------------- FRAMEWORK BUILDER ----------------

function FrameworkBuilder({ framework, saveFramework }) {
  const [entry, setEntry] = useState({ letter: 'Gather', field: 'strength', text: '' });
  const fields = [
    { id: 'strength', label: 'Strongest here because...' },
    { id: 'gap', label: 'Gap or weakness' },
    { id: 'evidence', label: 'Evidence/research support' },
    { id: 'opportunity', label: 'Could be stronger if...' },
  ];

  const add = () => {
    if (!entry.text.trim()) return;
    const entries = [...(framework.entries || []), { id: Date.now(), ...entry, date: new Date().toLocaleDateString() }];
    saveFramework({ ...framework, entries });
    setEntry({ ...entry, text: '' });
  };
  const remove = (id) => { if (window.confirm('Delete this framework entry permanently?')) saveFramework({ ...framework, entries: (framework.entries || []).filter(e => e.id !== id) }); };

  return (
    <div>
      <Section title="Framework builder — G.R.A.C.E.">
        <Card>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>
            For each letter, build the case for why it works, where it's thin, what backs it up, and where it could grow.
            This is the raw material for the Capstone Synthesis chapter defending your framework.
          </p>
        </Card>
      </Section>
      <Section title="Add an entry">
        <Card>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Select value={entry.letter} onChange={e => setEntry({ ...entry, letter: e.target.value })} style={{ flex: 1 }}>{GRACE_LETTERS.map(l => <option key={l} value={l}>{l}</option>)}</Select>
              <Select value={entry.field} onChange={e => setEntry({ ...entry, field: e.target.value })} style={{ flex: 1 }}>{fields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}</Select>
            </div>
            <TextArea placeholder="Write the entry" value={entry.text} onChange={e => setEntry({ ...entry, text: e.target.value })} />
            <Button onClick={add}>Add entry</Button>
          </div>
        </Card>
      </Section>
      {GRACE_LETTERS.map(letter => {
        const entries = (framework.entries || []).filter(e => e.letter === letter);
        return (
          <Collapsible key={letter} title={letter} badge={entries.length} defaultOpen={false}>
            {fields.map(f => {
              const fieldEntries = entries.filter(e => e.field === f.id);
              if (fieldEntries.length === 0) return null;
              return (
                <div key={f.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.azure, marginBottom: 4, textAlign: 'center' }}>{f.label}</div>
                  {fieldEntries.map(e => (
                    <Card key={e.id}>
                      {e.provenance && <Badge color={COLORS.azure} textColor="#fff">{e.provenance}: {e.provenanceTitle}</Badge>}
                      <div style={{ fontSize: 13 }}>{e.text}</div>
                      <div style={{ marginTop: 6 }}><Button variant="danger" onClick={() => remove(e.id)}>Remove</Button></div>
                    </Card>
                  ))}
                </div>
              );
            })}
            {entries.length === 0 && <p style={{ fontSize: 12, color: COLORS.sage, textAlign: 'center' }}>No entries yet for {letter}.</p>}
          </Collapsible>
        );
      })}
    </div>
  );
}

// ---------------- CHALLENGE ME ----------------

const CHALLENGE_MODES = [
  { id: 'socratic', label: 'Socratic questioning', prompt: 'Ask me one sharp Socratic question that pushes on a weak point or unexamined assumption in the following idea. Do not answer it for me — just ask the question, in plain client-friendly language where possible, and briefly say why it matters.' },
  { id: 'counter', label: 'Argue the opposite', prompt: 'Take the opposite position from the following idea and argue it as persuasively as you honestly can, citing the kind of evidence or reasoning that would support the opposite view. Be direct, not gentle.' },
  { id: 'quiz', label: 'Quiz me', prompt: 'Write 3 quiz questions (with answers hidden below a line) testing whether I actually understand the clinical/phytochemical reasoning behind the following, at a level a clinical herbalism comprehensive exam would expect.' },
  { id: 'perspective', label: 'Different perspective', prompt: 'Reframe the following from a perspective I have probably not considered (e.g., a skeptical MD, a different herbal tradition, a client who tried this and it did not work, a statistician). Be concrete and specific, not generic.' },
  { id: 'gaps', label: 'Find the gaps', prompt: 'Identify what is missing, oversimplified, or unsupported in the following, as an honest peer reviewer would. List the top 3 gaps, ranked by how much they matter.' },
];

function ChallengeMe({ log, saveLog, thesis, framework }) {
  const [mode, setMode] = useState('socratic');
  const [input, setInput] = useState('');
  const [useContext, setUseContext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gaps = (framework.entries || []).filter(e => e.field === 'gap');
  const contextBlock = useMemo(() => {
    if (!useContext) return '';
    const parts = [];
    if (thesis.statement) parts.push(`My current working dissertation statement is: "${thesis.statement}"`);
    if (gaps.length > 0) {
      parts.push(`Known gaps I've already flagged in my G.R.A.C.E. framework: ${gaps.slice(-5).map(g => `[${g.letter}] ${g.text}`).join(' | ')}`);
    }
    if ((thesis.challenges || []).length > 0) {
      const last = thesis.challenges[thesis.challenges.length - 1];
      parts.push(`The last self-challenge I logged was: "${last.text}"`);
    }
    return parts.length ? `Background context on my work (use this to make your challenge specific to me, not generic):\n${parts.join('\n')}\n\n` : '';
  }, [useContext, thesis, gaps]);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError('');
    const modeObj = CHALLENGE_MODES.find(m => m.id === mode);
    try {
      const response = await fetch('/.netlify/functions/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${contextBlock}${modeObj.prompt}\n\n---\n\n${input}` }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const entry = { id: Date.now(), mode: modeObj.label, input, output: data.text || 'No response returned.', date: new Date().toLocaleDateString(), usedContext: useContext };
      saveLog([entry, ...log]);
      setInput('');
    } catch (e) {
      setError('Could not reach the challenge engine right now — check that GROQ_API_KEY is set in Netlify, then try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Section title="Challenge me">
        <Card>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>
            Paste an idea, a claim, a case reasoning, or a piece of your framework. Pick a mode and get pushed on it —
            your stand-in for peer review until you have real peers reviewing alongside you.
          </p>
        </Card>
      </Section>
      <Section title="Set up a challenge">
        <Card style={{ textAlign: 'left' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <Select value={mode} onChange={e => setMode(e.target.value)}>{CHALLENGE_MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</Select>
            <TextArea placeholder="Paste the idea, claim, or reasoning you want challenged..." value={input} onChange={e => setInput(e.target.value)} style={{ minHeight: 110 }} />
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, color: COLORS.sage, cursor: 'pointer' }}>
              <input type="checkbox" checked={useContext} onChange={e => setUseContext(e.target.checked)} />
              Include my dissertation statement and known framework gaps as context
            </label>
            <Button onClick={run} disabled={loading}>{loading ? 'Thinking...' : 'Challenge this'}</Button>
            {error && <p style={{ fontSize: 12, color: '#a0524a', margin: 0 }}>{error}</p>}
          </div>
        </Card>
      </Section>
      <Section title={`Challenge log (${log.length})`}>
        {log.map(l => (
          <Card key={l.id} style={{ textAlign: 'left' }}>
            <Badge color={COLORS.lavender}>{l.mode}</Badge>
            {l.usedContext && <Badge color={COLORS.lavenderLight}>with context</Badge>}
            <span style={{ fontSize: 12, color: COLORS.sage }}>{l.date}</span>
            <div style={{ fontSize: 12, color: COLORS.sage, marginTop: 6, fontStyle: 'italic' }}>You submitted: {l.input.slice(0, 140)}{l.input.length > 140 ? '…' : ''}</div>
            <div style={{ fontSize: 13, marginTop: 8, whiteSpace: 'pre-wrap', color: COLORS.ink }}>{l.output}</div>
          </Card>
        ))}
        {log.length === 0 && <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>No challenges logged yet.</p></Card>}
      </Section>
    </div>
  );
}

// ---------------- NOTES ----------------

function Notes({ notes, saveNotes }) {
  const [form, setForm] = useState({ title: '', body: '', tag: 'Constituent Bridge' });
  const tags = ['Constituent Bridge', 'Case note', 'GRACE reflection', 'Parking lot question', 'General'];

  const addNote = () => {
    if (!form.title.trim() && !form.body.trim()) return;
    saveNotes([{ ...form, id: Date.now(), date: new Date().toLocaleDateString() }, ...notes]);
    setForm({ title: '', body: '', tag: form.tag });
  };
  const removeNote = (id) => { if (window.confirm('Delete this note permanently?')) saveNotes(notes.filter(n => n.id !== id)); };

  return (
    <div>
      <Section title="Capture a note">
        <Card style={{ textAlign: 'left' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <TextInput placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ flex: 1 }} />
              <Select value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })}>{tags.map(t => <option key={t} value={t}>{t}</option>)}</Select>
            </div>
            <TextArea placeholder="Note content" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
            <Button onClick={addNote}>Save note</Button>
          </div>
        </Card>
      </Section>
      <Section title={`All notes (${notes.length})`}>
        {notes.map(n => (
          <Card key={n.id}>
            <Badge>{n.tag}</Badge><span style={{ fontSize: 12, color: COLORS.sage }}>{n.date}</span>
            {n.title && <div style={{ fontWeight: 600, fontSize: 13, marginTop: 6 }}>{n.title}</div>}
            <div style={{ fontSize: 13, marginTop: 4, whiteSpace: 'pre-wrap' }}>{n.body}</div>
            <div style={{ marginTop: 6 }}><Button variant="danger" onClick={() => removeNote(n.id)}>Remove</Button></div>
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ---------------- LIBRARY ----------------

function Library({ items, saveItems }) {
  const [form, setForm] = useState({ title: '', author: '', type: 'Book', tags: '', quote: '', reflection: '' });
  const [filterType, setFilterType] = useState('All');
  const [filterTag, setFilterTag] = useState('All');
  const types = ['Book', 'Article', 'Video', 'Podcast', 'Study'];

  const allTags = useMemo(() => {
    const set = new Set();
    items.forEach(i => (i.tags || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const addItem = () => {
    if (!form.title.trim()) return;
    saveItems([{ ...form, id: Date.now() }, ...items]);
    setForm({ title: '', author: '', type: form.type, tags: '', quote: '', reflection: '' });
  };
  const removeItem = (id) => { if (window.confirm('Delete this library item permanently?')) saveItems(items.filter(i => i.id !== id)); };

  const filtered = items.filter(i => {
    const typeMatch = filterType === 'All' || i.type === filterType;
    const tagMatch = filterTag === 'All' || (i.tags || '').split(',').map(t => t.trim()).includes(filterTag);
    return typeMatch && tagMatch;
  });

  const grouped = types.map(t => ({ type: t, items: filtered.filter(i => i.type === t) })).filter(g => g.items.length > 0);

  return (
    <div>
      <Section title="Add a media item or annotation">
        <Card style={{ textAlign: 'left' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <TextInput placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ flex: 2 }} />
              <TextInput placeholder="Author / creator" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} style={{ flex: 1 }} />
              <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{types.map(t => <option key={t} value={t}>{t}</option>)}</Select>
            </div>
            <TextInput placeholder="Tags, comma separated (e.g. adaptogens, ancestral, HPA axis)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
            <TextArea placeholder="Quote or excerpt worth keeping" value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} />
            <TextArea placeholder="Your reflection — why this matters to your dissertation question" value={form.reflection} onChange={e => setForm({ ...form, reflection: e.target.value })} />
            <Button onClick={addItem}>Add to library</Button>
          </div>
        </Card>
      </Section>
      <Section title="Filter" right={null}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="All">All types</option>{types.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={filterTag} onChange={e => setFilterTag(e.target.value)}>
            <option value="All">All tags</option>{allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
      </Section>
      {grouped.map(g => (
        <Collapsible key={g.type} title={g.type} badge={g.items.length}>
          {g.items.map(i => (
            <Card key={i.id}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{i.title}</div>
              {i.author && <div style={{ fontSize: 12, color: COLORS.sage }}>{i.author}</div>}
              {i.tags && <div style={{ marginTop: 6 }}>{i.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => <Badge key={t} color={COLORS.lavender}>{t}</Badge>)}</div>}
              {i.quote && <div style={{ fontSize: 13, fontStyle: 'italic', marginTop: 6, color: COLORS.ink }}>"{i.quote}"</div>}
              {i.reflection && <div style={{ fontSize: 13, marginTop: 4, color: COLORS.sage }}>{i.reflection}</div>}
              <div style={{ marginTop: 6 }}><Button variant="danger" onClick={() => removeItem(i.id)}>Remove</Button></div>
            </Card>
          ))}
        </Collapsible>
      ))}
      {filtered.length === 0 && <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>No items match this filter.</p></Card>}
    </div>
  );
}

// ---------------- CITATIONS ----------------

const CONFIDENCE_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'working-thread', label: 'Working Thread' },
  { value: 'oral-history', label: 'Family Oral History' },
];
const SOURCE_TYPE_OPTIONS = [
  { value: 'study', label: 'Study / article' },
  { value: 'book', label: 'Book' },
  { value: 'personal-note', label: 'Personal note / synthesis' },
  { value: 'oral', label: 'Oral history' },
];

function slugifyForCallNumber(drawer, title, existingIds) {
  const drawerAbbrev = (drawer || 'GEN').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'GEN';
  const titleAbbrev = (title || 'XXX').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'XXX';
  let n = 1;
  let candidate = `${drawerAbbrev}-${titleAbbrev}-${String(n).padStart(2, '0')}`;
  while (existingIds.has(candidate)) {
    n += 1;
    candidate = `${drawerAbbrev}-${titleAbbrev}-${String(n).padStart(2, '0')}`;
  }
  return candidate;
}

function buildCatalogEntries(citations) {
  const ready = citations.filter(c => c.catalogReady);
  const usedIds = new Set();
  const duplicatesFound = [];
  const entries = ready.map(c => {
    let id = (c.catalogCallNumber || '').trim();
    if (!id) {
      id = slugifyForCallNumber(c.catalogDrawer, c.title, usedIds);
    } else if (usedIds.has(id)) {
      duplicatesFound.push(id);
      let n = 2;
      let candidate = `${id}-${n}`;
      while (usedIds.has(candidate)) { n += 1; candidate = `${id}-${n}`; }
      id = candidate;
    }
    usedIds.add(id);

    const seeAlso = (c.catalogSeeAlso || '').split(',').map(s => s.trim()).filter(Boolean);
    const sourceCitation = `${c.author || ''}${c.year ? ` (${c.year})` : ''}. ${c.title}. ${c.source || ''}.`.trim();

    const entry = {
      id,
      drawer: c.catalogDrawer || 'Uncategorized',
      title: c.title,
      subtitle: `${c.author || ''}${c.year ? ` (${c.year})` : ''}`.trim(),
      hook: c.catalogHook || c.claim || '',
      note: c.claim || '',
      sourceType: c.catalogSourceType || 'study',
      sourceCitation,
      confidence: c.catalogConfidence || 'confirmed',
      seeAlso,
      dateAdded: new Date(c.id).toISOString().slice(0, 10),
    };
    if (c.catalogSourceType === 'book') {
      entry.coverTitle = c.title;
      entry.coverAuthor = c.author || '';
      if (c.catalogCoverIsbn && c.catalogCoverIsbn.trim()) {
        entry.coverIsbn = c.catalogCoverIsbn.trim();
      }
    }
    return entry;
  });
  return { entries, duplicatesFound };
}

function downloadJson(filename, dataObj) {
  const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Citations({ citations, saveCitations, catalogDuplicates = [] }) {
  const [form, setForm] = useState({
    author: '', year: '', title: '', source: '', claim: '', evidenceType: 'RCT',
    catalogReady: false, catalogDrawer: '', catalogSourceType: 'study',
    catalogConfidence: 'confirmed', catalogHook: '', catalogCoverIsbn: '', catalogSeeAlso: '', catalogCallNumber: '',
  });
  const [search, setSearch] = useState('');
  const evidenceTypes = ['RCT', 'Cohort study', 'Case series', 'In-vitro', 'Systematic review', 'Traditional use', 'Other'];

  const addCitation = () => {
    if (!form.title.trim()) return;
    saveCitations([{ ...form, id: Date.now() }, ...citations]);
    setForm({
      author: '', year: '', title: '', source: '', claim: '', evidenceType: form.evidenceType,
      catalogReady: false, catalogDrawer: form.catalogDrawer, catalogSourceType: form.catalogSourceType,
      catalogConfidence: 'confirmed', catalogHook: '', catalogCoverIsbn: '', catalogSeeAlso: '', catalogCallNumber: '',
    });
  };
  const removeCitation = (id) => { if (window.confirm('Delete this citation permanently?')) saveCitations(citations.filter(c => c.id !== id)); };
  const updateCitation = (id, patch) => saveCitations(citations.map(c => c.id === id ? { ...c, ...patch } : c));
  const filtered = citations.filter(c => !search.trim() || [c.author, c.title, c.claim, c.source].join(' ').toLowerCase().includes(search.toLowerCase()));
  const copyCitation = (c) => navigator.clipboard?.writeText(`${c.author}${c.year ? ` (${c.year})` : ''}. ${c.title}. ${c.source}.`);

  const downloadBackup = () => {
    const { entries, duplicatesFound } = buildCatalogEntries(citations);
    if (entries.length === 0) {
      alert('No citations are flagged "Catalog-ready" yet. Check that box on any citation you want to appear in the Dissertation Catalog.');
      return;
    }
    if (duplicatesFound.length > 0) {
      alert(`Heads up: ${duplicatesFound.length} duplicate call number(s) were auto-renamed so nothing was dropped: ${duplicatesFound.join(', ')}.`);
    }
    downloadJson('catalog-data.json', {
      generatedAt: new Date().toISOString(),
      source: 'Formation Study Hub — Citation bank export',
      entries,
    });
  };

  return (
    <div>
      <Section title="Add a citation">
        <Card style={{ textAlign: 'left' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 8 }}>
              <TextInput placeholder="Author(s)" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
              <TextInput placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
            </div>
            <TextInput placeholder="Title of study/article" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <div style={{ display: 'flex', gap: 8 }}>
              <TextInput placeholder="Source / journal / URL" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={{ flex: 2 }} />
              <Select value={form.evidenceType} onChange={e => setForm({ ...form, evidenceType: e.target.value })}>{evidenceTypes.map(t => <option key={t} value={t}>{t}</option>)}</Select>
            </div>
            <TextArea placeholder="What claim does this support?" value={form.claim} onChange={e => setForm({ ...form, claim: e.target.value })} />

            <Collapsible title="Catalog display (optional)" defaultOpen={false}>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontFamily: BODY_FONT, justifyContent: 'center' }}>
                  <input type="checkbox" checked={form.catalogReady} onChange={e => setForm({ ...form, catalogReady: e.target.checked })} />
                  Catalog-ready — flows into the Dissertation Catalog automatically
                </label>
                <TextInput placeholder="Call number (optional — auto-generated if left blank)" value={form.catalogCallNumber} onChange={e => setForm({ ...form, catalogCallNumber: e.target.value })} />
                <TextInput placeholder="Drawer / category (e.g. Literature Review)" value={form.catalogDrawer} onChange={e => setForm({ ...form, catalogDrawer: e.target.value })} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Select value={form.catalogSourceType} onChange={e => setForm({ ...form, catalogSourceType: e.target.value })} style={{ flex: 1 }}>
                    {SOURCE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                  <Select value={form.catalogConfidence} onChange={e => setForm({ ...form, catalogConfidence: e.target.value })} style={{ flex: 1 }}>
                    {CONFIDENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </div>
                {form.catalogSourceType === 'book' && (
                  <TextInput placeholder="ISBN (optional — pulls real cover art via Open Library)" value={form.catalogCoverIsbn} onChange={e => setForm({ ...form, catalogCoverIsbn: e.target.value })} />
                )}
                <TextArea placeholder="Hook — one enticing sentence for the card front" value={form.catalogHook} onChange={e => setForm({ ...form, catalogHook: e.target.value })} style={{ minHeight: 50 }} />
                <TextInput placeholder="See Also — comma-separated, e.g. Literature Review → Hoffmann on Adaptogens" value={form.catalogSeeAlso} onChange={e => setForm({ ...form, catalogSeeAlso: e.target.value })} />
              </div>
            </Collapsible>

            <Button onClick={addCitation}>Add to bank</Button>
          </div>
        </Card>
      </Section>
      <Section
        title={`Citation bank (${citations.length})`}
        right={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <TextInput placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 160 }} />
            <Button variant="outline" onClick={downloadBackup}>Download backup</Button>
          </div>
        }
      >
        <div style={{ fontSize: 11, color: COLORS.sage, marginBottom: 10, fontFamily: BODY_FONT }}>
          Any citation flagged "Catalog-ready" below pushes to the Dissertation Catalog automatically — no export or redeploy needed. "Download backup" is just a manual local copy if you ever want one.
        </div>
        {catalogDuplicates.length > 0 && (
          <div style={{ fontSize: 12, color: '#a0524a', background: '#fbeceb', border: '1px solid #e3b3b3', borderRadius: 9, padding: '8px 12px', marginBottom: 10 }}>
            Heads up: {catalogDuplicates.length} duplicate Call Number{catalogDuplicates.length === 1 ? '' : 's'} found among catalog-ready citations ({catalogDuplicates.join(', ')}). Nothing was dropped — duplicates were auto-renamed in the export — but giving these their own Call Number will keep things tidy.
          </div>
        )}
        {filtered.map(c => (
          <Card key={c.id}>
            <Badge color={COLORS.lavender}>{c.evidenceType}</Badge>
            {c.catalogReady && <Badge color={COLORS.azure} textColor="#fff">Catalog-ready{c.catalogDrawer ? `: ${c.catalogDrawer}` : ''}</Badge>}
            {c.provenance && <Badge color={COLORS.azure} textColor="#fff">{c.provenance}: {c.provenanceTitle}</Badge>}
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{c.author}{c.year ? ` (${c.year})` : ''}</div>
            <div style={{ fontSize: 13 }}>{c.title}</div>
            <div style={{ fontSize: 12, color: COLORS.sage }}>{c.source}</div>
            {c.claim && <div style={{ fontSize: 12, marginTop: 4, color: COLORS.ink }}>Supports: {c.claim}</div>}

            <div style={{ marginTop: 10, borderTop: `1px solid ${COLORS.lavenderLight}`, paddingTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: BODY_FONT, justifyContent: 'center' }}>
                <input type="checkbox" checked={!!c.catalogReady} onChange={e => updateCitation(c.id, { catalogReady: e.target.checked, catalogDrawer: c.catalogDrawer || '', catalogSourceType: c.catalogSourceType || 'study', catalogConfidence: c.catalogConfidence || 'confirmed' })} />
                Catalog-ready
              </label>
              {c.catalogReady && (
                <div style={{ display: 'grid', gap: 6, marginTop: 8, textAlign: 'left' }}>
                  <TextInput placeholder="Drawer / category" value={c.catalogDrawer || ''} onChange={e => updateCitation(c.id, { catalogDrawer: e.target.value })} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Select value={c.catalogSourceType || 'study'} onChange={e => updateCitation(c.id, { catalogSourceType: e.target.value })} style={{ flex: 1 }}>
                      {SOURCE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                    <Select value={c.catalogConfidence || 'confirmed'} onChange={e => updateCitation(c.id, { catalogConfidence: e.target.value })} style={{ flex: 1 }}>
                      {CONFIDENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  </div>
                  {c.catalogSourceType === 'book' && (
                    <TextInput placeholder="ISBN (optional, real cover art)" value={c.catalogCoverIsbn || ''} onChange={e => updateCitation(c.id, { catalogCoverIsbn: e.target.value })} />
                  )}
                  <TextArea placeholder="Hook sentence" value={c.catalogHook || ''} onChange={e => updateCitation(c.id, { catalogHook: e.target.value })} style={{ minHeight: 44 }} />
                  <TextInput placeholder="See Also (comma-separated)" value={c.catalogSeeAlso || ''} onChange={e => updateCitation(c.id, { catalogSeeAlso: e.target.value })} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
              <Button variant="secondary" onClick={() => copyCitation(c)}>Copy</Button>
              <Button variant="danger" onClick={() => removeCitation(c.id)}>Remove</Button>
            </div>
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ---------------- QUESTIONS ----------------

// Fixed, known-real search engines only — the AI never generates a URL;
// it only ever returns a plain topic string, and these links are built
// entirely client-side from that string. This is what keeps "resource
// links" from ever being a hallucination risk.
const RESEARCH_ENGINES = [
  { label: 'PubMed', buildUrl: (q) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}` },
  { label: 'Google Scholar', buildUrl: (q) => `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}` },
  { label: 'Cochrane Library', buildUrl: (q) => `https://www.cochranelibrary.com/search?q=${encodeURIComponent(q)}` },
  { label: 'Google', buildUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
];

function Questions({ questions, saveQuestions }) {
  const [newQ, setNewQ] = useState('');
  const [drafts, setDrafts] = useState({});
  const [thinking, setThinking] = useState({});
  const [thoughtResults, setThoughtResults] = useState({});
  const [thinkErrors, setThinkErrors] = useState({});
  const [expanded, setExpanded] = useState({});

  const toggleExpanded = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const addQuestion = () => {
    if (!newQ.trim()) return;
    const id = Date.now();
    saveQuestions([{ id, question: newQ, answer: '', support: '', date: new Date().toLocaleDateString() }, ...questions]);
    setExpanded(prev => ({ ...prev, [id]: true })); // a brand-new question opens expanded, since you're about to work on it
    setNewQ('');
  };
  const removeQuestion = (id) => { if (window.confirm('Delete this question permanently?')) saveQuestions(questions.filter(q => q.id !== id)); };
  const saveAnswer = (id) => {
    const d = drafts[id] || {};
    saveQuestions(questions.map(q => q.id === id ? { ...q, answer: d.answer ?? q.answer, support: d.support ?? q.support } : q));
  };
  const setDraft = (id, field, val) => setDrafts({ ...drafts, [id]: { ...drafts[id], [field]: val } });

  const thinkItThrough = async (q) => {
    setThinking({ ...thinking, [q.id]: true });
    setThinkErrors({ ...thinkErrors, [q.id]: '' });
    try {
      const res = await fetch('/api/think-it-through', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.question }),
      });
      const data = await res.json();
      if (data.error) {
        setThinkErrors({ ...thinkErrors, [q.id]: 'Could not get help right now — try again in a moment.' });
      } else {
        setThoughtResults({ ...thoughtResults, [q.id]: data });
      }
    } catch {
      setThinkErrors({ ...thinkErrors, [q.id]: 'Could not reach the AI helper — check your connection and try again.' });
    }
    setThinking({ ...thinking, [q.id]: false });
  };

  const open = questions.filter(q => !q.answer);
  const answered = questions.filter(q => q.answer);

  return (
    <div>
      <Section title="Park a question">
        <Card>
          <div style={{ display: 'flex', gap: 8 }}>
            <TextInput placeholder="What are you trying to find out?" value={newQ} onChange={e => setNewQ(e.target.value)} />
            <Button onClick={addQuestion}>Add</Button>
          </div>
        </Card>
      </Section>
      <Section title={`Open questions (${open.length})`}>
        {open.map(q => (
          <Card key={q.id} style={{ textAlign: 'left' }}>
            <div onClick={() => toggleExpanded(q.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{q.question}</div>
                <div style={{ fontSize: 12, color: COLORS.sage }}>{q.date}</div>
              </div>
              <span style={{ fontSize: 16, color: COLORS.sage, flexShrink: 0 }}>{expanded[q.id] ? '▾' : '▸'}</span>
            </div>

            {expanded[q.id] && (
              <div style={{ marginTop: 10 }}>
                <TextArea placeholder="Answer, once you've found it" value={drafts[q.id]?.answer ?? q.answer} onChange={e => setDraft(q.id, 'answer', e.target.value)} style={{ marginBottom: 6 }} />
                <TextArea placeholder="What supports this answer?" value={drafts[q.id]?.support ?? q.support} onChange={e => setDraft(q.id, 'support', e.target.value)} />
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                  <Button onClick={() => saveAnswer(q.id)}>Save answer</Button>
                  <Button variant="secondary" onClick={() => thinkItThrough(q)} disabled={thinking[q.id]}>
                    {thinking[q.id] ? 'Thinking...' : 'Help me think it through'}
                  </Button>
                  <Button variant="danger" onClick={() => removeQuestion(q.id)}>Remove</Button>
                </div>

                {thinkErrors[q.id] && <p style={{ fontSize: 12, color: '#a0524a', textAlign: 'center', marginTop: 6 }}>{thinkErrors[q.id]}</p>}

                {thoughtResults[q.id] && (
                  <div style={{ marginTop: 10, background: COLORS.lavenderLight, borderRadius: 9, padding: '10px 14px' }}>
                    {thoughtResults[q.id].guidingQuestions?.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.ink, marginBottom: 4 }}>Questions to help you break this down:</div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                          {thoughtResults[q.id].guidingQuestions.map((g, i) => <li key={i} style={{ marginBottom: 3 }}>{g}</li>)}
                        </ul>
                      </div>
                    )}
                    {thoughtResults[q.id].researchDirections?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.ink, marginBottom: 4 }}>Directions worth searching:</div>
                        {thoughtResults[q.id].researchDirections.map((r, i) => (
                          <div key={i} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 12 }}>{r.topic}</div>
                            {r.why && <div style={{ fontSize: 11, color: COLORS.sage, fontStyle: 'italic' }}>{r.why}</div>}
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                              {RESEARCH_ENGINES.map(engine => (
                                <a key={engine.label} href={engine.buildUrl(r.topic)} target="_blank" rel="noopener noreferrer"
                                   style={{ fontSize: 11, color: COLORS.azure, textDecoration: 'underline' }}>
                                  Search {engine.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: COLORS.sage, marginTop: 4, fontStyle: 'italic' }}>
                      These links run a real search on each site — they don't point to any specific paper, since an AI naming a specific study can confidently invent one that doesn't exist.
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
        {open.length === 0 && <Card><p style={{ margin: 0, fontSize: 13, color: COLORS.sage }}>No open questions right now.</p></Card>}
      </Section>
      <Section title={`Answered (${answered.length})`}>
        {answered.map(q => (
          <Card key={q.id}>
            <div onClick={() => toggleExpanded(q.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{q.question}</div>
              <span style={{ fontSize: 16, color: COLORS.sage, flexShrink: 0 }}>{expanded[q.id] ? '▾' : '▸'}</span>
            </div>
            {expanded[q.id] && (
              <div style={{ textAlign: 'left', marginTop: 8 }}>
                <div style={{ fontSize: 13, color: COLORS.azure }}>{q.answer}</div>
                {q.support && <div style={{ fontSize: 12, marginTop: 4, color: COLORS.sage }}>Support: {q.support}</div>}
                <div style={{ marginTop: 6, textAlign: 'center' }}><Button variant="danger" onClick={() => removeQuestion(q.id)}>Remove</Button></div>
              </div>
            )}
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ---------------- APP ----------------

function GlobalSearch({ notes, library, citations, questions, mediaJournal, synthesisLog, tbr, wordBank, fogLog, setTab }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const containerRef = React.useRef(null);
  const inputRef = React.useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.toLowerCase();
    const out = [];
    notes.forEach(n => { if ((n.title + n.body).toLowerCase().includes(term)) out.push({ type: 'Note', label: n.title || n.body.slice(0, 40), tab: 'notes' }); });
    library.forEach(l => { if ((l.title + l.author + l.tags + l.reflection).toLowerCase().includes(term)) out.push({ type: 'Library', label: l.title, tab: 'library' }); });
    citations.forEach(c => { if ((c.title + c.author + c.claim).toLowerCase().includes(term)) out.push({ type: 'Citation', label: `${c.author} — ${c.title}`, tab: 'citations' }); });
    questions.forEach(qu => { if ((qu.question + qu.answer).toLowerCase().includes(term)) out.push({ type: 'Question', label: qu.question, tab: 'questions' }); });
    mediaJournal.forEach(m => { if ((m.title + m.creator + m.summary + m.critique).toLowerCase().includes(term)) out.push({ type: 'Media journal', label: m.title, tab: 'media' }); });
    synthesisLog.forEach(s => { if ((s.headline + (s.insights || []).join(' ')).toLowerCase().includes(term)) out.push({ type: 'Synthesis', label: s.headline, tab: 'synthesis' }); });
    tbr.forEach(t => { if ((t.title + t.author + t.subject).toLowerCase().includes(term)) out.push({ type: 'TBR', label: t.title, tab: 'tbr' }); });
    wordBank.forEach(w => { if ((w.word + w.definition + w.source).toLowerCase().includes(term)) out.push({ type: 'Word Bank', label: w.word, tab: 'wordbank' }); });
    fogLog.forEach(f => { if ((f.concept + f.whatIsntClicking + f.context).toLowerCase().includes(term)) out.push({ type: 'Fog Log', label: f.concept, tab: 'foglog' }); });
    return out.slice(0, 8);
  }, [q, notes, library, citations, questions, mediaJournal, synthesisLog, tbr, wordBank, fogLog]);

  return (
    <div ref={containerRef} style={{ position: 'fixed', top: 18, right: 18, zIndex: 50 }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Search"
        style={{
          width: 40, height: 40, borderRadius: '50%', border: `1px solid ${COLORS.lavenderLight}`,
          background: COLORS.white, cursor: 'pointer', fontSize: 17, boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        🔍
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 48, right: 0, width: 280,
          background: COLORS.white, border: `1px solid ${COLORS.lavenderLight}`, borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: 10,
        }}>
          <TextInput ref={inputRef} placeholder="Search notes, library, citations, questions..." value={q} onChange={e => setQ(e.target.value)} />
          {results.length > 0 && (
            <div style={{ border: `1px solid ${COLORS.lavenderLight}`, borderRadius: 10, marginTop: 6, overflow: 'hidden' }}>
              {results.map((r, i) => (
                <button key={i} onClick={() => { setTab(r.tab); setQ(''); setOpen(false); }} style={{
                  display: 'block', width: '100%', textAlign: 'center', padding: '8px 12px', border: 'none',
                  borderBottom: i < results.length - 1 ? `1px solid ${COLORS.lavenderLight}` : 'none',
                  background: 'transparent', cursor: 'pointer', fontFamily: BODY_FONT, fontSize: 12,
                }}>
                  <Badge color={COLORS.lavender}>{r.type}</Badge>{r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StudyHubContent({ syncPanelProps }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mergeConflicts, setMergeConflicts] = useState(null);
  useEffect(() => {
    const stored = sessionStorage.getItem('rr-study-hub-merge-conflicts');
    if (stored) {
      try { setMergeConflicts(JSON.parse(stored)); } catch {}
      sessionStorage.removeItem('rr-study-hub-merge-conflicts');
    }
  }, []);
  const [thesis, saveThesis, thesisLoaded] = useStore('rr-phd-thesis', { statement: '', challenges: [], graceLog: [] });
  const [tasks, saveTasks] = useStore('rr-phd-tasks', SEED_SYLLABUS.map((t, i) => ({ ...t, id: i + 1 })));
  const [checkpoints, saveCheckpoints] = useStore('rr-phd-checkpoints', SEED_CHECKPOINTS.map((c, i) => ({ ...c, id: i + 1 })));
  const [notes, saveNotes] = useStore('rr-phd-notes', []);
  const [library, saveLibrary] = useStore('rr-phd-library', []);
  const [citations, saveCitations] = useStore('rr-phd-citations', []);
  const CATALOG_SYNC_KEY = 'dissertation-catalog-export';
  const lastPushedCatalog = React.useRef('');
  const [catalogDuplicates, setCatalogDuplicates] = useState([]);

  // Auto-push: every few seconds, check whether the catalog-ready entries
  // actually changed and only then push to the same live blob backend the
  // cross-device sync uses. Interval-based (not a per-render effect) on
  // purpose — typing in a Hook or Drawer field updates `citations` on every
  // keystroke, and an effect keyed on [citations] would fire a network
  // request per keystroke. Polling and diffing avoids that entirely.
  useEffect(() => {
    const interval = setInterval(async () => {
      const { entries, duplicatesFound } = buildCatalogEntries(citations);
      setCatalogDuplicates(duplicatesFound);
      const snapshot = JSON.stringify(entries);
      if (snapshot === lastPushedCatalog.current) return;
      try {
        await fetch(`/api/study-hub?key=${encodeURIComponent(CATALOG_SYNC_KEY)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            generatedAt: new Date().toISOString(),
            source: 'Formation Study Hub — auto-sync',
            entries,
          }),
        });
        lastPushedCatalog.current = snapshot;
      } catch (e) {
        // catalog push failed silently — citation data itself is unaffected;
        // it will retry on the next interval tick
      }
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citations]);

  const [questions, saveQuestions] = useStore('rr-phd-questions', []);
  const [framework, saveFramework] = useStore('rr-phd-framework', { entries: [] });
  const [challengeLog, saveChallengeLog] = useStore('rr-phd-challenges', []);
  const [cases, saveCases] = useStore('rr-phd-cases', []);
  const [mediaJournal, saveMediaJournal] = useStore('rr-phd-media-journal', []);
  const [tbr, saveTbr] = useStore('rr-phd-tbr', []);
  const [wordBank, saveWordBank] = useStore('rr-phd-wordbank', []);
  const [fogLog, saveFogLog] = useStore('rr-phd-foglog', []);
  const [mediaDraftSeed, setMediaDraftSeed] = useState(null);
  const [synthesisLog, saveSynthesisLog] = useStore('rr-phd-synthesis', []);
  const [bridge, saveBridge] = useStore('rr-phd-library-bridge', { siteUrl: 'https://root-restore-library-tracker.netlify.app', libraryKey: '', importedIds: [] });

  return (
    <div style={{ fontFamily: BODY_FONT, background: COLORS.cream, minHeight: '100vh', padding: '24px 16px' }}>
      <style>{FONT_IMPORT}</style>
      <style>{PRINT_STYLE}</style>
      <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.sage, fontWeight: 700 }}>Tulsi &amp; Grace</div>
        <h1 style={{ margin: '4px 0 4px', fontFamily: DISPLAY_FONT, fontSize: 28, fontWeight: 700, color: COLORS.ink }}>Formation Study Hub</h1>
        <button onClick={() => setActiveTab('dashboard')} style={{
          border: 'none', background: 'none', cursor: 'pointer', fontSize: 11, color: COLORS.sage,
          margin: '0 0 16px', fontFamily: BODY_FONT, display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
            background: !syncPanelProps.syncKey ? COLORS.lavender : syncPanelProps.syncStatus === 'error' ? '#c07a6e' : syncPanelProps.syncStatus === 'saving' ? '#d9b45e' : '#7a9e7e',
          }} />
          {!syncPanelProps.syncKey ? 'Not syncing — this device only' : syncPanelProps.syncStatus === 'error' ? 'Sync error' : syncPanelProps.syncStatus === 'saving' ? 'Syncing...' : syncPanelProps.lastSyncedAt ? `Synced ${syncPanelProps.lastSyncedAt}` : 'Sync ready'}
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 26, borderBottom: `1px solid ${COLORS.lavenderLight}`, paddingBottom: 14 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              fontFamily: BODY_FONT, background: activeTab === t.id ? COLORS.sage : COLORS.white,
              color: activeTab === t.id ? '#fff' : COLORS.ink,
            }}>{t.label}</button>
          ))}
        </div>

        <GlobalSearch notes={notes} library={library} citations={citations} questions={questions} mediaJournal={mediaJournal} synthesisLog={synthesisLog} tbr={tbr} wordBank={wordBank} fogLog={fogLog} setTab={setActiveTab} />

        {mergeConflicts && mergeConflicts.length > 0 && (
          <div style={{ background: '#fbeceb', border: '1px solid #e3b3b3', borderRadius: 9, padding: '10px 16px', margin: '14px 0', textAlign: 'left', fontSize: 12, color: '#a0524a' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Merge complete — {mergeConflicts.length} field{mergeConflicts.length === 1 ? '' : 's'} need a quick manual check:</div>
            <ul style={{ margin: '4px 0 6px', paddingLeft: 18 }}>
              {mergeConflicts.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
            <Button variant="secondary" onClick={() => setMergeConflicts(null)}>Dismiss</Button>
          </div>
        )}

        {!thesisLoaded ? <p style={{ fontSize: 13, color: COLORS.sage }}>Loading your hub...</p> : (
          <div style={{ textAlign: 'center' }}>
            {activeTab === 'dashboard' && <Dashboard thesis={thesis} tasks={tasks} questions={questions} checkpoints={checkpoints} cases={cases} mediaJournal={mediaJournal} synthesisLog={synthesisLog} wordBank={wordBank} fogLog={fogLog} setTab={setActiveTab} syncPanelProps={syncPanelProps} />}
            {activeTab === 'syllabus' && <Syllabus tasks={tasks} saveTasks={saveTasks} />}
            {activeTab === 'checkpoints' && <Checkpoints checkpoints={checkpoints} saveCheckpoints={saveCheckpoints} tasks={tasks} />}
            {activeTab === 'thesis' && <Thesis thesis={thesis} saveThesis={saveThesis} />}
            {activeTab === 'cases' && <CaseLog cases={cases} saveCases={saveCases} />}
            {activeTab === 'tbr' && <LivingTBR
              items={tbr} saveItems={saveTbr}
              onPromoteToMedia={(book) => {
                setMediaDraftSeed({ title: book.title, creator: book.author || '' });
                setActiveTab('media');
              }}
            />}
            {activeTab === 'wordbank' && <WordBank words={wordBank} saveWords={saveWordBank} bridge={bridge} saveBridge={saveBridge} onGoToMediaJournal={() => setActiveTab('media')} />}
            {activeTab === 'foglog' && <FogLog entries={fogLog} saveEntries={saveFogLog} />}
            {activeTab === 'media' && <DissertationMedia
              entries={mediaJournal} saveEntries={saveMediaJournal}
              bridge={bridge} saveBridge={saveBridge}
              draftSeed={mediaDraftSeed} onConsumeDraftSeed={() => setMediaDraftSeed(null)}
              onPromoteCitation={(entry) => {
                saveCitations([{
                  id: Date.now(), author: entry.creator, year: '', title: entry.title,
                  source: entry.mediaType, claim: entry.summary, evidenceType: entry.evidenceType,
                  provenance: 'Media journal', provenanceTitle: entry.title,
                }, ...citations]);
                alert('Sent to citation bank.');
              }}
              onPromoteFrameworkGap={(entry) => {
                const letter = (entry.graceLetters && entry.graceLetters[0]) || 'Gather';
                saveFramework({
                  ...framework,
                  entries: [{
                    id: Date.now(), letter, field: 'gap',
                    text: `From "${entry.title}" (${entry.stance}): ${entry.critique || entry.summary}`,
                    date: new Date().toLocaleDateString(),
                    provenance: 'Media journal', provenanceTitle: entry.title,
                  }, ...(framework.entries || [])],
                });
                alert('Sent to framework builder as a gap.');
              }}
            />}
            {activeTab === 'recommendations' && <DissertationRecommendations
              thesis={thesis} framework={framework} mediaJournal={mediaJournal} tbr={tbr}
              onAddToTbr={(item) => saveTbr([{ ...item, id: Date.now() }, ...tbr])}
            />}
            {activeTab === 'synthesis' && <WeeklySynthesis synthesisLog={synthesisLog} saveSynthesisLog={saveSynthesisLog} />}
            {activeTab === 'framework' && <FrameworkBuilder framework={framework} saveFramework={saveFramework} />}
            {activeTab === 'challenge' && <ChallengeMe log={challengeLog} saveLog={saveChallengeLog} thesis={thesis} framework={framework} />}
            {activeTab === 'notes' && <Notes notes={notes} saveNotes={saveNotes} />}
            {activeTab === 'library' && <Library items={library} saveItems={saveLibrary} />}
            {activeTab === 'citations' && <Citations citations={citations} saveCitations={saveCitations} catalogDuplicates={catalogDuplicates} />}
            {activeTab === 'questions' && <Questions questions={questions} saveQuestions={saveQuestions} />}
          </div>
        )}
      </div>
    </div>
  );
}

const SYNC_KEY_STORAGE = 'rr-study-hub-sync-key';
const SYNC_PUSH_INTERVAL_MS = 4000;

export default function StudyHub() {
  const [syncKey, setSyncKey] = useState(() => localStorage.getItem(SYNC_KEY_STORAGE) || '');
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | saving | saved | error
  const [lastSyncedAt, setLastSyncedAt] = useState('');
  const lastPushedSnapshot = React.useRef('');
  const SYNC_URL = '/api/study-hub';

  // One-time hydration: if a sync key already exists on this device (a
  // returning session), pull the cloud copy into localStorage BEFORE any
  // tab content mounts, so every useStore hook's lazy initializer reads the
  // fresh data on its very first render — no reload needed, no flash.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (syncKey) {
        try {
          const res = await fetch(`${SYNC_URL}?key=${encodeURIComponent(syncKey)}`);
          const json = await res.json();
          if (!cancelled && json.data) {
            restoreAllHubData(json.data);
            lastPushedSnapshot.current = JSON.stringify(json.data);
          }
        } catch (e) {
          // cloud unreachable at startup — proceed with whatever's local; the
          // push loop will retry once it comes back
        }
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push loop: every few seconds, compare the current local snapshot to the
  // last one actually pushed — only sends a request when something changed,
  // so idle periods don't spam the function. This is last-write-wins, same
  // model as the Library Tracker's own sync — two devices editing at the
  // exact same moment can overwrite each other; it does not merge changes.
  useEffect(() => {
    if (!syncKey || !hydrated) return;
    const interval = setInterval(async () => {
      const snapshot = JSON.stringify(getAllHubData());
      if (snapshot === lastPushedSnapshot.current) return;
      setSyncStatus('saving');
      try {
        await fetch(`${SYNC_URL}?key=${encodeURIComponent(syncKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: snapshot,
        });
        lastPushedSnapshot.current = snapshot;
        setSyncStatus('saved');
        setLastSyncedAt(new Date().toLocaleTimeString());
      } catch (e) {
        setSyncStatus('error');
      }
    }, SYNC_PUSH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [syncKey, hydrated]);

  const startSync = () => {
    const key = Math.random().toString(36).slice(2, 6) + '-' + Math.random().toString(36).slice(2, 6);
    localStorage.setItem(SYNC_KEY_STORAGE, key);
    setSyncKey(key);
  };

  const joinSync = async (inputKey) => {
    const trimmed = inputKey.trim();
    if (!trimmed) return;
    // Joining overwrites this device's local data with whatever's on the key
    // (or, if the key is empty/new, leaves this device's data in place to be
    // pushed up next cycle — either way, this device's current data is about
    // to be superseded one way or the other). Warn before touching anything
    // if this device actually has data that would be affected.
    const hasLocalData = Object.keys(getAllHubData()).length > 0;
    if (hasLocalData) {
      const proceed = window.confirm(
        'This device already has data in it. Joining will replace everything on this device with the cloud copy under that key ' +
        '(or, if that key has no data yet, this device\'s own data will be pushed up to it instead). ' +
        'Use "Export all data" on the dashboard first if you want a backup. Continue joining?'
      );
      if (!proceed) return;
    }
    try {
      const res = await fetch(`${SYNC_URL}?key=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (json.data) {
        restoreAllHubData(json.data);
      } else if (hasLocalData) {
        // Key has no cloud data yet — this device's existing data will become
        // the seed for that key once the push loop runs. Make that explicit
        // rather than letting it happen silently after the reload.
        const stillProceed = window.confirm(
          'No data was found yet for that key — it may be brand new, or the key may be mistyped. ' +
          'If you continue, this device\'s current data will become the starting point for that key. Continue?'
        );
        if (!stillProceed) return;
      }
      localStorage.setItem(SYNC_KEY_STORAGE, trimmed);
      // a fresh load is the simplest correct way to get every already-mounted
      // useStore hook to pick up the just-restored data — same pattern the
      // Import Backup button already uses.
      window.location.reload();
    } catch (e) {
      alert('Could not reach the sync server. Check the key and try again.');
    }
  };

  const mergeSync = async (inputKey) => {
    const trimmed = inputKey.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(`${SYNC_URL}?key=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      const cloudData = json.data || {};
      const localData = getAllHubData();
      const { merged, conflicts } = mergeAllHubData(localData, cloudData);

      const proceed = window.confirm(
        Object.keys(cloudData).length === 0
          ? 'No data was found yet for that key — it may be brand new, or the key may be mistyped. If you continue, this device\'s current data will become the starting point for that key. Continue?'
          : `This will combine this device's data with the cloud copy under that key — nothing gets deleted.${conflicts.length ? ` ${conflicts.length} field(s) had conflicting values and will need a quick manual check afterward.` : ''} Continue?`
      );
      if (!proceed) return;

      restoreAllHubData(merged);
      localStorage.setItem(SYNC_KEY_STORAGE, trimmed);
      if (conflicts.length) {
        // stash for a one-time notice after reload, since useStore hooks
        // need the reload to pick up merged data anyway
        sessionStorage.setItem('rr-study-hub-merge-conflicts', JSON.stringify(conflicts));
      }
      window.location.reload();
    } catch (e) {
      alert('Could not reach the sync server. Check the key and try again.');
    }
  };

  const stopSync = () => {
    if (!window.confirm('Stop syncing this device? Your data stays on this device but will no longer update from or push to the shared key.')) return;
    localStorage.removeItem(SYNC_KEY_STORAGE);
    setSyncKey('');
  };

  const manualPush = async () => {
    if (!syncKey) return;
    setSyncStatus('saving');
    try {
      const snapshot = JSON.stringify(getAllHubData());
      await fetch(`${SYNC_URL}?key=${encodeURIComponent(syncKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: snapshot,
      });
      lastPushedSnapshot.current = snapshot;
      setSyncStatus('saved');
      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setSyncStatus('error');
    }
  };

  if (!hydrated) {
    return (
      <div style={{ fontFamily: BODY_FONT, background: COLORS.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{FONT_IMPORT}</style>
        <p style={{ fontSize: 13, color: COLORS.sage }}>Loading your hub...</p>
      </div>
    );
  }

  return (
    <StudyHubContent
      syncPanelProps={{
        syncKey, syncStatus, lastSyncedAt,
        onStartSync: startSync, onJoinSync: joinSync, onMergeSync: mergeSync, onStopSync: stopSync, onManualPush: manualPush,
      }}
    />
  );
}
