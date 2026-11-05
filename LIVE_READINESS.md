# Boss Perfumes - Go-Live Readiness Audit Report

**Date:** November 5, 2026  
**Audit Type:** End-to-End Go-Live Readiness Audit (Headless Next.js + WooCommerce)  
**Production Domain:** [https://www.bossperfumes.com](https://www.bossperfumes.com)  
**CMS Domain:** [https://cms.bossperfumes.com](https://cms.bossperfumes.com)  
**Auditor:** Senior QA & Backend Systems Engineer  

---

## 1. Executive Summary & Verdict

| Assessment Area | Status | Key Finding |
| :--- | :---: | :--- |
| **Gateway Live Credentials** | ⚠️ **WARN** | Nomod has live key configured; Tabby & Paymob are still on test keys. |
| **Secrets & Leak Prevention** | 🔴 **FAIL** | Critical secret leak found in git repo (`test-yith.js` exposes raw WooCommerce consumer keys). |
| **Paymob Callback Security** | 🔴 **FAIL** | `/api/payment/paymob/callback` updates order to paid without enforcing HMAC verification. |
| **Nomod Webhook Security** | ⚠️ **WARN** | `NOMOD_WEBHOOK_SECRET` is unset; webhooks skip signature verification if not configured. |
| **WooCommerce Backend (GET)** | 🟢 **PASS** | Active gateways (`nomod`, `paymob`), 5% UAE VAT, 30 AED flat shipping, AED currency verified. |
| **SSL & Network Security** | 🟢 **PASS** | Valid Let's Encrypt certificates on both CMS and Frontend; HSTS active; 0 mixed-content images. |
| **Page Performance & Health** | 🟢 **PASS** | Home (2.1s), Collections (1.3s), Brands (1.0s), Checkout (0.9s). Next.js Turbopack build: PASS. |

### Go-Live Verdict: ✋ **HOLD (Fix 2 Critical Security Blockers First)**
Before opening live customer checkout with real credit cards, **two critical security vulnerabilities must be resolved**:
1. **Remove and rotate exposed WooCommerce REST credentials** currently tracked in `test-yith.js`.
2. **Harden `/api/payment/paymob/callback`** so arbitrary unauthenticated GET requests cannot mark WooCommerce orders as paid.

---

## 2. Config Audit & Credential Status

### 2.1 Gateway Key Environment Matrix

| Gateway | Required Live Environment Variables | Current Configured Value (Masked) | Mode Detected | Go-Live Status |
| :--- | :--- | :--- | :---: | :---: |
| **Nomod** | `NOMOD_API_KEY`<br>`NEXT_PUBLIC_NOMOD_API_URL`<br>`NOMOD_WEBHOOK_SECRET`<br>`NEXT_PUBLIC_NOMOD_ENABLED` | `sk_live_QtC***MlD`<br>`https://api.nomod.com/v1`<br>*[EMPTY]*<br>`true` | 🔴 **LIVE** | ⚠️ Missing Webhook Secret in `.env.local` |
| **Tabby** | `NEXT_PUBLIC_TABBY_PUBLIC_KEY`<br>`TABBY_SECRET_KEY`<br>`NEXT_PUBLIC_TABBY_MERCHANT_CODE`<br>`TABBY_WEBHOOK_SECRET`<br>`NEXT_PUBLIC_TABBY_ENABLED` | `pk_test_01964982-***`<br>`sk_test_01964982-***`<br>`BGARE`<br>`bossperfumes-tabby-***`<br>`true` | 🟢 **TEST** | ⚠️ Must be switched to live keys (`pk_live_`, `sk_live_`) |
| **Paymob** | `PAYMOB_SECRET_KEY`<br>`NEXT_PUBLIC_PAYMOB_PUBLIC_KEY`<br>`PAYMOB_API_KEY`<br>`PAYMOB_INTEGRATION_ID`<br>`PAYMOB_HMAC_SECRET`<br>`PAYMOB_BASE_URL` | `are_sk_test_73901e***`<br>`are_pk_test_7MC1ah***`<br>`eyJhbGciOiJIUzUxMi***`<br>`159873`<br>*[EMPTY]*<br>`https://uae.paymob.com` | 🟢 **TEST** | ⚠️ Must be switched to live keys; `PAYMOB_HMAC_SECRET` is missing |
| **Checkout.com** | `CHECKOUT_PUBLIC_KEY`<br>`CHECKOUT_SECRET_KEY` | `pk_sbox_***`<br>`sk_sbox_***` | 🟢 Sandbox | 🟢 Correctly **DISABLED** (`NEXT_PUBLIC_CHECKOUT_ENABLED=false`) |
| **WooPayments** | `NEXT_PUBLIC_WOOPAYMENTS_ENABLED` | `false` | Disabled | 🟢 Correctly **DISABLED** (not active in WP) |

---

### 2.2 Secret Exposure & Git Security Audit

1. **`NEXT_PUBLIC_` Exposure Check**: 🟢 **PASS**
   - No secret keys are prefixed with `NEXT_PUBLIC_`.
   - Client bundle references only public tokens (`NEXT_PUBLIC_TABBY_PUBLIC_KEY`, `NEXT_PUBLIC_PAYMOB_PUBLIC_KEY`, `NEXT_PUBLIC_WC_STORE_URL`, `NEXT_PUBLIC_APP_URL`).

2. **Gitignore Status**: 🟢 **PASS**
   - `.env.local`, `.env`, and `.env.production` are strictly gitignored via `.env*` in `.gitignore`.
   - Verified via `git check-ignore`.

3. **Git History Leak Check**: 🔴 **CRITICAL FAIL**
   - A root file named [`test-yith.js`](file:///c:/Users/thouf/Downloads/PIXIE/BOSS%20PERFUMES/boss-perfumes/test-yith.js) is **committed and tracked in git** on GitHub (`main` branch).
   - **Evidence**:
     ```javascript
     // test-yith.js (Lines 2-3)
     const consumerKey = "ck_84d2c8308f3df111e4cf428d92c7c0716696983c";
     const consumerSecret = "cs_711e8bfcd430b61aced90d628d4747be1460ecb5";
     ```
   - **Risk**: Full administrative read/write access to WooCommerce store orders, customers, and inventory is exposed to anyone with repo access.

---

## 3. Payment Flow & Code Review

### 3.1 Flow Breakdown by Gateway

```
[Customer Checkout]
        │
        ▼
POST /api/payment/create-session
        │
        ├─► 1. Verify Cart & Authenticate User
        ├─► 2. Create Pending Order in WooCommerce (fetchWC 'orders', POST)
        ├─► 3. Delegate to Payment Provider
        │       │
        │       ├─► Nomod:  POST https://api.nomod.com/v1/links (X-API-KEY)
        │       ├─► Tabby:  POST https://api.tabby.ai/api/v2/checkout (Bearer sk_...)
        │       └─► Paymob: POST https://uae.paymob.com/v1/intention/ (Token are_sk_...)
        │
        ├─► 4. Clear WooCommerce Cart on Server
        └─► 5. Return redirectUrl to Customer Browser
```

---

### 3.2 Gateway Detailed Analysis

#### A. Nomod (Primary Gateway)
- **Session Initiation**: Calls `POST https://api.nomod.com/v1/links` with `X-API-KEY`.
- **Amounts & Decimals**: Sends accurate 2-decimal amounts. Tested live against Nomod API: 935.55 AED order generated link `https://pay.nomodapp.com/en/l/cfa3fdede4dc4918` with status `enabled`.
- **Fallback**: Gracefully falls back to WooCommerce Order-Pay if API key is not present.
- **Webhook Handling**: Webhook route `/api/payment/webhook` receives payload, parses `order_id` from metadata, and updates WooCommerce order to `processing` or `completed`.
- **Security Warning**: `verifyWebhook` in [`src/lib/payment/nomod.ts`](file:///c:/Users/thouf/Downloads/PIXIE/BOSS%20PERFUMES/boss-perfumes/src/lib/payment/nomod.ts#L135-L165) returns `true` if `NOMOD_WEBHOOK_SECRET` is unset.
  - **Action Required**: Create webhook in Nomod Dashboard, copy secret, and set `NOMOD_WEBHOOK_SECRET` in `.env.local` / Vercel.

#### B. Tabby (Buy Now, Pay Later)
- **Eligibility Check**: Verified. Hardcoded to UAE (`AE`) and `AED`/`SAR`. Properly rejects unsupported currencies and countries before session creation.
- **Amounts & Currency**: Matches cart totals with minor unit normalization.
- **Server-Side Verification**: 🟢 **EXCELLENT**.
  - In `handleWebhookEvent`: On `authorized`, Tabby does NOT immediately trust the payload. It queries `GET https://api.tabby.ai/api/v2/payments/{paymentId}` server-side. If authorized, it executes server-to-server capture (`POST /payments/{id}/captures`).
  - Supports partial and full refunds with unique event idempotency keys (`{paymentId}:refund:{id}`).
- **Webhook Security**: 🟢 **EXCELLENT**. Strictly verifies `x-tabby-webhook-secret` against `TABBY_WEBHOOK_SECRET`.

#### C. Paymob (Card & Wallet Gateway)
- **Session Initiation**: Supports modern Intention API (`/v1/intention/`) and legacy 3-step accept flow.
- **Callback Vulnerability**: 🔴 **CRITICAL BLOCKER** in [`src/app/api/payment/paymob/callback/route.ts`](file:///c:/Users/thouf/Downloads/PIXIE/BOSS%20PERFUMES/boss-perfumes/src/app/api/payment/paymob/callback/route.ts#L16-L57).
  - Current code:
    ```typescript
    if (paymentConfig.paymob.hmacSecret && hmac) {
      // verifies HMAC, but if mismatch, only logs console.warn!
    }
    if (success) {
      // MARKS ORDER PAID in WooCommerce!
    }
    ```
  - If a user/attacker hits `/api/payment/paymob/callback?success=true&merchant_order_id=123`, the order is marked paid without any HMAC enforcement!

---

### 3.3 Failure & Corner Case Handling

| Scenario | Handled? | Evidence / Mechanism |
| :--- | :---: | :--- |
| **Cancelled Payment** | 🟢 YES | Return URLs include `?error=nomod_cancel` or `?error=tabby_cancel`. `PaymentFlow.tsx` catches this, restores items from `sessionStorage.getItem("boss_pending_cart_backup")`, and repopulates the cart. |
| **Double-Click on Pay** | 🟢 YES | `isProcessing` state disables the submit button immediately upon form submission. |
| **Session Retry** | 🟢 YES | `existingOrderId` is saved in state; retrying payment updates the existing WooCommerce order instead of creating duplicate orders. |
| **Stock Reduction** | 🟢 YES | WooCommerce manages inventory. Orders start in `Pending` (stock held). Stock is deducted only upon transitioning to `Processing` or `Completed`. Failed/Cancelled orders release held stock. |
| **Webhook Idempotency** | 🟢 YES | Handled via `_processed_webhook_events` array in WooCommerce order meta data. Repeated events return `200 { message: "Duplicate event ignored" }`. |

---

## 4. Production Read-Only Checks (GET Live Audit)

All checks were executed live against `https://cms.bossperfumes.com` and `https://www.bossperfumes.com` using read-only GET requests:

```
[LIVE PROD API AUDIT]
├── WooCommerce REST /wp-json/wc/v3/
│   ├── payment_gateways: 200 OK (1135ms) ➔ 8 gateways detected
│   │   ├── nomod: ENABLED (Title: "Pay with cards, wallets, or pay-later options")
│   │   ├── paymob-pixel: ENABLED (Title: "Debit/Credit Card Payment")
│   │   ├── paymob-159873-card-vpc-aed: ENABLED (Title: "Debit/Credit Card")
│   │   └── bacs/cheque/cod: DISABLED
│   ├── shipping/zones: 200 OK (881ms) ➔ Zone 1: UAE
│   │   └── Flat Rate Method: Standard Shipping = 30 AED
│   ├── taxes: 200 OK (378ms) ➔ Standard UAE VAT: 5.0000%
│   └── settings/general: 200 OK (731ms) ➔ Currency = AED
├── WooCommerce Store API /wp-json/wc/store/v1/
│   ├── products: 200 OK (463ms)
│   └── cart: 200 OK (415ms)
├── SSL & HTTPS Verification
│   ├── cms.bossperfumes.com: 200 OK (Let's Encrypt, Valid to Jan 26, 2027)
│   └── www.bossperfumes.com: 200 OK (Let's Encrypt, Valid to Dec 22, 2026, HSTS Active)
└── Media & Mixed Content
    └── Sampled 10 Products (10 images): 0 HTTP links, 100% HTTPS, 200 OK
```

---

## 5. Go-Live Checklist Matrix

| # | Check Item | Status | Finding / Evidence |
| :-: | :--- | :---: | :--- |
| 1 | Git Secrets Hygiene | 🔴 **FAIL** | `test-yith.js` contains live `ck_` and `cs_` keys in git tracking. |
| 2 | Paymob Callback Security | 🔴 **FAIL** | `/api/payment/paymob/callback` marks orders paid without enforcing HMAC. |
| 3 | Nomod Webhook Secret | ⚠️ **WARN** | `NOMOD_WEBHOOK_SECRET` is unset in `.env.local`. |
| 4 | Tabby Production Keys | ⚠️ **WARN** | Currently configured with `pk_test_` and `sk_test_`. |
| 5 | Paymob Production Keys | ⚠️ **WARN** | Currently configured with `are_sk_test_` and `are_pk_test_`. |
| 6 | Currency & Decimals | 🟢 **PASS** | Verified: AED currency with 2 decimals across all providers. |
| 7 | Tax & Shipping Sync | 🟢 **PASS** | 5% VAT and 30 AED Standard Shipping match between WP and Next.js. |
| 8 | Double Submit Guard | 🟢 **PASS** | Form submit button is disabled while `isProcessing` is true. |
| 9 | Cart Recovery on Cancel | 🟢 **PASS** | SessionStorage backup restores cart items on return with `?error=cancel`. |
| 10 | Central Webhook Route | 🟢 **PASS** | `/api/payment/webhook` handles Tabby, Nomod, Paymob with idempotency. |
| 11 | Production SSL & HSTS | 🟢 **PASS** | SSL certificates active and valid into 2026/2027 with HSTS. |
| 12 | Next.js Build Health | 🟢 **PASS** | `next build` with Turbopack compiles in 5.5s with zero errors. |

---

## 6. Prioritized Remediation Plan

### 🚨 Critical Blockers (Fix Before Accepting Real Payments)

1. **Delete and Revoke `test-yith.js` Credentials**:
   - **File**: [`test-yith.js`](file:///c:/Users/thouf/Downloads/PIXIE/BOSS%20PERFUMES/boss-perfumes/test-yith.js)
   - **Action**: Delete `test-yith.js` from git tracking (`git rm test-yith.js`).
   - **Action**: Log in to WordPress Admin (`cms.bossperfumes.com/wp-admin` → **WooCommerce** → **Settings** → **Advanced** → **REST API**) and revoke the exposed key pair `ck_84d2c830...` / `cs_711e8bf...`. Generate a fresh key pair and update your `.env.local` and Vercel environment variables.

2. **Harden `/api/payment/paymob/callback/route.ts`**:
   - **File**: [`src/app/api/payment/paymob/callback/route.ts`](file:///c:/Users/thouf/Downloads/PIXIE/BOSS%20PERFUMES/boss-perfumes/src/app/api/payment/paymob/callback/route.ts#L16-L35)
   - **Action**: Require `hmac` parameter and valid `PAYMOB_HMAC_SECRET`. If HMAC calculation fails or does not match, immediately reject with `401 Unauthorized` or redirect to `/checkout?error=paymob_verification_failed`. Never mark an order as paid without cryptographic HMAC verification.

---

### ⚠️ High Priority (Required for Full Live Operation)

3. **Configure `NOMOD_WEBHOOK_SECRET`**:
   - In your Nomod Dashboard (**Settings** → **Apps & APIs** → **Webhooks**), create a webhook pointing to:
     `https://www.bossperfumes.com/api/payment/webhook`
   - Copy the signing secret and add it to `.env.local` and Vercel as `NOMOD_WEBHOOK_SECRET`.

4. **Switch Tabby to Live Keys**:
   - Obtain live credentials from Tabby merchant portal.
   - Update `NEXT_PUBLIC_TABBY_PUBLIC_KEY=pk_live_...` and `TABBY_SECRET_KEY=sk_live_...`.
   - Update `TABBY_WEBHOOK_SECRET` with the secret configured in Tabby portal.

5. **Switch Paymob to Live Keys**:
   - In Paymob UAE dashboard, copy live intention secret `are_sk_live_...` and public key `are_pk_live_...`.
   - Set `PAYMOB_HMAC_SECRET` from Paymob dashboard.

---

## 7. Manual Live Smoke-Test Script (For Store Owner)

When you are ready to perform real payment tests, follow this step-by-step test script:

### Test Scenario A: Nomod Live Payment Test (Apple Pay / Credit Card)
1. **Prepare**: Ensure `NOMOD_API_KEY=sk_live_...` is set in Vercel/production.
2. **Shop**: Add a product to cart on `https://www.bossperfumes.com`.
3. **Checkout**:
   - Enter your real UAE delivery address and mobile number.
   - Select **Credit / Debit Card & Apple Pay** (Nomod).
   - Click **Proceed to Payment**.
4. **Verify Redirection**: Confirm you are redirected to `https://pay.nomodapp.com/en/l/...` (NOT WordPress).
5. **Pay**: Complete payment with Apple Pay or a real debit/credit card (e.g. 10 AED test product or real product).
6. **Verify Return**: Confirm you land on `https://www.bossperfumes.com/checkout/success?order_id=...`.
7. **Verify in Nomod Dashboard**: Check **Nomod App** / **Dashboard** → **Transactions**: status should show **Success / Paid**.
8. **Verify in WooCommerce**: Go to `cms.bossperfumes.com/wp-admin/edit.php?post_type=shop_order`:
   - Order status must be **Processing**.
   - Order note should contain: *"Payment Provider: Nomod"* and transaction ID.
9. **Verify Refund**: In the Nomod App/Dashboard, open the transaction, tap **Refund**, and confirm WooCommerce receives the refund note.

---

### Test Scenario B: Tabby Live Payment Test (Installments)
1. **Switch Keys**: Set `NEXT_PUBLIC_TABBY_PUBLIC_KEY=pk_live_...` and `TABBY_SECRET_KEY=sk_live_...`.
2. **Shop**: Add a product above Tabby's minimum (e.g. > 100 AED).
3. **Checkout**: Select **Pay later with Tabby** and click **Proceed to Payment**.
4. **Tabby Flow**:
   - Complete OTP verification in Tabby's hosted popup/window.
   - Confirm first installment payment.
5. **Verify Return**: Confirm redirection to `https://www.bossperfumes.com/checkout/success`.
6. **Verify in Tabby Dashboard**: Check transaction is **Captured** / **Closed**.
7. **Verify in WooCommerce**: Order status is **Processing** with `_tabby_payment_id` in order notes.

---

### Test Scenario C: Customer Cancellation / Abandonment Test
1. At checkout, select Nomod or Tabby and proceed to payment.
2. In the gateway payment screen, click **Cancel** or close the browser tab.
3. Confirm you return to `https://www.bossperfumes.com/checkout?error=cancel`.
4. Confirm your cart items are **safely restored** and not lost.
5. In WooCommerce Admin, confirm the order remains **Pending** or **Cancelled** and is NOT marked Processing.

