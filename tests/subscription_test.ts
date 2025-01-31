import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can create subscription plan",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('subscription', 'create-subscription-plan', [
                types.uint(1),
                types.ascii("Basic Plan"),
                types.uint(100),
                types.uint(30)
            ], deployer.address),
            
            // Non-owner attempt should fail
            Tx.contractCall('subscription', 'create-subscription-plan', [
                types.uint(2),
                types.ascii("Premium Plan"),
                types.uint(200),
                types.uint(30)
            ], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk();
        block.receipts[1].result.expectErr(types.uint(100)); // err-not-authorized
    }
});

Clarinet.test({
    name: "Can subscribe to a plan",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // First create a plan
        let block = chain.mineBlock([
            Tx.contractCall('subscription', 'create-subscription-plan', [
                types.uint(1),
                types.ascii("Basic Plan"),
                types.uint(100),
                types.uint(30)
            ], deployer.address)
        ]);
        
        // Now subscribe to it
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
    name: "Can cancel subscription",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Setup: Create plan and subscribe
        let setup = chain.mineBlock([
            Tx.contractCall('subscription', 'create-subscription-plan', [
                types.uint(1),
                types.ascii("Basic Plan"),
                types.uint(100),
                types.uint(30)
            ], deployer.address),
            Tx.contractCall('subscription', 'subscribe', [
                types.uint(1)
            ], wallet1.address)
        ]);
        
        // Cancel subscription
        let cancelBlock = chain.mineBlock([
            Tx.contractCall('subscription', 'cancel-subscription', [], wallet1.address)
        ]);
        
        cancelBlock.receipts[0].result.expectOk();
        
        // Verify cancellation
        let checkBlock = chain.mineBlock([
            Tx.contractCall('subscription', 'is-subscription-active', [
                types.principal(wallet1.address)
            ], wallet1.address)
        ]);
        
        checkBlock.receipts[0].result.expectOk().expectBool(false);
    }
});
