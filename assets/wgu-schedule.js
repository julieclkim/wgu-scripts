(() => {
  const state = {
    students: {},
    student: null,
    studentId: null,
    selectedSlot: null
  };

  const ADVISOR_AVAILABILITY = {
    "Carla Espinosa": [
      { day: "Mon, May 25, 2026", slots: ["1:00 PM MT", "2:30 PM MT", "4:00 PM MT"] },
      { day: "Tue, May 26, 2026", slots: ["10:00 AM MT", "11:30 AM MT"] },
      { day: "Wed, May 27, 2026", slots: ["2:00 PM MT", "3:30 PM MT"] }
    ],
    "default": [
      { day: "Mon, May 25, 2026", slots: ["1:30 PM MT", "3:00 PM MT"] },
      { day: "Tue, May 26, 2026", slots: ["10:30 AM MT", "2:00 PM MT"] },
      { day: "Wed, May 27, 2026", slots: ["11:00 AM MT"] }
    ]
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

  function getStudentIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const aliases = ["StudentId", "studentId", "student_id", "studentID", "key", "id"];
    for (const alias of aliases) {
      const value = params.get(alias);
      if (value && !value.includes("{{") && !value.includes("}}")) return value.trim();
    }
    return "";
  }

  function advisorName(student) {
    return student.assigned_program_mentor || student.assigned_enrollment_counselor || "Advisor not assigned";
  }

  function callbackDisplay(student) {
    return student.callback_number || student.phone_number || "Not listed";
  }

  function setWarning(message) {
    const warning = $("#setupWarning");
    warning.textContent = message;
    warning.hidden = false;
  }

  function bindStudent(student) {
    const values = {
      ...student,
      advisor_name: advisorName(student),
      callback_display: callbackDisplay(student),
      preferred_follow_up_window: student.preferred_follow_up_window || "Next available"
    };

    $$('[data-bind]').forEach((el) => {
      const key = el.dataset.bind;
      el.textContent = values[key] ?? "-";
    });

    document.title = `Schedule advisor call | ${student.full_name}`;
    $("#backLink").href = `agent-script.html?StudentId=${encodeURIComponent(student.key || state.studentId || "12345")}`;
    $("#ownerField").value = advisorName(student);
    $("#notesField").value = buildDefaultNotes(student);
  }

  function buildDefaultNotes(student) {
    return [
      `Follow-up with ${student.full_name} regarding financial hold and registration concern.`,
      `Balance: ${student.balance_due || "not listed"}. Aid status: ${student.financial_aid_status || "not listed"}. Expected aid date: ${student.aid_disbursement_date || "not listed"}.`,
      `Student is working full-time as an RN and is concerned about progress on ${student.current_course_focus || "current coursework"}.`,
      `Review payment plan email, confirm Student Financial Services follow-up status, and help student choose a realistic next academic step.`
    ].join("\n");
  }

  function buildSlots(student) {
    const name = advisorName(student);
    const availability = ADVISOR_AVAILABILITY[name] || ADVISOR_AVAILABILITY.default;
    const container = $("#slotList");
    container.innerHTML = availability.map((group, groupIndex) => `
      <section class="day-group">
        <h3>${escapeHtml(group.day)}</h3>
        <div class="slot-buttons">
          ${group.slots.map((slot, slotIndex) => `
            <button class="slot-btn" type="button" data-day="${escapeHtml(group.day)}" data-slot="${escapeHtml(slot)}" ${groupIndex === 0 && slotIndex === 1 ? "data-default-slot" : ""}>${escapeHtml(slot)}</button>
          `).join("")}
        </div>
      </section>
    `).join("");

    const defaultSlot = $("[data-default-slot]") || $(".slot-btn");
    if (defaultSlot) selectSlot(defaultSlot);
  }

  function selectSlot(button) {
    $$(".slot-btn").forEach((el) => el.classList.remove("is-selected"));
    button.classList.add("is-selected");
    state.selectedSlot = {
      day: button.dataset.day,
      time: button.dataset.slot
    };
    $("#selectedSlotField").value = `${state.selectedSlot.day} at ${state.selectedSlot.time}`;
  }

  function scheduleAppointment(event) {
    event.preventDefault();
    const student = state.student;
    const selected = state.selectedSlot || { day: "selected date", time: "selected time" };
    const channel = $("#channelField").value;
    const duration = $("#durationField").value;
    const topic = $("#topicField").value || "Advisor follow-up";

    $("#successText").textContent = `${topic} scheduled with ${advisorName(student)} for ${selected.day} at ${selected.time}. Channel: ${channel}. Duration: ${duration}. Demo only: no calendar event was created.`;
    $("#successPanel").hidden = false;

    const eventPayload = {
      eventType: "WGU_SCHEDULE_ADVISOR_CALL",
      studentId: student.key,
      studentName: student.full_name,
      advisorName: advisorName(student),
      appointment: {
        topic,
        channel,
        duration,
        day: selected.day,
        time: selected.time,
        callbackNumber: callbackDisplay(student),
        notes: $("#notesField").value
      }
    };

    window.dispatchEvent(new CustomEvent("wgu:scheduleAdvisorCall", { detail: eventPayload }));
    if (window.parent && window.parent !== window) window.parent.postMessage(eventPayload, "*");
  }

  function wireEvents() {
    document.addEventListener("click", (event) => {
      const slotButton = event.target.closest(".slot-btn");
      if (slotButton) selectSlot(slotButton);
    });
    $("#scheduleForm").addEventListener("submit", scheduleAppointment);
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
    }

    bindStudent(state.student);
    buildSlots(state.student);
  }

  init();
})();
