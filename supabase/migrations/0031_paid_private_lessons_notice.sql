-- Private 1:1 lessons became paid (group circles stay free). New bookings
-- see this in the booking flow, but existing students — especially those
-- who already had private lessons booked — need to be told too. This posts
-- a one-time announcement to every student's notices page.
--
-- Guarded by title so re-running the migration doesn't post it twice.
--
-- Run this in the Supabase SQL Editor after 0001-0030.

insert into public.notices (title, body, audience)
select
  'تحديث: الحصص الفردية أصبحت مدفوعة',
  'نودّ إعلامكم بأن الحصص الفردية (الطالب والمعلم فقط) أصبحت مدفوعة، ويشمل ذلك الحصص المحجوزة مسبقًا. أما الحلقات الجماعية فتبقى مجانية بالكامل كما هي. لا يتم أي دفع عبر الموقع أو التطبيق؛ لمعرفة السعر وطرق الدفع تواصلوا مع إدارة المنصة عبر واتساب على الرقم ‎+970567841689، أو مع معلمكم مباشرة. جزاكم الله خيرًا.',
  'students'
where not exists (
  select 1 from public.notices where title = 'تحديث: الحصص الفردية أصبحت مدفوعة'
);
