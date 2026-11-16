# Proof of Work

A SHA-256 proof-of-work demo. The server issues a challenge made of random words and
math parameters. The browser searches for a nonce that gives a hash with enough leading
zero bits. The server checks the answer with a single hash.

- **Frontend:** Vite + TypeScript. Mining runs in a Web Worker.
- **Hashing and verification:** Rust compiled to WASM. The same code runs in the browser and on the server.
- **Server:** plain Node `http`, running the `.ts` file directly (Node 24+ type stripping).

## Requirements

- Node.js 24+
- Rust, with the WASM target: `rustup target add wasm32-unknown-unknown`
- [`wasm-pack`](https://rustwasm.github.io/wasm-pack/)

## Getting started

```sh
npm install
npm run wasm       # build the web and Node WASM packages
npm run server     # API on http://localhost:3001
npm run dev        # Vite on http://localhost:5173 (proxies /api to :3001)
```

Run `server` and `dev` in separate terminals. Open the Vite URL and click
**Get challenge & mine**.

If the page shows `502 Bad Gateway` for `/api/challenge`, the API server isn't running.

### Scripts

| Script               | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `npm run wasm`       | Build both WASM packages (`wasm:web`, `wasm:node`) |
| `npm run dev`        | Build the web WASM, then start Vite               |
| `npm run build`      | Build WASM, type-check with `tsc`, bundle with Vite |
| `npm run server`     | Start the API server                              |
| `npm run dev:server` | Start the API server with `--watch`               |

### Server configuration

| Env var    | Default | Meaning                                  |
| ---------- | ------- | ---------------------------------------- |
| `PORT`     | `3001`  | API port                                 |
| `POW_BITS` | `18`    | Required leading zero bits in the hash   |

## How it works

The challenge:

```json
{
  "id": "…", "salt": "…", "words": ["apple", "juniper", "cherry"],
  "a": 173, "b": 913, "difficultyBits": 18, "expiresAt": 1794875100000
}
```

For a nonce `n`:

```
mixed = (n² + a·n + b) mod 2⁶⁴
input = "pow-v1|id|salt|word1|…|wordN|a|b|mixed|n"
valid = the first difficultyBits bits of SHA-256(input) are zero
```

The words are extra hash input. Security comes from the fresh random salt and id
(no replaying or precomputing) and from the difficulty.

| Difficulty | Expected hashes |
| ---------- | --------------- |
| 16 bits    | 65,536          |
| 18 bits    | 262,144         |
| 20 bits    | 1,048,576       |
| 24 bits    | 16,777,216      |

### API

- `GET /api/challenge` returns a new challenge. The server stores it for 60 seconds.
- `POST /api/verify` with `{ "id": "…", "nonce": "123" }`:
  - `200 {ok:true}` when valid. The challenge is consumed (one-time use).
  - `422` for a wrong nonce, `404` for an unknown or used challenge, `410` if expired.
  - `429` when rate limited (per IP, in memory).

The server always verifies against the stored challenge, never against parameters sent by the client.

## Layout

```
index.html          page
src/main.ts         UI: fetch challenge, mine, submit nonce
src/worker.ts       mining loop (calls WASM solve_range in chunks)
src/pow.ts          shared types
server/index.ts     API server
wasm/src/lib.rs     solve_range, verify, hash_hex
```

## Production notes

- Challenges are kept in memory. Use Redis or a database if you run more than one instance or need them to survive restarts.
- Bind challenges to a user session so one user's proof can't be used by another.
- A wrong nonce doesn't consume the challenge. Add an attempt limit if that matters.
- Benchmark difficulty on real user devices before raising it.
