# mini-games-website
A website to play mini games

## Jennifer public deployment (GitHub Pages + backend)

Jennifer needs a backend server for AI responses. The frontend can stay on GitHub Pages, but the OpenRouter key must stay on the backend.

### 1) Deploy backend

This repo includes [render.yaml](render.yaml) for Render.

- Create a new Render service from this repo.
- Render will pick [render.yaml](render.yaml) automatically.
- In Render environment variables, set:
	- `OPENROUTER_API_KEY` = your active key
	- `SITE_URL` = your Render backend URL (example: `https://jennifer-backend.onrender.com`)

The rest can use defaults from [games/jennifer-bathroom-bestie/server/.env.example](games/jennifer-bathroom-bestie/server/.env.example).

### 2) Point frontend to backend

Edit [games/jennifer-bathroom-bestie/config.local.json](games/jennifer-bathroom-bestie/config.local.json):

- `API_BASE_URL` = your backend URL (without `/api`)

Example:

`{ "API_BASE_URL": "https://jennifer-backend.onrender.com" }`

Then commit and push.

### 3) Verify

- Backend health: `https://your-backend-domain/api/health`
- Jennifer page should connect without local setup prompts.

