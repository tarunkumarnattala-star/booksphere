import { Book, DiscussionPost, Genre, KnowledgePost, Profile, ReadingPath } from "./types";

export type BookSearchResult = {
  book: Book;
  score: number;
  matchReason: "Title match" | "Author match" | "Genre match" | "Topic match" | "Book match" | "Found outside this genre";
  inCurrentGenre: boolean;
  isGlobalFallback: boolean;
};

export type SearchBooksOptions = {
  books: Book[];
  genreSlug?: string;
  genreName?: string;
  limit?: number;
  includeGlobalFallback?: boolean;
  minQueryLength?: number;
};

export type FullSearchOptions = SearchBooksOptions & {
  genres: Genre[];
  profiles: Profile[];
  discussions: DiscussionPost[];
  knowledgePosts: KnowledgePost[];
};

export function normalizeSearchText(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const aliases: Record<string, string[]> = {
  b: ["business", "books", "build", "behavior"],
  bu: ["business", "build", "startup", "leadership"],
  boo: ["book", "books"],
  z: ["zero"],
  ze: ["zero"],
  n: ["never", "negotiation", "new", "network"],
  ne: ["never", "negotiation", "new"],
  new: ["never", "negotiation", "manager", "starter"],
  o: ["one", "outlive"],
  on: ["one"],
  s: ["security", "sapiens", "startup", "startups", "strategy", "stock", "stocks"],
  se: ["security", "seven", "startup"],
  zer: ["zero"],
  investment: ["investing", "investor", "finance", "money", "wealth", "stocks", "market"],
  investments: ["investing", "investor", "finance", "money", "wealth", "stocks", "market"],
  invetsment: ["investment", "investing", "finance", "money", "wealth", "stocks", "market"],
  invesment: ["investment", "investing", "finance", "money", "wealth", "stocks", "market"],
  invest: ["investing", "investment", "finance", "money", "wealth", "stocks", "market"],
  money: ["finance", "investing", "investment", "wealth"],
  habits: ["habit", "atomic", "behavior", "productivity", "personal growth"],
  psychology: ["behavior", "mind", "thinking", "money"],
  communication: ["conversation", "writing", "speaking", "relationships", "talk"],
  startup: ["startups", "founder", "business"],
  startups: ["startup", "founder", "business"],
  business: ["management", "strategy", "startup", "leadership"],
  genre: ["genres", "category", "shelf"],
  genres: ["genre", "category", "shelf"]
};

function slugFromName(name?: string) {
  return normalizeSearchText(name || "").replace(/\s+/g, "-");
}

function expandSearchTerms(query: string) {
  const normalized = normalizeSearchText(query);
  const rawTerms = normalized.split(" ").filter(Boolean);
  const expanded = new Set(rawTerms);

  rawTerms.forEach((term) => {
    expanded.add(term.replace(/s$/, ""));
    if (term.endsWith("ment")) expanded.add(term.replace(/ment$/, "ing"));
    aliases[term]?.forEach((alias) => expanded.add(alias));
  });

  return { normalized, terms: [...expanded].filter(Boolean) };
}

function searchableBookText(book: Book) {
  return normalizeSearchText([
    book.id,
    book.title,
    book.author,
    book.description,
    book.whyMatters,
    book.genres.join(" "),
    book.mostDiscussedThemes.join(" "),
    book.bestForTags.join(" ")
  ].join(" "));
}

function wordStartsWith(text: string, term: string) {
  return text.split(" ").some((word) => word.startsWith(term));
}

function safelyIncludes(text: string, term: string) {
  return term.length >= 4 ? text.includes(term) : wordStartsWith(text, term);
}

function editDistance(left: string, right: string) {
  const rows = Array.from({ length: left.length + 1 }, (_, index) => [index]);
  for (let column = 0; column <= right.length; column += 1) rows[0][column] = column;
  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1)
      );
    }
  }
  return rows[left.length][right.length];
}

function correctSearchQuery(query: string, vocabulary: string[]) {
  const candidates = [...new Set(vocabulary.flatMap((value) => normalizeSearchText(value).split(" ")).filter((word) => word.length >= 4))];
  return normalizeSearchText(query).split(" ").map((term) => {
    if (term.length < 4 || candidates.some((candidate) => candidate === term || candidate.startsWith(term))) return term;
    const threshold = term.length >= 7 ? 2 : 1;
    const match = candidates
      .map((candidate) => ({ candidate, distance: editDistance(term, candidate) }))
      .filter(({ distance }) => distance <= threshold)
      .sort((a, b) => a.distance - b.distance || a.candidate.length - b.candidate.length)[0];
    return match?.candidate || term;
  }).join(" ");
}

