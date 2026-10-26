/* Dougie's Revision: the list of subjects.
   To add a subject: add an entry here, add data/<slug>.js, and copy any subject folder's index.html into /<slug>/.
   status "live" loads the subject's data file; "soon" shows a Coming soon card and page. */
window.DR = window.DR || {};
DR.subjects = DR.subjects || {};
/* The money jar fills only from the wheel; this is just the currency sign it shows. */
DR.pay = { currency: "\u00a3" };
/* Google sign-in (Firebase project dougie-revision). This web config is public by design; the Firestore rules decide who can read or write. null keeps progress on this device only. */
DR.firebase = {"apiKey": "AIzaSyCd6KtTv3N0TmVwR5l-5ybUisQtX3zH6bs", "authDomain": "dougie-revision.firebaseapp.com", "projectId": "dougie-revision", "storageBucket": "dougie-revision.firebasestorage.app", "messagingSenderId": "223992817221", "appId": "1:223992817221:web:50d56a95f3fda93fbb652c"};
DR.registry = [
  {
    slug: "biology",
    name: "Biology",
    wheel: "Bio",
    accent: "#16A085",
    tint: "#DEF2EE",
    status: "live",
    blurb: "AQA GCSE Combined Science (Trilogy), Paper 1, Foundation tier"
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
  },
  {
    /* jar: Maths has its own wheel and money jar (this storage key), kept apart from the hub's */
    slug: "maths",
    name: "Maths",
    wheel: "Maths",
    accent: "#8E44AD",
    tint: "#EEE3F3",
    status: "live",
    jar: "maths-wheel",
    blurb: "Pearson Edexcel GCSE Mathematics (1MA1), Higher tier"
  }
];
