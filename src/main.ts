import type { PowChallenge, WorkerOut } from './pow';

const out = document.getElementById('out') as HTMLPreElement;
let worker: Worker | undefined;

function solve(challenge: PowChallenge, onProgress: (n: number) => void): Promise<string> {
  return new Promise((resolve) => {
    worker?.terminate();
    const w = (worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));
    w.onmessage = (e: MessageEvent<WorkerOut>) => {
      if (e.data.type === 'progress') onProgress(e.data.tried);
      else {
        w.terminate();
        resolve(e.data.nonce);
      }
    };
    w.postMessage({ challenge });
  });
}

type Pair = [number, number];
type Quad = [number, number, number, number];

var u = function (t: Pair, e: Pair): Pair {
    const tq: Quad = [t[0] >>> 16, 65535 & t[0], t[1] >>> 16, 65535 & t[1]];
    const eq: Quad = [e[0] >>> 16, 65535 & e[0], e[1] >>> 16, 65535 & e[1]];
    var n: Quad = [0, 0, 0, 0];
    return (
        (n[3] += tq[3] + eq[3]),
        (n[2] += n[3] >>> 16),
        (n[3] &= 65535),
        (n[2] += tq[2] + eq[2]),
        (n[1] += n[2] >>> 16),
        (n[2] &= 65535),
        (n[1] += tq[1] + eq[1]),
        (n[0] += n[1] >>> 16),
        (n[1] &= 65535),
        (n[0] += tq[0] + eq[0]),
        (n[0] &= 65535),
        [(n[0] << 16) | n[1], (n[2] << 16) | n[3]]
    );
},
    c = function (t: Pair, e: Pair): Pair {
        const tq: Quad = [t[0] >>> 16, 65535 & t[0], t[1] >>> 16, 65535 & t[1]];
        const eq: Quad = [e[0] >>> 16, 65535 & e[0], e[1] >>> 16, 65535 & e[1]];
        var n: Quad = [0, 0, 0, 0];
        return (
            (n[3] += tq[3] * eq[3]),
            (n[2] += n[3] >>> 16),
            (n[3] &= 65535),
            (n[2] += tq[2] * eq[3]),
            (n[1] += n[2] >>> 16),
            (n[2] &= 65535),
            (n[2] += tq[3] * eq[2]),
            (n[1] += n[2] >>> 16),
            (n[2] &= 65535),
            (n[1] += tq[1] * eq[3]),
            (n[0] += n[1] >>> 16),
            (n[1] &= 65535),
            (n[1] += tq[2] * eq[2]),
            (n[0] += n[1] >>> 16),
            (n[1] &= 65535),
            (n[1] += tq[3] * eq[1]),
            (n[0] += n[1] >>> 16),
            (n[1] &= 65535),
            (n[0] += tq[0] * eq[3] + tq[1] * eq[2] + tq[2] * eq[1] + tq[3] * eq[0]),
            (n[0] &= 65535),
            [(n[0] << 16) | n[1], (n[2] << 16) | n[3]]
        );
    };
function s(t: Pair, e: number): Pair {
    return 32 === (e %= 64)
        ? [t[1], t[0]]
        : e < 32
            ? [(t[0] << e) | (t[1] >>> (32 - e)), (t[1] << e) | (t[0] >>> (32 - e))]
            : ((e -= 32),
                [(t[1] << e) | (t[0] >>> (32 - e)), (t[0] << e) | (t[1] >>> (32 - e))]);
}
function f(t: Pair, e: number): Pair {
    return 0 === (e %= 64)
        ? t
        : e < 32
            ? [(t[0] << e) | (t[1] >>> (32 - e)), t[1] << e]
            : [t[1] << (e - 32), 0];
}
function l(t: Pair, e: Pair): Pair {
    return [t[0] ^ e[0], t[1] ^ e[1]];
}
function p(t: Pair): Pair {
    return (
        (t = l(t, [0, t[0] >>> 1])),
        (t = l((t = c(t, [4283543511, 3981806797])), [0, t[0] >>> 1])),
        (t = l((t = c(t, [3301882366, 444984403])), [0, t[0] >>> 1]))
    );
}

