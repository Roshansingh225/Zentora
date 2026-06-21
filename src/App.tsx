import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type FormEvent,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import { motion } from "framer-motion";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertTriangle,
  Apple,
  Baby,
  BadgeCheck,
  BarChart3,
  Boxes,
  CalendarClock,
  CakeSlice,
  Carrot,
  Clock3,
  Coffee,
  Cookie,
  Droplets,
  Eye,
  Heart,
  HeartPulse,
  Home,
  IndianRupee,
  Layers3,
  Leaf,
  LockKeyhole,
  LogIn,
  LogOut,
  MapPin,
  Megaphone,
  Milk,
  Minus,
  Package,
  PackageCheck,
  PawPrint,
  Percent,
  Plus,
  ReceiptText,
  Search,
  Share2,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Snowflake,
  SprayCan,
  Star,
  Store,
  Tag,
  Truck,
  Trash2,
  UserRound,
  Warehouse,
  Wheat,
  X,
  type LucideIcon,
} from "lucide-react";
import { z } from "zod";
import type { Session } from "@supabase/supabase-js";
import { cn } from "./lib/utils";
import { supabase } from "./lib/supabase";
import { useCartStore } from "./store/cart";

type Category = {
  name: string;
  description: string;
  icon: LucideIcon;
};

type UnitOption = {
  label: string;
  price: number;
  unitPrice: string;
};

type GroceryProduct = {
  id: string;
  title: string;
  category: string;
  brands: string[];
  defaultBrand: string;
  units: UnitOption[];
  freshness: "Farm fresh" | "Chilled" | "Pantry stable" | "Frozen" | "Baked today";
  expiry: string;
  stock: "In-stock" | "Out-of-stock" | "Few left";
  images: string[];
  rating: number;
  reviews: number;
  similar: string[];
  frequentlyBought: string[];
  badge: string;
};

type FashionProduct = {
  id: string;
  title: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  image: string;
  gallery: string[];
  description: string;
  sizes: string[];
  colors: string[];
  specs: string[];
  badge: string;
};

type DeliveryForm = {
  pincode: string;
  slot: string;
  address: string;
};

const groceryCategories: Category[] = [
  { name: "Fruits & Vegetables", description: "Daily-picked produce", icon: Carrot },
  { name: "Dairy & Eggs", description: "Milk, paneer, eggs", icon: Milk },
  { name: "Atta, Rice & Dal", description: "Staples for every home", icon: Wheat },
  { name: "Oil & Ghee", description: "Cooking essentials", icon: Droplets },
  { name: "Spices & Masala", description: "Whole and blended masalas", icon: Package },
  { name: "Snacks & Biscuits", description: "Tea-time and cravings", icon: Cookie },
  { name: "Beverages", description: "Tea, coffee, juices", icon: Coffee },
  { name: "Frozen Foods", description: "Ready-to-cook picks", icon: Snowflake },
  { name: "Bakery", description: "Bread, cakes, buns", icon: CakeSlice },
  { name: "Personal Care", description: "Bath and body care", icon: HeartPulse },
  { name: "Baby Care", description: "Gentle daily needs", icon: Baby },
  { name: "Household Essentials", description: "Home basics", icon: Home },
  { name: "Cleaning Supplies", description: "Fresh home supplies", icon: SprayCan },
  { name: "Pet Care", description: "Daily pet essentials", icon: PawPrint },
  { name: "Organic Products", description: "Certified organic range", icon: Leaf },
];

