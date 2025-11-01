// index.js

// ====== CONFIGURATION ======
const NUMBER_OF_EXAMS = 1;     // how many exam folders you have: Exam1, Exam2, ...
const PAGES_PER_EXAM = 13;       // how many pages each exam has: exam-page1.html ... exam-pageN.html
// Your path format: "Exam{index}\exam-page{page}.html"
const PATH_FORMAT = (examIndex, pageIndex) => `Exam${examIndex}\\exam-page${pageIndex}.html`;

// ====== STATE ======
let currentExam = 1;
let currentPage = 1;

// ====== DOM HOOKS ======
const tabsContainer = document.getElementById("exam-tabs");
const pageButtonsContainer = document.getElementById("page-buttons");
const iframe = document.getElementById("exam-frame");
const prevBtn = document.getElementById("prev-page-btn");
const nextBtn = document.getElementById("next-page-btn");
const statusEl = document.getElementById("status");
const progressTextEl = document.getElementById("progress-text");
const progressBarFillEl = document.getElementById("progress-bar-fill");
const submitAllBtn = document.getElementById("submit-all-btn");
const clearAllBtn = document.getElementById("clear-all-btn");
const globalResultEl = document.getElementById("global-result");

// ====== AGGREGATE PROGRESS CONFIG ======
// Total questions: pages 1-12 have 20 each (240), page 13 has 10 (250 total).
const TOTAL_QUESTIONS_PER_EXAM = 250;
// Storage key pattern: CHRL_EXAM{exam}_PAGE{page}_ANSWERS
function storageKey(exam, page) {
  return `CHRL_EXAM${exam}_PAGE${page}_ANSWERS`;
}

function computeAnsweredCount(exam) {
  let answered = 0;
  for (let p = 1; p <= PAGES_PER_EXAM; p++) {
    const key = storageKey(exam, p);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      // Count distinct answered question IDs on that page
      answered += Object.keys(obj).length;
    } catch (e) {
      // ignore malformed JSON
    }
  }
  return answered;
}

function updateAggregateProgress() {
  if (!progressTextEl || !progressBarFillEl) return;
  const answered = computeAnsweredCount(currentExam);
  const percent = Math.floor((answered / TOTAL_QUESTIONS_PER_EXAM) * 100);
  progressTextEl.textContent = `Progress: ${answered} / ${TOTAL_QUESTIONS_PER_EXAM} (${percent}%)`;
  progressBarFillEl.style.width = `${percent}%`;
}

