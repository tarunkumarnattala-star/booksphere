import { Book, BookChapter, BookConcept, BookIdea, BookKnowledgePreview, DiscoveryShelf, DiscussionPost, DiscussionRankingLabel, DiscussionSort, EditorialPick, Genre, KnowledgePost, PerspectiveCluster, Profile, ReadingPath } from "./types";
import { searchEverything, searchKnowledge } from "./search";
import { slugify } from "./utils";

const SEED_NOW = Date.UTC(2026, 5, 29, 12, 0, 0);

export const genres: Genre[] = [
  "Business",
  "Finance",
  "Investing",
  "Personal Growth",
  "Communication",
  "Psychology",
  "Startups",
  "Productivity",
  "Health",
  "Philosophy",
  "Biography",
  "History",
  "Relationships",
  "Leadership"
].map((name) => ({ id: slugify(name), name, slug: slugify(name) }));

const tones: Book["coverTone"][] = ["green", "gold", "blue", "rose", "ink"];

const isbnByTitle: Record<string, string> = {
  "Atomic Habits": "9780735211292",
  "The Psychology of Money": "9780857197689",
  "Deep Work": "9781455586691",
  "Zero to One": "9780804139298",
  "Thinking, Fast and Slow": "9780374533557",
  "Good to Great": "9780066620992",
  "Meditations": "9780140449334",
  "Sapiens": "9780062316097",
  "Never Split the Difference": "9780062407801",
  "Outlive": "9780593236598",
  "The Lean Startup": "9780307887894",
  "The Intelligent Investor": "9780060555665",
  "The 7 Habits of Highly Effective People": "9781982137274",
  "How to Win Friends and Influence People": "9780671027032",
  "Influence": "9780061241895",
  "Steve Jobs": "9781451648539",
  "Shoe Dog": "9781501135927",
  "Becoming": "9781524763138"
};

const coverUrlByTitle: Record<string, string> = {
  "Atomic Habits": "https://covers.openlibrary.org/b/id/12539702-L.jpg",
  "The Psychology of Money": "https://covers.openlibrary.org/b/id/10389354-L.jpg",
  "Deep Work": "https://covers.openlibrary.org/b/id/7988607-L.jpg",
  "Zero to One": "https://covers.openlibrary.org/b/id/9002334-L.jpg",
  "Thinking, Fast and Slow": "https://covers.openlibrary.org/b/id/13290711-L.jpg",
  "Good to Great": "https://covers.openlibrary.org/b/id/7431270-L.jpg",
  "Meditations": "https://covers.openlibrary.org/b/id/211529-L.jpg",
  "Sapiens": "https://covers.openlibrary.org/b/id/8634250-L.jpg",
  "Never Split the Difference": "https://covers.openlibrary.org/b/id/8365942-L.jpg",
  "Outlive": "https://covers.openlibrary.org/b/id/13191259-L.jpg",
  "The Innovator's Dilemma": "https://covers.openlibrary.org/b/id/9274687-L.jpg",
  "High Output Management": "https://covers.openlibrary.org/b/id/421244-L.jpg",
  "The Effective Executive": "https://covers.openlibrary.org/b/id/15226698-L.jpg",
  "Crossing the Chasm": "https://covers.openlibrary.org/b/id/684159-L.jpg",
  "Blue Ocean Strategy": "https://covers.openlibrary.org/b/id/864038-L.jpg",
  "The Lean Startup": "https://covers.openlibrary.org/b/id/7104760-L.jpg",
  "Built to Last": "https://covers.openlibrary.org/b/id/684195-L.jpg",
  "Measure What Matters": "https://covers.openlibrary.org/b/id/10706481-L.jpg",
  "Rework": "https://covers.openlibrary.org/b/id/6679955-L.jpg",
  "The Intelligent Investor": "https://covers.openlibrary.org/b/id/36434-L.jpg",
  "A Random Walk Down Wall Street": "https://covers.openlibrary.org/b/id/246978-L.jpg",
  "The Millionaire Next Door": "https://covers.openlibrary.org/b/id/797467-L.jpg",
  "Your Money or Your Life": "https://covers.openlibrary.org/b/id/6975229-L.jpg",
  "The Richest Man in Babylon": "https://covers.openlibrary.org/b/id/10491331-L.jpg",
  "The Little Book of Common Sense Investing": "https://covers.openlibrary.org/b/id/1239500-L.jpg",
  "Common Stocks and Uncommon Profits": "https://covers.openlibrary.org/b/id/788750-L.jpg",
  "Fooled by Randomness": "https://covers.openlibrary.org/b/id/855791-L.jpg",
  "The Simple Path to Wealth": "https://covers.openlibrary.org/b/id/10448941-L.jpg",
  "One Up On Wall Street": "https://covers.openlibrary.org/b/id/6241104-L.jpg",
  "Security Analysis": "https://covers.openlibrary.org/b/id/60206-L.jpg",
  "The Most Important Thing": "https://covers.openlibrary.org/b/id/10001222-L.jpg",
  "The Essays of Warren Buffett": "https://covers.openlibrary.org/b/id/6497216-L.jpg",
  "Reminiscences of a Stock Operator": "https://covers.openlibrary.org/b/id/300533-L.jpg",
  "Market Wizards": "https://covers.openlibrary.org/b/id/6801784-L.jpg",
  "The Dhandho Investor": "https://covers.openlibrary.org/b/id/1238610-L.jpg",
  "The Warren Buffett Way": "https://covers.openlibrary.org/b/id/9700984-L.jpg",
  "Mindset": "https://covers.openlibrary.org/b/id/746414-L.jpg",
  "The 7 Habits of Highly Effective People": "https://covers.openlibrary.org/b/id/10079937-L.jpg",
  "Essentialism": "https://covers.openlibrary.org/b/id/7285986-L.jpg",
  "The War of Art": "https://covers.openlibrary.org/b/id/288439-L.jpg",
  "The Obstacle Is the Way": "https://covers.openlibrary.org/b/id/14428233-L.jpg",
  "Can't Hurt Me": "https://covers.openlibrary.org/b/id/8305903-L.jpg",
  "Make Your Bed": "https://covers.openlibrary.org/b/id/7984714-L.jpg",
  "Man's Search for Meaning": "https://covers.openlibrary.org/b/id/11203708-L.jpg",
  "How to Win Friends and Influence People": "https://covers.openlibrary.org/b/id/13314878-L.jpg",
  "Crucial Conversations": "https://covers.openlibrary.org/b/id/1711809-L.jpg",
  "Nonviolent Communication": "https://covers.openlibrary.org/b/id/940686-L.jpg",
  "Made to Stick": "https://covers.openlibrary.org/b/id/7004880-L.jpg",
  "Influence": "https://covers.openlibrary.org/b/id/431011-L.jpg",
  "Talk Like TED": "https://covers.openlibrary.org/b/id/7316010-L.jpg",
  "Difficult Conversations": "https://covers.openlibrary.org/b/id/2555094-L.jpg",
  "On Writing Well": "https://covers.openlibrary.org/b/id/20450-L.jpg",
  "Everybody Writes": "https://covers.openlibrary.org/b/id/8449611-L.jpg",
  "Predictably Irrational": "https://covers.openlibrary.org/b/id/2314080-L.jpg",
  "Flow": "https://covers.openlibrary.org/b/id/11041932-L.jpg",
  "The Power of Habit": "https://covers.openlibrary.org/b/id/9078085-L.jpg",
  "Grit": "https://covers.openlibrary.org/b/id/7438753-L.jpg",
  "Stumbling on Happiness": "https://covers.openlibrary.org/b/id/6803663-L.jpg",
  "The Righteous Mind": "https://covers.openlibrary.org/b/id/7256782-L.jpg",
  "Quiet": "https://covers.openlibrary.org/b/id/7079753-L.jpg",
  "Drive": "https://covers.openlibrary.org/b/id/6404786-L.jpg",
  "The Mom Test": "https://covers.openlibrary.org/b/id/10660557-L.jpg",
  "Traction": "https://covers.openlibrary.org/b/id/9364675-L.jpg",
  "Inspired": "https://covers.openlibrary.org/b/id/9700654-L.jpg",
  "Hooked": "https://covers.openlibrary.org/b/id/12511799-L.jpg",
  "The Hard Thing About Hard Things": "https://covers.openlibrary.org/b/id/7279515-L.jpg",
  "Founders at Work": "https://covers.openlibrary.org/b/id/8257114-L.jpg",
  "Blitzscaling": "https://covers.openlibrary.org/b/id/8294642-L.jpg",
  "Venture Deals": "https://covers.openlibrary.org/b/id/8732100-L.jpg",
  "Obviously Awesome": "https://covers.openlibrary.org/b/id/10194369-L.jpg",
  "Getting Things Done": "https://covers.openlibrary.org/b/id/109288-L.jpg",
  "Make Time": "https://covers.openlibrary.org/b/id/14179816-L.jpg",
  "The ONE Thing": "https://covers.openlibrary.org/b/id/10351762-L.jpg",
  "Four Thousand Weeks": "https://covers.openlibrary.org/b/id/11990973-L.jpg",
  "Eat That Frog!": "https://covers.openlibrary.org/b/id/847534-L.jpg",
  "The Checklist Manifesto": "https://covers.openlibrary.org/b/id/8231866-L.jpg",
  "The 80/20 Principle": "https://covers.openlibrary.org/b/id/241591-L.jpg",
  "Digital Minimalism": "https://covers.openlibrary.org/b/id/8507540-L.jpg",
  "Why We Sleep": "https://covers.openlibrary.org/b/id/8814155-L.jpg",
  "Breath": "https://covers.openlibrary.org/b/id/10096454-L.jpg",
  "The Body Keeps the Score": "https://covers.openlibrary.org/b/id/8315367-L.jpg",
  "How Not to Die": "https://covers.openlibrary.org/b/id/7398330-L.jpg",
  "Spark": "https://covers.openlibrary.org/b/id/2379210-L.jpg",
  "In Defense of Food": "https://covers.openlibrary.org/b/id/2960867-L.jpg",
  "The Comfort Crisis": "https://covers.openlibrary.org/b/id/11101220-L.jpg",
  "Letters from a Stoic": "https://covers.openlibrary.org/b/id/103759-L.jpg",
  "The Republic": "https://covers.openlibrary.org/b/id/14377522-L.jpg",
  "Nicomachean Ethics": "https://covers.openlibrary.org/b/id/12593945-L.jpg",
  "Tao Te Ching": "https://covers.openlibrary.org/b/id/662232-L.jpg",
  "The Myth of Sisyphus": "https://covers.openlibrary.org/b/id/12726570-L.jpg",
  "Zen Mind, Beginner's Mind": "https://covers.openlibrary.org/b/id/7025011-L.jpg",
  "Steve Jobs": "https://covers.openlibrary.org/b/id/12374726-L.jpg",
  "Shoe Dog": "https://covers.openlibrary.org/b/id/8858487-L.jpg",
  "The Ride of a Lifetime": "https://covers.openlibrary.org/b/id/8788773-L.jpg",
  "Becoming": "https://covers.openlibrary.org/b/id/8824664-L.jpg",
  "Benjamin Franklin": "https://covers.openlibrary.org/b/id/541092-L.jpg",
  "Leonardo da Vinci": "https://covers.openlibrary.org/b/id/8087691-L.jpg",
  "Team of Rivals": "https://covers.openlibrary.org/b/id/9286949-L.jpg",
  "The Lessons of History": "https://covers.openlibrary.org/b/id/7240225-L.jpg",
  "The Silk Roads": "https://covers.openlibrary.org/b/id/8963642-L.jpg"
};

