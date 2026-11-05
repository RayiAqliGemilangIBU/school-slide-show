/**
 * ============================================================================
 * RICHMOND PARK INTERNATIONAL SECONDARY SCHOOL SARAJEVO
 * Main Application Logic - Real-Time Class Schedule & Media Slideshow
 * Bilingual: English (EN) & Bosnian (BS)
 * ============================================================================
 */

(function () {
  "use strict";

  const CONFIG = window.SCHOOL_CONFIG || {
    FRIDAY_SEASON: "winter",
    CLASS_SLIDE_DURATION_SECONDS: 8,
    CLASS_SLIDE_BREAK_DURATION_SECONDS: 6,
    IMAGE_MEDIA_DURATION_SECONDS: 8,
    VIDEO_MAX_DURATION_SECONDS: 180,
    SCHOOL_MORNING_START_TIME: "07:30",
    PATHS: {
      TIMETABLE_JSON: "data/timetable.json",
      BELL_SCHEDULE_JSON: "data/bell_schedule.json",
      MEDIA_JSON: "data/media.json"
    }
  };

  // ==========================================================================
  // BILINGUAL DICTIONARIES (ENGLISH & BOSNIAN)
  // ==========================================================================
  const SUBJECT_DICTIONARY = {
    "BOS": { en: "Bosnian Language", bs: "Bosanski jezik i književnost" },
    "BOS-B": { en: "Bosnian Language (Bosnians)", bs: "Bosanski jezik (domaći učenici)" },
    "BOS-F": { en: "Bosnian Language (Foreigners)", bs: "Bosanski jezik (strani učenici)" },
    "HIS-OP": { en: "History (Elective)", bs: "Historija (Izborni)" },
    "C REL": { en: "Culture of Religions", bs: "Kultura religija" },
    "GUI": { en: "Class Guidance Hour", bs: "Čas odjeljenske zajednice" },
    "ENG": { en: "English Language", bs: "Engleski jezik" },
    "ENG-OP": { en: "English Language (Elective)", bs: "Engleski jezik (Izborni)" },
    "GER": { en: "German Language", bs: "Njemački jezik" },
    "GER-OP": { en: "German Language (Elective)", bs: "Njemački jezik (Izborni)" },
    "TUR": { en: "Turkish Language", bs: "Turski jezik" },
    "TUR-OP": { en: "Turkish Language (Elective)", bs: "Turski jezik (Izborni)" },
    "LAT": { en: "Latin Language", bs: "Latinski jezik" },
    "MAT": { en: "Mathematics", bs: "Matematika" },
    "MAT-OP": { en: "Mathematics (Elective)", bs: "Matematika (Izborni)" },
    "PHY": { en: "Physics", bs: "Fizika" },
    "PHY-OP": { en: "Physics (Elective)", bs: "Fizika (Izborni)" },
    "CHE": { en: "Chemistry", bs: "Hemija" },
    "CHE-OP": { en: "Chemistry (Elective)", bs: "Hemija (Izborni)" },
    "BIO": { en: "Biology", bs: "Biologija" },
    "BIO-OP": { en: "Biology (Elective)", bs: "Biologija (Izborni)" },
    "GEO": { en: "Geography", bs: "Geografija" },
    "GEO-OP": { en: "Geography (Elective)", bs: "Geografija (Izborni)" },
    "HIS": { en: "History", bs: "Historija" },
    "ART": { en: "Fine Arts", bs: "Likovna kultura" },
    "MUS": { en: "Music Culture", bs: "Muzička kultura" },
    "SPO": { en: "Physical Education & Sport", bs: "Sport i tjelesni odgoj" },
    "REL": { en: "Religious Studies / Ethics", bs: "Vjeronauka / Etika" },
    "ICT": { en: "Informatics & Computing", bs: "Informatika i računarstvo" },
    "ICT-OP": { en: "Informatics (Elective)", bs: "Informatika (Izborni)" },
    "Pro": { en: "Programming", bs: "Programiranje" },
    "PRO": { en: "Programming", bs: "Programiranje" },
    "DB": { en: "Database Systems", bs: "Baze podataka" },
    "WEBP": { en: "Web Programming", bs: "Web programiranje" },
    "SOF-ENG": { en: "Software Engineering", bs: "Softverski inženjering" },
    "MAD": { en: "Mobile App Development", bs: "Razvoj mobilnih aplikacija" },
    "AAI": { en: "Applied Artificial Intelligence", bs: "Primijenjena umjetna inteligencija" },
    "MfoCS": { en: "Math for Computer Science", bs: "Matematika za računarstvo" },
    "PSY": { en: "Psychology", bs: "Psihologija" },
    "PHI": { en: "Philosophy & Logic", bs: "Filozofija i logika" },
    "SOC": { en: "Sociology", bs: "Sociologija" },
    "DEM": { en: "Democracy & Human Rights", bs: "Demokratija i ljudska prava" }
  };

  const TRACK_DICTIONARY = {
    "General": { en: "General Track", bs: "Opći smjer", style: "track-general" },
    "IT": { en: "Information Technology (IT)", bs: "Informacione tehnologije (IT)", style: "track-it" },
    "Math": { en: "Mathematics Track", bs: "Matematički smjer", style: "track-science" },
    "Science": { en: "Natural Sciences Track", bs: "Prirodno-matematički smjer", style: "track-science" },
    "Social": { en: "Social Sciences Track", bs: "Društveni smjer", style: "track-social" },
    "Language": { en: "Language Track", bs: "Jezički smjer", style: "track-social" },
    "Social / Math / IT": { en: "Social • Math • IT Track", bs: "Društveni • Matematički • IT smjer", style: "track-it" },
    "Science / Math": { en: "Science & Mathematics Track", bs: "Prirodno-matematički smjer", style: "track-science" },
    "IT / Language": { en: "IT & Languages Track", bs: "IT i jezički smjer", style: "track-it" },
    "General / Elective Track": { en: "General & Elective Track", bs: "Opći i izborni smjer", style: "track-general" },
    "IT / Science": { en: "IT & Natural Sciences Track", bs: "IT i prirodne nauke", style: "track-it" }
  };

  // Group labels used inside split "sessions" (EN -> BS)
  const GROUP_DICTIONARY = {
    "All": { en: "Whole Class", bs: "Cijelo odjeljenje" },
    "First": { en: "First", bs: "Prva grupa" },
    "Second1": { en: "Second 1", bs: "Druga grupa 1" },
    "Second2": { en: "Second 2", bs: "Druga grupa 2" },
    "Bosnians": { en: "Bosnians", bs: "Domaći" },
    "Foreigners": { en: "Foreigners", bs: "Strani" },
    "Boys": { en: "Boys", bs: "Dječaci" },
    "Girls": { en: "Girls", bs: "Djevojčice" },
    "Religion": { en: "Religion", bs: "Vjeronauka" },
    "Culture of Religion": { en: "Culture of Religion", bs: "Kultura religija" },
    "Math IT": { en: "Math IT", bs: "Math IT" },
    "IT": { en: "IT", bs: "IT" },
    "Social": { en: "Social", bs: "Social" },
    "Science": { en: "Science", bs: "Science" },
    "Language": { en: "Language", bs: "Language" }
  };

  const DAYS_BILINGUAL = [
    { key: "Sunday", en: "Sunday", bs: "Nedjelja" },
    { key: "Monday", en: "Monday", bs: "Ponedjeljak" },
    { key: "Tuesday", en: "Tuesday", bs: "Utorak" },
    { key: "Wednesday", en: "Wednesday", bs: "Srijeda" },
    { key: "Thursday", en: "Thursday", bs: "Četvrtak" },
    { key: "Friday", en: "Friday", bs: "Petak" },
    { key: "Saturday", en: "Saturday", bs: "Subota" }
  ];

  const ROMAN_GRADES = { 1: "I", 2: "II", 3: "III", 4: "IV" };

  // ==========================================================================
  // APPLICATION STATE
  // ==========================================================================
  let timetableData = null;
  let bellData = null;
  let mediaData = null;

  // Slideshow state:
  // mode: "CLASS" | "MEDIA"
  let currentMode = "CLASS";
  let currentClassIndex = 0;
  let currentMediaIndex = 0;
  let slideElapsedMs = 0;
  let currentSlideDurationMs = 8000;
  let lastTickTime = performance.now();
  let activeVideoTimeout = null;

  // Slide targets: dynamic list of class units and track units
  let slideTargets = [];

  const TRACK_METADATA = {
    "Math IT": {
      code: "MATH-IT",
      en: "Math & IT Track",
      bs: "Math & IT Track",
      shortEn: "Math-IT",
      shortBs: "Math-IT",
      color: "#4f46e5"
    },
    "Social": {
      code: "SOCIAL",
      en: "Social Studies Track",
      bs: "Social Studies Track",
      shortEn: "Social",
      shortBs: "Social",
      color: "#0891b2"
    },
    "Science": {
      code: "SCIENCE",
      en: "Sciences Track",
      bs: "Sciences Track",
      shortEn: "Science",
      shortBs: "Science",
      color: "#059669"
    },
    "Language": {
      code: "LANGUAGE",
      en: "Languages Track",
      bs: "Languages Track",
      shortEn: "Language",
      shortBs: "Language",
      color: "#d97706"
    },
    "IT": {
      code: "IT / DEV",
      en: "Information Technology Track",
      bs: "Information Technology Track",
      shortEn: "IT",
      shortBs: "IT",
      color: "#7c3aed"
    }
  };

  const TRACK_GROUPS = ["Math IT", "Social", "Science", "Language", "IT"];

  function buildSlideTargets() {
    slideTargets = [];
    const classes = (timetableData && timetableData.classes) || [];

    classes.forEach(cls => {
      const trackSet = new Set();
      Object.values(cls.schedule || {}).forEach(day => {
        (day || []).forEach(p => {
          (p.sessions || []).forEach(s => {
            if (s.group) {
              TRACK_GROUPS.forEach(tg => {
                if (s.group === tg || s.group.split("/").map(x => x.trim()).includes(tg)) {
                  trackSet.add(tg);
                }
              });
            }
          });
        });
      });

      if (trackSet.size === 0) {
        slideTargets.push({
          id: cls.class_id,
          classId: cls.class_id,
          classObj: cls,
          trackKey: null,
          trackMeta: null,
          tabLabel: cls.class_id,
          romanGrade: ROMAN_GRADES[cls.grade] || cls.grade
        });
      } else {
        const order = ["IT", "Math IT", "Social", "Science", "Language"];
        order.forEach(trk => {
          if (trackSet.has(trk)) {
            const meta = TRACK_METADATA[trk] || { code: trk, shortBs: trk, en: trk, bs: trk, color: "#2563eb" };
            slideTargets.push({
              id: `${cls.class_id}-${trk}`,
              classId: cls.class_id,
              classObj: cls,
              trackKey: trk,
              trackMeta: meta,
              tabLabel: `${cls.class_id} ${meta.shortBs || trk}`,
              romanGrade: ROMAN_GRADES[cls.grade] || cls.grade
            });
          }
        });
      }
    });

    if (slideTargets.length === 0 && classes.length > 0) {
      slideTargets = classes.map(cls => ({
        id: cls.class_id,
        classId: cls.class_id,
        classObj: cls,
        trackKey: null,
        trackMeta: null,
        tabLabel: cls.class_id,
        romanGrade: ROMAN_GRADES[cls.grade] || cls.grade
      }));
    }
  }

  // Simulation state (for testing via 'T' key)
  let simEnabled = false;
  let simDayName = "Monday";
  let simTimeMinutes = 9 * 60 + 30; // 09:30 default test

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================
  function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function formatMinutesToHHMM(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }

  function translateSubject(codeStr) {
    if (!codeStr) {
      return {
        code: "—",
        en: "Free Period",
        bs: "Slobodan čas"
      };
    }
    const trimmed = codeStr.trim();
    if (SUBJECT_DICTIONARY[trimmed]) {
      return {
        code: trimmed,
        en: SUBJECT_DICTIONARY[trimmed].en,
        bs: SUBJECT_DICTIONARY[trimmed].bs
      };
    }
    // Check if compound code separated by "/" (e.g., "AAI / MfoCS" or "MAD / Pro")
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/").map(s => s.trim());
      const enParts = parts.map(p => (SUBJECT_DICTIONARY[p] ? SUBJECT_DICTIONARY[p].en : p));
      const bsParts = parts.map(p => (SUBJECT_DICTIONARY[p] ? SUBJECT_DICTIONARY[p].bs : p));
      return {
        code: trimmed,
        en: enParts.join(" / "),
        bs: bsParts.join(" / ")
      };
    }
    return {
      code: trimmed.substring(0, 6).toUpperCase(),
      en: trimmed,
      bs: trimmed
    };
  }

  function translateTrack(trackStr) {
    if (!trackStr) {
      return { en: "General Track", bs: "Opći smjer", style: "track-general" };
    }
    if (TRACK_DICTIONARY[trackStr]) {
      return TRACK_DICTIONARY[trackStr];
    }
    return {
      en: trackStr + " Track",
      bs: "Smjer: " + trackStr,
      style: "track-it"
    };
  }

  function translateBellActivity(activityStr) {
    if (!activityStr) return { en: "School Activity", bs: "Školska aktivnost" };
    const lower = activityStr.toLowerCase();
    if (lower.includes("break") && !lower.includes("breakfast")) {
      return { en: "Short Break", bs: "Mali odmor", isBreak: true };
    }
    if (lower.includes("breakfast")) {
      return { en: "Breakfast Break", bs: "Veliki odmor (Doručak)", isBreak: true };
    }
    if (lower.includes("lunch")) {
      return { en: "Lunch Break", bs: "Pauza za ručak", isBreak: true };
    }
    const match = activityStr.match(/^(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return {
        en: `${activityStr}`,
        bs: `${num}. nastavni čas`,
        period: num,
        isBreak: false
      };
    }
    return { en: activityStr, bs: activityStr, isBreak: false };
  }

  // ==========================================================================
  // DATA LOADING (SUPPORTS BOTH HTTP FETCH & DIRECT FILE:// FALLBACK)
  // ==========================================================================
  async function loadJsonWithFallback(url, fallbackObj) {
    if (window.location.protocol === "file:" && fallbackObj) {
      return fallbackObj;
    }
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      // Expected when opened directly via file:// in Chrome/Edge
    }
    return fallbackObj || null;
  }

  async function initData() {
    timetableData = await loadJsonWithFallback(
      CONFIG.PATHS.TIMETABLE_JSON,
      window.FALLBACK_TIMETABLE_DATA
    );
    bellData = await loadJsonWithFallback(
      CONFIG.PATHS.BELL_SCHEDULE_JSON,
      window.FALLBACK_BELL_DATA
    );
    mediaData = await loadJsonWithFallback(
      CONFIG.PATHS.MEDIA_JSON,
      window.FALLBACK_MEDIA_DATA
    );

    if (!mediaData || !Array.isArray(mediaData.items)) {
      mediaData = { image_duration_seconds: 8, items: [] };
    }

    // Keep a pristine copy of the file data (used by the editor "reset" button)
    fileTimetableData = timetableData ? JSON.parse(JSON.stringify(timetableData)) : null;

    // Apply timetable edits made in the hidden editor (saved in localStorage)
    const local = loadLocalTimetable();
    if (local) timetableData = local;

    buildSlideTargets();
  }

  // ==========================================================================
  // LOCAL EDITS (HIDDEN TIMETABLE EDITOR) - PERSISTED IN localStorage
  // Edits are only applied while the base timetable file is unchanged
  // (same school_info.last_updated). A new export from aSc wins automatically.
  // ==========================================================================
  const LOCAL_TIMETABLE_KEY = "rps_timetable_edits_v1";
  let fileTimetableData = null;

  function getBaseVersion(data) {
    return (data && data.school_info && data.school_info.last_updated) || "";
  }

  function loadLocalTimetable() {
    try {
      const raw = localStorage.getItem(LOCAL_TIMETABLE_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      if (!saved || !saved.data || !Array.isArray(saved.data.classes)) return null;
      if (saved.baseVersion !== getBaseVersion(fileTimetableData)) return null;
      return saved.data;
    } catch (err) {
      return null;
    }
  }

  function saveLocalTimetable(data) {
    try {
      localStorage.setItem(LOCAL_TIMETABLE_KEY, JSON.stringify({
        baseVersion: getBaseVersion(fileTimetableData),
        savedAt: new Date().toISOString(),
        data
      }));
      return true;
    } catch (err) {
      return false;
    }
  }

  function getLocalEditInfo() {
    try {
      const raw = localStorage.getItem(LOCAL_TIMETABLE_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      if (saved.baseVersion !== getBaseVersion(fileTimetableData)) return null;
      return { savedAt: saved.savedAt };
    } catch (err) {
      return null;
    }
  }

  // Re-render the TV screen immediately after the timetable changed
  function refreshAfterTimetableChange() {
    buildSlideTargets();
    if (currentClassIndex >= slideTargets.length) currentClassIndex = 0;
    const nowInfo = getNowInfo();
    const timeStatus = evaluateSchoolTimeStatus(nowInfo);
    if (currentMode === "CLASS" && timeStatus.state !== "AFTER_HOURS" && slideTargets.length > 0) {
      try {
        renderClassSlide(currentClassIndex, nowInfo, timeStatus);
      } catch (err) {
        console.error("Re-render after timetable edit failed:", err);
      }
    }
  }

  // Public API used by editor.js
  window.TimetableApp = {
    getTimetable: () => timetableData,
    getFileTimetable: () => fileTimetableData,
    applyTimetable(newData) {
      timetableData = newData;
      const ok = saveLocalTimetable(newData);
      refreshAfterTimetableChange();
      return ok;
    },
    resetToFile() {
      try { localStorage.removeItem(LOCAL_TIMETABLE_KEY); } catch (err) { /* ignore */ }
      timetableData = fileTimetableData ? JSON.parse(JSON.stringify(fileTimetableData)) : timetableData;
      refreshAfterTimetableChange();
    },
    getLocalEditInfo,
    getPeriodTimingsMap: (dayKey) => getPeriodTimingsMap(dayKey),
    translateSubject: (code) => translateSubject(code),
    translateGroup: (g) => translateGroup(g),
    SUBJECT_DICTIONARY,
    GROUP_DICTIONARY,
    CONFIG
  };

  // ==========================================================================
  // BELL SCHEDULE & TIME SYNCHRONIZATION ENGINE
  // ==========================================================================
  function getNowInfo() {
    const realNow = new Date();
    if (simEnabled) {
      const dayObj = DAYS_BILINGUAL.find(d => d.key === simDayName) || DAYS_BILINGUAL[1];
      const h = Math.floor(simTimeMinutes / 60);
      const m = simTimeMinutes % 60;
      const s = realNow.getSeconds();
      return {
        dayKey: dayObj.key,
        dayEn: dayObj.en,
        dayBs: dayObj.bs,
        isWeekend: dayObj.key === "Saturday" || dayObj.key === "Sunday",
        totalMinutes: simTimeMinutes,
        seconds: s,
        clockStr: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
        dateStr: `${String(realNow.getDate()).padStart(2, "0")}. ${String(realNow.getMonth() + 1).padStart(2, "0")}. ${realNow.getFullYear()} (SIM)`
      };
    }

    const dayIdx = realNow.getDay();
    const dayObj = DAYS_BILINGUAL[dayIdx];
    const h = realNow.getHours();
    const m = realNow.getMinutes();
    const s = realNow.getSeconds();
    return {
      dayKey: dayObj.key,
      dayEn: dayObj.en,
      dayBs: dayObj.bs,
      isWeekend: dayIdx === 0 || dayIdx === 6,
      totalMinutes: h * 60 + m,
      seconds: s,
      clockStr: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      dateStr: `${String(realNow.getDate()).padStart(2, "0")}. ${String(realNow.getMonth() + 1).padStart(2, "0")}. ${realNow.getFullYear()}`
    };
  }

  function getActiveBellScheduleForDay(dayKey) {
    if (!bellData || !bellData.schedules) return [];
    let rawList = [];
    if (dayKey === "Friday") {
      const season = (CONFIG.FRIDAY_SEASON || "winter").toLowerCase();
      rawList = season === "summer"
        ? bellData.schedules.friday_summer
        : bellData.schedules.friday_winter;
    } else {
      rawList = bellData.schedules.monday_thursday;
    }

    return (rawList || []).map(item => {
      const trans = translateBellActivity(item.activity);
      return {
        start_time: item.start_time,
        end_time: item.end_time,
        startMin: parseTimeToMinutes(item.start_time),
        endMin: parseTimeToMinutes(item.end_time),
        activity: item.activity,
        en: trans.en,
        bs: trans.bs,
        period: item.period || trans.period || null,
        isBreak: Boolean(trans.isBreak)
      };
    });
  }

  function getPeriodTimingsMap(dayKey) {
    const map = {};
    if (timetableData && Array.isArray(timetableData.master_schedules)) {
      timetableData.master_schedules.forEach(ms => {
        map[ms.period] = {
          period: ms.period,
          start: ms.start,
          end: ms.end,
          startMin: parseTimeToMinutes(ms.start),
          endMin: parseTimeToMinutes(ms.end)
        };
      });
    }
    // Override with day's specific bell schedule (important for Friday Winter / Summer!)
    const bellSlots = getActiveBellScheduleForDay(dayKey);
    bellSlots.forEach(slot => {
      if (slot.period) {
        map[slot.period] = {
          period: slot.period,
          start: slot.start_time,
          end: slot.end_time,
          startMin: slot.startMin,
          endMin: slot.endMin
        };
      }
    });
    return map;
  }

  function evaluateSchoolTimeStatus(nowInfo) {
    const bellSlots = getActiveBellScheduleForDay(nowInfo.dayKey);
    const morningStartMin = parseTimeToMinutes(CONFIG.SCHOOL_MORNING_START_TIME || "07:30");

    if (nowInfo.isWeekend || bellSlots.length === 0) {
      return {
        state: "AFTER_HOURS",
        isBreak: false,
        bannerEn: "Weekend • No Classes Today",
        bannerBs: "Vikend • Danas nema nastave",
        subText: "Playing School Media Announcements • Prikaz školskih obavještenja",
        currentPeriod: null,
        nextPeriod: null
      };
    }

    const firstSlot = bellSlots[0];
    const lastSlot = bellSlots[bellSlots.length - 1];
    const nowMin = nowInfo.totalMinutes;

    // Before morning start or after last bell -> Media-Only mode
    if (nowMin < morningStartMin || nowMin >= lastSlot.endMin) {
      return {
        state: "AFTER_HOURS",
        isBreak: false,
        bannerEn: nowMin >= lastSlot.endMin ? "School Day Ended" : "Before School Hours",
        bannerBs: nowMin >= lastSlot.endMin ? "Nastava je završena za danas" : "Prije početka nastave",
        subText: `Dismissal Time / Kraj nastave: ${lastSlot.end_time} • Media Slideshow Active`,
        currentPeriod: null,
        nextPeriod: null
      };
    }

    // Between 07:30 and 1st lesson start (08:30): Morning Arrival -> Show Schedule with Period 1 as Next!
    if (nowMin >= morningStartMin && nowMin < firstSlot.startMin) {
      const minsLeft = firstSlot.startMin - nowMin;
      return {
        state: "MORNING_ARRIVAL",
        isBreak: true,
        bannerEn: "Morning Arrival • Preparing for 1st Lesson",
        bannerBs: "Dolazak u školu • Priprema za 1. čas",
        subText: `1st Lesson starts at ${firstSlot.start_time} (in ${minsLeft} min / za ${minsLeft} min)`,
        currentPeriod: 0,
        nextPeriod: 1,
        activeSlot: {
          start_time: CONFIG.SCHOOL_MORNING_START_TIME,
          end_time: firstSlot.start_time,
          en: "Morning Arrival",
          bs: "Priprema za nastavu"
        }
      };
    }

    // Find active slot in bell schedule
    for (let i = 0; i < bellSlots.length; i++) {
      const slot = bellSlots[i];
      if (nowMin >= slot.startMin && nowMin < slot.endMin) {
        const remainingMin = slot.endMin - nowMin - 1;
        const remainingSec = 59 - nowInfo.seconds;
        const countdownStr = `${Math.max(0, remainingMin)}m ${String(remainingSec).padStart(2, "0")}s`;

        // Find next lesson period
        let nextPeriodNum = null;
        for (let j = i + 1; j < bellSlots.length; j++) {
          if (bellSlots[j].period) {
            nextPeriodNum = bellSlots[j].period;
            break;
          }
        }

        // Find most recent lesson period if currently in break
        let prevPeriodNum = slot.period;
        if (!prevPeriodNum) {
          for (let k = i - 1; k >= 0; k--) {
            if (bellSlots[k].period) {
              prevPeriodNum = bellSlots[k].period;
              break;
            }
          }
        }

        const fridayTag = nowInfo.dayKey === "Friday"
          ? ` [${(CONFIG.FRIDAY_SEASON || "winter").toUpperCase()}]`
          : "";

        return {
          state: slot.isBreak ? "BREAK" : "LESSON",
          isBreak: slot.isBreak,
          bannerEn: `${slot.en}${fridayTag}`,
          bannerBs: `${slot.bs}`,
          subText: `${slot.start_time} – ${slot.end_time} • Remaining / Preostalo: ${countdownStr}`,
          currentPeriod: slot.isBreak ? prevPeriodNum : slot.period,
          nextPeriod: nextPeriodNum,
          activeSlot: slot
        };
      }
    }

    return {
      state: "AFTER_HOURS",
      isBreak: false,
      bannerEn: "After School Hours",
      bannerBs: "Nastava je završena",
      subText: "Media Slideshow Mode",
      currentPeriod: null,
      nextPeriod: null
    };
  }

  // ==========================================================================
  // CLASS SCHEDULE LOOKUP FOR CURRENT & NEXT PERIOD
  // New JSON structure: each period entry = { period, sessions: [ { subject,
  // group, room, teacher_initial } ] }. One session = whole class lesson,
  // multiple sessions = split class (language level, BOS-B/BOS-F, SPO
  // Boys/Girls, REL/C REL, elective tracks, ...).
  // The legacy flat format { period, subject, teacher, room } is still accepted.
  // ==========================================================================
  function translateGroup(groupStr) {
    if (!groupStr) return { en: "Whole Class", bs: "Cijelo odjeljenje" };
    const g = groupStr.trim();
    if (GROUP_DICTIONARY[g]) return GROUP_DICTIONARY[g];
    // Combined groups like "Math IT/Social/Science/Language"
    if (g.includes("/")) {
      const parts = g.split("/").map(s => s.trim());
      return {
        en: parts.map(p => (GROUP_DICTIONARY[p] ? GROUP_DICTIONARY[p].en : p)).join(" / "),
        bs: parts.map(p => (GROUP_DICTIONARY[p] ? GROUP_DICTIONARY[p].bs : p)).join(" / ")
      };
    }
    return { en: g, bs: g };
  }

  function uniqueValues(list) {
    return list.filter((v, i, arr) => v && arr.indexOf(v) === i);
  }

  function normalizeLessonEntry(entry) {
    if (!entry) return null;
    let sessions;
    if (Array.isArray(entry.sessions)) {
      sessions = entry.sessions.map(s => ({
        subject: s.subject || "",
        group: s.group || "All",
        room: s.room || "—",
        teacher: s.teacher_initial || s.teacher || "—"
      }));
    } else {
      // Legacy flat entry
      sessions = [{
        subject: entry.subject || "",
        group: "All",
        room: entry.room || "—",
        teacher: entry.teacher_initial || entry.teacher || "—"
      }];
    }
    if (sessions.length === 0) return null;

    const subjects = uniqueValues(sessions.map(s => s.subject));
    const isSplit = sessions.length > 1;
    // Short label used in the timeline strip & bottom overview
    let shortLabel;
    if (subjects.length <= 2) {
      shortLabel = subjects.join(" / ");
    } else {
      shortLabel = subjects.some(s => /-OP$/i.test(s)) ? "Electives" : "Groups";
    }

    return {
      period: Number(entry.period),
      sessions,
      isSplit,
      subjects,
      // Primary subject: same for all sessions (e.g. ENG, SPO) or first one
      subject: subjects.length === 1 ? subjects[0] : shortLabel,
      shortLabel,
      teacher: uniqueValues(sessions.map(s => s.teacher)).join(" / "),
      room: uniqueValues(sessions.map(s => s.room)).join(" / ")
    };
  }

  function getSessionsForTarget(sessions, trackKey) {
    if (!sessions || sessions.length === 0) return [];
    if (!trackKey) return sessions;

    let matching = sessions.filter(s => {
      if (!s.group) return false;
      const parts = s.group.split("/").map(x => x.trim());
      return parts.includes(trackKey);
    });

    if (matching.length === 0 && trackKey === "IT") {
      matching = sessions.filter(s => s.group === "Math IT");
    }

    return matching.length > 0 ? matching : sessions;
  }

  function getClassLessonForPeriod(classObj, dayKey, periodNum, trackKey) {
    if (!classObj || !classObj.schedule || !periodNum) return null;
    const dayLessons = classObj.schedule[dayKey] || [];
    const raw = dayLessons.find(item => Number(item.period) === Number(periodNum));
    if (!raw) return null;
    const filteredSessions = getSessionsForTarget(raw.sessions, trackKey);
    return normalizeLessonEntry({
      period: raw.period,
      sessions: filteredSessions
    });
  }

  function getNextScheduledLessonAfter(classObj, dayKey, fromPeriodNum, trackKey) {
    if (!classObj || !classObj.schedule || !fromPeriodNum) return null;
    const dayLessons = (classObj.schedule[dayKey] || []).slice().sort((a, b) => a.period - b.period);
    const raw = dayLessons.find(item => Number(item.period) >= Number(fromPeriodNum));
    if (!raw) return null;
    const filteredSessions = getSessionsForTarget(raw.sessions, trackKey);
    return normalizeLessonEntry({
      period: raw.period,
      sessions: filteredSessions
    });
  }

  function getMaxPeriodCount() {
    let max = 7;
    const classes = (timetableData && timetableData.classes) || [];
    classes.forEach(cls => {
      Object.values(cls.schedule || {}).forEach(day => {
        (day || []).forEach(item => {
          if (Number(item.period) > max) max = Number(item.period);
        });
      });
    });
    return max;
  }

  // Short English group name (e.g. "Second1" -> "Second 1")
  function groupName(groupStr) {
    return translateGroup(groupStr).en;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value == null ? "" : value;
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Renders a lesson into the "now" or "next" column.
  // Whole class -> subject name + "Room X · Teacher".
  // Split class -> subject (or "Groups") + one simple row per group.
  // ==========================================================================
  // RENDER LESSON CARD (NOW / NEXT)
  // Clean European Card: High readability, room prominence, split tables
  // ==========================================================================
  function renderLessonCard(prefix, lesson, overrides) {
    const o = overrides || {};
    const cardEl = document.getElementById(`${prefix}Card`);
    const codeEl = document.getElementById(`${prefix}SubjCode`);
    const nameEl = document.getElementById(`${prefix}Subject`);
    const subEl = document.getElementById(`${prefix}SubjectBs`);
    const roomEl = document.getElementById(`${prefix}Room`);
    const teacherEl = document.getElementById(`${prefix}Teacher`);
    const groupsHead = document.getElementById(`${prefix}GroupsHead`);
    const groupsBody = document.getElementById(`${prefix}GroupsBody`);

    cardEl.classList.remove("is-break-card", "is-done-card", "is-split-card");

    if (o.isBreak) {
      cardEl.classList.add("is-break-card");
      codeEl.textContent = o.code || "ODMOR";
      nameEl.textContent = o.title || "Odmor / Break";
      subEl.textContent = o.subtitle || "";
      return;
    }

    if (o.isDone) {
      cardEl.classList.add("is-done-card");
      codeEl.textContent = o.code || "KRAJ";
      nameEl.textContent = o.title || "Kraj nastave za danas";
      subEl.textContent = o.subtitle || "School Day Ended";
      return;
    }

    if (!lesson) {
      codeEl.textContent = o.code || "SLOB.";
      nameEl.textContent = o.title || "Slobodan čas · Free Period";
      subEl.textContent = o.subtitle || "Nema zakazane nastave";
      if (roomEl) roomEl.textContent = "—";
      if (teacherEl) teacherEl.textContent = "—";
      return;
    }

    // Split class vs Whole class
    if (!lesson.isSplit) {
      const subj = translateSubject(lesson.subject);
      codeEl.textContent = subj.code;
      nameEl.textContent = subj.en;
      subEl.textContent = subj.bs !== subj.en ? subj.bs : "";
      if (roomEl) roomEl.textContent = lesson.room || "—";
      if (teacherEl) teacherEl.textContent = lesson.teacher || "—";
    } else {
      cardEl.classList.add("is-split-card");
      const sameSubject = lesson.subjects.length === 1;
      if (sameSubject) {
        const subj = translateSubject(lesson.subjects[0]);
        codeEl.textContent = subj.code;
        nameEl.textContent = `${subj.en}`;
        subEl.textContent = `${subj.bs} • ${lesson.sessions.length} grupe`;
        if (groupsHead) {
          groupsHead.innerHTML = `
            <tr>
              <th>GRUPA / GROUP</th>
              <th class="th-room">KABINET</th>
              <th class="th-teacher">PROF.</th>
            </tr>
          `;
        }
        if (groupsBody) {
          groupsBody.innerHTML = lesson.sessions.map(s => {
            const g = translateGroup(s.group);
            const gSub = g.en !== g.bs ? ` <span style="font-size:15px;color:var(--text-faint);font-weight:600;">(${escapeHtml(g.en)})</span>` : "";
            return `
              <tr>
                <td>${escapeHtml(g.bs)}${gSub}</td>
                <td class="td-room">${escapeHtml(s.room)}</td>
                <td class="td-teacher">${escapeHtml(s.teacher)}</td>
              </tr>
            `;
          }).join("");
        }
      } else {
        const isElective = lesson.subjects.some(s => /-OP$/i.test(s));
        codeEl.textContent = isElective ? "IZBORNI" : "GRUPE";
        nameEl.textContent = isElective ? "Izborni predmeti · Electives" : "Podijeljeno odjeljenje · Split";
        subEl.textContent = `${lesson.sessions.length} grupe / groups`;
        if (groupsHead) {
          groupsHead.innerHTML = `
            <tr>
              <th>GRUPA / GROUP</th>
              <th>PREDMET</th>
              <th class="th-room">KABINET</th>
              <th class="th-teacher">PROF.</th>
            </tr>
          `;
        }
        if (groupsBody) {
          groupsBody.innerHTML = lesson.sessions.map(s => {
            const g = translateGroup(s.group);
            const subj = translateSubject(s.subject);
            const gSub = g.en !== g.bs ? ` <span style="font-size:15px;color:var(--text-faint);font-weight:600;">(${escapeHtml(g.en)})</span>` : "";
            return `
              <tr>
                <td>${escapeHtml(g.bs)}${gSub}</td>
                <td><b style="font-size:20px;color:var(--brand-navy);margin-right:6px;">${escapeHtml(s.subject)}</b> ${escapeHtml(subj.en)}</td>
                <td class="td-room">${escapeHtml(s.room)}</td>
                <td class="td-teacher">${escapeHtml(s.teacher)}</td>
              </tr>
            `;
          }).join("");
        }
      }
    }
  }

  // ==========================================================================
  // DOM RENDERING
  // ==========================================================================
  function renderTopHeader(nowInfo, timeStatus) {
    setText("clockDisplay", nowInfo.clockStr.substring(0, 5));
    setText("dateDisplay", `${nowInfo.dayBs}, ${nowInfo.dateStr.replace(/\s/g, "")}`);

    const box = document.getElementById("bellStatusBox");
    const isBreak = timeStatus.isBreak && timeStatus.state !== "AFTER_HOURS";
    box.classList.toggle("is-break", isBreak);

    const slot = timeStatus.activeSlot;
    const nowMin = nowInfo.totalMinutes;
    let title = "";
    let timeStr = "";

    if (timeStatus.state === "LESSON" && slot) {
      const left = Math.max(0, slot.endMin - nowMin);
      title = `${slot.period}. Čas · Period ${slot.period}`;
      timeStr = `${slot.start_time} – ${slot.end_time} (${left} min)`;
    } else if (timeStatus.state === "BREAK" && slot) {
      const left = Math.max(0, slot.endMin - nowMin);
      title = `${slot.bs} · ${slot.en}`;
      timeStr = `do ${slot.end_time} (${left} min)`;
    } else if (timeStatus.state === "MORNING_ARRIVAL" && slot) {
      title = "Priprema za nastavu · Morning Arrival";
      timeStr = `1. Čas u ${slot.end_time}`;
    } else {
      title = nowInfo.isWeekend ? "Vikend · Weekend" : "Nastava završena · School ended";
      timeStr = "";
    }

    setText("statusLabel", title);
    setText("statusSub", timeStr);
  }

  function renderClassSlide(slideIndex, nowInfo, timeStatus) {
    if (!slideTargets || slideTargets.length === 0) buildSlideTargets();
    if (slideTargets.length === 0) return;

    const target = slideTargets[slideIndex % slideTargets.length];
    const classObj = target.classObj;
    const trackKey = target.trackKey;
    const periodMap = getPeriodTimingsMap(nowInfo.dayKey);
    const romanGrade = target.romanGrade;

    setText("classIdBadge", classObj.class_id);

    const trackWrap = document.getElementById("trackBadgeWrap");
    const trackBadge = document.getElementById("trackBadge");

    if (trackKey && target.trackMeta) {
      if (trackWrap) trackWrap.style.display = "flex";
      if (trackBadge) {
        trackBadge.textContent = target.trackMeta.code;
        trackBadge.style.backgroundColor = target.trackMeta.color;
      }
      setText("classGradeTrack", `${romanGrade} Razred • ${target.trackMeta.en}`);
    } else {
      if (trackWrap) trackWrap.style.display = "none";
      const trk = translateTrack(classObj.track);
      setText("classGradeTrack", `${romanGrade} Razred • ${trk.en}`);
    }

    setText("classTeacherName", classObj.class_teacher ? `Razrednik: ${classObj.class_teacher}` : "");
    setText("classPageCounter", `${(slideIndex % slideTargets.length) + 1} / ${slideTargets.length}`);

    // ---- NOW CARD ----
    const curPeriod = timeStatus.currentPeriod;
    const curTiming = curPeriod ? periodMap[curPeriod] : null;

    if (timeStatus.state === "MORNING_ARRIVAL") {
      setText("nowCardLabel", "PRIJE NASTAVE · BEFORE SCHOOL");
      setText("nowTime", timeStatus.activeSlot ? `do ${timeStatus.activeSlot.end_time}` : "");
      renderLessonCard("now", null, {
        isBreak: true,
        code: "PRIJEM",
        title: "Dolazak u školu · Morning Arrival",
        subtitle: "Priprema za 1. čas koji počinje u 08:30",
        teacher: "Dobrodošli"
      });
    } else if (timeStatus.isBreak) {
      const slot = timeStatus.activeSlot;
      const prevLesson = getClassLessonForPeriod(classObj, nowInfo.dayKey, curPeriod, trackKey);
      setText("nowCardLabel", "ODMOR · BREAK");
      setText("nowTime", slot ? `do ${slot.end_time}` : "");
      renderLessonCard("now", null, {
        isBreak: true,
        code: "ODMOR",
        title: slot ? `${slot.bs} · ${slot.en}` : "Školski odmor",
        subtitle: prevLesson ? `Završio ${curPeriod}. čas: ${prevLesson.subject} (${prevLesson.room})` : `Završen ${curPeriod}. čas`,
        teacher: slot ? `${slot.start_time} – ${slot.end_time}` : ""
      });
    } else {
      setText("nowCardLabel", "TRENUTNO · NOW");
      setText("nowTime", curTiming ? `${curTiming.start} – ${curTiming.end}` : `Period ${curPeriod}`);
      renderLessonCard("now", getClassLessonForPeriod(classObj, nowInfo.dayKey, curPeriod, trackKey));
    }

    // ---- NEXT CARD ----
    const nxtPeriod = timeStatus.nextPeriod;
    let nextLesson = nxtPeriod ? getClassLessonForPeriod(classObj, nowInfo.dayKey, nxtPeriod, trackKey) : null;
    if (!nextLesson && nxtPeriod) {
      nextLesson = getNextScheduledLessonAfter(classObj, nowInfo.dayKey, nxtPeriod, trackKey);
    }

    if (nextLesson) {
      const nxtTiming = periodMap[nextLesson.period];
      setText("nextCardLabel", timeStatus.isBreak ? "NAKON ODMORA · AFTER BREAK" : "SLJEDEĆE · UP NEXT");
      setText("nextTime", nxtTiming ? `od ${nxtTiming.start}` : `Period ${nextLesson.period}`);
      renderLessonCard("next", nextLesson);
    } else {
      setText("nextCardLabel", "KRAJ · DISMISSAL");
      setText("nextTime", "");
      renderLessonCard("next", null, {
        code: "KRAJ",
        title: "Kraj nastave za danas · End of Day",
        subtitle: "Nema više zakazanih časova"
      });
    }

    // ---- TODAY STRIP (Dnevni raspored) ----
    const container = document.getElementById("timelineSlots");
    container.innerHTML = "";
    const maxPeriod = getMaxPeriodCount();
    container.style.gridTemplateColumns = `repeat(${maxPeriod}, 1fr)`;
    const trackLabel = target.trackMeta ? ` (${target.trackMeta.shortEn || target.trackMeta.en})` : "";
    setText("stripDayInfo", `${nowInfo.dayBs} · Časovi 1 – ${maxPeriod}${trackLabel}`);

    for (let p = 1; p <= maxPeriod; p++) {
      const t = periodMap[p] || { start: "" };
      const lesson = getClassLessonForPeriod(classObj, nowInfo.dayKey, p, trackKey);
      const slot = document.createElement("div");
      slot.className = "timeline-slot-item";
      if (!timeStatus.isBreak && timeStatus.currentPeriod === p) {
        slot.classList.add("slot-active");
      } else if (timeStatus.nextPeriod === p) {
        slot.classList.add("slot-next");
      } else if (timeStatus.currentPeriod && p < timeStatus.currentPeriod) {
        slot.classList.add("slot-past");
      }
      slot.innerHTML = `
        <div class="slot-p-time"><span>P${p}</span><span>${t.start}</span></div>
        <div class="slot-p-name">${lesson ? escapeHtml(lesson.shortLabel) : "—"}</div>
      `;
      container.appendChild(slot);
    }
  }

  // Footer: overview tabs bar removed to maintain clean screen ratio
  function renderBottomOverviewBar() {
    // Overview tabs bar removed per user request
  }

  // ==========================================================================
  // SLIDESHOW ENGINE (CLASSES -> MEDIA -> LOOP INFINITELY)
  // ==========================================================================
  function clearActiveVideoTimeout() {
    if (activeVideoTimeout) {
      clearTimeout(activeVideoTimeout);
      activeVideoTimeout = null;
    }
  }

  function switchToClassSlide(index, nowInfo, timeStatus) {
    clearActiveVideoTimeout();
    currentMode = "CLASS";
    currentClassIndex = index;
    slideElapsedMs = 0;

    const durSec = timeStatus.isBreak
      ? CONFIG.CLASS_SLIDE_BREAK_DURATION_SECONDS
      : CONFIG.CLASS_SLIDE_DURATION_SECONDS;
    currentSlideDurationMs = (durSec || 8) * 1000;

    document.getElementById("tvAppContainer").classList.remove("media-only-mode", "is-playing-media");
    document.getElementById("classSlideView").style.display = "flex";
    document.getElementById("mediaSlideView").style.display = "none";

    // Stop any playing video in media container
    const mediaWrapper = document.getElementById("mediaContentWrapper");
    mediaWrapper.innerHTML = "";

    renderClassSlide(currentClassIndex, nowInfo, timeStatus);
    renderBottomOverviewBar(nowInfo, timeStatus);
  }

  function switchToMediaSlide(mediaIndex, nowInfo, timeStatus) {
    clearActiveVideoTimeout();
    const items = (mediaData && mediaData.items) || [];
    if (items.length === 0) {
      // No media files found; go back to class 0
      switchToClassSlide(0, nowInfo, timeStatus);
      return;
    }

    currentMode = "MEDIA";
    currentMediaIndex = mediaIndex % items.length;
    slideElapsedMs = 0;

    const item = items[currentMediaIndex];
    const isAfterHours = timeStatus.state === "AFTER_HOURS";

    const tvApp = document.getElementById("tvAppContainer");
    tvApp.classList.add("is-playing-media");
    if (isAfterHours) {
      tvApp.classList.add("media-only-mode");
    } else {
      tvApp.classList.remove("media-only-mode");
    }

    document.getElementById("classSlideView").style.display = "none";
    document.getElementById("mediaSlideView").style.display = "flex";

    const mediaWrapper = document.getElementById("mediaContentWrapper");
    mediaWrapper.innerHTML = "";

    const badgeText = `${currentMediaIndex + 1} / ${items.length}`;

    const badgeEl = document.createElement("div");
    badgeEl.className = "media-overlay-badge";
    badgeEl.textContent = badgeText;

    if (item.type === "video") {
      currentSlideDurationMs = (CONFIG.VIDEO_MAX_DURATION_SECONDS || 180) * 1000;
      const video = document.createElement("video");
      video.className = "media-element";
      video.src = item.file;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;

      video.addEventListener("loadedmetadata", () => {
        if (video.duration && isFinite(video.duration)) {
          currentSlideDurationMs = video.duration * 1000;
        }
      });

      video.addEventListener("ended", () => {
        advanceSlide();
      });

      video.addEventListener("error", () => {
        advanceSlide();
      });

      mediaWrapper.appendChild(video);
      mediaWrapper.appendChild(badgeEl);
    } else {
      const imgDurSec = CONFIG.IMAGE_MEDIA_DURATION_SECONDS || mediaData.image_duration_seconds || 8;
      currentSlideDurationMs = imgDurSec * 1000;

      const img = document.createElement("img");
      img.className = "media-element";
      img.src = item.file;
      img.alt = item.title_en || "School Media";
      img.addEventListener("error", () => {
        advanceSlide();
      });

      mediaWrapper.appendChild(img);
      mediaWrapper.appendChild(badgeEl);
    }

    renderBottomOverviewBar(nowInfo, timeStatus);
  }

  function advanceSlide() {
    const nowInfo = getNowInfo();
    const timeStatus = evaluateSchoolTimeStatus(nowInfo);
    const classes = (timetableData && timetableData.classes) || [];
    const mediaItems = (mediaData && mediaData.items) || [];

    // Requirement: If past dismissal time (or weekend), ONLY slideshow media!
    if (timeStatus.state === "AFTER_HOURS") {
      if (mediaItems.length > 0) {
        const nextMediaIdx = currentMode === "MEDIA" ? (currentMediaIndex + 1) % mediaItems.length : 0;
        switchToMediaSlide(nextMediaIdx, nowInfo, timeStatus);
      }
      return;
    }

    // During school hours: Cycle Class/Track 1..N -> Media 1..M -> Repeat
    if (currentMode === "CLASS") {
      const maxCount = slideTargets.length > 0 ? slideTargets.length : classes.length;
      if (currentClassIndex + 1 < maxCount) {
        switchToClassSlide(currentClassIndex + 1, nowInfo, timeStatus);
      } else if (mediaItems.length > 0) {
        switchToMediaSlide(0, nowInfo, timeStatus);
      } else {
        switchToClassSlide(0, nowInfo, timeStatus);
      }
    } else {
      // Currently in MEDIA mode during school hours
      if (currentMediaIndex + 1 < mediaItems.length) {
        switchToMediaSlide(currentMediaIndex + 1, nowInfo, timeStatus);
      } else {
        switchToClassSlide(0, nowInfo, timeStatus);
      }
    }
  }

  // ==========================================================================
  // MAIN ANIMATION & REAL-TIME SYNC LOOP
  // ==========================================================================
  function mainTick(nowPerf) {
    const dt = nowPerf - lastTickTime;
    lastTickTime = nowPerf;

    const nowInfo = getNowInfo();
    const timeStatus = evaluateSchoolTimeStatus(nowInfo);

    renderTopHeader(nowInfo, timeStatus);

    // If school day just ended while on a class slide, immediately switch to Media-Only mode
    if (timeStatus.state === "AFTER_HOURS" && currentMode === "CLASS") {
      switchToMediaSlide(0, nowInfo, timeStatus);
    }

    slideElapsedMs += dt;
    const progressPct = Math.min(100, (slideElapsedMs / currentSlideDurationMs) * 100);
    const progressFill = document.getElementById("slideTimerFill");
    if (progressFill) {
      progressFill.style.width = `${progressPct}%`;
    }

    if (slideElapsedMs >= currentSlideDurationMs) {
      advanceSlide();
    }

    requestAnimationFrame(mainTick);
  }

  // Refresh current class slide content every 1 second so period changes update live
  setInterval(() => {
    const nowInfo = getNowInfo();
    const timeStatus = evaluateSchoolTimeStatus(nowInfo);
    if (currentMode === "CLASS" && timeStatus.state !== "AFTER_HOURS") {
      renderClassSlide(currentClassIndex, nowInfo, timeStatus);
      renderBottomOverviewBar(nowInfo, timeStatus);
    }
  }, 1000);

  // ==========================================================================
  // ADMIN / TESTING SIMULATION CONTROLS (TOGGLE WITH 'T' KEY)
  // ==========================================================================
  function setupSimulationControls() {
    const simPanel = document.getElementById("simPanel");
    const simDaySelect = document.getElementById("simDaySelect");
    const simTimeInput = document.getElementById("simTimeInput");
    const applySimBtn = document.getElementById("applySimBtn");
    const resetSimBtn = document.getElementById("resetSimBtn");
    const nextSlideBtn = document.getElementById("nextSlideBtn");

    window.addEventListener("keydown", (e) => {
      // Ignore shortcuts while typing in a form field or while the editor is open
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (document.body.classList.contains("editor-open")) return;
      if (e.key === "t" || e.key === "T") {
        simPanel.classList.toggle("visible");
      } else if (e.key === "ArrowRight") {
        advanceSlide();
      }
    });

    applySimBtn.addEventListener("click", () => {
      simEnabled = true;
      simDayName = simDaySelect.value;
      simTimeMinutes = parseTimeToMinutes(simTimeInput.value || "09:30");
      const nowInfo = getNowInfo();
      const timeStatus = evaluateSchoolTimeStatus(nowInfo);
      if (timeStatus.state === "AFTER_HOURS") {
        switchToMediaSlide(0, nowInfo, timeStatus);
      } else {
        switchToClassSlide(0, nowInfo, timeStatus);
      }
    });

    resetSimBtn.addEventListener("click", () => {
      simEnabled = false;
      const nowInfo = getNowInfo();
      const timeStatus = evaluateSchoolTimeStatus(nowInfo);
      if (timeStatus.state === "AFTER_HOURS") {
        switchToMediaSlide(0, nowInfo, timeStatus);
      } else {
        switchToClassSlide(0, nowInfo, timeStatus);
      }
    });

    nextSlideBtn.addEventListener("click", () => {
      advanceSlide();
    });
  }

  // ==========================================================================
  // BOOTSTRAP
  // ==========================================================================
  window.addEventListener("DOMContentLoaded", async () => {
    await initData();
    setupSimulationControls();

    const nowInfo = getNowInfo();
    const timeStatus = evaluateSchoolTimeStatus(nowInfo);

    if (timeStatus.state === "AFTER_HOURS") {
      switchToMediaSlide(0, nowInfo, timeStatus);
    } else {
      switchToClassSlide(0, nowInfo, timeStatus);
    }

    lastTickTime = performance.now();
    requestAnimationFrame(mainTick);
  });
})();
