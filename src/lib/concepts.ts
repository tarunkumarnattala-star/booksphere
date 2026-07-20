export type KnowledgeConcept = {
  id: string;
  name: string;
  question: string;
  category: "Behavior" | "Attention" | "Decision-making" | "Psychology";
  definition: string;
  whyItMatters: string;
  practicalExample: string;
  misconception: string;
  searchTerms: string[];
  bookIds: string[];
  relatedConceptIds: string[];
  source: { label: string; url: string };
};

export const knowledgeConcepts: KnowledgeConcept[] = [
  {
    id: "dopamine-loops",
    name: "Dopamine Loops",
    question: "Why can’t I stop scrolling?",
    category: "Behavior",
    definition: "Unpredictable rewards can reinforce the urge to check, scroll, or repeat a behavior, even when the next reward is small.",
    whyItMatters: "Naming the loop helps you redesign cues and friction instead of treating every lapse as a failure of willpower.",
    practicalExample: "Moving a distracting app off the home screen interrupts the cue-to-check sequence long enough to make the choice visible.",
    misconception: "A “dopamine detox” does not remove dopamine from your brain. The useful goal is changing a repeated behavior and its cues, not eliminating a necessary neurotransmitter.",
    searchTerms: ["dopamine", "scrolling", "social media", "reward", "habit", "hooked", "distraction"],
    bookIds: ["hooked", "atomic-habits", "digital-minimalism", "the-power-of-habit"],
    relatedConceptIds: ["habit-stacking", "attention-residue", "hedonic-adaptation"],
    source: { label: "NIDA: Brain reward system", url: "https://nida.nih.gov/publications/drugs-brains-behavior-science-addiction/drugs-brain" }
  },
  {
    id: "attention-residue",
    name: "Attention Residue",
    question: "Why does switching tasks ruin my focus?",
    category: "Attention",
    definition: "After switching tasks, part of your attention can remain occupied by the previous task, reducing performance on the next one.",
    whyItMatters: "It explains why frequent checking and unfinished work can make a full day feel busy while producing very little depth.",
    practicalExample: "Before changing tasks, write the exact next step for the unfinished work so your mind has a clear place to return.",
    misconception: "Multitasking is not simply doing two demanding tasks at once; it usually involves rapid switching, and that switching has a cognitive cost.",
    searchTerms: ["attention residue", "focus", "task switching", "multitasking", "distraction", "deep work"],
    bookIds: ["deep-work", "make-time", "digital-minimalism", "essentialism"],
    relatedConceptIds: ["flow-state", "dopamine-loops", "analysis-paralysis"],
    source: { label: "Research: Why is it so hard to do my work?", url: "https://doi.org/10.1016/j.obhdp.2009.04.002" }
  },
  {
    id: "analysis-paralysis",
    name: "Analysis Paralysis",
    question: "Why can’t I make a decision?",
    category: "Decision-making",
    definition: "A decision can stall when evaluating more information or more options stops improving the choice and starts increasing uncertainty.",
    whyItMatters: "A stopping rule can turn endless comparison into a decision that is good enough to test and revise.",
    practicalExample: "Choose three criteria before comparing options, then decide when one option meets all three rather than reopening the entire search.",
    misconception: "More choice does not always harm decisions. The effect depends on complexity, preference clarity, and how options are organized.",
    searchTerms: ["analysis paralysis", "overthinking", "decision", "choices", "uncertainty", "thinking clearly"],
    bookIds: ["thinking-fast-and-slow", "predictably-irrational", "essentialism", "the-most-important-thing"],
    relatedConceptIds: ["sunk-cost-fallacy", "regret-minimization", "attention-residue"],
    source: { label: "Research review: Choice overload", url: "https://doi.org/10.1086/651235" }
  },
  {
    id: "sunk-cost-fallacy",
    name: "Sunk Cost Fallacy",
    question: "Why do I stay with a bad decision?",
    category: "Decision-making",
    definition: "Past time, money, or effort can pull us toward continuing a choice even when those costs cannot be recovered.",
    whyItMatters: "Separating past cost from future value makes it easier to stop a project, habit, or commitment that no longer earns the next investment.",
    practicalExample: "Ask, “If I had not already spent anything, would I choose this again today?”",
    misconception: "Persistence is not automatically irrational. Continuing can still be sensible when the future benefits justify the future costs.",
    searchTerms: ["sunk cost", "bad decision", "quit", "commitment", "loss", "decision-making"],
    bookIds: ["thinking-fast-and-slow", "predictably-irrational", "the-psychology-of-money", "fooled-by-randomness"],
    relatedConceptIds: ["analysis-paralysis", "regret-minimization", "asymmetric-bets"],
    source: { label: "APA Dictionary: Sunk-cost fallacy", url: "https://dictionary.apa.org/sunk-cost-fallacy" }
  },
  {
    id: "habit-stacking",
    name: "Habit Stacking",
    question: "How do habits become automatic?",
    category: "Behavior",
    definition: "A new behavior becomes easier to remember when it is attached to a stable cue or routine that already happens.",
    whyItMatters: "It replaces a vague intention with a specific moment for action.",
    practicalExample: "After pouring your morning coffee, read two pages before opening another app.",
    misconception: "Attaching a habit to a cue improves consistency, but it does not make an unrealistic behavior effortless or guarantee permanence.",
    searchTerms: ["habit stacking", "habits", "routine", "consistency", "implementation intention", "behavior change"],
    bookIds: ["atomic-habits", "the-power-of-habit", "the-7-habits-of-highly-effective-people", "make-time"],
    relatedConceptIds: ["dopamine-loops", "delayed-gratification", "flow-state"],
    source: { label: "Research: Implementation intentions", url: "https://doi.org/10.1037/0003-066X.54.7.493" }
  },
  {
    id: "neuroplasticity",
    name: "Neuroplasticity",
    question: "How does practice change the brain?",
    category: "Psychology",
    definition: "The nervous system can change its structure and function in response to experience, learning, injury, and repeated activity.",
    whyItMatters: "It gives a biological basis for learning and adaptation while keeping expectations grounded in repetition, context, and time.",
    practicalExample: "Practicing a difficult skill in focused, repeated sessions strengthens the relevant learning more than passively rereading about it.",
    misconception: "Neuroplasticity does not mean anyone can rewire the brain instantly or achieve any outcome through positive thinking alone.",
    searchTerms: ["neuroplasticity", "brain", "learning", "practice", "rewire", "growth mindset"],
    bookIds: ["mindset", "spark", "deep-work", "the-power-of-habit"],
    relatedConceptIds: ["flow-state", "habit-stacking", "delayed-gratification"],
    source: { label: "NIH: Neural plasticity", url: "https://www.ncbi.nlm.nih.gov/books/NBK557811/" }
  },
  {
    id: "flow-state",
    name: "Flow State",
    question: "When does deep work start to feel effortless?",
    category: "Attention",
    definition: "Flow is deep absorption in an activity, often supported by clear goals, immediate feedback, and a workable balance between challenge and skill.",
    whyItMatters: "Understanding the conditions helps you design focused work instead of waiting for inspiration.",
    practicalExample: "Define one visible outcome for a 45-minute session and remove competing inputs until the session ends.",
    misconception: "Flow is not constant happiness or proof that work is easy. It usually depends on sustained attention and an appropriately difficult challenge.",
    searchTerms: ["flow", "flow state", "deep work", "focus", "peak performance", "challenge"],
    bookIds: ["flow", "deep-work", "the-one-thing", "make-time"],
    relatedConceptIds: ["attention-residue", "neuroplasticity", "habit-stacking"],
    source: { label: "Research overview: Flow", url: "https://doi.org/10.1007/978-94-017-9088-8_15" }
  },
  {
    id: "hedonic-adaptation",
    name: "Hedonic Adaptation",
    question: "Why does success stop feeling exciting?",
    category: "Psychology",
    definition: "People often adjust to positive and negative changes, so the emotional effect of a new circumstance can weaken over time.",
    whyItMatters: "It helps explain why chasing the next achievement may not create lasting satisfaction and why attention and values matter after success.",
    practicalExample: "Before upgrading a purchase or goal, notice whether the last improvement still changes daily life or has simply become the new baseline.",
    misconception: "Adaptation is not complete or identical for every event. Some experiences have lasting effects, and people differ in how they adjust.",
    searchTerms: ["hedonic adaptation", "hedonic treadmill", "happiness", "success", "enough", "satisfaction"],
    bookIds: ["stumbling-on-happiness", "the-psychology-of-money", "four-thousand-weeks", "meditations"],
    relatedConceptIds: ["dopamine-loops", "regret-minimization", "delayed-gratification"],
    source: { label: "Research review: Hedonic adaptation", url: "https://doi.org/10.1037/1089-2680.10.4.305" }
  },
  {
    id: "regret-minimization",
    name: "Regret Minimization",
    question: "Which choice will matter years from now?",
    category: "Decision-making",
    definition: "A long-term decision lens that asks which choice is less likely to produce meaningful future regret.",
    whyItMatters: "It can reduce the influence of temporary fear when a decision concerns identity, opportunity, or an irreversible life direction.",
    practicalExample: "Imagine looking back at the decision in ten years, then identify which missed action would be hardest to accept.",
    misconception: "It is a personal decision framework, not a scientific formula. It can also overvalue dramatic action if near-term risks are ignored.",
    searchTerms: ["regret minimization", "regret", "life decision", "long term", "career", "choice"],
    bookIds: ["the-obstacle-is-the-way", "man-s-search-for-meaning", "four-thousand-weeks", "shoe-dog"],
    relatedConceptIds: ["analysis-paralysis", "asymmetric-bets", "sunk-cost-fallacy"],
    source: { label: "Framework origin: Jeff Bezos", url: "https://press.aboutamazon.com/2001/7/how-i-did-it-jeff-bezos" }
  },
  {
    id: "asymmetric-bets",
    name: "Asymmetric Bets",
    question: "Which risks have more upside than downside?",
    category: "Decision-making",
    definition: "An asymmetric bet has limited or manageable downside and a much larger possible upside.",
    whyItMatters: "The lens shifts attention from predicting perfectly to structuring choices so small losses are survivable and rare wins matter.",
    practicalExample: "Test a business idea with a weekend prototype before leaving a job or investing substantial savings.",
    misconception: "Large potential upside does not make a choice good. Probability, repeated exposure, hidden downside, and the ability to survive failure still matter.",
    searchTerms: ["asymmetric bets", "risk", "upside", "downside", "optionality", "entrepreneurship"],
    bookIds: ["fooled-by-randomness", "the-dhandho-investor", "zero-to-one", "the-lean-startup"],
    relatedConceptIds: ["regret-minimization", "sunk-cost-fallacy", "analysis-paralysis"],
    source: { label: "Related framework: The barbell strategy", url: "https://www.penguinrandomhouse.com/books/176227/antifragile-by-nassim-nicholas-taleb/" }
  }
];

export const featuredKnowledgeConcepts = knowledgeConcepts.slice(0, 6);

function normalizeConceptText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
}

export function findKnowledgeConcept(query: string) {
  const normalized = normalizeConceptText(query);
  if (!normalized) return undefined;

  const exact = knowledgeConcepts.find((concept) =>
    [concept.name, concept.question, ...concept.searchTerms]
      .map(normalizeConceptText)
      .some((name) => name === normalized)
  );
  if (exact) return exact;

  return knowledgeConcepts.find((concept) => {
    const primaryLabels = [concept.name, concept.question].map(normalizeConceptText);
    if (primaryLabels.some((label) => normalized.length >= 5 && (label.includes(normalized) || normalized.includes(label)))) return true;
    return concept.searchTerms
      .map(normalizeConceptText)
      .filter((term) => term.includes(" "))
      .some((term) => normalized.length >= 5 && (term.includes(normalized) || normalized.includes(term)));
  });
}

export function getRelatedKnowledgeConcepts(concept: KnowledgeConcept) {
  return concept.relatedConceptIds
    .map((id) => knowledgeConcepts.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is KnowledgeConcept => Boolean(candidate));
}
