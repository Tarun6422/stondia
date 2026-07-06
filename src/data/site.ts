import cobbles from "@/assets/product-cobbles.jpg";
import jali from "@/assets/product-jali.jpg";
import column from "@/assets/product-column.jpg";
import villa from "@/assets/project-villa.jpg";
import factory from "@/assets/factory.jpg";
import texture from "@/assets/texture-stone.jpg";

export const COMPANY = {
  name: "Stone India Heritage",
  short: "Stone India",
  brand: "STONE INDIA HERITAGE",
  tagline: "Heritage Sandstone & Architecture",
  subtitle: "Heritage Sandstone & Architecture",
  email: "exports@stoneindiaheritage.com",
  phone: "+91 98290 00000",
  address: "Industrial Area, Jodhpur, Rajasthan 342001, India",
  vision: "To become the global gold standard for Rajasthan's architectural heritage.",
  mission:
    "Deliver premium natural stone products with exceptional craftsmanship while promoting sustainability, innovation, quality, and long-term global partnerships.",
  values: [
    "Heritage",
    "Quality",
    "Sustainability",
    "Innovation",
    "Trust",
    "Craftsmanship",
    "Global Excellence",
  ],
};

export const NAV = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Heritage", to: "/heritage" },
  { label: "Factory", to: "/factory" },
  { label: "Process", to: "/manufacturing" },
  { label: "Sustainability", to: "/sustainability" },
  { label: "Products", to: "/products" },
  { label: "Catalog", to: "/catalog" },
  { label: "Projects", to: "/projects" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
];

export const FOOTER_LINKS = {
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Our Heritage", to: "/heritage" },
    { label: "Factory", to: "/factory" },
    { label: "Careers", to: "/careers" },
    { label: "Certifications", to: "/certifications" },
  ],
  Explore: [
    { label: "Products", to: "/products" },
    { label: "Digital Catalog", to: "/catalog" },
    { label: "Projects", to: "/projects" },
    { label: "Gallery", to: "/gallery" },
    { label: "Videos", to: "/videos" },
  ],
  Resources: [
    { label: "Download Center", to: "/downloads" },
    { label: "Blog", to: "/blog" },
    { label: "FAQ", to: "/faq" },
    { label: "Track Order", to: "/track-order" },
    { label: "Request Quote", to: "/quote" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
    { label: "Contact", to: "/contact" },
  ],
};

export const USPS = [
  { title: "Premium Rajasthan Sandstone", desc: "Sourced from heritage quarries with unmatched natural character." },
  { title: "Heritage Craftsmanship", desc: "Traditional hand-carving refined over generations of artisans." },
  { title: "Sustainable Quarrying", desc: "Responsible extraction with water recycling and waste reduction." },
  { title: "Exceptional Durability", desc: "Weather-resistant stone engineered for centuries of service." },
  { title: "Precision Manufacturing", desc: "CNC calibration meeting global export tolerances." },
  { title: "Global Shipping", desc: "International packaging standards and worldwide logistics." },
];

export const CATEGORIES = [
  "Sandstone",
  "Granite",
  "Marble",
  "Limestone",
  "Slate",
  "Quartzite",
  "Wall Cladding",
  "Flooring",
  "Paving",
  "Cobbles",
  "Kerbstone",
  "Pool Coping",
  "Steps",
  "Garden Stone",
  "Landscape Stone",
  "Columns",
  "Balusters",
  "Jali",
  "Carvings",
  "Temple Stone",
  "Custom Stone",
];

export type CategoryDetail = {
  name: string;
  description: string;
  applications: string[];
  filterGroups: string[];
  image: string;
  comparison: {
    durability: string;
    waterAbsorption: string;
    finishes: string;
    maintenance: string;
    weatherResistance: string;
    priceRange: string;
  };
};

