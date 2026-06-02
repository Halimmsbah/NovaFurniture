import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import slugify from 'slugify';
import { userModel } from '../database/models/user.model.js';
import { categoryModel } from '../database/models/category.model.js';
import { brandModel } from '../database/models/brand.model.js';
import { subcategoryModel } from '../database/models/subcategory.model.js';
import { productModel } from '../database/models/product.model.js';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DB_STRING || 'mongodb://localhost:27017/halim';
const ADMIN_EMAIL = 'Halimsbah2@gmail.com';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');
const sourceProductsDir = path.resolve(repoRoot, 'frontend', 'src', 'assets', 'products');
const uploadsDir = path.resolve(backendRoot, 'uploads');

const categorySeeds = [
  {
    name: 'Sofas',
    image: 'sectional-purple.png',
    subcategories: ['Classic Sofas', 'Curved Sofas', 'Sectionals', 'Chaise Sofas', 'Low Sofas', 'Mid Sofas'],
  },
  {
    name: 'Chairs',
    image: 'armchair-purple.png',
    subcategories: ['Accent Chairs', 'Armchairs', 'Lounge Chairs', 'Office Chairs'],
  },
  {
    name: 'Tables',
    image: 'marble-dining-table.png',
    subcategories: ['Dining Tables', 'Coffee Tables', 'Side Tables'],
  },
  {
    name: 'Lighting',
    image: 'floor-lamp.png',
    subcategories: ['Table Lamps', 'Floor Lamps', 'Pendant Lamps'],
  },
  {
    name: 'Bedroom',
    image: 'platform-bed-purple.png',
    subcategories: ['Beds'],
  },
  {
    name: 'Storage',
    image: 'walnut-bookshelf.png',
    subcategories: ['Bookcases', 'Desks'],
  },
  {
    name: 'Decor',
    image: 'ceramic-vase.png',
    subcategories: ['Decorative Objects'],
  },
];

const brandSeeds = [
  { name: 'Nova Atelier' },
  { name: 'Maison Velvet' },
  { name: 'Oak & Marble' },
  { name: 'Solis Studio' },
  { name: 'Atelier Noir' },
];

