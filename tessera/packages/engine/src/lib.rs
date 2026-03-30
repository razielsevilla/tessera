use wasm_bindgen::prelude::*;

pub mod encrypt;
pub mod key_derive;
pub mod bmp;
pub mod hash;
pub mod signature;
pub mod utils;

#[wasm_bindgen]
pub fn init_panic_hook() {
    // Provides better error messages in the browser console
    console_error_panic_hook::set_once();
}