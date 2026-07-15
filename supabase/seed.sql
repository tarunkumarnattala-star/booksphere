insert into genres (name, slug) values
('Business','business'),('Finance','finance'),('Investing','investing'),('Personal Growth','personal-growth'),('Communication','communication'),('Psychology','psychology'),('Startups','startups'),('Productivity','productivity'),('Health','health'),('Philosophy','philosophy'),('Biography','biography'),('History','history'),('Relationships','relationships'),('Leadership','leadership')
on conflict (slug) do nothing;

insert into badges (name, description) values
('Top Contributor','Creates consistently useful book discussions.'),('Deep Thinker','Adds careful, high-signal perspectives.'),('Business Reader','Contributes strong business reading notes.'),('Finance Reader','Adds helpful finance and investing ideas.'),('Psychology Contributor','Connects psychology books to real life.'),('Startup Thinker','Shares practical startup insight.'),('Personal Growth Contributor','Turns personal growth books into useful practice.')
on conflict (name) do nothing;

insert into profiles (id, name, username, bio, created_at) values
('11111111-1111-1111-1111-111111111111','BookSphere Team','booksphere-team','Starter prompts and editorial picks to help the community begin with substance.','2026-01-04'),
('22222222-2222-2222-2222-222222222222','Community Starter','community-starter','Original starter posts written to model thoughtful discussion without pretending to be real user reviews.','2026-01-06'),
('33333333-3333-3333-3333-333333333333','Reader Ops','reader-ops','A practical reading desk for business, startups, and communication ideas.','2026-02-11')
on conflict (username) do nothing;

