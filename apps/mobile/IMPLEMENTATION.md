# Mobile design integration — first delivery

Applies the reviewed cream/gold student interface to the existing Expo app.

- Login uses the website's original logo at 160 logical pixels, centered Arabic welcome text, password visibility, and the existing Supabase sign-in and role routing.
- Password recovery sends through Supabase and continues on the existing website `/reset-password` page. The project's existing redirect allowlist must include that URL. There is no new native recovery-token handler.
- The student tab bar contains Home, My Lessons, and Account. Existing Programs and Groups routes remain available from Study and My Lessons.
- Home prioritizes the next booking and keeps the existing memorization plan, primary teacher room, homework, and paid-lesson notice. Study links to every existing student tool.
- My Lessons has Upcoming/Past tabs, the existing individual and group history, attendance, grades and notes, booking entry, room entry and confirmed cancellation. The old `/lessons` URL remains valid.
- Account scrolls on smaller screens, edits the signed-in user's `profiles.full_name`, and preserves theme, contact, version, logout and account deletion. Privacy and Terms links are accessible here.

## Validation

- `npm run typecheck`: passed.
- ESLint on changed/new screen and component files: passed.
- `expo export --platform android --platform ios --output-dir dist`: passed for both platforms, including the bundled original logo. Export validation used dummy Supabase environment values; those bundles are not for release.
- Full `npm run lint`: currently reports pre-existing errors in the teacher/admin layout factories, teacher groups, BookingCalendar and PulseBadge. These files were not changed by this delivery. No lint rules were disabled to hide these findings.

## Before device testing or release

Use the existing project's `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in a local environment or EAS environment. No credentials are included with this change. Test student/teacher/admin login, recovery email and redirect, name persistence across screens, booking/cancellation, history refresh, keyboard and safe areas, dark mode, and real Jitsi camera/microphone behavior on Android and iPhone.

This delivery does not redesign the teacher/admin interfaces, replace the Jitsi WebView with mock media controls, run database migrations, submit store builds, or publish an OTA update.
