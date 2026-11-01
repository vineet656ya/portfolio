# Vercel deployment

This source runs in two environments: the hosted Sites version uses D1, R2 and ChatGPT identity; Vercel uses Next.js, Supabase and a server-verified admin session. `next.config.ts` substitutes the platform adapter for Vercel. Data is not automatically copied between environments.

## Set up persistence and login

1. Create a Supabase project. Run `deployment/supabase.sql` in its SQL editor. This creates the content table and a **private** media bucket. Row-level security permits no browser access; all operations go through authenticated server routes.
2. Add the following environment variables to Vercel: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` and optionally `WEB3FORMS_ACCESS_KEY`. Do not prefix them with `NEXT_PUBLIC_`.
3. Run `node scripts/create-admin.mjs` in a terminal to create the password hash and random session secret. Enter a password with at least 12 characters. Paste the generated values directly into Vercel's protected environment-variable settings. Do not commit the output.
4. Import the source repository into Vercel. The supplied `vercel.json` selects Next.js and `npm run build:vercel`. Node 22 or later is required.
5. Deploy, open `/admin`, and sign in with `ADMIN_EMAIL` and the password you selected. New content is stored in Supabase and appears without another deployment.

## Contact delivery

Obtain a real access key from Web3Forms registered to `admin@example.com`. The prompt's `svg` value is not an access key. Configure the key as `WEB3FORMS_ACCESS_KEY` or in the authenticated studio. The UI reports success only after Web3Forms confirms success. Until configured, the public page offers a direct email link.

## Content workflow

The studio supports all supplied collections plus custom sections. Create an item, upload images, save as draft, open **Preview drafts**, and publish. Optional sections and navigation links appear only when eligible published content exists. Each collection can also be disabled without deleting records.

The dedicated **Profile photo** studio uploads and publishes your portrait immediately to the hero and About sections. The profile editor manages name, biography, titles, location, CGPA, social URLs, profile photo, resume PDF and current learning. Project editors include problem, solution, contribution, architecture, challenges, learnings, technologies, repository and demo links. Gallery covers are the first image; move images into position in the editor. Documents and draft images require authorization unless referenced by published content.

CGPA is initialized as 0.00 because the later education instruction overrides the opening 0.00 value. Change it in Profile if needed. No projects, awards, hackathons, social URLs or photos are invented. The supplied education, EBC leadership and skill categories are initialized on first backend access.

## Migration and backup

Export JSON from Settings. Exports exclude credentials and the form key. JSON includes media **references**, not file binaries. Download files separately from the Media library before migrating. Import previews its counts, preserves existing item IDs, adds new items as drafts and restores profile and visibility settings. References to unavailable files are dropped; reupload and attach the actual files.

## Security and operational notes

Vercel uses an eight-hour, signed, HTTP-only, Secure, SameSite=Strict session. Mutations enforce same-origin requests; every administrative operation checks the session server-side. Passwords use PBKDF2-SHA256 with 210,000 iterations and a random salt. Login and contact have persistent rate counters. Uploads are limited to 4 MB and validate file signatures; SVG, HTML and executable files are rejected. Responses never expose a Supabase secret key or session secret. The Supabase service role is server-only.

The hosted Sites deployment uses platform identity and `ADMIN_EMAIL` to authorize studio access. Keep the preview owner-private until you're ready to share it. On Vercel the public portfolio is anonymous, while `/admin` requires your password.

`public/images/` and `public/resume/` retain the requested asset organization. Production administrative uploads use durable backend storage, not these development directories. Missing `/profile.png` and `/resume.pdf` are never requested. Upload them through the studio to enable their UI.

The GitHub link is editable. Automated GitHub metrics are not enabled and no statistics are fabricated. You can publish verified DSA statistics through the corresponding collection.

## Hidden admin

The public footer and navigation do not link to the studio. Bookmark `/admin` yourself. The admin page has noindex/nofollow metadata and every edit endpoint still requires authentication. Hiding the link is separate from access protection.