with seed(title, author, published_year, primary_genre) as (
  values
  ('Atomic Habits','James Clear',2018,'Personal Growth'),('The Psychology of Money','Morgan Housel',2020,'Finance'),('Deep Work','Cal Newport',2016,'Productivity'),('Zero to One','Peter Thiel',2014,'Startups'),('Thinking, Fast and Slow','Daniel Kahneman',2011,'Psychology'),('Good to Great','Jim Collins',2001,'Business'),('Meditations','Marcus Aurelius',180,'Philosophy'),('Sapiens','Yuval Noah Harari',2011,'History'),('Never Split the Difference','Chris Voss',2016,'Communication'),('Outlive','Peter Attia',2023,'Health'),
  ('The Innovator''s Dilemma','Clayton M. Christensen',1997,'Business'),('High Output Management','Andrew S. Grove',1983,'Leadership'),('The Effective Executive','Peter F. Drucker',1966,'Leadership'),('Crossing the Chasm','Geoffrey A. Moore',1991,'Startups'),('Blue Ocean Strategy','W. Chan Kim and Renee Mauborgne',2004,'Business'),('The Lean Startup','Eric Ries',2011,'Startups'),('Built to Last','Jim Collins and Jerry I. Porras',1994,'Business'),('Measure What Matters','John Doerr',2018,'Productivity'),('Rework','Jason Fried and David Heinemeier Hansson',2010,'Business'),('The Intelligent Investor','Benjamin Graham',1949,'Investing'),
  ('A Random Walk Down Wall Street','Burton G. Malkiel',1973,'Investing'),('The Millionaire Next Door','Thomas J. Stanley and William D. Danko',1996,'Finance'),('Your Money or Your Life','Vicki Robin and Joe Dominguez',1992,'Finance'),('The Richest Man in Babylon','George S. Clason',1926,'Finance'),('The Little Book of Common Sense Investing','John C. Bogle',2007,'Investing'),('Common Stocks and Uncommon Profits','Philip A. Fisher',1958,'Investing'),('Fooled by Randomness','Nassim Nicholas Taleb',2001,'Finance'),('The Simple Path to Wealth','J. L. Collins',2016,'Finance'),('One Up On Wall Street','Peter Lynch',1989,'Investing'),('Security Analysis','Benjamin Graham and David Dodd',1934,'Investing'),
  ('The Most Important Thing','Howard Marks',2011,'Investing'),('The Essays of Warren Buffett','Lawrence A. Cunningham',1997,'Investing'),('Reminiscences of a Stock Operator','Edwin Lefevre',1923,'Investing'),('Market Wizards','Jack D. Schwager',1989,'Investing'),('The Dhandho Investor','Mohnish Pabrai',2007,'Investing'),('The Warren Buffett Way','Robert G. Hagstrom',1994,'Investing'),('Mindset','Carol S. Dweck',2006,'Personal Growth'),('The 7 Habits of Highly Effective People','Stephen R. Covey',1989,'Personal Growth'),('Essentialism','Greg McKeown',2014,'Productivity'),('The War of Art','Steven Pressfield',2002,'Personal Growth'),
  ('The Obstacle Is the Way','Ryan Holiday',2014,'Philosophy'),('Can''t Hurt Me','David Goggins',2018,'Personal Growth'),('Make Your Bed','William H. McRaven',2017,'Leadership'),('Man''s Search for Meaning','Viktor E. Frankl',1946,'Philosophy'),('How to Win Friends and Influence People','Dale Carnegie',1936,'Communication'),('Crucial Conversations','Kerry Patterson et al.',2002,'Communication'),('Nonviolent Communication','Marshall B. Rosenberg',1999,'Communication'),('Made to Stick','Chip Heath and Dan Heath',2007,'Communication'),('Influence','Robert B. Cialdini',1984,'Psychology'),('Talk Like TED','Carmine Gallo',2014,'Communication'),
  ('Difficult Conversations','Douglas Stone, Bruce Patton, and Sheila Heen',1999,'Communication'),('On Writing Well','William Zinsser',1976,'Communication'),('Everybody Writes','Ann Handley',2014,'Communication'),('Predictably Irrational','Dan Ariely',2008,'Psychology'),('Flow','Mihaly Csikszentmihalyi',1990,'Psychology'),('The Power of Habit','Charles Duhigg',2012,'Psychology'),('Grit','Angela Duckworth',2016,'Psychology'),('Stumbling on Happiness','Daniel Gilbert',2006,'Psychology'),('The Righteous Mind','Jonathan Haidt',2012,'Psychology'),('Quiet','Susan Cain',2012,'Psychology'),
  ('Drive','Daniel H. Pink',2009,'Psychology'),('The Mom Test','Rob Fitzpatrick',2013,'Startups'),('Traction','Gabriel Weinberg and Justin Mares',2014,'Startups'),('Inspired','Marty Cagan',2008,'Startups'),('Hooked','Nir Eyal',2014,'Startups'),('The Hard Thing About Hard Things','Ben Horowitz',2014,'Startups'),('Founders at Work','Jessica Livingston',2007,'Startups'),('Blitzscaling','Reid Hoffman and Chris Yeh',2018,'Startups'),('Venture Deals','Brad Feld and Jason Mendelson',2011,'Startups'),('Obviously Awesome','April Dunford',2019,'Startups'),
  ('Getting Things Done','David Allen',2001,'Productivity'),('Make Time','Jake Knapp and John Zeratsky',2018,'Productivity'),('The ONE Thing','Gary Keller and Jay Papasan',2013,'Productivity'),('Four Thousand Weeks','Oliver Burkeman',2021,'Productivity'),('Eat That Frog!','Brian Tracy',2001,'Productivity'),('The Checklist Manifesto','Atul Gawande',2009,'Productivity'),('The 80/20 Principle','Richard Koch',1997,'Productivity'),('Digital Minimalism','Cal Newport',2019,'Productivity'),('Why We Sleep','Matthew Walker',2017,'Health'),('Breath','James Nestor',2020,'Health'),
  ('The Body Keeps the Score','Bessel van der Kolk',2014,'Health'),('How Not to Die','Michael Greger',2015,'Health'),('Spark','John J. Ratey',2008,'Health'),('In Defense of Food','Michael Pollan',2008,'Health'),('The Comfort Crisis','Michael Easter',2021,'Health'),('Letters from a Stoic','Seneca',65,'Philosophy'),('The Republic','Plato',-375,'Philosophy'),('Nicomachean Ethics','Aristotle',-340,'Philosophy'),('Tao Te Ching','Laozi',-400,'Philosophy'),('The Myth of Sisyphus','Albert Camus',1942,'Philosophy'),
  ('Zen Mind, Beginner''s Mind','Shunryu Suzuki',1970,'Philosophy'),('Steve Jobs','Walter Isaacson',2011,'Biography'),('Shoe Dog','Phil Knight',2016,'Biography'),('The Ride of a Lifetime','Robert Iger',2019,'Biography'),('Becoming','Michelle Obama',2018,'Biography'),('Benjamin Franklin','Walter Isaacson',2003,'Biography'),('Leonardo da Vinci','Walter Isaacson',2017,'Biography'),('Team of Rivals','Doris Kearns Goodwin',2005,'History'),('The Lessons of History','Will and Ariel Durant',1968,'History'),('The Silk Roads','Peter Frankopan',2015,'History')
)
insert into books (title, author, published_year, isbn, description, why_matters, why_it_matters, discussion_count, insight_count, readers_count)
select title, author, published_year,
  case title
    when 'Atomic Habits' then '9780735211292'
    when 'The Psychology of Money' then '9780857197689'
    when 'Deep Work' then '9781455586691'
    when 'Zero to One' then '9780804139298'
    when 'Thinking, Fast and Slow' then '9780374533557'
    when 'Good to Great' then '9780066620992'
    when 'Meditations' then '9780140449334'
    when 'Sapiens' then '9780062316097'
    when 'Never Split the Difference' then '9780062407801'
    when 'Outlive' then '9780593236598'
    when 'The Lean Startup' then '9780307887894'
    when 'The Intelligent Investor' then '9780060555665'
    when 'The 7 Habits of Highly Effective People' then '9781982137274'
    when 'How to Win Friends and Influence People' then '9780671027032'
    when 'Influence' then '9780061241895'
    when 'Steve Jobs' then '9781451648539'
    when 'Shoe Dog' then '9781501135927'
    when 'Becoming' then '9781524763138'
    else null
  end,
  'A community favorite for exploring ' || lower(primary_genre) || ' through practical ideas, memorable frameworks, and real-world reflection.',
  'Readers return to ' || title || ' because it gives people shared language for decisions, habits, and conversations that show up far beyond the page.',
  'Readers return to ' || title || ' because it gives people shared language for decisions, habits, and conversations that show up far beyond the page.',
  18 + ((row_number() over () * 7) % 86),
  42 + ((row_number() over () * 13) % 420),
  320 + ((row_number() over () * 97) % 4900)