export const CATEGORY_DATA: CategoryDetail[] = [
  {
    name: "Sandstone",
    description: "Rajasthan's signature natural stone — warm tones, natural grain, and exceptional durability for facades, paving, and architectural features.",
    applications: ["Facades", "Paving", "Cladding", "Landscaping", "Steps", "Pool Coping"],
    filterGroups: ["Natural Stone", "Architectural", "Outdoor", "Premium Collection", "Export Collection"],
    image: texture,
    comparison: { durability: "High", waterAbsorption: "< 1.2%", finishes: "Natural, Honed, Brushed, Sandblasted", maintenance: "Low", weatherResistance: "Excellent", priceRange: "$$", },
  },
  {
    name: "Granite",
    description: "Ultra-hard, dense granite from Indian quarries — ideal for high-traffic flooring, countertops, and structural applications requiring extreme durability.",
    applications: ["Countertops", "Flooring", "Stairs", "Monuments", "Structural"],
    filterGroups: ["Natural Stone", "Premium Collection", "Export Collection"],
    image: texture,
    comparison: { durability: "Very High", waterAbsorption: "< 0.4%", finishes: "Polished, Honed, Flamed, Leather", maintenance: "Very Low", weatherResistance: "Excellent", priceRange: "$$$", },
  },
  {
    name: "Marble",
    description: "Luxurious Indian marble with fine veining and a polished finish — the premium choice for interiors, lobbies, and heritage restoration.",
    applications: ["Flooring", "Wall Cladding", "Lobbies", "Bathrooms", "Restoration"],
    filterGroups: ["Natural Stone", "Indoor", "Premium Collection"],
    image: jali,
    comparison: { durability: "Medium", waterAbsorption: "< 0.8%", finishes: "Polished, Honed, Leather", maintenance: "Moderate", weatherResistance: "Moderate", priceRange: "$$$", },
  },
  {
    name: "Limestone",
    description: "Neutral-toned limestone with a naturally soft texture — widely specified for contemporary facades, cladding, and landscape design.",
    applications: ["Cladding", "Facades", "Landscaping", "Pool Surrounds", "Interiors"],
    filterGroups: ["Natural Stone", "Architectural", "Landscape", "Export Collection"],
    image: texture,
    comparison: { durability: "Medium-High", waterAbsorption: "< 1.0%", finishes: "Honed, Brushed, Split, Tumbled", maintenance: "Moderate", weatherResistance: "Good", priceRange: "$$", },
  },
  {
    name: "Slate",
    description: "Fine-grained, fissile slate offering a distinctive layered aesthetic — perfect for roofing, flooring, and feature wall applications.",
    applications: ["Roofing", "Flooring", "Feature Walls", "Walkways", "Outdoor Paving"],
    filterGroups: ["Natural Stone", "Architectural", "Outdoor", "Export Collection"],
    image: texture,
    comparison: { durability: "High", waterAbsorption: "< 0.6%", finishes: "Natural Split, Honed, Brushed", maintenance: "Low", weatherResistance: "Excellent", priceRange: "$$", },
  },
  {
    name: "Quartzite",
    description: "Extremely hard, quartz-rich stone with stunning colour variation — specified for high-end residential and commercial projects.",
    applications: ["Countertops", "Flooring", "Wall Cladding", "Stairs", "Feature Walls"],
    filterGroups: ["Natural Stone", "Premium Collection", "Export Collection"],
    image: cobbles,
    comparison: { durability: "Very High", waterAbsorption: "< 0.3%", finishes: "Polished, Honed, Brushed, Leather", maintenance: "Very Low", weatherResistance: "Excellent", priceRange: "$$$", },
  },
  {
    name: "Wall Cladding",
    description: "Precision-calibrated sandstone cladding panels for luxury facades — engineered to international tolerances with consistent colour and texture.",
    applications: ["External Facades", "Interior Walls", "Feature Walls", "Column Covers", "Retaining Walls"],
    filterGroups: ["Architectural", "Outdoor", "Indoor", "Premium Collection"],
    image: texture,
    comparison: { durability: "High", waterAbsorption: "< 1.1%", finishes: "Natural, Honed, Brushed, Sandblasted", maintenance: "Low", weatherResistance: "Excellent", priceRange: "$$$", },
  },
  {
    name: "Flooring",
    description: "Calibrated sandstone and natural stone floor tiles for interior and exterior applications — offering warmth, durability, and timeless appeal.",
    applications: ["Indoor Floors", "Outdoor Terraces", "Pool Decks", "Lobbies", "Courtyards"],
    filterGroups: ["Architectural", "Indoor", "Outdoor", "Premium Collection"],
    image: cobbles,
    comparison: { durability: "High", waterAbsorption: "< 0.9%", finishes: "Honed, Polished, Leather, Flamed", maintenance: "Low", weatherResistance: "Good", priceRange: "$$", },
  },
  {
    name: "Paving",
    description: "Durable, slip-resistant sandstone paving for walkways, plazas, and driveways — available in calibrated formats for seamless installation.",
    applications: ["Walkways", "Driveways", "Plazas", "Courtyards", "Garden Paths"],
    filterGroups: ["Landscape", "Outdoor", "Export Collection"],
    image: cobbles,
    comparison: { durability: "High", waterAbsorption: "< 1.0%", finishes: "Natural Split, Sawn, Tumbled, Brushed", maintenance: "Low", weatherResistance: "Excellent", priceRange: "$$", },
  },
  {
    name: "Cobbles",
    description: "Tumbled sandstone cobbles for timeless landscaping — naturally aged edges and warm tones that create charming pathways and driveways.",
    applications: ["Driveways", "Walkways", "Courtyards", "Garden Borders", "Retaining Walls"],
    filterGroups: ["Landscape", "Outdoor", "Export Collection"],
    image: cobbles,
    comparison: { durability: "High", waterAbsorption: "< 1.2%", finishes: "Tumbled, Natural Split", maintenance: "Very Low", weatherResistance: "Excellent", priceRange: "$", },
  },
  {
    name: "Kerbstone",
    description: "Heavy-duty sandstone kerbstones for roads, borders, and landscape edging — precision-cut to specification for infrastructure projects.",
    applications: ["Road Edging", "Garden Borders", "Parking Areas", "Medians", "Infrastructure"],
    filterGroups: ["Landscape", "Outdoor", "Export Collection"],
    image: texture,
    comparison: { durability: "Very High", waterAbsorption: "< 1.0%", finishes: "Natural, Sawn, Split Face", maintenance: "Very Low", weatherResistance: "Excellent", priceRange: "$", },
  },
  {
    name: "Pool Coping",
    description: "Precision-cut sandstone coping stones for swimming pools — smooth, slip-resistant edges that frame your pool with natural elegance.",
    applications: ["Swimming Pools", "Water Features", "Resort Pools", "Spas"],
    filterGroups: ["Landscape", "Outdoor", "Premium Collection"],
    image: texture,
    comparison: { durability: "High", waterAbsorption: "< 0.8%", finishes: "Honed, Brushed, Textured", maintenance: "Low", weatherResistance: "Excellent", priceRange: "$$$", },
  },
  {
    name: "Steps",
    description: "Structural sandstone step blocks and treads — precision-cut for staircases, entryways, and landscape transitions.",
    applications: ["Entry Stairs", "Garden Steps", "Amphitheatres", "Landscape Transitions"],
    filterGroups: ["Architectural", "Landscape", "Outdoor", "Export Collection"],
    image: texture,
    comparison: { durability: "High", waterAbsorption: "< 1.0%", finishes: "Natural, Sawn, Honed, Tumbled", maintenance: "Low", weatherResistance: "Excellent", priceRange: "$$", },
  },
  {
    name: "Garden Stone",
    description: "Natural garden stones and decorative boulders for landscape architecture — adding organic texture and permanent structure to outdoor spaces.",
    applications: ["Garden Beds", "Rockeries", "Water Features", "Path Edging", "Decorative Focus"],
    filterGroups: ["Landscape", "Outdoor"],
    image: texture,
    comparison: { durability: "High", waterAbsorption: "< 1.5%", finishes: "Natural, Split, Tumbled", maintenance: "Very Low", weatherResistance: "Excellent", priceRange: "$", },
  },
  {
    name: "Landscape Stone",
    description: "Versatile landscape stones for large-scale projects — from civic plazas to private estates, combining function with natural beauty.",
    applications: ["Plazas", "Parks", "Civic Spaces", "Retaining Walls", "Terraces"],
    filterGroups: ["Landscape", "Outdoor", "Export Collection"],
    image: cobbles,
    comparison: { durability: "High", waterAbsorption: "< 1.2%", finishes: "Natural, Sawn, Tumbled, Brushed", maintenance: "Low", weatherResistance: "Excellent", priceRange: "$$", },
  },
  {
    name: "Columns",
    description: "Hand-carved and turned stone columns for grand entrances, verandas, and temple architecture — available in traditional and contemporary profiles.",
    applications: ["Entrance Porticos", "Verandas", "Temple Architecture", "Villa Entryways"],
    filterGroups: ["Architectural", "Premium Collection", "Export Collection"],
    image: column,
    comparison: { durability: "High", waterAbsorption: "< 1.0%", finishes: "Hand-Carved, Polished, Honed, Fluted", maintenance: "Low", weatherResistance: "Excellent", priceRange: "$$$", },
  },
  {
    name: "Balusters",
    description: "Elegant sandstone balusters for railings, parapets, and balconies — crafted to match any architectural style from classical to contemporary.",
    applications: ["Stair Railings", "Balcony Parapets", "Terrace Edges", "Verandas"],
    filterGroups: ["Architectural", "Premium Collection"],
    image: column,
    comparison: { durability: "High", waterAbsorption: "< 1.0%", finishes: "Hand-Carved, Turned, Fluted, Smooth", maintenance: "Low", weatherResistance: "Excellent", priceRange: "$$$", },
  },
  {
    name: "Jali",
    description: "Intricately carved sandstone lattice screens — a hallmark of Rajasthani craftsmanship, filtering light and air with timeless geometric and floral patterns.",
    applications: ["Facade Screens", "Window Grilles", "Room Dividers", "Temple Architecture", "Decorative Panels"],
    filterGroups: ["Architectural", "Indoor", "Premium Collection"],
    image: jali,
    comparison: { durability: "Medium-High", waterAbsorption: "< 1.0%", finishes: "Hand-Carved, Machine-Cut", maintenance: "Moderate", weatherResistance: "Good", priceRange: "$$$", },
  },
  {
    name: "Carvings",
    description: "Bespoke ornamental carvings — custom motifs, deities, flora, and geometric patterns hand-carved by master artisans for temples, palaces, and luxury residences.",
    applications: ["Temple Ornamentation", "Palace Restoration", "Luxury Residences", "Garden Sculptures"],
    filterGroups: ["Architectural", "Premium Collection"],
    image: jali,
    comparison: { durability: "Medium-High", waterAbsorption: "< 1.0%", finishes: "Hand-Carved, Antique", maintenance: "Moderate", weatherResistance: "Good", priceRange: "$$$$$", },
  },
  {
    name: "Temple Stone",
    description: "Specialist sandstone for temple construction and restoration — including carved pillars, ceiling panels, domes, and sculptural elements.",
    applications: ["Temple Construction", "Restoration", "Sculptural Elements", "Domes & Ceilings"],
    filterGroups: ["Architectural", "Premium Collection", "Export Collection"],
    image: jali,
    comparison: { durability: "High", waterAbsorption: "< 1.0%", finishes: "Hand-Carved, Polished, Natural", maintenance: "Low", weatherResistance: "Excellent", priceRange: "$$$$$", },
  },
  {
    name: "Custom Stone",
    description: "Bespoke stone products tailored to your specifications — custom dimensions, finishes, carvings, and profiles for unique architectural visions.",
    applications: ["Architectural Features", "Custom Profiles", "Specialist Finishes", "Bespoke Dimensions"],
    filterGroups: ["Architectural", "Premium Collection", "Export Collection"],
    image: factory,
    comparison: { durability: "Varies", waterAbsorption: "Per spec", finishes: "Any specified finish", maintenance: "Per material", weatherResistance: "Per spec", priceRange: "Varies", },
  },
];