const bookRows: Array<[string, string, number, string[]]> = [
  ["Atomic Habits", "James Clear", 2018, ["Personal Growth", "Productivity"]],
  ["The Psychology of Money", "Morgan Housel", 2020, ["Finance", "Investing"]],
  ["Deep Work", "Cal Newport", 2016, ["Productivity", "Personal Growth"]],
  ["Zero to One", "Peter Thiel and Blake Masters", 2014, ["Startups", "Business"]],
  ["Thinking, Fast and Slow", "Daniel Kahneman", 2011, ["Psychology", "Business"]],
  ["Good to Great", "Jim Collins", 2001, ["Business", "Leadership"]],
  ["Meditations", "Marcus Aurelius", 180, ["Philosophy", "Personal Growth"]],
  ["Sapiens", "Yuval Noah Harari", 2011, ["History", "Philosophy"]],
  ["Never Split the Difference", "Chris Voss and Tahl Raz", 2016, ["Communication", "Business"]],
  ["Outlive", "Peter Attia and Bill Gifford", 2023, ["Health", "Personal Growth"]],
  ["The Innovator's Dilemma", "Clayton M. Christensen", 1997, ["Business", "Startups"]],
  ["High Output Management", "Andrew S. Grove", 1983, ["Business", "Leadership", "Productivity"]],
  ["The Effective Executive", "Peter F. Drucker", 1966, ["Business", "Leadership", "Productivity"]],
  ["Crossing the Chasm", "Geoffrey A. Moore", 1991, ["Business", "Startups"]],
  ["Blue Ocean Strategy", "W. Chan Kim and Renee Mauborgne", 2005, ["Business"]],
  ["The Lean Startup", "Eric Ries", 2011, ["Business", "Startups"]],
  ["Built to Last", "Jim Collins and Jerry I. Porras", 1994, ["Business", "Leadership"]],
  ["Measure What Matters", "John Doerr", 2018, ["Business", "Startups", "Productivity"]],
  ["Rework", "Jason Fried and David Heinemeier Hansson", 2010, ["Business", "Startups"]],
  ["The Intelligent Investor", "Benjamin Graham", 1949, ["Finance", "Investing"]],
  ["A Random Walk Down Wall Street", "Burton G. Malkiel", 1973, ["Finance", "Investing"]],
  ["The Millionaire Next Door", "Thomas J. Stanley and William D. Danko", 1996, ["Finance", "Personal Growth"]],
  ["Your Money or Your Life", "Vicki Robin and Joe Dominguez", 1992, ["Finance", "Personal Growth"]],
  ["The Richest Man in Babylon", "George S. Clason", 1926, ["Finance", "Personal Growth"]],
  ["The Little Book of Common Sense Investing", "John C. Bogle", 2007, ["Finance", "Investing"]],
  ["Common Stocks and Uncommon Profits", "Philip A. Fisher", 1958, ["Finance", "Investing"]],
  ["Fooled by Randomness", "Nassim Nicholas Taleb", 2001, ["Finance", "Psychology", "Investing"]],
  ["The Simple Path to Wealth", "J. L. Collins", 2016, ["Finance", "Investing"]],
  ["One Up On Wall Street", "Peter Lynch", 1989, ["Investing", "Finance"]],
  ["Security Analysis", "Benjamin Graham and David Dodd", 1934, ["Investing", "Finance"]],
  ["The Most Important Thing", "Howard Marks", 2011, ["Investing", "Finance"]],
  ["The Essays of Warren Buffett", "Warren E. Buffett; edited by Lawrence A. Cunningham", 1997, ["Investing", "Biography"]],
  ["Reminiscences of a Stock Operator", "Edwin Lefevre", 1923, ["Investing", "Biography"]],
  ["Market Wizards", "Jack D. Schwager", 1989, ["Investing", "Biography"]],
  ["The Dhandho Investor", "Mohnish Pabrai", 2007, ["Investing", "Business"]],
  ["The Warren Buffett Way", "Robert G. Hagstrom", 1994, ["Investing", "Biography"]],
  ["Mindset", "Carol S. Dweck", 2006, ["Personal Growth", "Psychology"]],
  ["The 7 Habits of Highly Effective People", "Stephen R. Covey", 1989, ["Personal Growth", "Leadership"]],
  ["Essentialism", "Greg McKeown", 2014, ["Personal Growth", "Productivity"]],
  ["The War of Art", "Steven Pressfield", 2002, ["Personal Growth", "Productivity"]],
  ["The Obstacle Is the Way", "Ryan Holiday", 2014, ["Personal Growth", "Philosophy"]],
  ["Can't Hurt Me", "David Goggins", 2018, ["Personal Growth", "Health", "Biography"]],
  ["Make Your Bed", "William H. McRaven", 2017, ["Personal Growth", "Leadership"]],
  ["Man's Search for Meaning", "Viktor E. Frankl", 1946, ["Personal Growth", "Philosophy", "Psychology"]],
  ["How to Win Friends and Influence People", "Dale Carnegie", 1936, ["Communication", "Relationships", "Leadership"]],
  ["Crucial Conversations", "Kerry Patterson, Joseph Grenny, Ron McMillan, and Al Switzler", 2002, ["Communication", "Leadership", "Relationships"]],
  ["Nonviolent Communication", "Marshall B. Rosenberg", 1999, ["Communication", "Relationships"]],
  ["Made to Stick", "Chip Heath and Dan Heath", 2007, ["Communication", "Business"]],
  ["Influence", "Robert B. Cialdini", 1984, ["Communication", "Psychology", "Business"]],
  ["Talk Like TED", "Carmine Gallo", 2014, ["Communication", "Business"]],
  ["Difficult Conversations", "Douglas Stone, Bruce Patton, and Sheila Heen", 1999, ["Communication", "Relationships"]],
  ["On Writing Well", "William Zinsser", 1976, ["Communication", "Productivity"]],
  ["Everybody Writes", "Ann Handley", 2014, ["Communication", "Business"]],
  ["Predictably Irrational", "Dan Ariely", 2008, ["Psychology", "Business"]],
  ["Flow", "Mihaly Csikszentmihalyi", 1990, ["Psychology", "Productivity"]],
  ["The Power of Habit", "Charles Duhigg", 2012, ["Psychology", "Productivity", "Personal Growth"]],
  ["Grit", "Angela Duckworth", 2016, ["Psychology", "Personal Growth"]],
  ["Stumbling on Happiness", "Daniel Gilbert", 2006, ["Psychology"]],
  ["The Righteous Mind", "Jonathan Haidt", 2012, ["Psychology", "Philosophy"]],
  ["Quiet", "Susan Cain", 2012, ["Psychology", "Communication"]],
  ["Drive", "Daniel H. Pink", 2009, ["Psychology", "Business", "Leadership"]],
  ["The Mom Test", "Rob Fitzpatrick", 2013, ["Startups", "Communication"]],
  ["Traction", "Gabriel Weinberg and Justin Mares", 2014, ["Startups", "Business"]],
  ["Inspired", "Marty Cagan", 2008, ["Startups", "Business"]],
  ["Hooked", "Nir Eyal", 2014, ["Startups", "Psychology"]],
  ["The Hard Thing About Hard Things", "Ben Horowitz", 2014, ["Startups", "Leadership"]],
  ["Founders at Work", "Jessica Livingston", 2007, ["Startups", "Biography"]],
  ["Blitzscaling", "Reid Hoffman and Chris Yeh", 2018, ["Startups", "Business"]],
  ["Venture Deals", "Brad Feld and Jason Mendelson", 2011, ["Startups", "Finance"]],
  ["Obviously Awesome", "April Dunford", 2019, ["Startups", "Communication"]],
  ["Getting Things Done", "David Allen", 2001, ["Productivity"]],
  ["Make Time", "Jake Knapp and John Zeratsky", 2018, ["Productivity", "Health"]],
  ["The ONE Thing", "Gary Keller and Jay Papasan", 2013, ["Productivity", "Business"]],
  ["Four Thousand Weeks", "Oliver Burkeman", 2021, ["Productivity", "Philosophy"]],
  ["Eat That Frog!", "Brian Tracy", 2001, ["Productivity", "Personal Growth"]],
  ["The Checklist Manifesto", "Atul Gawande", 2009, ["Productivity", "Health"]],
  ["The 80/20 Principle", "Richard Koch", 1997, ["Productivity", "Business"]],
  ["Digital Minimalism", "Cal Newport", 2019, ["Productivity", "Philosophy"]],
  ["Why We Sleep", "Matthew Walker", 2017, ["Health", "Productivity"]],
  ["Breath", "James Nestor", 2020, ["Health"]],
  ["The Body Keeps the Score", "Bessel van der Kolk", 2014, ["Health", "Psychology"]],
  ["How Not to Die", "Michael Greger", 2015, ["Health"]],
  ["Spark", "John J. Ratey", 2008, ["Health", "Psychology"]],
  ["In Defense of Food", "Michael Pollan", 2008, ["Health"]],
  ["The Comfort Crisis", "Michael Easter", 2021, ["Health", "Personal Growth"]],
  ["Letters from a Stoic", "Seneca", 65, ["Philosophy", "Personal Growth"]],
  ["The Republic", "Plato", -375, ["Philosophy", "History"]],
  ["Nicomachean Ethics", "Aristotle", -340, ["Philosophy"]],
  ["Tao Te Ching", "Laozi", -400, ["Philosophy"]],
  ["The Myth of Sisyphus", "Albert Camus", 1942, ["Philosophy"]],
  ["Zen Mind, Beginner's Mind", "Shunryu Suzuki", 1970, ["Philosophy", "Personal Growth"]],
  ["Steve Jobs", "Walter Isaacson", 2011, ["Biography", "Business", "Startups"]],
  ["Shoe Dog", "Phil Knight", 2016, ["Biography", "Business"]],
  ["The Ride of a Lifetime", "Robert Iger", 2019, ["Biography", "Leadership", "Business"]],
  ["Becoming", "Michelle Obama", 2018, ["Biography", "Leadership"]],
  ["Benjamin Franklin", "Walter Isaacson", 2003, ["Biography", "History"]],
  ["Leonardo da Vinci", "Walter Isaacson", 2017, ["Biography", "History"]],
  ["Team of Rivals", "Doris Kearns Goodwin", 2005, ["History", "Leadership", "Biography"]],
  ["The Lessons of History", "Will and Ariel Durant", 1968, ["History", "Philosophy"]],
  ["The Silk Roads", "Peter Frankopan", 2015, ["History"]],
  ["The Wright Brothers", "David McCullough", 2015, ["History", "Biography"]],
  ["Attached", "Amir Levine and Rachel Heller", 2010, ["Relationships", "Psychology"]],
  ["Hold Me Tight", "Sue Johnson", 2008, ["Relationships", "Psychology"]],
  ["The Seven Principles for Making Marriage Work", "John Gottman and Nan Silver", 1999, ["Relationships", "Psychology"]],
  ["Dare to Lead", "Brene Brown", 2018, ["Leadership", "Communication"]],
  ["Leaders Eat Last", "Simon Sinek", 2014, ["Leadership", "Business"]],
  ["Extreme Ownership", "Jocko Willink and Leif Babin", 2015, ["Leadership", "Business"]]
];

