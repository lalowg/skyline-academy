/* SKYLINE ACADEMY — sample curriculum.
   All subjects, courses and pathways are fictional sample content for a portfolio concept. */

export const LEVELS = ['Foundation', 'Intermediate', 'Advanced'];

/* Each subject is a constellation: a position in space, a sky coordinate
   (decorative), and six courses with local offsets that draw its figure. */
export const SUBJECTS = [
  {
    id: 'science', name: 'Science', colour: '#7CC4FF', coord: 'RA 02h 14m · Dec +18°',
    pos: [-15, 4, -6], blurb: 'How the physical world works, from atoms to climate, taught through observation and small experiments.',
    figure: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]],
    courses: [
      { id: 'phys', title: 'Foundations of Physics', level: 0, weeks: 8, hrs: 4, off: [-3, 1.4, 0.4], blurb: 'Motion, energy and waves, built up from things you can test on a desk.', mods: ['Forces you can feel', 'Energy and its disguises', 'Waves, sound and light'] },
      { id: 'chem', title: 'Chemistry of Materials', level: 1, weeks: 8, hrs: 5, off: [-1.4, 2.6, -0.6], blurb: 'Why steel bends, glass shatters and plastics last — the chemistry inside everyday materials.', mods: ['Bonds and structure', 'Metals, ceramics, polymers', 'Choosing a material'] },
      { id: 'astro', title: 'Astronomy: Reading the Sky', level: 0, weeks: 6, hrs: 3, off: [0.6, 1.2, 0.8], blurb: 'Find your way around the night sky and understand what you are looking at.', mods: ['The celestial sphere', 'Planets and seasons', 'Light from far away'] },
      { id: 'climate', title: 'Earth Systems & Climate', level: 1, weeks: 10, hrs: 4, off: [2.4, -0.4, -0.2], blurb: 'Atmosphere, oceans and ice as one connected system, and how we measure change.', mods: ['Energy balance', 'Carbon and water cycles', 'Reading climate data'] },
      { id: 'stats', title: 'Statistics for Scientists', level: 1, weeks: 8, hrs: 5, off: [3.6, 1.6, 0.6], blurb: 'Distributions, uncertainty and inference, explained with real measurements rather than abstract symbols.', mods: ['Describing data', 'Uncertainty and error', 'Testing an idea'] },
      { id: 'research', title: 'Research Methods', level: 2, weeks: 10, hrs: 6, off: [1.2, -2.4, 1.0], blurb: 'Design a study, keep a lab notebook and write up findings others can check.', mods: ['Asking a testable question', 'Designing the study', 'Writing it up'] },
    ],
  },
  {
    id: 'technology', name: 'Technology', colour: '#59D6E8', coord: 'RA 07h 40m · Dec −06°',
    pos: [-4, -6, 5], blurb: 'Programming, data and the systems behind the internet, for people who want to build things that work.',
    figure: [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5]],
    courses: [
      { id: 'python', title: 'Python from Zero', level: 0, weeks: 8, hrs: 5, off: [-3.2, 0.2, 0], blurb: 'Your first programming language, one small working program at a time.', mods: ['Values, names and loops', 'Functions and files', 'A tool of your own'] },
      { id: 'web', title: 'Web Foundations', level: 0, weeks: 8, hrs: 5, off: [-1.2, 1.6, 0.8], blurb: 'HTML, CSS and JavaScript from the ground up, ending with a site you publish yourself.', mods: ['Structure with HTML', 'Layout with CSS', 'Behaviour with JavaScript'] },
      { id: 'data', title: 'Data Analysis with Python', level: 1, weeks: 10, hrs: 6, off: [1.0, 2.8, -0.4], blurb: 'Clean, explore and summarise real datasets with notebooks and pandas.', mods: ['Loading and cleaning', 'Grouping and joining', 'Answering a question'] },
      { id: 'ml', title: 'Machine Learning Concepts', level: 2, weeks: 10, hrs: 6, off: [3.4, 2.0, 0.6], blurb: 'What models learn, how they fail, and how to evaluate them honestly.', mods: ['Learning from examples', 'Overfitting and evaluation', 'Responsible deployment'] },
      { id: 'cloud', title: 'Cloud & Networks', level: 1, weeks: 6, hrs: 4, off: [0.4, -1.4, -0.8], blurb: 'How data travels, where it lives and what really happens when you open a web page.', mods: ['Packets and protocols', 'Servers and the cloud', 'Reliability basics'] },
      { id: 'security', title: 'Cybersecurity Essentials', level: 1, weeks: 6, hrs: 4, off: [2.6, -2.6, 0.4], blurb: 'Threats, defences and good habits for people and small teams.', mods: ['How attacks work', 'Defence in layers', 'Security as a habit'] },
    ],
  },
  {
    id: 'design', name: 'Design', colour: '#FF7A59', coord: 'RA 11h 05m · Dec +22°',
    pos: [8, 6, -2], blurb: 'Visual, interaction and information design, practised through briefs, critique and iteration.',
    figure: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [4, 5]],
    courses: [
      { id: 'visual', title: 'Visual Design Fundamentals', level: 0, weeks: 6, hrs: 4, off: [-2.6, 1.2, 0.2], blurb: 'Colour, contrast, hierarchy and composition — the grammar of everything you see.', mods: ['Seeing hierarchy', 'Colour with intent', 'Composition and space'] },
      { id: 'type', title: 'Typography & Layout', level: 1, weeks: 6, hrs: 4, off: [-0.6, 2.8, -0.6], blurb: 'Choose, pair and set type, then build grids that hold a whole publication together.', mods: ['Anatomy and choice', 'Rhythm and measure', 'Grids that flex'] },
      { id: 'ux', title: 'UX Research Methods', level: 1, weeks: 8, hrs: 4, off: [1.2, 1.0, 0.8], blurb: 'Interviews, usability tests and synthesis that turn opinions into evidence.', mods: ['Planning research', 'Running sessions', 'From notes to insight'] },
      { id: 'ixd', title: 'Interaction Design', level: 1, weeks: 8, hrs: 5, off: [-0.8, -0.8, 0.4], blurb: 'Flows, states and feedback, prototyped and tested until they feel obvious.', mods: ['Flows and states', 'Prototyping', 'Feedback and motion'] },
      { id: 'dataviz', title: 'Data Visualisation', level: 2, weeks: 8, hrs: 5, off: [3.2, -0.6, -0.4], blurb: 'Charts that tell the truth clearly: choosing forms, encoding data and annotating.', mods: ['Choosing a chart', 'Encoding and colour', 'Annotation and story'] },
      { id: 'systems', title: 'Design Systems', level: 2, weeks: 6, hrs: 4, off: [4.4, -2.4, 0.6], blurb: 'Tokens, components and documentation that let a team design as one.', mods: ['Tokens and foundations', 'Components', 'Governance'] },
    ],
  },
  {
    id: 'business', name: 'Business', colour: '#FFB59E', coord: 'RA 15h 32m · Dec −12°',
    pos: [16, -4, -9], blurb: 'How organisations make, sell and grow — with projects you could run on Monday morning.',
    figure: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [1, 4]],
    courses: [
      { id: 'bizfound', title: 'Business Foundations', level: 0, weeks: 6, hrs: 3, off: [-3, -0.6, 0.4], blurb: 'Customers, value, costs and competition: the vocabulary of every business conversation.', mods: ['What a business is', 'Value and customers', 'Costs and margins'] },
      { id: 'finlit', title: 'Financial Literacy for Teams', level: 0, weeks: 6, hrs: 3, off: [-1.4, 1.4, -0.4], blurb: 'Read a budget and a profit-and-loss statement with confidence. Educational only — not financial advice.', mods: ['Budgets', 'Reading statements', 'Cash flow basics'] },
      { id: 'marketing', title: 'Marketing Strategy', level: 1, weeks: 8, hrs: 4, off: [0.6, 2.6, 0.6], blurb: 'Positioning, audiences and channels — and how to tell if any of it is working.', mods: ['Positioning', 'Audiences and channels', 'Measuring honestly'] },
      { id: 'product', title: 'Product Management', level: 1, weeks: 8, hrs: 5, off: [2.6, 1.0, -0.2], blurb: 'Discovery, prioritisation and delivery, with the trade-offs made visible.', mods: ['Discovery', 'Prioritising', 'Shipping and learning'] },
      { id: 'venture', title: 'Entrepreneurship Studio', level: 2, weeks: 12, hrs: 6, off: [3.4, -1.6, 0.8], blurb: 'Take an idea from interview notes to a tested proposition in twelve weeks.', mods: ['Problem interviews', 'Prototype and price', 'Pitch and next steps'] },
      { id: 'lead', title: 'Leading Projects', level: 2, weeks: 6, hrs: 4, off: [0.8, -2.4, -0.6], blurb: 'Plans, people and risk: running projects that finish without burning anyone out.', mods: ['Scoping', 'Running the team', 'Risk and change'] },
    ],
  },
  {
    id: 'humanities', name: 'Humanities', colour: '#CFE8FF', coord: 'RA 19h 48m · Dec +34°',
    pos: [2, 11, -15], blurb: 'Reasoning, writing and the history of ideas — the skills that make every other subject sharper.',
    figure: [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5]],
    courses: [
      { id: 'think', title: 'Critical Thinking', level: 0, weeks: 6, hrs: 3, off: [-0.4, 0.4, 0.6], blurb: 'Spot weak arguments, including your own, and build stronger ones.', mods: ['Claims and evidence', 'Common fallacies', 'Arguing well'] },
      { id: 'ideas', title: 'History of Ideas', level: 0, weeks: 8, hrs: 3, off: [-2.6, 1.8, -0.2], blurb: 'Big ideas that changed how people live, told as a story with primary sources.', mods: ['Ancient questions', 'Revolutions in thought', 'Modern debates'] },
      { id: 'ethics', title: 'Ethics in Technology', level: 1, weeks: 6, hrs: 3, off: [-4.2, -0.2, 0.4], blurb: 'Privacy, fairness and responsibility, examined through real design decisions.', mods: ['Frameworks', 'Case studies', 'Making a call'] },
      { id: 'writing', title: 'Writing with Clarity', level: 0, weeks: 6, hrs: 3, off: [1.8, -0.8, -0.4], blurb: 'Plain, precise writing for reports, emails and essays that people actually finish.', mods: ['Know your reader', 'Sentences that work', 'Editing ruthlessly'] },
      { id: 'philsci', title: 'Philosophy of Science', level: 2, weeks: 8, hrs: 4, off: [3.6, 0.8, 0.6], blurb: 'What counts as evidence, how theories change and why science is trusted.', mods: ['Evidence', 'Theory change', 'Trust and expertise'] },
      { id: 'speak', title: 'Public Speaking', level: 1, weeks: 4, hrs: 3, off: [4.0, -2.2, -0.2], blurb: 'Structure, voice and nerves: give a talk you would want to sit through.', mods: ['Structure', 'Voice and presence', 'Handling questions'] },
    ],
  },
  {
    id: 'languages', name: 'Languages', colour: '#9DB2FF', coord: 'RA 23h 10m · Dec −28°',
    pos: [-14, -9, -15], blurb: 'Speak, read and translate, with live conversation practice from the very first week.',
    figure: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5]],
    courses: [
      { id: 'english', title: 'Academic English', level: 1, weeks: 8, hrs: 4, off: [-2.8, 1.6, 0.4], blurb: 'Read, write and present in English at university level.', mods: ['Academic reading', 'Essays and reports', 'Seminars and talks'] },
      { id: 'spanish', title: 'Spanish A1', level: 0, weeks: 10, hrs: 3, off: [-0.4, 2.8, -0.4], blurb: 'Everyday Spanish for introductions, travel and simple conversations.', mods: ['Greetings and people', 'Places and plans', 'Talking about your day'] },
      { id: 'french', title: 'French A1', level: 0, weeks: 10, hrs: 3, off: [0.4, 0.6, 0.6], blurb: 'Your first months of French, built around listening and speaking.', mods: ['Sounds and greetings', 'Daily life', 'Getting around'] },
      { id: 'japanese', title: 'Japanese Foundations', level: 0, weeks: 12, hrs: 4, off: [2.6, -0.6, -0.4], blurb: 'Hiragana, katakana and the grammar for simple, polite conversation.', mods: ['Writing systems', 'Polite sentences', 'Everyday situations'] },
      { id: 'arabic', title: 'Arabic Foundations', level: 0, weeks: 12, hrs: 4, off: [3.0, -2.6, 0.6], blurb: 'The alphabet, pronunciation and first conversations in Modern Standard Arabic.', mods: ['Letters and sounds', 'First conversations', 'Reading short texts'] },
      { id: 'translate', title: 'Translation Studio', level: 2, weeks: 8, hrs: 5, off: [0.6, -2.8, -0.2], blurb: 'Translate real texts, compare choices and learn when meaning matters more than words.', mods: ['Meaning and form', 'Register and tone', 'Editing translations'] },
    ],
  },
];

