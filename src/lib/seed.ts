import type { Product, Order, ReturnFundEntry, Milestone, OrderStatus } from './types';
import { generateBarcode, generateOrderNumber } from './pricing';

export const SEED_PRODUCTS: Product[] = [
  // 1688.com (4 items)
  {
    id: 'p1688-1', merchant: '1688', title: '折叠收纳箱', titleNl: 'Opvouwbare opbergbox (set van 3)',
    category: 'Opbergen', priceRmb: 35, weightKg: 0.8, lengthCm: 40, widthCm: 30, heightCm: 25,
    imageUrl: 'https://images.pexels.com/photos/6747989/pexels-photo-6747989.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['Standaard'], colors: ['Wit', 'Grijs'], originalUrl: 'https://detail.1688.com/offer/123456789.html',
    qcInstructionEn: 'Check box integrity, no cracks, all 3 pieces present, hinges functional.',
    inStock: true,
  },
  {
    id: 'p1688-2', merchant: '1688', title: '硅胶厨房工具套装', titleNl: 'Siliconen keukengerei set (8 stuks)',
    category: 'Keuken', priceRmb: 28, weightKg: 0.5, lengthCm: 35, widthCm: 20, heightCm: 10,
    imageUrl: 'https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['Standaard'], colors: ['Rood', 'Blauw', 'Zwart'], originalUrl: 'https://detail.1688.com/offer/987654321.html',
    qcInstructionEn: 'Verify all 8 pieces, food-grade silicone, no odor, heat resistant stamp visible.',
    inStock: true,
  },
  {
    id: 'p1688-3', merchant: '1688', title: '汽车手机支架', titleNl: 'Auto telefoonhouder ( universeel)',
    category: 'Auto & Fiets', priceRmb: 15, weightKg: 0.2, lengthCm: 12, widthCm: 8, heightCm: 6,
    imageUrl: 'https://images.pexels.com/photos/3786091/pexels-photo-3786091.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['Standaard'], colors: ['Zwart'], originalUrl: 'https://detail.1688.com/offer/456789123.html',
    qcInstructionEn: 'Test suction cup adhesion, adjustable arm movement, no sharp edges.',
    inStock: true,
  },
  {
    id: 'p1688-4', merchant: '1688', title: 'LED运动跳绳', titleNl: 'LED sport springtouw',
    category: 'Sport', priceRmb: 18, weightKg: 0.3, lengthCm: 30, widthCm: 15, heightCm: 5,
    imageUrl: 'https://images.pexels.com/photos/4761357/pexels-photo-4761357.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['2.5m', '2.8m'], colors: ['Blauw', 'Groen'], originalUrl: 'https://detail.1688.com/offer/147258369.html',
    qcInstructionEn: 'Check LED function, battery compartment, rope length markings.',
    inStock: true,
  },
  // Shein (4 items - fashion)
  {
    id: 'p-shein-1', merchant: 'shein', title: 'Summer Floral Dress', titleNl: 'Zomerbloemenjurk',
    category: 'Kleding', priceRmb: 45, weightKg: 0.3, lengthCm: 30, widthCm: 25, heightCm: 3,
    imageUrl: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Bloemenprint', 'Wit'], originalUrl: 'https://www.shein.com/Summer-Floral-Dress-p-123456.html',
    qcInstructionEn: 'Check stitching, fabric quality, no loose threads, correct sizing label (Chinese sizes run 1-2 small).',
    inStock: true,
  },
  {
    id: 'p-shein-2', merchant: 'shein', title: 'Casual Knit Sweater', titleNl: 'Casual gebreide trui',
    category: 'Kleding', priceRmb: 55, weightKg: 0.5, lengthCm: 35, widthCm: 28, heightCm: 4,
    imageUrl: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Beige', 'Grijs', 'Zwart'], originalUrl: 'https://www.shein.com/Casual-Knit-Sweater-p-234567.html',
    qcInstructionEn: 'Verify knit consistency, no pilling, correct color match to order.',
    inStock: true,
  },
  {
    id: 'p-shein-3', merchant: 'shein', title: 'Denim Mini Skirt', titleNl: 'Denim minirok',
    category: 'Kleding', priceRmb: 38, weightKg: 0.4, lengthCm: 32, widthCm: 24, heightCm: 3,
    imageUrl: 'https://images.pexels.com/photos/1755428/pexels-photo-1755428.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Lichtblauw', 'Donkerblauw'], originalUrl: 'https://www.shein.com/Denim-Mini-Skirt-p-345678.html',
    qcInstructionEn: 'Check zipper function, denim quality, hem stitching.',
    inStock: true,
  },
  {
    id: 'p-shein-4', merchant: 'shein', title: 'Oversized Cotton T-Shirt', titleNl: 'Oversized katoenen t-shirt',
    category: 'Kleding', priceRmb: 22, weightKg: 0.25, lengthCm: 28, widthCm: 22, heightCm: 2,
    imageUrl: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Wit', 'Zwart', 'Groen'], originalUrl: 'https://www.shein.com/Oversized-Cotton-Tee-p-456789.html',
    qcInstructionEn: 'Check cotton weight (180gsm+), print quality if applicable, sizing label.',
    inStock: true,
  },
  // Temu (4 items - living & gadgets)
  {
    id: 'p-temu-1', merchant: 'temu', title: 'Minimalist Desk Lamp', titleNl: 'Minimalistische bureaulamp (USB)',
    category: 'Wonen', priceRmb: 42, weightKg: 0.6, lengthCm: 25, widthCm: 15, heightCm: 35,
    imageUrl: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['Standaard'], colors: ['Wit', 'Zwart'], originalUrl: 'https://www.temu.com/goods-detail_123456.html',
    qcInstructionEn: 'Test USB power, brightness levels, LED color temperature, base stability.',
    inStock: true,
  },
  {
    id: 'p-temu-2', merchant: 'temu', title: 'Ceramic Plant Pot Set', titleNl: 'Keramische plantenpotten set (3 stuks)',
    category: 'Wonen', priceRmb: 32, weightKg: 1.2, lengthCm: 20, widthCm: 20, heightCm: 18,
    imageUrl: 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['Klein', 'Medium', 'Groot'], colors: ['Wit', 'Terracotta'], originalUrl: 'https://www.temu.com/goods-detail_234567.html',
    qcInstructionEn: 'Check for cracks/chips, drainage holes present, consistent glaze finish.',
    inStock: true,
  },
  {
    id: 'p-temu-3', merchant: 'temu', title: 'Smart LED Strip 5M', titleNl: 'Slimme LED-strip 5 meter (WiFi)',
    category: 'Tech-accessoires', priceRmb: 48, weightKg: 0.4, lengthCm: 30, widthCm: 10, heightCm: 5,
    imageUrl: 'https://images.pexels.com/photos/3330471/pexels-photo-3330471.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['5m'], colors: ['RGB'], originalUrl: 'https://www.temu.com/goods-detail_345678.html',
    qcInstructionEn: 'Test all LEDs function, WiFi connectivity, remote control pairing, adhesive backing.',
    inStock: true,
  },
  {
    id: 'p-temu-4', merchant: 'temu', title: 'Foldable Storage Ottoman', titleNl: 'Opvouwbare opbergpoef',
    category: 'Opbergen', priceRmb: 55, weightKg: 1.5, lengthCm: 40, widthCm: 40, heightCm: 35,
    imageUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['40x40cm'], colors: ['Grijs', 'Beige'], originalUrl: 'https://www.temu.com/goods-detail_456789.html',
    qcInstructionEn: 'Check folding mechanism, fabric tension, load capacity (min 80kg), no tears.',
    inStock: true,
  },
  // AliExpress (4 items - tech & accessories)
  {
    id: 'p-ali-1', merchant: 'aliexpress', title: '65W GaN Charger', titleNl: '65W GaN snellader (USB-C)',
    category: 'Tech-accessoires', priceRmb: 65, weightKg: 0.2, lengthCm: 5, widthCm: 5, heightCm: 3,
    imageUrl: 'https://images.pexels.com/photos/4526473/pexels-photo-4526473.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['EU-plug'], colors: ['Wit', 'Zwart'], originalUrl: 'https://www.aliexpress.com/item/65W-GaN-Charger_123456.html',
    qcInstructionEn: 'Test 65W output, EU plug format, CE marking present, no overheating under load.',
    inStock: true,
  },
  {
    id: 'p-ali-2', merchant: 'aliexpress', title: 'Wireless Earbuds Pro', titleNl: 'Draadloze oordopjes Pro (Bluetooth 5.3)',
    category: 'Tech-accessoires', priceRmb: 85, weightKg: 0.15, lengthCm: 8, widthCm: 6, heightCm: 4,
    imageUrl: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['Standaard'], colors: ['Wit', 'Zwart'], originalUrl: 'https://www.aliexpress.com/item/Wireless-Earbuds-Pro_234567.html',
    qcInstructionEn: 'Test pairing, both earbuds function, charging case works, ANC active.',
    inStock: true,
  },
  {
    id: 'p-ali-3', merchant: 'aliexpress', title: 'Phone Ring Holder Stand', titleNl: 'Telefoon ringhouder (360°)',
    category: 'Tech-accessoires', priceRmb: 12, weightKg: 0.05, lengthCm: 5, widthCm: 5, heightCm: 1,
    imageUrl: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['Standaard'], colors: ['Goud', 'Zilver', 'Zwart'], originalUrl: 'https://www.aliexpress.com/item/Phone-Ring-Holder_345678.html',
    qcInstructionEn: 'Check adhesive strength, 360 rotation smooth, metal finish quality.',
    inStock: true,
  },
  {
    id: 'p-ali-4', merchant: 'aliexpress', title: 'Stainless Steel Water Bottle', titleNl: 'RVS waterfles 500ml (thermos)',
    category: 'Sport', priceRmb: 38, weightKg: 0.35, lengthCm: 22, widthCm: 7, heightCm: 7,
    imageUrl: 'https://images.pexels.com/photos/1188649/pexels-photo-1188649.jpeg?auto=compress&cs=tinysrgb&w=600',
    sizes: ['350ml', '500ml', '750ml'], colors: ['Zwart', 'Blauw', 'Groen', 'Rood'], originalUrl: 'https://www.aliexpress.com/item/Stainless-Bottle_456789.html',
    qcInstructionEn: 'Test leak-proof seal, thermal insulation (cold 24h), no dents, lid function.',
    inStock: true,
  },
];

