# Wedding Quiz

A fully static wedding quiz app. Guests scan a QR code at their table, answer one question, and instantly see whether they were right — no backend, no sign-in, nothing to install.

Live at: **https://marvatom.github.io/wedding-quiz/**

---

## How it works

Each question gets its own URL derived from a hash of the question text. You print one QR code per question (e.g. one per table), guests scan it, pick an answer, and get immediate feedback. Questions and answers are never shared between pages — guests can only see the one question their QR code points to.

---

## Configuring questions

Edit **`src/_data/questions.yaml`**. Each question needs a stem (the question text), a list of choices, and at least one choice marked `correct: true`.

```yaml
questions:
  - stem: "How did the couple first meet?"
    choices:
      - text: "At a coffee shop"
        correct: true
      - text: "At a party"
        correct: false
      - text: "Through mutual friends"
        correct: false
      - text: "Online dating"
        correct: false

  - stem: "In which city did they go on their first date?"
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

**Important:** The URL for each question is derived from the question stem (SHA-256, first 8 characters). If you change the wording of a stem, the URL changes and any printed QR codes for that question become invalid and must be reprinted.

---

## Getting QR code URLs

After editing `questions.yaml`, run:

```bash
npm install        # first time only
npm run build      # generates the site
npm run qr-urls    # prints the URL for every question
```

Example output:

```
How did the couple first meet?
  → https://marvatom.github.io/wedding-quiz/q/4060cbce/

In which city did they go on their first date?
  → https://marvatom.github.io/wedding-quiz/q/839c5842/
```

Feed each URL into any QR code generator (e.g. qr-code-generator.com, or `qrencode` on the command line) and print one code per question. Place them at tables, on place cards, or wherever guests will scan them.

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
- **Changing a question stem invalidates its QR code.** The URL is a hash of the stem text. Reprint affected codes after any stem change.
- **No data is collected.** Guest answers are not sent anywhere and nothing persists between sessions.
