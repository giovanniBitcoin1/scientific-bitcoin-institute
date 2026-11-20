---
title: "Title of the piece, at most 90 characters"
dek: "Optional one-line subtitle."
summary: "At most 200 characters."
date: 2026-01-01
facts_as_of: 2026-01-01T12:00:00+01:00
status: draft            # draft | published
instrument: "Which SBI instrument is applied, in a few words"
tags: [tag]
share_image: share.png   # optional, 1200x630, in public/insights-media/lens/<file name>/
sources:                 # at least two, at least one primary
  - title: "Title of the source"
    url: https://example.org/primary
    kind: primary        # primary | secondary
  - title: "Title of the source"
    url: https://example.org/secondary
    kind: secondary
updates:                 # optional; add one each time the piece changes
  - at: 2026-01-02T09:00:00+01:00
    note: "What changed."
dispatch: 0              # optional: number of the issue that features this piece
claim:                   # optional
  text: "The checkable statement of the piece."
  made: 2026-01-01
  check_by: 2026-12-31   # optional
  status: open           # open | held | failed
  note: ""
---

Copy this file to `YYYY-MM-DD-short-title.md` (the same day as `date`), delete
the optional lines you do not use, and write the piece below. How to:
docs/newsroom/authoring.md.

## What is confirmed

## What is only reported

## What the instrument shows

## What it cannot show