const productSeeds = [
  {
    file: 'classic-sofa-beige.png',
    title: 'Classic Beige Sofa',
    description: 'A tailored three-seat beige sofa with slim legs and a calm, gallery-like silhouette.',
    category: 'Sofas',
    subcategory: 'Classic Sofas',
    brand: 'Maison Velvet',
    price: 24500,
    priceAfterDiscount: 21900,
    quantity: 12,
    sold: 18,
    rateAvg: 4.8,
    rateCount: 32,
  },
  {
    file: 'curved-sofa-beige.png',
    title: 'Curved Beige Sofa',
    description: 'An elegant curved sofa that softens a room with rounded edges and deep comfort.',
    category: 'Sofas',
    subcategory: 'Curved Sofas',
    brand: 'Maison Velvet',
    price: 26800,
    priceAfterDiscount: 24120,
    quantity: 9,
    sold: 14,
    rateAvg: 4.7,
    rateCount: 25,
  },
  {
    file: 'sectional-purple.png',
    title: 'Velvet Sectional Sofa',
    description: 'A bold modular sectional in rich velvet designed for statement living rooms.',
    category: 'Sofas',
    subcategory: 'Sectionals',
    brand: 'Nova Atelier',
    price: 38900,
    priceAfterDiscount: 34900,
    quantity: 6,
    sold: 11,
    rateAvg: 4.9,
    rateCount: 21,
  },
  {
    file: 'chaise-sofa-purple.png',
    title: 'Purple Chaise Sofa',
    description: 'A plush chaise sofa with sculpted arms and a relaxed lounge-ready profile.',
    category: 'Sofas',
    subcategory: 'Chaise Sofas',
    brand: 'Nova Atelier',
    price: 31200,
    priceAfterDiscount: 28700,
    quantity: 7,
    sold: 10,
    rateAvg: 4.8,
    rateCount: 19,
  },
  {
    file: 'low-sofa-beige.png',
    title: 'Low Profile Sofa',
    description: 'A low-slung beige sofa that keeps the room visually open and modern.',
    category: 'Sofas',
    subcategory: 'Low Sofas',
    brand: 'Maison Velvet',
    price: 23600,
    priceAfterDiscount: 22900,
    quantity: 10,
    sold: 9,
    rateAvg: 4.6,
    rateCount: 17,
  },
  {
    file: 'mid-sofa-beige.png',
    title: 'Mid Century Sofa',
    description: 'A balanced mid-century beige sofa with crisp lines and understated character.',
    category: 'Sofas',
    subcategory: 'Mid Sofas',
    brand: 'Maison Velvet',
    price: 25100,
    priceAfterDiscount: 23100,
    quantity: 8,
    sold: 12,
    rateAvg: 4.7,
    rateCount: 23,
  },
  {
    file: 'accent-chair-purple.png',
    title: 'Purple Accent Chair',
    description: 'A compact accent chair that brings color and softness to a reading corner.',
    category: 'Chairs',
    subcategory: 'Accent Chairs',
    brand: 'Nova Atelier',
    price: 9800,
    priceAfterDiscount: 8900,
    quantity: 18,
    sold: 26,
    rateAvg: 4.8,
    rateCount: 41,
  },
  {
    file: 'armchair-purple.png',
    title: 'Purple Armchair',
    description: 'A deep lounge armchair with a cocooning shape and refined metal legs.',
    category: 'Chairs',
    subcategory: 'Armchairs',
    brand: 'Nova Atelier',
    price: 11400,
    priceAfterDiscount: 10200,
    quantity: 14,
    sold: 16,
    rateAvg: 4.7,
    rateCount: 29,
  },
  {
    file: 'lounge-chair-beige.png',
    title: 'Beige Lounge Chair',
    description: 'A relaxed lounge chair with a soft shell and a warm, neutral finish.',
    category: 'Chairs',
    subcategory: 'Lounge Chairs',
    brand: 'Maison Velvet',
    price: 8600,
    priceAfterDiscount: 7990,
    quantity: 16,
    sold: 22,
    rateAvg: 4.6,
    rateCount: 18,
  },
  {
    file: 'velvet-office-chair.png',
    title: 'Velvet Office Chair',
    description: 'A swivel office chair wrapped in velvet for a more luxurious work setup.',
    category: 'Chairs',
    subcategory: 'Office Chairs',
    brand: 'Atelier Noir',
    price: 12900,
    priceAfterDiscount: 11800,
    quantity: 11,
    sold: 13,
    rateAvg: 4.5,
    rateCount: 16,
  },
  {
    file: 'marble-dining-table.png',
    title: 'Marble Dining Table',
    description: 'A marble-topped dining table with a clean rectangular base and brass detail.',
    category: 'Tables',
    subcategory: 'Dining Tables',
    brand: 'Oak & Marble',
    price: 34800,
    priceAfterDiscount: 31900,
    quantity: 5,
    sold: 8,
    rateAvg: 4.9,
    rateCount: 14,
  },
  {
    file: 'marble-side-table.png',
    title: 'Marble Side Table',
    description: 'A compact side table with a smooth stone top and sculptural base.',
    category: 'Tables',
    subcategory: 'Side Tables',
    brand: 'Oak & Marble',
    price: 6700,
    priceAfterDiscount: 6200,
    quantity: 22,
    sold: 19,
    rateAvg: 4.7,
    rateCount: 27,
  },
  {
    file: 'travertine-coffee-table.png',
    title: 'Travertine Coffee Table',
    description: 'A low travertine coffee table with a dramatic pedestal base and soft edges.',
    category: 'Tables',
    subcategory: 'Coffee Tables',
    brand: 'Oak & Marble',
    price: 14800,
    priceAfterDiscount: 13600,
    quantity: 9,
    sold: 15,
    rateAvg: 4.8,
    rateCount: 24,
  },
  {
    file: 'alabaster-table-lamp.png',
    title: 'Alabaster Table Lamp',
    description: 'A warm table lamp with an alabaster shade and polished brass stand.',
    category: 'Lighting',
    subcategory: 'Table Lamps',
    brand: 'Solis Studio',
    price: 4200,
    priceAfterDiscount: 3900,
    quantity: 24,
    sold: 20,
    rateAvg: 4.7,
    rateCount: 33,
  },
  {
    file: 'floor-lamp.png',
    title: 'Floor Lamp',
    description: 'A slim floor lamp with a domed head that adds soft ambient lighting.',
    category: 'Lighting',
    subcategory: 'Floor Lamps',
    brand: 'Solis Studio',
    price: 5200,
    priceAfterDiscount: 4890,
    quantity: 20,
    sold: 17,
    rateAvg: 4.6,
    rateCount: 20,
  },
  {
    file: 'pendant-lamp.png',
    title: 'Pendant Lamp',
    description: 'A matte pendant lamp with a focused glow for dining or bedside use.',
    category: 'Lighting',
    subcategory: 'Pendant Lamps',
    brand: 'Solis Studio',
    price: 3600,
    priceAfterDiscount: 3300,
    quantity: 28,
    sold: 18,
    rateAvg: 4.5,
    rateCount: 15,
  },
  {
    file: 'platform-bed-purple.png',
    title: 'Velvet Platform Bed',
    description: 'A upholstered platform bed with a tall padded headboard and luxurious feel.',
    category: 'Bedroom',
    subcategory: 'Beds',
    brand: 'Nova Atelier',
    price: 42900,
    priceAfterDiscount: 39500,
    quantity: 4,
    sold: 6,
    rateAvg: 4.9,
    rateCount: 11,
  },
  {
    file: 'walnut-bookshelf.png',
    title: 'Walnut Bookshelf',
    description: 'A tall walnut bookshelf with open shelving and light brass support feet.',
    category: 'Storage',
    subcategory: 'Bookcases',
    brand: 'Oak & Marble',
    price: 19800,
    priceAfterDiscount: 18400,
    quantity: 7,
    sold: 9,
    rateAvg: 4.6,
    rateCount: 13,
  },
  {
    file: 'walnut-desk.png',
    title: 'Walnut Writing Desk',
    description: 'A spacious walnut desk with drawer storage and polished gold legs.',
    category: 'Storage',
    subcategory: 'Desks',
    brand: 'Atelier Noir',
    price: 22300,
    priceAfterDiscount: 20700,
    quantity: 6,
    sold: 7,
    rateAvg: 4.7,
    rateCount: 12,
  },
  {
    file: 'ceramic-vase.png',
    title: 'Ceramic Sculptural Vase',
    description: 'A sculptural ceramic vase that works as a standalone decor object or centerpiece.',
    category: 'Decor',
    subcategory: 'Decorative Objects',
    brand: 'Solis Studio',
    price: 2500,
    priceAfterDiscount: 2300,
    quantity: 30,
    sold: 28,
    rateAvg: 4.8,
    rateCount: 22,
  },
];

