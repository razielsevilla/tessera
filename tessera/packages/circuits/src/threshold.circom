pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

// Circuit to prove that an internally held value (e.g. hours studied) 
// meets or exceeds a public threshold without revealing the exact value.
template ThresholdProof(n) {
    // n = number of bits (e.g., 32 bits for up to ~4 billion hours)
    signal input value;
    signal input threshold;
    signal output is_valid;
    
    // We use GreaterEqThan component from circomlib
    component gte = GreaterEqThan(n);
    gte.in[0] <== value;
    gte.in[1] <== threshold;
    
    // Constraint: is_valid must be 1 (true)
    is_valid <== gte.out;
    is_valid === 1;
}

// Our main component takes threshold as public, value as private
component main {public [threshold]} = ThresholdProof(32);
