/* Dougie's Revision: the list of subjects.
   To add a subject: add an entry here, add data/<slug>.js, and copy any subject folder's index.html into /<slug>/.
   status "live" loads the subject's data file; "soon" shows a Coming soon card and page. */
window.DR = window.DR || {};
DR.subjects = DR.subjects || {};
/* The money jar fills only from the wheel; this is just the currency sign it shows. */
DR.pay = { currency: "\u00a3" };
/* Google sign-in (Firebase project dougie-revision). This web config is public by design; the Firestore rules decide who can read or write. null keeps progress on this device only. */
DR.firebase = null; /* sign-in paused 26 Oct 08:40 so Dougie can revise; config kept in claude-wordpress/dougie-revision/firebase-config.json */
DR.registry = [
  {
    slug: "biology",
    name: "Biology",
    wheel: "Bio",
    accent: "#16A085",
    tint: "#DEF2EE",
    status: "live",
    blurb: "AQA GCSE Combined Science (Trilogy), Paper 1, Higher tier"
  },
  {
    slug: "english-language",
    name: "English Language",
    short: "English",
    wheel: "Eng",
    accent: "#2980B9",
    tint: "#E1EDF5",
    status: "live",
    blurb: "AQA GCSE English Language (8700), Paper 1 and Paper 2"
  },
  {
    slug: "computer-science",
    name: "Computer Science",
    short: "Comp Sci",
    wheel: "CS",
    accent: "#D35400",
    tint: "#F9E7DB",
    status: "live",
    blurb: "OCR GCSE Computer Science (J277), Paper 1 and Paper 2"
  }
];