const editorPickOrder: Record<string, number> = {
  "Atomic Habits": 1,
  "The Psychology of Money": 2,
  "Deep Work": 3,
  "Thinking, Fast and Slow": 4,
  "Zero to One": 5,
  "Meditations": 6,
  "Never Split the Difference": 7,
  "Good to Great": 8,
  "Sapiens": 9,
  "Outlive": 10,
  "The Intelligent Investor": 11,
  "Man's Search for Meaning": 12
};

const beginnerOrder: Record<string, number> = {
  "Atomic Habits": 1,
  "The Psychology of Money": 2,
  "The 7 Habits of Highly Effective People": 3,
  "How to Win Friends and Influence People": 4,
  Mindset: 5,
  "The Lean Startup": 6,
  "The Little Book of Common Sense Investing": 7,
  "Never Split the Difference": 8,
  Essentialism: 9,
  "Why We Sleep": 10,
  Meditations: 11
};

const hiddenGemOrder: Record<string, number> = {
  "The Most Important Thing": 1,
  "The Dhandho Investor": 2,
  "On Writing Well": 3,
  "The Mom Test": 4,
  "The Lessons of History": 5,
  "The Comfort Crisis": 6,
  "Letters from a Stoic": 7,
  "Four Thousand Weeks": 8,
  "Obviously Awesome": 9,
  "Reminiscences of a Stock Operator": 10
};

const trendingSeedOrder: Record<string, number> = {
  "The Psychology of Money": 1,
  "Atomic Habits": 2,
  "Deep Work": 3,
  "Thinking, Fast and Slow": 4,
  "Never Split the Difference": 5,
  "The Intelligent Investor": 6,
  "The Lean Startup": 7,
  "Outlive": 8,
  "Man's Search for Meaning": 9,
  "Good to Great": 10
};

const bestForByGenre: Record<string, string[]> = {
  Business: ["operators", "managers", "builders"],
  Finance: ["new investors", "planners", "families"],
  Investing: ["long-term thinkers", "analysts", "founders"],
  "Personal Growth": ["beginners", "habit builders", "career switchers"],
  Communication: ["leaders", "writers", "negotiators"],
  Psychology: ["decision makers", "coaches", "students"],
  Startups: ["founders", "product teams", "early employees"],
  Productivity: ["makers", "students", "knowledge workers"],
  Health: ["busy professionals", "athletes", "parents"],
  Philosophy: ["reflective readers", "students", "leaders"],
  Biography: ["founders", "leaders", "history readers"],
  History: ["strategists", "citizens", "curious readers"],
  Relationships: ["partners", "families", "communicators"],
  Leadership: ["managers", "founders", "teams"]
};

const themesByGenre: Record<string, string[]> = {
  Business: ["strategy", "execution", "judgment"],
  Finance: ["risk", "independence", "behavior"],
  Investing: ["patience", "valuation", "markets"],
  "Personal Growth": ["habits", "identity", "discipline"],
  Communication: ["listening", "persuasion", "repair"],
  Psychology: ["bias", "motivation", "behavior"],
  Startups: ["customers", "traction", "product"],
  Productivity: ["focus", "systems", "attention"],
  Health: ["energy", "longevity", "recovery"],
  Philosophy: ["meaning", "ethics", "attention"],
  Biography: ["decisions", "taste", "resilience"],
  History: ["patterns", "power", "change"],
  Relationships: ["trust", "attachment", "conversation"],
  Leadership: ["culture", "responsibility", "trust"]
};

const publicationLabels: Record<string, string> = {
  Meditations: "c. 180 CE",
  Sapiens: "2011 (Hebrew); 2014 (English)",
  "Letters from a Stoic": "c. 65 CE",
  "The Republic": "c. 375 BCE",
  "Nicomachean Ethics": "c. 340 BCE",
  "Tao Te Ching": "date uncertain; commonly placed c. 4th century BCE"
};

const verifiedEditorialContext: Record<string, {
  description: string;
  whyMatters: string;
  themes: string[];
  bestFor: string[];
  sources: Array<{ label: string; url: string }>;
}> = {
  "Atomic Habits": {
    description: "A practical behavior-change book about making good habits easier, bad habits harder, and repeated actions more closely aligned with identity.",
    whyMatters: "Its value is the concrete system it gives readers for examining cues, environments, repetition, and identity instead of relying on motivation alone.",
    themes: ["behavior change", "identity", "environment design"],
    bestFor: ["habit builders", "students", "busy professionals"],
    sources: [{ label: "Publisher book page", url: "https://www.penguinrandomhouse.com/books/543993/atomic-habits-by-james-clear/" }]
  },
  "The Psychology of Money": {
    description: "A collection of short essays about how behavior, personal history, incentives, luck, and risk shape financial decisions.",
    whyMatters: "It gives readers a useful starting language for discussing why reasonable people can make very different choices with money.",
    themes: ["money behavior", "risk", "enough"],
    bestFor: ["new investors", "planners", "long-term thinkers"],
    sources: [{ label: "Publisher book page", url: "https://www.harriman-house.com/psychologyofmoney" }]
  },
  "Deep Work": {
    description: "An argument for protecting distraction-free concentration on cognitively demanding work, supported by rules for building that capacity.",
    whyMatters: "It creates a strong discussion about whether focus is a personal habit, a workplace design problem, or both.",
    themes: ["focus", "attention", "work design"],
    bestFor: ["knowledge workers", "students", "makers"],
    sources: [{ label: "Author book page", url: "https://calnewport.com/writing/" }]
  },
  "Thinking, Fast and Slow": {
    description: "A synthesis of research on intuitive and deliberative judgment, heuristics, bias, confidence, choice, and decision-making under uncertainty.",
    whyMatters: "It is influential vocabulary for examining judgment, but individual studies and broad applications should be checked against newer evidence rather than treated as settled fact.",
    themes: ["judgment", "heuristics", "decision-making"],
    bestFor: ["decision makers", "students", "critical readers"],
    sources: [{ label: "Publisher book page", url: "https://us.macmillan.com/books/9780374533557/thinkingfastandslow/" }]
  },
  Meditations: {
    description: "Private philosophical reflections written by the Roman emperor Marcus Aurelius, shaped by Stoic practice and not originally organized as a modern self-help manual.",
    whyMatters: "Readers can compare what disciplined attention, duty, mortality, and control mean across very different lives and historical contexts.",
    themes: ["Stoicism", "duty", "attention"],
    bestFor: ["reflective readers", "philosophy beginners", "leaders"],
    sources: [{ label: "Bibliographic record", url: "https://openlibrary.org/works/OL24967727W/The_meditations_of_Marcus_Aurelius" }]
  },
  Sapiens: {
    description: "A wide-ranging narrative of human history that connects biology, culture, institutions, and shared beliefs across a very long timeline.",
    whyMatters: "Its sweeping synthesis is highly discussion-worthy, but readers should separate its useful framing from claims that specialists may contest or qualify.",
    themes: ["human history", "institutions", "shared beliefs"],
    bestFor: ["history beginners", "systems thinkers", "critical readers"],
    sources: [{ label: "Publisher book page", url: "https://www.harpercollins.com/products/sapiens-yuval-noah-harari" }]
  },
  "Never Split the Difference": {
    description: "A negotiation book built around tactical empathy, calibrated questions, labeling, and other methods drawn from the authors' hostage-negotiation experience.",
    whyMatters: "It gives readers techniques to test in real conversations while inviting debate about context, ethics, and where high-stakes tactics do not transfer cleanly.",
    themes: ["negotiation", "tactical empathy", "calibrated questions"],
    bestFor: ["negotiators", "managers", "communicators"],
    sources: [{ label: "Publisher book page", url: "https://www.harpercollins.com/products/never-split-the-difference-chris-vosstahl-raz" }]
  },
  Outlive: {
    description: "A physician's framework for thinking proactively about longevity through exercise, nutrition, sleep, emotional health, and risk management.",
    whyMatters: "It can help readers ask better health questions, but it is general education and should not be treated as individualized medical advice.",
    themes: ["longevity", "prevention", "healthspan"],
    bestFor: ["health-conscious adults", "caregivers", "evidence-minded readers"],
    sources: [{ label: "Publisher book page", url: "https://www.penguinrandomhouse.com/books/705161/outlive-by-peter-attia-md-with-bill-gifford/" }]
  },
  "Zero to One": {
    description: "A contrarian book about building companies that create genuinely new value instead of only improving or copying what already exists.",
    whyMatters: "It gives founders and product builders a sharp framework for discussing innovation, independent thinking, durable advantage, and how new ideas reach a market.",
    themes: ["innovation", "contrarian thinking", "durable advantage"],
    bestFor: ["founders", "product builders", "independent thinkers"],
    sources: [{ label: "Publisher book page", url: "https://www.penguinrandomhouse.com/books/234730/zero-to-one-by-peter-thiel-with-blake-masters/9780804139304/" }]
  },
  "The Lean Startup": {
    description: "A startup-management framework centered on validated learning, rapid experiments, and the build-measure-learn feedback loop.",
    whyMatters: "It remains a useful common language for testing uncertainty, especially when readers also discuss where experimentation can become shallow or misleading.",
    themes: ["validated learning", "experimentation", "feedback loops"],
    bestFor: ["founders", "product teams", "early employees"],
    sources: [{ label: "Publisher book page", url: "https://www.penguinrandomhouse.com/books/210088/the-lean-startup-by-eric-ries/" }]
  },
  "The Intelligent Investor": {
    description: "A foundational value-investing text focused on temperament, margin of safety, market behavior, and the distinction between investing and speculation.",
    whyMatters: "Its principles still support valuable discussion, while its examples, instruments, and market context require modern interpretation.",
    themes: ["margin of safety", "temperament", "value investing"],
    bestFor: ["long-term investors", "finance students", "market-history readers"],
    sources: [{ label: "Publisher book page", url: "https://www.harpercollins.com/products/the-intelligent-investor-rev-ed-benjamin-graham" }]
  },
  "Man's Search for Meaning": {
    description: "Viktor Frankl's account of Nazi concentration camps followed by an introduction to logotherapy and its emphasis on meaning.",
    whyMatters: "It asks readers to engage survivor testimony and psychological ideas with care, without reducing either part to motivational slogans.",
    themes: ["meaning", "suffering", "logotherapy"],
    bestFor: ["reflective readers", "psychology students", "meaning seekers"],
    sources: [{ label: "Viktor Frankl Institute bibliography", url: "https://www.viktorfrankl.org/standard_publist.html" }]
  },
  "Why We Sleep": {
    description: "A popular-science account of sleep and its relationship to health, learning, performance, and daily life.",
    whyMatters: "The topic is important and the book is influential, but readers should distinguish broad sleep guidance from disputed details and consult current clinical sources for medical decisions.",
    themes: ["sleep", "health", "performance"],
    bestFor: ["general readers", "students", "health-conscious adults"],
    sources: [{ label: "Publisher book page", url: "https://www.simonandschuster.com/books/Why-We-Sleep/Matthew-Walker/9781501144325" }]
  }
};

