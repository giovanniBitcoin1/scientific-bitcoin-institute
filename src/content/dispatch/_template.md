---
number: 0
title: "Title of the issue, at most 90 characters"
subject: "Dispatch No. 0 · Title of the issue"   # email subject, optional
summary: "One or two sentences, at most 200 characters."
date: 2026-01-01
status: draft            # draft | published
email: none              # none | draft | scheduled
send_at: 2026-01-01T08:30:00+01:00   # required when email is scheduled
authors: "Scientific Bitcoin Institute"
tags: [tag]
share_image: share.png   # optional, 1200x630, in public/insights-media/dispatch/<file name>/
lens: 2026-01-01-file-name-of-the-lens-piece   # optional
claim:                   # optional
  text: "The checkable statement of the issue."
  made: 2026-01-01
  check_by: 2026-12-31   # optional
  status: open           # open | held | failed
  note: ""
---

Copy this file to `NNN-short-title.md` (NNN = the issue number, zero-padded),
delete the optional lines you do not use, and write the issue below. How to:
docs/newsroom/authoring.md.

## A section

Each `##` heading becomes an entry of the table of contents.

![What the image shows](images/chart.png "Optional caption")

> A blockquote is shown as a callout box.

```math
P(t) = A · t^β
```