export type Variant = {
  name: string;
  label: string;
  description: string;
  image: string;
};

export type ProductSize = {
  label: string;
  thickness: string[];
};

export type TechnicalSpec = {
  label: string;
  value: string;
  note?: string;
};

export type StoneFeature = {
  title: string;
  description: string;
  icon: string;
};

export type ComparisonRow = {
  property: string;
  values: Record<string, string>;
};

export type DownloadItem = {
  name: string;
  type: string;
  size: string;
  description: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  image: string;
  tagline: string;
  finishes: string[];
  dimensions: string;
  thickness: string;
  weight: string;
  applications: string[];
  specs: { label: string; value: string }[];
  // New expanded fields
  origin: string;
  color: string;
  availability: string;
  stockStatus: string;
  shortDescription: string;
  badges: string[];
  gallery: string[];
  variants: Variant[];
  sizes: ProductSize[];
  technicalSpecs: TechnicalSpec[];
  features: StoneFeature[];
  projectSlugs: string[];
  comparison: { stone: string; values: Record<string, string> }[];
  downloads: DownloadItem[];
};

export const VARIANTS_DATA: { name: string; label: string; description: string }[] = [
  { name: "Natural", label: "Natural", description: "Original quarry surface with natural texture and character." },
  { name: "Honed", label: "Honed", description: "Smooth matte finish with a soft, velvety texture." },
  { name: "Polished", label: "Polished", description: "High-gloss mirror finish for luxurious interiors." },
  { name: "Leather", label: "Leather", description: "Satin matte with subtle texture — warm to the touch." },
  { name: "Bush Hammered", label: "Bush Hammered", description: "Textured non-slip surface ideal for outdoor paving." },
  { name: "Sandblasted", label: "Sandblasted", description: "Uniform matte texture created by high-pressure sand." },
  { name: "Antique", label: "Antique", description: "Aged, weathered finish for heritage-inspired projects." },
  { name: "Tumbled", label: "Tumbled", description: "Rounded edges with a naturally aged, rustic appearance." },
];

export const AVAILABLE_SIZES: ProductSize[] = [
  { label: "300×300 mm", thickness: ["20 mm", "30 mm", "40 mm", "50 mm"] },
  { label: "600×300 mm", thickness: ["20 mm", "30 mm", "40 mm", "50 mm"] },
  { label: "600×600 mm", thickness: ["20 mm", "30 mm", "40 mm", "50 mm"] },
  { label: "Random Length", thickness: ["20 mm", "30 mm", "40 mm", "50 mm"] },
  { label: "Custom Size", thickness: ["Per specification"] },
];

export const APPLICATION_ICONS: Record<string, string> = {
  "Exterior Walls": "Building",
  "Interior Walls": "Layout",
  "Flooring": "Grid3x3",
  "Paving": "Waypoints",
  "Landscape": "Mountain",
  "Garden": "Sprout",
  "Facade": "Layers",
  "Facades": "Layers",
  "Building Facades": "Layers",
  "Feature Walls": "Layout",
  "Pool Area": "Waves",
  "Temple": "Church",
  "Temple Architecture": "Church",
  "Commercial Buildings": "Building2",
  "Luxury Villas": "Home",
};

export const COMPARISON_STONES = ["Granite", "Marble", "Limestone", "Slate", "Quartzite"];

export const COMPARISON_PROPERTIES = ["Durability", "Maintenance", "Cost", "Finish", "Weather Resistance", "Applications"];

export const FEATURE_DATA: StoneFeature[] = [
  { title: "Natural Stone", description: "100% natural, quarried from heritage Rajasthan deposits.", icon: "Gem" },
  { title: "Export Quality", description: "ISO & CE certified — meets global architectural standards.", icon: "Award" },
  { title: "Weather Resistant", description: "Engineered to withstand extreme climates and temperature ranges.", icon: "Sun" },
  { title: "Low Maintenance", description: "Minimal upkeep required — retains beauty for decades.", icon: "Shield" },
  { title: "Eco Friendly", description: "Sustainable quarrying with water recycling and waste reduction.", icon: "Leaf" },
  { title: "High Durability", description: "Exceptional compressive and flexural strength for structural use.", icon: "Hammer" },
  { title: "Precision Finish", description: "CNC-calibrated to international tolerances with consistent quality.", icon: "Ruler" },
  { title: "Long Lifespan", description: "Architectural stone that performs beautifully for centuries.", icon: "Clock" },
];

export const DOWNLOADS_COMMON: DownloadItem[] = [
  { name: "Technical Datasheet", type: "PDF", size: "2.4 MB", description: "Complete technical specifications and performance data." },
  { name: "Installation Guide", type: "PDF", size: "4.1 MB", description: "Step-by-step installation instructions and best practices." },
  { name: "Maintenance Guide", type: "PDF", size: "1.8 MB", description: "Care, cleaning and long-term maintenance recommendations." },
  { name: "Export Packaging", type: "PDF", size: "3.2 MB", description: "Packaging standards, container loading and shipping guidelines." },
  { name: "Catalogue", type: "PDF", size: "18.6 MB", description: "Full product catalog with specifications and project references." },
];

export const COMPARISON_DATA: ComparisonRow[] = [
  { property: "Durability", values: { Sandstone: "High", Granite: "Very High", Marble: "Medium", Limestone: "Medium-High", Slate: "High", Quartzite: "Very High" } },
  { property: "Maintenance", values: { Sandstone: "Low", Granite: "Very Low", Marble: "Moderate", Limestone: "Moderate", Slate: "Low", Quartzite: "Very Low" } },
  { property: "Cost", values: { Sandstone: "$", Granite: "$$$", Marble: "$$$", Limestone: "$$", Slate: "$$", Quartzite: "$$$" } },
  { property: "Finish", values: { Sandstone: "Natural, Honed, Brushed", Granite: "Polished, Honed, Flamed", Marble: "Polished, Honed, Leather", Limestone: "Honed, Brushed, Split", Slate: "Natural Split, Honed", Quartzite: "Polished, Honed, Brushed" } },
  { property: "Weather Resistance", values: { Sandstone: "Excellent", Granite: "Excellent", Marble: "Moderate", Limestone: "Good", Slate: "Excellent", Quartzite: "Excellent" } },
  { property: "Applications", values: { Sandstone: "Facades, Paving, Cladding", Granite: "Countertops, Flooring, Structural", Marble: "Interiors, Lobbies, Bathrooms", Limestone: "Cladding, Facades, Landscaping", Slate: "Roofing, Flooring, Feature Walls", Quartzite: "Countertops, Flooring, Cladding" } },
];