export const books: Book[] = bookRows.map(([title, author, publishedYear, genreNames], index) => {
  const filteredGenres = genreNames.filter((name) => genres.some((genre) => genre.name === name));
  const primaryGenre = filteredGenres[0] || "Business";
  const verifiedContext = verifiedEditorialContext[title];

  return {
    id: slugify(title),
    title,
    author,
    publishedYear,
    publicationLabel: publicationLabels[title] || String(publishedYear),
    editorialStatus: verifiedContext ? "verified" : "catalog_only",
    sourceLinks: verifiedContext?.sources || [],
    createdAt: new Date(Date.UTC(2026, 5, 28 - (index % 28))).toISOString(),
    isbn: isbnByTitle[title],
    coverUrl: coverUrlByTitle[title],
    genres: filteredGenres,
    coverTone: tones[index % tones.length],
    discussionCount: 0,
    insightCount: 0,
    readersCount: 0,
    saveCount: 0,
    recommendationYesCount: 0,
    recommendationNoCount: 0,
    isEditorsPick: editorPickOrder[title] !== undefined,
    editorsPickOrder: editorPickOrder[title],
    isBeginnerEssential: beginnerOrder[title] !== undefined,
    beginnerOrder: beginnerOrder[title],
    isHiddenGem: hiddenGemOrder[title] !== undefined,
    hiddenGemOrder: hiddenGemOrder[title],
    isTrendingSeed: trendingSeedOrder[title] !== undefined,
    trendingSeedOrder: trendingSeedOrder[title],
    mostDiscussedThemes: verifiedContext?.themes || themesByGenre[primaryGenre] || ["ideas", "practice", "questions"],
    bestForTags: verifiedContext?.bestFor || bestForByGenre[primaryGenre] || ["thoughtful readers", "teams", "students"],
    description: verifiedContext?.description || `${title} by ${author} is a ${primaryGenre.toLowerCase()} title with reader perspectives, questions, and applications gathered around it.`,
    whyMatters: verifiedContext?.whyMatters || "Use the reader perspectives to understand what people took from this book and decide whether it deserves your full attention."
  };
});

const previewByGenre: Record<string, string> = {
  Business: "how organizations make better choices, build durable advantages, and turn judgment into execution",
  Finance: "money behavior, independence, risk, and the habits that make financial decisions calmer",
  Investing: "markets, patience, valuation, uncertainty, and the temperament required to think long term",
  "Personal Growth": "identity, discipline, habits, and the small choices that compound into a different life",
  Communication: "clearer conversations, persuasion, listening, conflict repair, and ideas that travel",
  Psychology: "why people think, choose, repeat patterns, and misunderstand themselves or others",
  Startups: "customers, products, traction, positioning, and the judgment founders need before scale",
  Productivity: "attention, systems, focus, priorities, and how to do meaningful work without more noise",
  Health: "energy, recovery, longevity, and the practical choices that shape how people feel and perform",
  Philosophy: "meaning, ethics, attention, and the questions that help people live with more intention",
  Biography: "real decisions from real lives, showing how taste, pressure, ambition, and resilience develop",
  History: "patterns of power, change, conflict, and human behavior that keep repeating in new forms",
  Relationships: "trust, repair, attachment, listening, and the everyday conversations that shape closeness",
  Leadership: "responsibility, culture, standards, and how people earn trust when decisions affect others"
};

export function getBookPreview(book: Book): string {
  const primaryGenre = book.genres[0] || "Business";
  const previewFocus = previewByGenre[primaryGenre] || "ideas people can carry into decisions, work, and daily life";
  const themes = book.mostDiscussedThemes.slice(0, 3).join(", ");
  const audience = book.bestForTags.slice(0, 3).join(", ");

  return `${book.title} is a ${primaryGenre.toLowerCase()} book for understanding ${previewFocus}. On BookSphere, the best way to read it is through the ideas readers keep testing in real life: ${themes}. It is especially useful for ${audience} who want a book to become a sharper conversation, not just another title on a shelf.`;
}

export const profiles: Profile[] = [
  {
    id: "team",
    name: "BookSphere Team",
    username: "booksphere-team",
    bio: "Starter prompts and editorial picks to help the community begin with substance.",
    createdAt: "2026-01-04",
    followers: 0,
    following: 0,
    badges: ["Editorial Team", "Deep Thinker"],
    topGenres: ["Personal Growth", "Business", "Psychology"]
  },
  {
    id: "starter",
    name: "Community Starter",
    username: "community-starter",
    bio: "Original starter posts written to model thoughtful discussion without pretending to be real user reviews.",
    createdAt: "2026-01-06",
    followers: 0,
    following: 0,
    badges: ["Psychology Reader", "Personal Growth Reader"],
    topGenres: ["Psychology", "Philosophy", "Relationships"]
  },
  {
    id: "reader-ops",
    name: "Reader Ops",
    username: "reader-ops",
    bio: "A practical reading desk for business, startups, and communication ideas.",
    createdAt: "2026-02-11",
    followers: 0,
    following: 0,
    badges: ["Business Reader", "Startup Thinker"],
    topGenres: ["Business", "Startups", "Communication"]
  }
];

function discussionDate(index: number, variant: number) {
  const hoursAgo = 4 + ((index * 11 + variant * 17) % 168);
  return new Date(SEED_NOW - hoursAgo * 60 * 60 * 1000).toISOString();
}

const starterTemplates = [
  {
    postType: "Insight" as const,
    title: (book: Book) => `What is commonly misunderstood about ${book.title}?`,
    body: (book: Book) => `BookSphere Team starter: this thread is for clarifying the idea people often flatten when they talk about ${book.title}. What is the simplest useful explanation, and what nuance should a reader not miss?`
  },
  {
    postType: "Application" as const,
    title: (book: Book) => `Where did a reader actually use ${book.title}?`,
    body: (book: Book) => `Community Starter prompt: share a concrete situation where an idea from ${book.title} changed a decision, routine, conversation, investment, product choice, or relationship. Specific context makes the knowledge reusable.`
  },
  {
    postType: "Disagreement" as const,
    title: (book: Book) => `Where does ${book.title} stop working?`,
    body: () => "BookSphere Team starter: every useful book has boundaries. Name the claim, condition, audience, or chapter where the advice needs more evidence, a different context, or a companion idea."
  },
  {
    postType: "Summary" as const,
    title: (book: Book) => `Explain one idea from ${book.title} without the jargon`,
    body: (book: Book) => `Community Starter prompt: choose one concept from ${book.title} and explain it in plain language so someone can understand the practical point before deciding whether to read the full book.`
  }
];

export const discussions: DiscussionPost[] = books.slice(0, 30).flatMap((book, index) => {
  const first = starterTemplates[index % starterTemplates.length];
  const second = starterTemplates[(index + 1) % starterTemplates.length];

  return [
    {
      id: book.id + "-insight",
      bookId: book.id,
      userId: index % 2 === 0 ? "team" : "starter",
      postType: first.postType,
      title: first.title(book),
      body: first.body(book),
      createdAt: discussionDate(index, 1),
      likes: 0,
      comments: 0,
      saves: 0,
      follows: 0,
      awards: [],
      usefulness: []
    },
    {
      id: book.id + "-application",
      bookId: book.id,
      userId: index % 3 === 0 ? "reader-ops" : "team",
      postType: second.postType,
      title: second.title(book),
      body: second.body(book),
      createdAt: discussionDate(index, 2),
      likes: 0,
      comments: 0,
      saves: 0,
      follows: 0,
      awards: [],
      usefulness: []
    }
  ];
});

export const perspectiveClusters: PerspectiveCluster[] = [
  { key: "applied", name: "Applied It", explanation: "Specific ways readers used this book in work, study, relationships, health, or daily life.", postTypes: ["Application", "Real-Life Result"], reactionHint: "Helped me apply" },
  { key: "insight", name: "Biggest Insight", explanation: "The ideas readers found most clarifying, memorable, or useful.", postTypes: ["Insight"], reactionHint: "Changed my thinking" },
  { key: "did-not-work", name: "What Did Not Work", explanation: "Attempts that failed, conditions where the advice broke down, and what readers changed afterward.", postTypes: ["What Did Not Work", "Limitation"], reactionHint: "Strong counterargument" },
  { key: "disagreed", name: "Disagreed", explanation: "Respectful challenges to a book claim, chapter, concept, or community perspective.", postTypes: ["Disagreement"], reactionHint: "Strong counterargument" },
  { key: "summary", name: "Best Summary", explanation: "Reader explanations judged especially clear and useful by the community.", postTypes: ["Summary"], reactionHint: "Best summary" },
  { key: "connected", name: "Connected It", explanation: "Connections to another book, concept, mental model, field, or lived experience.", postTypes: ["Connection"], reactionHint: "Helped me understand" },
  { key: "questions", name: "Questions", explanation: "Open questions where readers want help understanding or applying the book.", postTypes: ["Question"], reactionHint: "Helped me understand" }
];

