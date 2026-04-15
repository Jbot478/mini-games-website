# mini-games-website
Mini games website

This repo holds a small collection of browser games. Most of them are plain static pages. Jennifer is the only one that needs a backend because she talks to OpenRouter.

## What to expect

- The homepage still shows Jennifer.
- You can still click into her game.
- If the backend is not running, Jennifer will show a setup message instead of breaking the rest of the site.

## Jennifer setup

There are two ways to run Jennifer:

### Local

Run the backend from [games/jennifer-bathroom-bestie/server](games/jennifer-bathroom-bestie/server), then open the site on your computer.

### Public

If you want Jennifer available online, the backend needs to run on a hosting service and the OpenRouter key must stay there, not in the browser.

This repo includes [render.yaml](render.yaml) for that setup.

Basic flow:

1. Create a Render service from this repo.
2. Let Render read [render.yaml](render.yaml).
3. Add `OPENROUTER_API_KEY` in the Render environment settings.
4. Set `SITE_URL` to the public backend URL.
5. Put that backend URL into [games/jennifer-bathroom-bestie/config.local.json](games/jennifer-bathroom-bestie/config.local.json) as `API_BASE_URL`.

Jennifer’s backend template lives in [games/jennifer-bathroom-bestie/server/.env.example](games/jennifer-bathroom-bestie/server/.env.example).

## If Jennifer is not working

- Check that the backend is running.
- Check that `API_BASE_URL` points to the right place.
- Check the backend health route: `/api/health`.

If you just want to browse the other games, they do not need any setup.
