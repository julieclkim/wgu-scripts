(function () {
  const FALLBACK_STUDENT = {
    key: "12345",
    full_name: "Charles Spencer",
    program: "Nursing (RN to BSN)",
    student_type: "Active",
    phone_number: "+16054311804",
    email: "julie.genesys.test@gmail.com",
    balance_due: "$1600",
    enrollment_status: "Enrolled",
    student_notes: "Working full-time as an RN while completing the RN to BSN program; concerned about a financial hold affecting registration and feeling behind on an evidence-based practice task.",
    application_status: "Completed",
    next_step: "Review financial hold options and confirm a realistic term pacing plan with program mentor",
    missing_requirements: "N/A",
    assigned_program_mentor: "Carla Espinosa",
    aid_disbursement_date: "May 28, 2026",
    financial_aid_status: "Pending Disbursement",
    account_hold_flag: "True",
    hold_reason: "Overdue balance",
    payment_plan_available: "True",
    next_required_action: "Review payment plan email and schedule Student Financial Services follow-up",
    last_action_taken: "Completed first course and started evidence-based practice task",
    current_course_focus: "Evidence-Based Practice task",
    academic_support_recommendation: "Create short writing plan; connect to course support if assignment content becomes the blocker",
    risk_flag: "Registration Delay Risk",
    institution_name: "Western Governors University",
    payment_portal_url: "https://my.wgu.edu/",
    aid_year: "2026",
    estimated_aid_amount: "$2,500",
    approved_aid_amount: "$2,500",
    grant_amount: "$875",
    scholarship_amount: "$0",
    loan_amount: "$1,625",
    remaining_aid_needed: "$0",
    disbursement_status: "Pending Disbursement",
    payment_plan_options: "Monthly installment plan, one-time payment, employer reimbursement documentation",
    minimum_payment: "$65.90",
    payment_due_date: "May 22, 2026",
    payment_reference_id: "WGU-12345",
    callback_number: "+16054311804",
    preferred_follow_up_window: "Monday afternoon",
    payment_plan_email_sent: "Yes",
    contact_reason: "Financial hold may prevent registration",
    current_concern: "Working full-time as an RN and feeling behind on current coursework",
    transfer_summary: "Verified before handoff. Balance reviewed. Payment plan email sent. Student expressed payment concern and course overwhelm."
  };

  let student = FALLBACK_STUDENT;
  let actionCount = 0;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function prettyProgram(program) {
    return String(program || "Nursing (RN to BSN)").replace(" (", ", ").replace(")", "");
  }

  function compactProgram(program) {
    const match = String(program || "").match(/\(([^)]+)\)/);
    return match ? match[1] : program;
  }

  function boolText(value, yes = "Available", no = "Not available") {
    const normalized = String(value || "").toLowerCase();
    return normalized === "true" || normalized === "yes" ? yes : no;
  }

  function commaMoney(value) {
    const raw = String(value || "").trim();
    if (!raw) return "$0";
    const numeric = Number(raw.replace(/[^0-9.-]/g, ""));
    if (!Number.isFinite(numeric)) return raw;
    return numeric.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: numeric % 1 === 0 ? 0 : 2 });
  }

  function firstName() {
    return String(student.full_name || "Charles").split(" ")[0] || "Charles";
  }

  function mentorName() {
    return student.assigned_program_mentor || student.assigned_enrollment_counselor || "Program Mentor";
  }

  function getStudentIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const aliases = ["StudentId", "studentId", "student_id", "studentID", "key", "id"];
    for (const alias of aliases) {
      const value = params.get(alias);
      if (value && !value.includes("{{")) return value.trim();
    }
    return "12345";
  }

  async function loadStudent() {
    try {
      const response = await fetch("data/students.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load students.json");
      const students = await response.json();
      const id = getStudentIdFromUrl();
      student = students[id] || students["12345"] || FALLBACK_STUDENT;
    } catch (error) {
      student = FALLBACK_STUDENT;
      console.warn(error);
    }
    renderStudent();
    seedLog();
  }

  function setText(id, value) {
    const node = $(id);
    if (node) node.textContent = value;
  }

  function renderStudent() {
    const program = prettyProgram(student.program);
    const compact = compactProgram(student.program);
    const balance = commaMoney(student.balance_due);

    setText("#headerName", student.full_name);
    setText("#headerProgram", compact || program);
    setText("#headerRisk", student.risk_flag || "Registration Risk");
    setText("#studentName", student.full_name);
    setText("#studentId", student.key);
    setText("#program", program);
    setText("#status", student.student_type || student.enrollment_status || "Active");
    setText("#mentor", mentorName());
    setText("#contactReason", student.contact_reason || "Financial hold may prevent registration");
    setText("#balanceDue", balance);
    setText("#holdReason", student.hold_reason || "Overdue balance");
    setText("#aidStatus", student.financial_aid_status || "Pending Disbursement");
    setText("#aidDate", student.aid_disbursement_date || "May 28, 2026");
    setText("#paymentPlan", boolText(student.payment_plan_available));
    setText("#paymentEmailSent", student.payment_plan_email_sent || "Yes");
    setText("#transferSummary", student.transfer_summary || student.student_notes);

    const studentContext = $("#studentContextBullets");
    if (studentContext) {
      studentContext.innerHTML = `
        <li>Working full-time as an RN</li>
        <li>Behind on ${escapeHtml(student.current_course_focus || "current coursework")}</li>
        <li>Concerned about registration</li>
      `;
    }

    const opener = $("#openingPrompt");
    if (opener) {
      opener.textContent = `Hi ${firstName()}, this is [Advisor Name] with WGU. I have the notes from your conversation, so you do not need to start over. I see you are calling about a financial hold, you received payment plan information, and you are also trying to keep up with nursing coursework while working full time. Is that right?`;
    }
  }

  function seedLog() {
    const log = $("#activityLog");
    if (!log) return;
    log.innerHTML = "";
    actionCount = 0;
    addLog("Advisor script opened", false);
    addLog("Sage handoff loaded", false);
  }

  function currentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function addLog(message, toast = true) {
    const log = $("#activityLog");
    if (!log) return;
    const item = document.createElement("li");
    const time = document.createElement("time");
    const text = document.createElement("span");
    actionCount += 1;
    time.textContent = currentTime();
    text.textContent = message;
    item.append(time, text);
    log.prepend(item);
    if (toast) showToast(message);
  }

  function clearLog() {
    const log = $("#activityLog");
    if (log) log.innerHTML = "";
    actionCount = 0;
    addLog("Activity log cleared");
  }

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function checkStatus(id) {
    const box = $(`#${id}`);
    if (box) box.checked = true;
  }

  function openModal({ kicker = "Demo action", title, body, footer }) {
    $("#modalKicker").textContent = kicker;
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = body;
    $("#modalFooter").innerHTML = footer || `<button class="secondary" data-close-modal>Close</button>`;
    $("#modalBackdrop").hidden = false;
    attachModalHandlers();
  }

  function closeModal() {
    $("#modalBackdrop").hidden = true;
  }

  function attachModalHandlers() {
    $$('[data-close-modal]').forEach((button) => button.addEventListener("click", closeModal));
    $$('[data-submit-action]').forEach((button) => button.addEventListener("click", handleModalSubmit));
  }

  function detailRows(rows) {
    return rows.map(([label, value]) => `
      <tr>
        <th>${escapeHtml(label)}</th>
        <td>${escapeHtml(value || "N/A")}</td>
      </tr>
    `).join("");
  }

  function profileModal() {
    addLog("Student profile viewed");
    openModal({
      kicker: "Student record",
      title: `${student.full_name} profile`,
      body: `
        <div class="modal-grid">
          <div class="info-card">
            <h3>Student</h3>
            <table class="mini-table"><tbody>${detailRows([
              ["Name", student.full_name],
              ["Student ID", student.key],
              ["Program", prettyProgram(student.program)],
              ["Status", student.student_type],
              ["Risk flag", student.risk_flag],
              ["Mentor", mentorName()]
            ])}</tbody></table>
          </div>
          <div class="info-card">
            <h3>Contact</h3>
            <table class="mini-table"><tbody>${detailRows([
              ["Phone", student.phone_number],
              ["Email", student.email],
              ["Callback", student.callback_number],
              ["Follow-up window", student.preferred_follow_up_window]
            ])}</tbody></table>
          </div>
          <div class="info-card">
            <h3>Account</h3>
            <table class="mini-table"><tbody>${detailRows([
              ["Balance", commaMoney(student.balance_due)],
              ["Hold", student.account_hold_flag],
              ["Hold reason", student.hold_reason],
              ["Payment plan", boolText(student.payment_plan_available)],
              ["Due date", student.payment_due_date]
            ])}</tbody></table>
          </div>
          <div class="info-card">
            <h3>Aid</h3>
            <table class="mini-table"><tbody>${detailRows([
              ["Aid status", student.financial_aid_status],
              ["Expected disbursement", student.aid_disbursement_date],
              ["Aid year", student.aid_year],
              ["Approved aid", student.approved_aid_amount]
            ])}</tbody></table>
          </div>
        </div>
        <div class="info-card" style="margin-top: 12px;">
          <h3>Student notes</h3>
          <p>${escapeHtml(student.student_notes)}</p>
        </div>
      `,
      footer: `<button class="primary" data-close-modal>Done</button>`
    });
  }

  function historyModal() {
    addLog("Handoff history viewed");
    openModal({
      kicker: "Sage transfer history",
      title: "Pre-transfer context",
      body: `
        <div class="demo-banner"><strong>Demo:</strong><span>This is a simulated embedded history view for the live advisor demo.</span></div>
        <table class="mini-table">
          <thead><tr><th>Step</th><th>Detail</th></tr></thead>
          <tbody>${detailRows([
            ["Verification", "Student verified with student ID and SMS code"],
            ["Reason", student.contact_reason || "Financial hold may prevent registration"],
            ["Balance", `${commaMoney(student.balance_due)} overdue balance discussed`],
            ["Aid", `${student.financial_aid_status}, expected ${student.aid_disbursement_date}`],
            ["Completed", "Sample payment plan email sent"],
            ["Sentiment", "Frustrated and overwhelmed"],
            ["Concern", "Working full time, falling behind in class, worried about registration"]
          ])}</tbody>
        </table>
      `,
      footer: `<button class="secondary" data-close-modal>Close</button><button class="primary" data-submit-action="confirm-history">Use this summary</button>`
    });
  }

  function paymentPortalModal() {
    addLog("Payment portal opened");
    openModal({
      kicker: "Financial tool",
      title: "Simulated payment portal", 
      body: `
        <div class="demo-banner"><strong>Demo:</strong><span>This simulates the advisor opening the student payment portal without leaving the script.</span></div>
        <div class="modal-grid">
          <div class="info-card">
            <h3>Portal details</h3>
            <table class="mini-table"><tbody>${detailRows([
              ["Portal URL", student.payment_portal_url],
              ["Student", `${student.full_name} (${student.key})`],
              ["Balance due", commaMoney(student.balance_due)],
              ["Due date", student.payment_due_date],
              ["Reference ID", student.payment_reference_id]
            ])}</tbody></table>
          </div>
          <div class="info-card">
            <h3>Available options</h3>
            <ul class="bullets tight">
              ${(student.payment_plan_options || "Monthly installment plan, one-time payment").split(",").map((item) => `<li>${escapeHtml(item.trim())}</li>`).join("")}
            </ul>
            <p class="warning-text" style="margin-top: 12px;">Reminder: review options only. Do not promise payment plan approval or registration access.</p>
          </div>
        </div>
      `,
      footer: `<button class="secondary" data-close-modal>Close</button><button class="primary" data-submit-action="portal-reviewed">Mark portal reviewed</button>`
    });
  }

  function sfsReferralModal() {
    openModal({
      kicker: "Student Financial Services",
      title: "Create SFS referral",
      body: `
        <form class="form-grid" id="sfsForm">
          <div class="form-field"><label>Student</label><input value="${escapeHtml(student.full_name)}" /></div>
          <div class="form-field"><label>Student ID</label><input value="${escapeHtml(student.key)}" /></div>
          <div class="form-field full"><label>Referral reason</label><input value="Financial hold may prevent registration" /></div>
          <div class="form-field"><label>Balance</label><input value="${escapeHtml(commaMoney(student.balance_due))}" /></div>
          <div class="form-field"><label>Aid status</label><input value="${escapeHtml(student.financial_aid_status)}" /></div>
          <div class="form-field"><label>Hold reason</label><input value="${escapeHtml(student.hold_reason)}" /></div>
          <div class="form-field"><label>Callback number</label><input value="${escapeHtml(student.callback_number || student.phone_number)}" /></div>
          <div class="form-field full"><label>Payment concern</label><textarea>Student is concerned about aid timing, payment amount, and whether the overdue balance could affect registration. Payment plan email was sent before advisor handoff.</textarea></div>
          <div class="form-field full"><label>Registration risk context</label><textarea>${escapeHtml(student.risk_flag)}. Student is working full-time as an RN and needs the next financial step documented clearly.</textarea></div>
        </form>
      `,
      footer: `<button class="secondary" data-close-modal>Cancel</button><button class="primary" data-submit-action="sfs-referral">Submit referral</button>`
    });
  }

  function courseProgressModal() {
    addLog("Course progress viewed");
    checkStatus("status-course-progress-reviewed");
    openModal({
      kicker: "Academic support",
      title: "Course progress snapshot",
      body: `
        <div class="modal-grid">
          <div class="info-card">
            <h3>Current course focus</h3>
            <table class="mini-table"><tbody>${detailRows([
              ["Focus", student.current_course_focus],
              ["Task status", "Started, behind target pace"],
              ["Risk indicator", "Needs momentum this week"],
              ["Recent activity", student.last_action_taken]
            ])}</tbody></table>
          </div>
          <div class="info-card">
            <h3>Support ownership</h3>
            <table class="mini-table"><tbody>${detailRows([
              ["Program Mentor", mentorName()],
              ["Course Instructor", "Route if task requirements or content are unclear"],
              ["Recommended support", student.academic_support_recommendation],
              ["Follow-up window", student.preferred_follow_up_window]
            ])}</tbody></table>
          </div>
        </div>
        <div class="info-card" style="margin-top: 12px;">
          <h3>Recommended 72-hour plan</h3>
          <ul class="bullets tight">
            <li>Two 45-minute writing blocks before Monday.</li>
            <li>One 30-minute outline or rubric review.</li>
            <li>Escalate to Course Instructor if assignment content becomes the blocker.</li>
            <li>Escalate to Program Mentor if pacing or term planning is the blocker.</li>
          </ul>
        </div>
      `,
      footer: `<button class="secondary" data-close-modal>Close</button><button class="primary" data-submit-action="create-72-hour-plan">Create 72-hour plan</button>`
    });
  }

  function mentorNoteModal() {
    openModal({
      kicker: "Academic support",
      title: "Add Program Mentor note",
      body: `
        <form class="form-grid" id="mentorForm">
          <div class="form-field"><label>Owner</label><input value="${escapeHtml(mentorName())}" /></div>
          <div class="form-field"><label>Topic</label><input value="Course pacing support" /></div>
          <div class="form-field full"><label>Mentor note</label><textarea>${escapeHtml(student.full_name)} is working full-time as an RN while completing the RN to BSN program and reports feeling behind on the ${escapeHtml(student.current_course_focus)}. Advisor created a short 72-hour plan: two 45-minute writing blocks, one 30-minute outline or rubric review, and Monday afternoon follow-up. Route to Course Instructor if assignment requirements or content become the blocker.</textarea></div>
        </form>
      `,
      footer: `<button class="secondary" data-close-modal>Cancel</button><button class="primary" data-submit-action="mentor-note">Save mentor note</button>`
    });
  }

  function scheduleModal() {
    openModal({
      kicker: "Follow-up",
      title: "Schedule advisor follow-up",
      body: `
        <form class="form-grid" id="scheduleForm">
          <div class="form-field"><label>Follow-up owner</label><input value="${escapeHtml(mentorName())}" /></div>
          <div class="form-field"><label>Preferred window</label><input value="${escapeHtml(student.preferred_follow_up_window || "Monday afternoon")}" /></div>
          <div class="form-field"><label>Preferred channel</label><select><option selected>Phone callback</option><option>Email</option><option>Student portal message</option></select></div>
          <div class="form-field"><label>Callback number</label><input value="${escapeHtml(student.callback_number || student.phone_number)}" /></div>
          <div class="form-field full"><label>Topic</label><textarea>Check progress on financial hold next step, payment plan email review, and 72-hour academic momentum plan for ${escapeHtml(student.current_course_focus)}.</textarea></div>
        </form>
      `,
      footer: `<button class="secondary" data-close-modal>Cancel</button><button class="primary" data-submit-action="schedule">Schedule follow-up</button>`
    });
  }

  function recapModal() {
    const body = `Hi ${firstName()},

Thanks for speaking with WGU today. Here is the plan we confirmed:

Financial next step:
- Review the payment plan email that was sent.
- Student Financial Services follow-up was requested.
- Your concern about aid timing and the payment amount was documented.

Academic next step:
- Complete two 45-minute writing blocks.
- Complete one 30-minute outline or rubric review.
- If the assignment content becomes the blocker, we will route you to course support.

Advisor follow-up:
- Follow-up requested for ${student.preferred_follow_up_window || "Monday afternoon"}.

We may not have solved every piece in one call, but we turned it from a pile of stress into a plan.

WGU Student Support`;

    openModal({
      kicker: "Student communication",
      title: "Send recap email",
      body: `
        <form class="form-grid" id="recapForm">
          <div class="form-field"><label>To</label><input value="${escapeHtml(student.email)}" /></div>
          <div class="form-field"><label>Subject</label><input value="WGU follow-up plan" /></div>
          <div class="form-field full"><label>Email body</label><textarea style="min-height: 330px;">${escapeHtml(body)}</textarea></div>
        </form>
      `,
      footer: `<button class="secondary" data-close-modal>Cancel</button><button class="primary" data-submit-action="recap">Send recap email</button>`
    });
  }

  function wrapModal() {
    const completed = [
      ["Summary confirmed", $("#status-summary-confirmed")?.checked],
      ["Payment concern documented", $("#status-payment-concern-documented")?.checked],
      ["SFS follow-up requested", $("#status-sfs-followup-requested")?.checked],
      ["Course progress reviewed", $("#status-course-progress-reviewed")?.checked],
      ["Mentor note added", $("#status-mentor-note-added")?.checked],
      ["Follow-up scheduled", $("#status-followup-scheduled")?.checked],
      ["Recap sent", $("#status-recap-sent")?.checked]
    ];
    const completedText = completed.map(([label, done]) => `${done ? "[x]" : "[ ]"} ${label}`).join("\n");

    openModal({
      kicker: "Disposition",
      title: "Complete wrap-up",
      body: `
        <form class="form-grid" id="wrapForm">
          <div class="form-field"><label>Suggested wrap-up code</label><input value="Financial Hold / Payment Plan / Student Success Follow-Up" /></div>
          <div class="form-field"><label>Disposition</label><select><option selected>Resolved with follow-up</option><option>Transferred to Student Financial Services</option><option>Callback scheduled</option></select></div>
          <div class="form-field full"><label>Completed actions</label><textarea>${escapeHtml(completedText)}</textarea></div>
          <div class="form-field full"><label>Wrap-up summary</label><textarea>${escapeHtml(student.full_name)} contacted WGU about a financial hold that may affect registration. Advisor confirmed the handoff summary, documented payment concern and pending aid timing, requested Student Financial Services follow-up, created a short academic momentum plan for ${student.current_course_focus}, and scheduled a ${student.preferred_follow_up_window || "Monday afternoon"} follow-up.</textarea></div>
        </form>
      `,
      footer: `<button class="secondary" data-close-modal>Cancel</button><button class="primary" data-submit-action="wrap">Submit wrap-up</button>`
    });
  }

  function documentPaymentConcern() {
    checkStatus("status-payment-email-confirmed");
    checkStatus("status-payment-concern-documented");
    addLog("Payment concern documented");
  }

  function confirmSummary() {
    checkStatus("status-summary-confirmed");
    addLog("Summary confirmed");
  }

  function handleModalSubmit(event) {
    const action = event.currentTarget.getAttribute("data-submit-action");
    switch (action) {
      case "confirm-history":
        checkStatus("status-summary-confirmed");
        addLog("Transfer summary confirmed");
        closeModal();
        break;
      case "portal-reviewed":
        checkStatus("status-payment-email-confirmed");
        addLog("Payment portal reviewed");
        closeModal();
        break;
      case "sfs-referral":
        checkStatus("status-payment-concern-documented");
        checkStatus("status-sfs-followup-requested");
        addLog("Student Financial Services referral created");
        closeModal();
        break;
      case "create-72-hour-plan":
        checkStatus("status-course-progress-reviewed");
        addLog("72-hour academic momentum plan created");
        closeModal();
        break;
      case "mentor-note":
        checkStatus("status-mentor-note-added");
        addLog("Program Mentor note added");
        closeModal();
        break;
      case "schedule":
        checkStatus("status-followup-scheduled");
        addLog("Follow-up scheduled");
        closeModal();
        break;
      case "recap":
        checkStatus("status-recap-sent");
        addLog("Recap email sent");
        closeModal();
        break;
      case "wrap":
        checkStatus("status-wrapup-completed");
        addLog("Interaction wrapped");
        closeModal();
        break;
      default:
        closeModal();
    }
  }

  function handleAction(action) {
    switch (action) {
      case "open-profile":
        profileModal();
        break;
      case "history":
        historyModal();
        break;
      case "payment-portal":
        paymentPortalModal();
        break;
      case "sfs-referral":
        sfsReferralModal();
        break;
      case "course-progress":
        courseProgressModal();
        break;
      case "mentor-note":
        mentorNoteModal();
        break;
      case "schedule":
        scheduleModal();
        break;
      case "recap":
        recapModal();
        break;
      case "complete-wrap":
        wrapModal();
        break;
      case "confirm-summary":
        confirmSummary();
        break;
      case "document-payment-concern":
        documentPaymentConcern();
        break;
      case "clear-log":
        clearLog();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    handleAction(button.getAttribute("data-action"));
  });

  $("#modalClose")?.addEventListener("click", closeModal);
  $("#modalBackdrop")?.addEventListener("click", (event) => {
    if (event.target.id === "modalBackdrop") closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#modalBackdrop")?.hidden) closeModal();
  });

  loadStudent();
})();