export const knowledgePosts: KnowledgePost[] = [
  {
    id: "f45b584a-7794-4a9d-be44-64cb9f58e7fc",
    userId: "team",
    title: "A good mental model should make one decision easier today",
    body: "The best notes are not impressive. They are reusable. Before saving a lesson, ask where it will help you notice, choose, or act differently. A strong knowledge note should make tomorrow's decision easier, not just make today's highlight collection bigger.",
    topic: "Mental Models",
    bookId: "thinking-fast-and-slow",
    createdAt: "2026-06-25",
    likes: 0,
    comments: 0
  },
  {
    id: "a8e5ad6c-59d7-4bc0-9958-2b20043a6bc9",
    userId: "starter",
    title: "Reading groups work better when disagreement is welcomed early",
    body: "If everyone waits until the end to challenge an idea, the discussion becomes polite summary. Bring the useful tension forward. The highest-quality reading groups ask where the book breaks, where it works, and what someone would actually do differently.",
    topic: "Communication",
    bookId: "crucial-conversations",
    createdAt: "2026-06-24",
    likes: 0,
    comments: 0
  },
  {
    id: "f0ea8a54-e182-4497-ad52-43e0961c48ab",
    userId: "reader-ops",
    title: "The smallest useful book note starts with next time",
    body: "A highlight captures the author. An application captures your future behavior. That shift is where a reading habit starts becoming a thinking system. If a note cannot change a meeting, habit, purchase, conversation, or decision, it probably needs one more pass.",
    topic: "Productivity",
    bookId: "atomic-habits",
    createdAt: "2026-06-22",
    likes: 0,
    comments: 0
  }
];

export const readingPaths: ReadingPath[] = [
  {
    id: "path-startups-101",
    title: "Startups 101",
    description: "A practical path for understanding customers, products, traction, and founder judgment.",
    slug: "startups-101",
    createdBy: "team",
    isOfficial: true,
    createdAt: "2026-06-24",
    bookIds: ["the-lean-startup", "the-mom-test", "zero-to-one", "traction", "the-hard-thing-about-hard-things"],
    notes: {
      "the-lean-startup": "Start with experimentation and validated learning.",
      "the-mom-test": "Then learn how to ask better customer questions.",
      "zero-to-one": "Move from process to original judgment.",
      traction: "Add distribution thinking early.",
      "the-hard-thing-about-hard-things": "Finish with the reality of building through hard moments."
    }
  },
  {
    id: "path-personal-finance",
    title: "Personal Finance Starter Pack",
    description: "A calm route through money behavior, independence, and long-term investing.",
    slug: "personal-finance-starter-pack",
    createdBy: "team",
    isOfficial: true,
    createdAt: "2026-06-25",
    bookIds: ["the-psychology-of-money", "your-money-or-your-life", "the-simple-path-to-wealth", "the-little-book-of-common-sense-investing"],
    notes: {
      "the-psychology-of-money": "Begin with behavior before tactics.",
      "your-money-or-your-life": "Clarify what money is actually for.",
      "the-simple-path-to-wealth": "Simplify the investment path.",
      "the-little-book-of-common-sense-investing": "Understand the case for broad, low-cost ownership."
    }
  },
  {
    id: "path-better-habits",
    title: "Build Better Habits",
    description: "A focused sequence for identity, attention, discipline, and sustainable routines.",
    slug: "build-better-habits",
    createdBy: "team",
    isOfficial: true,
    createdAt: "2026-06-26",
    bookIds: ["atomic-habits", "the-power-of-habit", "essentialism", "deep-work", "make-time"],
    notes: {
      "atomic-habits": "Start with small systems and identity.",
      "the-power-of-habit": "Understand cue, routine, and reward.",
      essentialism: "Choose fewer things on purpose.",
      "deep-work": "Protect attention for meaningful work.",
      "make-time": "Turn focus into a repeatable day design."
    }
  },
  {
    id: "path-human-psychology",
    title: "Understand Human Psychology",
    description: "A beginner-friendly path through bias, motivation, personality, and moral judgment.",
    slug: "understand-human-psychology",
    createdBy: "team",
    isOfficial: true,
    createdAt: "2026-06-27",
    bookIds: ["thinking-fast-and-slow", "predictably-irrational", "mindset", "quiet", "the-righteous-mind"],
    notes: {
      "thinking-fast-and-slow": "Learn the language of fast and slow cognition.",
      "predictably-irrational": "See how irrational patterns show up in everyday decisions.",
      mindset: "Study beliefs about learning and growth.",
      quiet: "Understand temperament without stereotypes.",
      "the-righteous-mind": "End with moral psychology and disagreement."
    }
  },
  {
    id: "path-better-communicator",
    title: "Become a Better Communicator",
    description: "Books for listening, persuasion, conflict, writing, and useful disagreement.",
    slug: "become-a-better-communicator",
    createdBy: "team",
    isOfficial: true,
    createdAt: "2026-06-28",
    bookIds: ["how-to-win-friends-and-influence-people", "crucial-conversations", "never-split-the-difference", "nonviolent-communication", "on-writing-well"],
    notes: {
      "how-to-win-friends-and-influence-people": "Start with care and attention.",
      "crucial-conversations": "Handle high-stakes conversations.",
      "never-split-the-difference": "Learn tactical listening.",
      "nonviolent-communication": "Practice needs-based conversation.",
      "on-writing-well": "Make written ideas clearer."
    }
  }
];

const ideaThemesByGenre: Record<string, Array<{ title: string; explanation: string; why: string; example: string; reference: string }>> = {
  "Personal Growth": [
    { title: "Identity changes behavior", explanation: "The most durable change starts when a person sees the behavior as part of who they are becoming.", why: "It moves the reader from temporary motivation to a repeatable self-concept.", example: "Instead of saying you are trying to read more, build the identity of someone who protects ten quiet pages each morning.", reference: "Identity and habits" },
    { title: "Small systems beat rare intensity", explanation: "Repeated systems usually matter more than dramatic one-time effort.", why: "Busy readers need ideas that survive normal weeks, not only inspired days.", example: "Make the next action easy enough to do after a long workday.", reference: "Systems and consistency" }
  ],
  Productivity: [
    { title: "Attention is a design problem", explanation: "Focus improves when the environment protects the important work before distraction arrives.", why: "It treats concentration as something you build around, not something you merely wish for.", example: "Block the first ninety minutes of a day before opening message-heavy tools.", reference: "Focus architecture" },
    { title: "Choose the constraint before the task", explanation: "A clear boundary often creates better work than a vague plan to do more.", why: "It helps readers convert ambition into an actual calendar and workspace.", example: "Decide what will not be done this week so the important project has room.", reference: "Constraints and priorities" }
  ],
  Finance: [
    { title: "Behavior is part of the math", explanation: "Money decisions depend on temperament, incentives, fear, patience, and identity as much as spreadsheets.", why: "It helps readers avoid treating financial life as purely technical.", example: "Choose an investing plan you can keep during a downturn, not only one that looks optimal in a calm model.", reference: "Behavioral risk" },
    { title: "Enough is a strategy", explanation: "Defining enough can protect a reader from unnecessary risk and endless comparison.", why: "It makes money decisions serve a life instead of turning life into a scoreboard.", example: "Set a spending or investing rule that supports freedom rather than status competition.", reference: "Independence and sufficiency" }
  ],
  Investing: [
    { title: "Risk is what survives the spreadsheet", explanation: "Real risk appears when assumptions meet fear, liquidity needs, and bad timing.", why: "It pushes readers beyond simple return chasing.", example: "Keep a margin of safety so a good idea does not fail because the timing was wrong.", reference: "Risk and margin of safety" },
    { title: "Patience creates an edge", explanation: "Many investing ideas reward the person who can wait without constantly reacting.", why: "It turns emotional control into a practical advantage.", example: "Write the reason for buying before price movement starts rewriting your memory.", reference: "Temperament and time" }
  ],
  Business: [
    { title: "Frameworks need operating detail", explanation: "A business idea becomes useful only when someone can translate it into decisions, meetings, incentives, and tradeoffs.", why: "It keeps the reader from collecting slogans without changing how work happens.", example: "Turn a strategy phrase into one hiring, product, or customer decision this week.", reference: "Execution and tradeoffs" },
    { title: "Good strategy says no", explanation: "The clearest business thinking often comes from deciding what not to pursue.", why: "It helps teams avoid mistaking activity for progress.", example: "Choose one customer segment to serve deeply instead of five to serve vaguely.", reference: "Focus and positioning" }
  ],
  Startups: [
    { title: "Learning must touch reality", explanation: "Startup ideas matter when they change what a founder tests with customers, markets, and constraints.", why: "It keeps early teams from building only from internal conviction.", example: "Replace a feature debate with five customer conversations about the problem.", reference: "Validation and learning" },
    { title: "Distribution is part of the product", explanation: "A product idea is incomplete until readers understand how it reaches people.", why: "It helps founders avoid confusing usefulness with adoption.", example: "Define the channel before polishing the second version of the feature.", reference: "Traction and markets" }
  ],
  Communication: [
    { title: "Listening changes the room", explanation: "The strongest communication ideas often begin with making the other person feel accurately understood.", why: "It turns persuasion from pressure into clarity.", example: "Before arguing, summarize the other person’s concern in language they would accept.", reference: "Listening and trust" },
    { title: "Conflict needs structure", explanation: "Hard conversations improve when people name stakes, assumptions, and desired outcomes.", why: "It prevents useful disagreement from becoming personal threat.", example: "Separate the claim being challenged from the person making it.", reference: "Difficult conversations" }
  ],
  Psychology: [
    { title: "The mind protects its shortcuts", explanation: "People often rely on fast patterns that feel obvious before they are examined.", why: "It gives readers a practical reason to slow down around important choices.", example: "Before a major decision, write the alternative explanation you least want to consider.", reference: "Bias and judgment" },
    { title: "Self-awareness needs friction", explanation: "A good psychology idea helps readers notice the gap between intention and behavior.", why: "It turns insight into a usable check on everyday decisions.", example: "Ask what incentive your current behavior is actually obeying.", reference: "Motivation and behavior" }
  ],
  Philosophy: [
    { title: "Ideas become values through practice", explanation: "Philosophy matters when it changes attention, judgment, or conduct.", why: "It keeps abstract thought connected to lived choices.", example: "Use a principle as a decision filter before a stressful conversation.", reference: "Practice and values" },
    { title: "A question can be more useful than an answer", explanation: "Some books help readers hold better questions instead of rushing toward certainty.", why: "It creates room for nuance and intellectual humility.", example: "Ask what kind of person a repeated choice is training you to become.", reference: "Ethics and attention" }
  ],
  Health: [
    { title: "Health advice needs context", explanation: "A useful health idea must fit the reader’s body, constraints, and professional guidance.", why: "It respects the difference between general education and personal medical advice.", example: "Use a book to ask better questions, not to replace a clinician for serious conditions.", reference: "Health context" },
    { title: "Small defaults shape long outcomes", explanation: "Health behavior often changes through repeatable defaults more than heroic discipline.", why: "It helps readers build habits that are boring enough to last.", example: "Make the default meal, walk, or bedtime easier than the alternative.", reference: "Lifestyle systems" }
  ]
};

