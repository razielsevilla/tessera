use ed25519_dalek::{Signer, SigningKey};
use tessera_engine::bmp::BundledMetadataPayload;
use tessera_engine::encrypt::{encrypt_blob_core};
use tessera_engine::signature::verify_signature_core;

#[test]
fn test_integration_full_pipeline() {
    // 1. Encrypt Data
    let plaintext = b"{\"key\":\"value\",\"secret\":\"tessera_test\"}";
    let encryption_key = [0x42u8; 32];
    let encrypted = encrypt_blob_core(plaintext, &encryption_key).expect("Encryption failed");
    assert!(encrypted.len() > plaintext.len());

    // 2. Construct BMP Base
    let mut payload = BundledMetadataPayload {
        version: 1,
        date_epoch: 12345678,
        vault_cid: [1u8; 46],
        module_hash: [2u8; 32],
        visual_meta: tessera_engine::bmp::VisualMeta {
            color_h: 120,
            color_s: 255,
            color_l: 128,
            glow_intensity: 100,
            frame_tier: 2,
            texture_id: 5,
            flags: 1,
            reserved: [0; 8],
        },
        zk_proof_ref: [0u8; 32],
        signature: [0u8; 64], // empty initially
    };

    // 3. Serialize BMP (unsigned)
    let unsigned_bytes = borsh::to_vec(&payload).expect("Serialization failed");

    // 4. Sign the serialized unsigned BMP
    let signing_key = SigningKey::from_bytes(&[1u8; 32]);
    let verifying_key = signing_key.verifying_key();
    let signature = signing_key.sign(&unsigned_bytes);

    // 5. Append Signature to BMP
    payload.signature = signature.to_bytes();
    
    // 6. Serialize the final BMP (with signature)
    let final_bmp_bytes = borsh::to_vec(&payload).expect("Final serialization failed");

    // 7. Deserialize
    let decoded_bmp: BundledMetadataPayload = borsh::from_slice(&final_bmp_bytes).expect("Deserialization failed");

    // 8. Verify the signature
    // Reconstruct the bytes that were signed
    let mut verify_payload = decoded_bmp.clone();
    verify_payload.signature = [0u8; 64];
    let verify_bytes = borsh::to_vec(&verify_payload).expect("Re-serialization failed");

    let is_valid = verify_signature_core(
        verifying_key.as_bytes(),
        &verify_bytes,
        &decoded_bmp.signature,
    );

    assert!(is_valid, "Signature must verify against the payload");
}
