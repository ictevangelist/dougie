/* Dougie's Revision: the list of subjects.
   To add a subject: add an entry here, add data/<slug>.js, and copy any subject folder's index.html into /<slug>/.
   status "live" loads the subject's data file; "soon" shows a Coming soon card and page. */
window.DR = window.DR || {};
DR.subjects = DR.subjects || {};
/* Pay: perDay for each morning, unlocked when every slot is ticked and every quiz score is in.
   No arguments doubles a day to perDay x 2, but the doubling only counts over a run of "days" days. Dad decides on the arguments. */
/* calmDays: the dates Dad confirms had no arguments, for example ["2026-10-26"]. The money jar on the hub reads them. */
DR.pay = { currency: "\u00a3", perDay: 5, days: 3, calmDays: [] };
DR.registry = [
  {
    slug: "biology",
    name: "Biology",
    accent: "#16A085",
    tint: "#DEF2EE",
    status: "live",
    blurb: "AQA GCSE Combined Science (Trilogy), Paper 1, Higher tier"
  },
  {
    slug: "english-language",
    name: "English Language",
    short: "English",
    accent: "#2980B9",
    tint: "#E1EDF5",
    status: "soon",
    blurb: "Coming soon"
  },
  {
    slug: "computer-science",
    name: "Computer Science",
    short: "Comp Sci",
    accent: "#D35400",
    tint: "#F9E7DB",
    status: "soon",
    blurb: "Coming soon"
  }
];