function scoreField(field: string, normalizedQuery: string, terms: string[], weight: number) {
  const text = normalizeSearchText(field);
  let score = 0;

  if (text === normalizedQuery) score += 160 * weight;
  if (normalizedQuery && text.startsWith(normalizedQuery)) score += 120 * weight;
  if (normalizedQuery && (normalizedQuery.includes(" ") ? text.includes(normalizedQuery) : safelyIncludes(text, normalizedQuery))) score += 90 * weight;

  terms.forEach((term) => {
    if (!term) return;
    if (text === term) score += 50 * weight;
    if (text.startsWith(term)) score += 34 * weight;
    if (wordStartsWith(text, term)) score += 24 * weight;
    if (safelyIncludes(text, term)) score += 16 * weight;
  });

  return score;
}

function matchReason(book: Book, normalizedQuery: string, terms: string[], inCurrentGenre: boolean, isGlobalFallback: boolean): BookSearchResult["matchReason"] {
  if (isGlobalFallback) return "Found outside this genre";
  const title = normalizeSearchText(book.title);
  const author = normalizeSearchText(book.author);
  const genres = normalizeSearchText(book.genres.join(" "));
  const topics = normalizeSearchText([...book.mostDiscussedThemes, ...book.bestForTags].join(" "));

  if (title.includes(normalizedQuery) || terms.some((term) => title.includes(term))) return "Title match";
  if (author.includes(normalizedQuery) || terms.some((term) => author.includes(term))) return "Author match";
  if (genres.includes(normalizedQuery) || terms.some((term) => genres.includes(term))) return "Genre match";
  if (topics.includes(normalizedQuery) || terms.some((term) => topics.includes(term))) return "Topic match";
  if (!inCurrentGenre) return "Found outside this genre";
  return "Book match";
}

function scoreBook(book: Book, normalizedQuery: string, terms: string[], currentGenreSlug?: string) {
  const titleScore = scoreField(book.title, normalizedQuery, terms, 5);
  const authorScore = scoreField(book.author, normalizedQuery, terms, 3);
  const genreScore = scoreField(book.genres.join(" "), normalizedQuery, terms, 4);
  const topicScore = scoreField([...book.mostDiscussedThemes, ...book.bestForTags].join(" "), normalizedQuery, terms, 2);
  const bodyScore = scoreField(`${book.description} ${book.whyMatters}`, normalizedQuery, terms, 1);
  const searchable = searchableBookText(book);
  const allTermsMatch = terms.length > 1 && terms.every((term) => searchable.includes(term) || wordStartsWith(searchable, term));
  const phraseMatch = normalizedQuery.length > 0 && (normalizedQuery.includes(" ") ? searchable.includes(normalizedQuery) : safelyIncludes(searchable, normalizedQuery));
  const inCurrentGenre = currentGenreSlug ? book.genres.some((genre) => slugFromName(genre) === currentGenreSlug) : true;
  const genreBoost = currentGenreSlug && inCurrentGenre ? 18 : 0;
  const activityBoost = Math.min(30, Math.floor((book.discussionCount + book.insightCount + book.saveCount) / 50));
  const matchScore = titleScore + authorScore + genreScore + topicScore + bodyScore + (allTermsMatch ? 55 : 0) + (phraseMatch ? 45 : 0);

  const score = matchScore > 0 ? matchScore + genreBoost + activityBoost : 0;
  return { score, inCurrentGenre };
}