const DEMO_LINKS = [
  { label: '1688 demo link', url: 'https://detail.1688.com/offer/123456789.html' },
  { label: 'Shein demo link', url: 'https://www.shein.com/Summer-Floral-Dress-p-123456.html' },
  { label: 'Temu demo link', url: 'https://www.temu.com/goods-detail_123456.html' },
  { label: 'AliExpress demo link', url: 'https://www.aliexpress.com/item/65W-GaN-Charger_123456.html' },
];

function buildMilestones(status: OrderStatus): Milestone[] {
  const now = new Date();
  const steps: OrderStatus[] = [
    'Nieuw', 'Besteld bij Bron/1688', 'QC Foto\'s Goedgekeurd', 'In Bulkdoos naar Rotterdam',
    'Aangekomen in Rotterdam', 'PostNL Label Gemaakt', 'Onderweg naar Klant', 'Bezorgd'
  ];
  const idx = steps.indexOf(status);
  return steps.map((s, i) => {
    const date = new Date(now.getTime() - (steps.length - i) * 86400000);
    return {
      status: s,
      date: date.toISOString().split('T')[0],
      done: i <= idx,
      note: i <= idx ? getMilestoneNote(s) : undefined,
    };
  });
}

function getMilestoneNote(s: OrderStatus): string {
  switch (s) {
    case 'Nieuw': return 'Bestelling ontvangen door ChiNed.';
    case 'Besteld bij Bron/1688': return 'CN Cargo heeft bestelling geplaatst bij bronleverancier.';
    case 'QC Foto\'s Goedgekeurd': return 'Kwaliteitscontrole-foto\'s ontvangen en goedgekeurd.';
    case 'In Bulkdoos naar Rotterdam': return 'Producten ingepakt in bulkdoos, op weg naar Rotterdam.';
    case 'Aangekomen in Rotterdam': return 'Zending aangekomen in ChiNed hub Rotterdam.';
    case 'PostNL Label Gemaakt': return 'PostNL-label aangemaakt, pakket klaar voor verzending.';
    case 'Onderweg naar Klant': return 'Pakket is onderweg via PostNL.';
    case 'Bezorgd': return 'Pakket succesvol bezorgd. Veel plezier met je aankopen!';
  }
}