export const PRODUCTS: Product[] = [
  {
    slug: "heritage-jali-panel",
    name: "Heritage Jali Panel",
    category: "Jali",
    image: jali,
    tagline: "Hand-carved lattice screens rooted in Rajasthani tradition.",
    finishes: ["Natural", "Hand-Carved", "Machine-Cut", "Honed"],
    dimensions: "600 × 900 mm (custom available)",
    thickness: "25 – 50 mm",
    weight: "42 kg / panel",
    applications: ["Facade", "Interior Walls", "Temple", "Luxury Villas"],
    specs: [
      { label: "Water Absorption", value: "< 1.0%" },
      { label: "Compressive Strength", value: "95 MPa" },
      { label: "Density", value: "2.4 g/cm³" },
      { label: "Frost Resistance", value: "Excellent" },
    ],
    origin: "Jodhpur, Rajasthan, India",
    color: "Desert Gold / Warm Beige",
    availability: "Made to Order",
    stockStatus: "Available",
    shortDescription: "Each Heritage Jali Panel is hand-carved by master artisans in Jodhpur, continuing a tradition refined over generations. These lattice screens filter light and air with timeless geometric and floral patterns — specified for luxury residences, hotels, and temple architecture worldwide.",
    badges: ["Export Ready", "Best Seller", "Sustainability"],
    gallery: [jali, texture, column, cobbles, villa, column, texture, cobbles],
    variants: [
      { name: "Natural", label: "Natural", description: "Original quarry surface with natural texture and character.", image: jali },
      { name: "Honed", label: "Honed", description: "Smooth matte finish with a soft, velvety texture.", image: texture },
      { name: "Hand-Carved", label: "Hand-Carved", description: "Traditionally carved by master artisans.", image: column },
      { name: "Machine-Cut", label: "Machine-Cut", description: "CNC-precision cut for consistent patterns.", image: cobbles },
    ],
    sizes: [
      { label: "300×300 mm", thickness: ["25 mm", "30 mm", "40 mm", "50 mm"] },
      { label: "600×300 mm", thickness: ["25 mm", "30 mm", "40 mm", "50 mm"] },
      { label: "600×600 mm", thickness: ["25 mm", "30 mm", "40 mm", "50 mm"] },
      { label: "Random Length", thickness: ["25 mm", "30 mm", "40 mm", "50 mm"] },
      { label: "Custom Size", thickness: ["Per specification"] },
    ],
    technicalSpecs: [
      { label: "Density", value: "2.40 g/cm³", note: "ASTM C97" },
      { label: "Water Absorption", value: "< 1.0%", note: "ASTM C97" },
      { label: "Compressive Strength", value: "95 MPa", note: "ASTM C170" },
      { label: "Flexural Strength", value: "14 MPa", note: "ASTM C880" },
      { label: "Weather Resistance", value: "Excellent", note: "UV stable" },
      { label: "Slip Resistance", value: "R10", note: "DIN 51130" },
      { label: "Frost Resistance", value: "Excellent", note: "EN 12371" },
      { label: "Fire Resistance", value: "Class A1", note: "Non-combustible" },
      { label: "Maintenance", value: "Low", note: "Annual sealing recommended" },
      { label: "Container Capacity", value: "~240 ft² / 20ft container", note: "Depending on thickness" },
      { label: "Packaging", value: "Seaworthy wooden crates", note: "Export standard" },
      { label: "Country of Origin", value: "India", note: "Rajasthan" },
    ],
    features: FEATURE_DATA,
    projectSlugs: ["desert-luxury-villa", "heritage-temple-restoration"],
    comparison: [
      { stone: "Granite", values: { durability: "4/5", maintenance: "5/5", cost: "3/5", finish: "4/5", weatherResistance: "5/5", applications: "3/5" } },
      { stone: "Marble", values: { durability: "3/5", maintenance: "3/5", cost: "3/5", finish: "5/5", weatherResistance: "3/5", applications: "3/5" } },
      { stone: "Limestone", values: { durability: "4/5", maintenance: "3/5", cost: "4/5", finish: "3/5", weatherResistance: "4/5", applications: "4/5" } },
      { stone: "Slate", values: { durability: "4/5", maintenance: "4/5", cost: "4/5", finish: "3/5", weatherResistance: "5/5", applications: "4/5" } },
      { stone: "Quartzite", values: { durability: "5/5", maintenance: "5/5", cost: "2/5", finish: "4/5", weatherResistance: "5/5", applications: "4/5" } },
    ],
    downloads: DOWNLOADS_COMMON,
  },
  {
    slug: "sandstone-cobbles",
    name: "Sandstone Cobbles",
    category: "Cobbles",
    image: cobbles,
    tagline: "Tumbled cobbles for timeless landscape paving.",
    finishes: ["Natural Split", "Tumbled", "Sawn", "Sandblasted"],
    dimensions: "100 × 100 mm, 100 × 200 mm",
    thickness: "40 – 60 mm",
    weight: "2.1 kg / piece",
    applications: ["Paving", "Landscape", "Garden", "Pool Area", "Commercial Buildings"],
    specs: [
      { label: "Water Absorption", value: "< 1.2%" },
      { label: "Slip Resistance", value: "R11" },
      { label: "Density", value: "2.35 g/cm³" },
      { label: "Frost Resistance", value: "Excellent" },
    ],
    origin: "Jodhpur, Rajasthan, India",
    color: "Desert Gold / Autumn Blend",
    availability: "In Stock",
    stockStatus: "Ready to Ship",
    shortDescription: "Our Sandstone Cobbles are precision-tumbled for naturally aged edges and warm, earthy tones. Perfect for driveways, walkways, and courtyards, each piece delivers the timeless character of authentic Rajasthan stone with the dimensional consistency required for modern landscape projects.",
    badges: ["Export Ready", "Best Seller"],
    gallery: [cobbles, texture, jali, column, villa, column, texture, jali],
    variants: [
      { name: "Natural Split", label: "Natural Split", description: "Rough quarry surface with natural riven texture.", image: cobbles },
      { name: "Tumbled", label: "Tumbled", description: "Aged, rounded edges with a rustic appearance.", image: texture },
      { name: "Sawn", label: "Sawn", description: "Clean machine-cut edges for precise laying.", image: column },
      { name: "Sandblasted", label: "Sandblasted", description: "Uniform matte texture with slip resistance.", image: jali },
    ],
    sizes: [
      { label: "100×100 mm", thickness: ["40 mm", "50 mm", "60 mm"] },
      { label: "100×200 mm", thickness: ["40 mm", "50 mm", "60 mm"] },
      { label: "200×200 mm", thickness: ["40 mm", "50 mm", "60 mm"] },
      { label: "Random Mix", thickness: ["40 mm", "50 mm", "60 mm"] },
      { label: "Custom Size", thickness: ["Per specification"] },
    ],
    technicalSpecs: [
      { label: "Density", value: "2.35 g/cm³", note: "ASTM C97" },
      { label: "Water Absorption", value: "< 1.2%", note: "ASTM C97" },
      { label: "Compressive Strength", value: "88 MPa", note: "ASTM C170" },
      { label: "Flexural Strength", value: "12 MPa", note: "ASTM C880" },
      { label: "Weather Resistance", value: "Excellent", note: "UV stable" },
      { label: "Slip Resistance", value: "R11", note: "DIN 51130" },
      { label: "Frost Resistance", value: "Excellent", note: "EN 12371" },
      { label: "Fire Resistance", value: "Class A1", note: "Non-combustible" },
      { label: "Maintenance", value: "Very Low", note: "No sealing required" },
      { label: "Container Capacity", value: "~320 m² / 20ft container", note: "Depending on size" },
      { label: "Packaging", value: "Seaworthy wooden crates", note: "Export standard" },
      { label: "Country of Origin", value: "India", note: "Rajasthan" },
    ],
    features: FEATURE_DATA,
    projectSlugs: ["civic-plaza-paving", "coastal-resort-facade"],
    comparison: [
      { stone: "Granite", values: { durability: "4/5", maintenance: "5/5", cost: "3/5", finish: "4/5", weatherResistance: "5/5", applications: "2/5" } },
      { stone: "Marble", values: { durability: "3/5", maintenance: "3/5", cost: "3/5", finish: "5/5", weatherResistance: "3/5", applications: "2/5" } },
      { stone: "Limestone", values: { durability: "4/5", maintenance: "3/5", cost: "4/5", finish: "3/5", weatherResistance: "4/5", applications: "3/5" } },
      { stone: "Slate", values: { durability: "4/5", maintenance: "4/5", cost: "4/5", finish: "3/5", weatherResistance: "5/5", applications: "3/5" } },
      { stone: "Quartzite", values: { durability: "5/5", maintenance: "5/5", cost: "2/5", finish: "4/5", weatherResistance: "5/5", applications: "3/5" } },
    ],
    downloads: DOWNLOADS_COMMON,
  },
  {
    slug: "carved-stone-column",
    name: "Carved Stone Column",
    category: "Columns",
    image: column,
    tagline: "Sculpted columns and balusters for grand architecture.",
    finishes: ["Hand-Carved", "Polished", "Honed"],
    dimensions: "H 2400 mm, Ø 300 mm (custom)",
    thickness: "Solid",
    weight: "180 kg / column",
    applications: ["Facade", "Interior Walls", "Luxury Villas", "Commercial Buildings", "Temple"],
    specs: [
      { label: "Water Absorption", value: "< 1.0%" },
      { label: "Compressive Strength", value: "98 MPa" },
      { label: "Density", value: "2.42 g/cm³" },
      { label: "Load Rating", value: "Structural" },
    ],
    origin: "Jodhpur, Rajasthan, India",
    color: "Warm Ivory / Desert Gold",
    availability: "Made to Order",
    stockStatus: "Available",
    shortDescription: "Each Carved Stone Column is hand-sculpted by master artisans in Jodhpur, using techniques refined over centuries. Available in traditional and contemporary profiles, these columns provide structural grandeur for luxury villas, hotels, and temple architecture.",
    badges: ["Export Ready", "Sustainability"],
    gallery: [column, jali, texture, cobbles, villa, texture, column, jali],
    variants: [
      { name: "Hand-Carved", label: "Hand-Carved", description: "Traditionally sculpted by master artisans.", image: column },
      { name: "Polished", label: "Polished", description: "High-gloss finish revealing natural grain.", image: jali },
      { name: "Honed", label: "Honed", description: "Smooth matte finish with a soft appearance.", image: texture },
    ],
    sizes: [
      { label: "Ø 200 mm", thickness: ["Solid"] },
      { label: "Ø 300 mm", thickness: ["Solid"] },
      { label: "Ø 400 mm", thickness: ["Solid"] },
      { label: "Custom Size", thickness: ["Per specification"] },
    ],
    technicalSpecs: [
      { label: "Density", value: "2.42 g/cm³", note: "ASTM C97" },
      { label: "Water Absorption", value: "< 1.0%", note: "ASTM C97" },
      { label: "Compressive Strength", value: "98 MPa", note: "ASTM C170" },
      { label: "Flexural Strength", value: "15 MPa", note: "ASTM C880" },
      { label: "Weather Resistance", value: "Excellent", note: "UV stable" },
      { label: "Slip Resistance", value: "N/A", note: "Vertical application" },
      { label: "Frost Resistance", value: "Excellent", note: "EN 12371" },
      { label: "Fire Resistance", value: "Class A1", note: "Non-combustible" },
      { label: "Maintenance", value: "Low", note: "Periodic inspection" },
      { label: "Container Capacity", value: "~12 columns / 20ft container", note: "For Ø 300 mm" },
      { label: "Packaging", value: "Custom crating with padding", note: "Fragile" },
      { label: "Country of Origin", value: "India", note: "Rajasthan" },
    ],
    features: FEATURE_DATA,
    projectSlugs: ["heritage-temple-restoration", "desert-luxury-villa"],
    comparison: [
      { stone: "Granite", values: { durability: "4/5", maintenance: "5/5", cost: "3/5", finish: "4/5", weatherResistance: "5/5", applications: "3/5" } },
      { stone: "Marble", values: { durability: "3/5", maintenance: "3/5", cost: "3/5", finish: "5/5", weatherResistance: "3/5", applications: "3/5" } },
      { stone: "Limestone", values: { durability: "4/5", maintenance: "3/5", cost: "4/5", finish: "3/5", weatherResistance: "4/5", applications: "3/5" } },
      { stone: "Slate", values: { durability: "4/5", maintenance: "4/5", cost: "4/5", finish: "3/5", weatherResistance: "5/5", applications: "3/5" } },
      { stone: "Quartzite", values: { durability: "5/5", maintenance: "5/5", cost: "2/5", finish: "4/5", weatherResistance: "5/5", applications: "3/5" } },
    ],
    downloads: DOWNLOADS_COMMON,
  },
  {
    slug: "sandstone-wall-cladding",
    name: "Sandstone Wall Cladding",
    category: "Wall Cladding",
    image: texture,
    tagline: "Precision-calibrated cladding for luxury facades.",
    finishes: ["Natural", "Honed", "Brushed", "Sandblasted"],
    dimensions: "300 × 600 mm, 600 × 600 mm",
    thickness: "18 – 30 mm",
    weight: "48 kg / m²",
    applications: ["Exterior Walls", "Interior Walls", "Facade", "Commercial Buildings", "Luxury Villas"],
    specs: [
      { label: "Water Absorption", value: "< 1.1%" },
      { label: "Flexural Strength", value: "18 MPa" },
      { label: "Density", value: "2.38 g/cm³" },
      { label: "UV Stability", value: "Excellent" },
    ],
    origin: "Jodhpur, Rajasthan, India",
    color: "Desert Gold / Autumn Blend / Silver Grey",
    availability: "In Stock",
    stockStatus: "Ready to Ship",
    shortDescription: "Precision-calibrated sandstone cladding panels engineered for luxury facades worldwide. Each panel is cut to exact export tolerances with consistent colour and texture — specified by leading architects for premium residential and commercial projects across 35+ countries.",
    badges: ["Export Ready", "Best Seller", "Sustainability"],
    gallery: [texture, cobbles, jali, column, villa, texture, cobbles, jali],
    variants: [
      { name: "Natural", label: "Natural", description: "Original quarry surface with natural character.", image: texture },
      { name: "Honed", label: "Honed", description: "Smooth matte finish with a soft touch.", image: cobbles },
      { name: "Brushed", label: "Brushed", description: "Subtle textured finish for exterior use.", image: jali },
      { name: "Sandblasted", label: "Sandblasted", description: "Uniform matte with enhanced slip resistance.", image: column },
    ],
    sizes: [
      { label: "300×600 mm", thickness: ["18 mm", "20 mm", "25 mm", "30 mm"] },
      { label: "600×600 mm", thickness: ["18 mm", "20 mm", "25 mm", "30 mm"] },
      { label: "600×900 mm", thickness: ["18 mm", "20 mm", "25 mm", "30 mm"] },
      { label: "Random Length", thickness: ["18 mm", "20 mm", "25 mm", "30 mm"] },
      { label: "Custom Size", thickness: ["Per specification"] },
    ],
    technicalSpecs: [
      { label: "Density", value: "2.38 g/cm³", note: "ASTM C97" },
      { label: "Water Absorption", value: "< 1.1%", note: "ASTM C97" },
      { label: "Compressive Strength", value: "92 MPa", note: "ASTM C170" },
      { label: "Flexural Strength", value: "18 MPa", note: "ASTM C880" },
      { label: "Weather Resistance", value: "Excellent", note: "UV stable" },
      { label: "Slip Resistance", value: "R10", note: "DIN 51130" },
      { label: "Frost Resistance", value: "Excellent", note: "EN 12371" },
      { label: "Fire Resistance", value: "Class A1", note: "Non-combustible" },
      { label: "Maintenance", value: "Low", note: "Annual sealing recommended" },
      { label: "Container Capacity", value: "~280 m² / 20ft container", note: "Depending on thickness" },
      { label: "Packaging", value: "Seaworthy wooden crates", note: "Export standard" },
      { label: "Country of Origin", value: "India", note: "Rajasthan" },
    ],
    features: FEATURE_DATA,
    projectSlugs: ["coastal-resort-facade", "desert-luxury-villa"],
    comparison: [
      { stone: "Granite", values: { durability: "4/5", maintenance: "5/5", cost: "3/5", finish: "4/5", weatherResistance: "5/5", applications: "3/5" } },
      { stone: "Marble", values: { durability: "3/5", maintenance: "3/5", cost: "3/5", finish: "5/5", weatherResistance: "3/5", applications: "3/5" } },
      { stone: "Limestone", values: { durability: "4/5", maintenance: "3/5", cost: "4/5", finish: "3/5", weatherResistance: "4/5", applications: "4/5" } },
      { stone: "Slate", values: { durability: "4/5", maintenance: "4/5", cost: "4/5", finish: "3/5", weatherResistance: "5/5", applications: "3/5" } },
      { stone: "Quartzite", values: { durability: "5/5", maintenance: "5/5", cost: "2/5", finish: "4/5", weatherResistance: "5/5", applications: "4/5" } },
    ],
    downloads: DOWNLOADS_COMMON,
  },
  {
    slug: "desert-gold-flooring",
    name: "Desert Gold Flooring",
    category: "Flooring",
    image: cobbles,
    tagline: "Warm calibrated tiles for interior and exterior floors.",
    finishes: ["Honed", "Polished", "Leather", "Flamed"],
    dimensions: "600 × 600 mm, 800 × 800 mm",
    thickness: "16 – 20 mm",
    weight: "44 kg / m²",
    applications: ["Flooring", "Interior Walls", "Landscape", "Commercial Buildings", "Luxury Villas", "Pool Area"],
    specs: [
      { label: "Water Absorption", value: "< 0.9%" },
      { label: "Slip Resistance", value: "R10" },
      { label: "Density", value: "2.4 g/cm³" },
      { label: "Abrasion", value: "Class 4" },
    ],
    origin: "Jodhpur, Rajasthan, India",
    color: "Desert Gold / Warm Honey",
    availability: "In Stock",
    stockStatus: "Ready to Ship",
    shortDescription: "Desert Gold Flooring combines the warm, honeyed tones of Rajasthan sandstone with precision calibration for flawless interior and exterior installations. These tiles bring natural elegance to lobbies, terraces, pool surrounds, and luxury residences.",
    badges: ["Export Ready", "Best Seller", "Sustainability"],
    gallery: [cobbles, texture, jali, column, villa, cobbles, texture, jali],
    variants: [
      { name: "Honed", label: "Honed", description: "Smooth matte finish with velvety texture.", image: cobbles },
      { name: "Polished", label: "Polished", description: "High-gloss mirror finish for interiors.", image: texture },
      { name: "Leather", label: "Leather", description: "Satin matte with subtle surface texture.", image: jali },
      { name: "Flamed", label: "Flamed", description: "Thermally treated for slip-resistant exterior use.", image: column },
    ],
    sizes: [
      { label: "600×600 mm", thickness: ["16 mm", "18 mm", "20 mm"] },
      { label: "800×800 mm", thickness: ["16 mm", "18 mm", "20 mm"] },
      { label: "600×900 mm", thickness: ["16 mm", "18 mm", "20 mm"] },
      { label: "Random Slabs", thickness: ["16 mm", "18 mm", "20 mm"] },
      { label: "Custom Size", thickness: ["Per specification"] },
    ],
    technicalSpecs: [
      { label: "Density", value: "2.40 g/cm³", note: "ASTM C97" },
      { label: "Water Absorption", value: "< 0.9%", note: "ASTM C97" },
      { label: "Compressive Strength", value: "95 MPa", note: "ASTM C170" },
      { label: "Flexural Strength", value: "16 MPa", note: "ASTM C880" },
      { label: "Weather Resistance", value: "Good", note: "Sealed for exterior use" },
      { label: "Slip Resistance", value: "R10", note: "DIN 51130" },
      { label: "Frost Resistance", value: "Good", note: "EN 12371" },
      { label: "Fire Resistance", value: "Class A1", note: "Non-combustible" },
      { label: "Maintenance", value: "Low", note: "Annual sealing recommended" },
      { label: "Container Capacity", value: "~320 m² / 20ft container", note: "For 20 mm" },
      { label: "Packaging", value: "Seaworthy wooden crates", note: "Export standard" },
      { label: "Country of Origin", value: "India", note: "Rajasthan" },
    ],
    features: FEATURE_DATA,
    projectSlugs: ["desert-luxury-villa", "civic-plaza-paving", "coastal-resort-facade"],
    comparison: [
      { stone: "Granite", values: { durability: "4/5", maintenance: "5/5", cost: "3/5", finish: "4/5", weatherResistance: "5/5", applications: "3/5" } },
      { stone: "Marble", values: { durability: "3/5", maintenance: "3/5", cost: "3/5", finish: "5/5", weatherResistance: "3/5", applications: "3/5" } },
      { stone: "Limestone", values: { durability: "4/5", maintenance: "3/5", cost: "4/5", finish: "3/5", weatherResistance: "4/5", applications: "3/5" } },
      { stone: "Slate", values: { durability: "4/5", maintenance: "4/5", cost: "4/5", finish: "3/5", weatherResistance: "5/5", applications: "3/5" } },
      { stone: "Quartzite", values: { durability: "5/5", maintenance: "5/5", cost: "2/5", finish: "4/5", weatherResistance: "5/5", applications: "3/5" } },
    ],
    downloads: DOWNLOADS_COMMON,
  },
  {
    slug: "heritage-carving",
    name: "Heritage Carving",
    category: "Carvings",
    image: jali,
    tagline: "Bespoke ornamental carvings for restoration & temples.",
    finishes: ["Hand-Carved", "Antique"],
    dimensions: "Custom to specification",
    thickness: "Custom",
    weight: "Varies",
    applications: ["Temple", "Interior Walls", "Luxury Villas", "Garden", "Commercial Buildings"],
    specs: [
      { label: "Water Absorption", value: "< 1.0%" },
      { label: "Compressive Strength", value: "96 MPa" },
      { label: "Density", value: "2.41 g/cm³" },
      { label: "Detailing", value: "Museum Grade" },
    ],
    origin: "Jodhpur, Rajasthan, India",
    color: "Desert Gold / Warm Beige / Silver",
    availability: "Made to Order",
    stockStatus: "Custom Order",
    shortDescription: "Our Heritage Carvings are bespoke ornamental masterpieces hand-carved by master artisans for temple construction, palace restoration, and luxury residences. Each piece is a unique work of art — from intricate deities to geometric patterns and floral motifs.",
    badges: ["Export Ready"],
    gallery: [jali, column, texture, cobbles, villa, jali, column, texture],
    variants: [
      { name: "Hand-Carved", label: "Hand-Carved", description: "Traditionally carved by master artisans.", image: jali },
      { name: "Antique", label: "Antique", description: "Aged, weathered finish for heritage projects.", image: column },
    ],
    sizes: [
      { label: "Custom Size", thickness: ["Per specification"] },
    ],
    technicalSpecs: [
      { label: "Density", value: "2.41 g/cm³", note: "ASTM C97" },
      { label: "Water Absorption", value: "< 1.0%", note: "ASTM C97" },
      { label: "Compressive Strength", value: "96 MPa", note: "ASTM C170" },
      { label: "Flexural Strength", value: "14 MPa", note: "ASTM C880" },
      { label: "Weather Resistance", value: "Good", note: "Sealed for exterior" },
      { label: "Slip Resistance", value: "N/A", note: "Decorative application" },
      { label: "Frost Resistance", value: "Good", note: "EN 12371" },
      { label: "Fire Resistance", value: "Class A1", note: "Non-combustible" },
      { label: "Maintenance", value: "Moderate", note: "Gentle cleaning required" },
      { label: "Container Capacity", value: "Varies by design", note: "Custom crating" },
      { label: "Packaging", value: "Custom crating with foam padding", note: "Museum-grade" },
      { label: "Country of Origin", value: "India", note: "Rajasthan" },
    ],
    features: FEATURE_DATA,
    projectSlugs: ["heritage-temple-restoration", "desert-luxury-villa"],
    comparison: [
      { stone: "Granite", values: { durability: "4/5", maintenance: "5/5", cost: "3/5", finish: "4/5", weatherResistance: "5/5", applications: "3/5" } },
      { stone: "Marble", values: { durability: "3/5", maintenance: "3/5", cost: "3/5", finish: "5/5", weatherResistance: "3/5", applications: "3/5" } },
      { stone: "Limestone", values: { durability: "4/5", maintenance: "3/5", cost: "4/5", finish: "3/5", weatherResistance: "4/5", applications: "3/5" } },
      { stone: "Slate", values: { durability: "4/5", maintenance: "4/5", cost: "4/5", finish: "3/5", weatherResistance: "5/5", applications: "3/5" } },
      { stone: "Quartzite", values: { durability: "5/5", maintenance: "5/5", cost: "2/5", finish: "4/5", weatherResistance: "5/5", applications: "3/5" } },
    ],
    downloads: DOWNLOADS_COMMON,
  },
];