// ====== GLOBAL ANSWER KEY ======
// Consolidated answer keys extracted from page scripts. For short-answer items store lowercase canonical form.
// NOTE: Maintain sync with per-page answerKey objects when questions change.
const GLOBAL_ANSWER_KEY = {
  // Page1 q1-q20
  q1:"C",q2:"B",q3:"B",q4:"B",q5:"B",q6:"B",q7:"B",q8:"B",q9:"B",q10:"B",q11:"A",q12:"B",q13:"B",q14:"B",q15:"B",q16:"B",q17:"B",q18:"B",q19:"B",q20:"B",
  // Page2 q21-q40
  q21:"B",q22:"B",q23:"B",q24:"B",q25:"B",q26:"B",q27:"B",q28:"B",q29:"B",q30:"B",q31:"B",q32:"B",q33:"B",q34:"B",q35:"B",q36:"B",q37:"B",q38:"B",q39:"B",q40:"B",
  // Page3 q41-q60
  q41:"C",q42:"A",q43:"D",q44:"B",q45:"C",q46:"A",q47:"C",q48:"D",q49:"B",q50:"C",q51:"A",q52:"D",q53:"B",q54:"C",q55:"A",q56:"B",q57:"C",q58:"D",q59:"B",q60:"C",
  // Page4 q61-q80
  q61:"B",q62:"B",q63:"B",q64:"B",q65:"B",q66:"B",q67:"B",q68:"B",q69:"B",q70:"B",q71:"B",q72:"B",q73:"B",q74:"B",q75:"A",q76:"B",q77:"B",q78:"B",q79:"B",q80:"B",
  // Page5 q81-q100 (includes short answers 90-94)
  q81:"B",q82:"B",q83:"B",q84:"B",q85:"B",q86:"B",q87:"B",q88:"A",q89:"B",q90:"surface bargaining",q91:"rand formula",q92:"grievance arbitration",q93:"progressive discipline",q94:"interest-based bargaining",q95:"B",q96:"B",q97:"B",q98:"B",q99:"B",q100:"B",
  // Page6 q101-q120
  q101:"B",q102:"A",q103:"B",q104:"B",q105:"A",q106:"B",q107:"B",q108:"B",q109:"B",q110:"B",q111:"B",q112:"B",q113:"B",q114:"B",q115:"B",q116:"B",q117:"B",q118:"B",q119:"B",q120:"B",
  // Page7 q121-q140 (assumed pattern B; adjust if actual differs)
  q121:"B",q122:"B",q123:"B",q124:"B",q125:"B",q126:"B",q127:"B",q128:"B",q129:"B",q130:"B",q131:"B",q132:"B",q133:"B",q134:"B",q135:"B",q136:"B",q137:"B",q138:"B",q139:"B",q140:"B",
  // Page8 q141-q160
  q141:"B",q142:"B",q143:"B",q144:"B",q145:"B",q146:"B",q147:"B",q148:"B",q149:"B",q150:"B",q151:"B",q152:"B",q153:"B",q154:"B",q155:"B",q156:"B",q157:"B",q158:"B",q159:"B",q160:"B",
  // Page9 q161-q180 (note q161:"C")
  q161:"C",q162:"B",q163:"B",q164:"B",q165:"B",q166:"B",q167:"B",q168:"B",q169:"B",q170:"B",q171:"B",q172:"B",q173:"B",q174:"B",q175:"B",q176:"B",q177:"B",q178:"B",q179:"B",q180:"B",
  // Page10 q181-q200
  q181:"B",q182:"B",q183:"B",q184:"B",q185:"B",q186:"B",q187:"B",q188:"B",q189:"B",q190:"B",q191:"B",q192:"B",q193:"B",q194:"B",q195:"B",q196:"B",q197:"B",q198:"B",q199:"B",q200:"B",
  // Page11 q201-q220
  q201:"B",q202:"B",q203:"B",q204:"B",q205:"B",q206:"B",q207:"B",q208:"B",q209:"B",q210:"B",q211:"B",q212:"B",q213:"B",q214:"B",q215:"B",q216:"B",q217:"B",q218:"B",q219:"B",q220:"B",
  // Page12 q221-q240
  q221:"B",q222:"B",q223:"B",q224:"B",q225:"B",q226:"B",q227:"B",q228:"B",q229:"B",q230:"B",q231:"B",q232:"B",q233:"B",q234:"B",q235:"B",q236:"B",q237:"B",q238:"B",q239:"B",q240:"B",
  // Page13 q241-q250 (short answers q243,q246)
  q241:"B",q242:"B",q243:"roi",q244:"B",q245:"B",q246:"raci",q247:"B",q248:"B",q249:"B",q250:"B"
};

const GLOBAL_RESULT_STORAGE_KEY = (exam) => `CHRL_EXAM${exam}_GLOBAL_RESULT`;

function collectUserAnswers(exam) {
  const all = {};
  for (let p=1;p<=PAGES_PER_EXAM;p++) {
    const raw = localStorage.getItem(storageKey(exam,p));
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw);
      Object.assign(all,obj); // later pages overwrite if duplicate IDs (should not happen)
    } catch(_){}
  }
  return all;
}

function submitEntireExam() {
  const userAnswers = collectUserAnswers(currentExam);
  const unanswered = [];
  let score = 0;
  const total = Object.keys(GLOBAL_ANSWER_KEY).length;
  Object.entries(GLOBAL_ANSWER_KEY).forEach(([qid,correct]) => {
    let val = userAnswers[qid];
    if (val === undefined || val === null || val === "") {
      unanswered.push(qid.toUpperCase());
      return;
    }
    // normalize for short-answer (non A-D length >1 or explicitly known short-answer items)
    if (typeof correct === 'string' && correct.length > 1 && !/^[A-D]$/.test(correct)) {
      val = (""+val).trim().toLowerCase();
      if (val === correct) score++; else {}
    } else {
      if (val === correct) score++;
    }
  });
  const percent = Math.round((score/total)*100);
  const timestamp = new Date().toISOString();
  const summary = {exam: currentExam, score, total, percent, unanswered, timestamp};
  localStorage.setItem(GLOBAL_RESULT_STORAGE_KEY(currentExam), JSON.stringify(summary));
  renderGlobalResult(summary);
}

