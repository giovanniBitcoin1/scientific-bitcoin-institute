# Insights — authoring guide

Technical instructions for publishing in the three Insights series. One piece
is one markdown file; committing it to `main` publishes it.

| Series | Folder | File name | URL |
|---|---|---|---|
| SBI Dispatch | `src/content/dispatch/` | `NNN-short-title.md` | `/insights/dispatch/NNN-short-title` |
| The Lens | `src/content/lens/` | `YYYY-MM-DD-short-title.md` | `/insights/lens/YYYY-MM-DD-short-title` |
| Explainers | `src/content/insights/` | `short-title.md` | `/insights/short-title` |

The file name without `.md` is the address: lowercase letters, digits and
hyphens only. It cannot change after publication without breaking links.
Files starting with `_` (the templates) are ignored.

## Add a Dispatch issue

1. Copy `src/content/dispatch/_template.md` to `NNN-short-title.md`, where
   `NNN` is the issue number with leading zeros (`003`). It must equal `number`.
2. Fill in the header:

   | Field | Required | Meaning |
   |---|---|---|
   | `number` | yes | Issue number, a whole number |
   | `title` | yes | At most 90 characters |
   | `summary` | yes | At most 200 characters; shown on cards, in previews and in search results |
   | `date` | yes | `YYYY-MM-DD` |
   | `status` | yes | `draft` or `published` |
   | `email` | yes | `none`, `draft` or `scheduled` (see "Email") |
   | `authors` | yes | Text |
   | `send_at` | when `email: scheduled` | Date and time **with offset**: `2026-12-03T08:30:00+01:00` |
   | `subject` | no | Email subject; default `SBI Dispatch No. N · <title>` |
   | `tags` | no | `[security, mining]` |
   | `share_image` | no | File name of a 1200x630 PNG or JPEG in the media folder |
   | `lens` | no | File name (without `.md`) of the Lens piece this issue features |
   | `claim` | no | See "Claims" |

3. Write the issue. Each `## Heading` becomes an entry of the table of contents.
4. Put images in `public/insights-media/dispatch/NNN-short-title/`.
5. Run `npm run validate`, then commit.

## Add a Lens piece

1. Copy `src/content/lens/_template.md` to `YYYY-MM-DD-short-title.md`. The
   date in the name must equal `date`.
2. Header:

   | Field | Required | Meaning |
   |---|---|---|
   | `title` | yes | At most 90 characters |
   | `summary` | yes | At most 200 characters |
   | `date` | yes | `YYYY-MM-DD` |
   | `facts_as_of` | yes | Date and time with offset; shown as "Facts as of …" |
   | `status` | yes | `draft` or `published` |
   | `instrument` | yes | Which SBI instrument is applied, in a few words |
   | `sources` | when published | At least two; at least one `kind: primary`; each with `title`, an `https://` `url`, and `kind` (`primary` or `secondary`) |
   | `dek` | no | One-line subtitle |
   | `tags`, `share_image`, `claim` | no | As for a Dispatch issue |
   | `updates` | no | See below |
   | `dispatch` | no | Number of the issue that features this piece |

3. Images go in `public/insights-media/lens/YYYY-MM-DD-short-title/`.

Times are shown exactly as written, with their offset. They are never
converted to the reader's time zone.

### Add an update to a Lens piece

Edit the file and add an entry to `updates`; change the text as needed.

```yaml
updates:
  - at: 2026-12-02T09:00:00+01:00
    note: "What changed."
```

The page then shows "Updated <date>" near the top and the list of updates,
newest first. The feed, the sitemap and `article:modified_time` take the latest
`at`. Do not change `date` or the file name.

## Claims

A checkable statement, listed on `/insights/on-the-record` (the page and its
link on the hub exist only while at least one claim does).

```yaml
claim:
  text: "The statement."
  made: 2026-12-03
  check_by: 2027-12-31   # optional
  status: open           # open | held | failed
  note: ""
```

## Markdown conventions

- GitHub-flavoured markdown: tables, lists, links, `**bold**`, `*italic*`.
- Images: `![alt text](images/file.png "optional caption")`. The file goes in
  the piece's media folder; the alt text is mandatory. The published URL,
  `/insights-media/<series>/<file name>/file.png`, never changes, because
  emails link to it.
