-- Twenty editorial discussion posts under the BookSphere Team account.
--
-- Deliberately Insight, Question and Disagreement only. None is written as personal
-- experience, because the account has none, and inventing reader outcomes would break
-- the one promise a discussion product cannot recover from. Each names where an idea
-- is genuinely contested, then ends on a question a real reader can answer.
--
-- The rate-limit trigger on discussion_posts requires auth.uid() and caps a user at 10
-- posts an hour. Both are correct for readers and both block an operator seeding from
-- the SQL editor, so the trigger is disabled and restored inside one transaction: if
-- anything fails, the rollback re-enables it rather than leaving the table unguarded.
--
-- Depends on 20260806000000 (slug key) and 20260807000000 (catalog sync). Safe to
-- re-run; posts whose title already exists are skipped.

begin;

alter table public.discussion_posts disable trigger discussion_posts_rate_limit;

insert into public.discussion_posts (book_id, user_id, post_type, perspective_type, title, body, status)
select v.book_id, v.user_id, v.post_type, v.perspective_type, v.title, v.body, v.status
from (values
  ((select id from public.books where slug = 'atomic-habits'), '11111111-1111-1111-1111-111111111111'::uuid, 'Disagreement', 'disagreement', 'Habit stacking assumes a stable life. Whose life is stable?', 'The advice to anchor a new habit to an existing one assumes your days have reliable structure to anchor to. That describes an office worker with a fixed commute. It does not describe a nurse on rotating shifts, a parent of a newborn, or anyone holding two jobs.

The book is honest that environment beats willpower, but the environments it uses as examples are unusually controllable. If your kitchen, schedule and commute are not yours to arrange, most of the system''s leverage disappears.

So the open question is what replaces the anchor when there is no stable cue to attach to. Identity-based habits are the book''s answer, but identity is the slowest lever it describes.

If your schedule changes week to week, what actually held? And what quietly stopped working the moment your routine broke?', 'published'),
  ((select id from public.books where slug = 'thinking-fast-and-slow'), '11111111-1111-1111-1111-111111111111'::uuid, 'Insight', 'insight', 'The most useful part of this book is the part that failed replication', 'Several priming studies in this book did not survive the replication crisis, and Kahneman said so publicly himself. That admission is more instructive than most of the findings.

What survives is the core architecture: fast intuitive judgement is not a degraded version of slow reasoning, it is a different system with different failure modes. Loss aversion, anchoring and availability remain well supported.

The practical lesson is not a list of biases to memorise. It is that knowing a bias exists does not protect you from it. Kahneman was explicit that decades of study did not make his own intuitions reliable.

Which raises the question worth discussing here: has knowing about anchoring ever actually changed a number you agreed to? Or did you only recognise it afterwards?', 'published'),
  ((select id from public.books where slug = 'deep-work'), '11111111-1111-1111-1111-111111111111'::uuid, 'Question', 'question', 'Is deep work a skill, or a privilege dressed as a skill?', 'Newport argues that the ability to concentrate without distraction is becoming rare and therefore valuable. The economic logic is sound.

But the conditions the book recommends, long uninterrupted blocks, control over your calendar, the ability to be unreachable, are largely determined by your seniority and what you do. A junior support engineer cannot decide to be unreachable. A parent cannot batch their children.

That does not make the idea wrong. It makes it unevenly available, and the book spends more time on the value of depth than on who can access it.

So: for those of you who do not control your own calendar, has any version of this worked? Or is the honest answer that the advice arrives about ten years into a career?', 'published'),
  ((select id from public.books where slug = 'the-lean-startup'), '11111111-1111-1111-1111-111111111111'::uuid, 'Disagreement', 'disagreement', 'The MVP became a licence to ship things nobody wanted', 'Ries defined the minimum viable product as the smallest experiment that produces validated learning. In practice the term got used to justify shipping a thin product and calling the resulting silence data.

The distinction the book makes and most teams drop is that an MVP is an experiment with a hypothesis attached. Without a stated hypothesis and a threshold that would falsify it, you have not run an experiment. You have launched something small.

There is a second problem. Iterative validation works when customers can evaluate what you show them. It works badly when the value only appears at scale, or in categories where users cannot articulate the need until the thing exists.

Where have you seen the method fail honestly? Not because it was applied badly, but because the product was the wrong shape for it?', 'published'),
  ((select id from public.books where slug = 'zero-to-one'), '11111111-1111-1111-1111-111111111111'::uuid, 'Insight', 'insight', 'The contrarian question is harder than it looks, and Thiel knows it', 'The famous interview question is what important truth do very few people agree with you on. It sounds like an invitation to be provocative. It is closer to a test of whether you have any first-hand knowledge at all.

Most answers fail in one of two directions: they are merely unpopular opinions with no evidence, or they are consensus views stated aggressively. A real answer requires you to have seen something others have not had access to.

The deeper argument in the book is that competition destroys profit, and that most people compete because it is legible rather than because it is wise. That claim is much more contestable than the monopoly framing suggests, and the book is thin on cases where monopoly harmed the customer.

What would you actually answer? And how would you know it was knowledge rather than taste?', 'published'),
  ((select id from public.books where slug = 'sapiens'), '11111111-1111-1111-1111-111111111111'::uuid, 'Disagreement', 'disagreement', 'Where Sapiens is strongest is exactly where historians push back', 'The shared-fiction thesis, that money, nations and companies work because enough people believe in them, is the book''s most quoted idea and its most useful one.

Working historians have been more critical than the general readership. The Agricultural Revolution as history''s biggest fraud is a striking line, but it compresses several thousand years and enormous regional variation into a single verdict. Specialists have objected that the sweep comes at the cost of accuracy in nearly every chapter they know well.

That tension is worth sitting with rather than resolving. A book that is wrong in the details can still hand you a frame you keep using, and a book that is careful in every detail can leave you with nothing portable.

For those who know one of these periods properly: which chapter did the book get wrong in a way that mattered?', 'published'),
  ((select id from public.books where slug = 'the-body-keeps-the-score'), '11111111-1111-1111-1111-111111111111'::uuid, 'Question', 'question', 'What does this book give a reader who is not in therapy?', 'Van der Kolk''s central claim is that trauma is stored somatically and that talk alone often fails to reach it. The clinical evidence for body-based approaches has grown, though specific modalities in the book vary a lot in support.

The difficulty is that this is a clinical book that became a mass-market one. Readers arrive looking for self-treatment and find descriptions of therapies that require a trained practitioner. Some come away with a vocabulary for their experience and no access to the interventions.

There is a real risk in self-diagnosis from a book that is largely about how hard accurate diagnosis is.

So the honest question: did reading this help, or did it mainly give you language? Both are legitimate outcomes, but they are not the same thing.', 'published'),
  ((select id from public.books where slug = 'meditations'), '11111111-1111-1111-1111-111111111111'::uuid, 'Insight', 'insight', 'This was a private notebook, and reading it as advice distorts it', 'Marcus Aurelius was not writing for you. These are notes to himself, repetitive on purpose, working the same few ideas over and over because he kept failing to live by them.

That framing changes what the book is. Read as advice it sounds serene and slightly smug. Read as a record of someone repeatedly reminding himself not to be angry, not to fear death, not to care about reputation, it reads as evidence that he was angry, afraid and vain, like everyone else.

Modern Stoicism tends to extract the calm and drop the struggle. The repetition is the honest part.

What is the passage you have returned to more than once, and did it work the second time?', 'published'),
  ((select id from public.books where slug = 'the-psychology-of-money'), '11111111-1111-1111-1111-111111111111'::uuid, 'Insight', 'insight', 'Reasonable beats rational, and that is a harder standard than it sounds', 'Housel''s argument is that a financial plan you can actually keep during a downturn beats an optimal one you abandon. The claim is modest and widely agreed with in the abstract.

It is much harder in practice, because it requires knowing your own behaviour under stress, and almost nobody has good information about that until they have been tested. Most people discover their real risk tolerance exactly once, at the worst possible moment.

The book is strong on stories and light on mechanism. It tells you temperament matters more than spreadsheets without telling you how to find out what your temperament is before it costs you.

Has anyone here actually learned their risk tolerance in advance, rather than during a crash?', 'published'),
  ((select id from public.books where slug = 'never-split-the-difference'), '11111111-1111-1111-1111-111111111111'::uuid, 'Disagreement', 'disagreement', 'Hostage negotiation tactics in an ordinary workplace can read as manipulation', 'Tactical empathy, mirroring, labelling and calibrated questions are genuinely effective. The techniques work, which is part of the problem.

Hostage negotiation has a structural feature that most business situations lack: you will never deal with that counterparty again, and the stakes are asymmetric and immediate. Salary talks, vendor contracts and team disagreements are repeated games with people who will notice patterns.

Used repeatedly on the same colleague, mirroring stops reading as empathy and starts reading as technique. Once someone can name what you are doing, the tool becomes a liability.

Where is the line? Which of these have you used successfully more than once with the same person, and which only work on strangers?', 'published'),
  ((select id from public.books where slug = 'the-effective-executive'), '11111111-1111-1111-1111-111111111111'::uuid, 'Insight', 'insight', 'Drucker''s claim that effectiveness can be learned is more radical than it reads', 'Written in 1966, the argument is that effectiveness is a set of practices rather than a personality trait, and therefore teachable. Most management writing since has quietly assumed the opposite while claiming otherwise.

The specific practices hold up unusually well: know where your time actually goes rather than where you think it goes, focus on contribution rather than effort, make few decisions at a high level rather than many small ones.

The part that has aged is the assumption of a stable organisation with clear boundaries. Drucker''s executive knows what their job is. Much modern knowledge work does not come with that clarity, and deciding what the job is has become the harder problem.

Does the time log still work? Has anyone actually run one for a week and been surprised?', 'published'),
  ((select id from public.books where slug = 'high-output-management'), '11111111-1111-1111-1111-111111111111'::uuid, 'Question', 'question', 'Does the manager-as-output-multiplier idea survive remote work?', 'Grove''s definition is that a manager''s output equals the output of their organisation plus the output of neighbouring organisations they influence. It is the cleanest definition of the job anyone has written.

Much of the mechanism, though, depends on ambient information: walking the floor, overhearing problems, catching a hesitation in a meeting. Grove''s one-on-ones assume a manager who already has enough context to ask the right question.

Distributed teams remove most of that ambient signal. The written-first response, more documentation and more explicit status, is a real substitute but not the same one.

For managers here who work distributed: what did you have to replace, and what did you never manage to replace?', 'published'),
  ((select id from public.books where slug = 'principles'), '11111111-1111-1111-1111-111111111111'::uuid, 'Disagreement', 'disagreement', 'Radical transparency worked at Bridgewater. That is not evidence it travels.', 'Dalio''s system, believability-weighted decisions, recorded meetings, public ratings, produced extraordinary returns at one firm over decades. That is real evidence of something.

What it is evidence of is contested. Bridgewater selected heavily for people who tolerated the culture, and reporting on attrition suggests many did not. A system that works for the people who survive it has a selection problem baked into the results.

There is also a survivorship issue in the genre. We read the principles of the firm that succeeded, not the identical principles of firms that failed with them.

Has anyone tried importing a piece of this into a normal company? Which part transferred, and which part immediately broke?', 'published'),
  ((select id from public.books where slug = 'good-strategy-bad-strategy'), '11111111-1111-1111-1111-111111111111'::uuid, 'Insight', 'insight', 'Most documents called strategy are goals with a deadline attached', 'Rumelt''s kernel is diagnosis, guiding policy, coherent action. The test he offers is simple and brutal: if your strategy does not identify a specific obstacle, it is not a strategy.

By that standard most corporate strategy is bad strategy in his precise sense. Ambitious targets, values statements and a list of initiatives that do not reinforce each other. The tell is that you could swap the company name and the document would still read fine.

The uncomfortable implication is that real strategy requires saying what you will not do, which is politically expensive in a way that goal-setting is not.

What is the best diagnosis you have seen written down? Not the plan, the diagnosis.', 'published'),
  ((select id from public.books where slug = 'influence'), '11111111-1111-1111-1111-111111111111'::uuid, 'Insight', 'insight', 'Cialdini''s principles are defensive knowledge more than offensive knowledge', 'Reciprocity, commitment, social proof, authority, liking, scarcity. The book is usually read as a persuasion manual, which is the less valuable reading.

The more useful one is recognising these when they are being used on you. The free sample that creates obligation, the small commitment that makes the large one feel consistent, the artificial deadline. Naming the mechanism is most of the defence.

Worth noting that some of the underlying literature has faced replication scrutiny, as with much of social psychology from that era. The core principles have held better than the specific effect sizes.

Which of the six do you notice most often being run on you, and did noticing it actually change what you did?', 'published'),
  ((select id from public.books where slug = 'the-hard-thing-about-hard-things'), '11111111-1111-1111-1111-111111111111'::uuid, 'Insight', 'insight', 'The value here is that it refuses to give you a formula', 'Horowitz says directly that there is no recipe for the hard things, and then spends the book on situations where every option is bad. Layoffs, demoting a loyal friend, telling the truth to people who will leave because of it.

That structure is the argument. Most business books present decisions with a right answer that was obvious in retrospect. This one presents decisions where the person deciding did not know, and where the outcome does not settle whether the call was correct.

The weakness is the same as the strength. Advice drawn from one operator''s crises does not obviously generalise, and the book does not claim it does.

What decision are you carrying where you still cannot tell whether you got it right?', 'published'),
  ((select id from public.books where slug = 'crucial-conversations'), '11111111-1111-1111-1111-111111111111'::uuid, 'Question', 'question', 'Does the method work when the power gap is large?', 'The framework, watch for safety, make it safe, state your path, is genuinely usable and unusually specific for a communication book.

Its assumption is that both parties want a shared pool of meaning. That holds between peers. It holds much less well when one party controls the other''s employment, immigration status or performance review.

The book acknowledges power differences but treats them as a complication rather than as something that can invalidate the approach. Speaking your honest path to someone who can fire you is not a technique problem.

For people who have used this upward, to a boss or someone with real leverage over you: did it work? And what did it cost when it did not?', 'published'),
  ((select id from public.books where slug = 'the-innovator-s-dilemma'), '11111111-1111-1111-1111-111111111111'::uuid, 'Disagreement', 'disagreement', 'Disruption is now used for anything new, which has made it useless', 'Christensen''s argument was narrow and testable: incumbents lose because they rationally serve their best customers, while a cheaper, worse product improves from below until it is good enough.

The word has since been stretched to cover any successful new entrant. Uber is the standard counterexample; by the original definition it was not disruptive, it was a better product entering at the top. Christensen said so himself.

The theory has also faced empirical challenge, notably Jill Lepore''s argument that the case selection favoured the conclusion and that several disrupted incumbents did fine.

Does the narrow version still predict anything? Where have you seen a genuine low-end entry that incumbents rationally ignored?', 'published'),
  ((select id from public.books where slug = 'how-to-win-friends-and-influence-people'), '11111111-1111-1111-1111-111111111111'::uuid, 'Question', 'question', 'Does this book still work now that everyone has read it?', 'Written in 1936 and still selling. The advice, use someone''s name, be genuinely interested, avoid criticising directly, was less familiar then than now.

The interesting question is what happens to social technique when it becomes universal. Techniques that read as warmth when rare can read as sales training when recognised. Anyone who has been on the receiving end of aggressive rapport-building knows the feeling.

Carnegie''s defence is that the sincerity is not optional, that the methods fail when performed. That may be right, and it is also conveniently unfalsifiable.

Can you tell when someone is running this on you? And does knowing make it less effective, or does it work anyway?', 'published'),
  ((select id from public.books where slug = 'man-s-search-for-meaning'), '11111111-1111-1111-1111-111111111111'::uuid, 'Insight', 'insight', 'The clinical half is quieter than the memoir, and does more work', 'The camp memoir is what people remember. The second half, the outline of logotherapy, is where the argument actually lives: that meaning is found rather than assigned, and can be found in work, in love, or in the attitude taken toward unavoidable suffering.

That last category is the one that resists the usual self-help framing. It does not promise that suffering has a purpose. It claims only that a stance toward it remains available when nothing else does.

Frankl was careful that his survival was not evidence his theory was correct, and he said explicitly that the best did not come back. Readers routinely skip that line.

For anyone who has used this during something genuinely bad: did the distinction between meaning and consolation hold up?', 'published')
) as v(book_id, user_id, post_type, perspective_type, title, body, status)
where v.book_id is not null
  and not exists (select 1 from public.discussion_posts d where d.title = v.title);

alter table public.discussion_posts enable trigger discussion_posts_rate_limit;

commit;
