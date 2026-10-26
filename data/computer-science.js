/* Dougie's Revision: Computer Science (OCR J277).
   Two flexible sessions: slots have minutes, not clock times, and the timer starts when Dougie presses Start.
   Slot types: setup, report, check, practice (needs "activity": a key in "activities"), break.
   Each paper has its own notebook ("notebook" on the session); each report has its direct "link". */
window.DR = window.DR || {};
DR.subjects = DR.subjects || {};
DR.subjects["computer-science"] = {
  slug: "computer-science",
  name: "Computer Science",
  heading: "OCR GCSE Computer Science (J277)",
  paper: "Paper 1: Computer systems, and Paper 2: Computational thinking, algorithms and programming",
  notebook: "",
  checkPrompt: "Based on the quizzes and flashcards I have just done for Unit {unit}, what are my three weakest areas, and what one thing should I do to fix each one? Keep it short.",
  checkNote: "Paste this into the notebook chat, then press Save to note on the answer.",
  steps: {
    report: ["Do the first quiz, before you read anything.", "Go through the key terms flashcards.", "Read the exam mistakes section.", "Time left? Do the final quiz, then the second flashcard set."],
    check: ["Copy the prompt below.", "Paste it into the notebook chat.", "Press Save to note on the answer."],
    setup: ["Put some paper, a pen and your class notes next to you. There's no calculator in this exam, so don't use one.", "Open the notebook.", "Check it loads."],
    practice: ["Work it out on paper first, the way you would in the exam.", "Then put your answer in the boxes, or type your code, and check it.", "Wrong? Have another go before you look at the answers."]
  },
  stuck: { title: "Can't remember something?", lines: ["Try hard to remember it first.", "Only then check your revision guide, class notes or knowledge organiser. They're a last resort.", "Write down anything you couldn't remember as a note."], dad: "Need a hand? Ask Dad, wherever and whenever you want. Just check he's not in a meeting first." },
  howTo: [
    "There are two sessions, one for each paper. They're too big to do in one go, so do them on different days. Press Start when you're ready and the timer runs from then. You can pause it.",
    "The notebooks are shared with your Gmail and your school account. If a report won't open while you're signed in to Google with your school account, switch to your Gmail and try again.",
    "Each report lives in the notebook for that paper. Inside each report, do the first quiz BEFORE reading anything. Getting things wrong at this stage is useful, because it shows what to focus on.",
    "The order of work in each report slot is: (1) the first quiz, (2) the key terms flashcards, (3) the exam mistakes section. Then, (4) if there's time, the final quiz and the second flashcard set.",
    "Paper 2 has practice slots: trace tables, sorts, searches, truth tables and Python. Do each one on paper first, because in the exam you write it all by hand. Then check it on the page.",
    "When a slot's time is up, move on, even if you haven't finished. Getting through everything is better than finishing every part today.",
    "When the session's over, the box at the top of the page asks you to send your results to Dad. Do it straight away: press Send my results to Dad and send him the message.",
    "You can use your revision guide, class notes or knowledge organiser whenever you want, but only as a last resort, when you really can't remember something. Anything you can't remember, write it down as a note.",
    "You can ask Dad for help wherever and whenever you want, as long as he's not in a meeting."
  ],
  units: [
    { code: "1.1", title: "Systems architecture", colour: "#3498DB", dark: "#3498DB", tint: "#E3F1FA",
      reports: [
        { code: "1.1a", link: "https://notebooklm.link.google/owAj8kC22jfO", title: "The CPU and the fetch-execute cycle", focus: "What the CPU does, the fetch-execute cycle, the ALU, control unit, cache and registers, and Von Neumann architecture." },
        { code: "1.1b", link: "https://notebooklm.link.google/xAXwEficF2SJ", title: "CPU performance and embedded systems", focus: "How clock speed, cache size and the number of cores affect performance, and what embedded systems are." }
      ] },
    { code: "1.2", title: "Memory and storage", colour: "#9B59B6", dark: "#9B59B6", tint: "#F1E8F5",
      reports: [
        { code: "1.2a", link: "https://notebooklm.link.google/Pq1S3C0hf54D", title: "Primary and secondary storage", focus: "RAM, ROM, virtual memory, and choosing optical, magnetic or solid state storage." },
        { code: "1.2b", link: "https://notebooklm.link.google/mA5A3Kl8Mfbk", title: "Units and number systems", focus: "Units from bits to petabytes, file size calculations, binary, denary and hex, binary addition, overflow and shifts." },
        { code: "1.2c", link: "https://notebooklm.link.google/ZwoWUixzze30", title: "Characters, images, sound and compression", focus: "Character sets, how images and sound are stored, metadata, and lossy and lossless compression." }
      ] },
    { code: "1.3", title: "Computer networks, connections and protocols", colour: "#1ABC9C", dark: "#1ABC9C", tint: "#DDF5F0",
      reports: [
        { code: "1.3a", link: "https://notebooklm.link.google/J5zkOHL7qRi6", title: "Networks, topologies and the internet", focus: "LANs and WANs, client-server and peer-to-peer, network hardware, the internet, DNS, hosting, the cloud, star and mesh." },
        { code: "1.3b", link: "https://notebooklm.link.google/kaIhBtJuzG2B", title: "Wired and wireless networks, protocols and layers", focus: "Ethernet, Wi-Fi and Bluetooth, encryption, IP and MAC addresses, standards, protocols and layers." }
      ] },
    { code: "1.4", title: "Network security", colour: "#E74C3C", dark: "#E74C3C", tint: "#FCE6E4",
      reports: [
        { code: "1.4", link: "https://notebooklm.link.google/gHnsdpMUo5c9", title: "Network security", focus: "Threats such as malware, phishing, brute force, denial of service, interception and SQL injection, and how to prevent them." }
      ] },
    { code: "1.5", title: "Systems software", colour: "#F39C12", dark: "#F39C12", tint: "#FDF0DC",
      reports: [
        { code: "1.5", link: "https://notebooklm.link.google/K0oLptvUUoL3", title: "Systems software", focus: "What an operating system does, and utility software: encryption, defragmentation and compression." }
      ] },
    { code: "1.6", title: "Ethical, legal, cultural and environmental impacts", colour: "#2ECC71", dark: "#2ECC71", tint: "#E2F8EB",
      reports: [
        { code: "1.6", link: "https://notebooklm.link.google/YtblK3xSVJk3", title: "Ethical, legal, cultural and environmental impacts", focus: "The impacts of technology, the three laws you need, and open source and proprietary software." }
      ] },
    { code: "2.1", title: "Algorithms", colour: "#2980B9", dark: "#2980B9", tint: "#E1EDF5",
      reports: [
        { code: "2.1a", link: "https://notebooklm.link.google/569EG2GeCJap", title: "Computational thinking and designing algorithms", focus: "Abstraction, decomposition, algorithmic thinking, structure diagrams, pseudocode, flowcharts and trace tables." },
        { code: "2.1b", link: "https://notebooklm.link.google/1CXRiPNSXg96", title: "Searching and sorting algorithms", focus: "Linear and binary search, and bubble, merge and insertion sort." }
      ] },
    { code: "2.2", title: "Programming fundamentals", colour: "#8E44AD", dark: "#8E44AD", tint: "#EEE3F3",
      reports: [
        { code: "2.2a", link: "https://notebooklm.link.google/RtTKUMJ4Bzii", title: "Programming fundamentals", focus: "Variables, constants, operators, inputs and outputs, sequence, selection and iteration." },
        { code: "2.2b", link: "https://notebooklm.link.google/7AoiT9ARRiUZ", title: "Data types and additional programming techniques", focus: "Data types and casting, strings, files, records, SQL, arrays, functions and procedures, random numbers." }
      ] },
    { code: "2.3", title: "Producing robust programs", colour: "#D35400", dark: "#D35400", tint: "#F9E5D9",
      reports: [
        { code: "2.3", link: "https://notebooklm.link.google/m5uzxbXtuCia", title: "Producing robust programs", focus: "Defensive design, validation, authentication, maintainable code, testing and test data." }
      ] },
    { code: "2.4", title: "Boolean logic", colour: "#16A085", dark: "#16A085", tint: "#DEF2EE",
      reports: [
        { code: "2.4", link: "https://notebooklm.link.google/W6sIAXKIjFHY", title: "Boolean logic", focus: "AND, OR and NOT gates, truth tables and combining them." }
      ] },
    { code: "2.5", title: "Programming languages and IDEs", colour: "#E67E22", dark: "#E67E22", tint: "#FCEDE0",
      reports: [
        { code: "2.5", link: "https://notebooklm.link.google/npzLCLPZPHJJ", title: "Programming languages and IDEs", focus: "High and low level languages, compilers, interpreters and what an IDE gives you." }
      ] },
    { code: "Mixed", title: "Mixed retrieval", colour: "#95A5A6", dark: "#95A5A6", tint: "#EEF0F0",
      reports: [
        { code: "Mixed 1", link: "https://notebooklm.link.google/FOFEQOckt9H0", title: "Paper 1 mixed retrieval", focus: "Questions from across Paper 1, mixed up." },
        { code: "Mixed 2", link: "https://notebooklm.link.google/8j6bEES7Zwxj", title: "Paper 2 mixed retrieval", focus: "Questions from across Paper 2, mixed up." }
      ] }
  ],
  activities: {
    "trace-for": {
      "kind": "trace",
      "title": "Trace table: a for loop",
      "intro": "Fill in the trace table for this code. Each row is one change. Leave a box empty if nothing goes in it on that row.",
      "code": "total = 0\nfor i = 1 to 4\n    total = total + i\n    print(total)\nnext i",
      "columns": [
        "i",
        "total",
        "Output"
      ],
      "rows": [
        [
          "",
          "0",
          ""
        ],
        [
          "1",
          "1",
          "1"
        ],
        [
          "2",
          "3",
          "3"
        ],
        [
          "3",
          "6",
          "6"
        ],
        [
          "4",
          "10",
          "10"
        ]
      ]
    },
    "bubble": {
      "kind": "sort",
      "algorithm": "bubble",
      "title": "Bubble sort",
      "intro": "Sort this list into ascending order with a bubble sort. Write the whole list after each pass, like 2, 5, 1, 6, 9. Stop when a pass would make no swaps.",
      "list": [
        5,
        2,
        9,
        1,
        6
      ]
    },
    "insertion": {
      "kind": "sort",
      "algorithm": "insertion",
      "title": "Insertion sort",
      "intro": "Sort this list into ascending order with an insertion sort. Write the whole list after each step, where each step puts the next item into place.",
      "list": [
        7,
        3,
        8,
        1,
        4
      ]
    },
    "merge": {
      "kind": "sort",
      "algorithm": "merge",
      "title": "Merge sort",
      "intro": "The list has already been split into single items. Write the whole list after each merge stage: first pairs, then fours, then all eight.",
      "list": [
        6,
        2,
        8,
        4,
        1,
        7,
        3,
        5
      ]
    },
    "binary": {
      "kind": "binary",
      "title": "Binary search",
      "intro": "Use a binary search to find the target. Positions count from 0, and the midpoint is (low + high) DIV 2. Write the item checked at each step.",
      "list": [
        3,
        8,
        12,
        19,
        24,
        31,
        37,
        45,
        52
      ],
      "target": 45
    },
    "trace-while": {
      "kind": "trace",
      "title": "Trace table: a while loop with MOD and DIV",
      "intro": "Fill in the trace table for this code. Each row is one time round the loop. The output goes on its own row at the end.",
      "code": "n = 13\ncount = 0\nwhile n > 1\n    if n MOD 2 == 0 then\n        n = n DIV 2\n    else\n        n = n - 1\n    endif\n    count = count + 1\nendwhile\nprint(count)",
      "columns": [
        "n",
        "count",
        "Output"
      ],
      "rows": [
        [
          "13",
          "0",
          ""
        ],
        [
          "12",
          "1",
          ""
        ],
        [
          "6",
          "2",
          ""
        ],
        [
          "3",
          "3",
          ""
        ],
        [
          "2",
          "4",
          ""
        ],
        [
          "1",
          "5",
          ""
        ],
        [
          "",
          "",
          "5"
        ]
      ]
    },
    "py-total": {
      "kind": "python",
      "title": "Python: add up a list",
      "task": "Write a function called total_of(nums) that adds up all the numbers in the list nums with a for loop and returns the total. Don't use sum().",
      "starter": "def total_of(nums):\n    total = 0\n    # add each number to total here\n\n    return total\n",
      "tests": [
        [
          "total_of([1, 2, 3])",
          "6"
        ],
        [
          "total_of([])",
          "0"
        ],
        [
          "total_of([10, -4, 5])",
          "11"
        ]
      ],
      "erl": "function totalOf(nums)\n    total = 0\n    for i = 0 to nums.length - 1\n        total = total + nums[i]\n    next i\n    return total\nendfunction",
      "answer": "def total_of(nums):\n    total = 0\n    for n in nums:\n        total = total + n\n    return total"
    },
    "py-vowels": {
      "kind": "python",
      "title": "Python: count the vowels",
      "task": "Write a function called count_vowels(word) that returns how many vowels (a, e, i, o, u) are in word. Capital letters count too.",
      "starter": "def count_vowels(word):\n    count = 0\n\n    return count\n",
      "tests": [
        [
          "count_vowels(\"Computer\")",
          "3"
        ],
        [
          "count_vowels(\"RHYTHM\")",
          "0"
        ],
        [
          "count_vowels(\"Education\")",
          "5"
        ]
      ],
      "erl": "function countVowels(word)\n    count = 0\n    word = word.lower\n    for i = 0 to word.length - 1\n        letter = word.substring(i, 1)\n        if letter == \"a\" OR letter == \"e\" OR letter == \"i\" OR letter == \"o\" OR letter == \"u\" then\n            count = count + 1\n        endif\n    next i\n    return count\nendfunction",
      "answer": "def count_vowels(word):\n    count = 0\n    for letter in word.lower():\n        if letter in \"aeiou\":\n            count = count + 1\n    return count"
    },
    "py-linear": {
      "kind": "python",
      "title": "Python: linear search",
      "task": "Write a function called linear_search(items, target) that checks each item in turn and returns the position of target in the list, counting from 0. If target isn't there, return -1.",
      "starter": "def linear_search(items, target):\n\n    return -1\n",
      "tests": [
        [
          "linear_search([4, 8, 15, 16], 15)",
          "2"
        ],
        [
          "linear_search([4, 8, 15, 16], 4)",
          "0"
        ],
        [
          "linear_search([4, 8], 9)",
          "-1"
        ]
      ],
      "erl": "function linearSearch(items, target)\n    for i = 0 to items.length - 1\n        if items[i] == target then\n            return i\n        endif\n    next i\n    return -1\nendfunction",
      "answer": "def linear_search(items, target):\n    for i in range(len(items)):\n        if items[i] == target:\n            return i\n    return -1"
    },
    "py-age": {
      "kind": "python",
      "title": "Python: validate an age",
      "task": "Write a function called valid_age(age) that returns True if age is from 11 to 18, including 11 and 18, and False if it isn't. The tests use normal and boundary data, like a test plan in the exam.",
      "starter": "def valid_age(age):\n\n",
      "tests": [
        [
          "valid_age(15)",
          "True"
        ],
        [
          "valid_age(11)",
          "True"
        ],
        [
          "valid_age(18)",
          "True"
        ],
        [
          "valid_age(10)",
          "False"
        ],
        [
          "valid_age(19)",
          "False"
        ]
      ],
      "erl": "function validAge(age)\n    if age >= 11 AND age <= 18 then\n        return true\n    else\n        return false\n    endif\nendfunction",
      "answer": "def valid_age(age):\n    if age >= 11 and age <= 18:\n        return True\n    else:\n        return False"
    },
    "truth": {
      "kind": "truth",
      "title": "Truth table: P = (A AND B) OR NOT C",
      "intro": "Complete the output column for P = (A AND B) OR NOT C. Write 1 for true and 0 for false.",
      "expr": "(A AND B) OR NOT C",
      "inputs": [
        "A",
        "B",
        "C"
      ],
      "output": "P"
    }
  },
  sessions: [
    {
      "id": "paper-1",
      "flexible": true,
      "title": "Paper 1: Computer systems",
      "short": "Paper 1",
      "notebook": "https://notebook.google.com/notebook/5c13c207-183f-45f7-8d85-4fce2cad7c43",
      "slots": [
        {
          "type": "setup",
          "mins": 5,
          "title": "Get set up",
          "note": "Open the Paper 1 notebook and check it loads."
        },
        {
          "type": "report",
          "mins": 12,
          "report": "1.1a"
        },
        {
          "type": "report",
          "mins": 12,
          "report": "1.1b"
        },
        {
          "type": "check",
          "mins": 5,
          "unit": "1.1"
        },
        {
          "type": "report",
          "mins": 12,
          "report": "1.2a"
        },
        {
          "type": "report",
          "mins": 15,
          "report": "1.2b",
          "note": "No calculator: do the working on paper, as you will in the exam."
        },
        {
          "type": "report",
          "mins": 12,
          "report": "1.2c"
        },
        {
          "type": "check",
          "mins": 5,
          "unit": "1.2"
        },
        {
          "type": "break",
          "mins": 20,
          "title": "Break",
          "note": "Get away from the screen, have a drink and something to eat."
        },
        {
          "type": "report",
          "mins": 12,
          "report": "1.3a"
        },
        {
          "type": "report",
          "mins": 12,
          "report": "1.3b"
        },
        {
          "type": "check",
          "mins": 5,
          "unit": "1.3"
        },
        {
          "type": "report",
          "mins": 12,
          "report": "1.4"
        },
        {
          "type": "report",
          "mins": 10,
          "report": "1.5"
        },
        {
          "type": "report",
          "mins": 12,
          "report": "1.6"
        },
        {
          "type": "report",
          "mins": 15,
          "report": "Mixed 1",
          "note": "Do the mixed quiz first. This is the real test of the session.",
          "prompt": "Based on everything I have done in this session across Paper 1, list the five topics I should revisit first, in priority order."
        }
      ]
    },
    {
      "id": "paper-2",
      "flexible": true,
      "title": "Paper 2: Algorithms and programming",
      "short": "Paper 2",
      "notebook": "https://notebook.google.com/notebook/eb8d20ec-160f-4f8a-8c55-f23fdd669893",
      "slots": [
        {
          "type": "setup",
          "mins": 5,
          "title": "Get set up",
          "note": "Open the Paper 2 notebook and check it loads. Get some paper and a pen for the practice slots."
        },
        {
          "type": "report",
          "mins": 12,
          "report": "2.1a"
        },
        {
          "type": "practice",
          "mins": 8,
          "activity": "trace-for",
          "unit": "2.1"
        },
        {
          "type": "report",
          "mins": 12,
          "report": "2.1b"
        },
        {
          "type": "practice",
          "mins": 6,
          "activity": "bubble",
          "unit": "2.1"
        },
        {
          "type": "practice",
          "mins": 6,
          "activity": "insertion",
          "unit": "2.1"
        },
        {
          "type": "practice",
          "mins": 6,
          "activity": "merge",
          "unit": "2.1"
        },
        {
          "type": "practice",
          "mins": 6,
          "activity": "binary",
          "unit": "2.1"
        },
        {
          "type": "check",
          "mins": 5,
          "unit": "2.1"
        },
        {
          "type": "report",
          "mins": 12,
          "report": "2.2a"
        },
        {
          "type": "practice",
          "mins": 8,
          "activity": "trace-while",
          "unit": "2.2"
        },
        {
          "type": "practice",
          "mins": 10,
          "activity": "py-total",
          "unit": "2.2"
        },
        {
          "type": "break",
          "mins": 20,
          "title": "Break",
          "note": "Get away from the screen, have a drink and something to eat."
        },
        {
          "type": "report",
          "mins": 12,
          "report": "2.2b"
        },
        {
          "type": "practice",
          "mins": 12,
          "activity": "py-vowels",
          "unit": "2.2"
        },
        {
          "type": "practice",
          "mins": 10,
          "activity": "py-linear",
          "unit": "2.2"
        },
        {
          "type": "report",
          "mins": 10,
          "report": "2.3"
        },
        {
          "type": "practice",
          "mins": 8,
          "activity": "py-age",
          "unit": "2.3"
        },
        {
          "type": "report",
          "mins": 10,
          "report": "2.4"
        },
        {
          "type": "practice",
          "mins": 8,
          "activity": "truth",
          "unit": "2.4"
        },
        {
          "type": "report",
          "mins": 10,
          "report": "2.5"
        },
        {
          "type": "report",
          "mins": 15,
          "report": "Mixed 2",
          "note": "Do the mixed quiz first. This is the real test of the session.",
          "prompt": "Based on everything I have done in this session across Paper 2, list the five topics I should revisit first, in priority order."
        }
      ]
    }
  ],
  /* The wheel: unit, question, the right answer, then three wrong answers (shuffled on screen) */
  quiz: [
    ["1.1", "Which register holds the address of the next instruction to be fetched?", "Program Counter", "Memory Data Register", "Accumulator", "Control Unit"],
    ["1.1", "Which register holds the data or instruction that has just been fetched from memory?", "Memory Data Register", "Memory Address Register", "Program Counter", "Accumulator"],
    ["1.1", "Which register holds the address of the memory location being read from or written to?", "Memory Address Register", "Memory Data Register", "Program Counter", "Accumulator"],
    ["1.1", "Which register stores the results of calculations carried out by the ALU?", "Accumulator", "Memory Address Register", "Program Counter", "Memory Data Register"],
    ["1.1", "What does the Control Unit (CU) do?", "Decodes instructions and sends signals to control other parts", "Carries out arithmetic and logical operations on data", "Stores frequently used instructions close to the CPU", "Holds the address of the next instruction to be fetched"],
    ["1.1", "What is the main job of the ALU (Arithmetic Logic Unit)?", "Carrying out calculations and logical comparisons", "Decoding instructions and managing their execution", "Storing the address of the next instruction", "Holding frequently used data for quick access"],
    ["1.1", "What happens during the fetch stage of the fetch-execute cycle?", "An instruction is copied from memory into the CPU", "The Control Unit decodes what the instruction means", "The CPU carries out the instruction", "The result is saved to secondary storage"],
    ["1.1", "Why does a larger cache usually improve CPU performance?", "More frequently used data can be accessed without going to RAM", "The CPU can carry out more fetch-execute cycles per second", "More programs can be stored permanently inside the CPU", "Each core can process two programs at exactly the same time"],
    ["1.1", "A CPU has a clock speed of 3 GHz. What does this mean?", "It can carry out 3 billion fetch-execute cycles per second", "It can carry out 3 million fetch-execute cycles per second", "It can store 3 billion instructions in its cache", "It has 3 cores that all work at the same time"],
    ["1.1", "A program runs on a quad-core CPU but is not four times faster than on one core. What is the most likely reason?", "The program cannot be split into tasks that run at the same time", "The cores must take turns, so only one core works at a time", "Extra cores only increase the amount of RAM available", "Extra cores only help when copying files to storage"],
    ["1.1", "Which of these is the best example of an embedded system?", "The computer that controls a washing machine", "A desktop computer used for homework", "A laptop used to edit videos", "A tablet used to browse the web"],
    ["1.1", "Which is a typical characteristic of an embedded system?", "It is built inside a larger device to do one specific job", "It can run many different general purpose programs", "It always has a large screen and a full keyboard", "It needs a powerful CPU with lots of cores"],
    ["1.1", "In Von Neumann architecture, how are data and instructions stored?", "Together in the same memory", "In two separate memories with separate buses", "Instructions in the CPU and data in secondary storage", "Data in the cache and instructions only in ROM"],
    ["1.2", "Why do computers need primary storage (memory)?", "To hold the data and instructions the CPU is currently using", "To keep files safe when the power is turned off", "To connect the computer to a network", "To make backup copies of the hard drive"],
    ["1.2", "Which statement about RAM is correct?", "It is volatile, so its contents are lost when the power is off", "It is non-volatile, so it keeps its contents without power", "It can only be read from and never written to", "It permanently stores the computer's start-up instructions"],
    ["1.2", "What is the purpose of ROM in a computer?", "To store the start-up (boot) instructions for the computer", "To hold the programs the user currently has open", "To store the user's documents and photos", "To act as extra memory when RAM is full"],
    ["1.2", "What is virtual memory?", "Part of secondary storage used as extra RAM when RAM is full", "Part of the cache used to store the operating system", "A section of ROM used to store extra programs", "Memory that is stored online using cloud storage"],
    ["1.2", "Why can using a lot of virtual memory make a computer run slowly?", "Secondary storage is much slower to access than RAM", "Virtual memory uses up space in the CPU's cache", "Virtual memory deletes data that is stored in ROM", "The CPU's clock speed drops when RAM is full"],
    ["1.2", "Which of these is the fastest to access?", "Cache", "RAM", "A solid state drive", "A magnetic hard disk drive"],
    ["1.2", "Why do computers need secondary storage?", "To store data and programs when the power is off", "To store the instructions the CPU is running right now", "To speed up the CPU by holding frequently used data", "To hold the start-up instructions in a read-only chip"],
    ["1.2", "Which type of storage uses a laser to read and write data?", "Optical", "Magnetic", "Solid state", "Cache"],
    ["1.2", "A student carries a school project between home and school every day. Which storage is most suitable?", "A USB flash drive", "An internal magnetic hard disk drive", "An internal solid state drive", "A magnetic tape cartridge"],
    ["1.2", "Why are solid state drives more durable than magnetic hard disk drives?", "They have no moving parts", "They are read with a laser instead of a head", "They store data as magnetic patterns", "They have a much larger capacity"],
    ["1.2", "Which type of storage is usually chosen to store many terabytes of data on one device at a low cost per gigabyte?", "Magnetic", "Solid state", "Optical", "ROM"],
    ["1.2", "How many bits are in a nibble?", "4", "8", "2", "16"],
    ["1.2", "How many bytes are in 3 kilobytes, using 1 KB = 1,000 bytes?", "3,000", "24,000", "300", "3,000,000"],
    ["1.2", "Which list of units is in order from smallest to largest?", "Megabyte, gigabyte, terabyte, petabyte", "Megabyte, terabyte, gigabyte, petabyte", "Gigabyte, megabyte, terabyte, petabyte", "Megabyte, gigabyte, petabyte, terabyte"],
    ["1.2", "Why must data be stored in binary in a computer?", "Computer circuits are made of switches that are either on or off", "Binary files are always smaller than denary files", "Binary is easier for people to read than denary", "Binary data cannot be hacked or changed"],
    ["1.2", "What is denary 45 as an 8-bit binary number?", "00101101", "00101011", "00110101", "10110100"],
    ["1.2", "What is the binary number 10011010 in denary?", "154", "89", "150", "162"],
    ["1.2", "What is the hexadecimal number 3C in denary?", "60", "15", "312", "48"],
    ["1.2", "What is denary 200 in hexadecimal?", "C8", "8C", "D0", "B8"],
    ["1.2", "What is the binary number 10110110 in hexadecimal?", "B6", "6B", "A6", "B5"],
    ["1.2", "What is the hexadecimal number 7E in binary?", "01111110", "11100111", "01111101", "01101110"],
    ["1.2", "What is 01101100 + 00110101 in binary?", "10100001", "10100011", "10010001", "10101101"],
    ["1.2", "Which addition of two 8-bit binary numbers causes an overflow error?", "11001000 + 01000000", "01111111 + 01111111", "10000000 + 01111111", "01100100 + 01100100"],
    ["1.2", "What is an overflow error when adding two 8-bit binary numbers?", "The answer needs more than 8 bits, so it cannot be stored", "The answer is rounded down to 255 so that it fits", "The least significant bit is dropped to make room", "The answer is stored in hexadecimal instead of binary"],
    ["1.2", "What is the result of a 2-place left shift on 00010110?", "01011000", "00000101", "00101100", "10110000"],
    ["1.2", "What is the effect of a 3-place right shift on a binary number?", "It divides the number by 8", "It divides the number by 3", "It multiplies the number by 8", "It divides the number by 6"],
    ["1.2", "In the 8-bit binary number 10000001, what is the place value of the most significant bit?", "128", "1", "256", "64"],
    ["1.2", "The ASCII code for 'A' is 65. What is the ASCII code for 'D'?", "68", "67", "69", "100"],
    ["1.2", "Why can Unicode represent many more characters than ASCII?", "It uses more bits for each character", "It stores characters in hexadecimal instead of binary", "It only stores capital letters and digits", "It compresses each character before saving it"],
    ["1.2", "How many different characters can a character set represent using 8 bits per character?", "256", "255", "128", "8"],
    ["1.2", "What is colour depth?", "The number of bits used to store the colour of each pixel", "The number of pixels across the width and height", "The number of pixels in each inch of the image", "The number of separate images stored in one file"],
    ["1.2", "An image is 100 pixels wide and 50 pixels high with a colour depth of 8 bits. Ignoring metadata, what is its file size in bytes?", "5,000 bytes", "40,000 bytes", "625 bytes", "400 bytes"],
    ["1.2", "What happens to an image when its colour depth is increased?", "More colours can be shown and the file size increases", "More colours can be shown and the file size decreases", "The quality improves but the file size stays the same", "The file size increases but fewer colours can be shown"],
    ["1.2", "How many different colours can be shown with a colour depth of 4 bits?", "16", "4", "8", "15"],
    ["1.2", "What does the resolution of an image mean?", "The number of pixels in the image", "The number of bits used for each pixel", "The extra data stored about the image", "The number of colours the image uses"],
    ["1.2", "Which of these is an example of metadata stored with an image?", "The width and height of the image", "The binary code for every pixel", "The size of the screen it is shown on", "The sample rate of the recording"],
    ["1.2", "In sound recording, what is the sample rate?", "The number of samples taken each second", "The number of bits used to store each sample", "The length of the recording in seconds", "The number of speakers the sound plays through"],
    ["1.2", "A sound is recorded at a sample rate of 8,000 Hz with a bit depth of 16 bits for 5 seconds. What is the file size in bits?", "640,000 bits", "80,000 bits", "40,000 bits", "128,000 bits"],
    ["1.2", "Which change would improve the playback quality of a sound recording?", "Increasing the bit depth", "Decreasing the sample rate", "Decreasing the bit depth", "Shortening the duration"],
    ["1.2", "A text file has 2,000 characters stored using 8 bits per character. What is the file size in bytes?", "2,000 bytes", "16,000 bytes", "250 bytes", "8,000 bytes"],
    ["1.2", "A USB drive has 2 GB free. How many 250 MB videos can it hold, using 1 GB = 1,000 MB?", "8", "4", "16", "80"],
    ["1.2", "What is lossy compression?", "Compression that permanently removes some of the data", "Compression that lets the original file be rebuilt exactly", "Compression that adds extra data to correct errors", "Compression that only works on text files"],
    ["1.2", "Why must a program file be compressed using lossless compression?", "Losing any data would stop the program working properly", "Lossless always makes files much smaller than lossy", "Lossy compression can only be used on text files", "Lossless compression removes data that is not needed"],
    ["1.3", "What is a key feature of a LAN (Local Area Network)?", "It covers a small area, such as one building", "It covers a large area, such as a whole country", "It connects devices using only Bluetooth", "It always uses cables rented from a telecoms company"],
    ["1.3", "Which of these is the best example of a WAN (Wide Area Network)?", "The Internet", "The network in a school building", "Computers linked together in a home", "A printer connected to a laptop"],
    ["1.3", "Which is most likely to reduce the performance of a network?", "Lots of devices using the network at once", "Increasing the bandwidth available", "Using wired instead of wireless connections", "Upgrading the switch to a faster one"],
    ["1.3", "What is bandwidth?", "The amount of data that can be sent in a given time", "The physical length of a network cable", "The number of devices on a network", "The number of networks joined to the Internet"],
    ["1.3", "In a client-server network, what does the server do?", "Provides services, such as files, to clients that request them", "Requests services and files from the client computers", "Has equal status with every other computer", "Only connects the network to the Internet"],
    ["1.3", "Which describes a peer-to-peer network?", "All computers have equal status and share resources directly", "One central computer controls access to all the files", "Every computer must log in through a central server", "Only one computer on the network can store files"],
    ["1.3", "What does a switch do in a LAN?", "Sends data to the correct device on the LAN using its MAC address", "Sends data between different networks using IP addresses", "Converts web addresses into IP addresses", "Blocks harmful data from entering the network"],
    ["1.3", "What is the main job of a router?", "To send data packets between different networks", "To send data only between devices on the same LAN", "To give each device its MAC address", "To store web pages for clients to view"],
    ["1.3", "What is the purpose of a NIC (Network Interface Card)?", "To let a device connect to a network", "To translate domain names into IP addresses", "To store copies of web pages for faster loading", "To stop unauthorised access to a network"],
    ["1.3", "What does a wireless access point do?", "Lets wireless devices connect to a wired network", "Converts URLs into IP addresses for browsers", "Gives each device on the network its MAC address", "Scans data for viruses before it enters the network"],
    ["1.3", "What is the role of DNS (Domain Name Server)?", "To convert a URL into an IP address", "To convert an IP address into a MAC address", "To store all the web pages on the Internet", "To encrypt data sent between web browsers"],
    ["1.3", "Which is a disadvantage of storing files in the cloud?", "You need an Internet connection to access them", "Files can only be opened on one device", "You must buy and look after your own servers", "Storage space cannot be increased once set up"],
    ["1.3", "What does it mean when a website is hosted?", "Its files are stored on a server connected to the Internet", "Its address is turned into an IP address by a router", "Its files are stored on each visitor's computer forever", "It is protected by a firewall on the user's computer"],
    ["1.3", "In a star topology, what happens if the central switch fails?", "None of the connected devices can communicate", "Only the device nearest the switch is affected", "Data is sent along a different route instead", "The devices automatically connect to each other directly"],
    ["1.3", "What is an advantage of a mesh topology?", "If one connection fails, data can take another route", "It needs fewer cables than any other topology", "It is the cheapest topology to set up", "All data passes through one central device"],
    ["1.3", "Which is an advantage of a wired Ethernet connection over Wi-Fi?", "It is usually faster and more reliable", "Devices can be moved around freely", "It needs no cables to be installed", "It is easier to connect phones and tablets"],
    ["1.3", "Which connection is most suitable for linking wireless headphones to a phone?", "Bluetooth", "Ethernet", "Fibre optic cable", "Wi-Fi"],
    ["1.3", "Which of these is a valid IPv4 address?", "192.168.1.20", "192.168.1.300", "192.168.1", "00:1A:2B:3C:4D:5E"],
    ["1.3", "Why was IPv6 introduced?", "IPv4 does not have enough unique addresses for all devices", "IPv4 addresses cannot be used over Wi-Fi", "IPv6 addresses are shorter and easier to remember", "IPv4 can only be used on local area networks"],
    ["1.3", "Which statement about MAC addresses is correct?", "They are given to a device's network hardware when it is made", "They change every time a device joins a new network", "They are written as four denary numbers from 0 to 255", "They are given out to devices by DNS servers"],
    ["1.3", "How is a MAC address usually written?", "As 6 pairs of hexadecimal digits", "As 4 denary numbers separated by dots", "As 8 groups of 4 hexadecimal digits", "As a single 8-bit binary number"],
    ["1.3", "What is a protocol?", "A set of rules for how data is transferred", "A piece of hardware that connects networks", "A program that blocks harmful data", "A unique address given to each device"],
    ["1.3", "Why are standards important in computing?", "They let hardware and software from different makers work together", "They stop people from copying software without permission", "They make every computer run at exactly the same speed", "They make sure every device is given the same IP address"],
    ["1.3", "What is the difference between HTTP and HTTPS?", "HTTPS encrypts the data sent between browser and server", "HTTPS is used to send emails instead of web pages", "HTTPS is faster because it compresses web pages", "HTTPS can only be used on local area networks"],
    ["1.3", "Which protocol is used to transfer files between computers over a network?", "FTP", "SMTP", "IMAP", "POP"],
    ["1.3", "Which protocol is used to send emails?", "SMTP", "POP", "IMAP", "FTP"],
    ["1.3", "Which email protocol keeps emails on the server so they can be read on several devices?", "IMAP", "POP", "SMTP", "FTP"],
    ["1.3", "Which protocol suite controls how data is split into packets and sent across the Internet?", "TCP/IP", "HTTP", "FTP", "IMAP"],
    ["1.3", "What is a benefit of using layers in network protocols?", "One layer can be changed without affecting the others", "Data is encrypted again at every layer", "Only one protocol is needed for everything", "Data no longer needs to be split into packets"],
    ["1.3", "Why is data encrypted before it is sent over a network?", "So intercepted data cannot be understood without the key", "So the data takes up less bandwidth", "So the data cannot be intercepted at all", "So the data reaches its destination faster"],
    ["1.4", "What is phishing?", "Fake messages that trick people into giving away personal details", "Trying every possible password until the right one is found", "Flooding a server with requests so it stops working", "Typing SQL code into a website's input box"],
    ["1.4", "What is a brute-force attack?", "Trying many passwords one after another until one works", "Tricking a user into telling you their password", "Overloading a server with fake requests", "Hiding harmful code inside a useful program"],
    ["1.4", "What is the aim of a denial of service attack?", "To stop users from accessing a website or service", "To steal personal data from a database", "To guess a user's password by trial and error", "To read data as it travels across a network"],
    ["1.4", "What is SQL injection?", "Typing SQL commands into an input box to access or change a database", "Sending fake emails that look like they come from a bank", "Plugging extra cables into a network to copy its data", "Installing software that records every key that is pressed"],
    ["1.4", "Why are people often called the 'weak point' in network security?", "They can be tricked into giving away information or access", "They cause most of the hardware failures on networks", "They are the only way malware can get into a network", "They process data much more slowly than computers"],
    ["1.4", "What is malware?", "Software designed to harm a computer or gain access without permission", "Software that tests a network for weaknesses with permission", "Hardware that blocks unwanted traffic from entering a network", "Software that scrambles data to keep it secure"],
    ["1.4", "What is penetration testing?", "Authorised attempts to find weaknesses before attackers do", "Checking that a program's code has no syntax errors", "Scanning files to find and remove viruses", "Blocking unauthorised data from entering a network"],
    ["1.4", "What does a firewall do?", "Checks network traffic and blocks anything that is not allowed", "Scans files on a computer to find and remove viruses", "Scrambles data so that it cannot be understood", "Makes backup copies of data in case it is lost"],
    ["1.4", "What is the purpose of user access levels?", "To control which data and files each user can view or change", "To set how fast each user's network connection is", "To encrypt each user's files automatically", "To limit how many users can log in at once"],
    ["1.4", "Which of these makes a brute-force attack less likely to succeed?", "Locking the account after several wrong attempts", "Using a short password that is easy to remember", "Using the same password on every account", "Keeping the password written next to the computer"],
    ["1.4", "Which is an example of physical security?", "Locking the server room and using key cards", "Installing anti-malware software", "Setting up a firewall", "Encrypting the hard drive"],
    ["1.4", "Which method best protects data that might be intercepted while it is being sent?", "Encryption", "User access levels", "Anti-malware software", "Penetration testing"],
    ["1.5", "What is the purpose of the user interface in an operating system?", "To let the user interact with the computer", "To translate programs into machine code", "To share memory between running programs", "To connect the computer to other networks"],
    ["1.5", "How does an operating system allow multitasking?", "It shares memory and CPU time between several programs", "It adds extra cores to the CPU when they are needed", "It closes one program before another one can open", "It copies every open program into ROM"],
    ["1.5", "What is the purpose of a device driver?", "To let the operating system communicate with a hardware device", "To supply power to a device when it is plugged in", "To protect the computer from malware on USB drives", "To compress files before they are sent to a printer"],
    ["1.5", "Which is an example of user management by an operating system?", "Setting up accounts and access rights for each user", "Moving files into folders and renaming them", "Sharing out memory between open programs", "Installing drivers for a new keyboard"],
    ["1.5", "Which is an example of file management by an operating system?", "Naming, moving and saving files in folders", "Allocating memory to programs that are running", "Creating user accounts with passwords", "Sending data to and from a printer"],
    ["1.5", "What is utility software?", "Software that does housekeeping tasks to help maintain the computer", "Software used to create documents and presentations", "Software that translates source code into machine code", "Software that a user must write for themselves"],
    ["1.5", "What does defragmentation software do?", "Puts the scattered parts of each file back together on a hard disk", "Removes some data from files so they take up less space", "Scrambles files so they cannot be read without the key", "Deletes duplicate copies of files to free up storage space"],
    ["1.5", "Why is defragmentation useful on a magnetic hard disk drive?", "The read/write head moves less, so files load faster", "It makes every file take up less storage space", "It removes viruses hidden in parts of files", "It stops data being lost when the power is off"],
    ["1.5", "Why might someone use data compression software?", "To reduce file size so files take up less storage space", "To make files secure so others cannot read them", "To move the parts of a file closer together on a disk", "To increase the quality of photos and videos"],
    ["1.5", "What is the purpose of encryption software?", "To scramble data so only someone with the key can read it", "To reduce the size of files before they are saved", "To find and remove viruses from a computer", "To reorganise files stored on a hard disk"],
    ["1.6", "Under the Computer Misuse Act 1990, which of these is illegal?", "Accessing a computer system without permission", "Copying a film and sharing it online", "Keeping personal data for longer than needed", "Using open source software in a business"],
    ["1.6", "Under the Copyright Designs and Patents Act 1988, which of these is illegal?", "Sharing copies of a music album without permission", "Logging in to someone else's account without permission", "Storing customers' data without keeping it secure", "Changing the code of open source software"],
    ["1.6", "Which is a principle of the Data Protection Act 2018?", "Personal data must be kept secure and up to date", "Personal data can be kept for as long as a company likes", "Personal data can be shared with any company that asks", "Personal data must be stored on paper, not computers"],
    ["1.6", "A shop keeps customers' addresses on an unprotected laptop, which is then stolen. Which law has the shop most likely broken?", "Data Protection Act 2018", "Computer Misuse Act 1990", "Copyright Designs and Patents Act 1988", "No law, because only the thief is to blame"],
    ["1.6", "Which is a feature of open source software?", "Users can see and change the source code", "The source code is kept secret by the company", "It must always be bought from a shop", "It can never be shared with other people"],
    ["1.6", "Which is a feature of proprietary software?", "Users cannot see or change the source code", "Anyone can change and share the source code", "It is always free to download and use", "It never comes with support or updates"],
    ["1.6", "What is the purpose of a software licence?", "To set out how the software can legally be used", "To prove that the software is free from viruses", "To make the software run faster on a computer", "To list the minimum hardware the software needs"],
    ["1.6", "Which is an environmental impact of digital technology?", "Old devices create e-waste that contains harmful chemicals", "Some people cannot afford to buy new devices", "Personal data may be shared without consent", "Workers may lose their jobs to automated machines"],
    ["1.6", "What is meant by the digital divide?", "The gap between people who have access to technology and those who do not", "The difference in speed between RAM and secondary storage", "The split between open source and proprietary software", "The gap between wired and wireless network speeds"],
    ["1.6", "Which is an example of a privacy issue?", "An app tracking a user's location without them knowing", "A factory using lots of electricity to make phones", "Old laptops being thrown into landfill", "Robots replacing workers in a warehouse"],
    ["1.6", "A supermarket replaces its checkout staff with self-service tills. What type of issue is this mainly?", "Ethical", "Environmental", "Legal", "Privacy"],
    ["2.1", "What is abstraction?", "Removing unnecessary details to focus on what is important", "Breaking a problem down into smaller parts", "Writing out the steps to solve a problem in order", "Testing a program to find and fix errors"],
    ["2.1", "What is decomposition?", "Breaking a problem down into smaller, more manageable parts", "Removing details that are not needed to solve the problem", "Putting a list of data into ascending order", "Finding and fixing the errors in a program's code"],
    ["2.1", "A train map shows the stations and lines but not the streets or buildings. Which principle is this?", "Abstraction", "Decomposition", "Algorithmic thinking", "Iteration"],
    ["2.1", "What is algorithmic thinking?", "Working out the steps needed to solve a problem", "Hiding details that are not needed", "Splitting a problem into sub-problems", "Choosing the best programming language"],
    ["2.1", "Which flowchart symbol is used for a decision?", "A diamond", "A rectangle", "A parallelogram", "A rounded rectangle"],
    ["2.1", "In a flowchart, what is a parallelogram used for?", "Input or output", "A decision", "The start or end", "A process"],
    ["2.1", "What must be true before a binary search can be used?", "The data must be sorted into order", "The data must contain only numbers", "The list must have an even number of items", "The item must definitely be in the list"],
    ["2.1", "In a binary search, which item is checked first?", "The middle item", "The first item", "The last item", "A random item"],
    ["2.1", "A binary search looks for 31 in the list 3, 8, 12, 19, 25, 31, 40. Which items are checked, in order?", "19, then 31", "3, 8, 12, 19, 25, then 31", "19, then 25, then 31", "25, then 31"],
    ["2.1", "How does a linear search work?", "Each item is checked in turn from the start until it is found", "The middle item is checked and half of the list is discarded", "Pairs of items are compared and swapped if needed", "The list is split into single items and merged back"],
    ["2.1", "Which is an advantage of a linear search over a binary search?", "It works on data that is not sorted", "It is always faster on large lists", "It checks fewer items on average", "It only needs to check the middle item"],
    ["2.1", "How does a bubble sort work?", "Compares pairs of items next to each other and swaps them if in the wrong order", "Splits the list into single items and merges them back in order", "Takes each item in turn and inserts it into the correct place", "Checks the middle item and throws away half of the list"],
    ["2.1", "A bubble sort puts 5, 2, 4, 1 into ascending order. What does the list look like after the first pass?", "2, 4, 1, 5", "1, 2, 4, 5", "2, 5, 4, 1", "2, 1, 4, 5"],
    ["2.1", "What is the first stage of a merge sort?", "Split the list in half again and again until each list has one item", "Compare the first two items and swap them if needed", "Find the smallest item and move it to the front", "Check the middle item against the item being searched for"],
    ["2.1", "Which is an advantage of a merge sort over a bubble sort?", "It is usually much faster on large lists", "It always uses less memory", "Its code is simpler to write", "It only works on lists that are nearly sorted"],
    ["2.1", "How does an insertion sort work?", "Takes each item in turn and puts it in the correct place in the sorted part", "Compares pairs of items next to each other and swaps them", "Splits the list into halves and then merges them back together", "Swaps the first and last items until the list is sorted"],
    ["2.1", "An insertion sort puts 4, 1, 3, 2 into ascending order. What does the list look like just after the 3 has been inserted?", "1, 3, 4, 2", "1, 4, 3, 2", "1, 2, 3, 4", "3, 1, 4, 2"],
    ["2.1", "What is a trace table used for?", "Following an algorithm step by step, recording variable values", "Listing the test data and the expected result for each test", "Showing how a problem is broken down into sub-sections", "Showing the output of a logic gate for every set of inputs"],
    ["2.1", "What does a structure diagram show?", "How a problem is broken down into smaller sub-sections", "The order in which every line of code is run", "The values of variables as a program runs", "The inputs and outputs of each logic gate"],
    ["2.1", "A program asks for the length and width of a room and shows its area. What is the process?", "Multiplying the length by the width", "Entering the length and the width", "Showing the area on the screen", "Saving the program to a hard disk"],
    ["2.2", "What is the result of 17 MOD 5?", "2", "3", "3.4", "12"],
    ["2.2", "What is the result of 23 DIV 4?", "5", "3", "5.75", "6"],
    ["2.2", "What is the value of 2 ^ 5?", "32", "10", "7", "25"],
    ["2.2", "In OCR Exam Reference Language, what is the result of 20 / 8?", "2.5", "2", "4", "2.4"],
    ["2.2", "Which expression is True when num is an even number?", "num MOD 2 == 0", "num DIV 2 == 0", "num MOD 2 == 1", "num / 2 == 0"],
    ["2.2", "Which operator means 'not equal to' in OCR Exam Reference Language?", "!=", "<>", "=!", "=="],
    ["2.2", "What is a constant?", "A named value that cannot change while the program is running", "A named value that can change while the program is running", "A value that is typed in by the user", "A value that must always be a whole number"],
    ["2.2", "What does the line x = x + 1 do?", "Adds 1 to the value stored in x", "Checks whether x is equal to x + 1", "Creates a new variable called x + 1", "Prints the value of x plus 1"],
    ["2.2", "Which programming construct is used to make a decision, such as with an if statement?", "Selection", "Sequence", "Iteration", "Casting"],
    ["2.2", "What type of loop is a for loop?", "Count-controlled", "Condition-controlled", "Selection", "Sequence"],
    ["2.2", "How many times does a loop starting for i = 0 to 4 run?", "5", "4", "6", "3"],
    ["2.2", "Which values does i take in the loop for i = 2 to 8 step 3?", "2, 5, 8", "2, 5", "3, 6", "2, 4, 6, 8"],
    ["2.2", "How is a do ... until loop different from a while loop?", "It always runs at least once before the condition is checked", "It checks the condition before running any code", "It can only run a fixed number of times", "It cannot be stopped once it has started"],
    ["2.2", "Which data type is most suitable for storing the price of a cinema ticket, such as 7.50?", "Real", "Integer", "Boolean", "Character"],
    ["2.2", "Which data type is most suitable for storing whether a student is present or absent?", "Boolean", "Integer", "Real", "Character"],
    ["2.2", "Which data type should be used to store a phone number such as 07700 900123?", "String", "Integer", "Real", "Boolean"],
    ["2.2", "What does int(\"42\") do?", "Converts the string \"42\" into the integer 42", "Converts the integer 42 into a string", "Checks whether \"42\" is an integer", "Rounds 42 to the nearest whole number"],
    ["2.2", "What is output by print(str(7) + str(3))?", "73", "10", "7 + 3", "21"],
    ["2.2", "If word = \"Revision\", what is word.length?", "8", "7", "9", "10"],
    ["2.2", "If word = \"Computer\", what does word.substring(3, 4) return?", "\"pute\"", "\"mput\"", "\"pu\"", "\"uter\""],
    ["2.2", "If subject = \"Science\", what does subject.left(3) return?", "\"Sci\"", "\"nce\"", "\"Scie\"", "\"cie\""],
    ["2.2", "ASC('A') returns 65. What does CHR(66) return?", "'B'", "'C'", "'A'", "'b'"],
    ["2.2", "Which line correctly opens a file called scores.txt in OCR Exam Reference Language?", "myFile = open(\"scores.txt\")", "open(\"scores.txt\") = myFile", "myFile = close(\"scores.txt\")", "myFile = scores.txt.open"],
    ["2.2", "In OCR Exam Reference Language, where does myFile.writeLine(\"Hi\") add the text?", "At the end of the file", "At the start of the file", "In place of the first line", "In a brand new file"],
    ["2.2", "Why should a file be closed after a program has finished using it?", "So changes are saved and other programs can use the file", "So the file is removed from secondary storage", "So all the data in the file is encrypted", "So the file opens more quickly the next time"],
    ["2.2", "What is a record?", "A group of related fields about one item, which can be different data types", "A list of items that must all be the same data type, like an array", "A single piece of data, such as one person's name", "A file that holds many separate tables of data"],
    ["2.2", "If colours = [\"Red\", \"Blue\", \"Green\"], what is colours[1]?", "\"Blue\"", "\"Red\"", "\"Green\"", "\"colours\""],
    ["2.2", "The line array scores[5] creates an array. What are its index numbers?", "0 to 4", "1 to 5", "0 to 5", "1 to 4"],
    ["2.2", "Why are 2D arrays useful?", "They can store data like a table with rows and columns", "They can store a different data type in each element", "They can change size while the program is running", "They keep their data saved after the program ends"],
    ["2.2", "Which SQL statement returns the names of Year 11 students from a table called Students?", "SELECT Name FROM Students WHERE Year = 11", "SELECT Students FROM Name WHERE Year = 11", "SELECT Name WHERE Year = 11 FROM Students", "FROM Students SELECT Name WHERE Year = 11"],
    ["2.2", "What does SELECT * FROM Pets return?", "Every field of every record in the Pets table", "Only the first record in the Pets table", "Only the first field of each record", "The number of records in the Pets table"],
    ["2.2", "What is the main difference between a function and a procedure?", "A function returns a value but a procedure does not", "A procedure returns a value but a function does not", "A function cannot be given any parameters", "A procedure can only be called once"],
    ["2.2", "What is a local variable?", "A variable that can only be used inside the subprogram where it is declared", "A variable that can be used anywhere in the whole program", "A variable whose value can never be changed", "A variable that is saved in a file when the program ends"],
    ["2.2", "In procedure greet(name), what is name?", "A parameter", "A return value", "A constant", "A global variable"],
    ["2.2", "In OCR Exam Reference Language, what could myNum = random(1, 6) give?", "Any whole number from 1 to 6", "Any whole number from 1 to 5", "Any whole number from 0 to 6", "Any whole number from 2 to 5"],
    ["2.3", "What is input validation?", "Checking that input data is sensible and follows set rules", "Checking that the user is who they say they are", "Checking that input data is definitely correct", "Encrypting input data before it is stored"],
    ["2.3", "What is the purpose of authentication?", "To confirm the identity of a user", "To check that an input is in the correct range", "To stop the program crashing when errors happen", "To make the code easier for others to read"],
    ["2.3", "An age entered into a program must be between 11 and 18. Which validation check is this?", "Range check", "Length check", "Presence check", "Format check"],
    ["2.3", "A program accepts whole numbers from 1 to 100. Which of these is boundary test data?", "100", "50", "fifty", "150"],
    ["2.3", "A program accepts whole numbers from 1 to 10. Which of these is invalid test data, as OCR defines it?", "25", "7", "1", "seven"],
    ["2.3", "A program asks for an age in whole years. Which of these is erroneous test data?", "twelve", "12", "-5", "150"],
    ["2.3", "What is iterative testing?", "Testing each part of a program while it is being developed", "Testing the whole program once it is finished", "Testing a program only with data that should be rejected", "Testing a program only after users start using it"],
    ["2.3", "What is a syntax error?", "An error that breaks the rules of the language, so the code will not run", "An error that makes the program run but give the wrong output", "An error caused by the user typing in the wrong data", "An error that only appears after the program has finished"],
    ["2.3", "Which of these is a logic error?", "Using + instead of * so the program shows the wrong total", "Spelling print as prnit", "Leaving out a closing bracket", "Missing out the endif at the end of an if statement"],
    ["2.3", "Why do programmers add comments to their code?", "To explain what the code does so it is easier to understand later", "To make the finished program run more quickly", "To stop other people from copying the code", "To check the code for any syntax errors before it runs"],
    ["2.3", "Which variable name follows good naming conventions?", "totalScore", "x", "thing", "a1"],
    ["2.3", "How do subprograms make a program easier to maintain?", "Code is written once, can be reused and can be tested on its own", "They remove the need for any comments in the code", "They stop syntax errors from happening", "They make the finished program run faster"],
    ["2.3", "Which is an example of anticipating misuse?", "Limiting the number of wrong password attempts", "Adding comments to explain the code", "Indenting the code inside loops", "Giving variables meaningful names"],
    ["2.4", "Which inputs make A AND B equal to 1?", "A = 1 and B = 1", "A = 1 and B = 0", "A = 0 and B = 1", "A = 0 and B = 0"],
    ["2.4", "Which inputs make A OR B equal to 0?", "A = 0 and B = 0", "A = 1 and B = 0", "A = 0 and B = 1", "A = 1 and B = 1"],
    ["2.4", "What does a NOT gate do?", "Outputs the opposite of its single input", "Outputs 1 only when both inputs are 1", "Outputs 1 when at least one input is 1", "Outputs 0 whatever the input is"],
    ["2.4", "P = NOT (A AND B). Which inputs make P equal to 0?", "A = 1 and B = 1", "A = 0 and B = 0", "A = 1 and B = 0", "A = 0 and B = 1"],
    ["2.4", "P = (A OR B) AND (NOT C). Which inputs make P equal to 1?", "A = 1, B = 0, C = 0", "A = 1, B = 1, C = 1", "A = 0, B = 0, C = 0", "A = 0, B = 1, C = 1"],
    ["2.4", "P = A AND (B OR C). Which inputs make P equal to 0?", "A = 0, B = 1, C = 1", "A = 1, B = 1, C = 0", "A = 1, B = 0, C = 1", "A = 1, B = 1, C = 1"],
    ["2.4", "How many rows, not counting the heading, does a truth table with 3 inputs need?", "8", "6", "3", "16"],
    ["2.4", "In the truth table for A OR B, how many rows have an output of 1?", "3", "1", "2", "4"],
    ["2.4", "A light (L) turns on when switch A or switch B is pressed. Which expression matches this?", "L = A OR B", "L = A AND B", "L = NOT (A OR B)", "L = A AND (NOT B)"],
    ["2.4", "An alarm (Z) sounds when the door is open (D) and the alarm is set (S). Which expression matches this?", "Z = D AND S", "Z = D OR S", "Z = (NOT D) AND S", "Z = D AND (NOT S)"],
    ["2.4", "A and B go into an AND gate, and its output goes into a NOT gate. Which expression matches this diagram?", "NOT (A AND B)", "(NOT A) AND B", "NOT (A OR B)", "(NOT A) AND (NOT B)"],
    ["2.4", "If x = 4, which of these expressions is True?", "(x > 3) AND (x < 5)", "(x > 4) OR (x == 5)", "NOT (x == 4)", "(x < 3) AND (x > 1)"],
    ["2.4", "If a = True and b = False, which of these expressions is True?", "a OR b", "a AND b", "NOT a", "NOT (a OR b)"],
    ["2.5", "Which is a characteristic of a high-level language?", "It uses English-like words and must be translated before it runs", "It is written in binary that the CPU can run directly", "Each instruction matches exactly one machine code instruction", "It is designed to work on only one type of processor"],
    ["2.5", "Why might a programmer choose a low-level language?", "To control the hardware directly and make code run efficiently", "To make the code easier for other people to read", "To run the same code on any type of processor", "To get help from clear, built-in error messages"],
    ["2.5", "Why are translators needed?", "To convert source code into machine code the CPU can run", "To convert machine code into English for the user", "To find and remove every logic error in a program", "To compress code so it uses less memory"],
    ["2.5", "How does a compiler translate code?", "It translates the whole program into machine code in one go", "It translates and runs the program one line at a time", "It only translates the lines that contain errors", "It turns machine code back into source code"],
    ["2.5", "Which is an advantage of using an interpreter while developing a program?", "It stops at the line with an error, making it easier to find", "It creates an executable file that runs without the translator", "The program runs faster than the same compiled code", "The source code is hidden from anyone who uses the program"],
    ["2.5", "Which is an advantage of giving users a compiled program?", "They can run it without needing the translator", "They can easily read and change the source code", "Errors are shown to them one line at a time", "It will run on any type of processor"],
    ["2.5", "Which IDE tool lets a programmer type and change code, often with colour-coded keywords?", "Editor", "Run-time environment", "Error diagnostics", "Translator"],
    ["2.5", "What do error diagnostics in an IDE do?", "Highlight errors and give information to help fix them", "Translate the whole program into machine code", "Add comments to the code automatically", "Store backup copies of the code online"],
    ["2.5", "What is the purpose of a run-time environment in an IDE?", "To let the programmer run and test code inside the IDE", "To let the programmer type code with colour-coded keywords", "To convert the code into a different high-level language", "To share the finished program with other users"],
    ["2.5", "Which IDE feature lets a programmer pause a program at a chosen line to check the values of variables?", "A breakpoint", "Syntax highlighting", "Auto-indentation", "Auto-complete"]
  ]
};
