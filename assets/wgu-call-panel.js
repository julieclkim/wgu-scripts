const FALLBACK_ID = "12345";
const STUDENT_PARAM_NAMES = ["StudentId", "studentId", "student_id", "studentID", "key", "id"];
let students = {};
let student = null;
let currentId = FALLBACK_ID;

const $ = (id) => document.getElementById(id);
const fmt = (value, fallback = "Not available") => value === undefined || value === null || value === "" ? fallback : value;

function cleanProgram(program) {
  return fmt(program).replace("Nursing (RN to BSN)", "Nursing, RN to BSN");
}

function readStudentId() {
  const params = new URLSearchParams(window.location.search);
  for (const name of STUDENT_PARAM_NAMES) {
    const value = params.get(name);
    if (value && !value.includes("{{")) return value.trim();
  }
  return "";
}

async function loadStudents() {
  const response = await fetch("data/students.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load student data");
  return response.json();
}

function mentorName(s) {
  return fmt(s.assigned_program_mentor || s.assigned_enrollment_counselor, "Program Mentor");
}

function isTrue(value) {
  return String(value).toLowerCase() === "true" || String(value).toLowerCase() === "yes";
}

function renderStudent() {
  $("headerName").textContent = student.full_name;
  $("headerProgram").textContent = cleanProgram(student.program).replace("Nursing, ", "");
  $("headerRisk").textContent = fmt(student.risk_flag, "Risk review");
  $("studentName").textContent = student.full_name;
  $("studentIdLine").textContent = `ID ${student.key}`;
  $("program").textContent = cleanProgram(student.program);
  $("mentor").textContent = mentorName(student);
  $("phone").textContent = fmt(student.phone_number || student.callback_number);
  $("email").textContent = fmt(student.email);
  $("reason").textContent = "Financial hold may prevent registration.";
  $("balance").textContent = fmt(student.balance_due);
  $("aid").textContent = fmt(student.financial_aid_status);
  $("aidDate").textContent = fmt(student.aid_disbursement_date);
  $("hold").textContent = isTrue(student.account_hold_flag) ? fmt(student.hold_reason, "Hold on account") : "No hold";

  const first = student.full_name.split(" ")[0] || "there";
  $("opener").textContent = `Sage gave me the notes, ${first}. I see the hold, payment plan email, and course pressure. Did I get that right?`;

  const pressure = [
    student.student_notes?.includes("full-time") ? "Working full-time as an RN" : "Working while in school",
    student.current_course_focus ? `Behind on ${student.current_course_focus}` : "Course load concern",
    "Worried about registration"
  ];
  $("pressureList").innerHTML = pressure.map(item => `<li>${escapeHtml(item)}</li>`).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function log(message) {
  const li = document.createElement("li");
  li.innerHTML = `<span class="time">${nowTime()}</span> ${escapeHtml(message)}`;
  $("activityLog").prepend(li);
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  window.setTimeout(() => el.classList.remove("show"), 1800);
}

function setChecked(id, value = true) {
  const el = $(id);
  if (el) el.checked = value;
}

function openModal(title, kicker, body, footer) {
  $("modalTitle").textContent = title;
  $("modalKicker").textContent = kicker;
  $("modalBody").innerHTML = body;
  $("modalFooter").innerHTML = footer || `<button data-close-modal>Done</button>`;
  $("modalBackdrop").hidden = false;
}

function closeModal() {
  $("modalBackdrop").hidden = true;
}

function detail(label, value) {
  return `<div class="detail"><span>${escapeHtml(label)}</span><strong>${escapeHtml(fmt(value))}</strong></div>`;
}

function profileModal() {
  openModal("Student profile", "Quick view", `
    <div class="detail-grid">
      ${detail("Name", student.full_name)}
      ${detail("Student ID", student.key)}
      ${detail("Program", cleanProgram(student.program))}
      ${detail("Status", student.student_type || student.enrollment_status)}
      ${detail("Phone", student.phone_number)}
      ${detail("Email", student.email)}
      ${detail("Mentor", mentorName(student))}
      ${detail("Risk", student.risk_flag)}
      ${detail("Hold", student.hold_reason)}
      ${detail("Aid", student.financial_aid_status)}
    </div>
    <div class="section-block"><div class="label">Note</div><p>${escapeHtml(student.student_notes)}</p></div>
  `);
  log("Student profile viewed");
}

function historyModal() {
  openModal("Handoff history", "From Sage", `
    <div class="detail-grid">
      ${detail("Verified", "Student ID and SMS code")}
      ${detail("Reason", "Financial hold may prevent registration")}
      ${detail("Balance", student.balance_due)}
      ${detail("Aid", `${student.financial_aid_status}, expected ${student.aid_disbursement_date}`)}
      ${detail("Payment email", "Sent")}
      ${detail("Sentiment", "Frustrated and overwhelmed")}
    </div>
  `);
  log("Handoff history viewed");
}

function paymentModal() {
  openModal("Payment info", "Financial", `
    <div class="detail-grid">
      ${detail("Balance", student.balance_due)}
      ${detail("Minimum", student.minimum_payment)}
      ${detail("Due date", student.payment_due_date)}
      ${detail("Reference", student.payment_reference_id)}
      ${detail("Options", student.payment_plan_options)}
      <div class="detail"><span>Portal</span><a href="${escapeHtml(student.payment_portal_url)}" target="_blank" rel="noreferrer">Open payment portal</a></div>
    </div>
  `, `<button data-close-modal>Close</button><button data-complete="payment-email">Email confirmed</button>`);
  log("Payment info opened");
}

function sfsModal() {
  openModal("SFS referral", "Prefilled", `
    <form class="form-grid" id="sfsForm">
      <label>Reason<input value="Financial hold may prevent registration" /></label>
      <label>Callback<input value="${escapeHtml(student.callback_number || student.phone_number)}" /></label>
      <label>Details<textarea>Balance ${student.balance_due}; hold reason ${student.hold_reason}; aid ${student.financial_aid_status}; student concerned about registration and payment amount.</textarea></label>
    </form>
  `, `<button data-close-modal>Cancel</button><button data-submit="sfs">Submit referral</button>`);
}

function courseModal() {
  openModal("Course progress", "Academic", `
    <div class="detail-grid">
      ${detail("Focus", student.current_course_focus || "Current course task")}
      ${detail("Risk", "Falling behind")}
      ${detail("Course support", "Use if content or assessment is blocker")}
      ${detail("Program mentor", "Use if pacing or term plan is blocker")}
      ${detail("Recent activity", student.last_action_taken)}
      ${detail("Recommended plan", "2 x 45 minute study blocks, 1 x 30 minute review")}
    </div>
  `, `<button data-close-modal>Close</button><button data-complete="course">Mark reviewed</button>`);
  log("Course progress viewed");
}

function mentorNoteModal() {
  openModal("Mentor note", "Academic", `
    <form class="form-grid" id="mentorNoteForm">
      <label>Note<textarea>${student.full_name} is working full-time as an RN and feels behind on ${student.current_course_focus || "current coursework"}. Student needs pacing support and a realistic short-term plan. Suggested: two 45 minute study blocks, one 30 minute review, and Monday afternoon follow-up.</textarea></label>
    </form>
  `, `<button data-close-modal>Cancel</button><button data-submit="mentor-note">Save note</button>`);
}

function scheduleModal() {
  openModal("Schedule follow-up", "Advisor", `
    <form class="form-grid" id="scheduleForm">
      <label>Owner<input value="${escapeHtml(mentorName(student))}" /></label>
      <label>Topic<input value="Financial hold and academic pacing" /></label>
      <label>Window<input value="${escapeHtml(student.preferred_follow_up_window || "Monday afternoon")}" /></label>
      <label>Channel<select><option>Phone</option><option>Email</option><option>SMS</option></select></label>
      <label>Callback<input value="${escapeHtml(student.callback_number || student.phone_number)}" /></label>
    </form>
  `, `<button data-close-modal>Cancel</button><button data-submit="schedule">Schedule</button>`);
}

function handleAction(action) {
  switch (action) {
    case "profile": return profileModal();
    case "history": return historyModal();
    case "payment": return paymentModal();
    case "sfs": return sfsModal();
    case "course": return courseModal();
    case "mentor-note": return mentorNoteModal();
    case "schedule": return scheduleModal();
    default: return;
  }
}

function complete(type) {
  if (type === "payment-email") {
    setChecked("paymentEmailConfirmed");
    log("Payment email confirmed");
    toast("Payment email confirmed");
  }
  if (type === "course") {
    setChecked("courseReviewed");
    log("Course progress reviewed");
    toast("Course progress reviewed");
  }
  closeModal();
}

function submit(type) {
  if (type === "sfs") {
    setChecked("sfsCreated");
    log("Student Financial Services referral created");
    toast("SFS referral created");
  }
  if (type === "mentor-note") {
    setChecked("mentorNoteAdded");
    log("Program Mentor note added");
    toast("Mentor note added");
  }
  if (type === "schedule") {
    setChecked("followupScheduled");
    log("Follow-up scheduled");
    toast("Follow-up scheduled");
  }
  closeModal();
}

async function init() {
  try {
    students = await loadStudents();
    const requestedId = readStudentId();
    currentId = requestedId || FALLBACK_ID;
    student = students[currentId];
    if (!student) {
      student = students[FALLBACK_ID];
      $("setupNotice").hidden = false;
      $("setupNotice").textContent = `No student found for ${requestedId}. Showing Charles demo record. Use ?StudentId=12345 or ?StudentId=941115.`;
    }
    renderStudent();
    log("Profile loaded");
  } catch (error) {
    $("setupNotice").hidden = false;
    $("setupNotice").textContent = "Unable to load data/students.json. Check the GitHub folder structure.";
    console.error(error);
  }
}

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) handleAction(actionButton.dataset.action);

  if (event.target.matches("[data-close-modal]")) closeModal();

  const completeButton = event.target.closest("[data-complete]");
  if (completeButton) complete(completeButton.dataset.complete);

  const submitButton = event.target.closest("[data-submit]");
  if (submitButton) submit(submitButton.dataset.submit);
});

$("summaryConfirmed").addEventListener("change", (event) => {
  if (event.target.checked) {
    log("Summary confirmed");
    toast("Summary confirmed");
  }
});

$("modalBackdrop").addEventListener("click", (event) => {
  if (event.target.id === "modalBackdrop") closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

init();