export type Project = {
  slug: string;
  name: string;
  location: string;
  category: string;
  image: string;
  year: string;
  summary: string;
  scope: string[];
  architect?: string;
  stoneUsed?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "desert-luxury-villa",
    name: "Desert Luxury Villa",
    location: "Dubai, UAE",
    category: "Luxury Villas",
    image: villa,
    year: "2024",
    summary:
      "A 1,200 m² sandstone facade and landscape package for a private desert estate, combining honed cladding with hand-carved detailing.",
    architect: "Foster + Partners",
    stoneUsed: "Sandstone Wall Cladding, Heritage Carving",
    scope: ["Building Facades", "Wall Cladding", "Landscaping Stone", "Custom Carvings"],
  },
  {
    slug: "heritage-temple-restoration",
    name: "Heritage Temple Restoration",
    location: "Jaipur, India",
    category: "Restoration Projects",
    image: jali,
    year: "2023",
    summary:
      "Museum-grade restoration of carved sandstone jali, columns and ornamentation for a 200-year-old temple complex.",
    architect: "Heritage Trust of India",
    stoneUsed: "Heritage Jali Panel, Carved Stone Column",
    scope: ["Temple Stone", "Carvings", "Jali", "Columns"],
  },
  {
    slug: "coastal-resort-facade",
    name: "Coastal Resort & Spa",
    location: "Bali, Indonesia",
    category: "Hotels & Resorts",
    image: villa,
    year: "2024",
    summary:
      "Weather-resistant sandstone cladding and paving across a 5-star beachfront resort spanning multiple villas and public spaces.",
    architect: "WOHA Architects",
    stoneUsed: "Sandstone Wall Cladding, Desert Gold Flooring",
    scope: ["Wall Cladding", "Paving", "Steps", "Garden Elements"],
  },
  {
    slug: "civic-plaza-paving",
    name: "Civic Plaza Paving",
    location: "Melbourne, Australia",
    category: "Government Projects",
    image: cobbles,
    year: "2022",
    summary:
      "8,500 m² of durable sandstone cobbles and paving for a public plaza engineered for heavy footfall and climate resilience.",
    architect: "Hassell Studio",
    stoneUsed: "Sandstone Cobbles, Desert Gold Flooring",
    scope: ["Cobbles", "Paving", "Landscape Stones"],
  },
];

