# Ändringslogg

Alla viktiga ändringar dokumenteras här. Formatet följer [Keep a Changelog](https://keepachangelog.com/sv/1.1.0/)
och projektet använder [semantisk versionering](https://semver.org/lang/sv/).

Skriv nya ändringar under **Ej släppt**. När du kör `npm version patch|minor|major` flyttas de
automatiskt till en ny versionsrubrik med dagens datum.

## [Ej släppt]

### Tillagt
- Chevron-knappar på var sida om Paus-knappen för att hoppa mellan moment under en övning. Höger går till nästa moment. Vänster börjar om momentet om det pågått mer än 2 sekunder, annars går den till föregående. Knapparna fungerar även när övningen är pausad.

### Ändrat
- "Styrka" heter nu "Svårighetsgrad" (1 = enklast, 5 = svårast) i appen och i övningsdatan (`strength` → `difficulty`). Egna övningar måste byta fältnamn.
- Rubriken "Momentens upplägg" i övningsvyn heter nu "Övningens upplägg".
- Paus-knappen är smalare för att ge plats åt chevronerna.
- Cirkelns färg och storlek visar nu hur hårt du ska knipa: gul (snabbknip), orange (uthållighetsknip) och röd (kraftknip), där mindre cirkel betyder hårdare knip. Vila är fortsatt blågrön i startstorlek. Om-sidan förklarar färgerna.
- Siffran i cirkeln och momentnamnet har bättre kontrast på de ljusa färgerna.
- Cirkeln byter storlek mjukt mellan momenten i stället för att hoppa.

## [0.1.0] - 2026-09-19

Första versionen.

### Tillagt
- Startsida med tre nivåer: Kom-igång, Basövningar och Avancerade övningar, med 3 övningar per nivå.
- Övningar byggda av moment (kraftknip, snabbknip, uthållighetsknip och vila) med repetitioner och en styrka från 1 till 5, visad som en stapelbar från grönt till rött.
- Körläge med nedräkning 3-2-1, startljud, timer per moment, paus, fortsätt och avsluta samt slutfanfar.
- Pip de 3 sista sekunderna av moment som är längre än 5 sekunder.
- Animation som krymper vid knip och vidgas vid vila.
- Knappen "Kör senaste övningen igen" på startsidan efter en genomförd övning.
- Bottennavigering (Hem, Om, Träning, Inställningar) och sidorna Om och Inställningar.
- Inställningar för ljud, volym, vibration och att hålla skärmen tänd.
- Installerbar som app (PWA) som fungerar offline.
