-- Five placeholder trainers so the app can be clicked through immediately.
-- Replace with the real roster from the admin trainer roster screen.

insert into trainers (name, email, gender, specialties, availability, active) values
  ('Jordan Blake', 'jordan.blake@example.com', 'male', array['build_muscle', 'get_stronger', 'sport_event'], 'AM', true),
  ('Casey Nguyen', 'casey.nguyen@example.com', 'female', array['lose_fat', 'general_fitness', 'consistent_routine'], 'PM', true),
  ('Sam Whitfield', 'sam.whitfield@example.com', 'male', array['move_better', 'reduce_stress', 'general_fitness'], 'both', true),
  ('Priya Anand', 'priya.anand@example.com', 'female', array['build_muscle', 'get_stronger', 'consistent_routine'], 'both', true),
  ('Riley Cooper', 'riley.cooper@example.com', 'male', array['lose_fat', 'sport_event', 'move_better'], 'AM', true);
