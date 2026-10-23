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
  },
  {
    bookId: "the-power-of-habit",
    inOneLine: "Habits run on a loop you can rewire, but you cannot delete.",
    forWhom: "People who want to understand why a habit has a grip on them before trying to break it.",
    cards: [
      {
        id: "the-power-of-habit:argument-loop",
        kind: "argument",
        claim: "Every habit is a cue, a routine and a reward, and only the middle part can change.",
        body: "Duhigg's frame is that the brain stops doing the work once a behaviour is automatic, which is why habits persist through good intentions. You cannot erase the loop, but you can keep the cue and the reward and swap what sits between them."
      },
      {
        id: "the-power-of-habit:argument-keystone",
        kind: "argument",
        claim: "Some habits drag others behind them.",
        body: "The book argues that certain changes - exercise, making the bed, family dinner - reorganise unrelated parts of a life. The claim is not that they are magic but that they alter how capable you believe you are, and that belief spreads."
      },
      {
        id: "the-power-of-habit:practice-find-reward",
        kind: "practice",
        claim: "Find what you are actually being rewarded by before you try to stop.",
        body: "People usually misidentify the payoff - the afternoon biscuit is often about leaving the desk, not sugar. Testing different rewards against the same cue tells you what the habit is really buying you.",
        tryIt: "Next time the urge hits, try a different reward - a walk instead of the snack - and write down whether the urge actually settles."
      },
      {
        id: "the-power-of-habit:practice-same-cue",
        kind: "practice",
        claim: "Keep the trigger, change only the routine.",
        body: "Removing the cue is usually impossible: the same time, place, mood and people will recur. Leaving the cue and the reward untouched and changing only the behaviour between them is the lowest-resistance version of change.",
        tryIt: "Write your habit as one sentence: when [cue], I will [new routine], because I want [reward]."
      },
      {
        id: "the-power-of-habit:limit-diagnosis",
        kind: "limit",
        claim: "Diagnosing your own loop is far harder than the case studies suggest.",
        body: "In the book the cue and reward are identified cleanly, with the ending already known. In your own life the cue is often a blend of mood, time and company, and the reward is something you would rather not admit. Many people stall here and conclude they are the problem."
      },
      {
        id: "the-power-of-habit:contested-keystone",
        kind: "contested",
        claim: "Whether keystone habits are a mechanism or a good story told backwards.",
        body: "The examples are chosen after the turnaround happened, which is exactly the shape survivorship bias takes. The loop itself is on firmer ground than the claim that one well-chosen habit reliably reorganises a life.",
        argumentWith: "atomic-habits"
      },
      {
        id: "the-power-of-habit:misread-awareness",
        kind: "misread",
        claim: "Understanding the loop gets mistaken for changing it.",
        body: "Naming your cue and reward feels like progress and changes nothing by itself. Duhigg's own cases lean on belief and other people holding the change in place, which is the part that gets skipped."
      }
    ]
  },
  {
    bookId: "mindset",
    inOneLine: "What you believe about whether ability can grow changes what you do when something gets hard.",
    forWhom: "Anyone who avoids things they might be bad at, and anyone raising or managing someone who does.",
    cards: [
      {
        id: "mindset:argument-two-views",
        kind: "argument",
        claim: "Treating ability as fixed makes difficulty feel like a verdict.",
        body: "Dweck's distinction is about what a setback means. If ability is fixed, struggling is evidence you lack it, so the safe move is to avoid hard things. If ability develops, struggling is the process, so the safe move is to stay in it."
      },
      {
        id: "mindset:practice-process",
        kind: "practice",
        claim: "Praise and measure the method, not the person.",
        body: "Telling someone they are clever makes the next failure threatening to their identity. Naming the strategy, the effort and the choice gives them something to repeat and something to change.",
        tryIt: "Next time you praise someone's work, name one specific thing they did rather than what they are."
      },
      {
        id: "mindset:practice-yet",
        kind: "practice",
        claim: "Change the sentence you say at the moment of failing.",
        body: "The mindset shows up in self-talk at a specific moment - the one where you decide whether this is a dead end or a stage. Catching that sentence and adding a 'not yet' is the smallest usable version of the idea.",
        tryIt: "Write down the exact phrase you use when something is not working. That phrase is the intervention point."
      },
      {
        id: "mindset:limit-not-resources",
        kind: "limit",
        claim: "A belief about ability is not a substitute for teaching, time or money.",
        body: "Mindset governs how someone responds to difficulty; it does not supply instruction, practice time or a safe place to study. Applied where the real constraint is material, it turns a structural problem into a personal attitude problem."
      },
      {
        id: "mindset:contested-replication",
        kind: "contested",
        claim: "The effect is real but much smaller than the popular version implies.",
        body: "Later large-scale replications found growth-mindset interventions producing modest effects, concentrated among students who were struggling, rather than the broad transformation the idea acquired in business and parenting books. The core distinction survived; the magnitude did not."
      },
      {
        id: "mindset:misread-praise-effort",
        kind: "misread",
        claim: "It collapsed into 'praise effort', which Dweck herself has disowned.",
        body: "Praising effort that produced nothing teaches that trying is the point, which is not the argument. Dweck has called this the false growth mindset: the aim is effort plus strategy plus asking for help, judged against whether it actually worked."
      }
    ]
  },
  {
    bookId: "grit",
    inOneLine: "Staying with one hard thing for years predicts more than talent does.",
    forWhom: "People who start well and drift, and who suspect that is the real problem.",
    cards: [
      {
        id: "grit:argument-stamina",
        kind: "argument",
        claim: "Achievement runs on stamina more than on talent.",
        body: "Duckworth's claim is that sustained interest plus sustained effort in one direction beats raw ability spread thin. Talent sets the rate at which skill can build; persistence decides whether it ever does."
      },
      {
        id: "grit:practice-top-goal",
        kind: "practice",
        claim: "Put your goals in a hierarchy and cut the orphans.",
        body: "Most people hold many mid-level goals serving no single aim, which feels like ambition and behaves like drift. Writing them out and asking what each one serves exposes which ones are not going anywhere.",
        tryIt: "List your current goals. Beside each, write the larger thing it serves. The ones with a blank are candidates to drop."
      },
      {
        id: "grit:practice-deliberate",
        kind: "practice",
        claim: "Practise the part you are worst at, on purpose, with feedback.",
        body: "Repeating what you can already do feels productive and builds nothing. The version that improves skill is narrow, uncomfortable, immediately corrected and quickly boring - which is why most people avoid it.",
        tryIt: "Pick the single weakest component of your skill and give it fifteen minutes alone, with a way to see whether you got it right."
      },
      {
        id: "grit:limit-quitting",
        kind: "limit",
        claim: "It studies places where quitting was the failure, and sometimes quitting is correct.",
        body: "Much of the research sits in settings - military selection, competitions, schooling - where staying is unambiguously the goal. Outside them, persistence in a bad job, a bad relationship or a dying business is a cost, and the book gives little help telling the two apart."
      },
      {
        id: "grit:contested-overlap",
        kind: "contested",
        claim: "How much grit adds beyond conscientiousness is genuinely unsettled.",
        body: "Analyses have found grit correlating strongly with the established personality trait of conscientiousness and predicting outcomes only modestly better than it. The practical advice stands; the claim that this is a newly discovered quality is the contested part."
      },
      {
        id: "grit:misread-blame",
        kind: "misread",
        claim: "It gets used to explain away disadvantage.",
        body: "A measure of individual persistence turns easily into a reason why someone without money, safety or support did not succeed. Duckworth's own writing treats grit as something environments build, not a verdict on character."
      }
    ]
  },
  {
    bookId: "essentialism",
    inOneLine: "Almost everything is noise, and the skill is cutting it before it fills your week.",
    forWhom: "Capable people who got good at saying yes and are now buried under it.",
    cards: [
      {
        id: "essentialism:argument-tradeoff",
        kind: "argument",
        claim: "You will make the trade-off whether or not you choose it.",
        body: "McKeown's point is that saying yes to everything is not avoiding a decision, it is making it by default and letting the loudest request win. The only question is whether you pick what gets dropped or discover it afterwards."
      },
      {
        id: "essentialism:practice-clear-yes",
        kind: "practice",
        claim: "If it is not a clear yes, it is a no.",
        body: "A high bar is easier to hold than a reasonable one, because a reasonable bar invites negotiation on every request. Making the default a no and requiring enthusiasm to overturn it removes the daily argument with yourself.",
        tryIt: "Take the next request that arrives. If your honest reaction is not clear enthusiasm, decline it and watch what actually happens."
      },
      {
        id: "essentialism:practice-review",
        kind: "practice",
        claim: "Book the time to cut, or the cutting never happens.",
        body: "Commitments accumulate silently and no single one feels like the problem. A standing slot to review what you are carrying, and to end one thing, is what keeps the list from growing back.",
        tryIt: "Put thirty minutes in the calendar this week with one job: end one commitment."
      },
      {
        id: "essentialism:limit-power",
        kind: "limit",
        claim: "Saying no is a privilege distributed unevenly.",
        body: "The book is written from a position where refusing makes you look focused rather than difficult. If you are junior, on a contract, new, or easily replaced, the same no is read as not being a team player, and the cost lands on you rather than the request."
      },
      {
        id: "essentialism:contested-repackaging",
        kind: "contested",
        claim: "Whether this is a distinct idea or the 80/20 rule with better stories.",
        body: "The central move - concentrate effort on the few things that matter - is also the argument of The ONE Thing, the 80/20 Principle and most of Drucker. What Essentialism adds is the social mechanics of refusing, which is arguably the hard part everyone else skipped.",
        argumentWith: "the-one-thing"
      },
      {
        id: "essentialism:misread-less-work",
        kind: "misread",
        claim: "It gets read as doing less rather than concentrating the same effort.",
        body: "The argument is to put the full force of your attention behind fewer things, which is more demanding than spreading it thin. Used as permission to coast, it produces the same output with better vocabulary."
      }
    ]
  },
  {
    bookId: "the-one-thing",
    inOneLine: "One question, asked often enough, removes most of what is on your list.",
    forWhom: "People whose days are full of reasonable tasks and empty of progress.",
    cards: [
      {
        id: "the-one-thing:argument-lever",
        kind: "argument",
        claim: "Results are not evenly distributed across your tasks.",
        body: "Keller's framing is that a small number of actions produce most of what matters, and the rest are not merely less valuable but often actively in the way. The focusing question - what is the one thing that makes everything else easier or unnecessary - is the tool for finding it."
      },
      {
        id: "the-one-thing:practice-block-first",
        kind: "practice",
        claim: "Give the one thing the first block of the day, not the leftovers.",
        body: "Importance loses to urgency every afternoon, so the only reliable slot is the one before the day starts making demands. The book treats this block as an appointment that other people are not allowed to book over.",
        tryIt: "Block the first hour tomorrow for the single task that would most reduce your remaining list."
      },
      {
        id: "the-one-thing:practice-chain",
        kind: "practice",
        claim: "Work backwards from the long goal to today's one thing.",
        body: "The question works at every timescale - this year, this month, this week, today - and each answer narrows the next. Done as a chain it stops today's priority from being whatever is loudest.",
        tryIt: "Write your one thing for this year, then for this month, then for today. Check that today's actually serves the year's."
      },
      {
        id: "the-one-thing:limit-multithreaded",
        kind: "limit",
        claim: "Many jobs do not have one dominant lever.",
        body: "The model fits work that compounds - writing, selling, building a skill. It fits badly where the job is genuinely several unrelated duties held at once, or where the maintenance work nobody notices is what keeps the whole thing standing."
      },
      {
        id: "the-one-thing:contested-multitasking",
        kind: "contested",
        claim: "The flat claim that multitasking is a lie is stronger than the evidence.",
        body: "Switching between demanding tasks does cost attention, and that is well supported. Extending it to all combinations of activity - including routine ones people genuinely do in parallel - is where the book overstates a real finding."
      },
      {
        id: "the-one-thing:misread-ignore-rest",
        kind: "misread",
        claim: "It becomes an excuse to neglect the unglamorous work.",
        body: "Invoices, maintenance, replies and admin are rarely anyone's one thing and still sink you when dropped. The book means sequence them behind the lever, not abandon them."
      }
    ]
  },
  {
    bookId: "getting-things-done",
    inOneLine: "Get everything out of your head into a system you actually trust, then decide the next physical action.",
    forWhom: "People carrying too many open loops to think clearly about any of them.",
    cards: [
      {
        id: "getting-things-done:argument-mind",
        kind: "argument",
        claim: "Your mind is for having ideas, not holding them.",
        body: "Allen's claim is that unrecorded commitments consume attention continuously, whether or not you are working on them. The relief people report comes less from doing more and more from no longer using memory as storage."
      },
      {
        id: "getting-things-done:argument-next-action",
        kind: "argument",
        claim: "Most stuck items are stuck because the next physical action was never decided.",
        body: "An entry like 'sort out insurance' is a topic, not a task, so it is postponed every time it is read. Naming the specific next physical move - find the policy number, call this number - is what makes it doable."
      },
      {
        id: "getting-things-done:practice-capture",
        kind: "practice",
        claim: "Capture everything in one place you check, including the trivial.",
        body: "A system that holds most things is not trusted, and an untrusted system leaves the mind doing the tracking anyway. Completeness matters more than elegance here.",
        tryIt: "Spend twenty minutes writing down every open commitment - work, home, vague guilt - into one list."
      },
      {
        id: "getting-things-done:practice-weekly",
        kind: "practice",
        claim: "The weekly review is the engine, not the admin.",
        body: "Lists go stale within days, and a stale list is quietly abandoned. The review is what makes the system trustworthy enough to offload into, which is the entire mechanism.",
        tryIt: "Put a recurring hour in the calendar to re-read every list and mark what is genuinely next."
      },
      {
        id: "getting-things-done:limit-upkeep",
        kind: "limit",
        claim: "The overhead is real and most people cannot sustain it.",
        body: "The full method needs sorting, filing and a weekly hour before it returns anything. People in genuinely overloaded periods - the ones who need it most - are exactly the ones who drop the review first, and the system decays into another pile."
      },
      {
        id: "getting-things-done:contested-era",
        kind: "contested",
        claim: "Whether a system designed before the always-on inbox still fits the problem.",
        body: "GTD was built for a world of paper, voicemail and email you checked. Applied to continuous notifications, the capture step can become its own full-time intake job, and lighter approaches argue the answer is reducing the inflow rather than processing it better.",
        argumentWith: "four-thousand-weeks"
      },
      {
        id: "getting-things-done:misread-apps",
        kind: "misread",
        claim: "People adopt the app and skip the review.",
        body: "The tooling is the most visible part and the least important. Allen's method works through the weekly review and the next-action discipline; without those, a beautifully configured app is a list that makes you feel organised while nothing moves."
      }
    ]
  },
];

const byBook = new Map(entries.map((entry) => [entry.bookId, entry]));

export function editorialForBook(bookId: string): BookEditorial | undefined {
  return byBook.get(bookId);
}

// Resolved by id, never passed through from a URL as free text. "I tried this" carries only a
// card id; the claim shown in the composer is looked up from this book's own cards, so a
// crafted link cannot put words of its own choosing into the page.
export function editorialCardFor(bookId: string, cardId: string): EditorialCard | undefined {
  return byBook.get(bookId)?.cards.find((card) => card.id === cardId);
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