const groceryProductsSeed: GroceryProduct[] = [
  {
    id: "grocery-tomatoes",
    title: "Premium Hybrid Tomatoes",
    category: "Fruits & Vegetables",
    brands: ["ajiomart Fresh", "FarmRoute", "Organic Valley"],
    defaultBrand: "ajiomart Fresh",
    units: [
      { label: "500g", price: 34, unitPrice: "₹68/kg" },
      { label: "1kg", price: 62, unitPrice: "₹62/kg" },
      { label: "5kg", price: 285, unitPrice: "₹57/kg" },
    ],
    freshness: "Farm fresh",
    expiry: "Best before 3 days",
    stock: "In-stock",
    images: [
      "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80",
    ],
    rating: 4.8,
    reviews: 1284,
    similar: ["Cherry Tomatoes", "Organic Onions", "Fresh Coriander"],
    frequentlyBought: ["Green Chilli", "Coriander", "Ginger"],
    badge: "Same-day",
  },
  {
    id: "grocery-milk",
    title: "A2 Cow Milk",
    category: "Dairy & Eggs",
    brands: ["Amul", "Mother Dairy", "ajiomart Dairy"],
    defaultBrand: "ajiomart Dairy",
    units: [
      { label: "500ml", price: 42, unitPrice: "₹84/L" },
      { label: "1L", price: 78, unitPrice: "₹78/L" },
      { label: "6L", price: 438, unitPrice: "₹73/L" },
    ],
    freshness: "Chilled",
    expiry: "Expires in 2 days",
    stock: "Few left",
    images: [
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=900&q=80",
    ],
    rating: 4.7,
    reviews: 942,
    similar: ["Paneer", "Curd", "Brown Eggs"],
    frequentlyBought: ["Bread", "Butter", "Cornflakes"],
    badge: "Chilled",
  },
  {
    id: "grocery-atta",
    title: "Stoneground Whole Wheat Atta",
    category: "Atta, Rice & Dal",
    brands: ["Aashirvaad", "Fortune", "ajiomart Staples"],
    defaultBrand: "ajiomart Staples",
    units: [
      { label: "1kg", price: 58, unitPrice: "₹58/kg" },
      { label: "5kg", price: 255, unitPrice: "₹51/kg" },
      { label: "10kg", price: 492, unitPrice: "₹49/kg" },
    ],
    freshness: "Pantry stable",
    expiry: "Expires on 18 Dec 2026",
    stock: "In-stock",
    images: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
    ],
    rating: 4.6,
    reviews: 2310,
    similar: ["Basmati Rice", "Toor Dal", "Besan"],
    frequentlyBought: ["Ghee", "Salt", "Jeera"],
    badge: "Best value",
  },
  {
    id: "grocery-ghee",
    title: "Pure Cow Ghee",
    category: "Oil & Ghee",
    brands: ["Amul", "Patanjali", "ajiomart Gold"],
    defaultBrand: "ajiomart Gold",
    units: [
      { label: "500ml", price: 348, unitPrice: "₹696/L" },
      { label: "1L", price: 665, unitPrice: "₹665/L" },
      { label: "5L", price: 3190, unitPrice: "₹638/L" },
    ],
    freshness: "Pantry stable",
    expiry: "Expires on 22 Mar 2027",
    stock: "In-stock",
    images: [
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=900&q=80",
    ],
    rating: 4.9,
    reviews: 672,
    similar: ["Mustard Oil", "Sunflower Oil", "Organic Jaggery"],
    frequentlyBought: ["Atta", "Basmati Rice", "Dry Fruits"],
    badge: "Premium",
  },
  {
    id: "grocery-masala",
    title: "Royal Garam Masala",
    category: "Spices & Masala",
    brands: ["MDH", "Everest", "ajiomart Spice Co."],
    defaultBrand: "ajiomart Spice Co.",
    units: [
      { label: "100g", price: 82, unitPrice: "₹820/kg" },
      { label: "200g", price: 148, unitPrice: "₹740/kg" },
      { label: "500g", price: 345, unitPrice: "₹690/kg" },
    ],
    freshness: "Pantry stable",
    expiry: "Expires on 10 Jan 2027",
    stock: "In-stock",
    images: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=900&q=80",
    ],
    rating: 4.5,
    reviews: 515,
    similar: ["Turmeric", "Cumin", "Kitchen King Masala"],
    frequentlyBought: ["Basmati Rice", "Paneer", "Tomatoes"],
    badge: "Aromatic",
  },
  {
    id: "grocery-frozen",
    title: "Frozen Veg Momos",
    category: "Frozen Foods",
    brands: ["ITC Master Chef", "McCain", "ajiomart Quick"],
    defaultBrand: "ajiomart Quick",
    units: [
      { label: "400g", price: 169, unitPrice: "₹423/kg" },
      { label: "800g", price: 318, unitPrice: "₹398/kg" },
      { label: "1.6kg", price: 599, unitPrice: "₹374/kg" },
    ],
    freshness: "Frozen",
    expiry: "Expires on 05 Sep 2026",
    stock: "Out-of-stock",
    images: [
      "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80",
    ],
    rating: 4.3,
    reviews: 319,
    similar: ["Frozen Paratha", "French Fries", "Spring Rolls"],
    frequentlyBought: ["Chilli Sauce", "Mayonnaise", "Cold Coffee"],
    badge: "Frozen",
  },
];

const fashionProducts: FashionProduct[] = [
  {
    id: "fashion-jacket",
    title: "AeroWeave Overshirt",
    category: "Men",
    brand: "ajiomart Atelier",
    price: 3299,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "A premium lightweight overshirt with structured shoulders, breathable weave and a polished city fit for everyday layering.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Graphite", "Ivory", "Olive"],
    specs: ["Relaxed fit", "Cotton-blend shell", "Hidden placket", "Machine washable"],
    badge: "New drop",
  },
  {
    id: "fashion-sneaker",
    title: "Lunar Glide Sneakers",
    category: "Shoes",
    brand: "NorthForm",
    price: 5799,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Cushioned performance sneakers built for all-day comfort, sharp street styling and high-grip movement.",
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Crimson", "White", "Black"],
    specs: ["Foam midsole", "Mesh upper", "Rubber outsole", "Padded ankle collar"],
    badge: "Best seller",
  },
  {
    id: "fashion-watch",
    title: "Midnight Chrono Watch",
    category: "Watches",
    brand: "Crown & Co.",
    price: 8999,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "A polished chronograph watch with a midnight dial, stainless steel body and premium gifting finish.",
    sizes: ["42mm"],
    colors: ["Midnight", "Silver", "Rose Gold"],
    specs: ["Chronograph movement", "Stainless steel", "Water resistant", "Two-year warranty"],
    badge: "Premium",
  },
];

const deliverySlots = [
  "Today, 2 PM - 4 PM",
  "Today, 6 PM - 8 PM",
  "Tomorrow, 8 AM - 10 AM",
  "Tomorrow, 7 PM - 9 PM",
];

const orderTimeline = [
  { label: "Order confirmed", detail: "Payment and stock locked", active: true },
  { label: "Packed", detail: "Freshness check completed", active: true },
  { label: "Out for delivery", detail: "Partner assigned", active: true },
  { label: "Delivered", detail: "ETA updates in real time", active: false },
];

const fashionAdminModules = [
  { title: "Products", icon: Package, metric: "1,284 SKUs" },
  { title: "Categories", icon: Layers3, metric: "8 live" },
  { title: "Brands", icon: BadgeCheck, metric: "42 partners" },
  { title: "Orders", icon: ReceiptText, metric: "318 today" },
  { title: "Customers", icon: UserRound, metric: "24.8k" },
  { title: "Coupons", icon: Percent, metric: "16 active" },
  { title: "Inventory", icon: Warehouse, metric: "96% healthy" },
  { title: "Reviews", icon: Star, metric: "4.7 avg" },
  { title: "Banners", icon: Megaphone, metric: "5 running" },
  { title: "Reports", icon: BarChart3, metric: "Live" },
];