export const PATHS = [
  {
    id: 'data-storyteller', name: 'Data Storyteller', months: 'Around 9 months part-time',
    blurb: 'Collect evidence, analyse it in code and present it so people act on it.',
    who: 'For analysts, researchers and journalists who want their numbers to land.',
    steps: ['stats', 'python', 'data', 'dataviz', 'writing', 'speak'],
  },
  {
    id: 'product-builder', name: 'Product Builder', months: 'Around 8 months part-time',
    blurb: 'Go from a working web page to running the team that ships the product.',
    who: 'For designers, developers and founders who want the full picture.',
    steps: ['web', 'ux', 'ixd', 'product', 'lead'],
  },
  {
    id: 'climate-analyst', name: 'Climate Analyst', months: 'Around 10 months part-time',
    blurb: 'Understand the climate system, work with its data and reason about the choices it forces.',
    who: 'For policy, sustainability and science professionals.',
    steps: ['climate', 'stats', 'data', 'ethics', 'research'],
  },
  {
    id: 'global-communicator', name: 'Global Communicator', months: 'Around 11 months part-time',
    blurb: 'Write and speak clearly in more than one language, for more than one audience.',
    who: 'For people working across borders, cultures and teams.',
    steps: ['english', 'spanish', 'writing', 'marketing', 'translate', 'speak'],
  },
];

export const COURSES = SUBJECTS.flatMap((s) => s.courses.map((c) => ({ ...c, subject: s.id })));
export const courseById = (id) => COURSES.find((c) => c.id === id);
export const subjectById = (id) => SUBJECTS.find((s) => s.id === id);
export const pathsWith = (courseId) => PATHS.filter((p) => p.steps.includes(courseId));
export const worldPos = (c) => { const s = subjectById(c.subject); return [s.pos[0] + c.off[0], s.pos[1] + c.off[1], s.pos[2] + c.off[2]]; };