from seed
on conflict do nothing;

update books set
  is_editors_pick = true,
  editors_pick_order = picks.pick_order
from (values
  ('Atomic Habits', 1),
  ('The Psychology of Money', 2),
  ('Deep Work', 3),
  ('Thinking, Fast and Slow', 4),
  ('Zero to One', 5),
  ('Meditations', 6),
  ('Never Split the Difference', 7),
  ('Good to Great', 8),
  ('Sapiens', 9),
  ('Outlive', 10),
  ('The Intelligent Investor', 11),
  ('Man''s Search for Meaning', 12)
) as picks(title, pick_order)
where books.title = picks.title;

update books set
  is_beginner_essential = true,
  beginner_order = picks.pick_order
from (values
  ('Atomic Habits', 1),
  ('The Psychology of Money', 2),
  ('The 7 Habits of Highly Effective People', 3),
  ('How to Win Friends and Influence People', 4),
  ('Mindset', 5),
  ('The Lean Startup', 6),
  ('The Little Book of Common Sense Investing', 7),
  ('Never Split the Difference', 8),
  ('Essentialism', 9),
  ('Why We Sleep', 10),
  ('Meditations', 11)
) as picks(title, pick_order)
where books.title = picks.title;

update books set
  is_hidden_gem = true,
  hidden_gem_order = picks.pick_order
from (values
  ('The Most Important Thing', 1),
  ('The Dhandho Investor', 2),
  ('On Writing Well', 3),
  ('The Mom Test', 4),
  ('The Lessons of History', 5),
  ('The Comfort Crisis', 6),
  ('Letters from a Stoic', 7),
  ('Four Thousand Weeks', 8),
  ('Obviously Awesome', 9),
  ('Reminiscences of a Stock Operator', 10)
) as picks(title, pick_order)
where books.title = picks.title;

update books set
  is_trending_seed = true,
  trending_seed_order = picks.pick_order
