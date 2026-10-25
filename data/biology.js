/* Dougie's Revision: Biology.
   To add a session, add one object to "sessions" below. Its page is /biology/sessions/<date>/ and works straight away.
   Slot types: setup, report (needs "report": a report code), check (needs "unit": a unit code), break.
   Give a report a "link" (its own web address) and its buttons open it directly instead of the notebook. */
window.DR = window.DR || {};
DR.subjects = DR.subjects || {};
DR.subjects.biology = {
  slug: "biology",
  name: "Biology",
  heading: "AQA GCSE Combined Science (Trilogy) Biology",
  paper: "Paper 1, Higher tier",
  notebook: "https://notebook.google.com/notebook/627c4f27-96ce-4b04-9f28-992ddce72b14",
  checkPrompt: "Based on the quizzes and flashcards I have just done for Unit {unit}, what are my three weakest areas, and what one thing should I do to fix each one? Keep it short.",
  checkNote: "Paste this into the notebook chat, then press Save to note on the answer.",
  steps: {
    report: ["Do the first quiz, before you read anything.", "Go through the key terms flashcards.", "Read the exam mistakes section.", "Time left? Do the final quiz, then the second flashcard set.", "Can't remember something? Try hard first. Your CGP book and knowledge organiser are a last resort, and write down anything you couldn't remember as a note."],
    check: ["Copy the prompt below.", "Paste it into the notebook chat.", "Press Save to note on the answer."],
    setup: ["Put your CGP book, your knowledge organiser and some paper for notes next to you.", "Open the notebook.", "Check it loads.", "Find report 4.1a in the Studio panel."]
  },
  howTo: [
    "Every report lives in one Gemini Notebook. Open the notebook, then open each report from the Studio panel by its code, for example 4.1a.",
    "Inside each report, do the first quiz BEFORE reading anything. Getting things wrong at this stage is useful, because it shows what to focus on.",
    "The order of work in each slot is: (1) the first quiz, (2) the key terms flashcards, (3) the exam mistakes section. Then, (4) if there's time, the final quiz and the second flashcard set.",
    "When a slot's time is up, move on, even if you haven't finished. Getting through everything matters more than finishing every part today.",
    "After each unit, copy the unit check prompt into the notebook chat, then press \"Save to note\" on the answer.",
    "You can use your CGP book and your knowledge organiser whenever you want, but only as a last resort, when you really can't remember something. Anything you can't remember, write it down as a note."
  ],
  units: [
    {
      code: "4.1", title: "Cell Biology", colour: "#3498DB", dark: "#2980B9", tint: "#E3F1FA",
      reports: [
        { code: "4.1a", link: "https://notebooklm.link.google/xxz65kxi7Ldb", title: "Cell structure", focus: "Animal, plant and bacterial cells; eukaryotes and prokaryotes; specialised cells; differentiation." },
        { code: "4.1b", link: "https://notebooklm.link.google/VubIrGPlWGfr", title: "Microscopy and maths", focus: "Magnification, resolution, unit conversions, standard form, aseptic technique." },
        { code: "4.1c", link: "https://notebooklm.link.google/AbQ6tjaDukpw", title: "Cell division and stem cells", focus: "Chromosomes, mitosis, the cell cycle, stem cells and ethics, cloning plants." },
        { code: "4.1d", link: "https://notebooklm.link.google/uyupIatMxGU3", title: "Transport in cells", focus: "Diffusion, osmosis and the potato practical, active transport, surface area to volume, exchange surfaces." }
      ]
    },
    {
      code: "4.2", title: "Organisation", colour: "#E74C3C", dark: "#C0392B", tint: "#FCE6E4",
      reports: [
        { code: "4.2a", link: "https://notebooklm.link.google/AMOoLZwINtEz", title: "Enzymes and digestion", focus: "Lock and key, digestive enzymes, bile, food tests, the amylase practical." },
        { code: "4.2b", link: "https://notebooklm.link.google/g0DzYKzeSzDN", title: "Heart, blood and lungs", focus: "Double circulation, the pacemaker, blood vessels, blood components, gas exchange, cardiac output." },
        { code: "4.2c", link: "https://notebooklm.link.google/naw4Cq7KVlsv", title: "Heart disease and health", focus: "Coronary heart disease, stents, statins, valves, transplants, lifestyle factors, tumours." },
        { code: "4.2d", link: "https://notebooklm.link.google/v4IdXkhDi5iR", title: "Plant tissues and transport", focus: "Leaf tissues, xylem and phloem, transpiration, translocation, stomata." }
      ]
    },
    {
      code: "4.3", title: "Infection and Response", colour: "#9B59B6", dark: "#8E44AD", tint: "#F1E8F5",
      reports: [
        { code: "4.3a", link: "https://notebooklm.link.google/jboGmcSU8H3Y", title: "Pathogens and diseases", focus: "The four pathogen types, spread, each named disease and prevention." },
        { code: "4.3b", link: "https://notebooklm.link.google/Vxz74cl6ZBQK", title: "Defences and immunity", focus: "Barriers, white blood cells, antibodies and antitoxins, vaccination." },
        { code: "4.3c", link: "https://notebooklm.link.google/ymykgFNwFKMC", title: "Drugs", focus: "Antibiotics, painkillers, drugs from plants, drug testing and trials." }
      ]
    },
    {
      code: "4.4", title: "Bioenergetics", colour: "#2ECC71", dark: "#27AE60", tint: "#E2F8EB",
      reports: [
        { code: "4.4a", link: "https://notebooklm.link.google/aNeXtAWu3Ixp", title: "Photosynthesis", focus: "Equations, limiting factors and their graphs, the light intensity practical, the inverse square law, greenhouses." },
        { code: "4.4b", link: "https://notebooklm.link.google/jCBlhN4rMcII", title: "Respiration", focus: "Aerobic and anaerobic respiration, exercise, oxygen debt, metabolism." }
      ]
    },
    {
      code: "Mixed", title: "Mixed retrieval", colour: "#E67E22", dark: "#D35400", tint: "#FCEDE0",
      reports: [
        { code: "Mixed", link: "https://notebooklm.link.google/EjaJPmfsfw90", title: "Paper 1 mixed retrieval", lookFor: "Paper 1 mixed retrieval", focus: "An interleaved and synoptic quiz across all four units." }
      ]
    }
  ],
  sessions: [
    {
      date: "2026-10-26",
      title: "Biology Revision Session",
      start: "09:00",
      end: "12:35",
      breaks: [{ start: "11:15", end: "11:35" }],
      slots: [
        { start: "09:00", end: "09:05", type: "setup", title: "Get set up", note: "Open the notebook, check it loads and find report 4.1a." },
        { start: "09:05", end: "09:17", type: "report", report: "4.1a" },
        { start: "09:17", end: "09:29", type: "report", report: "4.1b", note: "Have a calculator ready." },
        { start: "09:29", end: "09:41", type: "report", report: "4.1c" },
        { start: "09:41", end: "09:53", type: "report", report: "4.1d" },
        { start: "09:53", end: "09:58", type: "check", unit: "4.1" },
        { start: "09:58", end: "10:10", type: "report", report: "4.2a" },
        { start: "10:10", end: "10:22", type: "report", report: "4.2b", note: "Have a calculator ready." },
        { start: "10:22", end: "10:34", type: "report", report: "4.2c" },
        { start: "10:34", end: "10:46", type: "report", report: "4.2d" },
        { start: "10:46", end: "10:51", type: "check", unit: "4.2" },
        { start: "10:51", end: "11:03", type: "report", report: "4.3a" },
        { start: "11:03", end: "11:15", type: "report", report: "4.3b" },
        { start: "11:15", end: "11:35", type: "break", title: "Break", note: "Get away from the screen, have a drink and something to eat." },
        { start: "11:35", end: "11:47", type: "report", report: "4.3c" },
        { start: "11:47", end: "11:52", type: "check", unit: "4.3" },
        { start: "11:52", end: "12:06", type: "report", report: "4.4a", note: "Have a calculator ready." },
        { start: "12:06", end: "12:18", type: "report", report: "4.4b" },
        { start: "12:18", end: "12:35", type: "report", report: "Mixed",
          note: "Do the interleaved quiz first, then the cross-unit synoptic quiz. This is the real test of the morning.",
          prompt: "Based on everything I have done this morning across Units 4.1 to 4.4, list the five topics I should revisit first, in priority order." }
      ]
    }
  ]
};
