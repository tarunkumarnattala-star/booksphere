// The editorial layer.
//
// 89% of the catalogue had nothing on it, so a reader arriving from a link opened a book and
// found an empty page. This fills a book with something honest to read on day one, and it is
// written by BookSphere - never dressed up as a reader's experience. Reader perspectives sit
// above it and, as they arrive, become the thing people come for.
//
// The five kinds are the product's whole argument about what understanding a book means: what
// it claims, what you can actually do, where it stops working, what is genuinely in dispute,
// and what most people get wrong about it. A summary gives you the first. The other four are
// the reason to come here instead.
//
// Rules for writing these, which hold for every book added later:
//   - Describe the book's argument, not a verdict on it.
//   - Never invent a study, a statistic, a quote or a named critic. If a claim needs a source
//     to stand up and the source is not certain, write the practical limit instead.
//   - "contested" means a real disagreement a reader would meet in the wild, often with
//     another book on this shelf - not a manufactured both-sides.
//   - Every "practice" card names something a person could do tomorrow, not a principle.

export type EditorialKind = "argument" | "practice" | "limit" | "contested" | "misread";

export type EditorialCard = {
  id: string;
  kind: EditorialKind;
  /** One sentence. The thing a reader takes away if they read nothing else. */
  claim: string;
  /** Two or three sentences. What it means and how it actually works. */
  body: string;
  /** Only on practice cards: the first concrete move, small enough to do tomorrow. */
  tryIt?: string;
  /** Only on contested cards: the book on this shelf that disagrees. */
  argumentWith?: string;
};

export type BookEditorial = {
  /** Matches Book.id (the slug of the title). */
  bookId: string;
  /** What the book is really about, in one line, without the jacket language. */
  inOneLine: string;
  /** Who it genuinely helps - and the honesty of this is the point. */
  forWhom: string;
  cards: EditorialCard[];
};

export const EDITORIAL_KIND_LABEL: Record<EditorialKind, string> = {
  argument: "What it argues",
  practice: "What you can do",
  limit: "Where it stops working",
  contested: "What's disputed",
  misread: "What people get wrong"
};

