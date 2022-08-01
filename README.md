# Pokédex

A self-contained Next.js field guide powered by [PokéAPI](https://pokeapi.co/docs/v2). Browse the National Pokédex, search by name or number, filter by type and generation, explore individual Pokémon, and calculate type matchups. No authentication, backend service, database, or API keys are required.

## Run locally

Use Node.js 22 (see `.nvmrc`).

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No environment file is needed. Legacy local `.env*` files are ignored by Git and excluded from Docker builds.

```sh
npm test
npm run typecheck
npm run format:check
npm run build
npm start
```

The production build uses Next.js [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output); the Docker image runs its generated `server.js` directly.

## Publish to the private registry

The `Validate and Publish Container` GitHub Actions workflow checks pull requests and publishes successful pushes to `main`. It can also be run manually on `main`.

It uses the same Vault setup as the portfolio repository. Add the `VAULT_TOKEN` Actions secret to this repository, with permission to read `GITHUB_SECRETS/data/SHARED`. That Vault record must provide `DOCKER_USERNAME` and `DOCKER_PASSWORD`, with registry permission to push the `pokedex` image. Do not put these credentials in repository files.

Optional Actions variables:

- `CONTAINER_REGISTRY`: defaults to `docker.taydenflitcroft.com` (hostname only).
- `REGISTRY_IMAGE_NAME`: defaults to `pokedex`.
- `CONTAINER_RUNNER`: defaults to `ubuntu-latest`; use the same reachable runner as the portfolio if Vault or the registry requires it.

The workflow publishes `linux/amd64` images tagged `latest` and `sha-<short commit>`. Configure Unraid to pull `docker.taydenflitcroft.com/pokedex:latest`, or pin a published SHA tag for a specific version. Authenticate the Unraid Docker host with `docker login docker.taydenflitcroft.com` using credentials with pull access. Map host port `3010` to container port `3000`; no volumes are needed. The local Compose file remains configured for local builds.

## Deploy on Unraid

Build and run from this repository on the Unraid server (or any Docker host):

```sh
docker compose up -d --build
```

Open `http://YOUR-UNRAID-IP:3010`. Compose maps host port **3010** to container port **3000**. Change the left side of `3010:3000` to use a different host port. No volumes or database containers are necessary. The container runs as a non-root user, restarts unless stopped, and exposes a health check at `/api/health`.

For Unraid’s **Add Container** UI, first build the image on the server:

```sh
docker build -t pokedex:local .
```

Set Name to `pokedex`, Repository to `pokedex:local`, Network Type to `bridge`, and add a TCP port mapping from host `3010` to container `3000`. Set WebUI to `http://[IP]:[PORT:3000]`. Enable autostart in Unraid. No environment variables, path mappings, or privileged mode are needed. If using a reverse proxy, forward to the Unraid host on port 3010 and terminate HTTPS there.

When building on an Apple Silicon Mac for an Intel/AMD Unraid host, explicitly build the target architecture and transfer the image:

```sh
docker buildx build --platform linux/amd64 --load -t pokedex:local .
docker save pokedex:local | gzip > pokedex-image.tar.gz
# Transfer the archive to Unraid, then on Unraid:
gunzip -c pokedex-image.tar.gz | docker load
```

To run the opt-in integration checks against a running container (requires PokéAPI access):

```sh
node tests/smoke.mjs http://localhost:3010
```

Container upgrades require rebuilding and recreating the container. There is no user data to migrate. Outbound HTTPS access to PokéAPI and Pokémon artwork is required; the health check tests the app process independently of the upstream API.

## Routes and behavior

- `/` — server-rendered catalog with pagination, type/generation filters, name/number search, and sorting. Filters and page numbers are shareable URL parameters; submitting the form works without client JavaScript.
- `/pokemon/bulbasaur` — standalone species profile with standard/shiny artwork, base stats, abilities, evolution family, and adjacent species. National numbers redirect to the canonical species URL, e.g. `/pokemon/25` → `/pokemon/pikachu`.
- `/matchup?attack=rock&defender=fire&secondary=flying` — dual-type effectiveness, all defensive weaknesses/resistances/immunities, and an optional standard 1.5× same-type attack bonus. Controls update the shareable URL.
- `/api/search` — public GET search API used by the live suggestions. The SSR catalog calls the same search service directly, avoiding a loopback HTTP request.
- `/api/health` — lightweight process health, returns `{"status":"ok"}`.

### Search API

```sh
curl 'http://localhost:3000/api/search?q=pika&type=electric&generation=1&sort=number&page=1&limit=24'
```

Parameters: `q` (up to 80 characters), `type` (one of the 18 standard types), `generation` (1–9), `sort` (`number`, `number-desc`, or `name`), `page` (1–10000), and `limit` (1–48; default 24). Out-of-range result pages clamp to the last page. Invalid parameters return HTTP 400; upstream failures return HTTP 503 with a retry-friendly message. Successful responses contain `results`, `total`, `nationalTotal`, `page`, `pages`, and `limit`. Each result includes `id`, `name`, `types`, `image`, and `href`.

The server caches PokéAPI responses for 24 hours in Next.js’s disposable data cache, with 10-second upstream timeouts. No database or persistent volume is involved. National Dex entries come from the national Pokédex endpoint, excluding alternate forms; numeric species identifiers resolve default varieties such as Deoxys Normal. Generations use National Dex boundaries through Generation IX; update `src/lib/search.ts` when future generations are introduced.

Artwork is served through Next.js Image optimization as responsive WebP images, with a minimum 30-day cache lifetime. The first catalog row loads eagerly; other images load near the viewport. A small loading indicator appears in the reserved artwork area while an uncached image downloads; artwork is shown sharply once ready, without a blur effect. Browser caching helps repeat visits, and the container shares optimized files between visitors. The server image cache is disposable and resets when the container is replaced; no volume or database is required.

The type lab uses PokéAPI’s current standard 18-type chart. It calculates type effectiveness, not full battle damage: abilities, items, weather, move-specific exceptions, Terastallization, levels, and stats are outside its scope. The offline test fixture was derived from the same PokéAPI type endpoints.

## Caching and navigation

- **Profiles:** generated on the first visit, then served from Next.js’s full-route HTML/RSC cache for six hours. Expired pages refresh in the background while the previous version remains available. No PokéAPI access is needed during the image build to enumerate profiles.
- **Catalog and search API:** share an hourly cache of assembled search results. Keys include the normalized query, type, generation, sort, page, and page size. Cached records contain only card data, keeping entries small. Query-based catalog pages still render on the server, using cached results rather than repeating the search and upstream work.
- **API responses:** successful searches can be reused by browsers for 5 minutes and shared HTTP caches for an hour, with stale-while-revalidate. Invalid requests and upstream error responses use `no-store`.
- **Navigation:** the search form uses Next.js client navigation instead of reloading the whole document. The client router retains dynamic pages for 5 minutes and static/prefetched pages for an hour using Next.js’s experimental `staleTimes` option.
- **Type lab:** the assembled type chart is cached for 24 hours. Query parameters still determine the server-rendered initial matchup.
- **Upstream data and artwork:** PokéAPI responses cache for 24 hours; optimized images cache for at least 30 days.

These caches are disposable, require no database, and reset when the container is replaced. A cold first visit can still need PokéAPI. Cache behavior should be checked with the production container: development mode intentionally behaves differently. `/api/health` remains uncached.

## Pokémon GO

`/pokemon-go` is the standalone GO guide: search by species name or National number, sort by GO Attack/Defense/Stamina, filter for species with a release record, and open the GO section of any species profile. Every `/pokemon/[name]` profile includes a separate Pokémon GO section with a form selector, GO base stats/types, fast and charged moves (including Elite/legacy records), buddy distance, and evolution candy costs.

GO data comes from the independent [PoGoAPI v1](https://pogoapi.net/documentation/) service. The main Pokédex continues to use **PokéAPI v2**. GO datasets are cached server-side for six hours; rendered profiles also refresh every six hours. All GO requests have an eight-second timeout. Missing supplemental sources show unavailable values, while a core GO outage renders a section-level fallback without breaking the main profile. No account, API key, database, or volume is needed.

GO stats in the standalone table use the Normal form when present; otherwise the explicitly named first form. Other fields match the selected form exactly. Release and shiny records are species-level and may lag the live game; they do not confirm every form or current availability. Evolution candy figures exclude additional item/task requirements. The displayed retrieval date refers to the data fetch, not a verified game update date. This is not a live spawn, event, or raid tracker.

## Project structure

- `src/app` — Next.js App Router pages and API handlers.
- `src/components` — field-guide UI and interactive controls.
- `src/lib` — typed PokéAPI client, search validation/filtering, and matchup calculations.
- `tests` — deterministic search and type-effectiveness tests.
- `Dockerfile`, `compose.yaml` — multi-stage production image and Unraid-friendly configuration.
- `.github/workflows/ci.yml` — type checking, tests, formatting, production build, and container smoke test.

## Attribution

Pokémon names and artwork belong to Nintendo, Creatures, and GAME FREAK. Data and artwork are provided by PokéAPI and its sprite repository. This is an independent fan project and is not affiliated with those companies.
