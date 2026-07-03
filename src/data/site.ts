import cobbles from "@/assets/product-cobbles.jpg";
import jali from "@/assets/product-jali.jpg";
import column from "@/assets/product-column.jpg";
import villa from "@/assets/project-villa.jpg";
import factory from "@/assets/factory.jpg";
import texture from "@/assets/texture-stone.jpg";

export const COMPANY = {
  name: "Stone India Heritage",
  short: "Stone India",
  tagline: "Heritage Sandstone & Architecture",
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
  "Raw Stones",
  "Finished Stones",
  "Sandstone Collection",
  "Architectural Products",
  "Wall Cladding",
  "Flooring",
  "Cobbles",
  "Paving",
  "Steps",
  "Columns",
  "Balusters",
  "Jali",
  "Carvings",
  "Landscape Stones",
  "Garden Elements",
];

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
};

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
    applications: ["Facades", "Partitions", "Windows", "Temple Architecture"],
    specs: [
      { label: "Water Absorption", value: "< 1.0%" },
      { label: "Compressive Strength", value: "95 MPa" },
      { label: "Density", value: "2.4 g/cm³" },
      { label: "Frost Resistance", value: "Excellent" },
    ],
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
    applications: ["Driveways", "Walkways", "Courtyards", "Landscaping"],
    specs: [
      { label: "Water Absorption", value: "< 1.2%" },
      { label: "Slip Resistance", value: "R11" },
      { label: "Density", value: "2.35 g/cm³" },
      { label: "Frost Resistance", value: "Excellent" },
    ],
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
    applications: ["Villas", "Hotels", "Temples", "Restoration"],
    specs: [
      { label: "Water Absorption", value: "< 1.0%" },
      { label: "Compressive Strength", value: "98 MPa" },
      { label: "Density", value: "2.42 g/cm³" },
      { label: "Load Rating", value: "Structural" },
    ],
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
    applications: ["Building Facades", "Interior Walls", "Feature Walls"],
    specs: [
      { label: "Water Absorption", value: "< 1.1%" },
      { label: "Flexural Strength", value: "18 MPa" },
      { label: "Density", value: "2.38 g/cm³" },
      { label: "UV Stability", value: "Excellent" },
    ],
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
    applications: ["Flooring", "Poolside", "Terraces", "Lobbies"],
    specs: [
      { label: "Water Absorption", value: "< 0.9%" },
      { label: "Slip Resistance", value: "R10" },
      { label: "Density", value: "2.4 g/cm³" },
      { label: "Abrasion", value: "Class 4" },
    ],
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
    applications: ["Temple Stone", "Restoration", "Ornamentation"],
    specs: [
      { label: "Water Absorption", value: "< 1.0%" },
      { label: "Compressive Strength", value: "96 MPa" },
      { label: "Density", value: "2.41 g/cm³" },
      { label: "Detailing", value: "Museum Grade" },
    ],
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

export const MEGA_MENU: {
  label: string;
  to: string;
  groups?: { title: string; links: { label: string; to: string }[] }[];
}[] = [
  { label: "Home", to: "/" },
  {
    label: "Company",
    to: "/about",
    groups: [
      {
        title: "Who We Are",
        links: [
          { label: "About Us", to: "/about" },
          { label: "Our Heritage", to: "/heritage" },
          { label: "Factory", to: "/factory" },
          { label: "Certifications", to: "/certifications" },
        ],
      },
      {
        title: "How We Work",
        links: [
          { label: "Manufacturing Process", to: "/manufacturing" },
          { label: "Sustainability", to: "/sustainability" },
          { label: "Careers", to: "/careers" },
        ],
      },
    ],
  },
  {
    label: "Products",
    to: "/products",
    groups: [
      {
        title: "Collections",
        links: [
          { label: "All Products", to: "/products" },
          { label: "Browse Categories", to: "/categories" },
          { label: "Digital Catalog", to: "/catalog" },
        ],
      },
      {
        title: "Applications",
        links: [
          { label: "Wall Cladding", to: "/products" },
          { label: "Flooring & Paving", to: "/products" },
          { label: "Jali & Carvings", to: "/products" },
        ],
      },
    ],
  },
  {
    label: "Work",
    to: "/projects",
    groups: [
      {
        title: "Showcase",
        links: [
          { label: "Projects", to: "/projects" },
          { label: "Gallery", to: "/gallery" },
          { label: "Videos", to: "/videos" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Download Center", to: "/downloads" },
          { label: "Blog", to: "/blog" },
          { label: "FAQ", to: "/faq" },
        ],
      },
    ],
  },
  { label: "Contact", to: "/contact" },
];
