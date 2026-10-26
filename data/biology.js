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
  paper: "Paper 1, Foundation tier",
  notebook: "https://notebook.google.com/notebook/627c4f27-96ce-4b04-9f28-992ddce72b14",
  checkPrompt: "Based on the quizzes and flashcards I have just done for Unit {unit}, what are my three weakest areas, and what one thing should I do to fix each one? Keep it short.",
  checkNote: "Paste this into the notebook chat, then press Save to note on the answer.",
  steps: {
    report: ["The first quiz, before you read anything.", "The key terms flashcards.", "The exam mistakes section.", "The final quiz.", "The second flashcard set."],
    check: ["Copy the prompt below.", "Paste it into the notebook chat.", "Press Save to note on the answer."],
    setup: ["Put your CGP book, your knowledge organiser and some paper for notes next to you.", "Open the notebook.", "Check it loads.", "Find report 4.1a in the Studio panel."]
  },
  /* Shown big in the Right now box on every report slot */
  stuck: { title: "Can't remember something?", lines: ["Try hard to remember it first.", "Only then check your CGP book or knowledge organiser. They're a last resort.", "Write down anything you couldn't remember as a note."], dad: "Need a hand? Ask Dad, wherever and whenever you want. Just check he's not in a meeting first." },
  howTo: [
    "Every report lives in one Gemini Notebook. Open the notebook, then open each report from the Studio panel by its code, for example 4.1a.",
    "Inside each report, do the first quiz BEFORE reading anything. Getting things wrong at this stage is useful, because it shows what to focus on.",
    "Every report has five parts, and you must do ALL FIVE, in this order: (1) the first quiz, (2) the key terms flashcards, (3) the exam mistakes section, (4) the final quiz, (5) the second flashcard set. Tick each part off on this page as you finish it. A report only counts as done when all five are ticked.",
    "There's no timer. Work through the slots in order, at your own pace, and finish all five parts of a report before you move on. The minutes next to each slot are only a rough guide.",
    "After each unit, copy the unit check prompt into the notebook chat, then press \"Save to note\" on the answer.",
    "When the session's over, the box at the top of the page asks you to send your results to Dad. Do it straight away: press Send my results to Dad and send him the message.",
    "You can use your CGP book and your knowledge organiser whenever you want, but only as a last resort, when you really can't remember something. Anything you can't remember, write it down as a note.",
    "You can ask Dad for help wherever and whenever you want, as long as he's not in a meeting."
  ],
  /* The quiz wheel on the hub. Each entry: unit, question, the right answer, then three wrong answers.
     The options are shuffled on screen. A right answer adds money to the jar the first time only; a wrong answer costs nothing. */
  quiz: [
    ["4.1", "Which part of a cell controls its activities and holds its genetic material?", "The nucleus", "The cytoplasm", "The cell membrane", "The ribosomes"],
    ["4.1", "Where in a cell does aerobic respiration happen?", "In the mitochondria", "In the ribosomes", "In the chloroplasts", "In the nucleus"],
    ["4.1", "Where are proteins made in a cell?", "On the ribosomes", "In the mitochondria", "In the nucleus", "In the vacuole"],
    ["4.1", "Which of these is found in plant cells but not in animal cells?", "A cell wall", "A cell membrane", "Mitochondria", "Ribosomes"],
    ["4.1", "What is a plant cell wall made of?", "Cellulose", "Starch", "Glucose", "Chitin"],
    ["4.1", "How is the genetic material in a bacterial cell kept?", "As a single loop of DNA, often with small rings called plasmids", "Inside a nucleus, as pairs of chromosomes", "Inside the mitochondria", "Inside a vacuole"],
    ["4.1", "Which is the right formula for magnification?", "Image size ÷ real size", "Real size ÷ image size", "Image size × real size", "Real size − image size"],
    ["4.1", "An image of a cell is 5 mm wide. The real cell is 0.05 mm wide. What is the magnification?", "×100", "×10", "×1000", "×0.01"],
    ["4.1", "How many micrometres (µm) are there in 1 millimetre?", "1000", "100", "10", "1 000 000"],
    ["4.1", "Why can an electron microscope show more detail than a light microscope?", "It has a much higher resolution", "It uses brighter light", "It can look at living cells", "It uses stains to colour the cell"],
    ["4.1", "What does mitosis make?", "Two cells that are genetically identical", "Four cells that are genetically different", "Two cells that are genetically different", "Four cells that are genetically identical"],
    ["4.1", "Where are stem cells found in plants?", "In the meristems", "In the xylem", "In the root hair cells", "In the guard cells"],
    ["4.1", "What is diffusion?", "The spreading out of particles from where there are more of them to where there are fewer", "The movement of particles from where there are fewer to where there are more, using energy", "The movement of water through a partially permeable membrane", "The movement of particles only through the stomata"],
    ["4.1", "In osmosis, which way does water move across a partially permeable membrane?", "From a dilute solution to a more concentrated one", "From a concentrated solution to a more dilute one", "Always into the cell, whatever the solutions", "It does not move, only the solute does"],
    ["4.1", "Where does the energy for active transport come from?", "Respiration", "Photosynthesis", "Diffusion", "Osmosis"],
    ["4.1", "How do root hair cells take in mineral ions from soil?", "By active transport", "By osmosis", "By diffusion", "By transpiration"],
    ["4.1", "A piece of potato is left in a very concentrated sugar solution. What happens to its mass?", "It goes down, because water leaves by osmosis", "It goes up, because water enters by osmosis", "It goes up, because sugar enters by diffusion", "It stays the same"],
    ["4.1", "A cube has sides of 1 cm. What is its surface area to volume ratio?", "6 : 1", "1 : 6", "1 : 1", "3 : 1"],
    ["4.1", "What is a eukaryotic cell?", "A cell with its genetic material inside a nucleus", "A cell with no nucleus", "A cell with a single loop of DNA and plasmids", "A cell found only in plants"],
    ["4.1", "Which of these is a prokaryotic cell?", "A bacterial cell", "A plant cell", "An animal cell", "A yeast cell"],
    ["4.1", "Why does a sperm cell have lots of mitochondria?", "To release energy for swimming", "To make proteins for the egg", "To store food for the embryo", "To carry extra genetic material"],
    ["4.1", "What is cell differentiation?", "A cell becoming specialised to do a particular job", "A cell dividing into two", "A cell growing larger", "A cell copying its DNA"],
    ["4.1", "What does the cell membrane do?", "Controls what goes into and out of the cell", "Makes proteins", "Supports and strengthens the cell", "Releases energy from glucose"],
    ["4.1", "What is inside a plant cell's permanent vacuole?", "Cell sap", "Chlorophyll", "Genetic material", "Enzymes for respiration"],
    ["4.1", "Why do you use aseptic technique when growing bacteria?", "To stop the culture being contaminated by other microorganisms", "To make the bacteria grow faster", "To kill the bacteria you are growing", "To keep the agar warm"],
    ["4.1", "Why are bacteria grown at no more than 25°C in school labs?", "To lower the chance of growing pathogens that could harm people", "Because bacteria die above 25°C", "So that the agar doesn't melt", "To make the bacteria grow as fast as possible"],
    ["4.1", "How is 0.0003 written in standard form?", "3 × 10⁻⁴", "3 × 10⁴", "3 × 10⁻³", "3 × 10⁻⁵"],
    ["4.1", "Where are stem cells found in adults?", "In the bone marrow", "In the meristems", "In red blood cells", "In the skin only"],
    ["4.1", "Why could embryonic stem cells be useful in medicine?", "They can turn into most types of human cell", "They can only divide once", "They can only become blood cells", "They are already specialised"],
    ["4.1", "What is therapeutic cloning?", "Making an embryo with the same genes as the patient, to get stem cells", "Cloning a whole person", "Taking stem cells from bone marrow", "Growing new plants from cuttings"],
    ["4.1", "How are fish gills adapted for gas exchange?", "Lots of thin filaments give a large surface area", "They have thick walls", "They have a small surface area", "They have no blood supply"],
    ["4.1", "What does a cell do before it divides by mitosis?", "Grows, copies its DNA and makes more ribosomes and mitochondria", "Splits its nucleus in two straight away", "Breaks down its cell membrane", "Halves its number of chromosomes"],
    ["4.1", "How many chromosomes are in a normal human body cell?", "46", "23", "92", "44"],

    ["4.2", "Which enzyme breaks down starch?", "Amylase", "Protease", "Lipase", "Bile"],
    ["4.2", "Lipase breaks lipids down into what?", "Fatty acids and glycerol", "Amino acids", "Simple sugars", "Glucose and glycerol"],
    ["4.2", "Where is bile made?", "In the liver", "In the gall bladder", "In the pancreas", "In the stomach"],
    ["4.2", "What does bile do?", "Neutralises stomach acid and breaks fat into small droplets", "Digests fats into fatty acids and glycerol", "Digests proteins into amino acids", "Absorbs digested food into the blood"],
    ["4.2", "What is the result of a positive test for starch?", "Iodine solution turns blue-black", "Benedict's solution turns brick red", "Biuret solution turns purple", "Ethanol turns cloudy white"],
    ["4.2", "What does the Biuret test show is there?", "Protein", "Starch", "Sugar", "Lipids"],
    ["4.2", "Why does an enzyme stop working if it gets too hot?", "Its active site changes shape, so the substrate no longer fits", "The enzyme is killed by the heat", "The enzyme runs out of energy", "The substrate moves too slowly to react"],
    ["4.2", "Which blood vessel carries blood away from the heart at high pressure?", "An artery", "A vein", "A capillary", "A lymph vessel"],
    ["4.2", "Where is the heart's natural pacemaker?", "In the right atrium", "In the left ventricle", "In the aorta", "In the left atrium"],
    ["4.2", "Which part of the heart pumps blood to the lungs?", "The right ventricle", "The left ventricle", "The right atrium", "The left atrium"],
    ["4.2", "Why do red blood cells have no nucleus?", "To leave more room for haemoglobin to carry oxygen", "So that they can divide faster", "So that they can fight pathogens", "So that they can help the blood clot"],
    ["4.2", "What do platelets do?", "Help the blood to clot", "Carry oxygen", "Make antibodies", "Carry hormones"],
    ["4.2", "Which is the right formula for cardiac output?", "Stroke volume × heart rate", "Heart rate ÷ stroke volume", "Stroke volume + heart rate", "Blood pressure × heart rate"],
    ["4.2", "Where does gas exchange happen in the lungs?", "In the alveoli", "In the bronchi", "In the trachea", "In the bronchioles"],
    ["4.2", "What causes coronary heart disease?", "Fatty material building up inside the coronary arteries", "Heart valves that leak", "An infection of the heart muscle", "A heart rate that is too slow"],
    ["4.2", "What do statins do?", "Lower the amount of cholesterol in the blood", "Widen narrowed arteries", "Replace faulty heart valves", "Control the heart rate"],
    ["4.2", "What does a stent do?", "Holds a narrowed coronary artery open", "Replaces a faulty heart valve", "Lowers blood cholesterol", "Keeps the heartbeat regular"],
    ["4.2", "What makes a tumour malignant?", "Its cells can spread to other parts of the body in the blood", "It stays in one place inside a membrane", "It grows very slowly", "It is always caused by a virus"],
    ["4.2", "What does xylem carry?", "Water and mineral ions, up from the roots", "Dissolved sugars, up and down the plant", "Oxygen, down to the roots", "Dissolved sugars, down from the leaves only"],
    ["4.2", "What is translocation?", "The movement of dissolved sugars through the phloem", "The movement of water through the xylem", "The loss of water from the leaves", "The movement of gases through the stomata"],
    ["4.2", "Which of these makes transpiration faster?", "A higher temperature", "Higher humidity", "Less light", "Less air movement"],
    ["4.2", "What do guard cells do?", "Open and close the stomata", "Carry water up the stem", "Carry sugars around the plant", "Make most of the plant's glucose"],
    ["4.2", "What is the lock and key theory of enzymes?", "The substrate fits the enzyme's active site exactly", "One enzyme can break down any substrate", "The enzyme turns into the product", "The substrate locks the enzyme so it stops working"],
    ["4.2", "What does protease break proteins down into?", "Amino acids", "Fatty acids and glycerol", "Simple sugars", "Glycerol"],
    ["4.2", "Which organ makes amylase, protease and lipase?", "The pancreas", "The liver", "The gall bladder", "The large intestine"],
    ["4.2", "Which test shows that a sugar like glucose is there?", "The Benedict's test", "The iodine test", "The Biuret test", "The ethanol test"],
    ["4.2", "Which blood vessel has valves to stop blood flowing backwards?", "A vein", "An artery", "A capillary", "A coronary artery"],
    ["4.2", "Why are capillary walls only one cell thick?", "So substances can diffuse in and out quickly", "To make them stronger", "To keep the blood at high pressure", "To stop blood flowing backwards"],
    ["4.2", "What is plasma?", "The liquid part of the blood that carries cells and dissolved substances", "A type of white blood cell", "The part of the blood that carries oxygen", "Fragments of cells that help the blood clot"],
    ["4.2", "What is a drawback of a mechanical heart valve?", "The patient has to take drugs to stop blood clots forming", "It wears out within a few weeks", "It has to come from a pig or a cow", "It can only be fitted in children"],
    ["4.2", "Which tissue in a leaf does most of the photosynthesis?", "The palisade mesophyll", "The spongy mesophyll", "The upper epidermis", "The xylem"],
    ["4.2", "Why is the upper epidermis of a leaf see-through?", "To let light through to the palisade cells", "To stop water escaping", "To let gases into the leaf", "To make glucose"],
    ["4.2", "What is transpiration?", "The loss of water vapour from the leaves", "The movement of sugars through the phloem", "The uptake of mineral ions by the roots", "The making of glucose in the leaves"],
    ["4.2", "Where are most of the stomata on a leaf?", "On the underside", "On the top surface", "Along the edges", "In the palisade layer"],
    ["4.2", "What is a benign tumour?", "A growth of abnormal cells that stays in one place", "A growth that spreads around the body in the blood", "A growth caused by a virus", "A growth of normal cells that is harmless"],
    ["4.2", "Why does the left ventricle have a thicker wall than the right ventricle?", "It pumps blood all round the body, so it needs more force", "It pumps blood to the lungs", "It holds more blood than the right ventricle", "It takes in blood from the lungs"],

    ["4.3", "What type of pathogen causes measles?", "A virus", "A bacterium", "A fungus", "A protist"],
    ["4.3", "What type of pathogen causes malaria?", "A protist", "A virus", "A bacterium", "A fungus"],
    ["4.3", "What type of pathogen causes Salmonella food poisoning?", "A bacterium", "A virus", "A fungus", "A protist"],
    ["4.3", "What type of pathogen causes rose black spot?", "A fungus", "A virus", "A bacterium", "A protist"],
    ["4.3", "How is malaria spread?", "By mosquitoes", "In contaminated water", "In droplets from coughs and sneezes", "By touching an infected person"],
    ["4.3", "How is gonorrhoea treated?", "With antibiotics", "With painkillers only", "With a vaccine", "With fungicides"],
    ["4.3", "How does tobacco mosaic virus harm a plant?", "It discolours the leaves, so the plant photosynthesises less", "It blocks the xylem, so water can't reach the leaves", "It kills the root hair cells", "It stops the plant making flowers"],
    ["4.3", "How does the trachea help stop pathogens getting into the lungs?", "Mucus traps pathogens and cilia move them away", "It makes antibodies", "It is lined with acid", "Its cells engulf pathogens"],
    ["4.3", "What is phagocytosis?", "A white blood cell engulfing and digesting a pathogen", "A white blood cell making antibodies", "A white blood cell making antitoxins", "Platelets clotting the blood around a pathogen"],
    ["4.3", "How do antibodies help destroy pathogens?", "They bind to specific antigens on the pathogen", "They digest the pathogen inside a white blood cell", "They make the blood clot around the pathogen", "They kill every type of pathogen in the same way"],
    ["4.3", "What does a vaccine contain?", "Small amounts of a dead or inactive form of the pathogen", "Antibodies against the pathogen", "Antibiotics to kill the pathogen", "White blood cells from another person"],
    ["4.3", "Why won't antibiotics cure a cold?", "Colds are caused by viruses, and antibiotics don't kill viruses", "The cold virus is resistant to every drug", "Colds are caused by bacteria that live inside cells", "Antibiotics only work on fungi"],
    ["4.3", "Aspirin was first developed from a chemical found in which plant?", "Willow", "Foxglove", "Poppy", "Penicillium mould"],
    ["4.3", "Who discovered penicillin?", "Alexander Fleming", "Louis Pasteur", "Edward Jenner", "Joseph Lister"],
    ["4.3", "What is a placebo?", "A substance that looks like the drug but has no effect", "A small, safe dose of the real drug", "A drug that has already been tested", "The strongest dose of the drug"],
    ["4.3", "What is a double blind trial?", "Neither the doctors nor the patients know who has the real drug", "Only the doctors know who has the real drug", "Only the patients know who has the real drug", "The drug is tested on two groups of animals"],
    ["4.3", "In clinical trials, who is a new drug tested on first?", "Healthy volunteers, at a very low dose", "Patients with the illness, at the highest dose", "Patients with the illness, at the best dose", "Animals, at a very low dose"],
    ["4.3", "How is HIV spread?", "By sexual contact or by exchanging body fluids such as blood", "By mosquitoes", "In droplets from coughs and sneezes", "In contaminated water"],
    ["4.3", "What is the best way to stop measles spreading?", "Vaccinating young children", "Giving everyone antibiotics", "Boiling drinking water", "Spraying with fungicides"],
    ["4.3", "What are the symptoms of Salmonella food poisoning?", "Fever, stomach cramps, vomiting and diarrhoea", "A thick yellow or green discharge", "A fever and a red skin rash", "Fevers and shaking that keep coming back"],
    ["4.3", "What do antitoxins do?", "Neutralise the toxins made by bacteria", "Kill viruses inside cells", "Engulf and digest pathogens", "Make antibodies"],
    ["4.3", "How does the skin help defend the body against pathogens?", "It is a barrier and makes antimicrobial secretions", "It makes antibodies", "Its cells engulf pathogens", "It is coated in hydrochloric acid"],
    ["4.3", "Why is it good to vaccinate a large number of people?", "The pathogen can't spread easily, so people who aren't vaccinated are protected too", "It makes antibiotics work better", "It means people don't need white blood cells", "It makes the pathogen harmless"],
    ["4.3", "Digitalis, a heart drug, comes from which plant?", "Foxglove", "Willow", "Poppy", "Penicillium mould"],
    ["4.3", "What do painkillers do?", "Ease the symptoms, but don't kill the pathogen", "Kill bacteria", "Kill viruses", "Help the body make antibodies"],

    ["4.4", "Which is the word equation for photosynthesis?", "Carbon dioxide + water → glucose + oxygen", "Glucose + oxygen → carbon dioxide + water", "Oxygen + water → glucose + carbon dioxide", "Glucose → lactic acid"],
    ["4.4", "Photosynthesis is endothermic. What does that mean?", "Energy is taken in from the surroundings", "Energy is given out to the surroundings", "It only happens in the dark", "It needs oxygen to happen"],
    ["4.4", "Where in a plant cell does photosynthesis happen?", "In the chloroplasts", "In the mitochondria", "In the vacuole", "In the nucleus"],
    ["4.4", "Which of these can limit the rate of photosynthesis?", "Light intensity", "Oxygen concentration", "The amount of nitrogen in the air", "The size of the roots"],
    ["4.4", "Plants join glucose with nitrate ions to make what?", "Amino acids", "Starch", "Cellulose", "Lipids"],
    ["4.4", "Why do plants store glucose as starch?", "Starch is insoluble, so it doesn't upset osmosis in the cells", "Starch releases energy faster than glucose", "Starch is a smaller molecule than glucose", "Starch moves around the plant more easily"],
    ["4.4", "Which is the word equation for aerobic respiration?", "Glucose + oxygen → carbon dioxide + water", "Carbon dioxide + water → glucose + oxygen", "Glucose → lactic acid", "Glucose → ethanol + carbon dioxide"],
    ["4.4", "What does anaerobic respiration make in your muscles?", "Lactic acid", "Ethanol and carbon dioxide", "Carbon dioxide and water", "Glucose and oxygen"],
    ["4.4", "What does anaerobic respiration make in yeast cells?", "Ethanol and carbon dioxide", "Lactic acid", "Carbon dioxide and water", "Lactic acid and carbon dioxide"],
    ["4.4", "Why does aerobic respiration transfer more energy than anaerobic respiration?", "The glucose is completely oxidised", "It happens much faster", "It uses lactic acid as well as glucose", "It happens in the ribosomes"],
    ["4.4", "During exercise, what happens to your breathing rate and breath volume?", "They both go up", "They both go down", "Breathing rate goes up, breath volume goes down", "Breathing rate goes down, breath volume goes up"],
    ["4.4", "What is metabolism?", "All of the chemical reactions in a cell or the body", "Only the reactions that break down food", "Only respiration", "The speed of your heart rate"],
    ["4.4", "Which gas do plants take in for photosynthesis?", "Carbon dioxide", "Oxygen", "Nitrogen", "Water vapour"],
    ["4.4", "What happens to the rate of photosynthesis if it gets too hot?", "It falls, because the enzymes are denatured", "It keeps rising", "It falls, because light becomes the limiting factor", "It stays the same"],
    ["4.4", "Plants turn glucose into cellulose. What is cellulose used for?", "Strengthening cell walls", "Storing energy", "Making amino acids", "Storing oil in seeds"],
    ["4.4", "Respiration is exothermic. What does that mean?", "It transfers energy to the surroundings", "It takes in energy from the surroundings", "It only happens in the light", "It needs carbon dioxide to happen"],
    ["4.4", "Why do your muscles get tired during long, hard exercise?", "Lactic acid builds up from anaerobic respiration", "They run out of carbon dioxide", "They stop respiring completely", "They lose their mitochondria"],
    ["4.4", "Why does your heart rate go up during exercise?", "To get more oxygen and glucose to the muscles, and take more carbon dioxide away", "To cool the body down", "To breathe the lactic acid out through the lungs", "To make more red blood cells"],
    ["4.4", "What is anaerobic respiration in yeast used to make?", "Bread and alcoholic drinks", "Yoghurt", "Cheese", "Vinegar"]
  ],
  /* Practice papers: typed answers, handed in and sent to Dad for marking */
  activities: { "paper-1": {"kind": "paper", "title": "Practice paper 1", "pdf": "/notes/biology-practice-paper-1.pdf", "markscheme": "/notes/biology-practice-paper-1-mark-scheme.pdf", "intro": "30 marks. There's no timer, but aim for about 30 minutes. Answer every question in the boxes. You can use a calculator. The marks in brackets tell you how much to write. Spellcheck is off, like in the exam. When you've finished, press Hand it in, then send your answers to Dad.", "items": [{"n": "1.1", "group": "Question 1: Cells", "q": "Which structure is found in a plant cell but not in an animal cell? Choose one.", "marks": 1, "type": "mcq", "options": ["Cell membrane", "Chloroplast", "Mitochondrion", "Ribosome"]}, {"n": "1.2", "q": "A student looks at a cheek cell through a light microscope. The image of the cell is 6 mm wide. The real cell is 0.06 mm wide. Calculate the magnification. Show your working.", "marks": 2, "type": "text", "lines": 3}, {"n": "1.3", "q": "Before a cell divides by mitosis, it goes through a stage of growth. Describe two things that happen to the cell during this stage.", "marks": 2, "type": "text", "lines": 3}, {"n": "2.1", "group": "Question 2: Osmosis practical", "context": "A student put cylinders of potato into sugar solutions of different concentrations. She weighed each cylinder before and after leaving it for 30 minutes.", "table": [["Concentration of sugar solution in mol/dm³", "Percentage change in mass"], ["0.0", "+12.0"], ["0.2", "+4.5"], ["0.4", "−2.0"], ["0.6", "−8.5"], ["0.8", "−12.5"]], "q": "One cylinder had a mass of 2.50 g at the start and 2.80 g at the end. Calculate the percentage change in mass. Show your working.", "marks": 2, "type": "text", "lines": 3}, {"n": "2.2", "q": "Between which two concentrations in the table would a cylinder show no change in mass?", "marks": 1, "type": "text", "lines": 1}, {"n": "2.3", "q": "Explain why the cylinder in the 0.8 mol/dm³ solution lost mass.", "marks": 3, "type": "text", "lines": 4}, {"n": "2.4", "q": "Why did the student calculate the percentage change in mass, rather than just the change in mass?", "marks": 1, "type": "text", "lines": 2}, {"n": "3.1", "group": "Question 3: Enzymes and food tests", "q": "Name the enzyme that breaks down lipids, and name the products.", "marks": 2, "type": "text", "lines": 2}, {"n": "3.2", "q": "Explain why an enzyme stops working at a high temperature.", "marks": 2, "type": "text", "lines": 3}, {"n": "3.3", "q": "Name the reagent used to test for protein, and give the colour it turns if protein is present.", "marks": 2, "type": "text", "lines": 2}, {"n": "4.1", "group": "Question 4: Coronary heart disease", "q": "Explain how a stent helps a person with coronary heart disease.", "marks": 2, "type": "text", "lines": 3}, {"n": "5.1", "group": "Question 5: Infection and response", "q": "Measles is caused by a virus. Explain why a doctor would not give antibiotics to treat measles.", "marks": 1, "type": "text", "lines": 2}, {"n": "5.2", "q": "Explain how a vaccination can stop a person becoming ill with measles.", "marks": 3, "type": "text", "lines": 4}, {"n": "6.1", "group": "Question 6: Photosynthesis practical", "q": "A student wants to find out how light intensity affects the rate of photosynthesis in pondweed. Describe a method the student could use. Include how they would make it a fair test.", "marks": 6, "type": "text", "lines": 12}]} },
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
        { code: "4.4a", link: "https://notebooklm.link.google/aNeXtAWu3Ixp", title: "Photosynthesis", focus: "Equations, what affects the rate of photosynthesis, the light intensity practical, and how plants use glucose. Limiting factor graphs, the inverse square law and greenhouse costs are Higher only, so skip those parts." },
        { code: "4.4b", link: "https://notebooklm.link.google/jCBlhN4rMcII", title: "Respiration", focus: "Aerobic and anaerobic respiration, exercise, oxygen debt and metabolism. Lactic acid going to the liver is Higher only, so skip that part." }
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
      id: "practice-paper-1",
      flexible: true,
      paper: true,
      blurb: "30 marks, about 30 minutes, no timer. Topics 4.1 to 4.4, in the style of Paper 1 (Foundation).",
      title: "Practice paper 1: Biology Paper 1 topics",
      short: "Practice paper 1",
      slots: [
        { type: "practice", mins: 30, activity: "paper-1", title: "Practice paper 1: 30 marks" }
      ]
    },
    {
      date: "2026-10-26",
      title: "Revision session: Paper 1 topics",
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
