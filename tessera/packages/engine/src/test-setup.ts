import fs from 'fs';
import path from 'path';

// Polyfill fetch to load the WASM binary from the file system.
// wasm-bindgen --target web output attempts to fetch the .wasm at initialization.
const wasmPath = path.resolve(__dirname, '../../tessera-engine/pkg/tessera_engine_bg.wasm');

if (global.fetch === undefined || (global.fetch as any).polyfill) {
  (global as any).fetch = async (url: string) => {
    // Check if the URL points to our WASM binary
    if (url.includes('.wasm')) {
      if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM binary not found at ${wasmPath}. Run '@tessera/engine-core' build first.`);
      }
      
      const buffer = fs.readFileSync(wasmPath);
      return {
        ok: true,
        status: 200,
        arrayBuffer: async () => {
          // Use internal buffer for conversion
          const arrayBuffer = new ArrayBuffer(buffer.length);
          const view = new Uint8Array(arrayBuffer);
          view.set(buffer);
          return arrayBuffer;
        }
      } as Response;
    }
    throw new Error(`Mock fetch received unexpected URL: ${url}`);
  };
  (global.fetch as any).polyfill = true;
}