from (values
  ('The Psychology of Money', 1),
  ('Atomic Habits', 2),
  ('Deep Work', 3),
  ('Thinking, Fast and Slow', 4),
  ('Never Split the Difference', 5),
  ('The Intelligent Investor', 6),
  ('The Lean Startup', 7),
  ('Outlive', 8),
  ('Man''s Search for Meaning', 9),
  ('Good to Great', 10)
) as picks(title, pick_order)
where books.title = picks.title;

insert into book_genres (book_id, genre_id)
select b.id, g.id
from books b
join genres g on lower(b.description) like '%' || lower(g.name) || '%'
on conflict do nothing;

insert into discussion_posts (book_id, user_id, post_type, title, body, created_at)
select b.id, '11111111-1111-1111-1111-111111111111', 'Insight',
  'The idea from ' || b.title || ' that deserves a second reading',
  'Starter discussion: this post is original BookSphere seed content. What would change this week if you treated this book as a practice instead of a take-away?',
  now() - interval '5 days'
from books b
order by b.created_at
limit 30;

update books set cover_url = covers.cover_url
from (values
  ('Atomic Habits', 'https://covers.openlibrary.org/b/id/12539702-L.jpg'),
  ('The Psychology of Money', 'https://covers.openlibrary.org/b/id/10389354-L.jpg'),
  ('Deep Work', 'https://covers.openlibrary.org/b/id/7988607-L.jpg'),
  ('Zero to One', 'https://covers.openlibrary.org/b/id/9002334-L.jpg'),
  ('Thinking, Fast and Slow', 'https://covers.openlibrary.org/b/id/13290711-L.jpg'),
  ('Good to Great', 'https://covers.openlibrary.org/b/id/7431270-L.jpg'),
  ('Meditations', 'https://covers.openlibrary.org/b/id/211529-L.jpg'),
  ('Sapiens', 'https://covers.openlibrary.org/b/id/8634250-L.jpg'),
  ('Never Split the Difference', 'https://covers.openlibrary.org/b/id/8365942-L.jpg'),
  ('Outlive', 'https://covers.openlibrary.org/b/id/13191259-L.jpg'),
  ('The Innovator''s Dilemma', 'https://covers.openlibrary.org/b/id/9274687-L.jpg'),
  ('High Output Management', 'https://covers.openlibrary.org/b/id/421244-L.jpg'),
  ('The Effective Executive', 'https://covers.openlibrary.org/b/id/15226698-L.jpg'),
  ('Crossing the Chasm', 'https://covers.openlibrary.org/b/id/684159-L.jpg'),
  ('Blue Ocean Strategy', 'https://covers.openlibrary.org/b/id/864038-L.jpg'),
  ('The Lean Startup', 'https://covers.openlibrary.org/b/id/7104760-L.jpg'),
  ('Built to Last', 'https://covers.openlibrary.org/b/id/684195-L.jpg'),
  ('Measure What Matters', 'https://covers.openlibrary.org/b/id/10706481-L.jpg'),
  ('Rework', 'https://covers.openlibrary.org/b/id/6679955-L.jpg'),
  ('The Intelligent Investor', 'https://covers.openlibrary.org/b/id/36434-L.jpg'),
  ('A Random Walk Down Wall Street', 'https://covers.openlibrary.org/b/id/246978-L.jpg'),
  ('The Millionaire Next Door', 'https://covers.openlibrary.org/b/id/797467-L.jpg'),
  ('Your Money or Your Life', 'https://covers.openlibrary.org/b/id/6975229-L.jpg'),
  ('The Richest Man in Babylon', 'https://covers.openlibrary.org/b/id/10491331-L.jpg'),
  ('The Little Book of Common Sense Investing', 'https://covers.openlibrary.org/b/id/1239500-L.jpg'),
  ('Common Stocks and Uncommon Profits', 'https://covers.openlibrary.org/b/id/788750-L.jpg'),
  ('Fooled by Randomness', 'https://covers.openlibrary.org/b/id/855791-L.jpg'),
  ('The Simple Path to Wealth', 'https://covers.openlibrary.org/b/id/10448941-L.jpg'),
  ('One Up On Wall Street', 'https://covers.openlibrary.org/b/id/6241104-L.jpg'),
  ('Security Analysis', 'https://covers.openlibrary.org/b/id/60206-L.jpg'),
  ('The Most Important Thing', 'https://covers.openlibrary.org/b/id/10001222-L.jpg'),
  ('The Essays of Warren Buffett', 'https://covers.openlibrary.org/b/id/6497216-L.jpg'),
  ('Reminiscences of a Stock Operator', 'https://covers.openlibrary.org/b/id/300533-L.jpg'),
  ('Market Wizards', 'https://covers.openlibrary.org/b/id/6801784-L.jpg'),
  ('The Dhandho Investor', 'https://covers.openlibrary.org/b/id/1238610-L.jpg'),
  ('The Warren Buffett Way', 'https://covers.openlibrary.org/b/id/9700984-L.jpg'),
  ('Mindset', 'https://covers.openlibrary.org/b/id/746414-L.jpg'),
  ('The 7 Habits of Highly Effective People', 'https://covers.openlibrary.org/b/id/10079937-L.jpg'),
  ('Essentialism', 'https://covers.openlibrary.org/b/id/7285986-L.jpg'),
  ('The War of Art', 'https://covers.openlibrary.org/b/id/288439-L.jpg'),
  ('The Obstacle Is the Way', 'https://covers.openlibrary.org/b/id/14428233-L.jpg'),
  ('Can''t Hurt Me', 'https://covers.openlibrary.org/b/id/8305903-L.jpg'),
  ('Make Your Bed', 'https://covers.openlibrary.org/b/id/7984714-L.jpg'),
  ('Man''s Search for Meaning', 'https://covers.openlibrary.org/b/id/11203708-L.jpg'),
  ('How to Win Friends and Influence People', 'https://covers.openlibrary.org/b/id/13314878-L.jpg'),
  ('Crucial Conversations', 'https://covers.openlibrary.org/b/id/1711809-L.jpg'),
  ('Nonviolent Communication', 'https://covers.openlibrary.org/b/id/940686-L.jpg'),
  ('Made to Stick', 'https://covers.openlibrary.org/b/id/7004880-L.jpg'),
  ('Influence', 'https://covers.openlibrary.org/b/id/431011-L.jpg'),
  ('Talk Like TED', 'https://covers.openlibrary.org/b/id/7316010-L.jpg'),
  ('Difficult Conversations', 'https://covers.openlibrary.org/b/id/2555094-L.jpg'),
  ('On Writing Well', 'https://covers.openlibrary.org/b/id/20450-L.jpg'),
  ('Everybody Writes', 'https://covers.openlibrary.org/b/id/8449611-L.jpg'),
  ('Predictably Irrational', 'https://covers.openlibrary.org/b/id/2314080-L.jpg'),
  ('Flow', 'https://covers.openlibrary.org/b/id/11041932-L.jpg'),
  ('The Power of Habit', 'https://covers.openlibrary.org/b/id/9078085-L.jpg'),
  ('Grit', 'https://covers.openlibrary.org/b/id/7438753-L.jpg'),
  ('Stumbling on Happiness', 'https://covers.openlibrary.org/b/id/6803663-L.jpg'),
  ('The Righteous Mind', 'https://covers.openlibrary.org/b/id/7256782-L.jpg'),
  ('Quiet', 'https://covers.openlibrary.org/b/id/7079753-L.jpg'),
  ('Drive', 'https://covers.openlibrary.org/b/id/6404786-L.jpg'),
  ('The Mom Test', 'https://covers.openlibrary.org/b/id/10660557-L.jpg'),
  ('Traction', 'https://covers.openlibrary.org/b/id/9364675-L.jpg'),
  ('Inspired', 'https://covers.openlibrary.org/b/id/9700654-L.jpg'),
  ('Hooked', 'https://covers.openlibrary.org/b/id/12511799-L.jpg'),
  ('The Hard Thing About Hard Things', 'https://covers.openlibrary.org/b/id/7279515-L.jpg'),
  ('Founders at Work', 'https://covers.openlibrary.org/b/id/8257114-L.jpg'),
  ('Blitzscaling', 'https://covers.openlibrary.org/b/id/8294642-L.jpg'),
  ('Venture Deals', 'https://covers.openlibrary.org/b/id/8732100-L.jpg'),
  ('Obviously Awesome', 'https://covers.openlibrary.org/b/id/10194369-L.jpg'),
  ('Getting Things Done', 'https://covers.openlibrary.org/b/id/109288-L.jpg'),
  ('Make Time', 'https://covers.openlibrary.org/b/id/14179816-L.jpg'),
  ('The ONE Thing', 'https://covers.openlibrary.org/b/id/10351762-L.jpg'),
  ('Four Thousand Weeks', 'https://covers.openlibrary.org/b/id/11990973-L.jpg'),
  ('Eat That Frog!', 'https://covers.openlibrary.org/b/id/847534-L.jpg'),
  ('The Checklist Manifesto', 'https://covers.openlibrary.org/b/id/8231866-L.jpg'),
  ('The 80/20 Principle', 'https://covers.openlibrary.org/b/id/241591-L.jpg'),
  ('Digital Minimalism', 'https://covers.openlibrary.org/b/id/8507540-L.jpg'),
  ('Why We Sleep', 'https://covers.openlibrary.org/b/id/8814155-L.jpg'),
  ('Breath', 'https://covers.openlibrary.org/b/id/10096454-L.jpg'),
  ('The Body Keeps the Score', 'https://covers.openlibrary.org/b/id/8315367-L.jpg'),
  ('How Not to Die', 'https://covers.openlibrary.org/b/id/7398330-L.jpg'),
  ('Spark', 'https://covers.openlibrary.org/b/id/2379210-L.jpg'),
  ('In Defense of Food', 'https://covers.openlibrary.org/b/id/2960867-L.jpg'),
  ('The Comfort Crisis', 'https://covers.openlibrary.org/b/id/11101220-L.jpg'),
  ('Letters from a Stoic', 'https://covers.openlibrary.org/b/id/103759-L.jpg'),
  ('The Republic', 'https://covers.openlibrary.org/b/id/14377522-L.jpg'),
  ('Nicomachean Ethics', 'https://covers.openlibrary.org/b/id/12593945-L.jpg'),
  ('Tao Te Ching', 'https://covers.openlibrary.org/b/id/662232-L.jpg'),
  ('The Myth of Sisyphus', 'https://covers.openlibrary.org/b/id/12726570-L.jpg'),
  ('Zen Mind, Beginner''s Mind', 'https://covers.openlibrary.org/b/id/7025011-L.jpg'),
  ('Steve Jobs', 'https://covers.openlibrary.org/b/id/12374726-L.jpg'),
  ('Shoe Dog', 'https://covers.openlibrary.org/b/id/8858487-L.jpg'),
  ('The Ride of a Lifetime', 'https://covers.openlibrary.org/b/id/8788773-L.jpg'),
  ('Becoming', 'https://covers.openlibrary.org/b/id/8824664-L.jpg'),
  ('Benjamin Franklin', 'https://covers.openlibrary.org/b/id/541092-L.jpg'),
  ('Leonardo da Vinci', 'https://covers.openlibrary.org/b/id/8087691-L.jpg'),
  ('Team of Rivals', 'https://covers.openlibrary.org/b/id/9286949-L.jpg'),
  ('The Lessons of History', 'https://covers.openlibrary.org/b/id/7240225-L.jpg'),
  ('The Silk Roads', 'https://covers.openlibrary.org/b/id/8963642-L.jpg')
) as covers(title, cover_url)
where books.title = covers.title;

