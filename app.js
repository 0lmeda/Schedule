const schedule = {
  Monday: [],
  Tuesday: [
    ["8:00 AM","11:30 AM","WORK"], ["11:30 AM","12:30 PM","EAT"],
    ["12:30 PM","2:00 PM","Assembly"], ["2:00 PM","3:30 PM","History"],
    ["3:30 PM","5:00 PM","Paco"], ["5:00 PM","5:30 PM","Eat"],
    ["5:30 PM","6:00 PM","Programming"], ["6:00 PM","8:00 PM","Gym"],
    ["8:00 PM","9:30 PM","Assembly"], ["9:30 PM","10:30 PM","Call"],
    ["10:30 PM","11:00 PM","GTS"]
  ],
  Wednesday: [
    ["7:00 AM","7:30 AM","Shower"], ["7:30 AM","8:00 AM","Cook"],
    ["8:00 AM","9:30 AM","Researching"], ["9:30 AM","10:00 AM","Game"],
    ["10:00 AM","11:30 AM","POLS"], ["11:30 AM","12:30 PM","EAT"],
    ["12:30 PM","2:00 PM","Web Dev"], ["2:00 PM","3:30 PM","F Math"],
    ["3:30 PM","4:30 PM","Study Math"], ["4:30 PM","5:00 PM","GTC"],
    ["5:00 PM","6:30 PM","POLS"], ["6:30 PM","7:30 PM","EAT"],
    ["7:30 PM","9:00 PM","GYM"], ["9:00 PM","9:30 PM","HW"],
    ["9:30 PM","10:30 PM","Call"], ["10:30 PM","11:00 PM","GTS"]
  ],
  Thursday: [
    ["8:00 AM","11:30 AM","Work"], ["11:30 AM","12:30 PM","EAT"],
    ["12:30 PM","2:00 PM","Assembly"], ["2:00 PM","3:30 PM","History"],
    ["3:30 PM","5:00 PM","Study History"], ["5:00 PM","5:30 PM","Eat"],
    ["5:30 PM","6:00 PM","Read"], ["6:00 PM","8:00 PM","Gym"],
    ["8:00 PM","9:00 PM","Free time"], ["9:00 PM","9:30 PM","HW"],
    ["9:30 PM","10:30 PM","Call"], ["10:30 PM","11:00 PM","GTS"]
  ],
  Friday: [
    ["8:00 AM","5:30 PM","Work"], ["5:30 PM","6:30 PM","Eat"],
    ["6:30 PM","8:30 PM","Gym"], ["8:30 PM","9:30 PM","Read"],
    ["9:30 PM","10:30 PM","Call"], ["10:30 PM","11:00 PM","GTS"]
  ],
  Saturday: [
    ["7:30 AM","9:00 AM","Cook / Web"], ["9:00 AM","10:00 AM","Researching"],
    ["10:00 AM","1:00 PM","Work"], ["1:00 PM","1:30 PM","Eat"],
    ["1:30 PM","2:00 PM","Game"], ["2:00 PM","3:30 PM","POLS"],
    ["3:30 PM","4:30 PM","Clean Up"]
  ],
  Sunday: []
};

const schoolWords = ["assembly","history","histoy","pols","math","programming","web dev","researching","gtc","hw","study"];
const workWords = ["work"];
const fitnessWords = ["gym"];
const mealWords = ["eat","cook"];
const freeWords = ["free","game"];

const STORAGE = {
  top3: "focusDashboard.top3",
  assignments: "focusDashboard.assignments"
};

function category(name) {
  const n = name.toLowerCase();
  if (workWords.some(x => n.includes(x))) return "work";
  if (fitnessWords.some(x => n.includes(x))) return "fitness";
  if (mealWords.some(x => n.includes(x))) return "meal";
  if (schoolWords.some(x => n.includes(x))) return "school";
  if (freeWords.some(x => n.includes(x))) return "free";
  return "personal";
}

