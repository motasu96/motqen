-- Adds the English specialties column (0001 only had the Arabic one), and
-- seeds the two teachers that were previously hard-coded in data/teachers.ts
-- so the public /teachers pages don't go empty when they switch to reading
-- from this table.
--
-- Run this in the Supabase SQL Editor after 0001_init.sql.

alter table public.teachers add column specialties_en text[] not null default '{}';

insert into public.teachers
  (slug, name, name_en, title, title_en, bio, bio_en, avatar_url, gender, specialties, specialties_en, years_experience, students_count, completed_sessions, rating, status)
values
  (
    'abdullah-alsalmi',
    'أ. عبدالله السلمي', 'Ust. Abdullah Al-Salmi',
    'معلم قرآن كريم', 'Quran Teacher',
    'معلم قرآن كريم بخبرة تزيد عن 10 سنوات في مجال تعليم القرآن الكريم والتجويد، لديه إسناد متصل وعمل بمعظم المنابر التعليمية المعتمدة.',
    'A Quran teacher with over 10 years of experience in teaching the Holy Quran and Tajweed, holding a connected chain of transmission (Ijazah) and having worked with most accredited teaching platforms.',
    '/images/teacher-male.jpg',
    'male',
    array['التحفيظ', 'التجويد', 'التلاوة', 'المراجعة'],
    array['Memorization', 'Tajweed', 'Recitation', 'Review'],
    10, 1200, 4500, 4.9, 'active'
  ),
  (
    'fatima-alzahrani',
    'أ. فاطمة الزهراني', 'Ust. Fatima Al-Zahrani',
    'معلمة قرآن كريم', 'Quran Teacher',
    'معلمة متخصصة في تعليم القرآن الكريم للنساء والأطفال، حاصلة على إجازة في القراءات العشر وخبرة 8 سنوات في التحفيظ عن بُعد.',
    'A teacher specialized in teaching the Holy Quran to women and children, holding an Ijazah in the Ten Readings and with 8 years of experience in remote memorization instruction.',
    '/images/teacher-female.jpg',
    'female',
    array['برامج النساء', 'براعم متقن', 'التجويد'],
    array['Women''s Programs', 'Motqen Kids', 'Tajweed'],
    8, 950, 3200, 4.8, 'active'
  );
