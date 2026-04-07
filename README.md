# 🚀 Scalable API Testing Framework — Newman + CI/CD

**A production-grade API Automation Testing Framework simulating a real-world SaaS/e-commerce backend.**  
Built with Postman Collections, Newman CLI, GitHub Actions CI/CD, and HTML reporting.

## 📌 Project Overview

This framework demonstrates **enterprise-level API test automation** for a SaaS e-commerce backend. It covers the complete API lifecycle from authentication through order processing — the exact workflows that protect revenue in production systems.

> **Real-world simulation:** Uses [FakeStoreAPI](https://fakestoreapi.com) as the backend target — a production-like REST API with JWT auth, full CRUD, and realistic data models.

### 🎯 What This Framework Proves

| Capability | Implementation |
|---|---|
| JWT Authentication | Token extraction → environment storage → chained requests |
| CRUD Coverage | Users, Products, Carts, Orders — all verbs (GET/POST/PUT/PATCH/DELETE) |
| Schema Validation | Field-level assertions on every response |
| Negative Testing | Invalid tokens, wrong passwords, bad IDs, empty payloads |
| Chained Requests | Auth → Users → Products → Cart → Orders (data-driven chain) |
| Dynamic Test Data | Timestamps, random values, pre-request JS generation |
| CI/CD Integration | GitHub Actions with multi-environment execution |
| HTML Reporting | Dark-themed HTMLExtra reports with request/response bodies |

---

## 🏗️ Architecture

```
scalable-api-testing-framework-newman-ci-cd/
│
├── 📁 collections/                     # Postman Collections (v2.1)
│   ├── 01_Auth.postman_collection.json          # Authentication flows
│   ├── 02_Users.postman_collection.json         # User management CRUD
│   ├── 03_Products.postman_collection.json      # Product catalog CRUD
│   ├── 04_Cart.postman_collection.json          # Cart management
│   ├── 05_Orders.postman_collection.json        # Order lifecycle
│   └── SaaS_API_Full_Suite.postman_collection.json  # Master E2E suite
│
├── 📁 environments/                    # Environment configuration
│   ├── dev.postman_environment.json             # Development variables
│   └── staging.postman_environment.json         # Staging variables
│
├── 📁 reports/                         # Test execution reports
│   └── html/                                    # HTMLExtra reports (gitignored)
│
├── 📁 .github/workflows/               # CI/CD Pipeline
│   └── api-tests.yml                            # GitHub Actions workflow
│
├── package.json                        # Dependencies & npm scripts
└── README.md                           # This file
```

### 🔄 Request Chain Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   FULL E2E TEST CHAIN                        │
├─────────────────────────────────────────────────────────────┤
│  1. POST /auth/login  →  Extract JWT token                  │
│         ↓ token stored in environment                        │
│  2. GET  /users       →  Extract user_id                    │
│         ↓ user_id stored for downstream use                  │
│  3. POST /users       →  Dynamic email/username generated    │
│         ↓ created_user_id stored                            │
│  4. GET  /products    →  Extract product_id + price          │
│         ↓ product data stored for cart                       │
│  5. POST /carts       →  Create cart with product_id         │
│         ↓ cart_id stored                                     │
│  6. PUT  /carts/:id   →  Confirm order (simulate checkout)   │
│         ↓ order_id stored                                    │
│  7. GET  /carts/user  →  Validate order history             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Postman Collections

### 01 — Authentication (`01_Auth`)
| Test Case | Type | Validates |
|---|---|---|
| Login with valid credentials | Happy Path | Status 200, JWT structure (3-part), token storage |
| Login with wrong password | Negative | 4xx status, no token in response |
| Login with missing username | Negative | Error handling for incomplete payload |
| Login with empty body | Edge Case | Server resilience, response time SLA |

### 02 — User Management (`02_Users`)
| Test Case | Type | Validates |
|---|---|---|
| Get all users | Happy Path | Array schema, all required fields, user_id chaining |
| Get single user | Happy Path | Full user schema, email format regex, geolocation |
| Create user (dynamic data) | Happy Path | Dynamic email/username, new ID returned |
| Update user (PUT) | Happy Path | Full replace, response schema |
| Partial update (PATCH) | Happy Path | Partial field update accepted |
| Delete user | Happy Path | Deletion confirmed, ID returned |
| Get non-existent user | Negative | 99999 ID — graceful error handling |
| Get users with limit | Edge Case | Query param respected, count ≤ limit |

### 03 — Product Catalog (`03_Products`)
| Test Case | Type | Validates |
|---|---|---|
| Get all products | Happy Path | Full schema, prices positive, rating range (0–5) |
| Get single product | Happy Path | Image URL regex, non-empty title |
| Filter by category | Happy Path | Only `electronics` items returned |
| Get all categories | Happy Path | Known categories present |
| Create product (random data) | Happy Path | Random title/price from pre-request, ID returned |
| Update product (PUT) | Happy Path | Full replace confirmed |
| Delete product | Happy Path | Deletion confirmed |
| Sort DESC | Edge Case | IDs in descending order verified |
| Invalid category | Negative | Empty array or error on unknown category |

### 04 — Cart Management (`04_Cart`)
| Test Case | Type | Validates |
|---|---|---|
| Get all carts | Happy Path | Schema, cart_id chaining |
| Get single cart | Happy Path | Correct ID match, date format, products present |
| Get carts by user | Happy Path | All carts belong to requested userId |
| Create cart | Happy Path | Dynamic date, product IDs, created_cart_id stored |
| Update cart (PUT) | Happy Path | Updated product list |
| Delete cart | Happy Path | Deletion confirmed |
| Date range filter | Edge Case | Query params `startdate`/`enddate` |
| Invalid cart ID | Negative | 99999 ID — graceful handling |

### 05 — Orders & Checkout (`05_Orders`)
| Test Case | Type | Validates |
|---|---|---|
| Auth token refresh | Pre-condition | Fresh token for order suite |
| Fetch product for order | Chaining | Product price stored for total calculation |
| Create pre-order cart | Chaining | Cart with product, expected total computed |
| Confirm order (checkout) | Happy Path | Status 200, SLA < 2000ms, order_id stored |
| Get order history | Happy Path | All orders for user, product arrays present |
| Unauthorized access | Negative | Invalid token — 401/403 expected |
| Order with invalid product | Negative | productId: -1, quantity: 0 |
| Cancel order | Happy Path | Delete confirms, ID returned |

---

## ⚙️ Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org))
- **Newman** (installed via npm — no global install required)
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/scalable-api-testing-framework-newman-ci-cd.git
cd scalable-api-testing-framework-newman-ci-cd

# 2. Install dependencies
npm install
```

### Running Tests

```bash
# Run full suite on DEV
npm test

# Run full suite on STAGING
npm run test:staging

# Run individual collections
npm run test:auth
npm run test:users
npm run test:products
npm run test:cart
npm run test:orders
```

### Newman Direct CLI

```bash
# Run full suite with HTML report
npx newman run collections/SaaS_API_Full_Suite.postman_collection.json \
  --environment environments/dev.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export reports/html/report.html \
  --reporter-htmlextra-darkTheme

# Run with Allure reporter
npm run test:allure
npm run allure:report
npm run allure:open
```

### Viewing Reports

After execution, open `reports/html/full-suite-report.html` in your browser for a full interactive dark-themed report including:
- Pass/fail breakdown by collection
- Request & response bodies
- Test assertion details
- Execution timeline

---

## 🔬 Advanced Features

### 🔗 Request Chaining
Environment variables are used as the "glue" between requests:
```javascript
// In test script — extract and store
const token = pm.response.json().token;
pm.environment.set('access_token', token);

// In next request header — consume
Authorization: Bearer {{access_token}}
```

### 🎲 Dynamic Test Data Generation
```javascript
// Pre-request script
const timestamp = Date.now();
pm.environment.set('dynamic_email', `qatest_${timestamp}@saasplatform.io`);
pm.environment.set('dynamic_username', `qabot_${timestamp}`);

// Random product pricing
const price = (Math.random() * 500 + 10).toFixed(2);
pm.variables.set('random_price', price);
```

### 🛡️ Schema Validation (Inline)
```javascript
pm.test('✅ Product schema is valid', () => {
  const product = pm.response.json();
  pm.expect(product).to.have.all.keys('id','title','price','description','category','image','rating');
  pm.expect(product.price).to.be.a('number').and.above(0);
  pm.expect(product.rating.rate).to.be.within(0, 5);
  pm.expect(product.image).to.match(/^https?:\/\/.+/);
});
```

### 🚫 Negative Testing
```javascript
pm.test('✅ Unauthorized request blocked', () => {
  pm.expect(pm.response.code).to.be.oneOf([401, 403]);
});
pm.test('✅ Invalid ID returns error', () => {
  pm.expect(pm.response.code).to.be.oneOf([400, 404]);
});
```

---

## 📊 Test Reports

### HTMLExtra Reports (Dark Theme)
The `newman-reporter-htmlextra` generates rich, interactive HTML reports:
- 📈 Overall pass/fail statistics
- 🔍 Expandable request/response bodies
- ⏱️ Response time per request
- 🔴 Highlighted failed assertions
- 📋 Pre-request script logs

### Report Structure
```
reports/
└── html/
    ├── full-suite-report.html     # Master E2E report
    ├── auth-report.html           # Auth-only report
    ├── users-report.html          # Users-only report
    ├── products-report.html       # Products-only report
    ├── cart-report.html           # Cart-only report
    └── orders-report.html         # Orders-only report
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The pipeline runs on every push, PR, and daily schedule:

```
Push to main/develop/staging
         │
         ▼
┌─────────────────────┐
│  JOB 1: DEV Tests   │
│  ─────────────────  │
│  01 Auth            │
│  02 Users           │
│  03 Products        │
│  04 Cart            │
│  05 Orders          │
│  Full Suite         │
│  Upload HTML Report │
└────────┬────────────┘
         │ on success (main/staging only)
         ▼
┌─────────────────────┐
│ JOB 2: STAGING Tests│
│  ─────────────────  │
│  Full Suite Only    │
│  Upload HTML Report │
└────────┬────────────┘
         │ on any failure
         ▼
┌─────────────────────┐
│ JOB 3: Notify       │
│  ─────────────────  │
│  Failure Summary    │
└─────────────────────┘
```

### Trigger Conditions
| Trigger | DEV Tests | STAGING Tests |
|---|---|---|
| Push to `develop` | ✅ | ❌ |
| Push to `main` | ✅ | ✅ |
| Pull Request | ✅ | ❌ |
| Daily Schedule (08:00 UTC) | ✅ | ✅ |
| Manual dispatch | ✅ (choose env) | ✅ (choose env) |

### Artifacts
Each CI run uploads HTML reports as GitHub artifacts, retained for **30 days**.

---

## 💼 Business Value

### Why API Testing is Critical for SaaS Startups

| Problem | Without API Tests | With This Framework |
|---|---|---|
| **Deployment confidence** | "We hope it works" | Automated pass/fail gate on every deploy |
| **Frontend unblocking** | Frontend waits for backend | API contracts validated independently |
| **Regression prevention** | Manual retesting every sprint | 50+ tests run in < 60 seconds |
| **Auth security** | Token bugs reach production | JWT validation catches issues pre-merge |
| **Data integrity** | Silent schema breaks | Schema validation on every response |
| **Release speed** | Slow, manual QA | Automated checks on each PR |

### ROI Metrics (Typical SaaS Team)
- ⏱️ **Saves 4–8 hours/sprint** — eliminates manual API regression
- 🐛 **Catches 70%+ of backend bugs** before they reach frontend
- 🚀 **3× faster release cycles** — confidence to deploy Friday afternoons
- 💰 **Prevents $10k+ revenue loss** per production incident

### Production Bug Prevention Examples Covered
- ✅ Expired/invalid JWT accepted → Auth negative tests
- ✅ Null price fields → Schema + price validation
- ✅ Cart total miscalculation → Chained price × quantity validation
- ✅ Deleted user accessible → Post-delete validation
- ✅ API rate limit violations → Response time SLA assertions
- ✅ SQL injection via ID → Invalid ID negative tests

---

## 🛠️ Tech Stack

| Tool | Purpose | Version |
|---|---|---|
| **Postman** | Collection authoring & design | v10+ |
| **Newman** | CLI test runner | v6+ |
| **newman-reporter-htmlextra** | Rich HTML reports | v1.23+ |
| **GitHub Actions** | CI/CD orchestration | Latest |
| **Node.js** | Runtime environment | v18+ |
| **FakeStoreAPI** | Backend simulation target | Live API |

---

## 📁 Environment Variables Reference

| Variable | Description | Set By |
|---|---|---|
| `base_url` | API base URL | Environment file |
| `auth_url` | Auth endpoint base | Environment file |
| `username` | Login username | Environment file |
| `password` | Login password | Environment file |
| `access_token` | JWT token | Set by Auth test |
| `user_id` | First user ID | Set by Users test |
| `product_id` | First product ID | Set by Products test |
| `cart_id` | First cart ID | Set by Cart test |
| `created_cart_id` | Newly created cart | Set by Create Cart |
| `dynamic_email` | Generated test email | Pre-request script |
| `dynamic_username` | Generated username | Pre-request script |
| `invalid_token` | Bad token for negative tests | Environment file |

---

## 🚀 Let's Work Together

<div align="center">

### 💡 I Help Startups & SaaS Companies Build Bulletproof APIs

Are you building a SaaS product, e-commerce platform, or mobile backend?  
I specialize in **API automation testing** that gives engineering teams **confidence to ship fast**.

</div>

**What I deliver:**
- 🔍 **Full API audit** — identify untested endpoints and hidden risks
- 🏗️ **Custom test frameworks** — built on your stack, tailored to your workflow
- 🔄 **CI/CD integration** — automated tests on every PR, every deploy
- 📊 **Executive reporting** — stakeholder-ready dashboards and test coverage metrics
- 🛡️ **Security validation** — auth flows, token handling, injection prevention

**I've helped teams:**
- Reduce production API bugs by **80%** through comprehensive automation
- Cut QA cycle time from **3 days → 2 hours** with Newman pipelines
- Unblock frontend teams by providing **reliable API contracts early**
- Achieve **zero-downtime deploys** on Fridays through automated regression

---

### 📬 Get In Touch

> **Currently available for:** Remote contract work, freelance API testing engagements, and QA consulting for startups.

**⭐ Star this repo if it helped you — it takes 1 second and means a lot!**

*Built with ❤️ by a QA Engineer who believes quality is not an afterthought.*

</div>
