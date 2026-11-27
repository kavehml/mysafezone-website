# My Safe Zone team maintenance

When a therapist is added to or removed from the My Safe Zone team, update `data/team.json` and run `python3 scripts/build-team.py`. This generates every homepage card, every `/team/` profile, and the `/community/` portraits, counts and practitioner cards together. Commit both generated pages with the data change. Do not maintain a separate featured-only roster or edit generated cards directly.

Use verified public professional names, actual designations, current approved biographies, photos and individual Jane staff IDs. Confirm required onboarding is complete before publishing newly hired practitioners, following the Pneuma Health workspace handoff. Never infer onboarding completion from a Jane listing. The November 22 directory mirrors the existing public My Safe Zone roster explicitly requested by the owner; this is not onboarding approval for future hires.

The generator is intentionally offline and does not automatically publish every future Jane record. Review data before running it. Matching data in `script.js` has separate age/topic requirements: review it in the same onboarding update, using confirmed scope rather than inferring child eligibility from a generic biography.

Verify that homepage card IDs match team profile IDs, all portraits load, Jane links point to the correct practitioner, and both mobile and desktop layouts work. Add new public routes to `sitemap.xml`.
