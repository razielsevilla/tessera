use poseidon_hash::{Goldilocks, hash_no_pad, hash_out_to_bytes_le};
use wasm_bindgen::prelude::*;

/// Core logic: Computes a Poseidon2 hash of the given module scores (u64 values).
/// Returns a perfectly sized 32-byte commitment suitable for on-chain storage and ZK proofs.
pub fn hash_module_scores_core(scores: &[u64]) -> [u8; 32] {
    let elements: Vec<Goldilocks> = scores
        .iter()
        .map(|&s| Goldilocks::from_noncanonical_u64(s))
        .collect();

    let hash_out = hash_no_pad(&elements);
    hash_out_to_bytes_le(hash_out)
}

/// WASM Binding for hashing an array of module scores.
/// Returns a 32-byte Uint8Array.
#[wasm_bindgen(js_name = hashModuleScores)]
pub fn hash_module_scores(scores: &[u64]) -> Result<Vec<u8>, JsValue> {
    Ok(hash_module_scores_core(scores).to_vec())
}

/// Helper function to compute poseidon hash for exactly 32 bytes of byte data, 
/// treated as 4 field elements. Useful for general hashing tasks if needed.
pub fn hash_bytes_core(data: &[u8]) -> [u8; 32] {
    // Pad or chunk bytes into 8-byte u64s
    let mut elements = Vec::new();
    for chunk in data.chunks(8) {
        let mut arr = [0u8; 8];
        let copy_len = chunk.len();
        arr[..copy_len].copy_from_slice(chunk);
        let val = u64::from_le_bytes(arr);
        elements.push(Goldilocks::from_noncanonical_u64(val));
    }
    
    let hash_out = hash_no_pad(&elements);
    hash_out_to_bytes_le(hash_out)
}

#[wasm_bindgen(js_name = hashBytes)]
pub fn hash_bytes(data: &[u8]) -> Result<Vec<u8>, JsValue> {
    Ok(hash_bytes_core(data).to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_module_scores_determinism() {
        let scores = vec![100, 50, 25, 0];
        let hash1 = hash_module_scores_core(&scores);
        let hash2 = hash_module_scores_core(&scores);

        assert_eq!(hash1.len(), 32);
        assert_eq!(hash1, hash2, "Poseidon hash must be deterministic");
    }

    #[test]
    fn test_hash_module_scores_collision_resistance() {
        let hash1 = hash_module_scores_core(&[100, 50]);
        let hash2 = hash_module_scores_core(&[100, 51]);
        assert_ne!(hash1, hash2);
    }
    
    #[test]
    fn test_hash_bytes() {
        let empty1 = hash_bytes_core(b"");
        let empty2 = hash_bytes_core(b"");
        assert_eq!(empty1, empty2);
        
        let msg = hash_bytes_core(b"tessera vault string data");
        assert_eq!(msg.len(), 32);
    }
}