const entries: BookEditorial[] = [
  {
    bookId: "atomic-habits",
    inOneLine: "Behaviour changes when the system around you changes, not when you decide to want it more.",
    forWhom: "Anyone whose days are mostly their own to arrange, and who keeps restarting the same routine.",
    cards: [
      {
        id: "atomic-habits:argument-systems",
        kind: "argument",
        claim: "You do not rise to your goals, you fall to your systems.",
        body: "Clear's central move is to take attention off the outcome and put it on the conditions that produce the behaviour. Goals are shared by winners and losers alike; what differs is the arrangement of cues, effort and reward around the daily action."
      },
      {
        id: "atomic-habits:argument-identity",
        kind: "argument",
        claim: "The durable unit of change is identity, not outcome.",
        body: "The book argues that habits stick when each repetition casts a vote for the kind of person you believe you are. 'I am someone who trains' survives a bad week in a way that 'I want to lose ten kilos' does not."
      },
      {
        id: "atomic-habits:practice-two-minute",
        kind: "practice",
        claim: "Shrink the habit until starting is trivial.",
        body: "Most habits die at the moment of initiation, not during. Reducing the entry cost to about two minutes makes the decision disappear, and the behaviour usually continues past the two minutes on its own.",
        tryIt: "Rewrite your habit as the smallest version that still counts. 'Read a chapter' becomes 'open the book'."
      },
      {
        id: "atomic-habits:practice-environment",
        kind: "practice",
        claim: "Change the room before you change your mind.",
        body: "Clear treats willpower as a poor lever and the environment as a strong one. Putting the thing you want in your line of sight, and the thing you do not two rooms away, does more than resolving harder.",
        tryIt: "Pick one habit and move one object tonight - the guitar onto the stand, the phone charger out of the bedroom."
      },
      {
        id: "atomic-habits:practice-never-twice",
        kind: "practice",
        claim: "Missing once is an accident. Missing twice starts a new habit.",
        body: "The rule concedes that you will break the chain, which is what makes it usable. It moves the target from perfection to recovery speed, and recovery speed is what actually separates people who keep going.",
        tryIt: "Decide now what the reduced version is for a bad day, so the choice is not made while you are tired."
      },
      {
        id: "atomic-habits:limit-control",
        kind: "limit",
        claim: "It assumes your time and your space are yours to arrange.",
        body: "Nearly every mechanism in the book - stacking, environment design, fixed cues - needs a repeating day you control. On rotating shifts, with a newborn, or in a job where other people set your hours, the advice describes a life you do not have, and the failure reads as a personal one when it is structural."
      },
      {
        id: "atomic-habits:contested-compounding",
        kind: "contested",
        claim: "The '1% better every day' maths is a metaphor wearing a lab coat.",
        body: "The compounding curve is a motivational image, not a measured property of human behaviour - skills plateau, bodies cap out, and life interrupts. It is genuinely useful for getting started and genuinely misleading if you plan around it.",
        argumentWith: "four-thousand-weeks"
      },
      {
        id: "atomic-habits:misread-tiny",
        kind: "misread",
        claim: "People take the small steps and skip the identity argument.",
        body: "The most quoted part is the two-minute rule, which is the easiest to apply and the least load-bearing. Clear's actual claim is that small actions work because of what they prove to you about yourself - drop that and you are left with a productivity trick that fades in a fortnight."
      }
    ]
  },
  {
    bookId: "deep-work",
    inOneLine: "The ability to concentrate hard on one difficult thing is becoming rare, and therefore valuable.",
    forWhom: "People paid for the quality of their thinking who can defend a few hours of their calendar.",
    cards: [
      {
        id: "deep-work:argument-scarcity",
        kind: "argument",
        claim: "Concentration is becoming scarce exactly as it becomes valuable.",
        body: "Newport's economic claim is that the work that pays well increasingly requires sustained focus, while the tools of modern work make sustained focus harder. The gap between the two is where he says advantage now sits."
      },
      {
        id: "deep-work:argument-shallow",
        kind: "argument",
        claim: "Shallow work expands to fill whatever space you leave it.",
        body: "Email, messages and meetings feel productive because they are visible and immediately rewarding. Newport's point is not that they are worthless but that they are unbounded, and anything unbounded will consume the hours you did not explicitly protect."
      },
      {
        id: "deep-work:practice-block",
        kind: "practice",
        claim: "Put focus on the calendar as an appointment, not an intention.",
        body: "Unscheduled focus loses every negotiation with scheduled anything. Giving it a defended block, ideally at the start of the day before the inbox sets the agenda, is the single mechanism the book rests on.",
        tryIt: "Block ninety minutes tomorrow morning before you open mail, and name the block after the actual task."
      },
      {
        id: "deep-work:practice-shutdown",
        kind: "practice",
        claim: "End the day with a defined stop, not a fade.",
        body: "Newport argues that unfinished work keeps running in the background and degrades your recovery. A deliberate shutdown - reviewing what is open, writing tomorrow's first move, then stopping - gives the mind permission to release it.",
        tryIt: "Write tomorrow's first task on paper before you close the laptop, then do not reopen it."
      },
      {
        id: "deep-work:limit-autonomy",
        kind: "limit",
        claim: "It is written for people whose responsiveness is not the job.",
        body: "In support, clinical, retail, operations and most junior roles, being reachable is the work, and a two-hour unreachable block is a disciplinary matter rather than a productivity win. The book does acknowledge this, but the advice is still built for people with calendar authority."
      },
      {
        id: "deep-work:contested-novelty",
        kind: "contested",
        claim: "Whether distraction is genuinely worse now, or simply better documented.",
        body: "Open-plan offices, telephones and interruption are not new, and every generation has believed its own attention to be uniquely besieged. The disagreement is whether the smartphone is a change of degree or of kind - and your answer changes how drastic a response is justified.",
        argumentWith: "the-shallows"
      },
      {
        id: "deep-work:misread-hours",
        kind: "misread",
        claim: "It gets read as 'work more hours in silence'.",
        body: "Newport's argument runs the other way: deep work is metabolically limited to a few hours a day even for experts, so the aim is fewer, harder hours with a firm stop. People who take it as licence to grind are following the opposite of the book."
      }
    ]
  },
  {
    bookId: "four-thousand-weeks",
    inOneLine: "You will not get on top of everything, and building a life around the attempt is the mistake.",
    forWhom: "People who have already tried the systems and feel further behind for it.",
    cards: [
      {
        id: "four-thousand-weeks:argument-finitude",
        kind: "argument",
        claim: "The promise underneath productivity advice is false.",
        body: "Burkeman's claim is that efficiency does not create space, it creates throughput - clear the inbox faster and more arrives. Because the demands are effectively infinite and the weeks are roughly four thousand, no system can deliver the state of being on top of things that it implicitly sells."
      },
      {
        id: "four-thousand-weeks:argument-choosing",
        kind: "argument",
        claim: "Neglecting things is the job, not the failure.",
        body: "Once you accept that most of what you could do will go undone, the question changes from how to fit it all in to what you are consciously choosing to abandon. The book treats that choosing as the actual skill."
      },
      {
        id: "four-thousand-weeks:practice-pay-first",
        kind: "practice",
        claim: "Take the time for what matters before the day is negotiated away.",
        body: "What is left over at the end of a day is never the good hours. Burkeman argues for giving the important thing its slot first and letting the remainder absorb the squeeze, which is uncomfortable precisely because it is real prioritisation.",
        tryIt: "Pick the one thing that would make this week feel worthwhile, and give it a slot before you plan anything else."
      },
      {
        id: "four-thousand-weeks:practice-wip",
        kind: "practice",
        claim: "Cap how many things are allowed to be in progress.",
        body: "Open projects carry an ongoing mental cost whether or not you touch them. Holding a hard limit - three, say - and refusing to start a fourth until one closes converts a diffuse sense of being behind into a finite, visible list.",
        tryIt: "List everything currently open. Pick three to keep active; the rest go on a 'not now' list where you can see them."
      },
      {
        id: "four-thousand-weeks:limit-structural",
        kind: "limit",
        claim: "It reframes the problem without reducing the load.",
        body: "If you are overloaded because you work two jobs or care for someone, the book offers a healthier relationship with an impossible situation, not fewer demands. That is genuinely worth something, and it is not the same as help - the philosophy is easier to adopt when the overload is self-imposed."
      },
      {
        id: "four-thousand-weeks:contested-opposition",
        kind: "contested",
        claim: "This book and the habit books cannot both be right.",
        body: "Clear and Newport say the answer is a better system; Burkeman says the belief in a better system is the disease. Most readers quietly take some of each, but the tension is real and worth facing rather than blending - which one is true for you depends on whether your overload is self-imposed or handed to you.",
        argumentWith: "atomic-habits"
      },
      {
        id: "four-thousand-weeks:misread-giving-up",
        kind: "misread",
        claim: "It gets read as permission to stop trying.",
        body: "The argument is for deliberate, painful choosing, which is more demanding than optimising, not less. Burkeman is asking you to decide what to fail at on purpose - that is a harder discipline than following a system, not an excuse to abandon one."
      }
    ]
  }
];

const byBook = new Map(entries.map((entry) => [entry.bookId, entry]));

export function editorialForBook(bookId: string): BookEditorial | undefined {
  return byBook.get(bookId);
}

export function hasEditorial(bookId: string): boolean {
  return byBook.has(bookId);
}

/** Every card in the shelf, newest book first, for the scroll. */
export function allEditorialCards(): Array<EditorialCard & { bookId: string }> {
  return entries.flatMap((entry) => entry.cards.map((card) => ({ ...card, bookId: entry.bookId })));
}

export const editorialBookIds = entries.map((entry) => entry.bookId);
export const editorialEntries = entries;