export const SEED_ORDERS: Order[] = [
  {
    id: 'order-1', orderNumber: generateOrderNumber(),
    customerName: 'Sanne de Vries', customerEmail: 'sanne.devries@example.nl', customerPhone: '0612345678',
    address: 'Kerkstraat 12', postalCode: '3011 RG', city: 'Rotterdam',
    deliveryType: 'home', paymentMethod: 'iDEAL',
    items: [
      { id: 'ci-1', product: SEED_PRODUCTS[0], size: 'Standaard', color: 'Wit', quantity: 1 },
      { id: 'ci-2', product: SEED_PRODUCTS[4], size: 'M', color: 'Bloemenprint', quantity: 1 },
      { id: 'ci-3', product: SEED_PRODUCTS[8], size: 'Standaard', color: 'Wit', quantity: 1 },
      { id: 'ci-4', product: SEED_PRODUCTS[12], size: 'EU-plug', color: 'Wit', quantity: 1 },
      { id: 'ci-5', product: SEED_PRODUCTS[10], size: '5m', color: 'RGB', quantity: 1 },
      { id: 'ci-6', product: SEED_PRODUCTS[15], size: '500ml', color: 'Blauw', quantity: 1 },
    ],
    transportMode: 'train', status: 'Onderweg naar Klant',
    milestones: buildMilestones('Onderweg naar Klant'),
    productCostEur: 42.50, chinaHandlingEur: 5.10, freightEur: 8.20, dutyEur: 4.05,
    postnlCostEur: 4.50, platformMarginEur: 12.00, communityFundDeposit: 3.85, totalEur: 80.20,
    savedEur: 24.30, personalDeposit: 3.85, hasReturned: false,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    internalBarcode: generateBarcode(),
    qcPhotos: [
      { id: 'qc-1-1', url: 'https://images.pexels.com/photos/4226791/pexels-photo-4226791.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'QC foto 1 - Alle items verzameld' },
      { id: 'qc-1-2', url: 'https://images.pexels.com/photos/4226803/pexels-photo-4226803.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'QC foto 2 - Detailcontrole kleding' },
      { id: 'qc-1-3', url: 'https://images.pexels.com/photos/4226810/pexels-photo-4226810.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'QC foto 3 - Verpakking goedgekeurd' },
    ],
  },
  {
    id: 'order-2', orderNumber: generateOrderNumber(),
    customerName: 'Lars Bakker', customerEmail: 'lars.bakker@example.nl', customerPhone: '0687654321',
    address: 'Lindenlaan 45', postalCode: '3521 VK', city: 'Utrecht',
    deliveryType: 'locker', paymentMethod: 'Creditcard',
    items: [
      { id: 'ci-7', product: SEED_PRODUCTS[1], size: 'Standaard', color: 'Rood', quantity: 2 },
      { id: 'ci-8', product: SEED_PRODUCTS[3], size: '2.8m', color: 'Groen', quantity: 1 },
      { id: 'ci-9', product: SEED_PRODUCTS[9], size: 'Medium', color: 'Terracotta', quantity: 1 },
      { id: 'ci-10', product: SEED_PRODUCTS[13], size: 'Standaard', color: 'Zwart', quantity: 1 },
      { id: 'ci-11', product: SEED_PRODUCTS[2], size: 'Standaard', color: 'Zwart', quantity: 1 },
      { id: 'ci-12', product: SEED_PRODUCTS[6], size: 'M', color: 'Donkerblauw', quantity: 1 },
    ],
    transportMode: 'air', status: 'QC Foto\'s Goedgekeurd',
    milestones: buildMilestones('QC Foto\'s Goedgekeurd'),
    productCostEur: 38.20, chinaHandlingEur: 4.80, freightEur: 22.50, dutyEur: 4.86,
    postnlCostEur: 4.50, platformMarginEur: 14.00, communityFundDeposit: 4.20, totalEur: 89.06,
    savedEur: 18.50, personalDeposit: 4.20, hasReturned: false,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    internalBarcode: generateBarcode(),
    qcPhotos: [
      { id: 'qc-2-1', url: 'https://images.pexels.com/photos/4226791/pexels-photo-4226791.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'QC foto 1 - Keukengerei gecontroleerd' },
    ],
  },
  {
    id: 'order-3', orderNumber: generateOrderNumber(),
    customerName: 'Fatima El Idrissi', customerEmail: 'fatima.elidrissi@example.nl', customerPhone: '0623456789',
    address: 'Boswachterstraat 8', postalCode: '5621 AK', city: 'Eindhoven',
    deliveryType: 'home', paymentMethod: 'Klarna',
    items: [
      { id: 'ci-13', product: SEED_PRODUCTS[5], size: 'L', color: 'Beige', quantity: 1 },
      { id: 'ci-14', product: SEED_PRODUCTS[7], size: 'L', color: 'Zwart', quantity: 2 },
      { id: 'ci-15', product: SEED_PRODUCTS[6], size: 'S', color: 'Lichtblauw', quantity: 1 },
      { id: 'ci-16', product: SEED_PRODUCTS[11], size: '40x40cm', color: 'Grijs', quantity: 1 },
      { id: 'ci-17', product: SEED_PRODUCTS[14], size: 'Standaard', color: 'Goud', quantity: 1 },
      { id: 'ci-18', product: SEED_PRODUCTS[15], size: '750ml', color: 'Groen', quantity: 1 },
    ],
    transportMode: 'train', status: 'Bezorgd',
    milestones: buildMilestones('Bezorgd'),
    productCostEur: 45.30, chinaHandlingEur: 5.50, freightEur: 9.80, dutyEur: 4.41,
    postnlCostEur: 4.50, platformMarginEur: 14.00, communityFundDeposit: 5.05, totalEur: 88.56,
    savedEur: 21.40, personalDeposit: 5.05, hasReturned: true,
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    internalBarcode: generateBarcode(),
    qcPhotos: [
      { id: 'qc-3-1', url: 'https://images.pexels.com/photos/4226791/pexels-photo-4226791.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'QC foto 1 - Kleding gecontroleerd' },
      { id: 'qc-3-2', url: 'https://images.pexels.com/photos/4226803/pexels-photo-4226803.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'QC foto 2 - Opbergpoef gecontroleerd' },
    ],
  },
];

export const SEED_RETURN_FUND_ENTRIES: ReturnFundEntry[] = [
  { id: 'rf-1', orderId: 'order-1', type: 'inflow', amount: 3.85, description: 'Inleg order CHINED-2026', date: new Date(Date.now() - 20 * 86400000).toISOString(), isClothing: false },
  { id: 'rf-2', orderId: 'order-2', type: 'inflow', amount: 4.20, description: 'Inleg order CHINED-2026', date: new Date(Date.now() - 8 * 86400000).toISOString(), isClothing: false },
  { id: 'rf-3', orderId: 'order-3', type: 'inflow', amount: 5.05, description: 'Inleg order CHINED-2026', date: new Date(Date.now() - 35 * 86400000).toISOString(), isClothing: false },
  { id: 'rf-4', orderId: 'order-3', type: 'depreciation', amount: 2.50, description: 'Afschrijving retour kledingstuk - inspectie & herverpakking', date: new Date(Date.now() - 25 * 86400000).toISOString(), isClothing: true },
];

export { DEMO_LINKS };
