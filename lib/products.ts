export type ProductCategory =
  | "Mining & Industry"
  | "Robotics"
  | "Energy & Networking"
  | "Mobility & Safety"
  | "Retail & Finance"
  | "Mining & Mineral Industries";

export type ExplodeAxis = "x" | "y" | "z";

export type ExplodeTarget = {
  name: string;
  axis: ExplodeAxis;
  distance: number;
};

export type ProductPartInfo = {
  id: string;
  title: string;
  description: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  titleFa: string;
  category: ProductCategory;
  description: string;
  descriptionFa: string;
  tags: string[];
  modelUrl: string;
  /** Special handling for the detailed Mini UPS model */
  viewer: "mini-ups" | "generic";
  camera: { position: [number, number, number]; fov?: number };
  explode?: ExplodeTarget[];
  parts?: ProductPartInfo[];
  zlabUrl: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "mini-ups",
    slug: "mini-ups",
    title: "Mini DC UPS",
    titleFa: "مینی DC UPS",
    category: "Energy & Networking",
    description:
      "A compact DC UPS with an 82 Wh Li-ion battery that keeps modems, routers and IP cameras running through power outages, with four independent outputs in one unit.",
    descriptionFa:
      "یو‌پی‌اس جمع‌وجور DC با باتری ۸۲ وات‌ساعت برای نگه داشتن مودم، روتر و دوربین در قطعی برق، با چند خروجی مستقل.",
    tags: ["Power Electronics", "Power Path", "USB-C PD"],
    modelUrl: "/models/mini-ups.glb",
    viewer: "mini-ups",
    camera: { position: [0.24, 0.16, 0.3], fov: 34 },
    zlabUrl: "https://z-lab.ir/projects/mini-dc-ups",
  },
  {
    id: "connected-worker-smart-safety-helmet",
    slug: "connected-worker-smart-safety-helmet",
    title: "Connected Worker – Smart Safety Helmet",
    titleFa: "کلاه ایمنی هوشمند کارگر متصل",
    category: "Mining & Industry",
    description:
      "Add-on helmet and wristband that track gases, vitals, falls and worker location, with instant alerts to a control dashboard.",
    descriptionFa:
      "کلاه و دستبند پوشیدنی برای پایش گاز، علائم حیاتی، سقوط و موقعیت کارگر با هشدار فوری به داشبورد.",
    tags: ["IoT", "Wearables"],
    modelUrl: "/models/connected-worker-smart-safety-helmet.glb",
    viewer: "generic",
    camera: { position: [0.45, 0.28, 0.45], fov: 35 },
    explode: [
      { name: "Helmet_Shell", axis: "x", distance: -0.08 },
      { name: "ZGARD_Addon", axis: "y", distance: 0.07 },
      { name: "Wristband", axis: "x", distance: 0.1 },
    ],
    parts: [
      { id: "Helmet_Shell", title: "کلاه ایمنی", description: "پوسته زرد کلاه با لبه و تقویت‌کننده‌ها" },
      { id: "ZGARD_Addon", title: "ماژول Z.GARD", description: "افزونه قرمز سنسور، چراغ و دکمه اضطراری" },
      { id: "Wristband", title: "دستبند", description: "دستبند سفید با نمایشگر OLED و سنسور نبض" },
    ],
    zlabUrl: "https://z-lab.ir/projects/connected-worker-smart-safety-helmet",
  },
  {
    id: "smart-excavator",
    slug: "smart-excavator",
    title: "Smart Excavator",
    titleFa: "بیل مکانیکی هوشمند",
    category: "Mining & Industry",
    description:
      "Camera-based fragmentation analysis and missing-tooth detection during loading.",
    descriptionFa:
      "تحلیل خردایش سنگ و تشخیص دندانه‌های گم‌شده بابینایی ماشین هنگام بارگیری.",
    tags: ["Computer Vision", "Deep Learning"],
    modelUrl: "/models/smart-excavator.glb",
    viewer: "generic",
    camera: { position: [5.2, 3.4, 5.8], fov: 38 },
    explode: [
      { name: "Track_Base", axis: "y", distance: -0.35 },
      { name: "Upper_Carriage", axis: "y", distance: 0.55 },
      { name: "Boom", axis: "z", distance: -0.8 },
      { name: "Stick", axis: "z", distance: -0.55 },
      { name: "Bucket", axis: "z", distance: -0.45 },
    ],
    parts: [
      { id: "Track_Base", title: "شاسی شنی", description: "زیرسازی و سیستم حرکت بیل مکانیکی" },
      { id: "Upper_Carriage", title: "کابین و موتور", description: "بخش بالایی شامل کابین و محفظه موتور" },
      { id: "Boom", title: "بوم", description: "بازو اصلی هیدرولیکی" },
      { id: "Stick", title: "استیک", description: "بازو ثانویه متصل به باکت" },
      { id: "Bucket", title: "باکت", description: "محفظه بارگیری با دندانه‌های هوشمند" },
      { id: "Tooth_", title: "دندانه", description: "دندانه فولادی با هایلایت تشخیص نبودن" },
    ],
    zlabUrl: "https://z-lab.ir/projects/smart-excavator",
  },
  {
    id: "truck-cargo-volume-estimation",
    slug: "truck-cargo-volume-estimation",
    title: "Truck Cargo Volume Estimation",
    titleFa: "تخمین حجم بار کامیون",
    category: "Mining & Industry",
    description:
      "Contactless measurement of truck cargo volume as it passes a LiDAR gate, comparing the estimated mass with the weighbridge.",
    descriptionFa:
      "اندازه‌گیری غیرتماسی حجم بار کامیون با دروازه LiDAR و مقایسه با باسکول.",
    tags: ["2D LiDAR", "Point-Cloud", "3D Registration"],
    modelUrl: "/models/truck-cargo-volume-estimation.glb",
    viewer: "generic",
    camera: { position: [7, 4.5, 8], fov: 40 },
    explode: [
      { name: "Haul_Truck", axis: "z", distance: 1.2 },
      { name: "Measurement_Gate", axis: "y", distance: 0.8 },
      { name: "Scan_Planes", axis: "y", distance: 0.4 },
    ],
    parts: [
      { id: "Haul_Truck", title: "کامیون معدنی", description: "کامیون حمل بار با اتاق و بارگیر" },
      { id: "Cargo_Bed", title: "اتاق بار", description: "محفظه حمل سنگ و مواد معدنی" },
      { id: "Measurement_Gate", title: "دروازه اندازه‌گیری", description: "سازه دروازه LiDAR برای اسکن عبوری" },
      { id: "Scan_Planes", title: "صفحه اسکن", description: "صفحات مجازی اسکن حجم بار" },
    ],
    zlabUrl: "https://z-lab.ir/projects/truck-cargo-volume-estimation",
  },
  {
    id: "drone-mine-monitoring",
    slug: "drone-mine-monitoring",
    title: "Drone Mine Monitoring & 3D Modeling",
    titleFa: "پایش معدنی با پهپاد",
    category: "Mining & Industry",
    description:
      "Automated drone surveys for change detection, stockpile volumes and mineral classification, plus 3D mine models.",
    descriptionFa:
      "نقشه‌برداری خودکار پهپادی برای تشخیص تغییرات، حجم دپو و مدل سه‌بعدی معدن.",
    tags: ["Photogrammetry", "AI", "3D Modeling"],
    modelUrl: "/models/drone-mine-monitoring.glb",
    viewer: "generic",
    camera: { position: [4.2, 3.2, 4.5], fov: 40 },
    explode: [
      { name: "Survey_Drone", axis: "y", distance: 0.7 },
      { name: "Mine_Terrain", axis: "y", distance: -0.25 },
      { name: "Survey_Grid", axis: "y", distance: 0.35 },
    ],
    parts: [
      { id: "Survey_Drone", title: "پهپاد نقشه‌برداری", description: "بدنه، باتری، موتورها و روتورها" },
      { id: "Mine_Terrain", title: "زمین معدن", description: "سطح و دپوهای مواد معدنی" },
      { id: "Stockpile_", title: "دپو", description: "توده سنگ با خط حجم‌سنجی" },
      { id: "Survey_Grid", title: "شبکه پیمایش", description: "شبکه مسیر نقشه‌برداری" },
    ],
    zlabUrl: "https://z-lab.ir/projects/drone-mine-monitoring",
  },
  {
    id: "predictive-maintenance-petrochemical-assets",
    slug: "predictive-maintenance-petrochemical-assets",
    title: "Predictive Maintenance for Petrochemical Assets",
    titleFa: "نگهداری پیش‌بینانه پتروشیمی",
    category: "Mining & Industry",
    description:
      "Multi-sensor AI monitoring of compressors and centrifuges for anomaly detection and trip prevention.",
    descriptionFa:
      "پایش چندسنسوره AI روی کمپرسور و سانتریفیوژ برای تشخیص ناهنجاری و جلوگیری از توقف.",
    tags: ["Machine Learning", "IoT"],
    modelUrl: "/models/predictive-maintenance-petrochemical-assets.glb",
    viewer: "generic",
    camera: { position: [3.8, 2.4, 3.8], fov: 38 },
    explode: [
      { name: "Compressor_Skid", axis: "x", distance: -0.55 },
      { name: "HDPE_Centrifuge", axis: "x", distance: 0.7 },
    ],
    parts: [
      { id: "Compressor", title: "کمپرسور", description: "پوسته اصلی کمپرسور روی اسکید" },
      { id: "Drive_Motor", title: "موتور محرک", description: "موتور الکتریکی متصل به کمپرسور" },
      { id: "Sensor_", title: "سنسور وضعیت", description: "سنسور پایش ارتعاش / شرایط" },
      { id: "HDPE_Centrifuge", title: "سانتریفیوژ", description: "واحد سانتریفیوژ با سنسور وضعیت" },
    ],
    zlabUrl: "https://z-lab.ir/projects/predictive-maintenance-petrochemical-assets",
  },
  {
    id: "autonomous-mobile-robot",
    slug: "autonomous-mobile-robot",
    title: "Autonomous Mobile Robot (AMR)",
    titleFa: "ربات متحرک خودران (AMR)",
    category: "Robotics",
    description:
      "ROS 2 robot with LiDAR SLAM that carries up to 45 kg between stations without fixed paths.",
    descriptionFa:
      "ربات ROS 2 با LiDAR SLAM برای حمل تا ۴۵ کیلوگرم بین ایستگاه‌ها بدون مسیر ثابت.",
    tags: ["ROS 2", "SLAM"],
    modelUrl: "/models/autonomous-mobile-robot.glb",
    viewer: "generic",
    camera: { position: [0.7, 0.45, 0.75], fov: 35 },
    explode: [
      { name: "Top_Tray", axis: "y", distance: 0.12 },
      { name: "Battery_Pack", axis: "x", distance: -0.1 },
      { name: "Main_Control_PCB", axis: "x", distance: 0.12 },
      { name: "Sensor_Brace", axis: "y", distance: 0.06 },
      { name: "Emergency_Stop", axis: "z", distance: -0.08 },
    ],
    parts: [
      { id: "Chassis", title: "شاسی", description: "قاب فلزی، چرخ‌ها و موتورهای محرک" },
      { id: "Battery_Pack", title: "پک باتری", description: "منبع تغذیه داخلی ربات" },
      { id: "Main_Control_PCB", title: "برد کنترل", description: "برد اصلی با ESP32 و کانکتورها" },
      { id: "LiDAR_", title: "LiDAR", description: "سنسور اسکن لیزری برای SLAM" },
      { id: "Top_Tray", title: "سینی بالا", description: "سینی حمل بار تا ۴۵ کیلوگرم" },
      { id: "Emergency_Stop", title: "توقف اضطراری", description: "دکمه قرمز ایمنی" },
    ],
    zlabUrl: "https://z-lab.ir/projects/autonomous-mobile-robot",
  },
  {
    id: "humanoid-service-robot",
    slug: "humanoid-service-robot",
    title: "Humanoid Service Robot",
    titleFa: "ربات خدمت‌رسان انسان‌نما",
    category: "Robotics",
    description:
      "Persian-speaking service robot that recognizes customers, reads text and assists visitors in branches.",
    descriptionFa:
      "ربات خدمت‌رسان فارسی‌زبان برای شناسایی مشتری، خواندن متن و راهنمایی مراجعان.",
    tags: ["Conversational AI", "Computer Vision"],
    modelUrl: "/models/humanoid-service-robot.glb",
    viewer: "generic",
    camera: { position: [1.1, 0.9, 1.3], fov: 35 },
    explode: [
      { name: "Head", axis: "y", distance: 0.18 },
      { name: "Torso", axis: "y", distance: 0.05 },
      { name: "Left_Shoulder", axis: "x", distance: -0.18 },
      { name: "Right_Shoulder", axis: "x", distance: 0.18 },
      { name: "Mobile_Base", axis: "y", distance: -0.12 },
    ],
    parts: [
      { id: "Head", title: "سر", description: "واحد بینایی و تعامل با مراجع" },
      { id: "Torso", title: "تنه", description: "بدنه اصلی و پنل سینه" },
      { id: "Left_Shoulder", title: "بازو چپ", description: "شانه، آرنج و گریپر سمت چپ" },
      { id: "Right_Shoulder", title: "بازو راست", description: "شانه، آرنج و گریپر سمت راست" },
      { id: "Mobile_Base", title: "پایه متحرک", description: "شاسی چرخ‌دار حرکت ربات" },
    ],
    zlabUrl: "https://z-lab.ir/projects/humanoid-service-robot",
  },
  {
    id: "mobile-speed-enforcement-system",
    slug: "mobile-speed-enforcement-system",
    title: "Mobile Speed Enforcement System",
    titleFa: "سامانه سیار ثبت تخلف سرعت",
    category: "Mobility & Safety",
    description:
      "Ka/X-band Doppler radar platform for in-motion speed detection and violation capture.",
    descriptionFa:
      "پلتفرم رادار داپلر Ka/X برای تشخیص سرعت متحرک و ثبت تخلف.",
    tags: ["Radar", "Embedded Systems"],
    modelUrl: "/models/mobile-speed-enforcement-system.glb",
    viewer: "generic",
    camera: { position: [0.55, 0.35, 0.55], fov: 35 },
    explode: [
      { name: "Display_Unit", axis: "z", distance: -0.08 },
      { name: "Radar_Module_1", axis: "x", distance: -0.08 },
      { name: "Radar_Module_2", axis: "x", distance: 0.08 },
      { name: "Processing_Board", axis: "y", distance: 0.07 },
      { name: "Mounting_Bracket", axis: "y", distance: -0.05 },
    ],
    parts: [
      { id: "Display_Unit", title: "واحد نمایش", description: "محفظه مقاوم با LCD و کلیدها" },
      { id: "Radar_Module_", title: "ماژول رادار", description: "رادوم و آنتن داپلر" },
      { id: "Processing_Board", title: "برد پردازش", description: "PCB قرمز با پردازنده و GNSS" },
      { id: "Mounting_Bracket", title: "براکت نصب", description: "پایه نصب روی خودرو" },
    ],
    zlabUrl: "https://z-lab.ir/projects/mobile-speed-enforcement-system",
  },
  {
    id: "connected-car-platform",
    slug: "connected-car-platform",
    title: "Connected Car Platform",
    titleFa: "پلتفرم خودروی متصل",
    category: "Mobility & Safety",
    description:
      "GNSS telematics with live dashboards, fleet monitoring and driver-behavior analytics.",
    descriptionFa:
      "تلماتیکس GNSS با داشبورد زنده، پایش ناوگان و تحلیل رفتار راننده.",
    tags: ["Telematics", "IoT"],
    modelUrl: "/models/connected-car-platform.glb",
    viewer: "generic",
    camera: { position: [0.22, 0.18, 0.26], fov: 35 },
    explode: [
      { name: "Cellular_Module", axis: "y", distance: 0.035 },
      { name: "MCU_Module", axis: "y", distance: 0.05 },
      { name: "GNSS_Module", axis: "y", distance: 0.04 },
      { name: "Antenna_Module", axis: "x", distance: 0.04 },
      { name: "Power_Converter", axis: "x", distance: -0.04 },
    ],
    parts: [
      { id: "Telematics_Main_PCB", title: "برد تلماتیکس", description: "برد اصلی سیستم خودروی متصل" },
      { id: "Cellular_Module", title: "ماژول سلولی", description: "ماژول ارتباط موبایل" },
      { id: "MCU_Module", title: "ماژول MCU", description: "واحد پردازش مرکزی با شیلد RF" },
      { id: "GNSS_Module", title: "ماژول GNSS", description: "گیرنده موقعیت‌یابی ماهواره‌ای" },
      { id: "Antenna_Module", title: "آنتن", description: "پچ آنتن نارنجی و کواکس" },
      { id: "Power_Converter", title: "مبدل قدرت", description: "واحد تغذیه و رگولاتور" },
    ],
    zlabUrl: "https://z-lab.ir/projects/connected-car-platform",
  },
  {
    id: "z-cart-smart-shopping-cart",
    slug: "z-cart-smart-shopping-cart",
    title: "Z.Cart – Smart Shopping Cart",
    titleFa: "Z.Cart – سبد خرید هوشمند",
    category: "Retail & Finance",
    description:
      "Smart cart with camera and weight-based product recognition and on-cart payment.",
    descriptionFa:
      "سبد هوشمند با دوربین و تشخیص محصول بر اساس وزن و پرداخت روی سبد.",
    tags: ["Computer Vision", "IoT"],
    modelUrl: "/models/z-cart-smart-shopping-cart.glb",
    viewer: "generic",
    camera: { position: [1.6, 1.3, 1.8], fov: 38 },
    explode: [
      { name: "Touchscreen_Assembly", axis: "y", distance: 0.25 },
      { name: "Front_Sensor_Bar", axis: "z", distance: -0.2 },
      { name: "Basket", axis: "y", distance: 0.12 },
      { name: "MPOS", axis: "x", distance: 0.18 },
    ],
    parts: [
      { id: "Cart_Frame", title: "شاسی سبد", description: "قاب فلزی و چرخ‌ها" },
      { id: "Basket", title: "سبد", description: "سبد چوبی/سفید با لودسل وزن" },
      { id: "Touchscreen_Assembly", title: "تاچ‌اسکرین", description: "نمایشگر لمسی راهنمای خرید" },
      { id: "Front_Sensor_Bar", title: "میله سنسور جلو", description: "دوربین‌ها و LED وضعیت" },
      { id: "MPOS", title: "ترمینال پرداخت", description: "کارتخوان و NFC روی سبد" },
      { id: "Camera_", title: "دوربین", description: "دوربین تشخیص محصول" },
    ],
    zlabUrl: "https://z-lab.ir/projects/z-cart-smart-shopping-cart",
  },
  {
    id: "smart-conveyor-monitoring",
    slug: "smart-conveyor-monitoring",
    title: "Smart Conveyor Belt Monitoring",
    titleFa: "پایش هوشمند نوار نقاله",
    category: "Mining & Industry",
    description:
      "Machine vision and AI that detect oversize rocks, estimate particle sizes and analyse size distribution on conveyor belts.",
    descriptionFa:
      "بینایی ماشین برای تشخیص سنگ‌های درشت، تخمین ابعاد ذرات و پایش تجهیزات نوار نقاله.",
    tags: ["Computer Vision", "AI", "Data Analytics"],
    modelUrl: "/models/smart-conveyor-monitoring.glb",
    viewer: "generic",
    camera: { position: [4.5, 3.2, 4.8], fov: 40 },
    explode: [
      { name: "Conveyor_Camera_Gantry", axis: "y", distance: 0.55 },
      { name: "Conveyor_Belt", axis: "y", distance: 0.2 },
    ],
    parts: [
      { id: "Conveyor", title: "نوار نقاله", description: "ریل، پایه‌ها و درام‌ها" },
      { id: "Conveyor_Belt", title: "تسمه", description: "تسمه لاستیکی حمل مواد" },
      { id: "Conveyor_Camera_Gantry", title: "دروازه دوربین", description: "دوربین صنعتی و نورپردازی" },
      { id: "Mineral_Stream", title: "جریان مواد", description: "سنگ‌های معدنی روی تسمه" },
    ],
    zlabUrl: "https://z-lab.ir/projects/smart-conveyor-monitoring",
  },
  {
    id: "mine-to-plant-platform",
    slug: "mine-to-plant-platform",
    title: "Mine-to-Plant Platform",
    titleFa: "پلتفرم معدن تا کارخانه",
    category: "Mining & Mineral Industries",
    description:
      "An integrated approach to smart mining, from exploration and extraction to processing and resource management.",
    descriptionFa:
      "رویکرد یکپارچه معدن هوشمند از استخراج تا فرآوری و مدیریت منابع.",
    tags: ["Smart Mining", "Integration"],
    modelUrl: "/models/mine-to-plant-platform.glb",
    viewer: "generic",
    camera: { position: [12, 8, 12], fov: 42 },
    explode: [
      { name: "Open_Pit", axis: "x", distance: -1.2 },
      { name: "Processing_Plant", axis: "x", distance: 1.4 },
      { name: "Transfer_Line", axis: "z", distance: -1.0 },
      { name: "Mine_Haul_Truck", axis: "z", distance: 1.1 },
      { name: "Data_Integration", axis: "y", distance: 0.8 },
    ],
    parts: [
      { id: "Open_Pit", title: "معدن روباز", description: "پیت و تراس‌های استخراج" },
      { id: "Processing_Plant", title: "کارخانه فرآوری", description: "ساختمان، سیلو و واحد پردازش" },
      { id: "Transfer_Line", title: "خط انتقال", description: "نوار نقاله انتقال مواد" },
      { id: "Mine_Haul_Truck", title: "کامیون معدنی", description: "کامیون حمل در سایت" },
      { id: "Data_Integration", title: "یکپارچه‌سازی داده", description: "لینک‌های تله‌متری بین بخش‌ها" },
    ],
    zlabUrl: "https://z-lab.ir/projects/mine-to-plant-platform",
  },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0]!;
}

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getAllProductSlugs() {
  return PRODUCTS.map((p) => p.slug);
}
