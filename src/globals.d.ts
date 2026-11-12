// Ambient declarations shared by every source file.
// The sources are plain scripts that share one global scope and are compiled into a single file (see tsconfig "outFile").
// three.js is loaded from a CDN as the global THREE; its types come from @types/three.

interface Window {
  TLK_TEX?: Record<string, string>;
  TLK_ART?: Record<string, string>;
  TLK_HERO?: { mesh: string; tex: string };
  TLK: any;
  webkitAudioContext?: typeof AudioContext;
}
declare const TLK_ART: Record<string, string>;

/** Blend weights for one frame of a humanoid's procedural pose. */
interface Pose { aL: number; aR: number; zL: number; zR: number; eL: number; eR: number; lL: number; lR: number; kL: number; kR: number; bob: number; lean: number; tw: number; hy: number; hx: number }

/** The joint groups of a humanoid; animation rotates these, and the hero's skinned mesh uses them as bones. */
interface Rig {
  pivot: THREE.Group; hips: THREE.Group; chest: THREE.Group; head: THREE.Group;
  armL: THREE.Group; armR: THREE.Group; elbowL: THREE.Group; elbowR: THREE.Group; handL: THREE.Group; handR: THREE.Group;
  legL: THREE.Group; legR: THREE.Group; kneeL: THREE.Group; kneeR: THREE.Group;
  a: Pose | null; baseLean: number; zBias?: number;
}
interface Humanoid { g: THREE.Group; p: Rig }
interface HumanoidLook {
  skin: number; top: number; bottom: number; sleeve?: number; boot?: number; headScale?: number; eye?: number;
  hair?: number; style?: string; beard?: number; hat?: string; hatC?: number; bare?: boolean;
  robe?: number; skirt?: number; apron?: number; belt?: number; tabard?: number; lean?: number; s?: number; prop?: string;
}
interface Hero extends Humanoid {
  cape: THREE.Group; tails: THREE.Group[]; pony: THREE.Group; quiver: THREE.Group;
  sword: THREE.Group; shield: THREE.Group; bow: THREE.Group; glider: THREE.Group;
  trailH: Trail; trailV: Trail; trailS: Trail;
  /** Pull the bowstring to a point in the bow's own space, or pass null for the string at rest. */
  bowDraw: (nock: THREE.Vector3 | null) => void;
}
type Trail = THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
/** Parts of a non-humanoid creature (boar, wisp, forest guardian); each kind has its own set. */
type CreatureRig = Record<string, any>;

interface CircleCollider { x: number; z: number; r: number; on: boolean; /** world height of a surface you can stand on */ top?: number }
interface BoxCollider { x0: number; x1: number; z0: number; z1: number; on: boolean; top?: number }

interface PlayerStats {
  x: number; y: number; z: number; yaw: number; hp: number; maxHp: number; st: number; maxSt: number; mp: number; maxMp: number;
  level: number; xp: number; coins: number; weapon: string; swordLv: number; armor: number; hasBow: boolean; ember: boolean; respawn: string;
}
/** Everything that is saved. */
interface GameState {
  v: number; time: number; playTime: number; p: PlayerStats;
  inv: Record<string, number>; q: Record<string, any>; flags: Record<string, any>; disc: Record<string, boolean>; kills: number;
}

/** The audio graph once it has been built; until then (or if the browser refuses audio) there is none. */
interface AudioGraph { ctx: AudioContext; master: GainNode; mus: GainNode; sfx: GainNode; noise: AudioBuffer }
interface AudioState {
  ctx: AudioContext | null; beat: number; step: number; bar: number;
  master?: GainNode; mus?: GainNode; sfx?: GainNode; noise?: AudioBuffer; wind?: any; water?: any; rain?: any; amb?: any;
}
interface Npc {
  id: string; name: string; g: THREE.Group; p: Rig; pos: THREE.Vector3; home: number[]; route: any; ri: number; wait: number; yaw: number; anim: number; talk: any;
  hold?: any; holdL?: any; speed?: number; pause?: number; [extra: string]: any;
}
interface Chest { id: string; g: THREE.Group; lid: THREE.Group; x: number; z: number; items: any; coins: number; col: CircleCollider; hl: any; /** lid animation progress, 0..1 */ open?: number }
interface HouseOptions { h?: number; plaster?: number; shut?: number; two?: boolean; smoke?: boolean; doorX?: number; sign?: number }
interface PaintOptions { side?: string; sideScale?: number; mode?: string }
/** One instanced copy placed by chunked(): position, rotation, scale and an optional tint. */
interface ChunkItem { x: number; y: number; z: number; rx?: number; ry?: number; rz?: number; sx?: number; sy?: number; sz?: number; s?: number; c?: number[] }
interface ChunkOptions { cy?: number; extent?: number; dist?: number; grass?: boolean; shadow?: boolean; receive?: boolean }
interface PaintedTexture extends THREE.Texture { triGain: THREE.Vector3 }

/** A scripted camera move; while one runs, input is suspended. */
interface Cine { t: number; dur: number; camFn: (k: number, t: number) => void; onEnd?: () => void }
interface EnemyDef {
  name: string; hp: number; dmg: number; speed: number; radius: number; height: number; xp: number; coins?: number[];
  boss?: boolean; passive?: boolean; fly?: boolean; scale: number; loot?: any; [stat: string]: any;
}
/** A living creature. The fields every kind shares are listed; AI timers and per-kind state ride along on the index signature. */
interface Enemy {
  type: string; def: EnemyDef; g: THREE.Group; p: Rig & CreatureRig; pos: THREE.Vector3; home: { x: number; z: number };
  yaw: number; hp: number; state: string; t: number; alive: boolean; aggro: boolean; deadT: number; kb: THREE.Vector3;
  [extra: string]: any;
}
interface HitOptions { crit?: boolean; kx?: number; kz?: number; kb?: number; fire?: boolean }
interface Projectile { live: boolean; m: THREE.Object3D; pos: THREE.Vector3; type: string; [extra: string]: any }
interface Flyer { g: THREE.Group; l: THREE.Mesh; r: THREE.Mesh; [extra: string]: any }
/** One page of a conversation: plain text, or text with answers (label, then what choosing it does). */
type DialogOption = [label: string, choose?: (() => void) | null];
type DialogPage = string | { t: string; opts?: DialogOption[] };
interface Dialog { pages: DialogPage[]; i: number; who: string; done?: () => void }
/** Something the player can walk up to and use. */
interface Interactable { x?: number; z?: number; r: number; /** prompt text, or null when there is nothing to do here right now */ label: () => string | null; _l?: string | null; [extra: string]: any }
interface Objective { id?: string; name?: string; text?: string; target: any }

type Side = 'L' | 'R';
interface ItemDef { n: string; c: string; d: string; use?: number; [extra: string]: any }
interface Recipe { out: string; n: number; need: Record<string, number>; label: string }
interface QuestDef { name: string; kind: string; desc: string; reward: string; obj: (state?: any) => any[][]; target: (state?: any) => any }
interface QualitySet { grass: number; shadow: number; pr: number; fog: number; veg: number; post: boolean }
/** One carried piece of gear and its two homes: the hand and the back. */
interface CarryItem { obj: THREE.Group; hand: THREE.Object3D | null; hp: THREE.Vector3; hq: THREE.Quaternion; hs: number; bp: THREE.Vector3; bq: THREE.Quaternion; bs: number; held: boolean }
/** The player's moment-to-moment state (not saved). */
interface AttackState { t: number; dur: number; hitAt: number; hit: boolean; heavy: boolean; combo: number }