const groceryAdminModules = [
  { title: "Grocery Products", icon: PackageCheck, metric: "2,940 SKUs" },
  { title: "Categories", icon: Layers3, metric: "15 core" },
  { title: "Brands", icon: BadgeCheck, metric: "86 vendors" },
  { title: "Inventory Management", icon: Boxes, metric: "Live stock" },
  { title: "Stock Alerts", icon: AlertTriangle, metric: "28 alerts" },
  { title: "Expiry Date Management", icon: CalendarClock, metric: "156 batches" },
  { title: "Suppliers", icon: Store, metric: "34 active" },
  { title: "Purchase Records", icon: ReceiptText, metric: "₹18.6L" },
  { title: "Orders", icon: ShoppingCart, metric: "612 today" },
  { title: "Coupons", icon: Percent, metric: "22 active" },
  { title: "Delivery Charges", icon: Truck, metric: "Zone based" },
  { title: "Delivery Slots", icon: Clock3, metric: "18 windows" },
  { title: "Offers", icon: Tag, metric: "41 live" },
  { title: "Reports", icon: BarChart3, metric: "Realtime" },
];

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gold text-obsidian shadow-glow hover:-translate-y-0.5 hover:bg-[#f0cd5d]",
        secondary: "border border-white/15 bg-white/8 text-white hover:border-gold/60 hover:bg-white/14",
        ghost: "text-white/78 hover:bg-white/10 hover:text-white",
      },
      size: {
        sm: "px-3 py-2 text-xs",
        md: "px-5 py-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>) {
  return <button className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/70", className)}>{children}</span>;
}

function Price({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center">
      <IndianRupee className="h-4 w-4" />
      {value.toLocaleString("en-IN")}
    </span>
  );
}

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  openLogin: (message?: string) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("Login is required before adding products to cart.");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        setAuthOpen(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function openLogin(message = "Login is required before adding products to cart.") {
    setAuthMessage(message);
    setAuthOpen(true);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, loading, openLogin, signOut }}>
      {children}
      <AuthModal open={authOpen} message={authMessage} onClose={() => setAuthOpen(false)} />
    </AuthContext.Provider>
  );
}

function AuthModal({ open, message, onClose }: { open: boolean; message: string; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(message);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStatus(message);
    }
  }, [message, open]);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(mode === "login" ? "Signing you in..." : "Creating your account...");

    const authCall =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
    const { data, error } = await authCall;

    if (error) {
      setStatus(error.message);
      setSubmitting(false);
      return;
    }

    if (data.session) {
      setStatus("Login successful.");
      onClose();
      setSubmitting(false);
      return;
    }

    setStatus("Account created. Please verify your email, then login.");
    setSubmitting(false);
  }

  async function continueWithGoogle() {
    setSubmitting(true);
    setStatus("Opening Google login...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setStatus(error.message);
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-[1.75rem] border border-white/12 bg-obsidian p-6 shadow-2xl shadow-black/50"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-3xl font-black">{mode === "login" ? "Login" : "Create account"}</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">{status}</p>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/8 text-white/70">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submitAuth} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-white/45">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none focus:border-gold/50"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-white/45">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              type="password"
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none focus:border-gold/50"
              placeholder="Minimum 6 characters"
            />
          </label>
          <Button type="submit" className="w-full" disabled={submitting}>
            <LogIn className="h-4 w-4" />
            {mode === "login" ? "Login to Continue" : "Create Account"}
          </Button>
          <Button type="button" variant="secondary" className="w-full" disabled={submitting} onClick={continueWithGoogle}>
            Continue with Google
          </Button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setStatus(mode === "login" ? "Create a new account to start shopping." : "Login with your existing account.");
          }}
          className="mt-5 w-full text-center text-sm font-semibold text-gold"
        >
          {mode === "login" ? "New user? Create account" : "Already have account? Login"}
        </button>
      </motion.div>
    </div>
  );
}

function FloatingBag({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={2.2} rotationIntensity={0.85} floatIntensity={1.2}>
      <group position={position} rotation={[0.2, 0.4, 0.1]}>
        <mesh>
          <boxGeometry args={[0.9, 1.05, 0.42]} />
          <meshStandardMaterial color={color} roughness={0.38} metalness={0.18} />
        </mesh>
        <mesh position={[0, 0.66, 0]}>
          <torusGeometry args={[0.26, 0.035, 12, 32, Math.PI]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.25} />
        </mesh>
      </group>
    </Float>
  );
}

function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 6], fov: 48 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      className="hero-canvas"
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 5]} intensity={1.6} color="#fff4cf" />
      <pointLight position={[-3, -1, 2]} intensity={5} color="#34d399" />
      <Suspense fallback={null}>
        <Sparkles count={80} speed={0.35} color="#D4AF37" size={2.6} scale={[7, 4, 3]} />
        <FloatingBag position={[-2.6, 0.7, -0.2]} color="#D4AF37" />
        <FloatingBag position={[2.4, -0.2, -0.1]} color="#34D399" />
        <Float speed={1.7} rotationIntensity={1.1} floatIntensity={0.8}>
          <mesh position={[0.25, 0.45, 0]} rotation={[0.6, 0.55, 0.15]}>
            <icosahedronGeometry args={[0.95, 1]} />
            <meshStandardMaterial color="#ffffff" roughness={0.18} metalness={0.75} transparent opacity={0.82} />
          </mesh>
        </Float>
        <Float speed={2.5} rotationIntensity={1} floatIntensity={1.5}>
          <mesh position={[1.1, 1.35, -0.8]} rotation={[0.3, 0.8, 0.2]}>
            <sphereGeometry args={[0.42, 32, 32]} />
            <meshStandardMaterial color="#f43f5e" roughness={0.42} metalness={0.08} />
          </mesh>
        </Float>
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}

