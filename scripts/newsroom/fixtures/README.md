# Validator fixtures

Test data for `npm run validate -- --self-test`. Nothing here is real content
and nothing here is ever built into the site: every text carries the marker
`NEWSROOM-FIXTURE`, and `npm run check:dist` fails if that marker shows up in
`dist/`.

- `valid/` is a small, correct content tree (same layout as the repo:
  `src/content/…`, `public/insights-media/…`). It must pass with no error and
  no warning.
- `cases.json` lists the failing cases. Each one copies `valid/` to a temporary
  folder, changes it in one way (`edit`, `write`, `copy`, `rename`, `delete`)
  and names the error codes that change must produce: exactly those.
- `valid/assets/` holds the wrong-size images some cases copy into place.

When a rule is added to `scripts/newsroom/validate.mjs`, add a case: the
self-test fails while any error code has no case.

The images are solid-colour PNG and JPEG files (1200x630 for the correct share
images, 600x315 for the wrong ones), generated once.
