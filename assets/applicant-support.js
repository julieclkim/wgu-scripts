const $ = (id) => document.getElementById(id);
const state = { applicants: {}, applicant: null };
const params = new URLSearchParams(location.search);
const applicantKey = ["ApplicantId","applicantId","applicant_id","key","email","id"].map(k => params.get(k)).find(Boolean);

function val(v, fallback="Not listed") { return v && String(v).trim() ? String(v).trim() : fallback; }
function splitItems(text) { return val(text, "").split(";").map(x => x.trim()).filter(Boolean); }
function now() { return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); }
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
  $("targetStart").textContent=val(a.target_start_date);
  $("state").textContent=val(a.state);
  $("status").textContent=val(a.application_status);
  $("email").textContent=val(a.email || a.key);
  $("phone").textContent=val(a.phone_number);
  $("lastActivity").textContent=val(a.last_activity_date);
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
      ${field("Name",a.full_name)}${field("Applicant ID",a.key)}${field("Program",a.intended_program)}${field("Stage",a.applicant_stage)}${field("Status",a.application_status)}${field("Target start",a.target_start_date)}${field("Last activity",a.last_activity_summary,"wide")}${field("Personalization",a.personalization_summary,"wide")}
    </div><div class="modal-actions"><button class="secondary" onclick="closeModal()">Close</button></div>`);
    addLog("Applicant record viewed");
  }
  if(type==="correct"){
    openModal(`<h2>Correct application detail</h2>
      <div class="form-row"><label>Correction type<select id="correctionType"><option>${val(a.issue_type,"Application correction")}</option><option>Program selection</option><option>Prior school or transcript source</option><option>Target start date</option><option>Contact information</option></select></label></div>
      <div class="form-row"><label>Current note<textarea>${val(a.reported_issue)}</textarea></label></div>
      <div class="form-row"><label>Correction summary<textarea>${val(a.requested_fix || a.next_best_step)}</textarea></label></div>
      <div class="modal-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="actionDone('Application correction submitted')">Submit correction</button></div>`);
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