function primaryGenre(book: Book) {
  return book.genres[0] || "Personal Growth";
}

export function ideaSeedsForBook(book: Book) {
  const primary = primaryGenre(book);
  const themed = ideaThemesByGenre[primary] || ideaThemesByGenre["Personal Growth"];
  const themes = [...book.mostDiscussedThemes, ...book.bestForTags].slice(0, 3);
  return [
    ...themed,
    ...themes.map((theme) => ({
      title: theme,
      explanation: `${book.title} gives readers a practical language for thinking about ${theme.toLowerCase()} without treating the book as the final word.`,
      why: `This matters because ${theme.toLowerCase()} is easier to remember when connected to a real decision, habit, or conversation.`,
      example: `Use ${theme.toLowerCase()} as a prompt: what would change this week if this idea were tested in one concrete situation?`,
      reference: theme
    }))
  ].slice(0, 5);
}

const verifiedIdeaSeeds: Record<string, Array<{ title: string; explanation: string; why: string; example: string; reference: string }>> = {
  "Atomic Habits": [
    { title: "Identity can guide repetition", explanation: "Clear frames lasting habit change as repeated evidence for the kind of person someone wants to become, not merely the completion of a goal.", why: "It connects small actions to a durable reason for continuing them.", example: "Make the next reading session a vote for being someone who protects focused learning time.", reference: "Identity-based habits" },
    { title: "Environment changes the default", explanation: "Visible cues and lower friction can make a desired behavior easier to begin, while hidden cues and added friction can interrupt an unwanted one.", why: "It moves habit design beyond willpower.", example: "Put the book in the place where scrolling usually begins and keep the phone outside that space.", reference: "Cue and environment design" }
  ],
  "The Psychology of Money": [
    { title: "Financial behavior is personal", explanation: "Housel argues that people make money decisions through the narrow window of their own experience, incentives, fears, and opportunities.", why: "It explains why technically informed people can still disagree about reasonable choices.", example: "Before copying someone's portfolio, compare their time horizon, obligations, and tolerance for loss with yours.", reference: "Behavior and personal history" },
    { title: "Room for error protects the plan", explanation: "A plan becomes more durable when it leaves space for uncertainty rather than depending on one precise forecast.", why: "Survival preserves the ability to benefit from long-term compounding.", example: "Keep enough flexibility that an unexpected expense does not force a long-term investment decision at the worst time.", reference: "Risk and room for error" }
  ],
  "Deep Work": [
    { title: "Depth requires protected attention", explanation: "Newport defines deep work as distraction-free concentration on cognitively demanding tasks and argues that it is both valuable and trainable.", why: "It turns focus into a capacity with working conditions, not a vague preference.", example: "Schedule one bounded block for the hardest task before opening communication tools.", reference: "Deep work" },
    { title: "Shallow work needs a budget", explanation: "Administrative and reactive work can expand until it consumes the time needed for harder, higher-value work.", why: "Naming the tradeoff makes calendars and team expectations easier to challenge.", example: "Estimate how much of the week can responsibly go to messages and meetings, then protect the remainder.", reference: "Deep versus shallow work" }
  ],
  "Thinking, Fast and Slow": [
    { title: "Fast and slow are explanatory systems", explanation: "Kahneman uses System 1 and System 2 as a model for contrasting quick, automatic judgment with slower, effortful reasoning.", why: "The model is useful vocabulary, but it should not be mistaken for two literal, separate parts of the brain.", example: "When a high-stakes answer feels immediately obvious, pause long enough to ask what evidence would change it.", reference: "System 1 and System 2" },
    { title: "Use a reference class", explanation: "The outside view begins with outcomes from comparable cases before adjusting for the details of the current case.", why: "It can reduce overconfidence in plans built only from an inside narrative.", example: "Estimate a project's duration from similar completed projects before accepting the team's best-case schedule.", reference: "Outside view and base rates" }
  ],
  Meditations: [
    { title: "Examine the judgment attached to an event", explanation: "Marcus repeatedly separates what happens from the interpretation and response a person adds to it.", why: "It creates a pause between an impression and an action without pretending that circumstances do not matter.", example: "Describe a difficult event in plain facts before deciding what it means about you or another person.", reference: "Judgment and impressions" },
    { title: "Return attention to present duty", explanation: "The notes repeatedly redirect attention from reputation, complaint, and imagined futures toward the work and conduct available now.", why: "It offers a practical use of Stoic reflection rather than a collection of detached quotations.", example: "Choose the next responsible action that is actually within reach, then do it without performing it for approval.", reference: "Duty and present action" }
  ],
  Sapiens: [
    { title: "Shared stories can coordinate strangers", explanation: "Harari argues that collectively believed institutions, identities, and norms help large groups cooperate beyond close personal relationships.", why: "It gives readers a provocative lens for examining money, law, states, and organizations.", example: "Ask which shared belief makes a workplace rule feel natural even though people collectively created it.", reference: "Imagined orders" },
    { title: "A sweeping synthesis needs counterevidence", explanation: "The book connects very large historical developments into a readable narrative, which is also why individual claims can outrun specialist consensus.", why: "The right use is orientation followed by verification, not treating one synthesis as settled history.", example: "Pair a claim about agriculture, empire, or cognition with a specialist source before using it as fact.", reference: "Scope and scholarly limits" }
  ],
  "Never Split the Difference": [
    { title: "Tactical empathy names the other view", explanation: "The authors use labels, summaries, and attentive listening to demonstrate an understanding of another person's position without requiring agreement.", why: "Feeling accurately heard can change the conditions of a negotiation.", example: "State the concern you think the other person is protecting and invite them to correct your wording.", reference: "Tactical empathy" },
    { title: "Calibrated questions shift problem-solving", explanation: "Open questions beginning with how or what can invite the other side to confront constraints and participate in a solution.", why: "They can reveal information that a demand or yes-no question would hide.", example: "Replace an immediate refusal with, 'How would this work with the deadline and resources we have?'", reference: "Calibrated questions" }
  ],
  Outlive: [
    { title: "Healthspan is not only lifespan", explanation: "Attia's framework emphasizes preserving physical, cognitive, and emotional function across the years someone remains alive.", why: "It changes the discussion from avoiding death alone to maintaining the abilities that make later life usable.", example: "Define the physical activities you hope to perform in later decades, then discuss appropriate preparation with a qualified professional.", reference: "Healthspan" },
    { title: "Prevention depends on individual risk", explanation: "The book argues for acting earlier on long-term risk, while the appropriate tests and interventions still depend on personal history and clinical judgment.", why: "It supports better questions without turning general education into a treatment plan.", example: "Use the framework to prepare questions for a clinician, not to diagnose yourself from a chapter.", reference: "Medicine 3.0 framework" }
  ],
  "Zero to One": [
    { title: "New value is different from copying", explanation: "Thiel distinguishes creating something genuinely new from spreading or improving a model the world already understands.", why: "It asks builders to identify what is actually novel about their product rather than treating growth alone as innovation.", example: "Describe the new capability your product creates without comparing it to an existing company.", reference: "Zero to one" },
    { title: "Competition can erase differentiation", explanation: "The book argues that companies create more durable value when they solve a distinct problem well enough to avoid becoming interchangeable.", why: "A clear difference can protect attention, pricing power, and the ability to plan beyond the next reaction to a rival.", example: "Name the narrow group for whom your product is meaningfully better, then test whether they recognize that difference.", reference: "Competition and durable advantage" },
    { title: "Ask what important truth is overlooked", explanation: "A central prompt asks readers to identify an important belief they hold that few other people share.", why: "The question exposes whether a strategy comes from independent reasoning or from repeating accepted assumptions.", example: "Write one industry belief you doubt, then list the evidence that would prove you wrong.", reference: "The contrarian question" },
    { title: "Distribution belongs in the product plan", explanation: "The book treats sales and distribution as essential parts of building a company, not as work that begins after the product is finished.", why: "A strong product creates no impact if the right people never discover, trust, or adopt it.", example: "Choose one realistic path through which the first hundred users will hear about the product and decide to try it.", reference: "Sales and distribution" }
  ],
  "The Lean Startup": [
    { title: "Learning must be validated", explanation: "Ries argues that startup progress should be measured by evidence about customers and a business model, not only by completed features.", why: "It makes uncertainty something a team can test.", example: "State the riskiest customer assumption and design the smallest credible test that could disconfirm it.", reference: "Validated learning" },
    { title: "An MVP is an experiment", explanation: "A minimum viable product is meant to test a specific assumption with the least work needed for reliable learning, not excuse permanently poor quality.", why: "It prevents teams from confusing speed with carelessness.", example: "Write the question the MVP must answer before deciding what can be omitted.", reference: "Minimum viable product" }
  ],
  "The Intelligent Investor": [
    { title: "Margin of safety allows for error", explanation: "Graham's central principle is to leave a meaningful gap between price and a conservative estimate of value.", why: "It acknowledges that analysis and forecasts are uncertain.", example: "Write down which assumptions must be wrong before an investment loses its protective margin.", reference: "Margin of safety" },
    { title: "Mr. Market is an offer, not an instruction", explanation: "Graham's metaphor treats daily market prices as changing offers from an emotional partner rather than commands to buy or sell.", why: "It separates price movement from the investor's underlying reasoning.", example: "Revisit the original thesis before letting a short-term price change rewrite it.", reference: "Mr. Market" }
  ],
  "Man's Search for Meaning": [
    { title: "Meaning is approached through responsibility", explanation: "Frankl presents meaning as specific to a person and situation, often encountered through work, love, or the stance taken toward unavoidable suffering.", why: "It resists reducing purpose to a single universal formula.", example: "Ask what responsibility a present situation is placing before you rather than searching only for a feeling of purpose.", reference: "Logotherapy and meaning" },
    { title: "Suffering is not automatically meaningful", explanation: "Frankl distinguishes unavoidable suffering from suffering that can and should be changed; meaning is not a reason to remain in preventable harm.", why: "This prevents a serious text from becoming a slogan that romanticizes pain.", example: "First ask whether the harmful condition can be changed or escaped before discussing how to respond to it.", reference: "Limits of suffering" }
  ],
  "Why We Sleep": [
    { title: "Sleep affects many systems", explanation: "Walker synthesizes research connecting sleep with learning, attention, mood, performance, and physical health.", why: "It helps readers treat sleep as a biological need rather than unused time.", example: "Track a consistent sleep opportunity and daytime functioning before reaching for a complicated optimization routine.", reference: "Sleep and health" },
    { title: "Popular science still needs claim-level checking", explanation: "The book is influential, but some statistics and broad formulations have been criticized or corrected.", why: "Readers should keep the useful orientation while checking medical claims against current clinical guidance.", example: "Use the book to form questions, then verify a diagnosis or treatment claim with a current professional source.", reference: "Evidence and limitations" }
  ]
};