function parseTime(label, base = new Date()) {
  const [clock, meridiem] = label.split(" ");
  let [h, m] = clock.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getTodayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function formatDuration(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function getCurrentState(dayName = getTodayName()) {
  const events = schedule[dayName] || [];
  const now = new Date();
  const currentIndex = events.findIndex(([start, end]) => now >= parseTime(start) && now < parseTime(end));
  const nextIndex = events.findIndex(([start]) => parseTime(start) > now);
  return { events, now, currentIndex, nextIndex };
}

function renderCurrentBlock() {
  const { events, now, currentIndex, nextIndex } = getCurrentState();
  const target = document.getElementById("currentBlock");

  if (!events.length) {
    target.innerHTML = `<strong class="focus-title">Open day</strong><span class="focus-sub">No fixed blocks scheduled today.</span>`;
    return;
  }

  if (currentIndex !== -1) {
    const [start, end, name] = events[currentIndex];
    const remaining = parseTime(end) - now;
    target.innerHTML = `
      <div class="focus-row"><i class="big-dot category-${category(name)}"></i><strong class="focus-title">${escapeHtml(name)}</strong></div>
      <span class="focus-sub">${start} – ${end}</span>
      <div class="focus-countdown">${formatDuration(remaining)} left</div>`;
    return;
  }

  if (nextIndex !== -1) {
    const [start, end, name] = events[nextIndex];
    const until = parseTime(start) - now;
    target.innerHTML = `
      <div class="focus-row"><i class="big-dot category-${category(name)}"></i><strong class="focus-title">${escapeHtml(name)}</strong></div>
      <span class="focus-sub">Next · ${start} – ${end}</span>
      <div class="focus-countdown">Starts in ${formatDuration(until)}</div>`;
    return;
  }

  target.innerHTML = `<strong class="focus-title">Done for today</strong><span class="focus-sub">No more planned blocks.</span>`;
}

function renderToday() {
  const dayName = getTodayName();
  const { events, currentIndex } = getCurrentState(dayName);
  document.getElementById("todayHeading").textContent = dayName;
  document.getElementById("blockCount").textContent = `${events.length} block${events.length === 1 ? "" : "s"}`;

  const list = events.length ? events.map(([start, end, name], i) => {
    const cat = category(name);
    const finished = new Date() >= parseTime(end);
    return `<div class="event category-${cat} ${i === currentIndex ? "current" : ""} ${finished ? "finished" : ""}">
      <div class="event-time">${start}</div>
      <div class="event-bar"></div>
      <div class="event-copy">
        <strong>${escapeHtml(name)}</strong>
        <small>${start} – ${end}${i === currentIndex ? " · now" : ""}</small>
      </div>
      <div class="event-status">${finished ? "✓" : ""}</div>
    </div>`;
  }).join("") : `<p class="empty-day">Nothing fixed today. Use the open space intentionally.</p>`;

  document.getElementById("todayTimeline").innerHTML = list;

  const finishedCount = events.filter(([, end]) => new Date() >= parseTime(end)).length;
  const pct = events.length ? Math.round((finishedCount / events.length) * 100) : 0;
  document.getElementById("dayProgress").textContent = `${pct}%`;
  document.getElementById("dayProgressLabel").textContent = events.length ? `${finishedCount} of ${events.length} planned blocks complete` : "open day";
}

function renderWeek() {
  const html = Object.entries(schedule).map(([day, events]) => `
    <article class="day-card ${day === getTodayName() ? "today-day" : ""}">
      <div class="day-header"><h2>${day}</h2><span>${events.length} blocks</span></div>
      <div class="day-events">
        ${events.length ? events.map(([start, end, name]) => {
          const cat = category(name);
          return `<div class="mini-event"><div class="top"><i class="badge category-${cat}"></i><strong>${escapeHtml(name)}</strong></div><time>${start} – ${end}</time></div>`;
        }).join("") : `<div class="empty-day">Open / unscheduled</div>`}
      </div>
    </article>`).join("");
  document.getElementById("weekView").innerHTML = html;
}

function loadTop3() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE.top3));
    if (Array.isArray(stored) && stored.length === 3) return stored;
  } catch (_) {}
  return [
    { text: "", done: false },
    { text: "", done: false },
    { text: "", done: false }
  ];
}

function saveTop3(items) {
  localStorage.setItem(STORAGE.top3, JSON.stringify(items));
}

function renderTop3() {
  const items = loadTop3();
  document.getElementById("top3List").innerHTML = items.map((item, i) => `
    <label class="priority-item ${item.done ? "done" : ""}">
      <input class="priority-check" data-index="${i}" type="checkbox" ${item.done ? "checked" : ""} />
      <span class="priority-number">${i + 1}</span>
      <input class="priority-input" data-index="${i}" type="text" value="${escapeHtml(item.text)}" placeholder="Priority ${i + 1}" />
    </label>`).join("");

  document.querySelectorAll(".priority-input").forEach(input => {
    input.addEventListener("input", e => {
      const updated = loadTop3();
      updated[Number(e.target.dataset.index)].text = e.target.value;
      saveTop3(updated);
    });
  });

  document.querySelectorAll(".priority-check").forEach(check => {
    check.addEventListener("change", e => {
      const updated = loadTop3();
      updated[Number(e.target.dataset.index)].done = e.target.checked;
      saveTop3(updated);
      renderTop3();
    });
  });
}

