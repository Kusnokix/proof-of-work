import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createRequire } from 'node:module';
import { randomBytes, randomInt } from 'node:crypto';
import superjson from "superjson";

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

const murmur128 = function (t: string, seed: number) {
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

// Plain object literal (or Object.create(null)) vs. a class instance
// (Date, Map, Set, RegExp, custom class, ...).
function isPlainObject(value: object): boolean {
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

function encodeString(str: string, seed: number): string {
    const encoded = str
        .split("")
        .map((char) => {
            const charCode = char.charCodeAt(0);
            const encodedCharCode = (charCode + seed) % 128;
            return String.fromCharCode(encodedCharCode);
        })
        .join("");
    const octal = encoded.charCodeAt(0).toString(8);
    const hash = murmur128(encoded, seed);
    const strs = [encoded, octal, hash].join("‎");
    return btoa(String.fromCharCode(...new TextEncoder().encode(strs)));
}


function findInRange(
    min: number,
    max: number,
    rnd: number,
    residue: number,
    mustMatch: boolean,
) {
    const candidates = [];
    for (let n = min; n <= max; n++) {
        const matches = ((n % rnd) + rnd) % rnd === residue;
        if (mustMatch ? matches : !matches) candidates.push(n);
    }
    if (candidates.length === 0) {
        throw new Error("No valid number found in range");
    }
    // pick randomly among valid candidates instead of always the first
    return candidates[Math.floor(Math.random() * candidates.length)];
}
function generateNumbers(length: number, rnd: number, value: boolean) {
    if (rnd < 1) throw new Error("rnd must be >= 1");
    if (rnd === 1 && !value) {
        throw new Error(
            "Impossible: rnd=1 means sum % rnd is always 0, so 'not divisible' can never be satisfied",
        );
    }

    const min = 1;
    const max = 100;
    const mod = (n: number, m: number) => ((n % m) + m) % m;

    const numbers = Array.from(
        { length: length - 1 },
        () => Math.floor(Math.random() * 100) + 1,
    );
    const partialSum = numbers.reduce((a, b) => a + b, 0);

    const targetResidue = mod(-partialSum, rnd); // residue last number needs for sum % rnd === 0

    let lastNum;
    if (value) {
        lastNum = findInRange(min, max, rnd, targetResidue, true);
    } else {
        lastNum = findInRange(min, max, rnd, targetResidue, false);
    }

    numbers.push(lastNum!);
    return numbers;
}


export function mappingObject<T>(obj: T): { _0: Array<[string, unknown]> } {
    const seed = Math.floor(Math.floor(Math.random() * 9e9));
    const entries = Object.entries(obj as object);
    let encodedValue: unknown = null
    if (typeof obj === "string") {
        encodedValue = encodeString(obj, seed);
    } else if (typeof obj == "number") {
        const k = Math.floor(Math.random() * 9e9);
        const f = Math.floor(Math.random() * 9e9);
        const isMod = k % (Math.floor(Math.random() * 10) + 1) == 0;
        const _s = isMod ? (obj + (k >> f) * 322) : (obj - (k >> f) * 999);
        encodedValue = [[{ 0: k }, [f], [
            {
                _s: _s,
                _: isMod ? [] : [null]
            }
        ]]]
    } else if (typeof obj === 'boolean') {
        const length = Math.floor(Math.random() * 20) + 1;
        const rnd = Math.floor(Math.random() * 16) + 3;
        const numbers = generateNumbers(length, rnd, obj);
        encodedValue = {
            __: [[numbers]],
            _: [rnd],
        };
    } else {
        if (Array.isArray(obj)) {
            encodedValue = obj.map((_value, _index) => ({
                [`_${_index}`]: mappingObject(_value as object)
            }))
        }
    }
    if (obj == null) {
        encodedValue = [null]
    }
    if (encodedValue != null) {
        return { _0: [["_s", seed], ["_0", encodedValue]] }
    }
    const mappedEntries = entries.map(([key, value]) => {
        let encodedValue: unknown;
        if (typeof value === "string") {
            encodedValue = encodeString(value, seed);
        } else if (typeof value == "number") {
            const k = Math.floor(Math.random() * 9e9);
            const f = Math.floor(Math.random() * 9e9);
            const isMod = k % (Math.floor(Math.random() * 10) + 1) == 0;
            const _s = isMod ? (value + (k >> f) * 322) : (value - (k >> f) * 999);
            encodedValue = [[encodeString(key, Math.floor(value + seed % 128))], [{ 0: k }, [f], [
                {
                    _s: _s,
                    _: isMod ? [] : [null]
                }
            ]]]
        } else if (typeof value === 'boolean') {
            const length = Math.floor(Math.random() * 20) + 1;
            const rnd = Math.floor(Math.random() * 16) + 3;
            const numbers = generateNumbers(length, rnd, value);
            encodedValue = {
                __: [[numbers]],
                _: [rnd],
            };
        } else if (value === null) {
            encodedValue = [null]
        } else if (typeof value == "object") {
            if (!Array.isArray(value) && isPlainObject(value)) {
                // Nested plain object: recurse, keeping the same Mapped shape
                // paired with this property's encoded key (see below).
                encodedValue = mappingObject(value)
            } else {
                // Arrays, dates, maps, sets, custom class instances, etc.
                // don't fit this format's key/value shape, so serialize the
                // whole value to a superjson string and encode that string
                // like any other string value.
                encodedValue = [encodeString(superjson.stringify(value), seed)]
            }
        }
        const rnd = Math.floor(Math.random() * 9e9);
        const k = Math.floor(Math.random() * 9e9);
        const f = Math.floor(Math.random() * 9e9);
        return [[encodeString(key, Math.floor(seed + ((rnd * 444) % 2) - f + (k >> 4))), [
            [rnd], k, [[f]]
        ]], [
            encodedValue
        ]];
    });
    return { _0: [["_s", seed], ...mappedEntries] as Array<[string, unknown]> }
}

const pow = createRequire(import.meta.url)('../wasm/pkg-node/pow.js') as {
  verify(id: string, salt: string, words: string[], a: number, b: number, bits: number, nonce: string): boolean;
};

type Challenge = {
  id: string;
  salt: string;
  words: string[];
  a: number;
  b: number;
  difficultyBits: number;
  expiresAt: number;
};

const PORT = Number(process.env.PORT ?? 3001);
const DIFFICULTY_BITS = Number(process.env.POW_BITS ?? 18);
const TTL_MS = 60_000;
const WORDLIST = ['apple', 'banana', 'cherry', 'delta', 'ember', 'falcon', 'granite', 'harbor', 'ivory', 'juniper'];

const challenges = new Map<string, Challenge>(); // use Redis/DB when running >1 instance
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string, max = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { count: 1, reset: now + windowMs });
    return false;
  }
  return ++h.count > max;
}