- Display formulas: a ```` ```math ```` fence holding plain Unicode text
  (`P(t) = A · t^β`). No LaTeX.
- `> a blockquote` is shown as a callout box.
- HTML is not accepted, except `<sub>` and `<sup>`.
- A link starting with `/` is a link inside the site.

Explainers keep their own, older header (see
`src/content/insights/_template.md`) and their images next to the file, in
`src/content/insights/<file name>/`.

## Preview

```
npm run dev          # the site as visitors see it: drafts are absent
npm run dev:drafts   # drafts included, each marked with a red DRAFT ribbon
```

Drafts are never in a build: not their text and not their file name. (For an
Explainer marked `status: draft` the text is left out but the file name is
still present in the bundle.) The repository is public, so a committed draft
can be read there: commit a draft only if that is acceptable.

## What the validator checks

`npm run validate` runs first in `npm run build`. Any error fails the build, so
a malformed file is never published. It checks every file, drafts included:

- the header is readable and has the required fields, of the right type;
- title at most 90 characters, summary at most 200;
- dates are real days; times carry an offset;
- the file name agrees with `number` (Dispatch) or `date` (Lens);
- no two pieces share an address; no two issues share a number (a gap in the
  numbering is only a warning);
- an Explainer is not called `dispatch`, `lens`, `feed`, `on-the-record` or
  `subscribe`;
- every image exists and has alt text; `share_image` exists and is exactly
  1200x630;
- a published Lens piece has two sources, one primary, all `https://`;
- `email: scheduled` has `send_at`;
- a published file contains none of `TODO`, `TK`, `[CHECK]`, `lorem`, `XXX`;
- `lens` and `dispatch` point to existing pieces (and a published piece does
  not point to a draft);
- no HTML other than `<sub>` and `<sup>`;
- a header field the series does not use is reported as a warning.

Each message names the file and says what to change. To test the validator
itself: `npm run validate -- --self-test`.

## The build

`npm run build` is the whole pipeline:

1. `npm run validate`;
2. `vite build`;
3. `node scripts/newsroom/postbuild.mjs`: one HTML file per Insights address
   (title, description, canonical link, share preview, readable text), redirect
   pages for the old newsletter addresses, `insights/feed.xml`, `sitemap.xml`.

After a build: `npm run check:dist` checks the result;
`scripts/newsroom/browser-checks/` opens every page in a browser (see its
README).

A piece without `share_image` is shared with `public/og/default.png` (an
Explainer with its hero image).

## Email

Only SBI Dispatch is emailed. The Lens and Explainers never are.

When a push to `main` **adds** an issue file with `status: published` and
`email` other than `none`, the workflow "SBI Dispatch email" creates the email
in Buttondown. Editing an existing file never creates one.

| `email` in the file | `DISPATCH_EMAIL_MODE` variable | Result |
|---|---|---|
| `none` | any | no email |
| `draft` | any | a **draft** in Buttondown; review and send it there |
| `scheduled` | not `scheduled` | a **draft** |
| `scheduled` | `scheduled` | **scheduled** for `send_at` |

- If `send_at` is less than two hours away the email is created as a draft
  instead, and the job summary says so.
- The workflow never sends immediately.
- If an email with the same subject already exists, nothing is done.
- The email links to the web page, which the deploy publishes a few minutes
  after the push: leave more than that between the push and `send_at`.

To see the email without touching Buttondown:

```
node scripts/newsroom/build-email.mjs src/content/dispatch/003-short-title.md
```

To run the workflow by hand: Actions → "SBI Dispatch email" → "Run workflow",
with the file path, a mode and "dry run" (prints the request, calls nothing).
A manual run can lower the mode to draft; it cannot schedule a file that the
table above makes a draft.

Tests (no network): `npm run test:email`.

## To configure on GitHub

Repository → Settings → Secrets and variables → Actions.

| Kind | Name | Value |
|---|---|---|
| Secret | `BUTTONDOWN_API_KEY` | The API key from Buttondown (Settings → API). Without it the workflow ends successfully with a notice and creates nothing. |
| Variable | `DISPATCH_EMAIL_MODE` | `draft` (or unset) or `scheduled` |

The "Data collector" workflow needs no configuration: it uses the token GitHub
gives every workflow run. See `scripts/data/README.md`.
