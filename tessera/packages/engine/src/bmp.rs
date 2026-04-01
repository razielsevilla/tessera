use borsh::{BorshDeserialize, BorshSerialize};
use wasm_bindgen::prelude::*;
use js_sys::Uint8Array;

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug)]
pub struct VisualMeta {
    pub color_h: u16,
    pub color_s: u8,
    pub color_l: u8,
    pub glow_intensity: u8,
    pub frame_tier: u8,
    pub texture_id: u8,
    pub flags: u8,
    pub reserved: [u8; 8],
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug)]
pub struct BundledMetadataPayload {
    pub version: u8,
    pub date_epoch: u32,
    pub vault_cid: [u8; 46],
    pub module_hash: [u8; 32],
    pub visual_meta: VisualMeta,
    pub zk_proof_ref: [u8; 32],
    pub signature: [u8; 64],
}

#[wasm_bindgen]
pub struct BmpBuilder {
    version: u8,
    date_epoch: u32,
    vault_cid: [u8; 46],
    module_hash: [u8; 32],
    visual_meta: VisualMeta,
    zk_proof_ref: [u8; 32],
    signature: [u8; 64],
}

#[wasm_bindgen]
impl BmpBuilder {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            version: 1,
            date_epoch: 0,
            vault_cid: [0; 46],
            module_hash: [0; 32],
            visual_meta: VisualMeta {
                color_h: 0,
                color_s: 0,
                color_l: 0,
                glow_intensity: 0,
                frame_tier: 0,
                texture_id: 0,
                flags: 0,
                reserved: [0; 8],
            },
            zk_proof_ref: [0; 32],
            signature: [0; 64],
        }
    }

    pub fn set_version(&mut self, version: u8) {
        self.version = version;
    }

    pub fn set_date_epoch(&mut self, date_epoch: u32) {
        self.date_epoch = date_epoch;
    }

    pub fn set_vault_cid(&mut self, cid_bytes: &[u8]) -> Result<(), JsValue> {
        if cid_bytes.len() != 46 {
            return Err(JsValue::from_str("CID must be exactly 46 bytes"));
        }
        self.vault_cid.copy_from_slice(cid_bytes);
        Ok(())
    }

    pub fn set_module_hash(&mut self, hash_bytes: &[u8]) -> Result<(), JsValue> {
        if hash_bytes.len() != 32 {
            return Err(JsValue::from_str("Module hash must be exactly 32 bytes"));
        }
        self.module_hash.copy_from_slice(hash_bytes);
        Ok(())
    }
    
    pub fn set_visual_meta(
        &mut self,
        color_h: u16,
        color_s: u8,
        color_l: u8,
        glow_intensity: u8,
        frame_tier: u8,
        texture_id: u8,
        flags: u8,
    ) {
        self.visual_meta = VisualMeta {
            color_h,
            color_s,
            color_l,
            glow_intensity,
            frame_tier,
            texture_id,
            flags,
            reserved: [0; 8],
        };
    }

    pub fn set_zk_proof_ref(&mut self, zk_bytes: &[u8]) -> Result<(), JsValue> {
        if zk_bytes.len() != 32 && !zk_bytes.is_empty() {
            return Err(JsValue::from_str("ZK proof ref must be exactly 32 bytes or empty"));
        }
        if zk_bytes.is_empty() {
            self.zk_proof_ref.fill(0);
        } else {
            self.zk_proof_ref.copy_from_slice(zk_bytes);
        }
        Ok(())
    }

    pub fn set_signature(&mut self, sig_bytes: &[u8]) -> Result<(), JsValue> {
        if sig_bytes.len() != 64 {
            return Err(JsValue::from_str("Signature must be exactly 64 bytes"));
        }
        self.signature.copy_from_slice(sig_bytes);
        Ok(())
    }

    /// Serializes the struct to a compact binary format compatible with Anchor (Borsh)
    pub fn serialize(&self) -> Result<Uint8Array, JsValue> {
        let payload = BundledMetadataPayload {
            version: self.version,
            date_epoch: self.date_epoch,
            vault_cid: self.vault_cid,
            module_hash: self.module_hash,
            visual_meta: self.visual_meta.clone(),
            zk_proof_ref: self.zk_proof_ref,
            signature: self.signature,
        };

        match borsh::to_vec(&payload) {
            Ok(bytes) => {
                let js_array = js_sys::Uint8Array::new_with_length(bytes.len() as u32);
                js_array.copy_from(&bytes);
                Ok(js_array)
            }
            Err(e) => Err(JsValue::from_str(&format!("Serialization failed: {}", e))),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bmp_serialization() {
        let mut builder = BmpBuilder::new();
        builder.set_version(1);
        builder.set_date_epoch(12345);
        
        // Mock 46 byte CID
        let mut cid = vec![0; 46];
        cid[0] = 1;
        cid[45] = 2;
        builder.set_vault_cid(&cid).unwrap();
        
        let mut hash = vec![0; 32];
        hash[0] = 3;
        builder.set_module_hash(&hash).unwrap();
        
        builder.set_visual_meta(120, 255, 128, 100, 2, 5, 1);
        
        let payload = BundledMetadataPayload {
            version: builder.version,
            date_epoch: builder.date_epoch,
            vault_cid: builder.vault_cid,
            module_hash: builder.module_hash,
            visual_meta: builder.visual_meta.clone(),
            zk_proof_ref: builder.zk_proof_ref,
            signature: builder.signature,
        };
        
        let bytes = borsh::to_vec(&payload).expect("Serialization failed");
        
        assert!(bytes.len() < 256, "BMP must be less than 256 bytes, got {}", bytes.len());
        
        // Let's also check deserialization works
        let decoded: BundledMetadataPayload = borsh::from_slice(&bytes).expect("Deserialization failed");
        assert_eq!(decoded.version, 1);
        assert_eq!(decoded.date_epoch, 12345);
        assert_eq!(decoded.vault_cid[0], 1);
        assert_eq!(decoded.visual_meta.color_h, 120);
    }
}
