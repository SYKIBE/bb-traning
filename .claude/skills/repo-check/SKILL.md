---
name: repo-check
description: Kontrollerar repots status lokalt och mot GitHub – ocommittade ändringar, om grenen ligger före/efter origin, opushade taggar, versionsnummer, CI-körningar och vilken version som är publicerad på GitHub Pages. Använd när användaren kör /repo-check eller frågar hur det står till med repot.
allowed-tools: Read, Bash(git status:*), Bash(git fetch:*), Bash(git branch:*), Bash(git stash list:*), Bash(git rev-list:*), Bash(git rev-parse:*), Bash(git log:*), Bash(git tag:*), Bash(git ls-remote:*), Bash(git describe:*), Bash(gh run list:*), Bash(gh pr list:*), Bash(gh api repos/{owner}/{repo}/pages:*), Bash(curl -s:*)
---

# /repo-check – status för repot lokalt och på GitHub

Gör en **läsande** kontroll och rapportera resultatet på svenska. Ändra ingenting:
ingen commit, push, pull, merge, rebase, stash, tagg eller borttagning. `git fetch` är
det enda som får köras, eftersom det bara uppdaterar vad repot vet om origin.
Om något behöver åtgärdas föreslår du kommandot i rapporten, men kör det inte.

Kör kommandona i Bash-verktyget (git bash) från repots rot. Kör oberoende steg parallellt.
Om ett steg misslyckas (t.ex. inget nät eller `gh` inte inloggad) noterar du det i
rapporten och fortsätter med resten.

## 1. Lokalt

- `git status -sb` – aktuell gren, ocommittade och ospårade filer.
- `git stash list` – sparade stashar.
- `git branch -vv` – lokala grenar och deras uppströmsgren. Notera grenar vars
  uppströmsgren är borttagen (`: gone]`).

## 2. Mot origin

- `git fetch --prune --tags --quiet origin`
- `git rev-list --left-right --count HEAD...@{u}` – antal commits före / efter origin.
  Visa de commits som inte är pushade med `git log --oneline @{u}..HEAD` och de som
  inte är hämtade med `git log --oneline HEAD..@{u}`.
- Opushade taggar: jämför `git tag` med `git ls-remote --tags origin` (ignorera rader
  som slutar på `^{}`). Lista taggar som bara finns lokalt.

## 3. Version

- Version i `package.json` och `VERSION` i `js/version.js` – ska vara lika.
- Senaste tagg: `git describe --tags --abbrev=0`. Ska vara `v` + versionen i package.json.
- Commits sedan senaste tagg: `git log --oneline <tagg>..HEAD`.
- Läs `CHANGELOG.md`: finns det punkter under **[Ej släppt]**? Om det finns commits sedan
  senaste tagg men inget under Ej släppt, påpeka att ändringsloggen kanske saknar något.

## 4. GitHub

- `gh run list --limit 10` – senaste körningarna. Flagga körningar som misslyckats, och
  körningar som står som `queued` eller `in_progress` sedan mer än en timme (troligen fastnat).
- `gh pr list --state open` – öppna pull requests.
- Publicerad version: hämta adressen med `gh api repos/{owner}/{repo}/pages --jq .html_url`
  och sedan `curl -s <adress>js/version.js`. Jämför `VERSION` där med senaste tagg.
  Om de skiljer sig: kolla om deploy-körningen för taggen fortfarande pågår eller misslyckades.

## Rapport

Börja med en mening som sammanfattar läget, t.ex. "Allt är i synk och v0.4.0 är publicerad."
eller "Två saker behöver åtgärdas."

Visa sedan en kort tabell med en rad per kontroll och status ✅ (ok), ⚠️ (bör ses över) eller
❌ (fel), plus en kort förklaring:

| Kontroll | Status | Detaljer |
|---|---|---|
| Arbetskatalog | | |
| Synk mot origin | | |
| Taggar | | |
| Version | | |
| Ändringslogg | | |
| CI-körningar | | |
| Öppna PR:er | | |
| Publicerad version | | |

Avsluta med **Förslag** – en numrerad lista med vad som bör göras och exakt kommando för
varje sak. Användaren kör Windows PowerShell 5.1, så skriv kommandon som fungerar där
(använd `;` och `if ($?) { ... }` i stället för `&&`). Om allt är ok skriver du det i
stället för en tom lista.
