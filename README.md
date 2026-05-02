<p align="center">
  <img src="src/app/favicon.ico" width="72" height="72" alt="The One Dollar Digest" />
</p>

# The One Dollar Digest

**AI-curated daily news for $1/month.**

The digest is meant to feel like a morning paper: a fixed set of important stories per day, rewritten in clear, no-bias language, with real sources and enough context to decide what to read next. Tech coverage spans the industry (AI, security, startups, policy, and more). Politics coverage groups stories by region and topic—grounded in what happened, not in angle or party line.

## How it works

1. **Each night (UTC)** an automated job runs two editorial workflows: one for tech, one for politics. Each workflow plans searches for that calendar day, gathers stories from the open web, and turns them into a structured batch (headlines, summaries, importance, tags, images where available, and extra context like regional focus), written in no-bias language.
2. **That batch is stored** as the official digest for that date. The website loads it by date and presents it as an editorial grid with a page per story (including share previews).
3. **Reading today is free.** Signing in unlocks more; a small subscription opens the full archive so you can browse past digests like flipping through old editions.

Developer setup, environment variables, and tooling: [CONTRIBUTING.md](./CONTRIBUTING.md).

The daily production run is defined in `.github/workflows/daily-digest.yml` (scheduled run plus manual trigger with optional date and category).