function createChallenge(): Challenge {
  const n = randomInt(2, 5);
  const words = Array.from({ length: n }, () => WORDLIST[randomInt(WORDLIST.length)]!);
  const c: Challenge = {
    id: randomBytes(16).toString('hex'),
    salt: randomBytes(16).toString('hex'),
    words,
    a: randomBytes(4).readUInt32BE(0),
    b: randomBytes(4).readUInt32BE(0),
    difficultyBits: DIFFICULTY_BITS,
    expiresAt: Date.now() + TTL_MS,
  };
  challenges.set(c.id, c);
  return c;
}

setInterval(() => {
  const now = Date.now();
  for (const [id, c] of challenges) if (c.expiresAt < now) challenges.delete(id);
  for (const [ip, h] of hits) if (h.reset < now) hits.delete(ip);
}, 10_000).unref();

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<any> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 4096) throw new Error('too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

createServer(async (req, res) => {
  const ip = req.socket.remoteAddress ?? 'unknown';
  try {
    if (req.method === 'GET' && req.url === '/api/challenge') {
      if (rateLimited(ip)) return send(res, 429, { error: 'rate limited' });
      return send(res, 200, mappingObject(createChallenge()));
    }

    if (req.method === 'POST' && req.url === '/api/verify') {
      if (rateLimited(ip, 120)) return send(res, 429, { error: 'rate limited' });
      const { id, nonce } = await readJson(req);
      if (typeof id !== 'string' || typeof nonce !== 'string') return send(res, 400, { error: 'bad request' });

      // Always use the stored challenge, never parameters supplied by the client.
      const c = challenges.get(id);
      if (!c) return send(res, 404, { ok: false, error: 'unknown or used challenge' });
      if (c.expiresAt < Date.now()) {
        challenges.delete(id);
        return send(res, 410, { ok: false, error: 'expired' });
      }
      const ok = pow.verify(c.id, c.salt, c.words, c.a, c.b, c.difficultyBits, nonce);
      if (ok) challenges.delete(id); // one-time use
      return send(res, ok ? 200 : 422, { ok });
    }

    send(res, 404, { error: 'not found' });
  } catch {
    send(res, 400, { error: 'bad request' });
  }
}).listen(PORT, () => console.log(`PoW server on http://localhost:${PORT} (${DIFFICULTY_BITS} bits)`));
