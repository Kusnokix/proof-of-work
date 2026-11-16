export type PowChallenge = {
  id: string;
  salt: string;
  words: string[];
  a: number;
  b: number;
  difficultyBits: number;
  expiresAt: number;
};

export type WorkerIn = { challenge: PowChallenge };
export type WorkerOut = { type: 'progress'; tried: number } | { type: 'done'; nonce: string };