export const bookIdeas: BookIdea[] = books.filter((book) => book.editorialStatus === "verified").flatMap((book) => (verifiedIdeaSeeds[book.title] || []).map((idea, index) => ({
  id: `${book.id}-idea-${index + 1}`,
  bookId: book.id,
  title: idea.title,
  shortExplanation: idea.explanation,
  whyItMatters: idea.why,
  practicalExample: idea.example,
  chapterOrConcept: idea.reference,
  sourceType: "editorial",
  editorialStatus: "published"
})));

export const bookConcepts: BookConcept[] = books.filter((book) => book.editorialStatus === "verified").flatMap((book) => (
  [...book.mostDiscussedThemes, ...book.bestForTags].slice(0, 5).map((concept) => ({
    id: `${book.id}-${slugify(concept)}`,
    bookId: book.id,
    name: concept,
    explanation: `${concept} is one of the lenses readers use to understand and apply ${book.title}.`
  }))
));

export const bookChapters: BookChapter[] = books.flatMap((book) => {
  const concepts = bookConcepts.filter((concept) => concept.bookId === book.id).slice(0, 3);
  return concepts.length ? [
    {
      id: `${book.id}-chapter-core`,
      bookId: book.id,
      title: "Core ideas",
      overview: `Start with the concepts readers use most often to explain, apply, and challenge ${book.title}.`,
      conceptIds: concepts.map((concept) => concept.id)
    }
  ] : [];
});

const knowledgePreviewOverrides: Record<string, Omit<BookKnowledgePreview, "bookId">> = {
  "Zero to One": {
    coreThesis: "Zero to One argues that meaningful progress comes from creating new value, not only competing inside familiar models. Its most useful questions concern what makes an idea genuinely different, why a company can remain distinctive, and how product, distribution, people, and timing work together.",
    helps: [
      "Founders deciding whether an idea is truly differentiated.",
      "Product builders shaping an early market and distribution plan.",
      "Independent thinkers testing accepted assumptions about innovation."
    ],
    limitations: [
      "The book is a founder's framework, not a step-by-step operating manual.",
      "Its strongest claims about competition and monopoly should be debated rather than copied as universal rules.",
      "The examples reflect a particular technology-investing context and do not transfer equally to every industry."
    ],
    fullBookDecision: {
      readFullBookIf: [
        "You are choosing, founding, or shaping a new company.",
        "You want the complete reasoning and examples behind its contrarian claims.",
        "You want to challenge your assumptions about competition, distribution, and innovation."
      ],
      previewEnoughIf: [
        "You need the central questions before evaluating a startup idea.",
        "You are comparing several approaches to entrepreneurship.",
        "You mainly want the reader applications and disagreements."
      ],
      chooseAnotherIf: [
        "You need a tactical guide to customer interviews or daily operations.",
        "You want broad evidence across many industries rather than a contrarian technology thesis.",
        "You need a beginner guide to launching a small, conventional business."
      ],
      fullBookAdds: "The full book adds the argument's progression, examples, and sharper context around its controversial claims. Read it when those claims affect a real company decision; use BookSphere first when you need orientation and multiple reader interpretations.",
      depth: "Practical",
      timeCommitment: "About 4 focused hours"
    }
  }
};

export const bookKnowledgePreviews: BookKnowledgePreview[] = books.filter((book) => book.editorialStatus === "verified").map((book) => {
  const genre = primaryGenre(book);
  const override = knowledgePreviewOverrides[book.title];
  if (override) return { bookId: book.id, ...override };
  return {
    bookId: book.id,
    coreThesis: `${book.description} ${book.whyMatters}`,
    helps: [
      `Readers trying to understand ${book.mostDiscussedThemes[0]?.toLowerCase() || genre.toLowerCase()} in practical situations.`,
      `People deciding whether ${book.title} is worth a full read.`,
      `Contributors who want to compare applications, summaries, and respectful disagreements.`
    ],
    limitations: [
      "This preview is original editorial context and reader interpretation, not a complete substitute for the author’s full argument.",
      "Some ideas need the full book’s examples, repetition, and nuance before they can be applied well.",
      genre === "Finance" || genre === "Investing" || genre === "Health" ? "Use this as educational context, not personal professional advice." : "The best use depends on the reader’s situation, not only the book’s popularity."
    ],
    fullBookDecision: {
      readFullBookIf: [
        "You want the complete argument, examples, and nuance in the author’s own structure.",
        "You plan to apply the ideas seriously and need repetition, context, and caveats.",
        "The reader perspectives raise questions you want to examine at the source."
      ],
      previewEnoughIf: [
        "You need orientation before deciding where to spend deep reading time.",
        "You want the major ideas and practical reader applications first.",
        "You are comparing several books around the same problem."
      ],
      chooseAnotherIf: [
        "You need a more beginner-friendly entry point.",
        "You need technical implementation detail this book does not emphasize.",
        "The limitations or disagreements match your current situation too closely."
      ],
      fullBookAdds: "The full book adds the author’s sequencing, examples, evidence, caveats, and emotional force. BookSphere helps you decide whether that depth is worth your next block of attention.",
      depth: book.isBeginnerEssential ? "Introductory" : book.genres.includes("Investing") || book.genres.includes("Philosophy") ? "Deep" : "Practical",
      timeCommitment: book.publishedYear < 1950 ? "Several focused sessions" : "A weekend or a few commutes"
    }
  };
});

const uniqueEditorialDiscussionPosts = discussions.filter((post, index, allPosts) => (
  allPosts.findIndex((candidate) => candidate.bookId === post.bookId) === index
));

export const editorialPicks: EditorialPick[] = uniqueEditorialDiscussionPosts.slice(0, 5).map((post, index) => ({
  id: "editorial-" + post.id,
  title: [
    "A practical thread about turning ideas into behavior",
    "A sharper way to discuss money and identity",
    "A useful question about focus in real life",
    "A founder-minded conversation worth saving",
    "A psychology thread with unusually clear framing"
  ][index] || post.title,
  description: [
    "A good example of how BookSphere turns a book into a decision someone can use today.",
    "This thread keeps the conversation about money human instead of mechanical.",
    "Readers are using this one to compare what focus actually looks like in a normal week.",
    "A concise discussion for builders who want more than startup slogans.",
    "Strong starter material for learning how thoughtful disagreement can improve a book."
  ][index] || "A high-signal discussion selected by BookSphere Team.",
  targetType: "discussion_post",
  targetId: post.id,
  weekStart: "2026-06-29",
  orderIndex: index + 1
}));

export function getBook(id: string) {
  return books.find((book) => book.id === id);
}

export function getGenre(slug: string) {
  return genres.find((genre) => genre.slug === slug);
}

export function getProfile(username: string) {
  return profiles.find((profile) => profile.username === username);
}

export function getProfileById(id: string) {
  if (id === "local-reader") {
    return {
      id: "local-reader",
      name: "You",
      username: "local-reader",
      bio: "Local beta reader account.",
      createdAt: new Date(SEED_NOW).toISOString(),
      followers: 0,
      following: 0,
      badges: ["Beta Reader"],
      topGenres: ["Books", "Ideas"]
    };
  }
  return profiles.find((profile) => profile.id === id) || profiles[0];
}

export function getBooksForGenre(genreName: string) {
  return books.filter((book) => book.genres.includes(genreName));
}

function inGenre(book: Book, genre?: string) {
  return !genre || book.genres.includes(genre);
}

function byEditorialOrder(orderKey: keyof Pick<Book, "editorsPickOrder" | "beginnerOrder" | "hiddenGemOrder" | "trendingSeedOrder">) {
  return (a: Book, b: Book) => {
    const aOrder = a[orderKey] ?? 999;
    const bOrder = b[orderKey] ?? 999;
    return aOrder - bOrder || b.discussionCount - a.discussionCount;
  };
}

function recommendationTotal(book: Book) {
  return book.recommendationYesCount + book.recommendationNoCount;
}

export function getRecommendationPercent(book: Book) {
  const total = recommendationTotal(book);
  if (total < 5) return null;
  return Math.round((book.recommendationYesCount / total) * 100);
}

function withFallback(sortedBooks: Book[], genre?: string, max = 10) {
  const result: Book[] = [];
  const addBook = (book: Book) => {
    if (inGenre(book, genre) && !result.some((existing) => existing.id === book.id)) result.push(book);
  };

  sortedBooks.forEach(addBook);
  books
    .filter((book) => book.isEditorsPick && inGenre(book, genre))
    .sort(byEditorialOrder("editorsPickOrder"))
    .forEach(addBook);
  books.filter((book) => inGenre(book, genre)).sort((a, b) => b.discussionCount + b.insightCount - (a.discussionCount + a.insightCount)).forEach(addBook);

  return result.slice(0, max);
}

export function getEditorsPicks(genre?: string, max = 10) {
  return withFallback(
    books
      .filter((book) => book.isEditorsPick && inGenre(book, genre))
      .sort(byEditorialOrder("editorsPickOrder")),
    genre,
    max
  );
}

export function getTrendingDiscussions(genre?: string, max = 10) {
  const recentWeightByBook = new Map<string, number>();
  discussions.forEach((post) => {
    const ageMs = SEED_NOW - new Date(post.createdAt).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (ageMs <= sevenDaysMs) recentWeightByBook.set(post.bookId, (recentWeightByBook.get(post.bookId) || 0) + post.comments + 1);
  });

  const ranked = books
    .filter((book) => inGenre(book, genre))
    .sort((a, b) => {
      const bScore = (recentWeightByBook.get(b.id) || 0) * 10 + (b.isTrendingSeed ? 8 : 0) - (b.trendingSeedOrder || 0);
      const aScore = (recentWeightByBook.get(a.id) || 0) * 10 + (a.isTrendingSeed ? 8 : 0) - (a.trendingSeedOrder || 0);
      return bScore - aScore || b.discussionCount - a.discussionCount;
    });

  return withFallback(ranked, genre, max);
}

export function getMostDiscussed(genre?: string, max = 10) {
  return withFallback(
    books.filter((book) => inGenre(book, genre)).sort((a, b) => b.discussionCount - a.discussionCount),
    genre,
    max
  );
}

export function getMostSaved(genre?: string, max = 10) {
  return withFallback(
    books.filter((book) => inGenre(book, genre)).sort((a, b) => b.saveCount - a.saveCount),
    genre,
    max
  );
}

