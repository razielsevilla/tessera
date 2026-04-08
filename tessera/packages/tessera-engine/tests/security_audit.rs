use tessera_engine::encrypt::{encrypt_blob_core, decrypt_blob_core};

#[test]
fn perform_differential_avalanche_test() {
    let key = [0x55u8; 32];
    let baseline = vec![0u8; 256];
    
    let ct1 = encrypt_blob_core(&baseline, &key).expect("Encryption failed");
    
    let mut diff_1 = vec![0u8; 256];
    diff_1[0] = 1; 
    let ct2 = encrypt_blob_core(&diff_1, &key).expect("Encryption failed");
    
    let min_len = usize::min(ct1.len(), ct2.len());
    let mut different_bits = 0;
    for i in 0..min_len {
        let xor = ct1[i] ^ ct2[i];
        different_bits += xor.count_ones();
    }
    
    let total_bits = (min_len * 8) as f64;
    let avalanche_percent = (different_bits as f64 / total_bits) * 100.0;
    
    assert!(avalanche_percent > 40.0 && avalanche_percent < 60.0, "Avalanche effect must be near 50%");
}
