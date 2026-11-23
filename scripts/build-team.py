"""Render both public team surfaces from reviewed data/team.json. No network access."""
import json, re
from pathlib import Path
from html import escape as esc
ROOT = Path(__file__).resolve().parents[1]
team = json.loads((ROOT / 'data/team.json').read_text())
assert len({t['id'] for t in team}) == len(team), 'Duplicate practitioner IDs'
for t in team:
    assert all(t.get(k) for k in ('id','name','credential','photo','languages','bio'))
    assert (ROOT / t['photo'].lstrip('/')).is_file(), t['photo']
    if t.get('janeUrl'):
        assert t['janeUrl'].endswith('/staff_member/' + str(t['id']))
    else:
        assert t.get('contactUrl', '').startswith('mailto:info@pneumahealth.ca')
def image(t):
    return f'<img src="{esc(t["photo"])}" width="400" height="520" loading="lazy" alt="{esc(t["name"])}">'
def card(t):
    url=f'/team/#therapist-{t["id"]}'
    return f'''<article class="therapist-card"><a class="therapist-photo-link" href="{url}" aria-label="Read {esc(t['name'])}'s profile">{image(t)}</a><div><h3><a href="{url}">{esc(t['name'])}</a></h3><p class="therapist-credential">{esc(t['credential'])}</p><p class="match-small">{esc(', '.join(t['languages']))}</p><a class="button button-primary" href="{url}">Read profile<span class="sr-only"> for {esc(t['name'])}</span> →</a></div></article>'''
def profile(t):
    paragraphs=''.join('<p>'+esc(p.strip())+'</p>' for p in t['bio'].split('\n') if p.strip())
    booking_url = t.get('janeUrl') or t['contactUrl']
    booking_label = 'View times &amp; book in Jane' if t.get('janeUrl') else 'Ask about an appointment'
    fees = '<p class="team-fees">'+esc(t['fees'])+'</p>' if t.get('fees') else ''
    return f'''<article class="team-profile" id="therapist-{t['id']}" aria-labelledby="name-{t['id']}">{image(t)}<div><h2 id="name-{t['id']}">{esc(t['name'])}</h2><p class="therapist-credential">{esc(t['credential'])}</p><p class="team-languages">Languages: {esc(', '.join(t['languages']))}</p>{paragraphs}{fees}<a class="button button-primary" href="{esc(booking_url)}" target="_blank" rel="noopener">{booking_label}<span class="sr-only"> with {esc(t['name'])}</span> →</a><p class="match-small"><a href="#team-directory">Back to the team ↑</a></p></div></article>'''
home=ROOT/'index.html';s=home.read_text()
start='<!-- TEAM CARDS START -->';end='<!-- TEAM CARDS END -->'
if start not in s:
    s,n=re.subn(r'(<section class="therapist-intro".*?<div class="therapist-grid">).*?(</div><div class="therapist-links">)',lambda m:m[1]+start+end+m[2],s,count=1,flags=re.S);assert n==1
s=re.sub(start+'.*?'+end,lambda _:start+'\n'+'\n'.join(map(card,team))+'\n'+end,s,flags=re.S)
s=s.replace('Meet a few of our therapists.','Meet our team.')
s=s.replace('href="https://pneumahealth.janeapp.com/locations/my-safe-zone/book#/team" target="_blank" rel="noopener">Explore the whole team →','href="/team/">Explore the whole team →')
s=s.replace('href="#meet-therapists"\n        >Meet Therapists','href="/team/"\n        >Our Team')
s=s.replace('/styles.css?v=20261122-therapists','/styles.css?v=20261122-full-team')
home.write_text(s)
page='''<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Meet Our Team | My Safe Zone</title><meta name="description" content="Meet the My Safe Zone team. Read practitioner profiles, explore languages and approaches, and book directly with your chosen practitioner in Jane."><link rel="canonical" href="https://mysafezone.ca/team/"><meta property="og:title" content="Meet Our Team | My Safe Zone"><meta property="og:description" content="Find a connection that feels right. Meet our team and explore their approaches to care."><meta property="og:url" content="https://mysafezone.ca/team/"><meta property="og:type" content="website"><link rel="stylesheet" href="/styles.css?v=20261122-full-team"><link rel="icon" href="/assets/mysafezone-safety-mark.svg"><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Newsreader:wght@500;600&amp;display=swap" rel="stylesheet"></head><body><header class="site-header guide-header team-header"><a class="brand" href="/"><img class="brand-mark" src="/assets/mysafezone-safety-mark.svg" alt="" width="64" height="64"><span class="brand-name">My Safe Zone</span></a><nav aria-label="Primary navigation"><a class="nav-link" href="/">Home</a><a class="nav-link" href="/#booking-help">Ask for help</a><a class="header-cta" href="https://pneumahealth.janeapp.com/locations/my-safe-zone/book#/discipline/1/treatment/20">See times</a></nav></header><main class="team-page"><section class="team-heading" id="team-directory"><p class="eyebrow">A connection that feels right</p><h1>Meet our team.</h1><p>There is more than one way to feel supported. Get to know the people behind My Safe Zone, explore their approaches, and choose someone you would like to meet.</p><p>Psychotherapy sessions are $99 CAD for 60 minutes. Dietitian sessions are $99 CAD for 60 minutes or $60 CAD for 30 minutes. Confirm fit, availability and eligibility for your location with your chosen practitioner. Insurance coverage depends on their designation and your plan.</p><nav class="team-directory" aria-label="Find a team member">'''
page+=''.join(f'<a href="#therapist-{t["id"]}">{esc(t["name"])}</a>' for t in team)
page+='</nav></section>'+''.join(map(profile,team))+'''<section class="team-help"><h2>Not sure who to choose?</h2><p>Our team can help you explore your options.</p><a class="button button-secondary" href="/#booking-help">Ask our team for help →</a></section></main><footer class="site-footer"><div class="footer-brand"><strong>My Safe Zone</strong><span>The affordable care program of <a href="https://pneumahealth.ca">Pneuma Health</a>.</span></div><div class="footer-contact"><a href="/">Back to My Safe Zone</a><a href="mailto:info@pneumahealth.ca">info@pneumahealth.ca</a><a href="tel:+16475472323">(647) 547-2323</a></div><p>My Safe Zone is not a crisis service. If you are in immediate danger, call 911.</p></footer><script src="/analytics.js" defer></script></body></html>'''
(ROOT/'team/index.html').write_text(page+'\n')
print(f'Rendered {len(team)} homepage cards and {len(team)} full profiles.')
