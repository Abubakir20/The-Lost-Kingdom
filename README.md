# The Lost Kingdom

An original 3D open-world fantasy adventure that runs in the browser. One self-contained `index.html`, built on three.js r128.

**Play:** open `index.html` in a desktop browser (or enable GitHub Pages for this repo and open the site).

## Features

- Open world: Oakrest village, forest, river, ruins, the Temple of Echoes and a boss
- Sword combat with a three-hit combo and charged spin, shield guard, bow with a real draw
- Climbing, swimming, gliding, vaulting onto crates, rocks, walls and other props
- Gear is slung on the back while swimming and when the other weapon is out
- Quests, NPCs, shop, crafting, inventory, levelling, day/night, weather, save and continue
- Cel-shaded look with painted textures and a sculpted, skinned hero

## Controls

| Key | Action |
|---|---|
| W A S D | Move |
| Mouse | Look |
| Space | Jump, glide (press again in the air) |
| Shift | Sprint |
| Left click | Attack / draw and release the bow |
| Right click | Guard (sword) / aim (bow) |
| 1 / 2 / 3 | Sword / bow / healing draught |
| Q, F, R | Ember spell, dodge, lock on |
| E | Interact |
| Tab | Pack |

## Project layout

```
index.html        built game (generated, committed so it can be played directly)
build.js          embeds the compiled script and the assets into index.html
tsconfig.json     TypeScript project: every src/*.ts compiled, in order, into dist/game.js
src/
  globals.d.ts    shared types: rig, hero, game state, colliders, NPCs, options
  core.ts         terrain, items, state, save
  world.ts        renderer, materials, sky, water, vegetation, post-processing
  scenery.ts      village, temple, props
  entities.ts     characters, hero, weapons, camera, combat, enemies, boss
  systems.ts      quests, NPCs, shop, crafting
  ui.ts           HUD and panels
  main.ts         input and the frame loop
  template.html   page shell and styles
  tex/ art/       painted textures and key art
  hero3d/         hero mesh (packed binary) and texture
tools/
  test.js         automated playthrough, 71 checks
  shot.js         screenshot helper
```

The sources are TypeScript written as plain scripts that share one global scope (no imports); `tsc` joins them into a single file. three.js stays a CDN global, typed through `@types/three`.

## Build and test

```
npm install              # typescript, three types
npm run typecheck        # tsc --noEmit
npm run build            # tsc, then build.js writes index.html
npm i -D playwright      # once, for the tools
npm test                 # runs the 71 playthrough checks against index.html
```

Type coverage: the project compiles with no errors under the default checks. The shared data structures and the core helpers are typed; many function parameters are still implicitly `any` (`noImplicitAny` is off, about 660 places to annotate before it can be turned on).

## Credits

Game design and code are original. Textures, key art and the hero model were generated with Higgsfield (image models and Tripo H3.1). three.js is loaded from cdnjs; fonts from Google Fonts.
