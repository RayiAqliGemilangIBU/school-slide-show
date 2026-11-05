/**
 * ============================================================================
 * HIDDEN TIMETABLE EDITOR
 * Richmond Park International Secondary School Sarajevo
 *
 * Cara membuka (tombol rahasia):
 *   - Klik logo "RPS" di kiri atas sebanyak 5x dengan cepat, ATAU
 *   - Tekan Ctrl + Shift + E pada keyboard.
 *   (Opsional: PIN di config.js -> EDITOR_PIN)
 *
 * Fitur (UI editor dalam Bahasa Inggris):
 *   - Daftar kelas per tingkat (Grade 1 - 4): tambah kelas (mis. 4D),
 *     hapus kelas, ubah Class ID / track / homeroom teacher.
 *   - Pilih kelas -> tampil kotak-kotak jadwal mingguan.
 *   - Klik kotak -> edit subject, group, room, teacher.
 *   - "+ Add group" untuk membagi kelas (split: First/Second1, Boys/Girls, ...).
 *   - Perubahan langsung tampil di layar TV (realtime) & tersimpan di browser.
 *   - Export / simpan sebagai timetable.json.
 * ============================================================================
 */

(function () {
  "use strict";

  const DAYS = [
    { key: "Monday", en: "Monday" },
    { key: "Tuesday", en: "Tuesday" },
    { key: "Wednesday", en: "Wednesday" },
    { key: "Thursday", en: "Thursday" },
    { key: "Friday", en: "Friday" }
  ];

  // Grades that are always shown in the class picker (even when empty),
  // so classes can be added back to a grade at any time.
  const DEFAULT_GRADES = [1, 2, 3, 4];
  const ROMAN = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI" };

  const SECRET_CLICKS = 5;
  const SECRET_WINDOW_MS = 3000;

  let overlay = null;
  let currentClassId = null;
  let extraPeriods = 0;
  let editing = null;      // cell being edited: { classId, dayKey, period }
  let classEditing = null; // class settings: { mode: "new" | "edit", classId }

  function app() {
    return window.TimetableApp;
  }

  function data() {
    return app() && app().getTimetable();
  }

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function el(id) {
    return document.getElementById(id);
  }

  // ==========================================================================
  // SECRET TRIGGER
  // ==========================================================================
  function setupSecretTrigger() {
    const logo = document.querySelector(".school-logo-badge");
    let clicks = [];
    if (logo) {
      logo.addEventListener("click", () => {
        const now = Date.now();
        clicks = clicks.filter(t => now - t < SECRET_WINDOW_MS);
        clicks.push(now);
        if (clicks.length >= SECRET_CLICKS) {
          clicks = [];
          requestOpen();
        }
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        if (isOpen()) closeEditor(); else requestOpen();
        return;
      }
      if (e.key === "Escape" && isOpen()) {
        if (classEditing) closeClassModal();
        else if (editing) closeCellModal();
        else if (currentClassId) showClassPicker();
        else closeEditor();
      }
    });
  }

  function requestOpen() {
    const pin = app() && app().CONFIG && app().CONFIG.EDITOR_PIN;
    if (pin) {
      const entered = window.prompt("Timetable editor PIN:");
      if (entered === null) return;
      if (String(entered) !== String(pin)) {
        window.alert("Wrong PIN.");
        return;
      }
    }
    openEditor();
  }

  // ==========================================================================
  // OVERLAY SHELL
  // ==========================================================================
  function isOpen() {
    return overlay && overlay.classList.contains("visible");
  }

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.id = "ttEditor";
    overlay.className = "tt-editor";
    overlay.innerHTML = `
      <div class="tt-panel">
        <header class="tt-header">
          <div class="tt-title-wrap">
            <button id="ttBackBtn" class="tt-btn tt-btn-ghost" style="display:none;">&larr; All classes</button>
            <div>
              <div id="ttTitle" class="tt-title">Timetable Editor</div>
              <div id="ttSubtitle" class="tt-subtitle">Select a class</div>
            </div>
          </div>
          <div class="tt-actions">
            <button id="ttClassSettingsBtn" class="tt-btn" style="display:none;">⚙ Class settings</button>
            <button id="ttExportBtn" class="tt-btn" title="Download timetable.json">⬇ Export JSON</button>
            <button id="ttSaveFileBtn" class="tt-btn" title="Save directly to data/timetable.json">💾 Save to file</button>
            <button id="ttResetBtn" class="tt-btn tt-btn-danger" title="Discard all edits and reload data/timetable.json">↺ Reset</button>
            <button id="ttCloseBtn" class="tt-btn tt-btn-primary">✕ Close</button>
          </div>
        </header>
        <div id="ttStatus" class="tt-status"></div>
        <div id="ttBody" class="tt-body"></div>
      </div>

      <!-- Lesson (cell) editor -->
      <div id="ttModal" class="tt-modal">
        <div class="tt-modal-card">
          <div class="tt-modal-head">
            <div>
              <div id="ttModalTitle" class="tt-modal-title"></div>
              <div id="ttModalSub" class="tt-modal-sub"></div>
            </div>
            <button id="ttModalX" class="tt-btn tt-btn-ghost">✕</button>
          </div>
          <div class="tt-sessions-head">
            <span>Subject</span>
            <span>Group</span>
            <span>Room</span>
            <span>Teacher</span>
            <span></span>
          </div>
          <div id="ttSessions" class="tt-sessions"></div>
          <button id="ttAddSessionBtn" class="tt-btn tt-btn-add">+ Add group (split the class)</button>
          <div class="tt-modal-foot">
            <button id="ttClearCellBtn" class="tt-btn tt-btn-danger">🗑 Clear lesson</button>
            <div class="tt-spacer"></div>
            <button id="ttCancelBtn" class="tt-btn">Cancel</button>
            <button id="ttSaveCellBtn" class="tt-btn tt-btn-primary">✔ Save</button>
          </div>
        </div>
      </div>

      <!-- Class settings (add / edit class, homeroom teacher) -->
      <div id="ttClassModal" class="tt-modal">
        <div class="tt-modal-card tt-modal-small">
          <div class="tt-modal-head">
            <div>
              <div id="ttClassModalTitle" class="tt-modal-title"></div>
              <div id="ttClassModalSub" class="tt-modal-sub"></div>
            </div>
            <button id="ttClassModalX" class="tt-btn tt-btn-ghost">✕</button>
          </div>
          <div class="tt-form">
            <label class="tt-field">
              <span>Class ID</span>
              <input id="ttFClassId" class="tt-in" placeholder="e.g. 4D" maxlength="10" />
            </label>
            <label class="tt-field">
              <span>Grade</span>
              <select id="ttFGrade" class="tt-in"></select>
            </label>
            <label class="tt-field tt-field-wide">
              <span>Homeroom teacher</span>
              <input id="ttFTeacher" class="tt-in" list="ttHomeroomList" placeholder="e.g. Edisa Zilic" />
            </label>
            <label class="tt-field tt-field-wide">
              <span>Track</span>
              <input id="ttFTrack" class="tt-in" list="ttTrackList" placeholder="e.g. General" />
            </label>
          </div>
          <div id="ttClassError" class="tt-form-error"></div>
          <div class="tt-modal-foot">
            <button id="ttDeleteClassBtn" class="tt-btn tt-btn-danger">🗑 Delete class</button>
            <div class="tt-spacer"></div>
            <button id="ttClassCancelBtn" class="tt-btn">Cancel</button>
            <button id="ttClassSaveBtn" class="tt-btn tt-btn-primary">✔ Save</button>
          </div>
        </div>
      </div>

      <datalist id="ttSubjectList"></datalist>
      <datalist id="ttGroupList"></datalist>
      <datalist id="ttRoomList"></datalist>
      <datalist id="ttTeacherList"></datalist>
      <datalist id="ttHomeroomList"></datalist>
      <datalist id="ttTrackList"></datalist>
    `;
    document.body.appendChild(overlay);

    el("ttCloseBtn").addEventListener("click", closeEditor);
    el("ttBackBtn").addEventListener("click", showClassPicker);
    el("ttClassSettingsBtn").addEventListener("click", () => openClassModal("edit", currentClassId));
    el("ttExportBtn").addEventListener("click", exportJson);
    el("ttSaveFileBtn").addEventListener("click", saveToFile);
    el("ttResetBtn").addEventListener("click", resetToFile);

    el("ttModalX").addEventListener("click", closeCellModal);
    el("ttCancelBtn").addEventListener("click", closeCellModal);
    el("ttAddSessionBtn").addEventListener("click", () => addSessionRow({ group: suggestNextGroup() }, true));
    el("ttSaveCellBtn").addEventListener("click", saveCell);
    el("ttClearCellBtn").addEventListener("click", clearCell);
    el("ttModal").addEventListener("click", (e) => {
      if (e.target.id === "ttModal") closeCellModal();
    });
    el("ttSessions").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) saveCell(); // Ctrl+Enter = Save
    });

    el("ttClassModalX").addEventListener("click", closeClassModal);
    el("ttClassCancelBtn").addEventListener("click", closeClassModal);
    el("ttClassSaveBtn").addEventListener("click", saveClassSettings);
    el("ttDeleteClassBtn").addEventListener("click", () => deleteClass(classEditing && classEditing.classId));
    el("ttClassModal").addEventListener("click", (e) => {
      if (e.target.id === "ttClassModal") closeClassModal();
    });
    el("ttClassModal").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName === "INPUT") saveClassSettings();
    });
  }

  function openEditor() {
    if (!app() || !data()) {
      window.alert("Timetable data is not loaded.");
      return;
    }
    if (!overlay) buildOverlay();
    fillDatalists();
    overlay.classList.add("visible");
    document.body.classList.add("editor-open");
    if (currentClassId && findClass(currentClassId)) showClassGrid(currentClassId); else showClassPicker();
  }

  function closeEditor() {
    if (!overlay) return;
    closeCellModal();
    closeClassModal();
    overlay.classList.remove("visible");
    document.body.classList.remove("editor-open");
  }

  function setStatus(msg, kind) {
    const s = el("ttStatus");
    if (!s) return;
    if (!msg) {
      const info = app().getLocalEditInfo();
      if (info) {
        const d = new Date(info.savedAt);
        msg = `● Local edits active (saved ${d.toLocaleDateString()} ${d.toLocaleTimeString()}). To make them permanent use "Save to file" or "Export JSON".`;
        kind = "info";
      } else {
        msg = "Showing data from data/timetable.json (no local edits).";
        kind = "muted";
      }
    }
    s.textContent = msg;
    s.className = `tt-status tt-status-${kind || "info"}`;
  }

  // Persist + refresh the TV screen
  function commit(successMsg) {
    sortClasses();
    const ok = app().applyTimetable(data());
    fillDatalists();
    setStatus(ok ? successMsg : "⚠ Applied on screen, but saving in the browser failed. Use Export JSON.", ok ? "ok" : "warn");
    return ok;
  }

  // ==========================================================================
  // DATALISTS (autocomplete)
  // ==========================================================================
  function fillDatalists() {
    const A = app();
    const subjects = new Set(Object.keys(A.SUBJECT_DICTIONARY));
    const groups = new Set(Object.keys(A.GROUP_DICTIONARY));
    const rooms = new Set();
    const teachers = new Set();
    const homerooms = new Set();
    const tracks = new Set(["General"]);
    (data().classes || []).forEach(cls => {
      if (cls.class_teacher) homerooms.add(cls.class_teacher);
      if (cls.track) tracks.add(cls.track);
      Object.values(cls.schedule || {}).forEach(day => {
        (day || []).forEach(p => {
          (p.sessions || []).forEach(s => {
            if (s.subject) subjects.add(s.subject);
            if (s.group) groups.add(s.group);
            if (s.room) rooms.add(s.room);
            if (s.teacher_initial) teachers.add(s.teacher_initial);
          });
        });
      });
    });
    const fill = (id, set, labelFn) => {
      el(id).innerHTML = Array.from(set).sort((a, b) => a.localeCompare(b))
        .map(v => `<option value="${esc(v)}">${labelFn ? esc(labelFn(v)) : ""}</option>`).join("");
    };
    fill("ttSubjectList", subjects, v => (A.SUBJECT_DICTIONARY[v] ? A.SUBJECT_DICTIONARY[v].en : ""));
    fill("ttGroupList", groups, v => (A.GROUP_DICTIONARY[v] ? A.GROUP_DICTIONARY[v].en : ""));
    fill("ttRoomList", rooms);
    fill("ttTeacherList", teachers);
    fill("ttHomeroomList", homerooms);
    fill("ttTrackList", tracks);
  }

  // ==========================================================================
  // CLASS HELPERS
  // ==========================================================================
  function findClass(classId) {
    return (data().classes || []).find(c => c.class_id === classId);
  }

  function gradeOf(cls) {
    const g = Number(cls.grade);
    if (g) return g;
    const m = String(cls.class_id).match(/^\d+/);
    return m ? Number(m[0]) : 0;
  }

  function sortClasses() {
    const list = data().classes || [];
    list.sort((a, b) => gradeOf(a) - gradeOf(b) || String(a.class_id).localeCompare(String(b.class_id)));
  }

  function getAllGrades() {
    const set = new Set(DEFAULT_GRADES);
    (data().classes || []).forEach(c => { if (gradeOf(c)) set.add(gradeOf(c)); });
    return Array.from(set).sort((a, b) => a - b);
  }

  // Next free class letter for a grade: 4A, 4B, 4C -> 4D
  function suggestClassId(grade) {
    const used = new Set((data().classes || []).map(c => String(c.class_id).toUpperCase()));
    for (let i = 0; i < 26; i++) {
      const id = `${grade}${String.fromCharCode(65 + i)}`;
      if (!used.has(id)) return id;
    }
    return `${grade}X`;
  }

  function emptySchedule() {
    const s = {};
    DAYS.forEach(d => { s[d.key] = []; });
    return s;
  }

  function countLessons(cls) {
    let n = 0;
    Object.values(cls.schedule || {}).forEach(day => { n += (day || []).length; });
    return n;
  }

  // ==========================================================================
  // VIEW 1: CLASS PICKER (per grade: add / edit / delete classes)
  // ==========================================================================
  function showClassPicker() {
    currentClassId = null;
    extraPeriods = 0;
    el("ttBackBtn").style.display = "none";
    el("ttClassSettingsBtn").style.display = "none";
    el("ttTitle").textContent = "Timetable Editor";
    el("ttSubtitle").textContent = "Select a class · Add, remove or rename classes and change homeroom teachers";
    setStatus();

    const classes = data().classes || [];
    const html = getAllGrades().map(g => {
      const list = classes.filter(c => gradeOf(c) === g)
        .sort((a, b) => String(a.class_id).localeCompare(String(b.class_id)));
      return `
        <div class="tt-grade-row">
          <div class="tt-grade-label">${ROMAN[g] || g}<small>Grade ${g}</small><small>${list.length} class${list.length === 1 ? "" : "es"}</small></div>
          <div class="tt-grade-classes">
            ${list.map(c => `
              <div class="tt-class-card">
                <button class="tt-class-open" data-class="${esc(c.class_id)}" title="Edit timetable">
                  <span class="tt-class-id">${esc(c.class_id)}</span>
                  <span class="tt-class-meta">👤 ${c.class_teacher ? esc(c.class_teacher) : "<i>No homeroom teacher</i>"}</span>
                  <span class="tt-class-meta">${esc(c.track || "General")}</span>
                  <span class="tt-class-count">${countLessons(c)} lessons / week</span>
                </button>
                <div class="tt-class-tools">
                  <button class="tt-btn tt-btn-sm" data-edit="${esc(c.class_id)}" title="Class settings / homeroom teacher">⚙ Edit</button>
                  <button class="tt-btn tt-btn-sm tt-btn-danger" data-delete="${esc(c.class_id)}" title="Delete class">🗑</button>
                </div>
              </div>
            `).join("")}
            <button class="tt-class-add" data-add-grade="${g}">
              <span class="tt-class-add-plus">+</span>
              <span>Add class</span>
              <small>${esc(suggestClassId(g))}</small>
            </button>
          </div>
        </div>
      `;
    }).join("");

    el("ttBody").innerHTML = `<div class="tt-picker">${html}</div>`;
    const body = el("ttBody");
    body.querySelectorAll("[data-class]").forEach(b => b.addEventListener("click", () => showClassGrid(b.dataset.class)));
    body.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openClassModal("edit", b.dataset.edit)));
    body.querySelectorAll("[data-delete]").forEach(b => b.addEventListener("click", () => deleteClass(b.dataset.delete)));
    body.querySelectorAll("[data-add-grade]").forEach(b => b.addEventListener("click", () => openClassModal("new", null, Number(b.dataset.addGrade))));
  }

  // ==========================================================================
  // CLASS SETTINGS MODAL (add class / rename / grade / homeroom / track)
  // ==========================================================================
  function openClassModal(mode, classId, grade) {
    const cls = mode === "edit" ? findClass(classId) : null;
    if (mode === "edit" && !cls) return;
    classEditing = { mode, classId };

    const g = cls ? gradeOf(cls) : grade;
    el("ttFGrade").innerHTML = getAllGrades().map(x => `<option value="${x}" ${x === g ? "selected" : ""}>Grade ${x} (${ROMAN[x] || x})</option>`).join("");
    el("ttFClassId").value = cls ? cls.class_id : suggestClassId(g);
    el("ttFTeacher").value = cls ? (cls.class_teacher || "") : "";
    el("ttFTrack").value = cls ? (cls.track || "") : "General";
    el("ttClassError").textContent = "";

    el("ttClassModalTitle").textContent = cls ? `Class settings · ${cls.class_id}` : `Add new class · Grade ${g}`;
    el("ttClassModalSub").textContent = cls
      ? "Change the class name, grade, homeroom teacher or track."
      : "The new class starts with an empty timetable. You can fill it in right after saving.";
    el("ttDeleteClassBtn").style.display = cls ? "" : "none";
    el("ttClassModal").classList.add("visible");
    (cls ? el("ttFTeacher") : el("ttFClassId")).focus();
  }

  function closeClassModal() {
    classEditing = null;
    const m = el("ttClassModal");
    if (m) m.classList.remove("visible");
  }

  function saveClassSettings() {
    if (!classEditing) return;
    const id = el("ttFClassId").value.trim().toUpperCase().replace(/\s+/g, "");
    const grade = Number(el("ttFGrade").value);
    const teacher = el("ttFTeacher").value.trim();
    const track = el("ttFTrack").value.trim() || "General";
    const err = el("ttClassError");

    if (!id) { err.textContent = "Class ID is required."; return; }
    if (!/^[0-9A-Z\-]+$/.test(id)) { err.textContent = "Class ID may only contain letters, numbers and '-'."; return; }
    const clash = (data().classes || []).find(c => String(c.class_id).toUpperCase() === id);
    const isSame = classEditing.mode === "edit" && clash && clash.class_id === classEditing.classId;
    if (clash && !isSame) { err.textContent = `Class ${id} already exists.`; return; }

    let msg;
    if (classEditing.mode === "new") {
      data().classes = data().classes || [];
      data().classes.push({ class_id: id, grade, track, class_teacher: teacher, schedule: emptySchedule() });
      msg = `✔ Class ${id} added. Click its boxes to fill in the timetable.`;
    } else {
      const cls = findClass(classEditing.classId);
      const oldId = cls.class_id;
      cls.class_id = id;
      cls.grade = grade;
      cls.track = track;
      cls.class_teacher = teacher;
      if (currentClassId === oldId) currentClassId = id;
      msg = oldId !== id ? `✔ Class ${oldId} renamed to ${id} and saved.` : `✔ Class ${id} updated.`;
    }

    const mode = classEditing.mode;
    closeClassModal();
    commit(msg);
    if (mode === "new") showClassGrid(id);
    else if (currentClassId) showClassGrid(currentClassId);
    else showClassPicker();
    setStatus(msg, "ok");
  }

  function deleteClass(classId) {
    const cls = classId && findClass(classId);
    if (!cls) return;
    const n = countLessons(cls);
    if (!window.confirm(`Delete class ${cls.class_id}${n ? ` and its ${n} lessons` : ""}?\n\nThis cannot be undone (except with "Reset", which discards ALL edits).`)) return;
    data().classes = (data().classes || []).filter(c => c !== cls);
    closeClassModal();
    const msg = `🗑 Class ${cls.class_id} deleted.`;
    commit(msg);
    showClassPicker();
    setStatus(msg, "ok");
  }

  // ==========================================================================
  // VIEW 2: WEEKLY GRID FOR ONE CLASS (clickable boxes)
  // ==========================================================================
  function getMaxPeriod(cls) {
    let max = (data().master_schedules || []).length || 7;
    Object.values(cls.schedule || {}).forEach(day => {
      (day || []).forEach(p => { if (Number(p.period) > max) max = Number(p.period); });
    });
    return max + extraPeriods;
  }

  function showClassGrid(classId) {
    const cls = findClass(classId);
    if (!cls) { showClassPicker(); return; }
    if (currentClassId !== classId) extraPeriods = 0;
    currentClassId = classId;
    el("ttBackBtn").style.display = "";
    el("ttClassSettingsBtn").style.display = "";
    el("ttTitle").textContent = `Class ${cls.class_id}`;
    el("ttSubtitle").textContent = `Grade ${gradeOf(cls)} · ${cls.track || "General"} · Homeroom teacher: ${cls.class_teacher || "—"} — click a box to edit`;
    setStatus();

    const maxP = getMaxPeriod(cls);
    const timings = app().getPeriodTimingsMap("Monday");
    const fridayTimings = app().getPeriodTimingsMap("Friday");

    let html = `<div class="tt-grid" style="grid-template-columns: 110px repeat(${DAYS.length}, 1fr);">`;
    html += `<div class="tt-grid-corner">Period</div>`;
    DAYS.forEach(d => { html += `<div class="tt-grid-day">${d.en}</div>`; });

    for (let p = 1; p <= maxP; p++) {
      const t = timings[p];
      html += `<div class="tt-grid-period"><b>${p}.</b><small>${t ? `${t.start}–${t.end}` : ""}</small></div>`;
      DAYS.forEach(d => {
        const entry = ((cls.schedule && cls.schedule[d.key]) || []).find(x => Number(x.period) === p);
        const sessions = (entry && entry.sessions) || [];
        const ft = d.key === "Friday" && fridayTimings[p] && t && fridayTimings[p].start !== t.start
          ? `<span class="tt-cell-time" title="Friday time">${fridayTimings[p].start}</span>` : "";
        if (sessions.length === 0) {
          html += `<button class="tt-cell tt-cell-empty" data-day="${d.key}" data-period="${p}">${ft}<span class="tt-cell-plus">+</span></button>`;
        } else {
          const split = sessions.length > 1;
          html += `<button class="tt-cell ${split ? "tt-cell-split" : ""}" data-day="${d.key}" data-period="${p}">${ft}
            ${sessions.map(s => `
              <div class="tt-chip">
                <span class="tt-chip-subj">${esc(s.subject || "?")}</span>
                ${split || (s.group && s.group !== "All") ? `<span class="tt-chip-group">${esc(s.group || "All")}</span>` : ""}
                <span class="tt-chip-meta">${esc(s.room || "—")} · ${esc(s.teacher_initial || "—")}</span>
              </div>`).join("")}
          </button>`;
        }
      });
    }
    html += `</div>
      <div class="tt-grid-tools">
        <button id="ttAddPeriodBtn" class="tt-btn">+ Add row (period ${maxP + 1})</button>
        <span class="tt-hint">Tip: empty rows at the end are not saved until you add a lesson. Yellow boxes = split class (several groups).</span>
      </div>`;

    el("ttBody").innerHTML = html;
    el("ttBody").querySelectorAll(".tt-cell").forEach(btn => {
      btn.addEventListener("click", () => openCellModal(classId, btn.dataset.day, Number(btn.dataset.period)));
    });
    el("ttAddPeriodBtn").addEventListener("click", () => { extraPeriods++; showClassGrid(classId); });
  }

  // ==========================================================================
  // VIEW 3: CELL EDITOR (sessions list = whole class or split groups)
  // ==========================================================================
  function openCellModal(classId, dayKey, period) {
    const cls = findClass(classId);
    if (!cls) return;
    editing = { classId, dayKey, period };
    const t = app().getPeriodTimingsMap(dayKey)[period];
    el("ttModalTitle").textContent = `${cls.class_id} · ${dayKey} · Period ${period}`;
    el("ttModalSub").textContent = t ? `${t.start} – ${t.end}` : "";

    const entry = ((cls.schedule && cls.schedule[dayKey]) || []).find(x => Number(x.period) === period);
    const sessions = (entry && entry.sessions) || [];
    el("ttSessions").innerHTML = "";
    if (sessions.length === 0) addSessionRow({ group: "All" }, true);
    else sessions.forEach(s => addSessionRow(s, false));
    el("ttClearCellBtn").style.visibility = sessions.length ? "visible" : "hidden";
    el("ttModal").classList.add("visible");
  }

  function closeCellModal() {
    editing = null;
    const m = el("ttModal");
    if (m) m.classList.remove("visible");
  }

  function addSessionRow(s, focus) {
    const row = document.createElement("div");
    row.className = "tt-session-row";
    row.innerHTML = `
      <input class="tt-in" data-f="subject" list="ttSubjectList" placeholder="e.g. MAT" value="${esc(s.subject || "")}" />
      <input class="tt-in" data-f="group" list="ttGroupList" placeholder="All" value="${esc(s.group || "All")}" />
      <input class="tt-in" data-f="room" list="ttRoomList" placeholder="Room" value="${esc(s.room || "")}" />
      <input class="tt-in" data-f="teacher_initial" list="ttTeacherList" placeholder="e.g. VA" value="${esc(s.teacher_initial || "")}" />
      <button class="tt-btn tt-btn-icon" title="Remove group">✕</button>
    `;
    row.querySelector("button").addEventListener("click", () => {
      row.remove();
      if (!el("ttSessions").children.length) addSessionRow({ group: "All" }, true);
    });
    const subjIn = row.querySelector('[data-f="subject"]');
    const updateTitle = () => {
      const d = app().SUBJECT_DICTIONARY[subjIn.value.trim()];
      subjIn.title = d ? d.en : "";
    };
    subjIn.addEventListener("input", updateTitle);
    updateTitle();
    el("ttSessions").appendChild(row);
    if (focus) subjIn.focus();
  }

  // When the user adds a group, suggest a sensible group name
  function suggestNextGroup() {
    const rows = Array.from(el("ttSessions").querySelectorAll(".tt-session-row"));
    const used = rows.map(r => r.querySelector('[data-f="group"]').value.trim());
    if (used.length === 1 && used[0] === "All") {
      rows[0].querySelector('[data-f="group"]').value = "First";
      return "Second1";
    }
    const pairs = { First: "Second1", Second1: "Second2", Boys: "Girls", Girls: "Boys", Bosnians: "Foreigners", Foreigners: "Bosnians", Religion: "Culture of Religion" };
    const last = used[used.length - 1];
    const next = pairs[last];
    return next && !used.includes(next) ? next : "";
  }

  function readSessionRows() {
    return Array.from(el("ttSessions").querySelectorAll(".tt-session-row")).map(r => {
      const get = f => r.querySelector(`[data-f="${f}"]`).value.trim();
      return {
        subject: get("subject"),
        group: get("group") || "All",
        room: get("room"),
        teacher_initial: get("teacher_initial")
      };
    }).filter(s => s.subject);
  }

  function writeCell(sessions) {
    const { classId, dayKey, period } = editing;
    const cls = findClass(classId);
    if (!cls.schedule) cls.schedule = {};
    const list = (cls.schedule[dayKey] || []).filter(x => Number(x.period) !== period);
    if (sessions.length) list.push({ period, sessions });
    list.sort((a, b) => Number(a.period) - Number(b.period));
    cls.schedule[dayKey] = list;

    closeCellModal();
    const msg = `✔ Saved: ${classId} · ${dayKey} · Period ${period} — the TV screen has been updated.`;
    commit(msg);
    showClassGrid(classId);
    setStatus(msg, "ok");
  }

  function saveCell() {
    if (!editing) return;
    const sessions = readSessionRows();
    if (sessions.length > 1 && sessions.some(s => s.group === "All")) {
      if (!window.confirm("There are several groups but one of them is \"All\" (whole class). Save anyway?")) return;
    }
    writeCell(sessions);
  }

  function clearCell() {
    if (!editing) return;
    if (!window.confirm("Delete this lesson?")) return;
    writeCell([]);
  }

  // ==========================================================================
  // EXPORT / SAVE / RESET
  // ==========================================================================
  function buildJsonString() {
    return JSON.stringify(data(), null, 2);
  }

  function exportJson() {
    const blob = new Blob([buildJsonString()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timetable.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("⬇ timetable.json downloaded. Replace data/timetable.json with it and run sync-media.bat.", "ok");
  }

  async function saveToFile() {
    if (!window.showSaveFilePicker) {
      exportJson();
      return;
    }
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "timetable.json",
        types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(buildJsonString());
      await writable.close();
      setStatus(`💾 Saved to ${handle.name}. If you overwrote data/timetable.json, run sync-media.bat.`, "ok");
    } catch (err) {
      if (err && err.name === "AbortError") return;
      setStatus("⚠ Saving failed — please use Export JSON.", "warn");
    }
  }

  function resetToFile() {
    if (!window.confirm("Discard ALL edits (lessons, classes, homeroom teachers) and reload data/timetable.json?")) return;
    app().resetToFile();
    fillDatalists();
    if (currentClassId && findClass(currentClassId)) showClassGrid(currentClassId); else showClassPicker();
    setStatus("↺ All edits discarded — using the original timetable.json.", "ok");
  }

  // ==========================================================================
  // BOOTSTRAP
  // ==========================================================================
  window.addEventListener("DOMContentLoaded", setupSecretTrigger);
})();
