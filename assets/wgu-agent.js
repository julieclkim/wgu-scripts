(function () {
  'use strict';

  const DEFAULT_ID = '12345';
  const FALLBACK = {
    key: '12345',
    full_name: 'Charles Spencer',
    program: 'Nursing (RN to BSN)',
    student_type: 'Active',
    phone_number: '+16054311804',
    email: 'julie.genesys.test@gmail.com',
    balance_due: '$1600',
    financial_aid_status: 'Pending Disbursement',
    aid_disbursement_date: 'May 28, 2026',
    account_hold_flag: 'True',
    hold_reason: 'Overdue balance',
    payment_plan_available: 'True',
    payment_plan_email_sent: 'Yes',
    minimum_payment: '$65.90',
    payment_due_date: 'May 22, 2026',
    payment_reference_id: 'WGU-12345',
    assigned_program_mentor: 'Carla Espinosa',
    current_course_focus: 'Evidence-Based Practice task',
    student_notes: 'Working full-time as an RN while completing the RN to BSN program; concerned about a financial hold affecting registration and feeling behind on an evidence-based practice task.',
    risk_flag: 'Registration Delay Risk',
    preferred_follow_up_window: 'Monday afternoon',
    payment_portal_url: 'https://my.wgu.edu/',
    callback_number: '+16054311804'
  };

  let student = FALLBACK;
  let studentLookupStatus = 'default';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function getStudentId() {
    const params = new URLSearchParams(window.location.search);
    const aliases = ['StudentId', 'studentId', 'student_id', 'studentID', 'key', 'id'];
    for (const alias of aliases) {
      const value = params.get(alias);
      if (value && !value.includes('{{')) return value.trim();
    }
    return DEFAULT_ID;
  }

  function formatMoney(value) {
    const raw = String(value || '').trim();
    const numeric = Number(raw.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(numeric)) return raw || '$0';
    return numeric.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: numeric % 1 === 0 ? 0 : 2
    });
  }

  function yesNo(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (['true', 'yes', 'y', 'available'].includes(normalized)) return 'Available';
    if (['false', 'no', 'n', 'not available'].includes(normalized)) return 'Not available';
    return value || 'N/A';
  }

  function firstName() {
    return String(student.full_name || 'Charles').split(' ')[0] || 'Charles';
  }

  function mentorName() {
    return student.assigned_program_mentor || student.assigned_enrollment_counselor || 'Program Mentor';
  }

  function setText(id, value) {
    const node = $(id);
    if (node) node.textContent = value;
  }

  async function loadStudent() {
    const requestedId = getStudentId();
    try {
      const response = await fetch('data/students.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load students.json');
      const data = await response.json();
      if (data[requestedId]) {
        student = data[requestedId];
        studentLookupStatus = 'matched';
      } else {
        student = data[DEFAULT_ID] || FALLBACK;
        studentLookupStatus = requestedId === DEFAULT_ID ? 'default' : 'not-found';
      }
    } catch (error) {
      student = FALLBACK;
      studentLookupStatus = 'error';
      console.warn(error);
    }
    render();
    seedLog();
  }

  function render() {
    const studentId = student.key || DEFAULT_ID;
    const balance = formatMoney(student.balance_due);
    const program = student.program || 'Nursing (RN to BSN)';
    const compactProgram = program.replace('Nursing (', '').replace(')', '') || program;

    setText('#studentNameHeader', student.full_name || 'Charles Spencer');
    setText('#programChip', compactProgram);
    setText('#riskChip', student.risk_flag || 'Registration risk');
    setText('#studentName', student.full_name || 'Charles Spencer');
    setText('#studentMeta', `ID ${studentId} | ${program}`);
    setText('#mentorName', mentorName());
    setText('#phoneNumber', student.phone_number || student.callback_number || 'N/A');
    setText('#emailAddress', student.email || 'N/A');
    setText('#contactReason', 'Financial hold may prevent registration.');
    setText('#balanceDue', balance);
    setText('#holdReason', student.hold_reason || 'Overdue balance');
    setText('#aidStatus', student.financial_aid_status || 'Pending Disbursement');
    setText('#aidDate', student.aid_disbursement_date || 'May 28, 2026');
    setText('#paymentPlan', yesNo(student.payment_plan_available));
    setText('#minimumPayment', student.minimum_payment || 'N/A');

    const pressureList = $('#pressureList');
    if (pressureList) {
      pressureList.innerHTML = `
        <li>Working full-time as an RN</li>
        <li>Behind on ${escapeHtml(student.current_course_focus || 'current coursework')}</li>
        <li>Worried about registration</li>
      `;
    }

    const opener = $('#openerText');
    if (opener) {
      opener.textContent = `Hi ${firstName()}, Sage handed me the notes, so you do not need to start over. I see this is about the hold, the payment plan email, and staying on track while working full time. Did I get that right?`;
    }

    const notice = $('#setupNotice');
    if (notice) {
      if (studentLookupStatus === 'not-found') {
        notice.hidden = false;
        notice.textContent = 'Demo fallback: StudentId was not found, so Charles Spencer was loaded.';
      } else if (studentLookupStatus === 'error') {
        notice.hidden = false;
        notice.textContent = 'Demo fallback: data/students.json could not be loaded, so Charles Spencer was loaded.';
      } else {
        notice.hidden = true;
      }
    }
  }

  function seedLog() {
    const log = $('#activityLog');
    if (!log) return;
    log.innerHTML = '';
    addLog('Advisor script opened', false);
    addLog('Sage handoff loaded', false);
  }

  function timeNow() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function addLog(message, show = true) {
    const log = $('#activityLog');
    if (!log) return;
    const item = document.createElement('li');
    const time = document.createElement('time');
    const text = document.createElement('span');
    time.textContent = timeNow();
    text.textContent = message;
    item.append(time, text);
    log.prepend(item);
    if (show) toast(message);
  }

  function toast(message) {
    const node = $('#toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => node.classList.remove('show'), 1800);
  }

  function check(id) {
    const box = $(`#${id}`);
    if (box) box.checked = true;
  }

  function closeModal() {
    const backdrop = $('#modalBackdrop');
    if (backdrop) backdrop.hidden = true;
  }

  function openModal({ kicker, title, body, footer }) {
    $('#modalKicker').textContent = kicker || 'Demo action';
    $('#modalTitle').textContent = title || 'Action';
    $('#modalBody').innerHTML = body || '';
    $('#modalFooter').innerHTML = footer || '<button class="secondary" data-close-modal>Close</button>';
    $('#modalBackdrop').hidden = false;
    attachModalHandlers();
  }

  function attachModalHandlers() {
    $$('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));
    $$('[data-submit-action]').forEach((button) => button.addEventListener('click', handleModalSubmit));
  }

  function kv(rows) {
    return rows.map(([label, value]) => `
      <div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || 'N/A')}</dd></div>
    `).join('');
  }

  function row(label, control) {
    return `<label class="form-row"><span>${escapeHtml(label)}</span>${control}</label>`;
  }

  function profileModal() {
    addLog('Student profile viewed');
    openModal({
      kicker: 'Student profile',
      title: student.full_name || 'Student profile',
      body: `
        <div class="info-grid">
          <div class="info-box">
            <h3>Student</h3>
            <dl class="kv">${kv([
              ['Student ID', student.key],
              ['Program', student.program],
              ['Status', student.student_type || student.enrollment_status],
              ['Mentor', mentorName()],
              ['Risk', student.risk_flag]
            ])}</dl>
          </div>
          <div class="info-box">
            <h3>Contact</h3>
            <dl class="kv">${kv([
              ['Phone', student.phone_number],
              ['Email', student.email],
              ['Callback', student.callback_number],
              ['Follow-up', student.preferred_follow_up_window]
            ])}</dl>
          </div>
        </div>
        <div class="info-box" style="margin-top:10px">
          <h3>Advisor note</h3>
          <p>${escapeHtml(student.student_notes || '')}</p>
        </div>
      `
    });
  }

  function historyModal() {
    addLog('Handoff history viewed');
    openModal({
      kicker: 'Sage handoff',
      title: 'Prior conversation summary',
      body: `
        <ul class="plain-list">
          <li>Identity verified with student ID and SMS code.</li>
          <li>Financial hold discussed, ${escapeHtml(formatMoney(student.balance_due))} balance.</li>
          <li>Payment plan email sent.</li>
          <li>Aid status: ${escapeHtml(student.financial_aid_status || 'Pending Disbursement')}.</li>
          <li>Student feels behind while working full time.</li>
        </ul>
      `
    });
  }

  function paymentModal() {
    addLog('Payment portal opened');
    check('emailConfirmed');
    openModal({
      kicker: 'Payment information',
      title: 'Payment details',
      body: `
        <div class="info-grid">
          <div class="info-box">
            <h3>Balance</h3>
            <dl class="kv">${kv([
              ['Balance due', formatMoney(student.balance_due)],
              ['Minimum payment', student.minimum_payment],
              ['Due date', student.payment_due_date],
              ['Reference', student.payment_reference_id]
            ])}</dl>
          </div>
          <div class="info-box">
            <h3>Options</h3>
            <p>${escapeHtml(student.payment_plan_options || 'Monthly plan, one-time payment, employer reimbursement documentation')}</p>
            <a class="portal-link" href="${escapeHtml(student.payment_portal_url || 'https://my.wgu.edu/')}" target="_blank" rel="noreferrer">Open WGU portal</a>
          </div>
        </div>
      `
    });
  }

  function sfsReferralModal() {
    openModal({
      kicker: 'Student Financial Services',
      title: 'Create SFS referral',
      body: `
        <div class="form-grid">
          ${row('Student', `<input value="${escapeHtml(student.full_name || '')}" />`)}
          ${row('Callback', `<input value="${escapeHtml(student.callback_number || student.phone_number || '')}" />`)}
          ${row('Reason', '<select><option>Financial hold and registration risk</option><option>Payment plan question</option><option>Aid disbursement timing</option></select>')}
          ${row('Balance', `<input value="${escapeHtml(formatMoney(student.balance_due))}" />`)}
          ${row('Aid status', `<input value="${escapeHtml(student.financial_aid_status || '')}" />`)}
          ${row('Hold reason', `<input value="${escapeHtml(student.hold_reason || '')}" />`)}
          ${row('Advisor note', `<textarea>Student is concerned the financial hold may affect registration. Payment plan email was sent. Please review balance, aid timing, and available options.</textarea>`)}
        </div>
      `,
      footer: '<button class="secondary" data-close-modal>Cancel</button><button data-submit-action="sfs">Submit referral</button>'
    });
  }

  function courseProgressModal() {
    addLog('Course progress viewed');
    check('courseReviewed');
    openModal({
      kicker: 'Academic progress',
      title: 'Course progress',
      body: `
        <div class="info-grid">
          <div class="info-box">
            <h3>Current focus</h3>
            <dl class="kv">${kv([
              ['Course focus', student.current_course_focus || 'Current course task'],
              ['Status', 'Behind target'],
              ['Risk', student.risk_flag || 'Registration risk'],
              ['Recent activity', student.last_action_taken || 'Course activity reviewed']
            ])}</dl>
          </div>
          <div class="info-box">
            <h3>Support path</h3>
            <ul class="plain-list">
              <li>Course Instructor: content, requirements, assessment questions.</li>
              <li>Program Mentor: pacing, time management, term plan.</li>
              <li>Recommended: ${escapeHtml(student.academic_support_recommendation || 'Create a short progress plan.')}</li>
            </ul>
          </div>
        </div>
      `
    });
  }

  function mentorNoteModal() {
    openModal({
      kicker: 'Program Mentor',
      title: 'Add mentor note',
      body: `
        <div class="form-grid">
          ${row('Owner', `<input value="${escapeHtml(mentorName())}" />`)}
          ${row('Topic', '<select><option>Course pacing support</option><option>Term plan adjustment</option><option>Study plan follow-up</option></select>')}
          ${row('Note', `<textarea>${escapeHtml(firstName())} is working full-time and feels behind on ${escapeHtml(student.current_course_focus || 'current coursework')}. Advisor discussed a short 72-hour plan and recommended mentor follow-up for pacing support.</textarea>`)}
        </div>
      `,
      footer: '<button class="secondary" data-close-modal>Cancel</button><button data-submit-action="mentor">Save note</button>'
    });
  }

  function scheduleModal() {
    openModal({
      kicker: 'Follow-up',
      title: 'Schedule follow-up',
      body: `
        <div class="form-grid">
          ${row('Owner', `<input value="${escapeHtml(mentorName())}" />`)}
          ${row('Window', `<input value="${escapeHtml(student.preferred_follow_up_window || 'Monday afternoon')}" />`)}
          ${row('Channel', '<select><option>Phone callback</option><option>Email</option><option>SMS reminder</option></select>')}
          ${row('Callback', `<input value="${escapeHtml(student.callback_number || student.phone_number || '')}" />`)}
          ${row('Topic', `<textarea>Check progress on 72-hour study plan and confirm SFS follow-up status.</textarea>`)}
        </div>
      `,
      footer: '<button class="secondary" data-close-modal>Cancel</button><button data-submit-action="schedule">Schedule</button>'
    });
  }

  function confirmSummary() {
    check('summaryConfirmed');
    addLog('Handoff summary confirmed');
  }

  function handleModalSubmit(event) {
    const action = event.currentTarget.getAttribute('data-submit-action');
    if (action === 'sfs') {
      check('sfsRequested');
      check('concernDocumented');
      addLog('Student Financial Services referral created');
    } else if (action === 'mentor') {
      check('mentorNoteAdded');
      addLog('Program Mentor note added');
    } else if (action === 'schedule') {
      check('followupScheduled');
      addLog('Follow-up scheduled');
    }
    closeModal();
  }

  function routeAction(action) {
    switch (action) {
      case 'open-profile': return profileModal();
      case 'history': return historyModal();
      case 'payment-portal': return paymentModal();
      case 'sfs-referral': return sfsReferralModal();
      case 'course-progress': return courseProgressModal();
      case 'mentor-note': return mentorNoteModal();
      case 'schedule': return scheduleModal();
      case 'confirm-summary': return confirmSummary();
      case 'clear-log': return seedLog();
      default: return undefined;
    }
  }

  document.addEventListener('click', (event) => {
    const closeButton = event.target.closest('[data-close-modal]');
    if (closeButton) return closeModal();
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return undefined;
    routeAction(actionButton.getAttribute('data-action'));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  loadStudent();
})();
