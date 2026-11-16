use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;

/// m = (n^2 + a*n + b) mod 2^64
fn mix(a: u32, b: u32, n: u64) -> u64 {
    n.wrapping_mul(n)
        .wrapping_add((a as u64).wrapping_mul(n))
        .wrapping_add(b as u64)
}

/// "pow-v1|id|salt|word1|...|wordN|a|b|mixed|nonce"
fn build_input(prefix: &str, a: u32, b: u32, nonce: u64) -> String {
    format!("{prefix}|{}|{nonce}", mix(a, b, nonce))
}

fn prefix(id: &str, salt: &str, words: &[String], a: u32, b: u32) -> String {
    format!("pow-v1|{id}|{salt}|{}|{a}|{b}", words.join("|"))
}

fn digest(input: &str) -> [u8; 32] {
    Sha256::digest(input.as_bytes()).into()
}

fn leading_zero_bits(d: &[u8]) -> u32 {
    let mut bits = 0;
    for &byte in d {
        if byte == 0 {
            bits += 8;
        } else {
            bits += byte.leading_zeros();
            break;
        }
    }
    bits
}

/// Try nonces in [start, start + count). Returns the first valid nonce, or -1.
#[wasm_bindgen]
#[allow(clippy::too_many_arguments)]
pub fn solve_range(
    id: &str, salt: &str, words: Vec<String>,
    a: u32, b: u32, difficulty_bits: u32,
    start: f64, count: u32,
) -> f64 {
    let pre = prefix(id, salt, &words, a, b);
    let start = start as u64;
    for nonce in start..start.saturating_add(count as u64) {
        let d = digest(&build_input(&pre, a, b, nonce));
        if leading_zero_bits(&d) >= difficulty_bits {
            return nonce as f64;
        }
    }
    -1.0
}

/// Server-side check: one SHA-256. `nonce` is a decimal string (u64 range).
#[wasm_bindgen]
#[allow(clippy::too_many_arguments)]
pub fn verify(
    id: &str, salt: &str, words: Vec<String>,
    a: u32, b: u32, difficulty_bits: u32, nonce: &str,
) -> bool {
    let Ok(n) = nonce.parse::<u64>() else { return false };
    if nonce.len() > 1 && nonce.starts_with('0') {
        return false;
    }
    let pre = prefix(id, salt, &words, a, b);
    leading_zero_bits(&digest(&build_input(&pre, a, b, n))) >= difficulty_bits
}

/// Hex digest for display.
#[wasm_bindgen]
pub fn hash_hex(id: &str, salt: &str, words: Vec<String>, a: u32, b: u32, nonce: f64) -> String {
    let pre = prefix(id, salt, &words, a, b);
    hex::encode(digest(&build_input(&pre, a, b, nonce as u64)))
}
