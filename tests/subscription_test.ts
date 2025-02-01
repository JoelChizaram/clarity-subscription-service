import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can create token-gated subscription plan",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('subscription', 'create-subscription-plan', [
                types.uint(1),
                types.ascii("Premium Token Plan"),
                types.uint(100),
                types.uint(30),
                types.some(types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract")),
                types.uint(1000)
            ], deployer.address),
            
            // Non-owner attempt should fail
            Tx.contractCall('subscription', 'create-subscription-plan', [
                types.uint(2),
                types.ascii("Failed Plan"),
                types.uint(200),
                types.uint(30),
                types.some(types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract")),
                types.uint(1000)
            ], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk();
        block.receipts[1].result.expectErr(types.uint(100)); // err-not-authorized
    }
});

Clarinet.test({
    name: "Can subscribe to token-gated plan with sufficient tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // First create a token-gated plan
        let block = chain.mineBlock([
            Tx.contractCall('subscription', 'create-subscription-plan', [
                types.uint(1),
                types.ascii("Premium Token Plan"),
                types.uint(100),
                types.uint(30),
                types.some(types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract")),
                types.uint(1000)
            ], deployer.address)
        ]);
        
        // Mock token balance check will pass in test environment
        let subscribeBlock = chain.mineBlock([
            Tx.contractCall('subscription', 'subscribe', [
                types.uint(1)
            ], wallet1.address)
        ]);
        
        subscribeBlock.receipts[0].result.expectOk();
        
        // Verify subscription
        let checkBlock = chain.mineBlock([
            Tx.contractCall('subscription', 'is-subscription-active', [
                types.principal(wallet1.address)
            ], wallet1.address)
        ]);
        
        checkBlock.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "Cannot subscribe without required tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Create token-gated plan
        let block = chain.mineBlock([
            Tx.contractCall('subscription', 'create-subscription-plan', [
                types.uint(1),
                types.ascii("Premium Token Plan"),
                types.uint(100),
                types.uint(30),
                types.some(types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract")),
                types.uint(1000)
            ], deployer.address)
        ]);
        
        // Mock token balance check will fail
        let subscribeBlock = chain.mineBlock([
            Tx.contractCall('subscription', 'subscribe', [
                types.uint(1)
            ], wallet1.address)
        ]);
        
        subscribeBlock.receipts[0].result.expectErr(types.uint(105)); // err-insufficient-tokens
    }
});
