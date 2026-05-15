(function () {
  const app = document.getElementById("app");
  const fallbackKey = "12345";
  const studentIdAliases = ["StudentId", "studentId", "student_id", "studentID", "key", "id"];

  const state = {
    activePage: "snapshot",
    actions: []
  };

  let activeStudent = null;
  let setupMessage = "";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function looksUnresolved(value) {
    if (value === null || value === undefined) return true;
    const text = String(value).trim();
    return !text || text.includes("{{") || text.includes("}}") || text.toLowerCase() === "null" || text.toLowerCase() === "undefined";
  }

  function getStudentId() {
    const search = params();
    for (const alias of studentIdAliases) {
      const value = search.get(alias);
      if (!looksUnresolved(value)) return String(value).trim();
    }
    return "";
  }

  function withUrlOverrides(student) {
    const search = params();
    const merged = { ...student };
    for (const [key, value] of search.entries()) {
      if (studentIdAliases.includes(key)) continue;
      if (!looksUnresolved(value)) merged[key] = value;
    }
    return merged;
  }

  function clean(value, fallback = "N/A") {
    if (value === undefined || value === null || String(value).trim() === "") return fallback;
    return String(value).trim();
  }

  function asBool(value) {
    return /^(true|yes|y|1)$/i.test(String(value || "").trim());
  }

  function firstName(fullName) {
    return clean(fullName, "Student").split(/\s+/)[0] || "Student";
  }

  function money(value) {
    const raw = clean(value, "");
    const number = Number(raw.replace(/[^0-9.-]/g, ""));
    if (!Number.isFinite(number)) return raw || "N/A";
    return number.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: number % 1 === 0 ? 0 : 2 });
  }

  function mentor(student) {
    return clean(student.assigned_program_mentor || student.assigned_enrollment_counselor, "Program mentor not assigned");
  }

  function yesNo(value) {
    return asBool(value) ? "Yes" : "No";
  }

  function statusBadge(label, type = "neutral") {
    return `<span class="badge ${type}">${escapeHtml(label)}</span>`;
  }

  function riskType(student) {
    const text = `${student.risk_flag || ""} ${student.hold_reason || ""}`.toLowerCase();
    if (/delay|risk|hold|overdue|behind|concern/.test(text)) return "danger";
    return "success";
  }

  function actionButton(label, action, extraClass = "") {
    return `<button class="${extraClass}" type="button" data-action="${escapeHtml(action)}">${escapeHtml(label)}</button>`;
  }

  function navButton(label, page, extraClass = "") {
    return `<button class="${extraClass}" type="button" data-page="${escapeHtml(page)}">${escapeHtml(label)}</button>`;
  }

  function bulletList(items, className = "bullet-list") {
    return `<ul class="${className}">${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function field(label, value, emphasis = false) {
    return `
      <div class="field-row ${emphasis ? "emphasis" : ""}">
        <dt>${escapeHtml(label)}</dt>
        <dd>${escapeHtml(clean(value))}</dd>
      </div>
    `;
  }

  function getAdvisorName() {
    const value = params().get("advisorName") || params().get("AdvisorName");
    return looksUnresolved(value) ? "[Advisor Name]" : clean(value);
  }

  function contactReason(student) {
    return clean(student.contact_reason, asBool(student.account_hold_flag) ? "Financial hold may prevent registration" : "Student support request");
  }

  function currentConcern(student) {
    return clean(student.student_notes, "Student needs support with account and academic next steps");
  }

  function addAction(text) {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    state.actions.unshift({ text, timestamp });
    render();
  }

  function setPage(page) {
    state.activePage = page;
    render();
    const heading = document.querySelector(".page-title");
    if (heading) heading.focus({ preventScroll: false });
  }

  function snapshotPage(student) {
    const first = firstName(student.full_name);
    const advisor = getAdvisorName();
    const openingPrompt = `Hi ${first}, this is ${advisor} with WGU. I have the notes from your conversation, so you do not need to start over. I see you are calling about a financial hold, you received payment plan information, and you are also trying to keep up with nursing coursework while working full time. Is that right?`;

    return `
      <section class="page-card">
        <div class="section-heading">
          <p class="eyebrow dark">Page 1</p>
          <h2 class="page-title" tabindex="-1">Student snapshot</h2>
        </div>

        <div class="snapshot-grid">
          <article class="card compact-card primary-card">
            <p class="label">Student</p>
            <h3>${escapeHtml(clean(student.full_name))}</h3>
            <div class="badge-row">
              ${statusBadge(`ID ${clean(student.key)}`)}
              ${statusBadge(clean(student.student_type, "Active student"), "success")}
              ${statusBadge(clean(student.risk_flag), riskType(student))}
            </div>
          </article>

          <article class="card compact-card">
            <h3>Key account details</h3>
            <dl class="field-list two-col">
              ${field("Verified", clean(student.identity_verified, "Yes"))}
              ${field("Contact reason", contactReason(student))}
              ${field("Balance due", money(student.balance_due), true)}
              ${field("Aid status", student.financial_aid_status)}
              ${field("Expected disbursement", student.aid_disbursement_date)}
              ${field("Payment plan", yesNo(student.payment_plan_available))}
              ${field("Payment plan email", clean(student.payment_plan_email_status, "Sent"))}
              ${field("Program mentor", mentor(student))}
            </dl>
          </article>
        </div>

        <article class="card prompt-card">
          <div>
            <p class="label">Opening prompt</p>
            <p class="script-text">${escapeHtml(openingPrompt)}</p>
          </div>
        </article>

        <article class="card">
          <h3>Current concern</h3>
          <p>${escapeHtml(currentConcern(student))}</p>
        </article>

        <div class="button-row action-row">
          ${actionButton("Confirm summary", `Summary confirmed with ${first}` , "primary")}
          ${navButton("Open financial hold guide", "financial")}
          ${navButton("Open courses + momentum", "courses")}
          ${actionButton("Request Student Financial Services follow-up", "Student Financial Services follow-up requested")}
          ${actionButton("Schedule advisor follow-up", `Advisor follow-up scheduled for ${clean(student.preferred_follow_up_window, "Monday afternoon")}`)}
        </div>
      </section>
    `;
  }

  function financialPage(student) {
    return `
      <section class="page-card">
        <div class="section-heading">
          <p class="eyebrow dark">Page 2</p>
          <h2 class="page-title" tabindex="-1">Financial hold guide</h2>
          <p class="subtitle">Help the student understand the next step without promising a financial outcome.</p>
        </div>

        <div class="two-panel">
          <article class="card">
            <h3>Already completed</h3>
            ${bulletList([
              "Student verified",
              `Hold reason identified: ${clean(student.hold_reason, "Account hold")}`,
              `Balance discussed: ${money(student.balance_due)}`,
              `Payment plan email: ${clean(student.payment_plan_email_status, "Sent")}`
            ], "check-list")}
          </article>

          <article class="card warning-card">
            <h3>Financial snapshot</h3>
            <dl class="field-list">
              ${field("Balance", money(student.balance_due), true)}
              ${field("Minimum payment", money(student.minimum_payment))}
              ${field("Due date", student.payment_due_date)}
              ${field("Aid status", student.financial_aid_status)}
              ${field("Expected aid date", student.aid_disbursement_date)}
              ${field("Payment options", student.payment_plan_options)}
            </dl>
          </article>
        </div>

        <div class="two-panel">
          <article class="card">
            <h3>Ask</h3>
            ${bulletList([
              "Did the payment plan email come through?",
              "Is your biggest concern the balance, the timing of aid, or the payment amount?",
              "Would you like Student Financial Services to follow up?"
            ])}
          </article>

          <article class="card guardrail-card">
            <h3>Guardrails</h3>
            <div class="say-box">
              <strong>Say</strong>
              <p>I cannot promise the outcome on the hold or aid timing today, but I can document the concern and request Student Financial Services follow-up with the right context.</p>
            </div>
            <div class="dont-box">
              <strong>Do not say</strong>
              ${bulletList([
                "Your hold will be removed",
                "Your aid will definitely cover it",
                "You are approved for a payment plan",
                "This will not affect registration"
              ])}
            </div>
          </article>
        </div>

        <div class="button-row action-row">
          ${actionButton("Document payment concern", "Payment concern documented")}
          ${actionButton("Request Student Financial Services follow-up", "Student Financial Services follow-up requested", "primary")}
          ${actionButton("Send hardship resource", "Hardship resource queued")}
          <a class="button" href="${escapeHtml(clean(student.payment_portal_url, "https://my.wgu.edu/"))}" target="_blank" rel="noopener">Open payment portal</a>
          ${navButton("Back to student snapshot", "snapshot")}
        </div>
      </section>
    `;
  }

  function coursesPage(student) {
    const fullTime = /full.?time/i.test(student.student_notes || "");
    const workerText = fullTime ? "Working full-time as an RN" : "Working while enrolled";
    const first = firstName(student.full_name);
    return `
      <section class="page-card">
        <div class="section-heading">
          <p class="eyebrow dark">Page 3</p>
          <h2 class="page-title" tabindex="-1">Courses + momentum</h2>
          <p class="subtitle">Use this when the student shifts from the hold to stress about course progress.</p>
        </div>

        <div class="two-panel">
          <article class="card compact-card">
            <h3>Current course focus</h3>
            <p class="big-value">${escapeHtml(clean(student.current_course_focus, "Current course task"))}</p>
            <dl class="field-list">
              ${field("Student context", workerText)}
              ${field("Current concern", currentConcern(student))}
              ${field("Support recommendation", student.academic_support_recommendation)}
            </dl>
          </article>

          <article class="card prompt-card">
            <p class="label">Agent-facing prompt</p>
            <p class="script-text">Is the blocker the assignment itself, organizing the writing, or finding time after shifts?</p>
          </article>
        </div>

        <div class="two-panel">
          <article class="card">
            <h3>Ask</h3>
            ${bulletList([
              "What feels most at risk right now?",
              "Is the blocker time, assignment requirements, writing structure, or course content?",
              "Have you reviewed the task instructions or rubric?",
              `Would a ${clean(student.preferred_follow_up_window, "Monday afternoon")} follow-up help?`
            ])}
          </article>

          <article class="card success-card">
            <h3>Recommended plan</h3>
            ${bulletList([
              "Two 45-minute writing blocks",
              "One 30-minute outline or rubric review",
              `${clean(student.preferred_follow_up_window, "Monday afternoon")} follow-up`,
              `Program mentor: ${mentor(student)}`
            ], "check-list")}
          </article>
        </div>

        <div class="two-panel">
          <article class="card">
            <h3>Route to Course Instructor if</h3>
            ${bulletList([
              "The assignment requirements are unclear",
              "The student needs course-content help",
              "The student needs assessment guidance"
            ])}
          </article>

          <article class="card">
            <h3>Route to Program Mentor if</h3>
            ${bulletList([
              "The issue is pacing",
              "The issue is time management",
              "The student needs help adjusting the term plan"
            ])}
          </article>
        </div>

        <div class="button-row action-row">
          ${actionButton("Create 72-hour plan", `72-hour academic momentum plan created for ${first}`, "primary")}
          ${actionButton("Recommend course support", "Course support recommended if content becomes the blocker")}
          ${actionButton("Schedule Monday follow-up", `Follow-up scheduled for ${clean(student.preferred_follow_up_window, "Monday afternoon")}`)}
          ${actionButton("Document academic concern", "Academic concern documented")}
          ${navButton("Back to student snapshot", "snapshot")}
        </div>
      </section>
    `;
  }

  function wrapUpNote(student) {
    const first = firstName(student.full_name);
    const actions = state.actions.length
      ? state.actions.slice(0, 5).map(item => item.text).join("; ")
      : "Summary confirmed; financial and academic next steps reviewed";
    return `${clean(student.full_name)} contacted WGU regarding ${contactReason(student).toLowerCase()}. Student was verified. Advisor reviewed ${money(student.balance_due)} balance, ${clean(student.financial_aid_status).toLowerCase()} aid status, expected disbursement on ${clean(student.aid_disbursement_date)}, and payment plan availability. Student also reported workload pressure related to ${clean(student.current_course_focus, "current coursework").toLowerCase()}. Advisor created a realistic momentum plan: two 45-minute writing blocks, one 30-minute outline or rubric review, and ${clean(student.preferred_follow_up_window, "Monday afternoon")} follow-up. Actions completed: ${actions}. Student should review payment plan email and await Student Financial Services follow-up. Suggested close used with ${first}: We may not have solved every piece in one call, but we turned it from a pile of stress into a plan.`;
  }

  function wrapUpPage(student) {
    return `
      <section class="page-card">
        <div class="section-heading">
          <p class="eyebrow dark">Page 4</p>
          <h2 class="page-title" tabindex="-1">Wrap-up</h2>
          <p class="subtitle">Confirm the next steps clearly before ending the call.</p>
        </div>

        <div class="two-panel">
          <article class="card">
            <h3>Confirm financial next step</h3>
            ${bulletList([
              "Payment plan email reviewed",
              "Student Financial Services follow-up requested",
              "Aid timing and payment concern documented"
            ], "check-list")}
          </article>

          <article class="card">
            <h3>Confirm academic next step</h3>
            ${bulletList([
              "Two 45-minute writing blocks",
              "One 30-minute outline review",
              `${clean(student.preferred_follow_up_window, "Monday afternoon")} follow-up`,
              "Course support if assignment content becomes the blocker"
            ], "check-list")}
          </article>
        </div>

        <article class="card prompt-card">
          <p class="label">Ask</p>
          <p class="script-text">Do you feel clear on what happens next?</p>
          <p class="label top-space">Suggested close</p>
          <p class="script-text">We may not have solved every piece in one call, but we turned it from a pile of stress into a plan.</p>
        </article>

        <article class="card">
          <h3>Suggested wrap-up note</h3>
          <textarea id="wrapupNote" aria-label="Suggested wrap-up note">${escapeHtml(wrapUpNote(student))}</textarea>
          <div class="button-row">
            <button class="primary" type="button" data-copy-note>Copy note</button>
            ${actionButton("Send recap email", "Recap email queued")}
            ${actionButton("Schedule follow-up", `Follow-up scheduled for ${clean(student.preferred_follow_up_window, "Monday afternoon")}`)}
            ${actionButton("Submit SFS follow-up request", "Student Financial Services follow-up submitted")}
          </div>
          <p class="copy-status" id="copyStatus" aria-live="polite"></p>
        </article>
      </section>
    `;
  }

  function pageHtml(student) {
    if (state.activePage === "financial") return financialPage(student);
    if (state.activePage === "courses") return coursesPage(student);
    if (state.activePage === "wrapup") return wrapUpPage(student);
    return snapshotPage(student);
  }

  function nextBestAction(student) {
    if (state.activePage === "financial") return "Document the concern without promising hold or aid outcomes, then request Student Financial Services follow-up.";
    if (state.activePage === "courses") return "Identify the blocker, then create a short 72-hour writing and review plan.";
    if (state.activePage === "wrapup") return "Confirm both financial and academic next steps, then copy the wrap-up note.";
    if (asBool(student.account_hold_flag)) return "Confirm the handoff summary, then open the financial hold guide.";
    return "Confirm the handoff summary, then document next action.";
  }

  function actionLogHtml() {
    if (!state.actions.length) {
      return `<p class="empty-log">No actions recorded yet.</p>`;
    }
    return `<ol class="action-log">${state.actions.map(item => `<li><span>${escapeHtml(item.timestamp)}</span>${escapeHtml(item.text)}</li>`).join("")}</ol>`;
  }

  function render() {
    const student = activeStudent;
    const first = firstName(student.full_name);
    const tabs = [
      ["snapshot", "Student snapshot"],
      ["financial", "Financial hold guide"],
      ["courses", "Courses + momentum"],
      ["wrapup", "Wrap-up"]
    ];

    app.innerHTML = `
      <header class="hero">
        <div>
          <p class="eyebrow">${escapeHtml(clean(student.institution_name, "Western Governors University"))}</p>
          <h1>WGU Student Support</h1>
          <p class="hero-copy">Live advisor guide for ${escapeHtml(clean(student.full_name))}. Keep the call focused, compliant, and action-oriented.</p>
        </div>
        <div class="hero-badges">
          ${statusBadge(`Student ID ${clean(student.key)}`)}
          ${statusBadge(clean(student.enrollment_status, "Active"), "success")}
          ${statusBadge(clean(student.risk_flag, "Standard"), riskType(student))}
        </div>
      </header>

      ${setupMessage ? `<div class="setup-warning">${escapeHtml(setupMessage)}</div>` : ""}

      <nav class="tab-row" aria-label="Script pages">
        ${tabs.map(([page, label]) => `<button type="button" class="tab ${state.activePage === page ? "active" : ""}" data-page="${page}">${escapeHtml(label)}</button>`).join("")}
      </nav>

      <div class="workbench">
        <div class="main-panel">
          ${pageHtml(student)}
        </div>
        <aside class="side-panel" aria-label="Advisor action panel">
          <section class="card sticky-card">
            <p class="label">Next best action</p>
            <p class="next-action">${escapeHtml(nextBestAction(student))}</p>
            <div class="side-divider"></div>
            <h3>Quick context</h3>
            <dl class="field-list side-fields">
              ${field("Student", clean(student.full_name))}
              ${field("Phone", clean(student.callback_number || student.phone_number))}
              ${field("Program", clean(student.program))}
              ${field("Mentor", mentor(student))}
              ${field("Follow-up", clean(student.preferred_follow_up_window, "Monday afternoon"))}
            </dl>
            <div class="side-divider"></div>
            <h3>Action log</h3>
            ${actionLogHtml()}
            <div class="side-divider"></div>
            <p class="wrap-code"><strong>Suggested wrap-up:</strong><br>Financial Hold / Payment Plan / Student Success Follow-Up</p>
            <div class="button-row side-buttons">
              ${navButton("Financial guide", "financial")}
              ${navButton("Course plan", "courses")}
              ${navButton("Wrap up", "wrapup", "primary")}
            </div>
          </section>
        </aside>
      </div>
    `;
  }

  async function copyWrapupNote() {
    const note = document.getElementById("wrapupNote");
    const status = document.getElementById("copyStatus");
    if (!note) return;
    try {
      await navigator.clipboard.writeText(note.value);
      if (status) status.textContent = "Wrap-up note copied.";
    } catch (error) {
      note.select();
      document.execCommand("copy");
      if (status) status.textContent = "Wrap-up note copied.";
    }
  }

  app.addEventListener("click", event => {
    const button = event.target.closest("button, a");
    if (!button) return;
    const page = button.getAttribute("data-page");
    const action = button.getAttribute("data-action");
    if (page) {
      event.preventDefault();
      setPage(page);
    } else if (action) {
      event.preventDefault();
      addAction(action);
    } else if (button.hasAttribute("data-copy-note")) {
      event.preventDefault();
      copyWrapupNote();
    }
  });

  async function init() {
    try {
      const response = await fetch("data/students.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`data/students.json returned ${response.status}`);
      const students = await response.json();
      const requestedId = getStudentId();
      let student = students[requestedId];

      if (!requestedId) {
        student = students[fallbackKey];
        setupMessage = `No StudentId or key was passed in the URL. Showing demo record ${fallbackKey}.`;
      } else if (!student) {
        student = students[fallbackKey];
        setupMessage = `Student ID ${requestedId} was not found in data/students.json. Showing demo record ${fallbackKey}.`;
      }

      activeStudent = withUrlOverrides(student);
      render();
    } catch (error) {
      app.innerHTML = `
        <section class="card warning-card">
          <h1>Student support guide could not load</h1>
          <p>Check that <code>data/students.json</code> exists and that GitHub Pages has published the latest files.</p>
          <p class="small-muted">Details: ${escapeHtml(error.message)}</p>
        </section>
      `;
    }
  }

  init();
}());