function loadAssignments() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE.assignments));
    return Array.isArray(stored) ? stored : [];
  } catch (_) {
    return [];
  }
}

function saveAssignments(items) {
  localStorage.setItem(STORAGE.assignments, JSON.stringify(items));
}

function dateStatus(dateText) {
  const due = new Date(`${dateText}T23:59:59`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const days = Math.round((dueDay - today) / 86400000);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, cls: "overdue" };
  if (days === 0) return { label: "Due today", cls: "urgent" };
  if (days === 1) return { label: "Due tomorrow", cls: "urgent" };
  if (days <= 3) return { label: `${days}d left`, cls: "soon" };
  return { label: `${days}d left`, cls: "normal" };
}

function formatDueDate(dateText) {
  return new Date(`${dateText}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function renderAssignments() {
  const items = loadAssignments().sort((a, b) => a.date.localeCompare(b.date));
  const list = document.getElementById("assignmentList");

  if (!items.length) {
    list.innerHTML = `<div class="assignment-empty"><strong>No deadlines added.</strong><span>Add only the assignments you actually need to track.</span></div>`;
    return;
  }

  list.innerHTML = items.map((item, i) => {
    const status = dateStatus(item.date);
    return `<div class="assignment-item ${item.done ? "assignment-done" : ""}">
      <button class="assignment-check" data-id="${item.id}" title="Mark complete">${item.done ? "✓" : ""}</button>
      <div class="assignment-main">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.course || "School")} · ${formatDueDate(item.date)}</span>
      </div>
      <span class="due-badge ${status.cls}">${status.label}</span>
      <button class="delete-btn" data-delete="${item.id}" title="Delete">×</button>
    </div>`;
  }).join("");

  document.querySelectorAll(".assignment-check").forEach(btn => {
    btn.addEventListener("click", () => {
      const updated = loadAssignments();
      const item = updated.find(x => x.id === btn.dataset.id);
      if (item) item.done = !item.done;
      saveAssignments(updated);
      renderAssignments();
    });
  });

  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => {
      saveAssignments(loadAssignments().filter(x => x.id !== btn.dataset.delete));
      renderAssignments();
    });
  });
}

function updateClockAndSleep() {
  const now = new Date();
  document.getElementById("liveClock").textContent = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const bedtime = new Date(now);
  bedtime.setHours(22, 50, 0, 0);
  if (now > bedtime) bedtime.setDate(bedtime.getDate() + 1);
  document.getElementById("bedtimeCountdown").textContent = formatDuration(bedtime - now);
}

function initAssignmentForm() {
  const form = document.getElementById("assignmentForm");
  document.getElementById("showAssignmentForm").addEventListener("click", () => {
    form.classList.remove("hidden");
    document.getElementById("assignmentTitle").focus();
  });
  document.getElementById("cancelAssignment").addEventListener("click", () => form.classList.add("hidden"));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.getElementById("assignmentTitle").value.trim();
    const course = document.getElementById("assignmentCourse").value.trim();
    const date = document.getElementById("assignmentDate").value;
    if (!title || !date) return;

    const items = loadAssignments();
    items.push({ id: `${Date.now()}`, title, course, date, done: false });
    saveAssignments(items);
    form.reset();
    form.classList.add("hidden");
    renderAssignments();
  });
}

function initViewToggle() {
  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const dashboard = btn.dataset.view === "dashboard";
      document.getElementById("dashboardView").classList.toggle("hidden", !dashboard);
      document.getElementById("weekView").classList.toggle("hidden", dashboard);
    });
  });
}

function init() {
  const now = new Date();
  document.getElementById("todayName").textContent = now.toLocaleDateString("en-US", { weekday: "long" });
  document.getElementById("todayDate").textContent = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  renderCurrentBlock();
  renderToday();
  renderWeek();
  renderTop3();
  renderAssignments();
  updateClockAndSleep();
  initAssignmentForm();
  initViewToggle();

  document.getElementById("resetTop3").addEventListener("click", () => {
    saveTop3([{ text: "", done: false }, { text: "", done: false }, { text: "", done: false }]);
    renderTop3();
  });

  setInterval(() => {
    renderCurrentBlock();
    renderToday();
    updateClockAndSleep();
  }, 30000);
}

init();
