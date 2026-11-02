<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark.svg">
  <img alt="Ocular — gameplay systems & interface engineering for FiveM" src="assets/header-light.svg" width="100%">
</picture>

<br>

I build the systems players touch every session without thinking about them: public-safety tooling, housing and garages, HUDs, chat, character creation, admin panels. The server side is Lua, and the interfaces are full TypeScript front-ends. Most of it ships through **[Creative Store](https://github.com/CREATIVE-ST)**.

<table>
  <tr>
    <td width="50%" valign="top">
      <h4>How I build</h4>
      <ul>
        <li><b>Framework-agnostic.</b> One bridge, Qbox / QBCore / ESX underneath.</li>
        <li><b>Server-authoritative.</b> Validation, rate limits and persistence come before polish.</li>
        <li><b>Real front-ends.</b> React + Vite, tuned for CEF's quirks, never a template.</li>
        <li><b>Clean resources.</b> Typed config, no dead code, readable diffs.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h4>Shipped</h4>
      <ul>
        <li><b>Public safety</b>: police MDT, livery-aware garages, EMS, reports</li>
        <li><b>Player UX</b>: HUDs, chat, multicharacter, appearance, documents</li>
        <li><b>Economy</b>: housing, rentals + phone app, gangs, drops, gunsmith</li>
        <li><b>World &amp; ops</b>: MLO pipeline, prop placer, txAdmin panel work</li>
      </ul>
    </td>
  </tr>
</table>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/stack-dark.svg">
  <img alt="Stack: FiveM, Lua, ox_lib, oxmysql, txAdmin · Qbox, QBCore, ESX · React, TypeScript, Vite, Tailwind · MySQL, Python, CodeWalker, MLO" src="assets/stack-light.svg" width="100%">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/activity-dark.svg">
  <img alt="Contribution activity over the last 52 weeks and language breakdown" src="assets/activity-light.svg" width="100%">
</picture>

<p align="right"><sub>Cards are generated from the GitHub GraphQL API by <a href="scripts/build.mjs"><code>scripts/build.mjs</code></a> with no dependencies, and rebuilt daily by Actions.</sub></p>
