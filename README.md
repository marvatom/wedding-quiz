# Wedding Quiz

A fully static wedding quiz app. Guests scan a QR code at their table, answer one question, and instantly see whether they were right — no backend, no sign-in, nothing to install.

Live at: **https://marvatom.github.io/wedding-quiz/**

---

## How it works

Each question gets its own URL derived from a salted hash of a stable question `id`. You print one QR code per question (e.g. one per table), guests scan it, pick an answer, and get immediate feedback. Questions and answers are never shared between pages — guests can only see the one question their QR code points to.

---

## Configuring questions

Edit **`src/_data/questions.yaml`**. Each question needs a stable integer `id`, a stem (the question text), a list of choices, and at least one choice marked `correct: true`.

```yaml
questions:
  - id: 1
    stem: "How did the couple first meet?"
    choices:
      - text: "At a coffee shop"
        correct: true
      - text: "At a party"
        correct: false
      - text: "Through mutual friends"
        correct: false
      - text: "Online dating"
        correct: false

  - id: 2
    stem: "In which city did they go on their first date?"
    choices:
      - text: "Prague"
        correct: true
      - text: "Vienna"
        correct: false
      - text: "Brno"
        correct: false
      - text: "Budapest"
        correct: false
```

**Important:** The URL for each question is derived from `id` (SHA-256 of a fixed salt + the id, first 8 characters), not from the stem. Editing the `stem` or `choices` is always safe — it never changes the URL. **Never change an `id`** once its QR code is printed; to add a new question, use the next unused integer.

---

## Getting QR codes

### Printable sheet (recommended)

Generates a single local HTML file with a ready-to-print QR code for every question:

```bash
npm install        # first time only
npm run qr-sheet    # writes qr-codes/qr-sheet.html
```

Open `qr-codes/qr-sheet.html` in a browser and print it (or save as PDF). Each card shows the QR code, the question id, and the question text for your own reference while placing cards at tables.

This file is **not** part of the deployed site and is gitignored (`qr-codes/`) — it lists every question's URL on one page, which would let a guest walk the whole quiz if it were published. Regenerate it locally whenever you add questions or change the salt.

### Raw URLs only

If you just want the URLs (e.g. to feed into your own QR generator), run:

```bash
npm run qr-urls
```

Example output:

```
Q1 [4060cbce]: https://marvatom.github.io/wedding-quiz/q/4060cbce/
Q2 [839c5842]: https://marvatom.github.io/wedding-quiz/q/839c5842/
```

---

## Deploying

Push to `main` — the GitHub Actions workflow builds and deploys automatically:

```bash
git add src/_data/questions.yaml
git commit -m "update questions"
git push
```

The workflow (`npm install && npm run build`) runs on every push to `main` and publishes the result to GitHub Pages. Deployment typically takes 1–2 minutes.

To check the status of a deployment, visit the **Actions** tab on GitHub:
https://github.com/marvatom/wedding-quiz/actions

---

## Where the site is hosted

**https://marvatom.github.io/wedding-quiz/**

- Root (`/wedding-quiz/`) — landing page shown to guests who land without a QR code
- `/wedding-quiz/q/<hash>/` — individual question pages, one per question

---

## Local development

```bash
npm install       # install dependencies
npm run dev       # build and serve locally with live reload (http://localhost:8080)
npm run build     # one-off build to dist/
```

---

## Notes

- **Correct answers are in the page source.** The answer validation is client-side, so a guest who inspects the HTML can find the correct answer. The opaque URL hash prevents someone from walking all questions, but it is not a security mechanism. This is an accepted tradeoff for a fully static app.
- **Changing a question's `id` invalidates its QR code.** The URL is a salted hash of the `id`, not the stem — stem/choice edits are always safe, but reprint the code if you ever change an id.
- **No data is collected.** Guest answers are not sent anywhere and nothing persists between sessions.
