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
  {
    bookId: "make-time",
    inOneLine: "Win the day by choosing one thing for it, not by squeezing more into it.",
    forWhom: "People whose days vanish into other people's priorities and who want a light fix, not a system.",
    cards: [
      {
        id: "make-time:argument-highlight",
        kind: "argument",
        claim: "A day is won by picking one thing for it in advance.",
        body: "Knapp and Zeratsky argue that a day without a chosen focus gets filled by whatever arrives, and you end it unable to say what it was for. Naming a single highlight is less about output than about having something to measure the day against."
      },
      {
        id: "make-time:argument-defaults",
        kind: "argument",
        claim: "The defaults on your devices and calendar were not designed in your interest.",
        body: "Apps default to notifications on and feeds infinite because engagement is their business; calendars default to open because other people's time requests are easier to accept than refuse. Their point is that staying on defaults is a choice with consequences."
      },
      {
        id: "make-time:practice-pick-tonight",
        kind: "practice",
        claim: "Choose tomorrow's highlight tonight.",
        body: "Chosen in the morning, the highlight competes with everything already shouting. Chosen the night before, it is waiting when you arrive and the first hour has somewhere to go.",
        tryIt: "Before you stop work today, write one sentence: tomorrow's highlight is ___."
      },
      {
        id: "make-time:practice-boring-phone",
        kind: "practice",
        claim: "Make the phone boring rather than relying on restraint.",
        body: "Removing the few apps that absorb the most time changes the outcome more reliably than deciding to use them less, because it moves the fight from every idle moment to one decision made once.",
        tryIt: "Delete the single app you open most without deciding to. You can reinstall it tomorrow if you genuinely miss it."
      },
      {
        id: "make-time:limit-discretionary",
        kind: "limit",
        claim: "It assumes a day with some slack in it.",
        body: "Choosing a highlight works when a few hours are yours to direct. In jobs scheduled minute by minute, or at home with a newborn, the highlight is chosen for you, and the book's cheerful framing can land as one more thing you are failing at."
      },
      {
        id: "make-time:contested-tactics",
        kind: "contested",
        claim: "Whether a menu of tactics beats a single system.",
        body: "This book offers dozens of small tricks to pick from; Getting Things Done argues that only a complete trusted system actually relieves the pressure. Light tactics are easier to start and easier to abandon, and which failure mode you are prone to decides which is right for you.",
        argumentWith: "getting-things-done"
      },
      {
        id: "make-time:misread-all-of-them",
        kind: "misread",
        claim: "People try to adopt the whole list at once.",
        body: "The book explicitly offers its tactics as a menu to sample from, a few at a time. Treated as a checklist to implement completely, it becomes the overload it was written to relieve."
      }
    ]
  },
  {
    bookId: "digital-minimalism",
    inOneLine: "Tools should have to earn their place against what you actually care about.",
    forWhom: "Anyone who has tried to use their phone less by deciding to, and failed.",
    cards: [
      {
        id: "digital-minimalism:argument-earn",
        kind: "argument",
        claim: "A tool offering some benefit is not a reason to keep it.",
        body: "Newport's standard is not whether an app does anything useful - almost all of them do - but whether it is the best way to serve something you deeply value. Most pass the first test and fail the second, which is why the usual cost-benefit reasoning never removes anything."
      },
      {
        id: "digital-minimalism:argument-solitude",
        kind: "argument",
        claim: "Time alone with your own thoughts is a need, not a gap to fill.",
        body: "He calls the modern condition solitude deprivation: never being alone with your own mind because every queue, walk and pause is filled with input. The claim is that the thinking which only happens in those gaps stops happening."
      },
      {
        id: "digital-minimalism:practice-declutter",
        kind: "practice",
        claim: "Take thirty days off the optional tools, then let them back in one at a time.",
        body: "Cutting and then deliberately reintroducing works better than trimming, because the break shows you what you actually missed rather than what you assumed you would. Most people reinstate far less than they expected to.",
        tryIt: "List your optional apps. Put them away for thirty days, and write down which one you genuinely reach for."
      },
      {
        id: "digital-minimalism:practice-replace",
        kind: "practice",
        claim: "Put something in the hole before you make it.",
        body: "Removing a habit without a replacement leaves an empty evening that the old habit reliably refills. Having a specific thing to do with the reclaimed time - a craft, a walk, a person to call - is what makes the removal hold.",
        tryIt: "Pick one activity for the time you are about to free up, and schedule it before you delete anything."
      },
      {
        id: "digital-minimalism:limit-social-cost",
        kind: "limit",
        claim: "For many people the platforms are where the work, the family and the friends are.",
        body: "Leaving is cheap if your income, your community and your relationships live elsewhere. For freelancers, migrants, carers and anyone whose group organises on a feed, the cost of opting out is real and lands on them, not on the platform."
      },
      {
        id: "digital-minimalism:contested-harm",
        kind: "contested",
        claim: "How much of the harm is established, and how much is a reasonable worry.",
        body: "That attention is being deliberately captured is well evidenced. The stronger claims about what this does to minds over time are argued hard in both directions, and the honest position is that the design intent is proven while the long-run effect is still being fought over.",
        argumentWith: "the-shallows"
      },
      {
        id: "digital-minimalism:misread-asceticism",
        kind: "misread",
        claim: "It gets taken as giving up technology.",
        body: "The argument is selective and deliberate use, not abstinence, and the declutter is a diagnostic rather than the destination. Read as digital monasticism, it sets a bar nobody holds and collapses within a month."
      }
    ]
  },
  {
    bookId: "the-war-of-art",
    inOneLine: "The thing stopping you is predictable, has a name, and shows up strongest before the work that matters most.",
    forWhom: "Anyone who knows what they should be making and keeps not making it.",
    cards: [
      {
        id: "the-war-of-art:argument-resistance",
        kind: "argument",
        claim: "The force stopping you is not laziness and it is not random.",
        body: "Pressfield names it Resistance and argues it is predictable: it is strongest in front of the work that would matter most to you, and it arrives disguised as reasonable things - research to do first, a tidier desk, a better time to start."
      },
      {
        id: "the-war-of-art:argument-professional",
        kind: "argument",
        claim: "Amateurs wait to feel ready, professionals turn up anyway.",
        body: "The distinction is not skill or income but relationship to feeling. A professional treats the work as a job that happens on schedule whether or not inspiration arrived, which removes the daily referendum on whether you are in the mood."
      },
      {
        id: "the-war-of-art:practice-same-time",
        kind: "practice",
        claim: "Fix the time, and stop negotiating with yourself about it.",
        body: "Deciding each day whether to work is a decision you will eventually lose, because Resistance only has to win once to break the run. A fixed slot converts it from a choice into a default.",
        tryIt: "Pick the time you will sit down tomorrow. Not how long, not how much - just the time."
      },
      {
        id: "the-war-of-art:practice-name-it",
        kind: "practice",
        claim: "Say out loud what you are avoiding, as it happens.",
        body: "Resistance works by seeming like something else - a genuine priority, a reasonable delay. Naming the avoidance in the moment strips the disguise, and the pull weakens noticeably once it has been identified.",
        tryIt: "Next time you drift from the work, write one line: I am avoiding ___ by doing ___."
      },
      {
        id: "the-war-of-art:limit-burnout",
        kind: "limit",
        claim: "It has no way to tell avoidance apart from exhaustion or illness.",
        body: "Everything that stops you is cast as Resistance to be overcome, which is useful against procrastination and harmful against burnout, depression or grief. Applied to a person who genuinely needs rest or treatment, the book supplies a reason to push through, and that is the wrong answer."
      },
      {
        id: "the-war-of-art:contested-muse",
        kind: "contested",
        claim: "The last third turns mystical, and readers split on it.",
        body: "Pressfield moves from practical discipline to Muses, angels and a territory-versus-hierarchy metaphysics. Some find it the heart of the book and others find the earlier, concrete argument stands perfectly well without any of it."
      },
      {
        id: "the-war-of-art:misread-shame",
        kind: "misread",
        claim: "It becomes a stick to beat yourself with.",
        body: "The framing of a daily war against an enemy inside you reads, on a bad week, as proof that you are the enemy. The usable part is the structure - fixed time, show up regardless - and that part does not require the self-contempt."
      }
    ]
  },
  {
    bookId: "drive",
    inOneLine: "For work that needs judgment, rewards and punishments do less than you think and sometimes make it worse.",
    forWhom: "Anyone designing how other people work, or wondering why their own motivation drained.",
    cards: [
      {
        id: "drive:argument-crowding",
        kind: "argument",
        claim: "Paying for something people already wanted to do can make them want it less.",
        body: "Pink's central finding is that external rewards reliably improve narrow, mechanical tasks and can degrade performance on work needing creativity or judgment. Attaching a payment reframes a chosen activity as a transaction, and the original interest does not always survive the reframing."
      },
      {
        id: "drive:argument-three",
        kind: "argument",
        claim: "Autonomy, mastery and purpose do the work carrots cannot.",
        body: "Control over how you work, visible progress at something hard, and a reason that reaches past yourself are what sustain effort on complex work. Pink's case is that these are not perks but the actual mechanism."
      },
      {
        id: "drive:practice-autonomy",
        kind: "practice",
        claim: "Give away control of one of the four: task, time, technique or team.",
        body: "Autonomy is not all-or-nothing and most roles can concede one dimension without anything breaking. Choosing which to hand over makes it a concrete management decision rather than a value statement.",
        tryIt: "Pick one thing you currently dictate - how, when, with whom, or what - and stop dictating it for a month."
      },
      {
        id: "drive:practice-progress",
        kind: "practice",
        claim: "Make progress visible, because mastery is felt through feedback.",
        body: "Effort at something hard sustains itself only when improvement can be seen, and most knowledge work hides it. A record of what was difficult last month and is routine now supplies the signal the work itself does not.",
        tryIt: "Keep one line a day on what you did that was hard. Read a month of it in one sitting."
      },
      {
        id: "drive:limit-pay",
        kind: "limit",
        claim: "The whole argument sits on top of paying people properly, which is the part that gets skipped.",
        body: "Pink is explicit that fair pay has to take money off the table before intrinsic motivation can do anything. Quoted in organisations that have not done that, the book becomes a justification for low pay dressed as enlightened management, which inverts his argument."
      },
      {
        id: "drive:contested-breadth",
        kind: "contested",
        claim: "How far the finding generalises is genuinely disputed.",
        body: "The effect is well demonstrated in specific experimental settings, and the step from there to most modern workplaces is an extrapolation. Critics argue the real-world picture is messier and more dependent on context than the book's confident framing suggests."
      },
      {
        id: "drive:misread-no-money",
        kind: "misread",
        claim: "It gets used to argue that money does not matter.",
        body: "The claim is that money stops being a useful lever above a sufficient level, not that compensation is irrelevant. Used to justify underpaying people who care about the mission, it is being read precisely backwards."
      }
    ]
  },
  {
    bookId: "flow",
    inOneLine: "The best moments are not relaxing ones, they are the ones where you disappeared into something difficult.",
    forWhom: "People whose leisure leaves them flat and who suspect the problem is not needing more rest.",
    cards: [
      {
        id: "flow:argument-absorption",
        kind: "argument",
        claim: "Enjoyment comes from absorption, not from ease.",
        body: "Csikszentmihalyi's research found people reporting their best experiences during effortful, voluntary activity rather than during rest. The implication is uncomfortable: free time spent on things that ask nothing of you tends to be remembered as empty."
      },
      {
        id: "flow:argument-conditions",
        kind: "argument",
        claim: "Flow has conditions, and they can be arranged.",
        body: "It needs a clear goal, feedback quick enough to adjust by, and difficulty sitting just above current ability. Missing any one of them, attention wanders - which reframes flow as something you engineer rather than something that visits you."
      },
      {
        id: "flow:practice-tune-difficulty",
        kind: "practice",
        claim: "Adjust the difficulty until it stops being boring or frightening.",
        body: "Boredom means the challenge is beneath you; anxiety means it is beyond you. Both are signals to change the task rather than your attitude, and small adjustments to constraints usually move it into range.",
        tryIt: "Take something that bores you and add a constraint - a time limit, a restriction - until it needs your attention."
      },
      {
        id: "flow:practice-feedback",
        kind: "practice",
        claim: "Build feedback into work that does not come with any.",
        body: "Sport and music supply immediate signals; most jobs supply one every quarter. Inventing an interim measure you can see within the hour is what makes a long task absorbing rather than vague.",
        tryIt: "Define what 'going well' looks like at the end of the next hour, specifically enough to check."
      },
      {
        id: "flow:limit-control",
        kind: "limit",
        claim: "It needs a task whose difficulty you can set.",
        body: "Flow conditions are hard to meet in work that is designed to be either repetitive or permanently overwhelming, and in jobs interrupted by other people at will. Where the constraint is the job itself, the advice becomes a description of what you are missing."
      },
      {
        id: "flow:contested-neutral",
        kind: "contested",
        claim: "Flow is a state, not a virtue, and bad things produce it too.",
        body: "Gambling machines, infinite feeds and compulsive games are engineered to hit exactly these conditions. That the same mechanism underlies both deep work and the things keeping you up at 2am is a real tension the book does not fully resolve.",
        argumentWith: "hooked"
      },
      {
        id: "flow:misread-passion",
        kind: "misread",
        claim: "It gets collapsed into 'find your passion'.",
        body: "The research points the other way: absorption is produced by the structure of an activity rather than by finding the one true calling. People report flow in ordinary work once the conditions are arranged, which is a far more useful finding than being told to search."
      }
    ]
  },
  {
    bookId: "thinking-fast-and-slow",
    inOneLine: "Your fast, confident judgment is wrong in specific, repeatable ways - and knowing that barely helps.",
    forWhom: "Anyone who makes consequential decisions and would like to be wrong less often.",
    cards: [
      {
        id: "thinking-fast-and-slow:argument-two-systems",
        kind: "argument",
        claim: "Two modes of thought, and the fast one answers first.",
        body: "Kahneman describes a fast, automatic process that produces an answer before you have decided to think, and a slow, effortful one that is lazy about checking it. Most errors are not failures of intelligence but the second system accepting the first system's work."
      },
      {
        id: "thinking-fast-and-slow:argument-substitution",
        kind: "argument",
        claim: "When a question is hard, you quietly answer an easier one.",
        body: "Asked whether an investment is wise, people often answer whether they like the company. The substitution is invisible from the inside, which is what makes it dangerous - the confident feeling attaches to the easy question you actually answered."
      },
      {
        id: "thinking-fast-and-slow:practice-outside-view",
        kind: "practice",
        claim: "Ask how similar things have actually gone, before reasoning about this one.",
        body: "Plans built from the inside are built from intentions and best cases. Finding the base rate - how long this normally takes, how often this normally works - corrects the estimate more than any amount of careful thinking about your specific situation.",
        tryIt: "Before your next estimate, find three comparable cases and write down what actually happened to them."
      },
      {
        id: "thinking-fast-and-slow:practice-premortem",
        kind: "practice",
        claim: "Assume it failed, then explain why.",
        body: "Asking a group for risks invites loyalty and gets silence. Telling them it is a year later and the thing failed, then asking what happened, gives permission to say the thing everybody already suspects.",
        tryIt: "Before committing, write the post-mortem for the failure as if it already happened."
      },
      {
        id: "thinking-fast-and-slow:limit-self-correction",
        kind: "limit",
        claim: "Knowing about a bias does almost nothing to stop you having it.",
        body: "Kahneman is unusually honest that decades of study left his own intuitions largely unimproved. The biases are features of how perception works, not errors to be argued away, which is why the usable remedies are procedures and outside checks rather than resolve."
      },
      {
        id: "thinking-fast-and-slow:contested-replication",
        kind: "contested",
        claim: "Parts of the book did not survive later testing.",
        body: "Several studies it draws on, particularly in the priming chapter, failed to replicate in subsequent work, and Kahneman publicly acknowledged that he had placed too much confidence in that literature. The core account of fast and slow thinking stands; specific demonstrations within it do not."
      },
      {
        id: "thinking-fast-and-slow:misread-others",
        kind: "misread",
        claim: "It becomes a vocabulary for diagnosing other people.",
        body: "Having names for the errors makes them easy to spot in colleagues and no easier to spot in yourself - which is itself one of the effects the book describes. Read correctly, it is uncomfortable rather than satisfying."
      }
    ]
  },
  {
    bookId: "the-7-habits-of-highly-effective-people",
    inOneLine: "Work on your character before your tactics, and start with what you can actually control.",
    forWhom: "People who have optimised their methods and still feel they are getting nowhere.",
    cards: [
      {
        id: "the-7-habits-of-highly-effective-people:argument-character",
        kind: "argument",
        claim: "Technique on top of a weak foundation stops working under pressure.",
        body: "Covey separates the character ethic - integrity, patience, keeping your word - from the personality ethic of influence tactics and presentation. His claim is that the second only holds while things are easy, and that most self-improvement sells the second because it is faster."
      },
      {
        id: "the-7-habits-of-highly-effective-people:argument-influence",
        kind: "argument",
        claim: "Spend attention on what you can affect, and it grows.",
        body: "The circle of concern holds everything you worry about; the circle of influence holds what you can act on. Covey's observation is that people who work inside the smaller circle tend to find it widening, while those preoccupied with the larger one tend to find theirs shrinking."
      },
      {
        id: "the-7-habits-of-highly-effective-people:practice-quadrant",
        kind: "practice",
        claim: "Schedule what is important before what is urgent arrives.",
        body: "Important work that is not yet urgent - planning, maintenance, relationships, learning - never announces itself, so it loses every day to things that do. Giving it a place in the week before the week starts is the only reliable defence.",
        tryIt: "Put one important, non-urgent thing in next week's calendar now, before anything else claims the slot."
      },
      {
        id: "the-7-habits-of-highly-effective-people:practice-understand",
        kind: "practice",
        claim: "Be able to state their case better than they can, before you make yours.",
        body: "Most disagreement is two people waiting to talk. Committing to restate the other position until they agree you have it right changes what you argue about, and frequently changes your own mind on the way.",
        tryIt: "In your next disagreement, say their position back first and ask whether you got it right."
      },
      {
        id: "the-7-habits-of-highly-effective-people:limit-abstraction",
        kind: "limit",
        claim: "It is long, abstract, and dated in its examples.",
        body: "The habits are principles rather than procedures, which makes them hard to act on without a lot of translation, and the corporate and family scenarios come from a world of 1989. Readers wanting to do something on Monday often extract two ideas and abandon the rest."
      },
      {
        id: "the-7-habits-of-highly-effective-people:contested-history",
        kind: "contested",
        claim: "The historical claim underneath the book is an assertion, not a finding.",
        body: "Covey's story - that success literature shifted from character to personality around the early twentieth century - is presented as established history based on his own reading. It is a persuasive frame and it is not an evidenced one, and the practical advice does not depend on it being true."
      },
      {
        id: "the-7-habits-of-highly-effective-people:misread-productivity",
        kind: "misread",
        claim: "It gets shelved as a time-management book.",
        body: "Only one habit is about scheduling. The first three are about self-command and the next three about working with other people, which is why readers who arrive for a planning system find it strangely slow and put it down."
      }
    ]
  },
  {
    bookId: "can-t-hurt-me",
    inOneLine: "Most people stop long before their actual limit, and that gap can be trained.",
    forWhom: "People who quit at the first real resistance and already suspect it.",
    cards: [
      {
        id: "can-t-hurt-me:argument-reserve",
        kind: "argument",
        claim: "The point where you want to stop is not the point where you must.",
        body: "Goggins's central claim, drawn from his own extremes, is that the urge to quit arrives far ahead of actual capacity. Learning that the feeling is not the limit is the thing he is trying to transmit."
      },
      {
        id: "can-t-hurt-me:argument-callus",
        kind: "argument",
        claim: "Difficulty tolerated on purpose makes later difficulty smaller.",
        body: "He argues for deliberately seeking discomfort so that hardship you did not choose finds you already practised. The mechanism is psychological rather than physical: a bank of evidence that you have continued before."
      },
      {
        id: "can-t-hurt-me:practice-mirror",
        kind: "practice",
        claim: "Write your actual failings where you will see them.",
        body: "The accountability mirror is notes on the glass naming what you are avoiding and what you intend to do, in plain words. It works by removing the comfortable vagueness that lets a problem stay general.",
        tryIt: "Write one specific thing you are dodging on a note, and put it where you brush your teeth."
      },
      {
        id: "can-t-hurt-me:practice-one-hard-thing",
        kind: "practice",
        claim: "Do one thing a day you would rather not.",
        body: "The size is unimportant and the voluntariness is the point: a small chosen discomfort daily builds the evidence that discomfort is survivable. It is the sustainable version of a book that mostly describes unsustainable extremes.",
        tryIt: "Pick the smallest thing you have been putting off and do it before anything else tomorrow."
      },
      {
        id: "can-t-hurt-me:limit-one-life",
        kind: "limit",
        claim: "It is one extraordinary person's biography offered as a method.",
        body: "The book generalises from a single extreme case with no comparison to the people who followed similar paths into injury, breakdown or worse. Applied literally to an ordinary body - running on fractures, training through illness - the advice is physically dangerous, and nothing in the book provides the brake."
      },
      {
        id: "can-t-hurt-me:contested-forty-percent",
        kind: "contested",
        claim: "The forty per cent rule is a motivational figure, not a measurement.",
        body: "That people stop before their physiological limit is well supported in exercise science; that the limit sits reliably at forty per cent of capacity is a number from the book, not from research. Useful as a prompt, misleading as a quantity to plan around."
      },
      {
        id: "can-t-hurt-me:misread-ignore-pain",
        kind: "misread",
        claim: "It gets read as overriding every pain signal.",
        body: "Some pain is information about damage and some is reluctance, and conflating them produces injuries that end training altogether. The transferable part is persisting past the urge to quit, not past a body telling you something is torn."
      }
    ]
  },
  {
    bookId: "the-obstacle-is-the-way",
    inOneLine: "The thing in your way is usually also the material you have to work with.",
    forWhom: "People stuck on a situation they cannot change and spending their energy on the wrong half of it.",
    cards: [
      {
        id: "the-obstacle-is-the-way:argument-perception",
        kind: "argument",
        claim: "The event and your judgment of it are two different things.",
        body: "Holiday's Stoic core is that most of the distress in a setback comes from the story attached to it rather than the facts of it. Separating the two does not make the problem smaller, but it stops you solving the wrong one."
      },
      {
        id: "the-obstacle-is-the-way:argument-material",
        kind: "argument",
        claim: "An obstacle often contains the only available path.",
        body: "The claim inherited from Marcus Aurelius is that what blocks the action can become the action - the constraint forcing a better approach, the rejection redirecting the work. It is a reframe rather than a technique, and it is doing real work when it stops you waiting for conditions to improve."
      },
      {
        id: "the-obstacle-is-the-way:practice-two-columns",
        kind: "practice",
        claim: "Split the situation into what you control and what you do not, on paper.",
        body: "Done in your head this stays a comforting idea; written out it becomes a short list of actions and a longer list to stop spending attention on. The second list is usually where most of the week was going.",
        tryIt: "Take the thing weighing on you, and write two columns: mine to act on, not mine."
      },
      {
        id: "the-obstacle-is-the-way:practice-premeditation",
        kind: "practice",
        claim: "Rehearse the setback before it arrives.",
        body: "Imagining what could go wrong, specifically, converts a future shock into a plan and removes much of the paralysis. The Stoics treated this as routine preparation rather than pessimism.",
        tryIt: "Before the next thing that matters, write the three most likely ways it goes wrong and what you would do."
      },
      {
        id: "the-obstacle-is-the-way:limit-material",
        kind: "limit",
        claim: "Reframing a constraint does not remove it.",
        body: "Illness, poverty, discrimination and grief are not perceptions, and a philosophy of acceptance applied to them can slide into telling people their circumstances are a thinking error. The approach earns its keep on what is genuinely in your control, and overreaches the moment it is offered as a universal answer."
      },
      {
        id: "the-obstacle-is-the-way:contested-selective",
        kind: "contested",
        claim: "The self-help version of Stoicism keeps the resilience and drops the ethics.",
        body: "Classical Stoicism was a whole philosophy with strong commitments about justice and duty to others. The modern productivity reading takes the personal fortitude and leaves most of that behind, which critics argue turns a moral philosophy into a performance technique."
      },
      {
        id: "the-obstacle-is-the-way:misread-suppression",
        kind: "misread",
        claim: "It gets used to shut feelings down rather than look at them.",
        body: "Examining a reaction to see what is actually true in it is not the same as refusing to have one. Read as instruction to feel nothing, it produces a brittleness that looks like composure right up until it fails."
      }
    ]
  },
  {
    bookId: "why-we-sleep",
    inOneLine: "Sleep is not the gap between the things that matter, it is one of them.",
    forWhom: "Anyone quietly treating sleep as the flexible part of their schedule.",
    cards: [
      {
        id: "why-we-sleep:argument-not-idle",
        kind: "argument",
        claim: "Sleep is active work, not an absence of activity.",
        body: "Walker's case is that memory consolidation, emotional processing and physical repair are things sleep does rather than things that pause while you are unconscious. Cutting it is therefore not borrowing time, it is skipping a process."
      },
      {
        id: "why-we-sleep:argument-debt",
        kind: "argument",
        claim: "You are a poor judge of how impaired you are.",
        body: "Self-assessed alertness recovers long before actual performance does, which is why chronic short sleep feels sustainable to the person doing it. The subjective sense of coping is the least reliable signal available."
      },
      {
        id: "why-we-sleep:practice-fixed-wake",
        kind: "practice",
        claim: "Hold the wake time steady, including at weekends.",
        body: "A consistent rising time anchors the body clock more effectively than a consistent bedtime, which is largely outside your direct control. Sleeping in to repay a deficit tends to move the clock and cost you the following night.",
        tryIt: "Set one wake time for every day of the next week, and keep it on Saturday."
      },
      {
        id: "why-we-sleep:practice-light-and-caffeine",
        kind: "practice",
        claim: "Use morning light, and move caffeine earlier than feels necessary.",
        body: "Daylight soon after waking strengthens the timing signal, and caffeine has a long enough half-life that an afternoon cup is still present at bedtime. Both are small adjustments with disproportionate effect on sleep that is otherwise hard to change.",
        tryIt: "Get outside within an hour of waking, and make your last caffeine eight hours before bed."
      },
      {
        id: "why-we-sleep:limit-unreachable",
        kind: "limit",
        claim: "The prescription is out of reach for the people who need it most.",
        body: "Shift workers, new parents, carers and anyone holding two jobs cannot choose a consistent eight hours, and a book stating the costs in stark terms gives them alarm without remedy. Anxiety about sleep also reliably worsens sleep, so the framing itself can backfire."
      },
      {
        id: "why-we-sleep:contested-specifics",
        kind: "contested",
        claim: "A detailed public critique found overstated claims and errors in parts of the book.",
        body: "That sleep matters enormously is not in dispute and is supported well beyond this book. Several specific claims and the strength of certain statistics were challenged in a widely read analysis, with some corrections acknowledged. Take the direction seriously and treat individual numbers as needing their own source."
      },
      {
        id: "why-we-sleep:misread-eight-hours",
        kind: "misread",
        claim: "Eight hours gets taken as a precise universal requirement.",
        body: "Need varies between people and across a life, and the figure is a population guide rather than a target to hit nightly. Treated as a pass mark, it produces people lying awake calculating their shortfall, which is the opposite of the intent."
      }
    ]
  },
  {
    bookId: "hooked",
    inOneLine: "A manual for building products people cannot put down, which is also a description of what is being done to you.",
    forWhom: "Anyone building something people should return to, and anyone wondering why they keep returning to things.",
    cards: [
      {
        id: "hooked:argument-four-steps",
        kind: "argument",
        claim: "Habit-forming products run the same four-step loop.",
        body: "A trigger, an easy action, a reward that varies, and an investment that makes the next loop more likely. Eyal's argument is that this sequence is what separates products people use from products people need, and that it can be designed deliberately."
      },
      {
        id: "hooked:argument-variable",
        kind: "argument",
        claim: "Unpredictable rewards hold attention far better than reliable ones.",
        body: "A consistent payoff gets evaluated and eventually ignored; an uncertain one keeps the loop open. This is why feeds refresh into something unknown rather than showing a predictable list, and it is the most powerful element in the book."
      },
      {
        id: "hooked:practice-map-the-hook",
        kind: "practice",
        claim: "Write out the loop your own product actually runs.",
        body: "Most teams can name the action and the reward, and stall on what the external trigger is and what the user invests. Naming all four exposes which step is missing and why retention is not happening.",
        tryIt: "Write your four steps in one line each. The one that is hardest to fill in is your problem."
      },
      {
        id: "hooked:practice-spot-it",
        kind: "practice",
        claim: "Run the same four steps on the app that has you.",
        body: "Identifying your own trigger, the action it leads to, what the unpredictable reward is and what you have invested makes a compulsion legible. The trigger is usually the only step you can actually remove.",
        tryIt: "Take the app you open most without deciding to, name its four steps, and delete its trigger."
      },
      {
        id: "hooked:limit-ethics",
        kind: "limit",
        claim: "The ethics get one chapter and the techniques get the rest.",
        body: "Eyal does include a framework for whether you should build a given hook, and it sits beside a detailed, effective manual for building one regardless. A reader who wants the mechanics can take them and leave the restraint, and in practice many did."
      },
      {
        id: "hooked:contested-publication",
        kind: "contested",
        claim: "Whether writing the playbook down made things worse.",
        body: "The techniques were already in use at the companies that could afford to discover them; the book made them available to everyone else. Eyal later wrote a book about resisting distraction, which some read as a correction and others as having it both ways.",
        argumentWith: "digital-minimalism"
      },
      {
        id: "hooked:misread-neutral",
        kind: "misread",
        claim: "It gets read as description when it is instruction.",
        body: "This is a how-to for builders, not a neutral account of how attention works. Read as the latter, its confident tone about manufacturing compulsion sounds like an observation rather than the recommendation it is."
      }
    ]
  },
  {
    bookId: "the-shallows",
    inOneLine: "The medium you read in changes how you think, not just what you know.",
    forWhom: "People who used to finish books and now cannot get through an article.",
    cards: [
      {
        id: "the-shallows:argument-medium",
        kind: "argument",
        claim: "A tool for thinking reshapes the thinking.",
        body: "Carr's argument is that technologies of the mind - the clock, the map, the printed page, the web - change the habits of attention of the people who use them. The content you consume matters less, on this account, than the form it arrives in."
      },
      {
        id: "the-shallows:argument-deep-reading",
        kind: "argument",
        claim: "Sustained reading is learned, and it can be lost.",
        body: "Following a long argument is not natural but trained over years, and training can go the other way. His claim is that a habit of scanning, linking and skimming gradually replaces the capacity it was built on."
      },
      {
        id: "the-shallows:practice-one-medium",
        kind: "practice",
        claim: "Read long things somewhere that cannot interrupt you.",
        body: "The interruption does not have to be taken to cost you - the possibility of one is enough to keep attention shallow. Paper, or a device with no other capability, removes the question rather than asking you to resist it.",
        tryIt: "Read the next long piece on paper or an e-reader with no browser, and notice where you first reach to switch."
      },
      {
        id: "the-shallows:practice-rebuild",
        kind: "practice",
        claim: "Treat attention span as trainable and start below your old level.",
        body: "If the capacity degraded through practice it can be rebuilt the same way, and starting at the length you used to manage guarantees failure. Short, daily, uninterrupted reading rebuilds it faster than occasional ambitious attempts.",
        tryIt: "Twenty minutes of uninterrupted reading daily, with the phone in another room."
      },
      {
        id: "the-shallows:limit-dated",
        kind: "limit",
        claim: "It describes the web of 2010, before any of this got serious.",
        body: "Carr was writing about hyperlinks and browser tabs, before the smartphone was universal and before feeds were algorithmically optimised against you. His concerns read as mild now, which is either a point in his favour or a sign the analysis was about something else."
      },
      {
        id: "the-shallows:contested-neuroscience",
        kind: "contested",
        claim: "The cultural observation has aged better than the brain science.",
        body: "The strongest neurological claims leaned on preliminary research and were contested at the time, and plasticity is routinely invoked more confidently than the evidence supports. Many readers who reject the mechanism still recognise the experience he describes, which is the part that endures."
      },
      {
        id: "the-shallows:misread-stupid",
        kind: "misread",
        claim: "It gets summarised as the internet making people stupid.",
        body: "Carr's claim is about a trade: real gains in breadth, recall and access, paid for with depth and sustained concentration. Flattened into a verdict on intelligence, it becomes easy to dismiss and loses the trade-off that was the actual argument."
      }
    ]
  },
  {
    bookId: "eat-that-frog",
    inOneLine: "You will procrastinate on something today, so choose what it is.",
    forWhom: "People who clear small tasks all morning and never reach the one that counts.",
    cards: [
      {
        id: "eat-that-frog:argument-selective",
        kind: "argument",
        claim: "Procrastination is not avoiding work, it is choosing which work to avoid.",
        body: "Tracy's observation is that busy people are rarely idle - they are doing the easy items while the significant one waits. Since something will be deferred regardless, the only real decision is whether the deferred thing is the important one."
      },
      {
        id: "eat-that-frog:argument-first-hour",
        kind: "argument",
        claim: "The hardest task gets easier the earlier you take it.",
        body: "Difficulty grows while a task is pending: it gathers dread, and the day accumulates reasons to postpone. Taking it first removes both the dread and the chance for the day to intervene."
      },
      {
        id: "eat-that-frog:practice-pick-tonight",
        kind: "practice",
        claim: "Identify tomorrow's hardest task before you finish today.",
        body: "Chosen in the morning, the difficult task has to win an argument against everything already waiting. Chosen the night before, it is simply what happens first.",
        tryIt: "Write down tomorrow's frog before you close your laptop, and start on it before opening anything else."
      },
      {
        id: "eat-that-frog:practice-abcde",
        kind: "practice",
        claim: "Rank by consequence, not by how overdue something feels.",
        body: "Sorting a list by what happens if each item is not done separates genuine priorities from things that are merely late. Most lists shrink sharply under that question.",
        tryIt: "Beside each item on today's list, write what actually happens if it is not done. Then reorder."
      },
      {
        id: "eat-that-frog:limit-order",
        kind: "limit",
        claim: "It assumes you choose the order of your own day.",
        body: "In reactive work - support queues, clinical rounds, anything where other people's requests set the sequence - the frog cannot be moved to first. The advice then becomes a reminder of a freedom you do not have."
      },
      {
        id: "eat-that-frog:contested-worst-first",
        kind: "contested",
        claim: "Whether hardest-first actually beats building momentum.",
        body: "Starting with the difficult task uses your best attention on what matters most. Starting with two quick wins gets some people moving who would otherwise stall at the frog and do nothing at all. The evidence does not settle it, and which works depends on whether your failure mode is avoidance or inertia.",
        argumentWith: "atomic-habits"
      },
      {
        id: "eat-that-frog:misread-twenty-one",
        kind: "misread",
        claim: "The twenty-one methods get treated as twenty-one requirements.",
        body: "The book is one idea with many restatements, and the central one works on its own. Attempting the full list produces a system heavier than the problem it was meant to solve."
      }
    ]
  },
  {
    bookId: "the-80-20-principle",
    inOneLine: "Effort and results are not proportionate, and almost nobody checks which of theirs is which.",
    forWhom: "People working hard across everything and getting results in only a few places.",
    cards: [
      {
        id: "the-80-20-principle:argument-imbalance",
        kind: "argument",
        claim: "A small part of what you do produces most of what you get.",
        body: "Koch's case is that the imbalance between input and output recurs across sales, customers, faults and time, and that most planning assumes a proportionality that does not hold. The ratio is not the point; the asymmetry is."
      },
      {
        id: "the-80-20-principle:argument-counterintuitive",
        kind: "argument",
        claim: "You cannot guess which fifth it is.",
        body: "People reliably nominate the work that felt hardest or took longest rather than the work that produced the result. The principle only pays once the split is measured, which is why so few people who quote it have actually applied it."
      },
      {
        id: "the-80-20-principle:practice-measure",
        kind: "practice",
        claim: "Measure one month before you cut anything.",
        body: "Identifying the productive fifth requires data on where results actually came from, kept over long enough to be more than a story. A month of rough records beats any amount of reasoning about it.",
        tryIt: "For four weeks, log where results came from - clients, channels, tasks. Then look at the distribution."
      },
      {
        id: "the-80-20-principle:practice-subtract",
        kind: "practice",
        claim: "Remove one of the unproductive items rather than adding to the productive ones.",
        body: "The obvious move is to do more of what works, which requires capacity you do not have. Taking something away first creates the room, and is the step people skip.",
        tryIt: "From your measured bottom half, stop one thing entirely for a month and watch what breaks."
      },
      {
        id: "the-80-20-principle:limit-data",
        kind: "limit",
        claim: "Most people never collect the data it needs.",
        body: "The principle is only actionable with a record of inputs against outputs, and for individual knowledge work that record is tedious and often ambiguous. Without it the idea becomes a justification for dropping whatever was already disliked."
      },
      {
        id: "the-80-20-principle:contested-law",
        kind: "contested",
        claim: "It is a recurring pattern, not a law, and gets applied where it does not hold.",
        body: "The distribution genuinely appears across many domains and is absent in many others. Treated as arithmetic that must apply, it produces confident cuts in places where contribution is actually spread evenly, and the damage shows up later."
      },
      {
        id: "the-80-20-principle:misread-cut-support",
        kind: "misread",
        claim: "It gets used to cut the work that prevents disasters.",
        body: "Maintenance, testing, documentation and relationship work produce no measurable output precisely when they are working. Judged by a method that counts visible results, they look like the unproductive eighty per cent right up until something fails."
      }
    ]
  },
  {
    bookId: "the-comfort-crisis",
    inOneLine: "Modern life removed the hardship humans were shaped by, and some of it is worth putting back deliberately.",
    forWhom: "People who are comfortable, vaguely flat, and suspect the two are related.",
    cards: [
      {
        id: "the-comfort-crisis:argument-missing-stress",
        kind: "argument",
        claim: "Comfort removed stressors the body expected to meet.",
        body: "Easter's argument is that constant temperature, constant food and constant stimulation took away physical and mental challenges humans developed alongside. His claim is not that hardship is good but that its complete absence is itself a condition with effects."
      },
      {
        id: "the-comfort-crisis:argument-boredom",
        kind: "argument",
        claim: "Boredom is a state with a function, and it has been abolished.",
        body: "Every gap is now fillable, so the mind rarely sits unoccupied. He connects that to a loss of the reflection, planning and restlessness-into-action that used to happen in those gaps."
      },
      {
        id: "the-comfort-crisis:practice-long-walk",
        kind: "practice",
        claim: "Go somewhere far on foot with nothing to listen to.",
        body: "A long walk with no audio supplies physical effort, unfilled time and mild discomfort together, which is most of the book's prescription in one accessible activity. Several hours is where the effect reported starts to appear.",
        tryIt: "Walk for two hours this week with no podcast, no music and no destination you need to reach."
      },
      {
        id: "the-comfort-crisis:practice-one-discomfort",
        kind: "practice",
        claim: "Choose one small discomfort and keep it.",
        body: "Cold water, being hungry for a few hours, carrying something heavy - a single repeated stressor you chose. The value is in it being voluntary and regular rather than extreme.",
        tryIt: "Pick one: a cold finish to your shower, or the stairs every time. Hold it for a month."
      },
      {
        id: "the-comfort-crisis:limit-chosen",
        kind: "limit",
        claim: "Chosen hardship and imposed hardship are not the same thing.",
        body: "Voluntary discomfort with a warm house waiting is a different experience from cold you cannot escape or hunger you did not plan. People with genuinely hard circumstances do not get the benefit the book describes, and framing discomfort as uniformly strengthening is a comfortable position to write from."
      },
      {
        id: "the-comfort-crisis:contested-mismatch",
        kind: "contested",
        claim: "Evolutionary-mismatch reasoning explains a lot and predicts very little.",
        body: "The story - we evolved for scarcity and live in abundance - fits almost any modern complaint, which is a weakness rather than a strength in an explanation. Individual interventions like cold exposure and fasting have their own evidence, of varying quality, independent of the frame.",
        argumentWith: "four-thousand-weeks"
      },
      {
        id: "the-comfort-crisis:misread-suffering",
        kind: "misread",
        claim: "It becomes a case that suffering is virtuous.",
        body: "The argument is for specific stressors followed by recovery, not for a life of self-denial. Taken as proof that harder is always better, it produces people grinding without rest, which the book's own sources do not support."
      }
    ]
  },
  {
    bookId: "make-your-bed",
    inOneLine: "Finish one small thing properly at the start, and the day has a floor under it.",
    forWhom: "Anyone whose days collapse early and who needs somewhere small to start.",
    cards: [
      {
        id: "make-your-bed:argument-first-task",
        kind: "argument",
        claim: "One completed task early changes the shape of the day after it.",
        body: "McRaven's claim, from military training, is that a small thing finished properly provides evidence that you are someone who finishes things, before the day has had a chance to argue otherwise. On a day that then goes badly, you come home to one thing done."
      },
      {
        id: "make-your-bed:argument-together",
        kind: "argument",
        claim: "Nobody gets through anything hard alone.",
        body: "Much of the book is about crews, partners and the people who carried you. It is an unusual emphasis in a genre built on individual discipline, and it is the part most readers remember least."
      },
      {
        id: "make-your-bed:practice-one-thing",
        kind: "practice",
        claim: "Complete one small thing before the day starts making demands.",
        body: "The bed is a stand-in for any small, visible, completed task. What matters is that it is finished rather than started, and that it happens before the first interruption.",
        tryIt: "Choose one two-minute task to complete every morning before you touch your phone."
      },
      {
        id: "make-your-bed:practice-ask",
        kind: "practice",
        claim: "Name who you would actually ask, before you need them.",
        body: "Deciding who to call is far harder in the middle of a bad stretch than in advance. Knowing the name ahead of time is what turns the book's point about other people into something usable.",
        tryIt: "Write down two people you would call if this month went badly. Tell one of them."
      },
      {
        id: "make-your-bed:limit-thin",
        kind: "limit",
        claim: "It is a short speech expanded into a short book.",
        body: "There are ten lessons, each a story with a moral, and no method connecting them. As encouragement it works; as a practical guide there is less here than the reputation implies, and an hour reading it is most of what it has."
      },
      {
        id: "make-your-bed:contested-transfer",
        kind: "contested",
        claim: "Whether small discipline actually spreads to larger things.",
        body: "The idea that a tidy bed leads to better decisions later is intuitive and not well established - it sits close to the keystone-habit claim, which has the same problem of being argued from stories after the fact. The morale effect of finishing something is on firmer ground than the transfer.",
        argumentWith: "the-power-of-habit"
      },
      {
        id: "make-your-bed:misread-method",
        kind: "misread",
        claim: "It gets treated as a system rather than a set of reminders.",
        body: "There is no programme here to follow, and reading it expecting one produces disappointment with a book that was never attempting it. It is a commencement address, and judged as one it is a good one."
      }
    ]
  },
  {
    bookId: "the-checklist-manifesto",
    inOneLine: "Experts fail less from not knowing than from not applying what they already know.",
    forWhom: "Anyone whose work is complex, repeated, and occasionally goes wrong in avoidable ways.",
    cards: [
      {
        id: "the-checklist-manifesto:argument-ineptitude",
        kind: "argument",
        claim: "Most avoidable failure is skipped steps, not missing knowledge.",
        body: "Gawande separates ignorance, where the knowledge does not exist, from ineptitude, where it exists and was not applied. His claim is that modern professional failure is overwhelmingly the second, and that it is therefore addressable."
      },
      {
        id: "the-checklist-manifesto:argument-attention",
        kind: "argument",
        claim: "A checklist protects attention for the part that needs judgment.",
        body: "Handling the known steps mechanically frees expertise for the unexpected, which is where it is actually needed. The resistance from experts comes from reading a checklist as doubt about their competence rather than as a way to spend it better."
      },
      {
        id: "the-checklist-manifesto:practice-short",
        kind: "practice",
        claim: "Write a short one for the thing that goes wrong most.",
        body: "An effective checklist is five to nine items, covers only steps that are skipped under pressure, and attaches to a specific pause point. Longer ones get read less carefully, which makes them worse than none.",
        tryIt: "Take the task that last went avoidably wrong and write six lines for it. No more than six."
      },
      {
        id: "the-checklist-manifesto:practice-speak-up",
        kind: "practice",
        claim: "Put a moment in it where everyone says something.",
        body: "In the surgical version the team states names and roles aloud before starting. The function is social rather than informational: a person who has spoken once is measurably more likely to speak again when something looks wrong.",
        tryIt: "Add one line at the top: everyone present names what they are responsible for today."
      },
      {
        id: "the-checklist-manifesto:limit-culture",
        kind: "limit",
        claim: "Imposed without the team's agreement, it becomes paperwork.",
        body: "Checklists work when the people using them believe in them and can change them; mandated from above they get ticked without being read, which adds effort and removes nothing. The tool is easy to copy and the conditions that make it work are not."
      },
      {
        id: "the-checklist-manifesto:contested-results",
        kind: "contested",
        claim: "Later large rollouts produced much weaker results than the original trial.",
        body: "The initial study showed striking reductions in complications; several subsequent population-wide implementations found little or no effect. The most common reading is that the checklist was never the active ingredient on its own - how it was introduced was - which is a genuinely harder thing to export."
      },
      {
        id: "the-checklist-manifesto:misread-longer",
        kind: "misread",
        claim: "People think a more thorough checklist is a better one.",
        body: "Every item added lowers the attention paid to all the others, and a comprehensive list is reliably ticked without reading. The discipline the book describes is deciding what to leave out."
      }
    ]
  }
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