export function getMostRecommended(genre?: string, max = 10) {
  return withFallback(
    books
      .filter((book) => inGenre(book, genre))
      .sort((a, b) => {
        const bPercent = getRecommendationPercent(b) || 0;
        const aPercent = getRecommendationPercent(a) || 0;
        return bPercent - aPercent || recommendationTotal(b) - recommendationTotal(a);
      }),
    genre,
    max
  );
}

export function getBeginnerEssentials(genre?: string, max = 10) {
  return withFallback(
    books
      .filter((book) => book.isBeginnerEssential && inGenre(book, genre))
      .sort(byEditorialOrder("beginnerOrder")),
    genre,
    max
  );
}

export function getHiddenGems(genre?: string, max = 10) {
  return withFallback(
    books
      .filter((book) => book.isHiddenGem && inGenre(book, genre))
      .sort(byEditorialOrder("hiddenGemOrder")),
    genre,
    max
  );
}

export function getRecentlyAdded(genre?: string, max = 10) {
  return withFallback(
    books.filter((book) => inGenre(book, genre)).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    genre,
    max
  );
}

export function getBookActivityLine(book: Book, signal: DiscoveryShelf["signal"] = "discussions") {
  if (signal === "editorial") return book.editorialStatus === "verified" ? "Knowledge guide" : "Reader discussion";
  if (signal === "insights") return `💡 ${book.insightCount} reader insights`;
  if (signal === "saves") return `❤️ ${book.saveCount} saves`;
  if (signal === "recommendations") {
    const percent = getRecommendationPercent(book);
    return percent ? `👍 ${percent}% would recommend` : "New recommendation data";
  }
  if (signal === "new") return `Added ${new Date(book.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  return `🔥 ${book.discussionCount} active discussions`;
}

export function getBookShelfBadge(book: Book, fallback = "BookSphere Pick") {
  if (book.isEditorsPick) return "Editor’s Pick";
  if (book.isBeginnerEssential) return "Beginner Essential";
  if (book.isHiddenGem) return "Hidden Gem";
  if (book.isTrendingSeed) return "Active Discussion";
  return fallback;
}

export function getHomeDiscoveryShelves(): DiscoveryShelf[] {
  return [
    {
      key: "editors-picks",
      title: "Editor’s Picks",
      subtitle: "Hand-selected starting points while the community grows.",
      books: getEditorsPicks(),
      badge: "Editor’s Pick",
      signal: "editorial"
    },
    {
      key: "trending-discussions",
      title: "Discussion Starters",
      subtitle: "Editorial prompts ready for the first reader perspectives.",
      books: getTrendingDiscussions(),
      badge: "Starter Prompt",
      signal: "editorial"
    },
    {
      key: "most-discussed",
      title: "Books to Compare",
      subtitle: "Strong starting points for applications, limits, and disagreement.",
      books: getMostDiscussed(),
      badge: "Editorial Selection",
      signal: "editorial"
    },
    {
      key: "most-saved",
      title: "Worth Returning To",
      subtitle: "Evergreen books selected for long-term knowledge value.",
      books: getMostSaved(),
      badge: "Evergreen",
      signal: "editorial"
    },
    {
      key: "most-recommended",
      title: "Editorially Recommended",
      subtitle: "Curated entry points while reader recommendation data grows.",
      books: getMostRecommended(),
      badge: "Recommended",
      signal: "editorial"
    },
    {
      key: "beginner-essentials",
      title: "Beginner Essentials",
      subtitle: "Clear, accessible books for entering a subject.",
      books: getBeginnerEssentials(),
      badge: "Beginner Essential",
      signal: "editorial"
    },
    {
      key: "hidden-gems",
      title: "Hidden Gems",
      subtitle: "Underrated books with unusually strong ideas.",
      books: getHiddenGems(),
      badge: "Hidden Gem",
      signal: "editorial"
    },
    {
      key: "recently-added",
      title: "Recently Added",
      subtitle: "Newly added books ready for discussion.",
      books: getRecentlyAdded(),
      badge: "Recently Added",
      signal: "new"
    }
  ];
}

export function getGenreDiscoveryShelves(genreName: string): DiscoveryShelf[] {
  return [
    {
      key: "genre-editors-picks",
      title: `Editor’s Picks in ${genreName}`,
      subtitle: "Curated books that make the best first impression.",
      books: getEditorsPicks(genreName),
      badge: "Editor’s Pick",
      signal: "insights"
    },
    {
      key: "genre-most-discussed",
      title: `Core Books in ${genreName}`,
      subtitle: "High-value starting points selected for this reading room.",
      books: getMostDiscussed(genreName),
      badge: "Core Book",
      signal: "editorial"
    },
    {
      key: "genre-beginner",
      title: `Beginner Essentials in ${genreName}`,
      subtitle: "Accessible entry points with practical takeaways.",
      books: getBeginnerEssentials(genreName),
      badge: "Beginner Essential",
      signal: "editorial"
    },
    {
      key: "genre-hidden-gems",
      title: `Hidden Gems in ${genreName}`,
      subtitle: "Less obvious books worth discovering.",
      books: getHiddenGems(genreName),
      badge: "Hidden Gem",
      signal: "editorial"
    },
    {
      key: "genre-recent",
      title: `Recently Added in ${genreName}`,
      subtitle: "New additions to this reading room.",
      books: getRecentlyAdded(genreName),
      badge: "Recently Added",
      signal: "new"
    }
  ];
}

export function getDiscussionsForBook(bookId: string) {
  return discussions.filter((post) => post.bookId === bookId);
}

export function getBookIdeas(bookId: string) {
  return bookIdeas.filter((idea) => idea.bookId === bookId && idea.editorialStatus === "published");
}

export function getBookKnowledgePreview(bookId: string) {
  return bookKnowledgePreviews.find((preview) => preview.bookId === bookId);
}

export function getBookConcepts(bookId: string) {
  return bookConcepts.filter((concept) => concept.bookId === bookId);
}

export function getBookChapters(bookId: string) {
  return bookChapters.filter((chapter) => chapter.bookId === bookId);
}

export function getPerspectiveClustersForBook(bookId: string, sourcePosts?: DiscussionPost[]) {
  const posts = sourcePosts || getDiscussionsForBook(bookId);
  return perspectiveClusters.map((cluster) => {
    const clusterPosts = posts.filter((post) => cluster.postTypes.includes(post.postType));
    return {
      ...cluster,
      count: clusterPosts.length,
      posts: clusterPosts.slice(0, 3)
    };
  });
}

export function getKnowledgePost(postId: string) {
  return knowledgePosts.find((post) => post.id === postId);
}

export function searchAll(query: string) {
  return searchEverything(query, {
    books,
    genres,
    profiles,
    discussions,
    knowledgePosts,
    limit: 12,
    includeGlobalFallback: true,
    minQueryLength: 1
  });
}

export function searchKnowledgeNetwork(query: string) {
  return searchKnowledge(query, {
    books,
    genres,
    discussions,
    knowledgePosts,
    readingPaths
  });
}


export const discussionSortOptions: Array<{ value: DiscussionSort; label: string }> = [
  { value: "hot", label: "Hot" },
  { value: "new", label: "New" },
  { value: "rising", label: "Rising" },
  { value: "top-today", label: "Top Today" },
  { value: "top-week", label: "Top Week" },
  { value: "top-month", label: "Top Month" },
  { value: "top-all-time", label: "Top All Time" },
  { value: "controversial", label: "Controversial" }
];

function engagement(post: DiscussionPost) {
  return post.likes + post.comments * 2 + post.saves + post.awards.reduce((sum, award) => sum + award.count, 0);
}

function hoursSince(date: string) {
  return Math.max(1, (SEED_NOW - new Date(date).getTime()) / 36e5);
}

export function getDiscussionScore(post: DiscussionPost, sort: DiscussionSort = "hot") {
  const ageHours = hoursSince(post.createdAt);
  const base = engagement(post);

  if (sort === "new") return new Date(post.createdAt).getTime();
  if (sort === "rising") return ageHours <= 72 ? base / Math.pow(ageHours, 0.72) : base / Math.pow(ageHours, 1.25);
  if (sort === "controversial") return post.comments * 3 + Math.max(0, 80 - post.likes) + post.awards.filter((award) => award.type === "Deep Insight").length * 10;
  if (sort === "top-today") return ageHours <= 24 ? base : base * 0.08;
  if (sort === "top-week") return ageHours <= 168 ? base : base * 0.15;
  if (sort === "top-month") return ageHours <= 720 ? base : base * 0.25;
  if (sort === "top-all-time") return base;
  return base / Math.pow(ageHours + 2, 0.42);
}

export function getDiscussionRankingLabel(post: DiscussionPost): DiscussionRankingLabel {
  const ageHours = hoursSince(post.createdAt);
  const score = engagement(post);
  if (ageHours <= 72 && score > 80) return "Rising";
  if (score > 140) return "Top";
  return "Hot";
}

export function sortDiscussions(posts: DiscussionPost[], sort: DiscussionSort = "hot") {
  return [...posts].sort((a, b) => getDiscussionScore(b, sort) - getDiscussionScore(a, sort));
}

export function getTrendingDiscussionPosts(max = 10) {
  const ranked = sortDiscussions(discussions, "hot");
  return ranked.length ? ranked.slice(0, max) : discussions.slice(0, max);
}

export function getEditorialDiscussionPicks(max = 5) {
  return editorialPicks
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .slice(0, max)
    .map((pick) => ({ pick, post: discussions.find((post) => post.id === pick.targetId) }))
    .filter((item): item is { pick: EditorialPick; post: DiscussionPost } => Boolean(item.post));
}

export function getReadingPath(slug: string) {
  return readingPaths.find((path) => path.slug === slug);
}

export function getPathBooks(path: ReadingPath) {
  return path.bookIds.map((bookId) => getBook(bookId)).filter((book): book is Book => Boolean(book));
}

export function getReadingPathsForGenre(genreName: string, max = 4) {
  const ranked = readingPaths.filter((path) => getPathBooks(path).some((book) => book.genres.includes(genreName)));
  return (ranked.length ? ranked : readingPaths).slice(0, max);
}

export function getOftenReadNext(bookId: string, max = 5) {
  const path = readingPaths.find((item) => item.bookIds.includes(bookId));
  if (!path) return getEditorsPicks(undefined, max);
  const index = path.bookIds.indexOf(bookId);
  const nextIds = path.bookIds.slice(index + 1).concat(path.bookIds.slice(0, index));
  const nextBooks = nextIds.map((id) => getBook(id)).filter((book): book is Book => Boolean(book));
  return withFallback(nextBooks, undefined, max);
}

export function getSavedInsightPosts(max = 8) {
  return sortDiscussions(discussions, "top-all-time").slice(0, max);
}

export function getFollowedDiscussionPosts(max = 8) {
  return sortDiscussions(discussions, "rising").slice(0, max);
}
