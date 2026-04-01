use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use wasm_bindgen::prelude::*;

/// Verifies an Ed25519 signature against a given public key and message.
///
/// Returns `true` if the signature is valid, `false` otherwise.
pub fn verify_signature_core(
    public_key_bytes: &[u8; 32],
    message: &[u8],
    signature_bytes: &[u8; 64],
) -> bool {
    let verifying_key = match VerifyingKey::from_bytes(public_key_bytes) {
        Ok(vk) => vk,
        Err(_) => return false,
    };

    let signature = Signature::from_bytes(signature_bytes);
    verifying_key.verify(message, &signature).is_ok()
}

/// WASM binding to verify an Ed25519 signature. 
/// Safely returns false on invalid input lengths or invalid keys/signatures.
#[wasm_bindgen(js_name = verifySignature)]
pub fn verify_signature(
    public_key_bytes: &[u8],
    message: &[u8],
    signature_bytes: &[u8],
) -> bool {
    if public_key_bytes.len() != 32 || signature_bytes.len() != 64 {
        return false;
    }

    let mut pk_arr = [0u8; 32];
    pk_arr.copy_from_slice(public_key_bytes);

    let mut sig_arr = [0u8; 64];
    sig_arr.copy_from_slice(signature_bytes);

    verify_signature_core(&pk_arr, message, &sig_arr)
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};

    #[test]
    fn test_verify_signature_valid() {
        let signing_key = SigningKey::from_bytes(&[1u8; 32]);
        let verifying_key = signing_key.verifying_key();
        
        let message = b"this is a test message to sign";
        let signature = signing_key.sign(message);
        
        let is_valid = verify_signature_core(
            verifying_key.as_bytes(),
            message,
            &signature.to_bytes()
        );
        
        assert!(is_valid, "Valid signature should verify successfully");
    }

    #[test]
    fn test_verify_signature_invalid() {
        let signing_key = SigningKey::from_bytes(&[1u8; 32]);
        let verifying_key = signing_key.verifying_key();
        
        let message = b"this is a test message to sign";
        let wrong_message = b"this is a different message";
        let signature = signing_key.sign(message);
        
        let is_valid = verify_signature_core(
            verifying_key.as_bytes(),
            wrong_message,
            &signature.to_bytes()
        );
        
        assert!(!is_valid, "Invalid signature should not verify");
    }

    #[test]
    fn test_wasm_wrapper_invalid_length() {
        let pk = vec![0u8; 31]; // wrong length
        let sig = vec![0u8; 64];
        let msg = b"test";
        
        assert!(!verify_signature(&pk, msg, &sig));
    }
}
