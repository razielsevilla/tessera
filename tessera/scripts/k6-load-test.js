import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Tessera Load Test - 1,000 Concurrent Wallet Connections
 * Run using: k6 run k6-load-test.js
 */

export const options = {
    scenarios: {
        wallet_connections: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 500 },  // Ramp up to 500 users
                { duration: '1m', target: 1000 },  // Ramp up to 1000 concurrent wallet connections
                { duration: '30s', target: 1000 }, // Hold 1000 connections
                { duration: '30s', target: 0 },    // Ramp down to 0
            ],
            gracefulRampDown: '15s',
        },
    },
};

export default function () {
    // 1. Simulate the frontend loading (Next.js serving the app shell)
    const res1 = http.get('http://localhost:3000/');
    check(res1, {
        'homepage loaded (200)': (r) => r.status === 200,
    });

    // 2. Simulate the wallet connection RPC call (e.g. getHealth or getMultipleAccounts)
    // Here we query the Solana RPC endpoint as the wallet adapter would during initialization
    const rpcPayload = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth',
    });
    
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res2 = http.post('http://127.0.0.1:8899/', rpcPayload, params);
    check(res2, {
        'RPC responds gracefully (200)': (r) => r.status === 200,
    });

    // Simulate user reading the page / taking a moment before interacting
    sleep(1);
}