export const COUNTRIES = [
  "United States", "United Kingdom", "United Arab Emirates", "Australia",
  "Germany", "France", "Canada", "Singapore", "Japan", "Italy",
  "Netherlands", "Indonesia",
];

export const STATS = [
  { value: 35, suffix: "+", label: "Countries Served" },
  { value: 40, suffix: "yrs", label: "Of Heritage" },
  { value: 1200, suffix: "+", label: "Projects Delivered" },
  { value: 15, suffix: "M ft²", label: "Stone Exported" },
];

export const TESTIMONIALS = [
  {
    quote:
      "The consistency of finish and precision of the calibrated cladding was flawless across every shipment. A true export-grade partner.",
    name: "Sarah Whitmore",
    role: "Principal Architect, Whitmore Studio",
  },
  {
    quote:
      "Their hand-carved jali brought our restoration to life. Craftsmanship you simply cannot find elsewhere at this scale.",
    name: "Rajeev Menon",
    role: "Conservation Director, Heritage Trust",
  },
  {
    quote:
      "From technical sheets to international packaging, everything was seamless. Stone India is our default sandstone supplier.",
    name: "Lucas Meyer",
    role: "Procurement Lead, Meyer Developments",
  },
];

export const POSTS = [
  {
    slug: "choosing-sandstone-facades",
    title: "How to Choose Sandstone for Building Facades",
    excerpt: "A practical guide to finishes, thickness and calibration for architectural facades.",
    date: "June 12, 2026",
    category: "Architecture",
    image: villa,
  },
  {
    slug: "sustainable-quarrying-practices",
    title: "Inside Our Sustainable Quarrying Practices",
    excerpt: "How responsible extraction and water recycling shape every slab we produce.",
    date: "May 28, 2026",
    category: "Sustainability",
    image: texture,
  },
  {
    slug: "heritage-jali-craft",
    title: "The Living Craft of Rajasthani Jali",
    excerpt: "Meet the artisans keeping centuries-old lattice carving alive.",
    date: "May 04, 2026",
    category: "Heritage",
    image: jali,
  },
];

