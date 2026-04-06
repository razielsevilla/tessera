import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Tessera } from '../target/types/tessera';

async function main() {
    console.log("Starting local devnet deployment...");
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    // Provide the generated IDL and program target
    // In a real environment, you might deploy using the CLI,
    // but this script is structured to initialize or verify deployment.
    // The Program id is defined in Anchor.toml
    const program = anchor.workspace.Tessera as Program<Tessera>;

    console.log(Program ID: );

    try {
        const tx = await program.methods
            .initialize()
            .rpc();
        
        console.log("Tessera Smart Contract Initialized Successfully!");
        console.log(Transaction Signature: );
    } catch (err) {
        console.error("Initialization Failed:", err);
    }
}

main().then(() => console.log("Deployment Script Finished.")).catch((e) => {
    console.error(e);
    process.exit(1);
});