export function searchBooks(query: string, options: SearchBooksOptions): BookSearchResult[] {
  const correctedQuery = correctSearchQuery(query, options.books.flatMap((book) => [book.title, book.author, ...book.genres, ...book.mostDiscussedThemes, ...book.bestForTags]));
  const { normalized, terms } = expandSearchTerms(correctedQuery);
  const minQueryLength = options.minQueryLength ?? 1;
  const limit = options.limit ?? 10;

  if (normalized.length < minQueryLength) return [];

  const currentGenreSlug = options.genreSlug || slugFromName(options.genreName);
  const scored = options.books
    .map((book) => {
      const { score, inCurrentGenre } = scoreBook(book, normalized, terms, currentGenreSlug || undefined);
      return { book, score, inCurrentGenre };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => {
      if (currentGenreSlug && a.inCurrentGenre !== b.inCurrentGenre) return a.inCurrentGenre ? -1 : 1;
      return b.score - a.score || b.book.discussionCount - a.book.discussionCount || a.book.title.localeCompare(b.book.title);
    });

  const genreMatches = currentGenreSlug ? scored.filter((result) => result.inCurrentGenre) : scored;
  const fallbackMatches = currentGenreSlug && options.includeGlobalFallback !== false && genreMatches.length === 0
    ? scored.filter((result) => !result.inCurrentGenre)
    : [];
  const chosen = (fallbackMatches.length ? fallbackMatches : genreMatches).slice(0, limit);

  return chosen.map((result) => ({
    book: result.book,
    score: result.score,
    inCurrentGenre: result.inCurrentGenre,
    isGlobalFallback: currentGenreSlug ? !result.inCurrentGenre : false,
    matchReason: matchReason(result.book, normalized, terms, result.inCurrentGenre, currentGenreSlug ? !result.inCurrentGenre : false)
  }));
}

function scoreText(text: string, query: string) {
  const { normalized, terms } = expandSearchTerms(query);
  const normalizedText = normalizeSearchText(text);
  if (!normalized) return 0;

  let score = 0;
  if (normalizedText.includes(normalized)) score += 60;
  terms.forEach((term) => {
    if (normalizedText.includes(term)) score += 16;
    if (wordStartsWith(normalizedText, term)) score += 10;
  });
  return score;
}

export function searchEverything(query: string, options: FullSearchOptions) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return { books: [], genres: [], profiles: [], discussions: [], knowledgePosts: [] };

  const bookResults = searchBooks(query, {
    books: options.books,
    genreName: options.genreName,
    genreSlug: options.genreSlug,
    includeGlobalFallback: options.includeGlobalFallback,
    limit: options.limit ?? 10,
    minQueryLength: options.minQueryLength ?? 1
  });

  return {
    books: bookResults.map((result) => result.book),
    bookResults,
    genres: options.genres
      .map((genre) => ({ genre, score: scoreText(`${genre.name} ${genre.slug}`, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.genre.name.localeCompare(b.genre.name))
      .map(({ genre }) => genre),
    profiles: options.profiles
      .filter((profile) => scoreText(`${profile.name} ${profile.username} ${profile.bio} ${profile.topGenres.join(" ")}`, query) > 0),
    discussions: options.discussions
      .filter((post) => scoreText(`${post.title} ${post.body} ${post.postType}`, query) > 0)
      .sort((a, b) => b.likes - a.likes || b.comments - a.comments),
    knowledgePosts: options.knowledgePosts
      .filter((post) => scoreText(`${post.title} ${post.body} ${post.topic}`, query) > 0)
      .sort((a, b) => b.likes - a.likes || b.comments - a.comments)
  };
}

export type KnowledgeSearchData = {
  books: Book[];
  genres: Genre[];
  discussions: DiscussionPost[];
  knowledgePosts: KnowledgePost[];
  readingPaths: ReadingPath[];
};

export type KnowledgeResultBase = {
  type: "book" | "discussion" | "reading_path";
  id: string;
  title: string;
  subtitle: string;
  description: string;
  matchReason: string;
  knowledgeMatchScore: number;
  destinationUrl: string;
};

export type KnowledgeBookResult = KnowledgeResultBase & {
  type: "book";
  book: Book;
  coverUrl?: string;
};

export type KnowledgeDiscussionResult = KnowledgeResultBase & {
  type: "discussion";
  discussion: DiscussionPost;
  book?: Book;
  coverUrl?: string;
};

export type KnowledgeReadingPathResult = KnowledgeResultBase & {
  type: "reading_path";
  path: ReadingPath;
  books: Book[];
};

export type KnowledgeSearchResult = KnowledgeBookResult | KnowledgeDiscussionResult | KnowledgeReadingPathResult;

export type KnowledgeSearchResponse = {
  bestMatch?: KnowledgeSearchResult;
  books: KnowledgeBookResult[];
  discussions: KnowledgeDiscussionResult[];
  readingPaths: KnowledgeReadingPathResult[];
  relatedIdeas: string[];
  readersAlsoContinuedWith: KnowledgeBookResult[];
  relatedSearches: string[];
  noResults: boolean;
};

const intentMappings: Record<string, {
  query: string;
  terms: string[];
  bookIds: string[];
  pathSlugs: string[];
  ideas: string[];
  relatedSearches: string[];
}> = {
  "Build Better Habits": {
    query: "habits discipline focus systems identity",
    terms: ["habit", "habits", "discipline", "routine", "procrastination", "consistency", "identity", "focus"],
    bookIds: ["atomic-habits", "the-power-of-habit", "deep-work", "essentialism", "make-time"],
    pathSlugs: ["build-better-habits"],
    ideas: ["habit stacking", "identity change", "systems", "discipline", "consistency"],
    relatedSearches: ["procrastination", "discipline", "focus", "habit stacking"]
  },
  "Think More Clearly": {
    query: "thinking decisions psychology mental models clarity",
    terms: ["think", "thinking", "clear", "clearly", "decision", "mental", "model", "psychology", "bias"],
    bookIds: ["thinking-fast-and-slow", "the-art-of-thinking-clearly", "predictably-irrational", "meditations"],
    pathSlugs: ["understand-human-psychology"],
    ideas: ["bias", "judgment", "mental models", "decision-making", "self-awareness"],
    relatedSearches: ["decision-making", "psychology", "mental models", "bias"]
  },
  "Become a Better Communicator": {
    query: "communication persuasion conversation conflict writing speaking",
    terms: ["communicate", "communication", "conversation", "speaking", "writing", "conflict", "persuasion", "listening"],
    bookIds: ["how-to-win-friends-and-influence-people", "crucial-conversations", "never-split-the-difference", "talk-like-ted", "nonviolent-communication"],
    pathSlugs: ["become-a-better-communicator"],
    ideas: ["listening", "persuasion", "conflict", "storytelling", "tactical empathy"],
    relatedSearches: ["talk like ted", "negotiation", "hard conversations", "public speaking"]
  },
  "Learn Negotiation": {
    query: "negotiation persuasion conflict tactical empathy",
    terms: ["negotiation", "negotiate", "persuasion", "conflict", "tactical", "empathy", "deal"],
    bookIds: ["never-split-the-difference", "getting-to-yes", "crucial-conversations", "influence"],
    pathSlugs: ["become-a-better-communicator"],
    ideas: ["negotiation", "tactical empathy", "conflict", "persuasion", "listening"],
    relatedSearches: ["never split the difference", "persuasion", "communication", "conflict"]
  },
  "Understand Investing": {
    query: "investing money finance wealth risk markets",
    terms: ["investing", "investment", "investor", "money", "finance", "wealth", "risk", "market", "stocks"],
    bookIds: ["the-psychology-of-money", "the-intelligent-investor", "one-up-on-wall-street", "security-analysis", "the-simple-path-to-wealth"],
    pathSlugs: ["personal-finance-starter-pack"],
    ideas: ["wealth", "risk", "behavior", "markets", "personal finance"],
    relatedSearches: ["money", "wealth", "stocks", "beginner investing"]
  },
  "Become a Better Leader": {
    query: "leadership management culture trust standards",
    terms: ["leader", "leadership", "manager", "management", "culture", "trust", "team", "standards"],
    bookIds: ["high-output-management", "the-effective-executive", "leaders-eat-last", "good-to-great"],
    pathSlugs: [],
    ideas: ["trust", "culture", "standards", "management", "responsibility"],
    relatedSearches: ["management", "culture", "leadership", "teams"]
  },
  "Start a Company": {
    query: "startup founder company product customers traction",
    terms: ["startup", "startups", "founder", "company", "product", "customer", "traction", "business"],
    bookIds: ["the-lean-startup", "the-mom-test", "zero-to-one", "traction", "the-hard-thing-about-hard-things"],
    pathSlugs: ["startups-101"],
    ideas: ["customers", "traction", "founder judgment", "product", "positioning"],
    relatedSearches: ["zero to one", "lean startup", "customer discovery", "traction"]
  },
  "Improve Decision-Making": {
    query: "decisions judgment strategy risk thinking clearly",
    terms: ["decision", "decisions", "judgment", "strategy", "risk", "thinking", "clarity"],
    bookIds: ["thinking-fast-and-slow", "the-art-of-thinking-clearly", "principles", "good-strategy-bad-strategy"],
    pathSlugs: ["understand-human-psychology"],
    ideas: ["judgment", "risk", "bias", "strategy", "mental models"],
    relatedSearches: ["decision-making", "risk", "strategy", "thinking"]
  },
  "Build Discipline": {
    query: "discipline habits consistency focus resilience",
    terms: ["discipline", "consistent", "consistency", "focus", "resilience", "habit", "grit"],
    bookIds: ["atomic-habits", "deep-work", "grit", "cant-hurt-me", "essentialism"],
    pathSlugs: ["build-better-habits"],
    ideas: ["discipline", "consistency", "identity change", "focus", "resilience"],
    relatedSearches: ["grit", "focus", "habits", "procrastination"]
  },
  "Improve Focus": {
    query: "focus attention deep work productivity distraction",
    terms: ["focus", "attention", "deep", "work", "productivity", "distraction", "flow"],
    bookIds: ["deep-work", "make-time", "essentialism", "four-thousand-weeks", "digital-minimalism"],
    pathSlugs: ["build-better-habits"],
    ideas: ["focus", "attention", "flow", "digital minimalism", "deep work"],
    relatedSearches: ["deep work", "attention", "productivity", "distraction"]
  }
};

const naturalLanguageIntentTerms: Array<{ terms: string[]; intent: string }> = [
  { terms: ["procrastination", "procrastinate", "discipline", "habit", "habits", "routine", "consistent"], intent: "Build Better Habits" },
  { terms: ["focus", "distracted", "attention", "deep work"], intent: "Improve Focus" },
  { terms: ["invest", "investing", "money", "finance", "wealth"], intent: "Understand Investing" },
  { terms: ["communicate", "communication", "conversation", "speaking", "writing"], intent: "Become a Better Communicator" },
  { terms: ["negotiate", "negotiation", "deal", "persuasion"], intent: "Learn Negotiation" },
  { terms: ["startup", "company", "founder", "business"], intent: "Start a Company" },
  { terms: ["think", "clearly", "decision", "decisions", "mental model"], intent: "Think More Clearly" },
  { terms: ["leader", "leadership", "manager", "team"], intent: "Become a Better Leader" }
];

const bookIdeaMap: Record<string, string[]> = {
  "deep-work": ["Focus", "Attention", "Flow", "Digital Minimalism", "Deliberate Practice"],
  "atomic-habits": ["Habit Stacking", "Identity Change", "Systems", "Discipline", "Consistency"],
  "the-psychology-of-money": ["Wealth", "Risk", "Behavior", "Investing", "Personal Finance"],
  "never-split-the-difference": ["Negotiation", "Communication", "Conflict", "Persuasion", "Tactical Empathy"],
  "zero-to-one": ["Startups", "Contrarian Thinking", "Founder Judgment", "Innovation", "Monopoly"],
  "thinking-fast-and-slow": ["Bias", "Judgment", "Decision-Making", "Psychology", "Mental Models"],
  "security-analysis": ["Value Investing", "Risk", "Markets", "Margin of Safety", "Investor Discipline"]
};

const continuedWithMap: Record<string, string[]> = {
  "atomic-habits": ["deep-work", "essentialism", "the-power-of-habit", "make-time"],
  "zero-to-one": ["the-lean-startup", "the-mom-test", "traction", "the-hard-thing-about-hard-things"],
  "the-psychology-of-money": ["the-intelligent-investor", "rich-dad-poor-dad", "common-stocks-and-uncommon-profits", "one-up-on-wall-street"],
  "deep-work": ["essentialism", "make-time", "atomic-habits", "digital-minimalism"],
  "never-split-the-difference": ["crucial-conversations", "how-to-win-friends-and-influence-people", "talk-like-ted", "nonviolent-communication"],
  "thinking-fast-and-slow": ["predictably-irrational", "the-art-of-thinking-clearly", "atomic-habits", "mindset"]
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function titleWordsStartWith(title: string, query: string) {
  return normalizeSearchText(title).split(" ").some((word) => word.startsWith(query));
}

function allQueryTokensMatch(text: string, query: string) {
  const normalizedText = normalizeSearchText(text);
  const tokens = normalizeSearchText(query).split(" ").filter(Boolean);
  return tokens.length > 1 && tokens.every((token) => normalizedText.includes(token) || titleWordsStartWith(normalizedText, token));
}

function findIntent(query: string) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return null;

  const directIntent = Object.keys(intentMappings).find((intent) => normalizeSearchText(intent) === normalized);
  if (directIntent) return directIntent;

  return naturalLanguageIntentTerms.find(({ terms }) => terms.some((term) => normalized.includes(normalizeSearchText(term))))?.intent || null;
}

function contextForIntent(query: string) {
  const intent = findIntent(query);
  return intent ? intentMappings[intent] : null;
}

function matchLabelFromScore(score: number, primaryReason: string) {
  if (score >= 94) return "Best match";
  if (score >= 85) return primaryReason;
  if (score >= 72) return "Highly relevant";
  if (score >= 58) return "Related to your goal";
  return "Related idea";
}

function calculateBookScore(book: Book, query: string, intentContext?: ReturnType<typeof contextForIntent>) {
  const normalized = normalizeSearchText(query);
  const title = normalizeSearchText(book.title);
  const author = normalizeSearchText(book.author);
  const genresText = normalizeSearchText(book.genres.join(" "));
  const ideasText = normalizeSearchText([...book.mostDiscussedThemes, ...book.bestForTags].join(" "));
  const bodyText = normalizeSearchText(`${book.description} ${book.whyMatters}`);
  const searchable = normalizeSearchText(`${book.title} ${book.author} ${book.description} ${book.whyMatters} ${book.genres.join(" ")} ${book.mostDiscussedThemes.join(" ")} ${book.bestForTags.join(" ")}`);
  let base = 0;
  let reason = "Related idea";

  if (title === normalized) {
    base = 100;
    reason = "Best match";
  } else if (title.startsWith(normalized)) {
    base = 95;
    reason = "Title match";
  } else if (titleWordsStartWith(book.title, normalized)) {
    base = 90;
    reason = "Title match";
  } else if (title.includes(normalized)) {
    base = 85;
    reason = "Title match";
  } else if (author.includes(normalized)) {
    base = 75;
    reason = "Author match";
  } else if (ideasText.includes(normalized)) {
    base = 65;
    reason = "Related idea";
  } else if (genresText.includes(normalized)) {
    base = normalized.length <= 3 ? 40 : 55;
    reason = "Genre match";
  } else if (bodyText.includes(normalized)) {
    base = 45;
    reason = "Idea match";
  } else if (allQueryTokensMatch(searchable, normalized)) {
    base = 35;
    reason = "Related to your goal";
  }

  if (intentContext) {
    const mapped = intentContext.bookIds.includes(book.id);
    const intentTermMatch = intentContext.terms.some((term) => searchable.includes(normalizeSearchText(term)));
    if (mapped || intentTermMatch) {
      base = Math.max(base, mapped ? 82 : 66);
      reason = "Related to your goal";
    }
  }

  if (!base) return { score: 0, reason };

  let score = base;
  score += Math.min(15, Math.floor(book.discussionCount / 8));
  score += Math.min(10, Math.floor(book.saveCount / 30));
  const recommendations = book.recommendationYesCount + book.recommendationNoCount;
  if (recommendations >= 5) score += Math.min(10, Math.round((book.recommendationYesCount / recommendations) * 10));
  if (book.isEditorsPick) score += 8;
  if (book.isBeginnerEssential && /\b(beginner|start|starter|new)\b/.test(normalized)) score += 8;
  if (book.discussionCount === 0) score -= 5;
  if (base === 45) score -= 10;

  return { score: clampScore(score), reason: matchLabelFromScore(score, reason) };
}

function calculateDiscussionScore(post: DiscussionPost, book: Book | undefined, query: string, intentContext?: ReturnType<typeof contextForIntent>) {
  const normalized = normalizeSearchText(query);
  const text = normalizeSearchText(`${post.title} ${post.body} ${post.postType} ${book?.title || ""} ${book?.genres.join(" ") || ""}`);
  let base = 0;
  let reason = "Popular discussion";

  if (normalizeSearchText(post.title).includes(normalized)) {
    base = 70;
    reason = "Popular discussion";
  } else if (text.includes(normalized)) {
    base = 58;
    reason = "Related discussion";
  } else if (allQueryTokensMatch(text, normalized)) {
    base = 42;
    reason = "Related discussion";
  }

  if (intentContext && intentContext.terms.some((term) => text.includes(normalizeSearchText(term)))) {
    base = Math.max(base, 66);
    reason = "Related to your goal";
  }

  if (!base) return { score: 0, reason };
  const score = base + Math.min(15, Math.floor((post.likes + post.comments * 2 + post.saves) / 20)) + 5;
  return { score: clampScore(score), reason: matchLabelFromScore(score, reason) };
}

function calculateReadingPathScore(path: ReadingPath, pathBooks: Book[], query: string, intentContext?: ReturnType<typeof contextForIntent>) {
  const normalized = normalizeSearchText(query);
  const text = normalizeSearchText(`${path.title} ${path.description} ${pathBooks.map((book) => `${book.title} ${book.author} ${book.genres.join(" ")}`).join(" ")}`);
  let base = 0;
  const reason = "Strong reading path match";

  if (normalizeSearchText(path.title).includes(normalized)) base = 70;
  else if (text.includes(normalized)) base = 62;
  else if (allQueryTokensMatch(text, normalized)) base = 40;

  if (intentContext?.pathSlugs.includes(path.slug)) base = Math.max(base, 86);
  if (!base) return { score: 0, reason };
  return { score: clampScore(base + (path.isOfficial ? 8 : 0)), reason };
}

function bookResult(book: Book, score: number, matchReason: string): KnowledgeBookResult {
  return {
    type: "book",
    id: book.id,
    book,
    title: book.title,
    subtitle: book.author,
    description: book.description,
    coverUrl: book.coverUrl,
    matchReason,
    knowledgeMatchScore: score,
    destinationUrl: `/book/${book.id}`
  };
}

function getRelatedIdeasFromQuery(query: string, bestBook?: Book, intentContext?: ReturnType<typeof contextForIntent>) {
  const ideas = new Set<string>();
  if (bestBook) (bookIdeaMap[bestBook.id] || [...bestBook.mostDiscussedThemes, ...bestBook.bestForTags]).forEach((idea) => ideas.add(idea));
  intentContext?.ideas.forEach((idea) => ideas.add(idea));

  const normalized = normalizeSearchText(query);
  Object.entries(bookIdeaMap).forEach(([, mappedIdeas]) => {
    if (mappedIdeas.some((idea) => normalizeSearchText(idea).includes(normalized) || normalized.includes(normalizeSearchText(idea)))) {
      mappedIdeas.forEach((idea) => ideas.add(idea));
    }
  });

  return [...ideas].slice(0, 8);
}

function getContinuedWithBooks(books: Book[], bestBook?: Book, intentContext?: ReturnType<typeof contextForIntent>) {
  const ids = new Set<string>();
  if (bestBook) (continuedWithMap[bestBook.id] || []).forEach((id) => ids.add(id));
  intentContext?.bookIds.forEach((id) => {
    if (id !== bestBook?.id) ids.add(id);
  });

  return [...ids]
    .map((id) => books.find((book) => book.id === id))
    .filter((book): book is Book => Boolean(book))
    .slice(0, 6)
    .map((book, index) => bookResult(book, Math.max(45, 74 - index * 3), "Readers continued here"));
}

function getRelatedSearchesFromQuery(query: string, bestBook?: Book, intentContext?: ReturnType<typeof contextForIntent>) {
  const searches = new Set<string>();
  intentContext?.relatedSearches.forEach((search) => searches.add(search));
  if (bestBook) {
    bestBook.genres.slice(0, 2).forEach((genre) => searches.add(genre.toLowerCase()));
    bestBook.mostDiscussedThemes.slice(0, 3).forEach((theme) => searches.add(theme));
  }
  if (!searches.size) ["habits", "money", "communication", "startups", "decision-making"].forEach((search) => searches.add(search));
  searches.delete(normalizeSearchText(query));
  return [...searches].slice(0, 8);
}

function fallbackBookRecommendations(data: KnowledgeSearchData, query: string) {
  const intentContext = contextForIntent(query);
  const { terms } = expandSearchTerms(query);
  const preferredIds = intentContext?.bookIds || [];
  const preferredBooks = preferredIds
    .map((id) => data.books.find((book) => book.id === id))
    .filter((book): book is Book => Boolean(book));
  const broadMatches = data.books.filter((book) => {
    const text = normalizeSearchText(`${book.title} ${book.author} ${book.genres.join(" ")} ${book.mostDiscussedThemes.join(" ")} ${book.bestForTags.join(" ")}`);
    return terms.some((term) => {
      if (term.length < 2) return false;
      return term.length <= 3
        ? text.split(" ").some((word) => word.startsWith(term))
        : text.includes(term);
    });
  });

  if (!preferredBooks.length && !broadMatches.length) return [];

  const activeBooks = [...preferredBooks, ...broadMatches, ...data.books]
    .filter((book, index, all) => all.findIndex((item) => item.id === book.id) === index)
    .sort((a, b) => (b.discussionCount + b.insightCount + b.saveCount) - (a.discussionCount + a.insightCount + a.saveCount))
    .slice(0, 6);

  return activeBooks.map((book, index) => bookResult(book, Math.max(42, 58 - index * 3), index === 0 ? "Recommended starting point" : "Recommended"));
}

export function searchKnowledge(query: string, data: KnowledgeSearchData): KnowledgeSearchResponse {
  const correctedQuery = correctSearchQuery(query, [
    ...data.books.flatMap((book) => [book.title, book.author, ...book.genres, ...book.mostDiscussedThemes, ...book.bestForTags]),
    ...data.genres.map((genre) => genre.name),
    ...data.discussions.map((discussion) => discussion.title),
    ...data.readingPaths.map((path) => path.title)
  ]);
  const normalized = normalizeSearchText(correctedQuery);
  if (!normalized) {
    return {
      books: [],
      discussions: [],
      readingPaths: [],
      relatedIdeas: [],
      readersAlsoContinuedWith: [],
      relatedSearches: [],
      noResults: false
    };
  }

  const intentContext = contextForIntent(correctedQuery);

  const books = data.books
    .map((book) => {
      const { score, reason } = calculateBookScore(book, correctedQuery, intentContext);
      return bookResult(book, score, reason);
    })
    .filter((result) => result.knowledgeMatchScore > 0)
    .sort((a, b) => {
      const shortQuery = normalized.length <= 3;
      const aTitlePrefix = normalizeSearchText(a.book.title).startsWith(normalized) || titleWordsStartWith(a.book.title, normalized);
      const bTitlePrefix = normalizeSearchText(b.book.title).startsWith(normalized) || titleWordsStartWith(b.book.title, normalized);
      if (shortQuery && aTitlePrefix !== bTitlePrefix) return aTitlePrefix ? -1 : 1;
      return b.knowledgeMatchScore - a.knowledgeMatchScore || b.book.discussionCount - a.book.discussionCount || a.title.localeCompare(b.title);
    });

  const bestBook = books[0]?.book;

  const discussions = data.discussions
    .map((discussion) => {
      const book = data.books.find((item) => item.id === discussion.bookId);
      const { score, reason } = calculateDiscussionScore(discussion, book, correctedQuery, intentContext);
      return {
        type: "discussion" as const,
        id: discussion.id,
        discussion,
        book,
        title: discussion.title,
        subtitle: book ? `${book.title} · ${discussion.authorName || "Reader"} · ${discussion.postType}` : `${discussion.authorName || "Reader"} · ${discussion.postType}`,
        description: discussion.body,
        coverUrl: book?.coverUrl,
        matchReason: reason,
        knowledgeMatchScore: score,
        destinationUrl: book ? `/book/${book.id}#${discussion.id}` : "/feed"
      };
    })
    .filter((result) => result.knowledgeMatchScore > 0)
    .sort((a, b) => b.knowledgeMatchScore - a.knowledgeMatchScore || b.discussion.likes - a.discussion.likes)
    .slice(0, 8);

  const readingPaths = data.readingPaths
    .map((path) => {
      const pathBooks = path.bookIds.map((bookId) => data.books.find((book) => book.id === bookId)).filter((book): book is Book => Boolean(book));
      const { score, reason } = calculateReadingPathScore(path, pathBooks, correctedQuery, intentContext);
      return {
        type: "reading_path" as const,
        id: path.id,
        path,
        books: pathBooks,
        title: path.title,
        subtitle: `${pathBooks.length} books · Official path`,
        description: path.description,
        matchReason: reason,
        knowledgeMatchScore: score,
        destinationUrl: `/path/${path.slug}`
      };
    })
    .filter((result) => result.knowledgeMatchScore > 0)
    .sort((a, b) => b.knowledgeMatchScore - a.knowledgeMatchScore)
    .slice(0, 6);

  const bestMatch = [...books.slice(0, 1), ...discussions.slice(0, 1), ...readingPaths.slice(0, 1)]
    .sort((a, b) => b.knowledgeMatchScore - a.knowledgeMatchScore)[0];
  const fallbackBooks = !books.length && !discussions.length && !readingPaths.length ? fallbackBookRecommendations(data, correctedQuery) : [];
  const visibleBooks = (books.length ? books.filter((result) => result.id !== bestMatch?.id) : fallbackBooks).slice(0, 8);
  const relatedIdeas = getRelatedIdeasFromQuery(correctedQuery, bestBook, intentContext);
  const readersAlsoContinuedWith = getContinuedWithBooks(data.books, bestBook, intentContext);
  const relatedSearches = getRelatedSearchesFromQuery(correctedQuery, bestBook, intentContext);
  const noResults = !bestMatch && visibleBooks.length === 0 && discussions.length === 0 && readingPaths.length === 0 && relatedIdeas.length === 0;

  return {
    bestMatch,
    books: visibleBooks,
    discussions,
    readingPaths,
    relatedIdeas,
    readersAlsoContinuedWith,
    relatedSearches,
    noResults
  };
}
