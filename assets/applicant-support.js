const $ = (id) => document.getElementById(id);
const state = { applicants: {}, applicant: null };
const params = new URLSearchParams(location.search);
const applicantKey = ["ApplicantId","applicantId","applicant_id","key","email","id"].map(k => params.get(k)).find(Boolean);

function val(v, fallback="Not listed") { return v && String(v).trim() ? String(v).trim() : fallback; }
function splitItems(text) { return val(text, "").split(";").map(x => x.trim()).filter(Boolean); }
function now() { return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); }
function addDays(date, days){ const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function addMonths(date, months){ const d = new Date(date); d.setMonth(d.getMonth() + months); return d; }
function formatDate(date){ return date.toLocaleDateString([], {month:"short", day:"numeric", year:"numeric"}); }
function stableOffset(seed, min, max){
  const text = String(seed || "applicant");
  let total = 0;
  for (let i = 0; i < text.length; i++) total += text.charCodeAt(i);
  return min + (total % (max - min + 1));
}
function dynamicTargetStart(a){
  // WGU start dates in this demo are month-start dates. Use the first day
  // of the next month that is at least 30 days away so the page stays current.
  const today = new Date();
  const threshold = addDays(today, 30);
  return formatDate(new Date(threshold.getFullYear(), threshold.getMonth() + 1, 1));
}
function dynamicRecentActivity(a){ return formatDate(addDays(new Date(), -stableOffset(a.key || a.email || a.full_name, 1, 3))); }
function addLog(text) { const li=document.createElement("li"); li.textContent=`${now()} ${text}`; $("activityLog").prepend(li); }
function firstName(name){ return val(name,"Applicant").split(" ")[0]; }

async function init(){
  try {
    const res = await fetch("data/applicants.json", {cache:"no-store"});
    state.applicants = await res.json();
    const key = applicantKey ? applicantKey.toLowerCase() : "maya.chen@example.com";
    state.applicant = state.applicants[key] || Object.values(state.applicants).find(a => String(a.full_name).toLowerCase() === key);
    if(!state.applicant){ $("missing").hidden=false; state.applicant=Object.values(state.applicants)[0]; }
    render(state.applicant);
    wire();
  } catch(e) { $("missing").hidden=false; console.error(e); }
}

function render(a){
  $("applicantName").textContent=val(a.full_name);
  $("stagePill").textContent=val(a.applicant_stage,"Application");
  $("priority").textContent=`${val(a.priority,"Medium")} priority`;
  $("applicantId").textContent=val(a.applicant_id || a.key);
  $("program").textContent=val(a.intended_program);
  $("degree").textContent=val(a.degree_level);
  $("targetStart").textContent=dynamicTargetStart(a);
  $("state").textContent=val(a.state);
  $("status").textContent=val(a.application_status);
  $("email").textContent=val(a.email || a.key);
  $("phone").textContent=val(a.phone_number);
  $("lastActivity").textContent=dynamicRecentActivity(a);
  $("issueType").textContent=val(a.issue_type,"Application correction");
  $("reportedIssue").textContent=val(a.reported_issue,"Applicant needs help correcting application information before continuing.");
  $("requestedFix").textContent=val(a.requested_fix || a.next_best_step);
  $("progress").textContent=`${val(a.application_percent_complete,"0")}% complete`;
  $("progressBar").style.width=`${Number(a.application_percent_complete || 0)}%`;
  $("transcripts").textContent=val(a.transcript_status);
  $("fafsa").textContent=val(a.fafsa_status);
  renderList("completedList", splitItems(a.completed_items));
  renderList("missingList", splitItems(a.missing_items));
  addLog("Applicant profile loaded");
}
function renderList(id, items){ const el=$(id); el.innerHTML=""; (items.length?items:["No items listed"]).forEach(i=>{ const li=document.createElement("li"); li.textContent=i; el.appendChild(li); }); }

function wire(){
  document.querySelectorAll("[data-action]").forEach(btn => btn.addEventListener("click", () => openAction(btn.dataset.action)));
  $("closeModal").addEventListener("click", closeModal);
  $("modal").addEventListener("click", e => { if(e.target.id === "modal") closeModal(); });
  document.addEventListener("keydown", e => { if(e.key === "Escape") closeModal(); });
}
function openModal(html){ $("modalContent").innerHTML=html; $("modal").hidden=false; }
function closeModal(){ $("modal").hidden=true; $("modalContent").innerHTML=""; }
function actionDone(text){ addLog(text); closeModal(); }

function openAction(type){
  const a=state.applicant;
  if(type==="record"){
    openModal(`<h2>Applicant record</h2><div class="modal-grid">
      ${field("Name",a.full_name)}${field("Applicant ID",a.key)}${field("Program",a.intended_program)}${field("Stage",a.applicant_stage)}${field("Status",a.application_status)}${field("Target start",dynamicTargetStart(a))}${field("Last activity",dynamicRecentActivity(a))}${field("Summary",a.last_activity_summary,"wide")}
    </div><div class="modal-actions"><button class="secondary" onclick="closeModal()">Close</button></div>`);
    addLog("Applicant record viewed");
  }
  if(type==="correct"){
    openModal(`<h2>Correct application detail</h2>
      <div class="form-row"><label>Correction type<select id="correctionType" onchange="handleCorrectionChange(this.value)"><option value="">Select correction type</option><option value="name">Correct name</option><option value="program">Program selection</option><option value="school">Prior school or transcript source</option><option value="contact">Contact information</option></select></label></div>
      <section id="nameCorrectionPanel" class="success-panel" hidden>
        <h3>Correct name</h3>
        <p>Applicant accidentally used maiden name on the application and needs to update to the new legal last name.</p>
        <div class="form-row"><label>Current application name<input value="${val(a.maiden_name || a.full_name)}" /></label></div>
        <div class="form-row"><label>Corrected legal name<input value="${val(a.corrected_legal_name || a.full_name)}" /></label></div>
        <div class="form-row"><label>Internal note<textarea>Applicant reported using maiden name on the application. Confirmed correction request to update to new legal last name before enrollment file review continues.</textarea></label></div>
      </section>
      <section id="otherCorrectionPanel" class="hint-panel" hidden>
        Select Correct name for this demo scenario.
      </section>
      <div id="correctionSuccess" class="done-banner" hidden>Done. Application correction submitted.</div>
      <div class="modal-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="submitCorrection()">Submit correction</button></div>`);
  }
  if(type==="note"){
    openModal(`<h2>Add enrollment note</h2>
      <div class="form-row"><label>Note<textarea>${firstName(a.full_name)} was transferred for help with an application correction. Issue: ${val(a.reported_issue)} Next step: ${val(a.requested_fix || a.next_best_step)}</textarea></label></div>
      <div class="modal-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="actionDone('Enrollment note added')">Save note</button></div>`);
  }
  if(type==="instructions"){
    openModal(`<h2>Send next-step instructions</h2>
      <div class="modal-field"><span>To</span><strong>${val(a.email || a.key)}</strong></div>
      <div class="form-row"><label>Message<textarea>Hi ${firstName(a.full_name)}, thanks for speaking with WGU today. We reviewed your application and the correction needed: ${val(a.requested_fix || a.next_best_step)}. Please check your applicant portal and watch for any follow-up from your enrollment counselor.</textarea></label></div>
      <div class="modal-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="actionDone('Next-step instructions sent')">Send</button></div>`);
  }
  if(type==="callback"){
    openModal(`<h2>Schedule counselor follow-up</h2>
      <div class="modal-grid">${field("Applicant",a.full_name)}${field("Program",a.intended_program)}${field("Topic",a.issue_type)}${field("Contact",a.email || a.key)}</div>
      <div class="form-row"><label>Follow-up date<input type="date" value="2026-06-13"></label></div>
      <div class="form-row"><label>Notes<textarea>Follow up on application correction. ${val(a.requested_fix || a.next_best_step)}</textarea></label></div>
      <div class="modal-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="actionDone('Counselor follow-up scheduled')">Schedule</button></div>`);
  }
}
function field(label, value){ return `<div class="modal-field"><span>${label}</span><strong>${val(value)}</strong></div>`; }
window.closeModal=closeModal; window.actionDone=actionDone;
init();

function handleCorrectionChange(value){
  const namePanel = $("nameCorrectionPanel");
  const otherPanel = $("otherCorrectionPanel");
  if(!namePanel || !otherPanel) return;
  namePanel.hidden = value !== "name";
  otherPanel.hidden = !value || value === "name";
}
function submitCorrection(){
  const selected = $("correctionType") ? $("correctionType").value : "";
  if(selected !== "name"){
    handleCorrectionChange(selected || "other");
    return;
  }
  const banner = $("correctionSuccess");
  if(banner) banner.hidden = false;
  addLog("Name corrected");
}
window.handleCorrectionChange=handleCorrectionChange; window.submitCorrection=submitCorrection;