async function syncProductImages() {
  await fs.mkdir(uploadsDir, { recursive: true });
  const sourceFiles = await fs.readdir(sourceProductsDir);

  for (const file of sourceFiles) {
    const source = path.join(sourceProductsDir, file);
    const target = path.join(uploadsDir, file);
    await fs.copyFile(source, target);
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI);

  try {
    await syncProductImages();

    const admin = await userModel.findOne({ email: ADMIN_EMAIL }).select('_id');

    await Promise.all([
      productModel.deleteMany({}),
      subcategoryModel.deleteMany({}),
      categoryModel.deleteMany({}),
      brandModel.deleteMany({}),
    ]);

    const categoryDocs = new Map();
    for (const seed of categorySeeds) {
      const category = await categoryModel.create({
        name: seed.name,
        slug: slugify(seed.name, { lower: true, strict: true }),
        image: seed.image,
        createdBy: admin?._id,
      });
      categoryDocs.set(seed.name, category);
    }

    const brandDocs = new Map();
    for (const seed of brandSeeds) {
      const brand = await brandModel.create({
        name: seed.name,
        slug: slugify(seed.name, { lower: true, strict: true }),
        createdBy: admin?._id,
      });
      brandDocs.set(seed.name, brand);
    }

    const subcategoryDocs = new Map();
    for (const seed of categorySeeds) {
      const category = categoryDocs.get(seed.name);

      for (const subcategoryName of seed.subcategories) {
        const subcategory = await subcategoryModel.create({
          name: subcategoryName,
          slug: slugify(subcategoryName, { lower: true, strict: true }),
          category: category._id,
          createdBy: admin?._id,
        });
        subcategoryDocs.set(subcategoryName, subcategory);
      }
    }

    for (const seed of productSeeds) {
      const category = categoryDocs.get(seed.category);
      const brand = brandDocs.get(seed.brand);
      const subcategory = subcategoryDocs.get(seed.subcategory);

      await productModel.create({
        title: seed.title,
        slug: slugify(seed.title, { lower: true, strict: true }),
        description: seed.description,
        imgCover: seed.file,
        price: seed.price,
        priceAfterDiscount: seed.priceAfterDiscount,
        quantity: seed.quantity,
        sold: seed.sold,
        rateAvg: seed.rateAvg,
        rateCount: seed.rateCount,
        category: category?._id,
        subcategory: subcategory?._id,
        brand: brand?._id,
        createdBy: admin?._id,
      });
    }

    console.log('SEED_DEMO_OK', {
      categories: categorySeeds.length,
      subcategories: subcategoryDocs.size,
      brands: brandSeeds.length,
      products: productSeeds.length,
      imagesSynced: productSeeds.length,
    });
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(async (err) => {
  console.error('SEED_DEMO_FAILED', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});