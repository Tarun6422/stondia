import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Admin User ──
  const adminPassword = await bcrypt.hash("Admin@StoneIndia6422", 12);
  const admin = await prisma.user.upsert({
    where: { email: "tarunsolanki6422@gmail.com" },
    update: {},
    create: {
      name: "Admin",
      email: "tarunsolanki6422@gmail.com",
      password: adminPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });
  console.log(`✓ Admin user: ${admin.email}`);

  // ── Demo Customer ──
  const userPassword = await bcrypt.hash("customer123", 12);
  await prisma.user.upsert({
    where: { email: "architect@example.com" },
    update: {},
    create: {
      name: "Sarah Architect",
      email: "architect@example.com",
      password: userPassword,
      phone: "+44 7700 123456",
      role: "ARCHITECT",
      isVerified: true,
    },
  });

  // ── Categories ──
  const categoryData = [
    { name: "Sandstone", order: 1 },
    { name: "Granite", order: 2 },
    { name: "Marble", order: 3 },
    { name: "Limestone", order: 4 },
    { name: "Slate", order: 5 },
    { name: "Quartzite", order: 6 },
    { name: "Wall Cladding", order: 7 },
    { name: "Flooring", order: 8 },
    { name: "Paving", order: 9 },
    { name: "Cobbles", order: 10 },
    { name: "Kerbstone", order: 11 },
    { name: "Pool Coping", order: 12 },
    { name: "Columns", order: 13 },
    { name: "Balusters", order: 14 },
    { name: "Jali", order: 15 },
    { name: "Carvings", order: 16 },
    { name: "Custom Stone", order: 17 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const slug = cat.name.toLowerCase().replace(/\s+/g, "-");
    const created = await prisma.category.upsert({
      where: { slug },
      update: { order: cat.order },
      create: { ...cat, slug },
    });
    categories[cat.name] = created.id;
  }
  console.log(`✓ ${categoryData.length} categories`);

  // ── Products ──
  const products = [
    {
      slug: "heritage-jali-panel",
      name: "Heritage Jali Panel",
      description:
        "Each Heritage Jali Panel is hand-carved by master artisans in Jodhpur, continuing a tradition refined over generations. These lattice screens filter light and air with timeless geometric and floral patterns, specified for luxury residences, hotels, and temple architecture worldwide.",
      categoryId: categories["Jali"],
      subCategory: "Architectural",
      finish: "Hand-Carved, Natural, Honed",
      size: "600 × 900 mm",
      thickness: "25 – 50 mm",
      origin: "Jodhpur, Rajasthan, India",
      featured: true,
      stock: "Made to Order",
      tags: ["hand-carved", "jali", "lattice", "architectural", "heritage"],
    },
    {
      slug: "sandstone-cobbles",
      name: "Sandstone Cobbles",
      description:
        "Premium tumbled sandstone cobbles for timeless landscape paving. Each piece delivers the character of authentic Rajasthan stone with dimensional consistency for modern landscape projects.",
      categoryId: categories["Cobbles"],
      subCategory: "Landscaping",
      finish: "Tumbled, Natural Split",
      size: "100 × 100 mm",
      thickness: "40 – 60 mm",
      origin: "Jodhpur, Rajasthan, India",
      featured: true,
      stock: "In Stock",
      tags: ["cobbles", "paving", "landscape", "outdoor"],
    },
    {
      slug: "carved-stone-column",
      name: "Carved Stone Column",
      description:
        "Hand-sculpted stone columns by master artisans. Available in traditional and contemporary profiles for luxury villas, hotels, and temple architecture.",
      categoryId: categories["Columns"],
      subCategory: "Architectural",
      finish: "Hand-Carved, Polished, Honed",
      size: "H 2400 mm, Ø 300 mm",
      thickness: "Solid",
      origin: "Jodhpur, Rajasthan, India",
      featured: true,
      stock: "Made to Order",
      tags: ["columns", "architecture", "carved", "heritage"],
    },
    {
      slug: "sandstone-wall-cladding",
      name: "Sandstone Wall Cladding",
      description:
        "Precision-calibrated sandstone cladding panels engineered for luxury facades worldwide. Cut to exact export tolerances with consistent colour and texture.",
      categoryId: categories["Wall Cladding"],
      subCategory: "Cladding",
      finish: "Natural, Honed, Brushed",
      size: "300 × 600 mm",
      thickness: "18 – 30 mm",
      origin: "Jodhpur, Rajasthan, India",
      featured: true,
      stock: "In Stock",
      tags: ["cladding", "facade", "architectural", "export"],
    },
    {
      slug: "desert-gold-flooring",
      name: "Desert Gold Flooring",
      description:
        "Warm honeyed tones of Rajasthan sandstone with precision calibration for flawless interior and exterior installations. Ideal for lobbies, terraces, and luxury residences.",
      categoryId: categories["Flooring"],
      subCategory: "Flooring",
      finish: "Honed, Polished, Leather",
      size: "600 × 600 mm",
      thickness: "16 – 20 mm",
      origin: "Jodhpur, Rajasthan, India",
      featured: true,
      stock: "In Stock",
      tags: ["flooring", "interior", "exterior", "desert-gold"],
    },
    {
      slug: "heritage-carving",
      name: "Heritage Carving",
      description:
        "Bespoke ornamental carvings hand-carved by master artisans for temple construction, palace restoration, and luxury residences. Each piece is a unique work of art.",
      categoryId: categories["Carvings"],
      subCategory: "Architectural",
      finish: "Hand-Carved, Antique",
      size: "Custom",
      thickness: "Custom",
      origin: "Jodhpur, Rajasthan, India",
      featured: true,
      stock: "Custom Order",
      tags: ["carving", "temple", "ornamental", "heritage"],
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log(`✓ ${products.length} products`);

  // ── Projects ──
  const projects = [
    {
      slug: "desert-luxury-villa",
      title: "Desert Luxury Villa",
      location: "Dubai, UAE",
      description:
        "A 1,200 m² sandstone facade and landscape package for a private desert estate, combining honed cladding with hand-carved detailing.",
      architect: "Foster + Partners",
      stoneUsed: "Sandstone Wall Cladding, Heritage Carving",
      year: "2024",
      featured: true,
      scope: ["Building Facades", "Wall Cladding", "Landscaping Stone", "Custom Carvings"],
    },
    {
      slug: "heritage-temple-restoration",
      title: "Heritage Temple Restoration",
      location: "Jaipur, India",
      description:
        "Museum-grade restoration of carved sandstone jali, columns and ornamentation for a 200-year-old temple complex.",
      architect: "Heritage Trust of India",
      stoneUsed: "Heritage Jali Panel, Carved Stone Column",
      year: "2023",
      featured: true,
      scope: ["Temple Stone", "Carvings", "Jali", "Columns"],
    },
    {
      slug: "coastal-resort-facade",
      title: "Coastal Resort & Spa",
      location: "Bali, Indonesia",
      description:
        "Weather-resistant sandstone cladding and paving across a 5-star beachfront resort spanning multiple villas and public spaces.",
      architect: "WOHA Architects",
      stoneUsed: "Sandstone Wall Cladding, Desert Gold Flooring",
      year: "2024",
      featured: true,
      scope: ["Wall Cladding", "Paving", "Steps", "Garden Elements"],
    },
    {
      slug: "civic-plaza-paving",
      title: "Civic Plaza Paving",
      location: "Melbourne, Australia",
      description:
        "8,500 m² of durable sandstone cobbles and paving for a public plaza engineered for heavy footfall and climate resilience.",
      architect: "Hassell Studio",
      stoneUsed: "Sandstone Cobbles, Desert Gold Flooring",
      year: "2022",
      featured: true,
      scope: ["Cobbles", "Paving", "Landscape Stones"],
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }
  console.log(`✓ ${projects.length} projects`);

  // ── Blogs ──
  const blogs = [
    {
      slug: "choosing-sandstone-facades",
      title: "How to Choose Sandstone for Building Facades",
      excerpt:
        "A practical guide to finishes, thickness and calibration for architectural facades.",
      content:
        "Selecting the right sandstone for a building facade requires careful consideration of finish, thickness, and calibration. This guide walks architects and specifiers through the key decisions that affect both aesthetics and long-term performance.\n\n## Understanding Sandstone Grades\nSandstone varies significantly in density, porosity, and compressive strength depending on the quarry source and geological formation.\n\n## Finish Selection\nThe choice of finish dramatically affects the visual character of a facade. Natural split offers the most texture, while honed provides a refined, contemporary appearance.\n\n## Calibration Standards\nExport-grade sandstone must meet strict dimensional tolerances. CNC calibration ensures consistency across large facade installations.",
      category: "Architecture",
      published: true,
      cover: null,
      authorId: admin.id,
      tags: ["sandstone", "facade", "architecture", "specification"],
    },
    {
      slug: "sustainable-quarrying-practices",
      title: "Inside Our Sustainable Quarrying Practices",
      excerpt: "How responsible extraction and water recycling shape every slab we produce.",
      content:
        "Sustainability is at the heart of our operations. From responsible quarrying to water recycling and waste reduction, we are committed to minimizing our environmental footprint while maximizing the natural beauty of Rajasthan sandstone.\n\n## Water Conservation\nOur quarrying operations recycle over 80% of water used in the cutting and finishing process.\n\n## Waste Reduction\nStone offcuts are repurposed for landscaping, aggregates, and smaller architectural elements.\n\n## Land Rehabilitation\nAfter quarrying is complete, we rehabilitate the land for alternative use.",
      category: "Sustainability",
      published: true,
      authorId: admin.id,
      tags: ["sustainability", "quarrying", "environment", "india"],
    },
    {
      slug: "heritage-jali-craft",
      title: "The Living Craft of Rajasthani Jali",
      excerpt: "Meet the artisans keeping centuries-old lattice carving alive.",
      content:
        "The art of jali carving has been passed down through generations of master artisans in Jodhpur. Each panel tells a story of precision, patience, and cultural heritage.\n\n## The Process\nFrom rough block to finished lattice, a single jali panel can take weeks to complete.\n\n## Patterns & Symbolism\nTraditional geometric and floral patterns carry deep symbolic meaning in Rajasthani architecture.\n\n## Modern Applications\nToday, jali panels are specified for luxury residences, hotels, and cultural buildings worldwide.",
      category: "Heritage",
      published: true,
      authorId: admin.id,
      tags: ["jali", "craftsmanship", "heritage", "rajasthan"],
    },
  ];

  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: blog,
      create: blog,
    });
  }
  console.log(`✓ ${blogs.length} blog posts`);

  // ── Videos ──
  const videos = [
    {
      slug: "inside-our-quarries",
      title: "Inside Our Quarries",
      category: "Factory",
      duration: "3:42",
      featured: true,
    },
    {
      slug: "precision-manufacturing",
      title: "Precision Manufacturing Tour",
      category: "Factory",
      duration: "5:18",
      featured: true,
    },
  ];

  for (const video of videos) {
    await prisma.video.upsert({
      where: { slug: video.slug },
      update: video,
      create: video,
    });
  }
  console.log(`✓ ${videos.length} videos`);

  // ── Testimonials ──
  const testimonials = [
    {
      client: "Sarah Whitmore",
      designation: "Principal Architect",
      company: "Whitmore Studio",
      review:
        "The consistency of finish and precision of the calibrated cladding was flawless across every shipment. A true export-grade partner.",
      rating: 5,
      featured: true,
    },
    {
      client: "Rajeev Menon",
      designation: "Conservation Director",
      company: "Heritage Trust of India",
      review:
        "Their hand-carved jali brought our restoration to life. Craftsmanship you simply cannot find elsewhere at this scale.",
      rating: 5,
      featured: true,
      authorId: admin.id,
    },
    {
      client: "Lucas Meyer",
      designation: "Procurement Lead",
      company: "Meyer Developments",
      review:
        "From technical sheets to international packaging, everything was seamless. Stone India is our default sandstone supplier.",
      rating: 5,
      featured: true,
    },
  ];

  for (const t of testimonials) {
    const data = { ...t, authorId: t.authorId || undefined };
    await prisma.testimonial.create({ data });
  }
  console.log(`✓ ${testimonials.length} testimonials`);

  // ── Demo Contact ──
  await prisma.contact.create({
    data: {
      name: "John Architect",
      email: "john@archstudio.com",
      phone: "+1 555 123 4567",
      company: "Arch Studio London",
      message:
        "I'm interested in learning more about your Heritage Jali Panels for a hotel project in London. Could you share pricing and lead times for custom sizes?",
      status: "Unread",
    },
  });

  // ── Demo RFQ ──
  await prisma.rFQ.create({
    data: {
      company: "Arch Studio London",
      phone: "+1 555 123 4567",
      email: "john@archstudio.com",
      country: "United Kingdom",
      message:
        "We are looking for 200 m² of sandstone wall cladding in honed finish for a luxury residential project.",
      products: ["Sandstone Wall Cladding", "Heritage Jali Panel"],
      status: "Pending",
    },
  });

  console.log("✓ Demo contact & RFQ entries");

  // ── Settings ──
  await prisma.setting.upsert({
    where: { key: "site_name" },
    update: { value: "STONDIA" },
    create: { key: "site_name", value: "STONDIA" },
  });

  console.log("✓ Settings");
  console.log("\nSeed complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin:    tarunsolanki6422@gmail.com / Admin@StoneIndia6422");
  console.log("  Customer: architect@example.com / customer123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