export const PROCESS_STEPS = [
  { n: "01", title: "Responsible Quarrying", desc: "Blocks are selectively extracted from heritage quarries with minimal environmental impact." },
  { n: "02", title: "Block Selection & Grading", desc: "Each block is inspected, graded and matched for colour, grain and integrity." },
  { n: "03", title: "Precision Sawing", desc: "Multi-wire and gang saws cut slabs to exact export tolerances." },
  { n: "04", title: "Finishing", desc: "Honing, polishing, brushing, sandblasting and flaming to specification." },
  { n: "05", title: "Hand Carving", desc: "Master artisans carve jali, columns and ornamentation by hand." },
  { n: "06", title: "Quality Assurance", desc: "Dimensional, strength and finish checks against export standards." },
  { n: "07", title: "Packaging & Export", desc: "International seaworthy crating and global logistics to your site." },
];

export const SUSTAINABILITY_POINTS = [
  "Responsible quarrying", "Water recycling systems", "Waste reduction",
  "Eco-friendly manufacturing", "Sustainable sourcing", "Long product lifespan",
  "Natural and recyclable material", "Low maintenance",
  "Durable architectural solutions", "Reduced environmental impact",
];

export const CERTIFICATIONS = [
  { name: "ISO 9001:2015", desc: "Quality Management System" },
  { name: "ISO 14001", desc: "Environmental Management" },
  { name: "CE Marking", desc: "European Conformity" },
  { name: "SGS Verified", desc: "Independent Inspection" },
  { name: "Export House", desc: "Government Recognised" },
  { name: "SA8000", desc: "Ethical Labour Standards" },
];

