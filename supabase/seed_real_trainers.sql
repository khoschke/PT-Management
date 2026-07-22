-- The five real Fitaz Gym PTs, from their corflutes. Run once in the Supabase
-- SQL editor to populate the roster instead of hand-entering each.
--
-- Everything here is editable afterwards in the app (Trainers screen).
--
-- PLEASE VERIFY BEFORE RUNNING:
--   * gender: used only for the "prefers a male/female trainer" match. Best
--     effort from names; confirm Shahd's especially. Change the word on the
--     line if needed, or fix it in the app later.
--   * availability: the corflutes don't state AM/PM, so everyone defaults to
--     'both'. Set real availability per trainer in the app.
--
-- Only run this if your Trainers list is currently EMPTY, or you'll get
-- duplicates (there's no automatic de-duplication on name).

insert into trainers (name, email, gender, availability, specialties, bio, active) values
  (
    'Dylan Heycox',
    'dylan@intntperformance.com',
    'male',
    'both',
    array['increase_strength', 'sports_conditioning', 'cardio_endurance'],
    'Sports performance, running performance, hybrid and endurance training. Helps runners and hybrid athletes get stronger, fitter and more capable through structured strength and conditioning.',
    true
  ),
  (
    'Julie Manners',
    'julie@fit365.net.au',
    'female',
    'both',
    array['reduce_body_fat', 'increase_muscle_mass', 'increase_strength', 'rehabilitation'],
    'Women''s health and working with older adults, 35+ years on the gym floor. Focus on the right movement, nutrition and rest to improve quality of life. Live long and strong.',
    true
  ),
  (
    'Shahd Herbert',
    'shahdherbert@gmail.com',
    'female', -- VERIFY: not certain of Shahd's gender
    'both',
    array['increase_muscle_mass', 'increase_strength', 'weight_loss', 'reshape'],
    'Physique training specialist, online tailored programs, nutrition guidance. Builds strong habits through structured accountability for lasting results.',
    true
  ),
  (
    'Karl Hoschke',
    'khoschke@gmail.com',
    'male',
    'both',
    array['increase_strength', 'rehabilitation'],
    'Builds long-term habits and quality of life, coaches all ages and abilities. Balanced, evidence-based exercise and behaviour change for sustainable health.',
    true
  ),
  (
    'Michael Hammett',
    'michael@puremomentum.com.au',
    'male',
    'both',
    array['increase_strength', 'increase_muscle_mass', 'reduce_body_fat', 'rehabilitation'],
    'Structured training programs and long-term consistency. Helps driven individuals build strength, improve performance and create lasting physical change.',
    true
  );
