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
  ui/             item icon atlas (4x4, transparent) and NPC portrait atlas (3x2)
  props/          rocks, column pieces, the arch, wall courses and tree trunks sculpted in Blender, one binary pack (format in src/world.ts)
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

Type checking: full `strict` mode is on and the project compiles with no errors. Every parameter is typed, values that can be missing are checked before use, and shared structures live in `src/globals.d.ts`. A few deliberate `any`s remain where per-creature AI state or shader uniforms don't fit a fixed shape.

## Credits

Game design and code are original. Textures, key art, item icons, NPC portraits and the hero model were generated with Higgsfield (GPT Image 2.6 and Tripo H3.1). The icons and portraits were each generated as one sheet and cut into atlases (Higgsfield jobs ee72c4d4 and 1b9d191c). Rocks, column pieces, the arch, the temple wall courses and the tree trunks were modelled procedurally in Blender (Higgsfield 3D Jutsu, project 7cec6fe3, revision 11) with per-vertex occlusion and moss baked by ray casting. three.js is loaded from cdnjs; fonts from Google Fonts.
