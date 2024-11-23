;; Define error constants
(define-constant err-not-authorized (err u100))
(define-constant err-insufficient-balance (err u101))
(define-constant err-subscription-not-found (err u102))
(define-constant err-subscription-expired (err u103))
(define-constant err-invalid-period (err u104))

;; Define data variables
(define-data-var contract-owner principal tx-sender)

;; Define data maps
(define-map subscriptions
    { subscriber: principal }
    {
        plan-id: uint,
        start-time: uint,
        end-time: uint,
        amount: uint,
        active: bool
    }
)

(define-map subscription-plans
    { plan-id: uint }
    {
        name: (string-ascii 50),
        price: uint,
        duration: uint
    }
)

;; Define public functions
(define-public (create-subscription-plan (plan-id uint) (name (string-ascii 50)) (price uint) (duration uint))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-authorized)
        (ok (map-set subscription-plans
            { plan-id: plan-id }
            {
                name: name,
                price: price,
                duration: duration
            }
        ))
    )
)

(define-public (subscribe (plan-id uint))
    (let (
        (plan (unwrap! (map-get? subscription-plans { plan-id: plan-id }) err-subscription-not-found))
        (price (get price plan))
        (duration (get duration plan))
        (current-time block-height)
    )
        (asserts! (> duration u0) err-invalid-period)
        
        ;; Set subscription details
        (ok (map-set subscriptions
            { subscriber: tx-sender }
            {
                plan-id: plan-id,
                start-time: current-time,
                end-time: (+ current-time duration),
                amount: price,
                active: true
            }
        ))
    )
)

(define-public (cancel-subscription)
    (let (
        (subscription (unwrap! (map-get? subscriptions { subscriber: tx-sender }) err-subscription-not-found))
    )
        (ok (map-set subscriptions
            { subscriber: tx-sender }
            (merge subscription { active: false })
        ))
    )
)

;; Read only functions
(define-read-only (get-subscription (subscriber principal))
    (ok (map-get? subscriptions { subscriber: subscriber }))
)

(define-read-only (get-subscription-plan (plan-id uint))
    (ok (map-get? subscription-plans { plan-id: plan-id }))
)

(define-read-only (is-subscription-active (subscriber principal))
    (let (
        (subscription (unwrap! (map-get? subscriptions { subscriber: subscriber }) err-subscription-not-found))
    )
        (ok (and
            (get active subscription)
            (<= block-height (get end-time subscription))
        ))
    )
)