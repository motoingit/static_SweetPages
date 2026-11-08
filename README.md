# SweetShop

A lightweight, professional React 18 + TypeScript web application designed for sweet shop counters, price discovery, and rapid customer billing.

The application is purely client-side with zero backend dependencies, persists cart state in browser `localStorage`, and is configured for automated zero-config deployment to GitHub Pages.

---

## 🌟 Primary Business Features

### 1. Sweet Price Management
- **Catalog Discovery**: Fast, instant search by English name, Hindi name, or Product ID.
- **Sorting Options**: Sort by Popularity, Price (Low to High / High to Low), or Alphabetical Name.
- **Unit Price Calculations**: Automatic conversions for standard unit weights (per kg, per 10g, per 1g).
- **Two-Way Quick Conversion**:
  - Weight to Price: Calculates exact cost for any custom weight in grams.
  - Money to Weight: Calculates exact weight in grams customer receives for any budget in Rupees.

### 2. Quick Billing System
- **Quick Weight & Portion Add**: Add standard weights (1kg, 0.5kg, 0.25kg, or custom kg) with a single tap.
- **Radial Gesture Selector**: Long-press to rapidly choose 0.25kg, 0.5kg, 1kg, 2kg, or 5kg with fluid pointer tracking.
- **Unit Multipliers**: Adjust pack multiples (×1 to ×30) with radial unit selectors.
- **Multi-Unit Precision**: Preserves entries configured in kilograms, grams, or rupee budgets without cross-contamination.
- **Cart Management**: Independent item identification via UUIDs, inline quantity increment/decrement, and deletion.
- **Customer Bill & Receipt**: Real-time totals, customizable customer notes, and print-ready bill styling.
- **Bilingual Interface**: Seamless one-click switching between English and Hindi.

---

## 🏗️ Architecture & Project Structure

The project follows a modular, feature-oriented architecture separating business logic, state management, UI presentation, and data schemas:

```
src/
├── components/                    # Shared, cross-feature UI components
│   ├── common/
│   │   ├── BackLink.tsx           # Accessible back-navigation link
│   │   ├── ErrorBoundary.tsx      # React error boundary for crash prevention
│   │   └── Navbar.tsx             # Global navigation bar, badge, and language switch
│   └── index.ts                   # Clean component barrel
├── features/                      # Domain-driven feature modules
│   ├── billing/                   # Billing, Cart & Order domain
│   │   ├── components/
│   │   │   ├── BillingModal.tsx   # Order receipt modal with print trigger
│   │   │   └── CartItemCard.tsx   # Cart line item with safe numeric input
│   │   ├── context/
│   │   │   └── CartContext.tsx    # Cart state provider & safe storage sync
│   │   ├── hooks/
│   │   │   └── useCart.ts         # Hook to consume cart operations
│   │   ├── services/
│   │   │   ├── billingCalculator.ts # Subtotal and weight summation routines
│   │   │   └── orderSnapshot.ts   # Immutable order snapshot generation
│   │   └── types/
│   │       └── billing.types.ts   # Cart & billing TypeScript contracts
│   ├── catalog/                   # Sweet catalog, pricing & gesture controls
│   │   ├── components/
│   │   │   ├── ProductCard.tsx    # Product card with image fallback and quick-add
│   │   │   ├── QuickSelectPanel.tsx # Popover for custom kg and rupee entries
│   │   │   ├── RadialQuantityMenu.tsx # Floating radial weight menu
│   │   │   └── UnitMultiplierControl.tsx # Unit multiplier button and radial selector
│   │   ├── hooks/
│   │   │   ├── useProducts.ts     # Hook to consume catalog data
│   │   │   ├── useRadialGesture.ts # Pointer gesture engine for radial weight selection
│   │   │   └── useUnitGesture.ts  # Pointer gesture engine for multiplier selection
│   │   └── services/
│   │       └── productService.ts  # Validation, filtering, and sorting engine
│   └── i18n/                      # Bilingual internationalization module
│       ├── context/
│       │   └── LanguageContext.tsx# Language state provider with localStorage sync
│       ├── data/
│       │   ├── productNamesHindi.ts # Hindi product naming dictionary
│       │   └── translations.ts    # Bilingual UI dictionary
│       ├── hooks/
│       │   └── useLanguage.ts     # Hook to access translations
│       └── types/
│           └── i18n.types.ts      # i18n type definitions
├── pages/                         # Application route views
│   ├── Home.tsx                   # Welcome and landing view
│   ├── SweetList.tsx              # Catalog search, filter, and quick billing list
│   ├── SweetDetails.tsx           # Individual product view with conversion tools
│   ├── Cart.tsx                   # Review cart, weights, and grand total
│   ├── Billing.tsx                # Billing view orchestrating cart & printable modal
│   └── index.ts                   # Page exports
├── schemas/                       # Runtime Zod validation schemas
│   ├── cart.schema.ts             # Cart item and list schemas
│   ├── order.schema.ts            # Order receipt and line item schemas
│   └── product.schema.ts          # Catalog product validation schemas
├── utils/                         # Pure utility functions
│   ├── formatters.ts              # Currency, display, and HTML5 input number formatters
│   ├── id.ts                      # Collision-resistant UUID generator
│   ├── math.ts                    # High-precision monetary rounding & calculations
│   └── storage.ts                 # Safe schema-validated localStorage operations
├── data/
│   └── sweetlist.json             # Static product catalog data
├── App.tsx                        # Root application component with ErrorBoundary
├── index.css                      # Tailwind utilities and custom CSS styling
├── main.tsx                       # React DOM entry point
└── vite-env.d.ts                  # Vite client environment declarations
```

---

## 🧮 Monetary & Calculation Integrity

- **Precision Rounding**: Monetary values and weights are calculated using `Math.round((value + Number.EPSILON) * 100) / 100` to prevent IEEE 754 floating-point drift.
- **HTML5 Input Compatibility**: Separated display formatting (`formatNumber` with Indian comma separators `1,000.00`) from input formatting (`formatInputNumber` yielding standard decimal string `1000.00`). This fixes browser parsing issues in `<input type="number">`.
- **Unit Multiplier Integrity**: Updating units preserves the original selection mode (`kg`, `g`, or `₹`) without unintended conversions.
- **Runtime Validation**: External data sources (`sweetlist.json` and `localStorage`) are verified with Zod schemas to ensure malformed data never enters application state.

---

## 🛠️ Development & Scripts

### Prerequisites
- Node.js $\ge 18$ (Node 22 recommended)
- npm $\ge 9$

### Setup & Run
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit tests
npm test

# Build for production (TypeScript check + Vite bundle)
npm run build

# Preview production build locally
npm run preview
```

---

## 🚀 GitHub Pages Deployment

The repository is configured to automatically build and deploy to GitHub Pages via GitHub Actions:
- **Workflow**: `.github/workflows/deploy-gh-pages.yml`
- **Trigger**: Every push to the `main` branch or manual `workflow_dispatch`.
- **Target Branch**: Automatically publishes the `dist/` directory to the `gh-pages` branch.
- **Routing**: Employs `HashRouter` (`/#/...`) and relative asset paths (`base: './'`), ensuring seamless routing without requiring 404 rewrite hacks on GitHub Pages.
