use hkdf::Hkdf;
use sha2::Sha256;
use wasm_bindgen::prelude::*;

const OUTPUT_KEY_LEN: usize = 32;

/// Core logic: Derives a 32-byte AES-256-GCM key from the given input keying material (e.g., a wallet signature)
/// and an optional salt.
pub fn derive_key_core(ikm: &[u8], salt: Option<&[u8]>, info: &[u8]) -> Result<Vec<u8>, String> {
    if ikm.is_empty() {
        return Err("Input keying material (IKM) cannot be empty".to_string());
    }

    let (_, hkdf) = Hkdf::<Sha256>::extract(salt, ikm);
    let mut okm = vec![0u8; OUTPUT_KEY_LEN];
    
    hkdf.expand(info, &mut okm)
        .map_err(|_| "Failed to expand HKDF".to_string())?;

    Ok(okm)
}

/// WASM Binding for deriving a vault key.
#[wasm_bindgen(js_name = deriveVaultKey)]
pub fn derive_vault_key(ikm: &[u8], salt: Option<Vec<u8>>, info: &[u8]) -> Result<Vec<u8>, JsValue> {
    derive_key_core(ikm, salt.as_deref(), info).map_err(|e| JsValue::from_str(&e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_derive_key_core() {
        let ikm = b"wallet-signature-bytes-or-secret";
        let salt = b"tessera-salt";
        let info = b"tessera-vault-encryption-key";

        let key1 = derive_key_core(ikm, Some(salt), info).unwrap();
        let key2 = derive_key_core(ikm, Some(salt), info).unwrap();

        assert_eq!(key1.len(), OUTPUT_KEY_LEN);
        assert_eq!(key1, key2, "Derived keys from same inputs must match");
    }

    #[test]
    fn test_derive_key_different_info() {
        let ikm = b"wallet-signature-bytes-or-secret";
        let salt = b"tessera-salt";
        
        let key1 = derive_key_core(ikm, Some(salt), b"info-1").unwrap();
        let key2 = derive_key_core(ikm, Some(salt), b"info-2").unwrap();

        assert_ne!(key1, key2, "Derived keys with different info must differ");
    }

    #[test]
    fn test_derive_key_no_salt() {
        let ikm = b"wallet-signature-bytes-or-secret";
        let info = b"application-info";

        let key1 = derive_key_core(ikm, None, info).unwrap();
        let key2 = derive_key_core(ikm, None, info).unwrap();

        assert_eq!(key1.len(), OUTPUT_KEY_LEN);
        assert_eq!(key1, key2);
    }
}
