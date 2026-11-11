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
interface ChunkOptions { cy?: number; extent?: number; dist?: number; grass?: boolean; shadow?: boolean; receive?: boolean }
interface PaintedTexture extends THREE.Texture { triGain: THREE.Vector3 }
