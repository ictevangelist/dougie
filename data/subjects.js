/* Dougie's Revision: the list of subjects.
   To add a subject: add an entry here, add data/<slug>.js, and copy any subject folder's index.html into /<slug>/.
   status "live" loads the subject's data file; "soon" shows a Coming soon card and page. */
window.DR = window.DR || {};
DR.subjects = DR.subjects || {};
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
    accent: "#2980B9",
    tint: "#E1EDF5",
    status: "soon",
    blurb: "Coming soon"
  },
  {
    slug: "computer-science",
    name: "Computer Science",
    accent: "#D35400",
    tint: "#F9E7DB",
    status: "soon",
    blurb: "Coming soon"
  }
];