export const murmur128 = function (t: string, seed: number) {
    var ot = seed;
    ot = ot || 0;
    for (
        var it = (t = t || "").length % 16,
        at = t.length - it,
        ut: Pair = [0, ot],
        ct: Pair = [0, ot],
        st: Pair = [0, 0],
        ft: Pair = [0, 0],
        lt: Pair = [2277735313, 289559509],
        pt: Pair = [1291169091, 658871167],
        dt = 0;
        dt < at;
        dt += 16
    )
        ((st = [
            (255 & t.charCodeAt(dt + 4)) |
            ((255 & t.charCodeAt(dt + 5)) << 8) |
            ((255 & t.charCodeAt(dt + 6)) << 16) |
            ((255 & t.charCodeAt(dt + 7)) << 24),
            (255 & t.charCodeAt(dt)) |
            ((255 & t.charCodeAt(dt + 1)) << 8) |
            ((255 & t.charCodeAt(dt + 2)) << 16) |
            ((255 & t.charCodeAt(dt + 3)) << 24),
        ]),
            (ft = [
                (255 & t.charCodeAt(dt + 12)) |
                ((255 & t.charCodeAt(dt + 13)) << 8) |
                ((255 & t.charCodeAt(dt + 14)) << 16) |
                ((255 & t.charCodeAt(dt + 15)) << 24),
                (255 & t.charCodeAt(dt + 8)) |
                ((255 & t.charCodeAt(dt + 9)) << 8) |
                ((255 & t.charCodeAt(dt + 10)) << 16) |
                ((255 & t.charCodeAt(dt + 11)) << 24),
            ]),
            (st = s((st = c(st, lt)), 31)),
            (ut = s((ut = l(ut, (st = c(st, pt)))), 27)),
            (ut = u(ut, ct)),
            (ut = u(c(ut, [0, 5]), [0, 1390208809])),
            (ft = s((ft = c(ft, pt)), 33)),
            (ct = s((ct = l(ct, (ft = c(ft, lt)))), 31)),
            (ct = u(ct, ut)),
            (ct = u(c(ct, [0, 5]), [0, 944331445])));
    switch (((st = [0, 0]), (ft = [0, 0]), it)) {
        case 15:
            ft = l(ft, f([0, t.charCodeAt(dt + 14)], 48));
        case 14:
            ft = l(ft, f([0, t.charCodeAt(dt + 13)], 40));
        case 13:
            ft = l(ft, f([0, t.charCodeAt(dt + 12)], 32));
        case 12:
            ft = l(ft, f([0, t.charCodeAt(dt + 11)], 24));
        case 11:
            ft = l(ft, f([0, t.charCodeAt(dt + 10)], 16));
        case 10:
            ft = l(ft, f([0, t.charCodeAt(dt + 9)], 8));
        case 9:
            ((ft = l(ft, [0, t.charCodeAt(dt + 8)])),
                (ft = s((ft = c(ft, pt)), 33)),
                (ct = l(ct, (ft = c(ft, lt)))));
        case 8:
            st = l(st, f([0, t.charCodeAt(dt + 7)], 56));
        case 7:
            st = l(st, f([0, t.charCodeAt(dt + 6)], 48));
        case 6:
            st = l(st, f([0, t.charCodeAt(dt + 5)], 40));
        case 5:
            st = l(st, f([0, t.charCodeAt(dt + 4)], 32));
        case 4:
            st = l(st, f([0, t.charCodeAt(dt + 3)], 24));
        case 3:
            st = l(st, f([0, t.charCodeAt(dt + 2)], 16));
        case 2:
            st = l(st, f([0, t.charCodeAt(dt + 1)], 8));
        case 1:
            ((st = l(st, [0, t.charCodeAt(dt)])),
                (st = s((st = c(st, lt)), 31)),
                (ut = l(ut, (st = c(st, pt)))));
    }
    return (
        (ut = l(ut, [0, t.length])),
        (ct = l(ct, [0, t.length])),
        (ut = u(ut, ct)),
        (ct = u(ct, ut)),
        (ut = p(ut)),
        (ct = p(ct)),
        (ut = u(ut, ct)),
        (ct = u(ct, ut)),
        "00000000".concat((ut[0] >>> 0).toString(16)).slice(-8) +
        "00000000".concat((ut[1] >>> 0).toString(16)).slice(-8) +
        "00000000".concat((ct[0] >>> 0).toString(16)).slice(-8) +
        "00000000".concat((ct[1] >>> 0).toString(16)).slice(-8)
    );
};

import superjson from "superjson";

type Mapped = {
    _0: [string, unknown][];
};

/** Separator `encodeString` joins [encoded, octal, hash] with (U+200E, LEFT-TO-RIGHT MARK). */
const SEPARATOR = "‎";

function decodeString(encoded: string, seed: number): string {
    const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const shifted = decoded.split(SEPARATOR)[0] ?? "";
    let result = "";
    for (let i = 0; i < shifted.length; i++) {
        const encodedCharCode = shifted.charCodeAt(i);
        const originalCharCode = (((encodedCharCode - seed) % 128) + 128) % 128;
        result += String.fromCharCode(originalCharCode);
    }
    return result;
}

type NumberTriple = [{ 0: number }, [number], [{ _s: number; _: unknown[] }]];

function isNumberTriple(value: unknown): value is NumberTriple {
    if (!Array.isArray(value) || value.length !== 3) return false;
    const [k, f, meta] = value as unknown[];
    return (
        typeof k === "object" && k !== null && "0" in k &&
        Array.isArray(f) &&
        Array.isArray(meta)
    );
}

