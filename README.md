<svg width="260" height="260" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
  <circle cx="130" cy="130" r="120" fill="#020202" stroke="#16F2AA" stroke-width="6"/>
  <circle cx="130" cy="130" r="80" fill="none" stroke="#16F2AA" stroke-width="3" stroke-dasharray="6 8"/>
  <circle cx="130" cy="130" r="40" fill="#16F2AA"/>
  
  <text x="50%" y="50%" fill="#020202" font-size="34" text-anchor="middle" dy="12" font-family="Orbitron, monospace">
    ASX
  </text>
</svg>


# ASX Language Framework

**XJSON + SCXQ2 + KLH + ASX Blocks + XCFE**

This repository is the canonical language / runtime stack for the ASX ecosystem.

It provides:

- **XJSON Runtime** – parse and evaluate XJSON with XCFE control flow.
- **SCXQ2 Engine** – encode/decode arbitrary data into symbolic payload strings.
- **KLH Orchestrator** – manage hives, jobs, and hive‑to‑hive routing.
- **ASX Blocks Core** – block registry and simple HTML renderer.
- **Tape Runtime** – minimal helpers to represent and execute ASX tapes.

All code is written in ASX LANGUAGE and is meant to be understandable and hackable.
No placeholders; everything in this repo is a working baseline implementation.