-- Official reading paths for launch
insert into reading_paths (title, description, slug, created_by, is_official, created_at) values
('Startups 101','A practical path for understanding customers, products, traction, and founder judgment.','startups-101','11111111-1111-1111-1111-111111111111',true,'2026-06-24'),
('Personal Finance Starter Pack','A calm route through money behavior, independence, and long-term investing.','personal-finance-starter-pack','11111111-1111-1111-1111-111111111111',true,'2026-06-25'),
('Build Better Habits','A focused sequence for identity, attention, discipline, and sustainable routines.','build-better-habits','11111111-1111-1111-1111-111111111111',true,'2026-06-26'),
('Understand Human Psychology','A beginner-friendly path through bias, motivation, personality, and moral judgment.','understand-human-psychology','11111111-1111-1111-1111-111111111111',true,'2026-06-27'),
('Become a Better Communicator','Books for listening, persuasion, conflict, writing, and useful disagreement.','become-a-better-communicator','11111111-1111-1111-1111-111111111111',true,'2026-06-28')
on conflict (slug) do nothing;

with path_items(path_slug, book_title, order_index, note) as (
  values
  ('startups-101','The Lean Startup',1,'Start with experimentation and validated learning.'),
  ('startups-101','The Mom Test',2,'Then learn how to ask better customer questions.'),
  ('startups-101','Zero to One',3,'Move from process to original judgment.'),
  ('startups-101','Traction',4,'Add distribution thinking early.'),
  ('startups-101','The Hard Thing About Hard Things',5,'Finish with the reality of building through hard moments.'),
  ('personal-finance-starter-pack','The Psychology of Money',1,'Begin with behavior before tactics.'),
  ('personal-finance-starter-pack','Your Money or Your Life',2,'Clarify what money is actually for.'),
  ('personal-finance-starter-pack','The Simple Path to Wealth',3,'Simplify the investment path.'),
  ('personal-finance-starter-pack','The Little Book of Common Sense Investing',4,'Understand the case for broad, low-cost ownership.'),
  ('build-better-habits','Atomic Habits',1,'Start with small systems and identity.'),
  ('build-better-habits','The Power of Habit',2,'Understand cue, routine, and reward.'),
  ('build-better-habits','Essentialism',3,'Choose fewer things on purpose.'),
  ('build-better-habits','Deep Work',4,'Protect attention for meaningful work.'),
  ('build-better-habits','Make Time',5,'Turn focus into a repeatable day design.'),
  ('understand-human-psychology','Thinking, Fast and Slow',1,'Learn the language of fast and slow cognition.'),
  ('understand-human-psychology','Predictably Irrational',2,'See how irrational patterns show up in everyday decisions.'),
  ('understand-human-psychology','Mindset',3,'Study beliefs about learning and growth.'),
  ('understand-human-psychology','Quiet',4,'Understand temperament without stereotypes.'),
  ('understand-human-psychology','The Righteous Mind',5,'End with moral psychology and disagreement.'),
  ('become-a-better-communicator','How to Win Friends and Influence People',1,'Start with care and attention.'),
  ('become-a-better-communicator','Crucial Conversations',2,'Handle high-stakes conversations.'),
  ('become-a-better-communicator','Never Split the Difference',3,'Learn tactical listening.'),
  ('become-a-better-communicator','Nonviolent Communication',4,'Practice needs-based conversation.'),
  ('become-a-better-communicator','On Writing Well',5,'Make written ideas clearer.')
)
insert into reading_path_books (reading_path_id, book_id, order_index, note)
select rp.id, b.id, pi.order_index, pi.note
from path_items pi
join reading_paths rp on rp.slug = pi.path_slug
join books b on b.title = pi.book_title
on conflict (reading_path_id, book_id) do nothing;

