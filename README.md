# Subscription Payment Service

A blockchain-based subscription payment service that allows:

- Creating subscription plans with different durations and prices
- Token-gated subscription plans requiring minimum token holdings
- Users subscribing to available plans
- Checking subscription status
- Canceling subscriptions

## Features

- Plan management by contract owner
- Token-gated subscription plans
- Subscription lifecycle management
- Subscription status verification
- Automatic expiration based on block height
- SIP-010 token integration

## Contract Functions

- create-subscription-plan: Create new subscription plans with optional token requirements
- subscribe: Subscribe to an existing plan (requires token holdings for token-gated plans)
- cancel-subscription: Cancel an active subscription
- get-subscription: Get subscription details
- get-subscription-plan: Get plan details
- is-subscription-active: Check if a subscription is active

## Token-Gated Subscriptions

The contract now supports creating subscription plans that require users to hold a minimum amount of specific SIP-010 tokens to subscribe. This enables:

- Premium tiers based on token holdings
- Community-exclusive subscriptions
- Token holder benefits
- Integration with existing token ecosystems
