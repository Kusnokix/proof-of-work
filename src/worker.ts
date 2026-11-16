import init, { solve_range } from '../wasm/pkg/pow.js';
import type { WorkerIn, WorkerOut } from './pow';

const CHUNK = 20_000;
const post = (m: WorkerOut) => postMessage(m);

onmessage = async (e: MessageEvent<WorkerIn>) => {
  const { id, salt, words, a, b, difficultyBits } = e.data.challenge;
  await init();
  for (let start = 0; start < Number.MAX_SAFE_INTEGER; start += CHUNK) {
    const n = solve_range(id, salt, words, a, b, difficultyBits, start, CHUNK);
    if (n >= 0) return post({ type: 'done', nonce: String(n) });
    post({ type: 'progress', tried: start + CHUNK });
  }
};