export const DOWNLOADS = [
  { name: "Master Product Catalog 2026", type: "PDF", size: "18.2 MB" },
  { name: "Sandstone Technical Specifications", type: "PDF", size: "4.6 MB" },
  { name: "Finish & Colour Guide", type: "PDF", size: "6.1 MB" },
  { name: "Packaging & Shipping Guide", type: "PDF", size: "2.3 MB" },
  { name: "Sustainability Report", type: "PDF", size: "3.8 MB" },
  { name: "Certifications Bundle", type: "ZIP", size: "9.4 MB" },
];

export const FAQS = [
  { q: "What is the minimum order quantity?", a: "MOQ varies by product; most calibrated products start at one 20ft container. Contact us for project-specific quantities." },
  { q: "Do you ship internationally?", a: "Yes. We export to 35+ countries with international seaworthy packaging and full logistics support." },
  { q: "Can you produce custom sizes and carvings?", a: "Absolutely. Custom dimensions, finishes and hand-carved designs are our specialty. Share your drawings for a quote." },
  { q: "What is the typical lead time?", a: "Standard products ship in 3–5 weeks; custom carvings and large projects vary by scope." },
  { q: "Do you provide technical specification sheets?", a: "Yes, every product includes downloadable technical data covering strength, absorption and dimensions." },
  { q: "How do I request a sample?", a: "Use the Request Quote page and note that you'd like samples — we ship representative pieces worldwide." },
];

export const ADMIN_NAV = [
  "Dashboard", "Products", "Categories", "Digital Catalog", "Projects",
  "Gallery", "Certificates", "Downloads", "Blogs", "Customers",
  "RFQs", "Orders", "Users", "Roles", "Analytics", "Settings", "Media Library",
];

export { villa, factory, texture, cobbles, jali, column };

export type MegaMenuItem = {
  label: string;
  to: string;
  groups?: { title: string; links: { label: string; to: string }[] }[];
  featured?: {
    image: string;
    title: string;
    description: string;
    to: string;
    params?: Record<string, string>;
  };
};

export const MEGA_MENU: MegaMenuItem[] = [
  {
    label: "Stone Collections",
    to: "/products",
    groups: [
      {
        title: "Natural Stone Types",
        links: [
          { label: "Sandstone", to: "/products" },
          { label: "Limestone", to: "/products" },
          { label: "Granite", to: "/products" },
          { label: "Marble", to: "/products" },
          { label: "Slate", to: "/products" },
          { label: "Quartzite", to: "/products" },
        ],
      },
      {
        title: "Products",
        links: [
          { label: "Cobbles", to: "/products" },
          { label: "Kerbstones", to: "/products" },
          { label: "Wall Cladding", to: "/products" },
          { label: "Flooring", to: "/products" },
          { label: "Paving", to: "/products" },
          { label: "Steps", to: "/products" },
          { label: "Pool Coping", to: "/products" },
        ],
      },
      {
        title: "Architectural",
        links: [
          { label: "Columns", to: "/products" },
          { label: "Balusters", to: "/products" },
          { label: "Jali", to: "/products" },
          { label: "Carvings", to: "/products" },
          { label: "Temple Stone", to: "/products" },
          { label: "Custom Stone", to: "/products" },
        ],
      },
      {
        title: "Browse",
        links: [
          { label: "All Products", to: "/products" },
          { label: "Categories", to: "/categories" },
          { label: "Digital Catalog", to: "/catalog" },
        ],
      },
    ],
    featured: {
      image: jali,
      title: "Heritage Jali Panel",
      description: "Hand-carved lattice screens rooted in Rajasthani tradition.",
      to: "/products/$slug",
      params: { slug: "heritage-jali-panel" },
    },
  },
  {
    label: "Architecture",
    to: "/projects",
    groups: [
      {
        title: "Sectors",
        links: [
          { label: "Residential", to: "/projects" },
          { label: "Commercial", to: "/projects" },
          { label: "Hospitality", to: "/projects" },
          { label: "Landscape", to: "/projects" },
          { label: "Urban Design", to: "/projects" },
        ],
      },
    ],
    featured: {
      image: villa,
      title: "Desert Luxury Villa",
      description: "A 1,200 m² sandstone facade and landscape package for a private desert estate in Dubai.",
      to: "/projects/$slug",
      params: { slug: "desert-luxury-villa" },
    },
  },
  {
    label: "Projects",
    to: "/projects",
    groups: [
      {
        title: "By Sector",
        links: [
          { label: "Luxury Villas", to: "/projects" },
          { label: "Hotels & Resorts", to: "/projects" },
          { label: "Heritage Restoration", to: "/projects" },
          { label: "Government", to: "/projects" },
          { label: "International", to: "/projects" },
        ],
      },
    ],
    featured: {
      image: villa,
      title: "Coastal Resort & Spa",
      description: "Weather-resistant sandstone cladding for a 5-star beachfront resort in Bali.",
      to: "/projects/$slug",
      params: { slug: "coastal-resort-facade" },
    },
  },
  {
    label: "Factory",
    to: "/factory",
    groups: [
      {
        title: "Our Facility",
        links: [
          { label: "Factory Overview", to: "/factory" },
          { label: "Manufacturing Process", to: "/manufacturing" },
          { label: "Sustainability", to: "/sustainability" },
          { label: "Certifications", to: "/certifications" },
        ],
      },
    ],
    featured: {
      image: factory,
      title: "Inside Our Facility",
      description: "A 250,000 ft² precision manufacturing facility with multi-wire sawing, CNC finishing, and hand carving studios.",
      to: "/factory",
    },
  },
  {
    label: "Resources",
    to: "/catalog",
    groups: [
      {
        title: "Library",
        links: [
          { label: "Digital Catalog", to: "/catalog" },
          { label: "Downloads", to: "/downloads" },
          { label: "Certifications", to: "/certifications" },
        ],
      },
      {
        title: "Learn",
        links: [
          { label: "Blog", to: "/blog" },
          { label: "FAQ", to: "/faq" },
          { label: "Videos", to: "/videos" },
          { label: "Gallery", to: "/gallery" },
        ],
      },
    ],
  },
  {
    label: "Company",
    to: "/about",
    groups: [
      {
        title: "About",
        links: [
          { label: "About Us", to: "/about" },
          { label: "Our Heritage", to: "/heritage" },
          { label: "Careers", to: "/careers" },
          { label: "Contact", to: "/contact" },
        ],
      },
      {
        title: "Operations",
        links: [
          { label: "Factory", to: "/factory" },
          { label: "Manufacturing", to: "/manufacturing" },
          { label: "Sustainability", to: "/sustainability" },
        ],
      },
    ],
  },
];
