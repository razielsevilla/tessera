use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use wasm_bindgen::prelude::*;

const NONCE_LEN: usize = 12;
const KEY_LEN: usize = 32;

/// Core logic: Encrypts arbitrary bytes using AES-256-GCM.
pub fn encrypt_blob_core(data: &[u8], key: &[u8]) -> Result<Vec<u8>, String> {
    if key.len() != KEY_LEN {
        return Err("Invalid key length: must be precisely 32 bytes".to_string());
    }
    
    let mut nonce_bytes = [0u8; NONCE_LEN];
    getrandom::getrandom(&mut nonce_bytes).map_err(|_| "Failed to generate random nonce".to_string())?;
    
    let nonce = Nonce::from_slice(&nonce_bytes);
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|_| "Failed to initialize cipher".to_string())?;
        
    let ciphertext = cipher.encrypt(nonce, data)
        .map_err(|e| format!("Encryption failed: {:?}", e))?;
        
    let mut result = Vec::with_capacity(NONCE_LEN + ciphertext.len());
    result.extend_from_slice(&nonce_bytes);
    result.extend_from_slice(&ciphertext);
    
    Ok(result)
}

/// Core logic: Decrypts a blob returned by `encrypt_blob_core`.
pub fn decrypt_blob_core(encrypted_data: &[u8], key: &[u8]) -> Result<Vec<u8>, String> {
    if key.len() != KEY_LEN {
        return Err("Invalid key length: must be precisely 32 bytes".to_string());
    }
    
    if encrypted_data.len() < NONCE_LEN {
        return Err("Encrypted data is too short to contain a nonce".to_string());
    }
    
    let (nonce_bytes, ciphertext) = encrypted_data.split_at(NONCE_LEN);
    let nonce = Nonce::from_slice(nonce_bytes);
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|_| "Failed to initialize cipher".to_string())?;
        
    let plaintext = cipher.decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed: signature verification or malformed ciphertext".to_string())?;
        
    Ok(plaintext)
}

/// WASM Binding for encryption
#[wasm_bindgen(js_name = encryptBlob)]
pub fn encrypt_blob(data: &[u8], key: &[u8]) -> Result<Vec<u8>, JsValue> {
    encrypt_blob_core(data, key).map_err(|e| JsValue::from_str(&e))
}

/// WASM Binding for decryption
#[wasm_bindgen(js_name = decryptBlob)]
pub fn decrypt_blob(encrypted_data: &[u8], key: &[u8]) -> Result<Vec<u8>, JsValue> {
    decrypt_blob_core(encrypted_data, key).map_err(|e| JsValue::from_str(&e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encryption_roundtrip() {
        let plaintext = b"{\"key\":\"value\",\"arbitrary\":\"json blob payload here!\"}";
        let key = [0x42u8; KEY_LEN];
        
        let encrypted = encrypt_blob_core(plaintext, &key).expect("Encryption failed");
        
        assert_eq!(encrypted.len(), plaintext.len() + NONCE_LEN + 16);
        
        let decrypted = decrypt_blob_core(&encrypted, &key).expect("Decryption failed");
        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn test_invalid_key_length() {
        let plaintext = b"data";
        let short_key = [0x42u8; 16];
        
        let res = encrypt_blob_core(plaintext, &short_key);
        assert!(res.is_err());
    }

    #[test]
    fn test_corrupted_ciphertext_decryption() {
        let plaintext = b"secret data";
        let key = [0x2Au8; KEY_LEN];
        
        let mut encrypted = encrypt_blob_core(plaintext, &key).expect("Encryption failed");
        
        let len = encrypted.len();
        encrypted[len - 5] ^= 0x01; 
        
        let res = decrypt_blob_core(&encrypted, &key);
        assert!(res.is_err(), "Decryption should fail since the message was modified");
    }
}
