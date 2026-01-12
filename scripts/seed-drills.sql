-- Seed fluency exercises for the Intelligence Layer
INSERT INTO fluency_exercises (id, weakness_tag, prompt, difficulty) VALUES
(gen_random_uuid(), 'HESITATION', 'Speak for 60 seconds about your favorite hobby without pausing for more than 2 seconds.', 'Beginner'),
(gen_random_uuid(), 'HESITATION', 'Describe your morning routine in detail, focusing on continuous flow.', 'Intermediate'),
(gen_random_uuid(), 'SPEED', 'Read this paragraph aloud, trying to maintain a steady pace of 130 words per minute.', 'Beginner'),
(gen_random_uuid(), 'SPEED', 'Summarize a recent news article in under 1 minute.', 'Advanced'),
(gen_random_uuid(), 'GRAMMAR', 'Describe what you did yesterday using only past tense verbs.', 'Intermediate'),
(gen_random_uuid(), 'GRAMMAR', 'Explain your future career plans using ''going to'' and ''will'' correctly.', 'Intermediate'),
(gen_random_uuid(), 'CONFIDENCE', 'Give a 30-second speech on why you deserve a promotion.', 'Advanced'),
(gen_random_uuid(), 'CONFIDENCE', 'Introduce yourself to a stranger in a professional setting.', 'Beginner'),
(gen_random_uuid(), 'PASSIVITY', 'Debate this topic: ''Technology does more harm than good'' for 2 minutes.', 'Advanced');
