export type PostType =
  | "Insight"
  | "Question"
  | "Application"
  | "Disagreement"
  | "Quote"
  | "Summary"
  | "Personal Experience"
  | "Connection"
  | "Real-Life Result"
  | "What Did Not Work"
  | "Limitation";

export type UsefulnessReactionType =
  | "Helped me understand"
  | "Helped me apply"
  | "Changed my thinking"
  | "Strong counterargument"
  | "Best summary"
  | "Worth reading full book";

export type UsefulnessReaction = {
  type: UsefulnessReactionType;
  count: number;
};

export type Genre = {
  id: string;
  name: string;
  slug: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  whyMatters: string;
  publishedYear: number;
  publicationLabel?: string;
  editorialStatus: "verified" | "catalog_only";
  sourceLinks: Array<{ label: string; url: string }>;
  createdAt: string;
  isbn?: string;
  coverUrl?: string;
  genres: string[];
  coverTone: "green" | "gold" | "blue" | "rose" | "ink";
  discussionCount: number;
  insightCount: number;
  readersCount: number;
  saveCount: number;
  recommendationYesCount: number;
  recommendationNoCount: number;
  isEditorsPick: boolean;
  editorsPickOrder?: number;
  isBeginnerEssential: boolean;
  beginnerOrder?: number;
  isHiddenGem: boolean;
  hiddenGemOrder?: number;
  isTrendingSeed: boolean;
  trendingSeedOrder?: number;
  mostDiscussedThemes: string[];
  bestForTags: string[];
};

export type DiscoverySignal = "discussions" | "insights" | "saves" | "recommendations" | "new" | "editorial";

export type DiscoveryShelf = {
  key: string;
  title: string;
  subtitle: string;
  books: Book[];
  badge: string;
  signal: DiscoverySignal;
  href?: string;
};

export type Profile = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio: string;
  createdAt: string;
  followers: number;
  following: number;
  badges: string[];
  topGenres: string[];
};

export type DiscussionSort =
  | "hot"
  | "new"
  | "rising"
  | "top-today"
  | "top-week"
  | "top-month"
  | "top-all-time"
  | "controversial";

export type DiscussionRankingLabel = "Hot" | "Rising" | "Top";

export type AwardType =
  | "Changed My Thinking"
  | "Practical Advice"
  | "Great Summary"
  | "Best Explanation"
  | "Actionable"
  | "Deep Insight";

export type DiscussionAward = {
  type: AwardType;
  count: number;
};

export type DiscussionPost = {
  id: string;
  bookId: string;
  userId: string;
  postType: PostType;
  perspectiveType?: string;
  title: string;
  body: string;
  quoteReference?: string;
  chapterId?: string;
  conceptId?: string;
  connectedBookId?: string;
  contextType?: string;
  actionTaken?: string;
  outcome?: string;
  whatFailed?: string;
  wouldChange?: string;
  status?: "draft" | "published" | "archived" | "removed";
  createdAt: string;
  updatedAt?: string;
  authorName?: string;
  authorUsername?: string;
  likes: number;
  comments: number;
  saves: number;
  follows: number;
  awards: DiscussionAward[];
  usefulness?: UsefulnessReaction[];
};

export type BookIdea = {
  id: string;
  bookId: string;
  title: string;
  shortExplanation: string;
  whyItMatters: string;
  practicalExample: string;
  chapterOrConcept: string;
  sourceType: "editorial" | "community" | "author_reference";
  editorialStatus: "draft" | "published" | "archived";
};

export type BookKnowledgePreview = {
  bookId: string;
  coreThesis: string;
  helps: string[];
  limitations: string[];
  fullBookDecision: {
    readFullBookIf: string[];
    previewEnoughIf: string[];
    chooseAnotherIf: string[];
    fullBookAdds: string;
    depth: "Introductory" | "Practical" | "Deep" | "Advanced";
    timeCommitment: string;
  };
};

export type PerspectiveCluster = {
  key: string;
  name: string;
  explanation: string;
  postTypes: PostType[];
  reactionHint: UsefulnessReactionType;
};

export type BookConcept = {
  id: string;
  bookId: string;
  name: string;
  explanation: string;
};

export type BookChapter = {
  id: string;
  bookId: string;
  title: string;
  overview: string;
  conceptIds: string[];
};

export type KnowledgePost = {
  id: string;
  userId: string;
  authorName?: string;
  authorUsername?: string;
  title: string;
  body: string;
  topic: string;
  bookId?: string;
  referenceTitle?: string;
  createdAt: string;
  likes: number;
  comments: number;
};

export type ReadingPath = {
  id: string;
  title: string;
  description: string;
  slug: string;
  createdBy?: string;
  isOfficial: boolean;
  createdAt: string;
  bookIds: string[];
  notes: Record<string, string>;
};

export type EditorialPick = {
  id: string;
  title: string;
  description: string;
  targetType: "discussion_post" | "book" | "reading_path";
  targetId: string;
  weekStart: string;
  orderIndex: number;
};