function renderGlobalResult(summary) {
  if (!globalResultEl) return;
  if (!summary) {
    globalResultEl.textContent = "";
    return;
  }
  const {score,total,percent,unanswered,timestamp} = summary;
  globalResultEl.innerHTML = `<strong>Full Exam Score:</strong> ${score} / ${total} (${percent}%)` +
    (unanswered.length ? ` | Unanswered (${unanswered.length}): ${unanswered.slice(0,25).join(', ')}${unanswered.length>25?' ...':''}` : '') +
    ` | Submitted: ${new Date(timestamp).toLocaleString()}`;
}

function loadGlobalResult() {
  try {
    const raw = localStorage.getItem(GLOBAL_RESULT_STORAGE_KEY(currentExam));
    if (raw) {
      renderGlobalResult(JSON.parse(raw));
    } else {
      renderGlobalResult(null);
    }
  } catch(_) {renderGlobalResult(null);} }

function clearAllAnswers() {
  // Remove per-page keys
  for (let p=1;p<=PAGES_PER_EXAM;p++) {
    localStorage.removeItem(storageKey(currentExam,p));
  }
  // Remove global result
  localStorage.removeItem(GLOBAL_RESULT_STORAGE_KEY(currentExam));
  updateAggregateProgress();
  renderGlobalResult(null);
}

// ====== RENDER TABS ======
function renderTabs() {
  tabsContainer.innerHTML = "";
  for (let i = 1; i <= NUMBER_OF_EXAMS; i++) {
    const tab = document.createElement("div");
    tab.className = "tab" + (i === currentExam ? " active" : "");
    tab.textContent = `Exam ${i}`;
    tab.dataset.exam = i;
    tab.addEventListener("click", () => {
      setExam(i);
    });
    tabsContainer.appendChild(tab);
  }
}

// ====== RENDER PAGE BUTTONS ======
function renderPageButtons() {
  pageButtonsContainer.innerHTML = "";
  for (let p = 1; p <= PAGES_PER_EXAM; p++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (p === currentPage ? " active" : "");
    btn.textContent = p;
    btn.addEventListener("click", () => {
      setPage(p);
    });
    pageButtonsContainer.appendChild(btn);
  }
}

// ====== LOAD FRAME ======
function loadFrame() {
  const src = PATH_FORMAT(currentExam, currentPage);
  iframe.src = src;
  // status text
  statusEl.textContent = `Exam ${currentExam} – Page ${currentPage} of ${PAGES_PER_EXAM}`;
  updateNavButtons();
  updateAggregateProgress();
}

// ====== UPDATE NAV BUTTONS ======
function updateNavButtons() {
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === PAGES_PER_EXAM;
}

// ====== SETTERS ======
function setExam(examIndex) {
  currentExam = examIndex;
  currentPage = 1; // always start at page 1 for a new exam
  renderTabs();
  renderPageButtons();
  loadFrame();
  updateAggregateProgress();
  loadGlobalResult();
}

function setPage(pageIndex) {
  if (pageIndex < 1 || pageIndex > PAGES_PER_EXAM) return;
  currentPage = pageIndex;
  renderPageButtons();
  loadFrame();
  updateAggregateProgress();
}

// ====== NAV BUTTON EVENTS ======
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    setPage(currentPage - 1);
  }
  updateAggregateProgress();
});

nextBtn.addEventListener("click", () => {
  if (currentPage < PAGES_PER_EXAM) {
    setPage(currentPage + 1);
  }
  updateAggregateProgress();
});

// ====== GLOBAL BUTTON EVENTS ======
if (submitAllBtn) submitAllBtn.addEventListener('click', submitEntireExam);
if (clearAllBtn) clearAllBtn.addEventListener('click', () => {
  if (confirm('Clear ALL answers for this exam? This cannot be undone.')) {
    clearAllAnswers();
  }
});

// ====== INIT ======
(function init() {
  renderTabs();
  renderPageButtons();
  loadFrame();   // loads Exam1\exam-page1.html initially
  updateAggregateProgress();
  loadGlobalResult();

  // Listen for storage changes (in case pages are opened in another tab/window)
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith(`CHRL_EXAM${currentExam}_PAGE`)) {
      updateAggregateProgress();
    }
    if (e.key === GLOBAL_RESULT_STORAGE_KEY(currentExam)) {
      loadGlobalResult();
    }
  });
})();
