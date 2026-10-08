<div align="center">

<img src="assets/readme/hero.gif" width="1200" alt="PIMX PASS DNS: a resolver globe linked to a ranked server array" />

**[English](README.md) · [فارسی](README.fa.md)**

</div>

# 🌐 PIMX PASS DNS

<!-- pimx-live-site:start -->
## Live website

**[Open PIMX_PASS_DNS ↗](https://pimxpassdns.pages.dev/)**
<!-- pimx-live-site:end -->

A bilingual DNS comparison interface with curated resolver sources, browser-based timing tests, result cards and an optional analytics backend.

[GitHub](https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_PASS_DNS) · [PIMX / Profile](https://github.com/MOHAMMADREZAABEDINPOOR) · [Static artwork](assets/readme/hero.png)

| At a glance | Details |
|:---|:---|
| 🌐 Experience | Web application / browser experience |
| 🧰 Built with | `React` · `Vite` · `TypeScript` · `Framer Motion` |
| 🌐 Documentation | [English](README.md) · [فارسی](README.fa.md) |

[✨ Features](#features) · [🚀 Getting started](#getting-started) · [⚙️ Configuration](#configuration) · [🌍 Deployment](#deployment)

---

<a id="features"></a>

## ✨ Features

| Area | Included capability |
|:---|:---|
| ⚡ Workflow | Resolver catalog and source generation scripts |
| 📡 Network | Scan workflow, timing results and result cards |
| 🌐 Experience | English/Persian UI and selectable themes |
| 👤 Accounts | Admin analytics through a Pages API endpoint |

<a id="stack"></a>

## 🧰 Stack

| Tool | Version / source |
|---|---|
| React | `^19.2.3` |
| Vite | `^6.2.0` |
| TypeScript | `~5.8.2` |
| Framer Motion | `^12.23.26` |

<a id="getting-started"></a>

## 🚀 Getting started

Node.js 22.12+ and the package manager declared in package.json. Install dependencies from the checked-in lockfile where available.

```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_PASS_DNS.git
cd PIMX_PASS_DNS

npm ci
npm run dev
```

<a id="configuration"></a>

## ⚙️ Configuration

These names are found in the example configuration or source; not all are required. Check their defaults/usage in those files and supply secrets only in your local or hosting environment.

| Name | Role |
|---|---|
| `API_KEY` | Credential/connection setting; keep private |
| `GEMINI_API_KEY` | Credential/connection setting; keep private |

<a id="usage"></a>

## 🎯 Usage

Start a scan, wait for the browser tests and compare the result cards. Use the included source-building scripts when updating the resolver catalog.

<a id="project-structure"></a>

## 🗂️ Project structure

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

<a id="commands-and-checks"></a>

## 🧪 Commands and checks

| Command | Purpose |
|:---|:---|
| `npm run dev` | 🧑‍💻 Development server |
| `npm run build` | 📦 Production build |
| `npm run preview` | 👀 Preview a build |
| `npm run lint` | 🧹 Lint source |

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

These commands are declared in package.json; the list is not a test execution report. Test commands may need a browser, service or prepared database.

<a id="deployment"></a>

## 🌍 Deployment

Deploy the build according to its architecture: server-backed projects need a Node process; static Vite frontends can host dist. Pages functions, KV or D1 require separate configuration.

<a id="limitations"></a>

## 📌 Limitations

Browser fetch timing is affected by CORS, HTTPS endpoints and the current network; it is not a raw UDP DNS benchmark. Results do not automatically change your operating-system DNS settings.

<a id="troubleshooting"></a>

## 🛠️ Troubleshooting

- Missing packages: install dependencies using the project’s package manager.
- API/network failure: check the configured origin, provider and hosting bindings.
- Old assets: rebuild when a build script exists, then clear the browser cache.

<a id="contributing"></a>

## 🤝 Contributing

Create a focused branch, verify the affected behavior and explain the change clearly. Keep private data, build outputs and local databases out of commits.

<a id="license"></a>

## 📄 License

No repository-level license file is included in this snapshot. Public visibility alone does not grant reuse rights; contact the repository owner for terms.

---

Part of **PIMX** · Documentation in English and Persian.

---

<div align="center">

🌐 **PIMX PASS DNS** · [English](README.md) · [فارسی](README.fa.md)

</div>
