# 24 uur live voor Wensstichting Drenthe

Website voor de 24-uurs livestream van studenten van DCTerra. Alle opbrengsten gaan naar
[Wensstichting Drenthe](https://wensstichtingdrenthe.nl), dat wensen vervult van kinderen (4–17 jaar) uit Drenthe die
een zwaar leven hebben.

## Wat zit erin

- **Homepagina** met aftelklok, uitleg over de actie en de stichting, manieren om te helpen en veelgestelde vragen.
- **Meedoen** (`/register`): aanmelden voor de stream met een DCTerra-mailadres. Deelnemers krijgen een bevestigingsmail met
  een persoonlijke Discord-code.
- **Vrijwilliger worden** (`/team`): aanmelden als vrijwilliger of voor de organisatie.
- **Programma** (`/schedule`) en **Sponsors** (`/sponsors`): aan te zetten via het beheer.
- **Beheer** (`/admin`): aanmeldingen, vragen, programma, sponsors, FAQ, tijden en site-instellingen.

Alle teksten die per jaar veranderen (datum, locatie, links, aan/uit-knoppen voor pagina's) pas je aan in
**Beheer → Inhoud → Site-instellingen** en **Tijden**. Je hoeft daarvoor geen code aan te passen.

## Lokaal starten

1. Kopieer de omgevingsvariabelen naar `.env.local` (database, `JWT_SECRET`, Resend).
   `JWT_SECRET` moet minimaal 32 tekens zijn, bijvoorbeeld: `openssl rand -base64 48`.
   Zonder `JWT_SECRET` werkt de publieke site gewoon, alleen het beheer kan dan niet inloggen.
2. `pnpm install`
3. `pnpm dev` en open http://localhost:3000

Productie: `pnpm build` en daarna `node .next/standalone/server.js` (de build gebruikt `output: "standalone"`).

## Database

MySQL. Migraties staan in `scripts/migrations` (`pnpm db:migrate`), een beheerder maak je met `pnpm db:create-admin`.
Als de database even niet bereikbaar is, blijft de publieke site werken met standaardteksten.

## Techniek

Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui, MySQL (mysql2), Resend voor e-mail.
