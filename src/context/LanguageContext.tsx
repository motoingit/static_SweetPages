import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "hi";

const translations = {
  en: {
    sweetList: "Sweet List",
    cart: "Cart",
    welcome: "Welcome to",
    heroCopy: "A simpler way to weigh, price, and bill every sweet your customers love.",
    explore: "Explore Sweet List",
    quickPricing: "Quick pricing · Easy billing · Always ready",
    freshSelection: "Fresh selection",
    search: "Search sweets...",
    sortLabel: "Sort sweet list",
    nameAz: "Name A–Z",
    priceLow: "Price: Low to High",
    priceHigh: "Price: High to Low",
    listHint: "Tap a card for details or add directly to your cart.",
    backToList: "Back to Sweet List",
    addToCart: "Add 10.00g to cart",
    ingredients: "Ingredients",
    noIngredients: "No ingredients listed.",
    priceNotAdded: "Price not added",
    pricePending: "This product will be available once a price is added.",
    quickConversion: "Quick conversion",
    priceYourWay: "Price it your way",
    weightToPrice: "Weight to price",
    costQuestion: "How much will it cost?",
    moneyToWeight: "Money to weight",
    weightQuestion: "How much can they get?",
    ready: "Ready when you are",
    yourCart: "Your Cart",
    reviewCart: "Review weights and prepare the bill.",
    emptyCart: "Your cart is waiting for its first sweet.",
    totalProducts: "Total products",
    totalWeight: "Total weight",
    grandTotal: "Grand total",
    clearCart: "Clear cart",
    proceed: "Proceed to billing",
    noSweets: "No sweets added yet",
    pickSweet: "Pick something delicious from the sweet list.",
    browse: "Browse sweet list",
    byKg: "By kg",
    byRupee: "By ₹",
    quickAdd: "Quick add",
    close: "Close",
    add: "Add",
    rate: "Rate",
    quantity: "Quantity",
    total: "Total",
    selected: "Selected",
    unit: "Unit",
    customerBill: "Customer Bill",
    item: "Item",
    qty: "Qty",
    additionalNote: "Additional Note",
    closeModal: "Close",
    printBill: "Print Bill",
    language: "Language",
    english: "English",
    hindi: "हिन्दी",
    deployed: "Last deployed",
  },
  hi: {
    sweetList: "मिठाई सूची",
    cart: "कार्ट",
    welcome: "स्वागत है",
    heroCopy: "अपने ग्राहकों की पसंदीदा मिठाइयों का वजन, कीमत और बिल आसानी से तैयार करें।",
    explore: "मिठाई सूची देखें",
    quickPricing: "त्वरित कीमत · आसान बिलिंग · हमेशा तैयार",
    freshSelection: "ताज़ा चयन",
    search: "मिठाई खोजें...",
    sortLabel: "मिठाई सूची क्रम",
    nameAz: "नाम A–Z",
    priceLow: "कीमत: कम से अधिक",
    priceHigh: "कीमत: अधिक से कम",
    listHint: "विवरण के लिए कार्ड चुनें या सीधे कार्ट में जोड़ें।",
    backToList: "मिठाई सूची पर वापस जाएँ",
    addToCart: "कार्ट में 10.00 ग्राम जोड़ें",
    ingredients: "सामग्री",
    noIngredients: "सामग्री उपलब्ध नहीं है।",
    priceNotAdded: "कीमत उपलब्ध नहीं",
    pricePending: "कीमत जोड़ने के बाद यह उत्पाद उपलब्ध होगा।",
    quickConversion: "त्वरित रूपांतरण",
    priceYourWay: "अपनी तरह कीमत निकालें",
    weightToPrice: "वजन से कीमत",
    costQuestion: "कितनी कीमत होगी?",
    moneyToWeight: "पैसे से वजन",
    weightQuestion: "कितना मिलेगा?",
    ready: "जब आप तैयार हों",
    yourCart: "आपका कार्ट",
    reviewCart: "वजन जाँचें और बिल तैयार करें।",
    emptyCart: "आपका कार्ट पहली मिठाई का इंतज़ार कर रहा है।",
    totalProducts: "कुल उत्पाद",
    totalWeight: "कुल वजन",
    grandTotal: "कुल राशि",
    clearCart: "कार्ट खाली करें",
    proceed: "बिलिंग पर जाएँ",
    noSweets: "अभी कोई मिठाई नहीं जोड़ी गई",
    pickSweet: "मिठाई सूची से कुछ स्वादिष्ट चुनें।",
    browse: "मिठाई सूची देखें",
    byKg: "किलो से",
    byRupee: "₹ से",
    quickAdd: "जल्दी जोड़ें",
    close: "बंद करें",
    add: "जोड़ें",
    rate: "दर",
    quantity: "मात्रा",
    total: "कुल",
    selected: "चयनित",
    unit: "इकाई",
    customerBill: "ग्राहक बिल",
    item: "वस्तु",
    qty: "मात्रा",
    additionalNote: "अतिरिक्त नोट",
    closeModal: "बंद करें",
    printBill: "बिल प्रिंट करें",
    language: "भाषा",
    english: "English",
    hindi: "हिन्दी",
    deployed: "अंतिम बार तैनात",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("sweetshop-language");
    return saved === "hi" ? "hi" : "en";
  });

  const value = useMemo(
    () => ({
      language,
      setLanguage: (next: Language) => {
        setLanguage(next);
        localStorage.setItem("sweetshop-language", next);
      },
      t: (key: TranslationKey) => translations[language][key],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