insert into editorial_picks (title, description, target_type, target_id, week_start, order_index)
select
  'Five Discussions Worth Reading: ' || dp.title,
  'A high-signal starter discussion selected by BookSphere Team for the launch week.',
  'discussion_post',
  dp.id,
  date '2026-06-29',
  row_number() over (order by dp.created_at desc)
from discussion_posts dp
order by dp.created_at desc
limit 5
on conflict (week_start, order_index) do nothing;

insert into post_awards (user_id, discussion_post_id, award_type)
select p.id, dp.id, award_type
from discussion_posts dp
cross join lateral (values ('Changed My Thinking'), ('Practical Advice')) as awards(award_type)
join profiles p on p.username = 'community-starter'
order by dp.created_at desc
limit 20
on conflict (user_id, discussion_post_id, award_type) do nothing;

insert into saved_insights (user_id, discussion_post_id)
select p.id, dp.id
from discussion_posts dp
join profiles p on p.username = 'booksphere-team'
order by dp.created_at desc
limit 8
on conflict (user_id, discussion_post_id) do nothing;

insert into followed_discussions (user_id, discussion_post_id)
select p.id, dp.id
from discussion_posts dp
join profiles p on p.username = 'reader-ops'
order by dp.created_at desc
limit 8
on conflict (user_id, discussion_post_id) do nothing;
