insert into public.knowledge_posts (id, user_id, title, body, topic, reference_title, created_at)
values
  (
    'f45b584a-7794-4a9d-be44-64cb9f58e7fc',
    '11111111-1111-1111-1111-111111111111',
    'A good mental model should make one decision easier today',
    'The best notes are not impressive. They are reusable. Before saving a lesson, ask where it will help you notice, choose, or act differently. A strong knowledge note should make tomorrow''s decision easier, not just make today''s highlight collection bigger.',
    'Mental Models',
    'Thinking, Fast and Slow',
    '2026-06-25T12:00:00Z'
  ),
  (
    'a8e5ad6c-59d7-4bc0-9958-2b20043a6bc9',
    '22222222-2222-2222-2222-222222222222',
    'Reading groups work better when disagreement is welcomed early',
    'If everyone waits until the end to challenge an idea, the discussion becomes polite summary. Bring the useful tension forward. The highest-quality reading groups ask where the book breaks, where it works, and what someone would actually do differently.',
    'Communication',
    'Crucial Conversations',
    '2026-06-24T12:00:00Z'
  ),
  (
    'f0ea8a54-e182-4497-ad52-43e0961c48ab',
    '11111111-1111-1111-1111-111111111111',
    'The smallest useful book note starts with next time',
    'A highlight captures the author. An application captures your future behavior. That shift is where a reading habit starts becoming a thinking system. If a note cannot change a meeting, habit, purchase, conversation, or decision, it probably needs one more pass.',
    'Productivity',
    'Atomic Habits',
    '2026-06-22T12:00:00Z'
  )
on conflict (id) do update set
  title = excluded.title,
  body = excluded.body,
  topic = excluded.topic,
  reference_title = excluded.reference_title;
