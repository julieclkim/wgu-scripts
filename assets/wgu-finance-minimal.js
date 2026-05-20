(() => {
  const EMAIL_CONFIG = {
    fromAddress_email: "info@mail.gcgovsc12.org",
    fromAddress_name: "WGU Student Financial Services",
    replyToAddress_email: "julie-uni@genesyssc12.mypurecloud.com",
    replyToAddress_name: "WGU Student Financial Services"
  };

  const state = {
    students: {},
    student: null,
    studentId: null,
    lastEmailRequest: null
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function moneyNumber(value) {
    const cleaned = String(value ?? "0").replace(/[^0-9.-]/g, "");
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function normalizeBool(value) {
    return String(value ?? "").trim().toLowerCase() === "true" || String(value ?? "").trim().toLowerCase() === "yes";
  }

  function getStudentIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const aliases = ["StudentId", "studentId", "student_id", "studentID", "key", "id"];
    for (const alias of aliases) {
      const value = params.get(alias);
      if (value && !value.includes("{{") && !value.includes("}}")) {
        return value.trim();
      }
    }
    return "";
  }

  function addMonths(date, months) {
    const next = new Date(date.getTime());
    next.setMonth(next.getMonth() + months);
    return next;
  }

  function parseFlexibleDate(value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    return new Date();
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function splitAmount(amount, count) {
    const totalCents = Math.round(amount * 100);
    const base = Math.floor(totalCents / count);
    let remainder = totalCents - base * count;
    return Array.from({ length: count }, () => {
      const cents = base + (remainder > 0 ? 1 : 0);
      remainder -= remainder > 0 ? 1 : 0;
      return cents / 100;
    });
  }

  function getPlanRows(count) {
    const s = state.student;
    const amount = moneyNumber(s.balance_due);
    const startDate = parseFlexibleDate(s.payment_due_date);
    return splitAmount(amount, count).map((paymentAmount, index) => ({
      payment: index + 1,
      dueDate: formatDate(addMonths(startDate, index)),
      amount: formatMoney(paymentAmount)
    }));
  }

  function getFirstName() {
    return String(state.student.full_name || "Student").split(" ")[0] || "Student";
  }

  function accountHoldDisplay(student) {
    if (!normalizeBool(student.account_hold_flag)) return "No hold";
    return student.hold_reason || "Account hold";
  }

  function bindStudent(student) {
    const mentor = student.assigned_program_mentor || student.assigned_enrollment_counselor || "Not assigned";
    const values = {
      ...student,
      mentorName: mentor,
      contactReason: "Financial hold may prevent registration.",
      account_hold_display: accountHoldDisplay(student),
      payment_plan_available_display: normalizeBool(student.payment_plan_available) ? "Available" : "Not eligible"
    };

    $$('[data-bind]').forEach((el) => {
      const key = el.dataset.bind;
      el.textContent = values[key] ?? "-";
    });

    document.title = `${student.full_name} | WGU Student Support`;
  }

  function logActivity(text) {
    const list = $("#activityLog");
    const item = document.createElement("li");
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date());
    item.textContent = `${time} ${text}`;
    list.prepend(item);
  }

  function setWarning(message) {
    const warning = $("#setupWarning");
    warning.textContent = message;
    warning.hidden = false;
  }

  function clearWarning() {
    const warning = $("#setupWarning");
    warning.hidden = true;
    warning.textContent = "";
  }

  function activateTab(tabId) {
    $$(".tab").forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.tabTarget === tabId);
    });
    $$(".tab-panel").forEach((panel) => {
      const active = panel.id === tabId;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  }

  function buildPlanTable(title, rows) {
    return `
      <h3>${escapeHtml(title)}</h3>
      <table class="plan-table">
        <thead><tr><th>Payment</th><th>Due date</th><th>Amount</th></tr></thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${row.payment}</td>
              <td>${escapeHtml(row.dueDate)}</td>
              <td>${escapeHtml(row.amount)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  function renderPaymentPlanEmailHtml(student) {
    const plan3 = getPlanRows(3);
    const plan4 = getPlanRows(4);
    const firstName = getFirstName();
    const portal = student.payment_portal_url || "https://my.wgu.edu/";
    const rowsToHtml = (rows) => rows.map((row) => `
      <tr>
        <td style="padding:8px;border:1px solid #d9e1ea;">${row.payment}</td>
        <td style="padding:8px;border:1px solid #d9e1ea;">${escapeHtml(row.dueDate)}</td>
        <td style="padding:8px;border:1px solid #d9e1ea;">${escapeHtml(row.amount)}</td>
      </tr>`).join("");

    return `
<div style="font-family:Arial,sans-serif;color:#172033;line-height:1.45;max-width:680px;margin:0 auto;border:1px solid #d9e1ea;border-radius:16px;overflow:hidden;">
  <div style="background:#082f49;color:#ffffff;padding:20px 24px;">
    <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#b9d5e8;">Western Governors University</div>
    <h1 style="font-size:22px;margin:8px 0 0;">Payment plan options</h1>
  </div>
  <div style="padding:22px 24px;">
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Here are sample payment plan options for your current WGU account balance.</p>
    <table style="width:100%;border-collapse:collapse;margin:14px 0;">
      <tr><td style="padding:8px;border:1px solid #d9e1ea;background:#f4f7fb;"><strong>Student ID</strong></td><td style="padding:8px;border:1px solid #d9e1ea;">${escapeHtml(student.key)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #d9e1ea;background:#f4f7fb;"><strong>Current balance</strong></td><td style="padding:8px;border:1px solid #d9e1ea;">${escapeHtml(student.balance_due)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #d9e1ea;background:#f4f7fb;"><strong>Financial aid status</strong></td><td style="padding:8px;border:1px solid #d9e1ea;">${escapeHtml(student.financial_aid_status)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #d9e1ea;background:#f4f7fb;"><strong>Expected disbursement</strong></td><td style="padding:8px;border:1px solid #d9e1ea;">${escapeHtml(student.aid_disbursement_date)}</td></tr>
    </table>

    <h2 style="font-size:18px;margin:20px 0 8px;">3-payment option</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><th style="padding:8px;border:1px solid #d9e1ea;background:#eef3f8;text-align:left;">Payment</th><th style="padding:8px;border:1px solid #d9e1ea;background:#eef3f8;text-align:left;">Due date</th><th style="padding:8px;border:1px solid #d9e1ea;background:#eef3f8;text-align:left;">Amount</th></tr>
      ${rowsToHtml(plan3)}
    </table>

    <h2 style="font-size:18px;margin:20px 0 8px;">4-payment option</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><th style="padding:8px;border:1px solid #d9e1ea;background:#eef3f8;text-align:left;">Payment</th><th style="padding:8px;border:1px solid #d9e1ea;background:#eef3f8;text-align:left;">Due date</th><th style="padding:8px;border:1px solid #d9e1ea;background:#eef3f8;text-align:left;">Amount</th></tr>
      ${rowsToHtml(plan4)}
    </table>

    <p style="font-size:13px;color:#536277;margin-top:18px;">Final eligibility, enrollment fee, payment method, and due dates are confirmed in the student portal by Student Financial Services.</p>
    <p><a href="${escapeHtml(portal)}" style="display:inline-block;background:#082f49;color:#ffffff;text-decoration:none;border-radius:10px;padding:11px 16px;font-weight:bold;">Open WGU student portal</a></p>
  </div>
</div>`;
  }

  function buildPaymentPlanEmailRequest() {
    const s = state.student;
    const subject = `WGU payment plan options for account ${s.payment_reference_id || s.key}`;
    const htmlBody = renderPaymentPlanEmailHtml(s);
    const plan3 = getPlanRows(3);
    const plan4 = getPlanRows(4);
    const planText = [
      "3-payment option:",
      ...plan3.map((row) => `Payment ${row.payment}: ${row.amount} due ${row.dueDate}`),
      "",
      "4-payment option:",
      ...plan4.map((row) => `Payment ${row.payment}: ${row.amount} due ${row.dueDate}`)
    ].join("\n");

    const messageText = [
      `Hi ${getFirstName()},`,
      "",
      "Here are payment plan options based on the current balance shown on your WGU account.",
      "",
      `Student ID: ${s.key}`,
      `Current balance: ${s.balance_due}`,
      `Financial aid status: ${s.financial_aid_status}`,
      `Expected disbursement: ${s.aid_disbursement_date}`,
      `Payment reference: ${s.payment_reference_id || s.key}`,
      "",
      planText,
      "",
      "Final eligibility, enrollment fee, payment method, and due dates are confirmed in the student portal by Student Financial Services.",
      `Student portal: ${s.payment_portal_url || "https://my.wgu.edu/"}`
    ].join("\n");

    const formSubmitPayload = {
      name: EMAIL_CONFIG.fromAddress_name,
      email: EMAIL_CONFIG.replyToAddress_email,
      _replyto: EMAIL_CONFIG.replyToAddress_email,
      _subject: subject,
      _template: "table",
      _captcha: "false",
      "Student name": s.full_name,
      "Student ID": s.key,
      "Program": s.program,
      "Current balance": s.balance_due,
      "Financial aid status": s.financial_aid_status,
      "Expected aid date": s.aid_disbursement_date,
      "Payment reference": s.payment_reference_id || s.key,
      "3-payment option": plan3.map((row) => `Payment ${row.payment}: ${row.amount} due ${row.dueDate}`).join(" | "),
      "4-payment option": plan4.map((row) => `Payment ${row.payment}: ${row.amount} due ${row.dueDate}`).join(" | "),
      "Advisor note": "Payment plan options shared for student review. Final eligibility and dates are confirmed in the student portal.",
      message: messageText
    };

    return {
      eventType: "WGU_PAYMENT_PLAN_EMAIL",
      provider: "Demo email",
      endpoint: "demo-only",
      inputs: {
        fromAddress_email: EMAIL_CONFIG.fromAddress_email,
        fromAddress_name: EMAIL_CONFIG.fromAddress_name,
        toAddress_email: s.email,
        toAddress_name: s.full_name,
        replyToAddress_email: EMAIL_CONFIG.replyToAddress_email,
        replyToAddress_name: EMAIL_CONFIG.replyToAddress_name,
        subject,
        htmlBody,
        messageText
      },
      formSubmitPayload,
      student: {
        key: s.key,
        full_name: s.full_name,
        email: s.email,
        balance_due: s.balance_due,
        payment_reference_id: s.payment_reference_id
      }
    };
  }

  function openModal(html, onOpen) {
    const backdrop = $("#modalBackdrop");
    const content = $("#modalContent");
    content.innerHTML = html;
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $(".modal-close")?.focus(), 0);
    if (typeof onOpen === "function") onOpen(content);
  }

  function closeModal() {
    const backdrop = $("#modalBackdrop");
    backdrop.hidden = true;
    $("#modalContent").innerHTML = "";
    document.body.style.overflow = "";
  }

  function modalHeader(title, subtitle = "") {
    return `
      <div class="modal-body">
        <h2 id="modalTitle">${escapeHtml(title)}</h2>
        ${subtitle ? `<p class="modal-subtitle">${escapeHtml(subtitle)}</p>` : ""}
    `;
  }

  function showPaymentPlans() {
    const s = state.student;
    const html = `
      ${modalHeader("Eligible payment plans", `${s.balance_due} balance · ${s.payment_reference_id || s.key}`)}
        <div class="notice">Plan estimates are based on the balance currently shown in this demo record. Student Financial Services confirms eligibility, fees, and final dates.</div>
        ${buildPlanTable("3-payment option", getPlanRows(3))}
        ${buildPlanTable("4-payment option", getPlanRows(4))}
        <div class="button-row">
          <button class="primary-btn" type="button" data-action="sendPlanEmail">Send Payment Plan Link</button>
          <button class="secondary-btn" type="button" data-close-modal>Close</button>
        </div>
      </div>
    `;
    openModal(html);
    logActivity("Payment plan options viewed");
  }

  function showOpenAccount() {
    const s = state.student;
    const html = `
      ${modalHeader("Student account", "Account details available to the advisor during the interaction.")}
        <div class="modal-grid">
          <div class="modal-field"><span>Reference</span><strong>${escapeHtml(s.payment_reference_id || s.key)}</strong></div>
          <div class="modal-field"><span>Balance</span><strong>${escapeHtml(s.balance_due)}</strong></div>
          <div class="modal-field"><span>Hold reason</span><strong>${escapeHtml(accountHoldDisplay(s))}</strong></div>
          <div class="modal-field"><span>Payment plan</span><strong>${normalizeBool(s.payment_plan_available) ? "Available" : "Not eligible"}</strong></div>
          <div class="modal-field"><span>Due date</span><strong>${escapeHtml(s.payment_due_date || "-")}</strong></div>
          <div class="modal-field"><span>Portal</span><strong>${escapeHtml(s.payment_portal_url || "https://my.wgu.edu/")}</strong></div>
        </div>
        <div class="button-row">
          <button class="primary-btn" type="button" data-action="openPortalUrl">Open portal</button>
          <button class="secondary-btn" type="button" data-close-modal>Close</button>
        </div>
      </div>
    `;
    openModal(html);
    logActivity("Student account opened");
  }

  function showCreateSfs() {
    const s = state.student;
    const html = `
      ${modalHeader("Financial Services follow-up", "Review and submit a follow-up request.")}
        <form id="sfsForm" class="form-stack">
          <label>Reason
            <input value="Financial hold and payment plan review" />
          </label>
          <label>Callback number
            <input value="${escapeHtml(s.callback_number || s.phone_number || "")}" />
          </label>
          <label>Notes
            <textarea>Student has ${escapeHtml(s.balance_due)} balance, ${escapeHtml(accountHoldDisplay(s))}, aid status ${escapeHtml(s.financial_aid_status)}, and payment plan available. Student is concerned about registration impact.</textarea>
          </label>
          <div class="button-row">
            <button class="primary-btn" type="submit">Create follow-up</button>
            <button class="secondary-btn" type="button" data-close-modal>Cancel</button>
          </div>
        </form>
      </div>
    `;
    openModal(html, (root) => {
      $("#sfsForm", root).addEventListener("submit", (event) => {
        event.preventDefault();
        logActivity("Financial Services follow-up created");
        closeModal();
      });
    });
  }

  function showTransferTier2() {
    const s = state.student;
    const html = `
      ${modalHeader("Transfer to Tier II / Specialist", "Select the specialist queue and share account context.")}
        <form id="transferForm" class="form-stack">
          <label>Queue
            <select>
              <option>Student Financial Services Tier II</option>
              <option>Financial Aid Specialist</option>
              <option>Payment Plan Support</option>
            </select>
          </label>
          <label>Transfer context
            <textarea>${escapeHtml(s.full_name)} has a ${escapeHtml(s.balance_due)} balance, ${escapeHtml(accountHoldDisplay(s))}, and ${escapeHtml(s.financial_aid_status)} aid status. Payment plan is marked ${normalizeBool(s.payment_plan_available) ? "available" : "not eligible"}.</textarea>
          </label>
          <div class="button-row">
            <button class="primary-btn" type="submit">Start transfer</button>
            <button class="secondary-btn" type="button" data-close-modal>Cancel</button>
          </div>
        </form>
      </div>
    `;
    openModal(html, (root) => {
      $("#transferForm", root).addEventListener("submit", (event) => {
        event.preventDefault();
        logActivity("Tier II transfer initiated");
        closeModal();
      });
    });
  }

  async function sendPaymentPlanEmail(request) {
    state.lastEmailRequest = request;
    window.dispatchEvent(new CustomEvent("wgu:paymentPlanEmailSent", { detail: request }));

    return {
      status: "success",
      demoOnly: true,
      message: "Payment plan email marked as sent for this demo."
    };
  }

  function showSendPlanEmail() {
    const s = state.student;
    const request = buildPaymentPlanEmailRequest();
    const emailPreview = request.inputs.htmlBody;
    const messageText = request.inputs.messageText;

    const html = `
      ${modalHeader("Send payment plan email", `To ${s.full_name} · ${s.email}`)}
        <div class="modal-grid" style="margin:12px 0;">
          <div class="modal-field"><span>Recipient</span><strong>${escapeHtml(s.email)}</strong></div>
          <div class="modal-field"><span>Subject</span><strong>${escapeHtml(request.inputs.subject)}</strong></div>
          <div class="modal-field"><span>Balance</span><strong>${escapeHtml(s.balance_due)}</strong></div>
          <div class="modal-field"><span>Reference</span><strong>${escapeHtml(s.payment_reference_id || s.key)}</strong></div>
        </div>
        <div class="email-preview" aria-label="Payment plan email preview">${emailPreview}</div>
        <details style="margin-top:12px;">
          <summary>View plain-text email details</summary>
          <textarea class="message-code" readonly>${escapeHtml(messageText)}</textarea>
        </details>
        <div class="button-row">
          <button class="primary-btn" type="button" id="sendEmailActionButton">Send email</button>
          <button class="secondary-btn" type="button" data-close-modal>Cancel</button>
        </div>
        <div id="sendEmailStatus" class="notice" style="margin-top:12px;" hidden></div>
      </div>
    `;

    openModal(html, (root) => {
      $("#sendEmailActionButton", root).addEventListener("click", async () => {
        const status = $("#sendEmailStatus", root);
        const button = $("#sendEmailActionButton", root);
        status.hidden = false;
        status.textContent = "Sending payment plan email...";
        button.disabled = true;
        await sendPaymentPlanEmail(request);
        status.textContent = "Success. Payment plan email sent.";
        button.textContent = "Sent";
        logActivity("Payment plan email sent");
      });
    });
  }


  function currentStudentId() {
    return encodeURIComponent(state.student?.key || state.studentId || "12345");
  }

  function openSchedulePage() {
    window.location.href = `schedule-script.html?StudentId=${currentStudentId()}`;
  }

  function openFinancialPage() {
    window.location.href = `financial-script.html?StudentId=${currentStudentId()}`;
  }

  function updatePageLinks() {
    const id = currentStudentId();
    const backLink = document.querySelector("#backToProfile");
    if (backLink) backLink.href = `agent-script.html?StudentId=${id}`;
  }

  function handleAction(action) {
    switch (action) {
      case "viewPlans":
        showPaymentPlans();
        break;
      case "sendPlanEmail":
        showSendPlanEmail();
        break;
      case "openAccount":
        showOpenAccount();
        break;
      case "createSfs":
        showCreateSfs();
        break;
      case "scheduleAdvisor":
        openSchedulePage();
        break;
      case "openFinancial":
        openFinancialPage();
        break;
      case "transferTier2":
        showTransferTier2();
        break;
      case "openPortalUrl":
        window.open(state.student.payment_portal_url || "https://my.wgu.edu/", "_blank", "noopener,noreferrer");
        logActivity("Student portal opened");
        break;
      default:
        break;
    }
  }

  function wireEvents() {
    $$("[data-tab-target]").forEach((button) => {
      button.addEventListener("click", () => activateTab(button.dataset.tabTarget));
    });

    document.addEventListener("click", (event) => {
      const actionEl = event.target.closest("[data-action]");
      if (actionEl) {
        handleAction(actionEl.dataset.action);
      }
      if (event.target.closest("[data-close-modal]")) {
        closeModal();
      }
    });

    $("#modalBackdrop").addEventListener("click", (event) => {
      if (event.target.id === "modalBackdrop") closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !$("#modalBackdrop").hidden) closeModal();
    });
  }

  async function init() {
    wireEvents();

    try {
      const response = await fetch("data/students.json", { cache: "no-store" });
      state.students = await response.json();
    } catch (error) {
      setWarning("Unable to load data/students.json. Check that the data folder was uploaded to GitHub Pages.");
      return;
    }

    const requestedId = getStudentIdFromUrl();
    state.studentId = requestedId || "12345";
    state.student = state.students[state.studentId] || state.students["12345"];

    if (!requestedId) {
      setWarning("No StudentId was passed in the URL. Showing default demo student 12345.");
    } else if (!state.students[requestedId]) {
      setWarning(`StudentId ${requestedId} was not found in data/students.json. Showing default demo student 12345.`);
    } else {
      clearWarning();
    }

    bindStudent(state.student);
    updatePageLinks();
    logActivity("Profile loaded");

    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "financial") activateTab("financial");

    const modal = params.get("modal");
    if (modal === "plans") {
      setTimeout(showPaymentPlans, 200);
    } else if (modal === "email") {
      setTimeout(showSendPlanEmail, 200);
    }
  }

  init();
})();