function Layout({ children }: { children: ReactNode }) {
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const { session, loading, openLogin, signOut } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden bg-obsidian text-white">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-obsidian/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-gold/40 bg-gold/15 shadow-glow">
              <ShoppingBag className="h-5 w-5 text-gold" />
            </span>
            <span>
              <span className="block font-display text-xl font-bold tracking-normal">ajiomart</span>
              <span className="block text-[11px] uppercase tracking-[0.24em] text-white/45">Fashion + Grocery</span>
            </span>
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 p-1 md:flex">
            {[
              ["Home", "/"],
              ["Fashion", "/fashion"],
              ["Grocery", "/grocery"],
            ].map(([label, href]) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm text-white/65 transition hover:text-white",
                    isActive && "bg-white/12 text-white shadow-inner",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/grocery"
              className="hidden rounded-full border border-emerald/30 bg-emerald/10 px-4 py-2 text-sm font-semibold text-emerald sm:inline-flex"
            >
              Same-day Grocery
            </Link>
            {session ? (
              <button
                onClick={() => void signOut()}
                className="hidden items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white/70 transition hover:text-white sm:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <button
                onClick={() => openLogin("Login to shop, add products and checkout.")}
                disabled={loading}
                className="hidden items-center gap-2 rounded-full border border-gold/35 bg-gold/12 px-4 py-3 text-sm font-semibold text-gold transition hover:bg-gold/20 sm:inline-flex"
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
            )}
            <Link to="/cart" className="relative rounded-full border border-white/12 bg-white/8 p-3 text-white">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-bold text-obsidian">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden pt-28">
      <div className="absolute inset-0">
        <HeroScene />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_12%,rgba(212,175,55,.18),transparent_32%),radial-gradient(circle_at_20%_70%,rgba(52,211,153,.15),transparent_28%),linear-gradient(180deg,rgba(9,9,11,.52),#09090B_88%)]" />
      <div className="relative z-10 mx-auto grid min-h-[calc(92vh-7rem)] max-w-7xl items-center gap-12 px-4 pb-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Pill className="border-gold/30 bg-gold/10 text-gold">Premium commerce, fast grocery delivery</Pill>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-black leading-[0.96] text-white sm:text-7xl lg:text-8xl">
            ajiomart
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
            Everything you love in one destination: luxury fashion drops, daily grocery essentials, smart delivery slots,
            and premium checkout.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/fashion" className={buttonStyles({ variant: "primary" })}>
              <Shirt className="h-4 w-4" />
              Shop Fashion
            </Link>
            <Link to="/grocery" className={buttonStyles({ variant: "secondary" })}>
              <Apple className="h-4 w-4" />
              Shop Grocery
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="hidden lg:block"
        >
          <div className="glass-panel p-5">
            <div className="grid grid-cols-2 gap-4">
              <Metric label="Same-day orders" value="6.2k" icon={Truck} />
              <Metric label="Freshness score" value="98%" icon={Leaf} />
              <Metric label="Fashion SKUs" value="1.2k" icon={Shirt} />
              <Metric label="Live delivery slots" value="18" icon={CalendarClock} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
      <Icon className="h-5 w-5 text-gold" />
      <p className="mt-5 text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm text-white/55">{label}</p>
    </div>
  );
}

function LandingPage() {
  return (
    <Layout>
      <Hero />
      <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <MarketplaceCard
            to="/fashion"
            title="Fashion"
            eyebrow="Premium marketplace"
            image="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
            icon={Shirt}
            items={["Men", "Women", "Kids", "Shoes", "Watches", "Accessories", "Beauty"]}
          />
          <MarketplaceCard
            to="/grocery"
            title="Grocery"
            eyebrow="Fresh essentials"
            image="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
            icon={Apple}
            items={["Fresh produce", "Dairy", "Staples", "Delivery slots", "Stock alerts", "Expiry tracking"]}
          />
        </div>
      </section>
    </Layout>
  );
}

function MarketplaceCard({
  to,
  title,
  eyebrow,
  image,
  icon: Icon,
  items,
}: {
  to: string;
  title: string;
  eyebrow: string;
  image: string;
  icon: LucideIcon;
  items: string[];
}) {
  return (
    <Link to={to} className="group relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/8">
      <img src={image} alt={`${title} marketplace`} className="absolute inset-0 h-full w-full object-cover opacity-72 transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/42 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-gold/40 bg-gold/15 text-gold shadow-glow">
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-sm uppercase tracking-[0.24em] text-gold">{eyebrow}</p>
        <h2 className="mt-2 font-display text-5xl font-black">{title}</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {items.map((item) => (
            <Pill key={item}>{item}</Pill>
          ))}
        </div>
      </div>
    </Link>
  );
}

function FashionPage() {
  const addItem = useCartStore((state) => state.addItem);
  const { session, openLogin } = useAuth();

  function addFashionProduct(product: FashionProduct) {
    if (!session) {
      openLogin("Login required: please login before adding fashion products to cart.");
      return;
    }
    addItem({ id: product.id, title: product.title, price: product.price, unit: "1 item", source: "fashion" });
  }

  return (
    <Layout>
      <PageShell
        eyebrow="Fashion Marketplace"
        title="Premium drops with powerful filters"
        description="Search, category, brand, color, size, price, discount, rating, availability and sorting controls are ready for catalogue integration."
      >
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="glass-panel h-fit p-5">
            <h2 className="font-display text-xl font-bold">Filters</h2>
            <div className="mt-5 space-y-4">
              {["Search", "Category", "Brand", "Color", "Size", "Price", "Discount", "Rating", "Availability"].map((filter) => (
                <label key={filter} className="block">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/45">{filter}</span>
                  <div className="mt-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/65">
                    {filter === "Search" ? "AeroWeave, sneakers..." : `All ${filter.toLowerCase()}`}
                  </div>
                </label>
              ))}
            </div>
          </aside>
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {["Newest", "Price", "Popular", "Rating", "Best Selling"].map((sort) => (
                  <Pill key={sort}>{sort}</Pill>
                ))}
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {fashionProducts.map((product) => (
                <motion.article
                  key={product.id}
                  whileHover={{ y: -6 }}
                  className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/8 shadow-2xl shadow-black/20"
                >
                  <Link to={`/fashion/${product.id}`} className="block">
                    <div className="relative h-72">
                      <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                      <Pill className="absolute left-4 top-4 border-gold/35 bg-gold/15 text-gold">{product.badge}</Pill>
                      <div className="absolute right-4 top-4 flex gap-2">
                        {[Heart, Eye, Share2].map((Icon, index) => (
                          <span key={index} className="grid h-10 w-10 place-items-center rounded-full bg-obsidian/70 text-white backdrop-blur">
                            <Icon className="h-4 w-4" />
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-white/50">{product.brand} / {product.category}</p>
                      <h3 className="mt-1 text-xl font-bold">{product.title}</h3>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-2xl font-black text-gold"><Price value={product.price} /></p>
                        <span className="inline-flex items-center gap-1 text-sm text-white/70">
                          <Star className="h-4 w-4 fill-gold text-gold" /> {product.rating}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="px-5 pb-5">
                    <Button className="w-full" onClick={() => addFashionProduct(product)}>
                      <Plus className="h-4 w-4" /> Add to Cart
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        </div>
      </PageShell>
    </Layout>
  );
}

function GroceryPage() {
  const { data: products = [] } = useQuery({
    queryKey: ["grocery-products"],
    queryFn: async () => groceryProductsSeed,
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All Brands");
  const [sort, setSort] = useState("Popular");
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const { session, openLogin } = useAuth();
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = subtotal >= 499 ? 0 : subtotal > 0 ? 49 : 0;

  const brands = useMemo(
    () => ["All Brands", ...Array.from(new Set(products.flatMap((product) => product.brands)))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesQuery = product.title.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      const matchesBrand = brand === "All Brands" || product.brands.includes(brand);
      return matchesQuery && matchesCategory && matchesBrand;
    });

    return [...result].sort((a, b) => {
      if (sort === "Price") return a.units[0].price - b.units[0].price;
      if (sort === "Rating") return b.rating - a.rating;
      if (sort === "Newest") return b.id.localeCompare(a.id);
      return b.reviews - a.reviews;
    });
  }, [brand, category, products, query, sort]);

  function addGroceryProduct(item: { id: string; title: string; price: number; unit: string; source: "grocery" }) {
    if (!session) {
      openLogin("Login required: please login before adding grocery products to cart.");
      return;
    }
    addItem(item);
  }

  return (
    <Layout>
      <PageShell
        eyebrow="Grocery Marketplace"
        title="Fresh grocery, planned delivery, reliable stock"
        description="Grocery is now the dedicated daily-essentials marketplace across customer and admin flows."
      >
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {groceryCategories.map((item) => (
            <CategoryTile key={item.name} category={item} active={category === item.name} onClick={() => setCategory(item.name)} />
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div>
            <div className="glass-panel mb-5 grid gap-3 p-4 lg:grid-cols-[1fr_220px_220px_180px]">
              <label className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/8 pl-11 pr-4 text-sm text-white outline-none transition focus:border-gold/50"
                  placeholder="Search grocery products"
                />
              </label>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="select-control">
                <option>All</option>
                {groceryCategories.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
              <select value={brand} onChange={(event) => setBrand(event.target.value)} className="select-control">
                {brands.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="select-control">
                {["Popular", "Newest", "Price", "Rating", "Best Selling"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-white/55">{filteredProducts.length} grocery products</p>
              <Pill className="inline-flex items-center gap-2 border-emerald/25 bg-emerald/10 text-emerald">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Freshness, expiry, stock and unit price enabled
              </Pill>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredProducts.map((product) => (
                <GroceryProductCard key={product.id} product={product} onAdd={addGroceryProduct} />
              ))}
            </div>
          </div>

          <DeliveryPanel subtotal={subtotal} deliveryCharge={deliveryCharge} />
        </section>
      </PageShell>
    </Layout>
  );
}

function CategoryTile({ category, active, onClick }: { category: Category; active: boolean; onClick: () => void }) {
  const Icon = category.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group min-h-[132px] rounded-[1.5rem] border p-4 text-left transition duration-300 hover:-translate-y-1",
        active ? "border-gold/50 bg-gold/15 shadow-glow" : "border-white/10 bg-white/8 hover:border-white/20",
      )}
    >
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <span className="mt-4 block font-semibold text-white">{category.name}</span>
      <span className="mt-1 block text-sm text-white/50">{category.description}</span>
    </button>
  );
}

function GroceryProductCard({
  product,
  onAdd,
}: {
  product: GroceryProduct;
  onAdd: (item: { id: string; title: string; price: number; unit: string; source: "grocery" }) => void;
}) {
  const [unit, setUnit] = useState(product.units[0]);
  const [brand, setBrand] = useState(product.defaultBrand);
  const [imageIndex, setImageIndex] = useState(0);
  const isUnavailable = product.stock === "Out-of-stock";

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/8 shadow-2xl shadow-black/20"
    >
      <div className="grid gap-0 sm:grid-cols-[42%_58%]">
        <div className="relative min-h-[280px] bg-white/6">
          <img src={product.images[imageIndex]} alt={product.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/72 via-transparent to-transparent" />
          <Pill className="absolute left-4 top-4 border-gold/35 bg-gold/15 text-gold">{product.badge}</Pill>
          <div className="absolute bottom-4 left-4 flex gap-2">
            {product.images.map((image, index) => (
              <button
                key={image}
                onClick={() => setImageIndex(index)}
                className={cn(
                  "h-12 w-12 overflow-hidden rounded-2xl border transition",
                  imageIndex === index ? "border-gold" : "border-white/20 opacity-80",
                )}
              >
                <img src={image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/48">{product.category}</p>
              <h3 className="mt-1 text-2xl font-black leading-tight">{product.title}</h3>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                product.stock === "In-stock" && "bg-emerald/15 text-emerald",
                product.stock === "Few left" && "bg-gold/15 text-gold",
                product.stock === "Out-of-stock" && "bg-rose-500/15 text-rose-200",
              )}
            >
              {product.stock}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {product.units.map((option) => (
              <button
                key={option.label}
                onClick={() => setUnit(option)}
                className={cn(
                  "rounded-2xl border px-3 py-2 text-left text-sm transition",
                  unit.label === option.label ? "border-gold bg-gold/15 text-gold" : "border-white/10 bg-white/6 text-white/66",
                )}
              >
                <span className="block font-bold">{option.label}</span>
                <span className="text-xs">{option.unitPrice}</span>
              </button>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="text-xs uppercase tracking-[0.18em] text-white/45">Brand selection</span>
            <select value={brand} onChange={(event) => setBrand(event.target.value)} className="select-control mt-2 w-full">
              {product.brands.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <div className="mt-4 grid gap-2 text-sm text-white/64 sm:grid-cols-2">
            <span className="inline-flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald" /> {product.freshness}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-gold" /> {product.expiry}
            </span>
            <span className="inline-flex items-center gap-2">
              <Star className="h-4 w-4 fill-gold text-gold" /> {product.rating} ({product.reviews} reviews)
            </span>
            <span className="inline-flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-emerald" /> Unit price {unit.unitPrice}
            </span>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/42">Frequently bought together</p>
            <p className="mt-1 text-sm text-white/68">{product.frequentlyBought.join(" + ")}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/42">Similar products</p>
            <p className="mt-1 text-sm text-white/68">{product.similar.join(", ")}</p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-white/45">Selected price</p>
              <p className="text-3xl font-black text-gold"><Price value={unit.price} /></p>
            </div>
            <Button
              disabled={isUnavailable}
              onClick={() => onAdd({ id: `${product.id}-${unit.label}-${brand}`, title: `${product.title} (${brand})`, price: unit.price, unit: unit.label, source: "grocery" })}
            >
              <Plus className="h-4 w-4" />
              {isUnavailable ? "Out of Stock" : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function DeliveryPanel({ subtotal, deliveryCharge }: { subtotal: number; deliveryCharge: number }) {
  const [message, setMessage] = useState("Same-day delivery available for selected serviceable pincodes.");
  const total = subtotal + deliveryCharge;
  const deliverySchema = z.object({
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
    slot: z.string().min(1, "Select a delivery slot"),
    address: z.string().min(12, "Add a complete delivery address"),
  });

  const { register, handleSubmit, watch, formState } = useForm<DeliveryForm>({
    defaultValues: {
      pincode: "110001",
      slot: deliverySlots[0],
      address: "Connaught Place, New Delhi",
    },
  });

  const selectedSlot = watch("slot");

  function onSubmit(values: DeliveryForm) {
    const parsed = deliverySchema.safeParse(values);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || "Please check delivery details.");
      return;
    }
    setMessage(`Scheduled for ${values.slot}. Tracking timeline is ready for ${values.pincode}.`);
  }

  return (
    <aside className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold">Delivery</p>
            <h2 className="mt-1 font-display text-2xl font-black">Same-day or scheduled</h2>
          </div>
          <Truck className="h-7 w-7 text-emerald" />
        </div>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-white/45">Pincode</span>
            <input {...register("pincode")} className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/8 px-4 text-white outline-none focus:border-gold/50" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-white/45">Scheduled delivery slots</span>
            <select {...register("slot")} className="select-control mt-2 w-full">
              {deliverySlots.map((slot) => (
                <option key={slot}>{slot}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-white/45">Delivery address</span>
            <textarea {...register("address")} rows={3} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white outline-none focus:border-gold/50" />
          </label>
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/7 p-4">
          <div className="flex justify-between text-sm text-white/62">
            <span>Minimum order amount</span>
            <span>₹499</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-white/62">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-white/62">
            <span>Delivery charge</span>
            <span>{deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}</span>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 flex justify-between text-lg font-black text-gold">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <Button type="submit" className="mt-5 w-full" disabled={formState.isSubmitting}>
          <CalendarClock className="h-4 w-4" />
          Schedule Delivery
        </Button>
        <p className="mt-3 text-sm text-white/60">{message}</p>
      </form>

      <div className="glass-panel p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-gold">Order tracking</p>
        <h2 className="mt-1 font-display text-2xl font-black">Status timeline</h2>
        <p className="mt-2 text-sm text-white/54">Slot: {selectedSlot}</p>
        <div className="mt-5 space-y-4">
          {orderTimeline.map((item, index) => (
            <div key={item.label} className="relative flex gap-4">
              {index < orderTimeline.length - 1 && <span className="absolute left-[17px] top-9 h-[calc(100%+10px)] w-px bg-white/12" />}
              <span className={cn("relative z-10 grid h-9 w-9 place-items-center rounded-full border", item.active ? "border-emerald/50 bg-emerald/15 text-emerald" : "border-white/12 bg-white/8 text-white/35")}>
                {item.active ? <ShieldCheck className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
              </span>
              <span>
                <span className="block font-semibold">{item.label}</span>
                <span className="block text-sm text-white/50">{item.detail}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function FashionDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = fashionProducts.find((item) => item.id === productId);
  const [selectedImage, setSelectedImage] = useState(product?.gallery[0] || "");
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || "");
  const addItem = useCartStore((state) => state.addItem);
  const { session, openLogin } = useAuth();

  useEffect(() => {
    if (product) {
      setSelectedImage(product.gallery[0]);
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <Layout>
        <PageShell eyebrow="Fashion" title="Product not found" description="This fashion item is not available right now.">
          <Button onClick={() => navigate("/fashion")}>Back to Fashion</Button>
        </PageShell>
      </Layout>
    );
  }

  const selectedProduct = product;

  function addProductToCart() {
    if (!session) {
      openLogin("Login required: please login before adding this fashion product to cart.");
      return;
    }
    addItem({
      id: `${selectedProduct.id}-${selectedSize}-${selectedColor}`,
      title: `${selectedProduct.title} (${selectedColor}, ${selectedSize})`,
      price: selectedProduct.price,
      unit: "1 item",
      source: "fashion",
    });
    navigate("/cart");
  }

  return (
    <Layout>
      <PageShell eyebrow="Fashion Detail" title={product.title} description={product.description}>
        <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="glass-panel overflow-hidden p-4">
            <div className="relative min-h-[520px] overflow-hidden rounded-[1.25rem] bg-white/6">
              <img src={selectedImage} alt={product.title} className="absolute inset-0 h-full w-full object-cover" />
              <Pill className="absolute left-4 top-4 border-gold/35 bg-gold/15 text-gold">{product.badge}</Pill>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {product.gallery.map((image) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  className={cn("h-28 overflow-hidden rounded-2xl border", selectedImage === image ? "border-gold" : "border-white/10")}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="glass-panel p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Pill>{product.category}</Pill>
                <Pill>{product.brand}</Pill>
                <Pill className="inline-flex items-center gap-1 border-gold/30 bg-gold/10 text-gold">
                  <Star className="h-3.5 w-3.5 fill-gold" /> {product.rating}
                </Pill>
              </div>
              <p className="mt-6 text-4xl font-black text-gold"><Price value={product.price} /></p>
              <p className="mt-4 leading-7 text-white/64">{product.description}</p>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Size</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn("min-w-12 rounded-2xl border px-4 py-3 text-sm font-bold", selectedSize === size ? "border-gold bg-gold/15 text-gold" : "border-white/10 bg-white/7 text-white/70")}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Color</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn("rounded-2xl border px-4 py-3 text-sm font-bold", selectedColor === color ? "border-gold bg-gold/15 text-gold" : "border-white/10 bg-white/7 text-white/70")}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="mt-7 w-full" onClick={addProductToCart}>
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>

            <div className="glass-panel p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-gold">Description</p>
              <h2 className="mt-1 font-display text-2xl font-black">Product specifications</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.specs.map((spec) => (
                  <div key={spec} className="rounded-2xl border border-white/10 bg-white/7 p-4 text-sm text-white/68">
                    {spec}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-gold">Related products</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {fashionProducts
                  .filter((item) => item.id !== product.id)
                  .slice(0, 2)
                  .map((item) => (
                    <Link key={item.id} to={`/fashion/${item.id}`} className="rounded-2xl border border-white/10 bg-white/7 p-4 transition hover:border-gold/40">
                      <span className="block font-bold">{item.title}</span>
                      <span className="mt-1 block text-sm text-white/52">{item.brand}</span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </PageShell>
    </Layout>
  );
}

function CartPage() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const { session, openLogin } = useAuth();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = subtotal >= 499 ? 0 : subtotal > 0 ? 49 : 0;

  return (
    <Layout>
      <PageShell
        eyebrow="Cart"
        title="Added products and delivery"
        description="Review added products, update quantities and add delivery address before checkout."
      >
        {!session && (
          <div className="mb-6 rounded-[1.5rem] border border-gold/25 bg-gold/10 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-black">Login required for checkout</h2>
                <p className="mt-1 text-sm text-white/62">Please login before adding products or placing an order.</p>
              </div>
              <Button onClick={() => openLogin("Login required before checkout and order delivery.")}>
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </div>
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="glass-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gold">Added products</p>
                <h2 className="mt-1 font-display text-3xl font-black">Cart items</h2>
              </div>
              {items.length > 0 && (
                <Button variant="secondary" size="sm" onClick={clear}>
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/7 p-8 text-center">
                <ShoppingCart className="mx-auto h-10 w-10 text-gold" />
                <h3 className="mt-4 text-2xl font-black">No products added</h3>
                <p className="mt-2 text-white/55">Add fashion or grocery products to see them here.</p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to="/fashion" className={buttonStyles({ variant: "secondary" })}>Shop Fashion</Link>
                  <Link to="/grocery" className={buttonStyles({ variant: "primary" })}>Shop Grocery</Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <article key={item.id} className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/7 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill>{item.source === "fashion" ? "Fashion" : "Grocery"}</Pill>
                        <Pill>{item.unit}</Pill>
                      </div>
                      <h3 className="mt-3 text-xl font-bold">{item.title}</h3>
                      <p className="mt-1 text-sm text-white/55">
                        <Price value={item.price} /> each
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setQuantity(item.id, item.quantity - 1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/8">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-lg font-black">{item.quantity}</span>
                      <button onClick={() => setQuantity(item.id, item.quantity + 1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/8">
                        <Plus className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="grid h-10 w-10 place-items-center rounded-full border border-rose-300/20 bg-rose-500/10 text-rose-200">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="glass-panel p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-gold">Order summary</p>
              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-white/64">
                  <span>Products</span>
                  <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-white/64">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-white/64">
                  <span>Delivery</span>
                  <span>{deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-black text-gold">
                  <span>Total</span>
                  <span>₹{(subtotal + deliveryCharge).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
            <DeliveryPanel subtotal={subtotal} deliveryCharge={deliveryCharge} />
          </div>
        </section>
      </PageShell>
    </Layout>
  );
}

function AdminPage() {
  const [active, setActive] = useState<"fashion" | "grocery">("grocery");
  const modules = active === "fashion" ? fashionAdminModules : groceryAdminModules;

  return (
    <Layout>
      <PageShell
        eyebrow="Admin Panel"
        title="Fashion and Grocery operations"
        description="Two dedicated admin modules with analytics, inventory, delivery, offers, reports and realtime-ready operations."
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="rounded-full border border-white/10 bg-white/7 p-1">
            <button onClick={() => setActive("fashion")} className={cn("rounded-full px-5 py-3 text-sm font-semibold transition", active === "fashion" ? "bg-gold text-obsidian" : "text-white/65")}>
              Fashion Admin
            </button>
            <button onClick={() => setActive("grocery")} className={cn("rounded-full px-5 py-3 text-sm font-semibold transition", active === "grocery" ? "bg-gold text-obsidian" : "text-white/65")}>
              Grocery Admin
            </button>
          </div>
          <Pill className="inline-flex items-center gap-2 border-emerald/25 bg-emerald/10 text-emerald">
            <BadgeCheck className="h-3.5 w-3.5" />
            Realtime dashboard ready
          </Pill>
        </div>

        <section className="grid gap-5 lg:grid-cols-4">
          <Metric label="Revenue" value="₹42.8L" icon={IndianRupee} />
          <Metric label="Orders" value={active === "grocery" ? "612" : "318"} icon={ShoppingCart} />
          <Metric label="Users" value="24.8k" icon={UserRound} />
          <Metric label="Growth" value="+18%" icon={BarChart3} />
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <motion.article
                key={module.title}
                whileHover={{ y: -4 }}
                className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Pill>{module.metric}</Pill>
                </div>
                <h3 className="mt-5 text-xl font-bold">{module.title}</h3>
                <p className="mt-2 text-sm text-white/50">
                  {active === "grocery"
                    ? "Grocery workflow with stock, expiry, supplier and delivery controls."
                    : "Fashion workflow with products, categories, brands, reviews and merchandising."}
                </p>
              </motion.article>
            );
          })}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-gold">Reports</p>
            <h2 className="mt-1 font-display text-2xl font-black">Sales and growth analytics</h2>
            <div className="mt-8 flex h-72 items-end gap-3">
              {[44, 68, 54, 82, 74, 96, 88, 112, 104, 132, 118, 148].map((height, index) => (
                <div key={height + index} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-emerald/70 to-gold shadow-glow"
                    style={{ height: `${height}px` }}
                  />
                  <span className="text-[10px] text-white/35">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-gold">Realtime alerts</p>
            <h2 className="mt-1 font-display text-2xl font-black">Operations queue</h2>
            <div className="mt-5 space-y-3">
              {(active === "grocery"
                ? [
                    "32 tomato crates need freshness scan",
                    "8 dairy batches expire within 48 hours",
                    "South Delhi has high same-day demand",
                    "Supplier invoice PR-2048 needs approval",
                  ]
                : [
                    "AeroWeave stock below reorder level",
                    "Sneaker launch banner starts at 8 PM",
                    "Refund queue has 11 pending requests",
                    "Top review keywords updated",
                  ]
              ).map((alert) => (
                <div key={alert} className="rounded-2xl border border-white/10 bg-white/7 p-4 text-sm text-white/66">
                  {alert}
                </div>
              ))}
            </div>
          </div>
        </section>
      </PageShell>
    </Layout>
  );
}

function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative pt-28">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,.18),transparent_34%),radial-gradient(circle_at_80%_14%,rgba(52,211,153,.12),transparent_30%)]" />
      <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-4xl">
          <Pill className="border-gold/30 bg-gold/10 text-gold">{eyebrow}</Pill>
          <h1 className="mt-5 font-display text-4xl font-black leading-tight sm:text-6xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/62">{description}</p>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/fashion" element={<FashionPage />} />
        <Route path="/fashion/:productId" element={<FashionDetailPage />} />
        <Route path="/grocery" element={<GroceryPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AuthProvider>
  );
}
