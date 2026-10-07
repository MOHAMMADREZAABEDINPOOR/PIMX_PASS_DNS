<div align="center">

<img src="assets/readme/hero.gif" width="1200" alt="PIMX PASS DNS — rotating 3D geometry" />

**[English](README.md) · [فارسی](README.fa.md)**

<img src="assets/readme/identity.svg" width="1200" alt="web / English and Persian documentation" />

</div>

# PIMX PASS DNS

A bilingual DNS comparison interface with curated resolver sources, browser-based timing tests, result cards and an optional analytics backend.

[GitHub](https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_PASS_DNS) · [PIMX / Profile](https://github.com/MOHAMMADREZAABEDINPOOR) · [Static artwork](assets/readme/hero.png)

## Features

- Resolver catalog and source generation scripts
- Scan workflow, timing results and result cards
- English/Persian UI and selectable themes
- Admin analytics through a Pages API endpoint

## Stack

| Tool | Version / source |
|---|---|
| React | `^19.2.3` |
| Vite | `^6.2.0` |
| TypeScript | `~5.8.2` |
| Framer Motion | `^12.23.26` |

## Getting started

Node.js 22.12+ and the package manager declared in package.json. Install dependencies from the checked-in lockfile where available.

```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_PASS_DNS.git
cd PIMX_PASS_DNS

npm ci
npm run dev
```

## Configuration

These names are found in the example configuration or source; not all are required. Check their defaults/usage in those files and supply secrets only in your local or hosting environment.

| Name | Role |
|---|---|
| `API_KEY` | Credential/connection setting; keep private |
| `GEMINI_API_KEY` | Credential/connection setting; keep private |

## Usage

Start a scan, wait for the browser tests and compare the result cards. Use the included source-building scripts when updating the resolver catalog.

## Project structure

| Path | Role |
|---|---|
| [`assets/`](assets/) | Brand/media/README assets |
| [`components/`](components/) | Reusable interface components |
| [`functions/`](functions/) | Hosting API functions |
| [`public/`](public/) | Public web assets |
| [`scripts/`](scripts/) | Development and maintenance utilities |
| [`services/`](services/) | Services and integration helpers |
| [`dnsveil-sources.json`](dnsveil-sources.json) | Project entry/configuration file |
| [`dnsveil-userdata.json`](dnsveil-userdata.json) | Project entry/configuration file |
| [`index.html`](index.html) | Project entry/configuration file |
| [`metadata.json`](metadata.json) | Project entry/configuration file |
| [`package.json`](package.json) | Project entry/configuration file |
| [`tsconfig.json`](tsconfig.json) | Project entry/configuration file |

## Commands and checks

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

These commands are declared in package.json; the list is not a test execution report. Test commands may need a browser, service or prepared database.

## Deployment

Deploy the build according to its architecture: server-backed projects need a Node process; static Vite frontends can host dist. Pages functions, KV or D1 require separate configuration.

## Limitations

Browser fetch timing is affected by CORS, HTTPS endpoints and the current network; it is not a raw UDP DNS benchmark. Results do not automatically change your operating-system DNS settings.

## Troubleshooting

- Missing packages: install dependencies using the project’s package manager.
- API/network failure: check the configured origin, provider and hosting bindings.
- Old assets: rebuild when a build script exists, then clear the browser cache.

## Contributing

Create a focused branch, verify the affected behavior and explain the change clearly. Keep private data, build outputs and local databases out of commits.

## License

No repository-level license file is included in this snapshot. Public visibility alone does not grant reuse rights; contact the repository owner for terms.

---

Part of **PIMX** · Documentation in English and Persian.