function decodeNumberTriple(triple: NumberTriple): number {
    const k = triple[0][0];
    const f = triple[1][0];
    const meta = triple[2][0];
    const shifted = k >> f;
    // encodeString: isMod (residue 0) => `_` is []; otherwise `_` is [null]
    const isMod = meta._.length === 0;
    return isMod ? meta._s - shifted * 322 : meta._s + shifted * 999;
}

type BooleanEncoded = { __: [[number[]]]; _: [number] };

function isBooleanEncoded(value: unknown): value is BooleanEncoded {
    return typeof value === "object" && value !== null && "__" in value && "_" in value;
}

function decodeBoolean(encoded: BooleanEncoded): boolean {
    const numbers = encoded.__[0][0];
    const rnd = encoded._[0];
    const sum = numbers.reduce((total, n) => total + n, 0);
    return ((sum % rnd) + rnd) % rnd === 0;
}

function isMappedObject(value: unknown): value is Mapped {
    return (
        typeof value === "object" && value !== null && !Array.isArray(value) &&
        "_0" in value && Array.isArray((value as Mapped)._0)
    );
}

function decodeValue(raw: unknown, seed: number): unknown {
    if (typeof raw === "string") {
        return decodeString(raw, seed);
    }
    if (isMappedObject(raw)) {
        // Nested plain object, encoded by recursing into mappingObject.
        return unmappingObject(raw);
    }
    if (Array.isArray(raw)) {
        if (raw.length === 1 && raw[0] === null) {
            return null;
        }
        if (raw.length === 1 && isNumberTriple(raw[0])) {
            return decodeNumberTriple(raw[0]);
        }
        if (raw.length === 2 && isNumberTriple(raw[1])) {
            return decodeNumberTriple(raw[1]);
        }
        if (raw.length === 1 && typeof raw[0] === "string") {
            // mappingObject's marker for arrays/nested objects/dates etc.:
            // a superjson string encoded the same way as a plain string.
            return superjson.parse(decodeString(raw[0], seed));
        }
    }
    if (isBooleanEncoded(raw)) {
        return decodeBoolean(raw);
    }
    throw new Error(`unmappingObject: unrecognized value encoding: ${JSON.stringify(raw)}`);
}

// entry key metadata as written by mappingObject: [[rnd], k, [[f]]]
type KeyMeta = [[number], number, [[number]]];

function decodeKey(encodedKey: string, meta: KeyMeta, seed: number): string {
    const rnd = meta[0][0];
    const k = meta[1];
    const f = meta[2][0][0];
    const keySeed = Math.floor(seed + ((rnd * 444) % 2) - f + (k >> 4));
    return decodeString(encodedKey, keySeed);
}

/**
 * Inverts `mappingObject`, at the top level or as flat object properties.
 * Nested plain objects are recovered by recursing back into
 * `unmappingObject`; arrays, dates, maps, sets, and other class instances
 * are recovered via the superjson string `mappingObject` encodes them as
 * (see `decodeValue`).
 */
export function unmappingObject(mapped: Mapped): unknown {
    const entries = mapped._0;
    const first = entries[0];
    if (!first || first[0] !== "_s" || typeof first[1] !== "number") {
        throw new Error("unmappingObject: missing or malformed seed entry");
    }
    const seed = first[1];

    const second = entries[1];
    if (Array.isArray(second) && second[0] === "_0") {
        return decodeValue(second[1], seed);
    }

    const result: Record<string, unknown> = {};
    const rest = entries.slice(1) as unknown[];
    for (const entry of rest) {
        if (!Array.isArray(entry) || !Array.isArray(entry[0]) || !Array.isArray(entry[1])) {
            throw new Error(
                `unmappingObject: malformed entry in mapped object: ${JSON.stringify(entry)}`,
            );
        }
        const [encodedKey, meta] = entry[0] as [string, KeyMeta];
        const key = decodeKey(encodedKey, meta, seed);
        const raw = entry[1][0];
        result[key] = decodeValue(raw, seed);
    }
    return result;
}


document.getElementById('mine')!.addEventListener('click', async () => {
  try {
    out.textContent = 'Requesting challenge…';
    const challenge = unmappingObject(await (await fetch('/api/challenge')).json()) as PowChallenge;
    const t0 = performance.now();
    const nonce = await solve(challenge, (n) => {
      out.textContent = `Mining (${challenge.difficultyBits} bits)… tried ${n.toLocaleString()}`;
    });
    const ms = (performance.now() - t0).toFixed(0);
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: challenge.id, nonce }),
    });
    const body = await res.json();
    out.textContent =
      `words:    ${challenge.words.join(' ')}\nnonce:    ${nonce}\ntime:     ${ms} ms\n` +
      `server:   ${res.status} ${JSON.stringify(body)}`;
  } catch (err) {
    out.textContent = `Error: ${err}`;
  }
});
