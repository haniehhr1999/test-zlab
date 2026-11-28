export type PartInfo = {
  id: string;
  title: string;
  description: string;
};

const PARTS: PartInfo[] = [
  {
    id: "Port_PoE_1",
    title: "پورت PoE ۱",
    description: "اتصال اترنت با قابلیت Power over Ethernet",
  },
  {
    id: "Port_PoE_2",
    title: "پورت PoE ۲",
    description: "اتصال اترنت با قابلیت Power over Ethernet",
  },
  {
    id: "Port_USB_A",
    title: "پورت USB-A",
    description: "خروجی USB برای تغذیه یا ارتباط جانبی",
  },
  {
    id: "Voltage_Selector",
    title: "سلکتور ولتاژ",
    description: "انتخاب خروجی ۵ ولت، ۹ ولت یا ۱۲ ولت",
  },
  {
    id: "Port_DC_OUT",
    title: "خروجی DC",
    description: "جک خروجی تغذیه DC دستگاه",
  },
  {
    id: "Port_DC_IN",
    title: "ورودی DC",
    description: "جک ورودی شارژ / تغذیه اصلی",
  },
  {
    id: "Output_MCU_ESP32_Style",
    title: "ماژول ESP32",
    description: "واحد کنترلر با شیلد RF و هدرهای ارتباطی",
  },
  {
    id: "Output_Buck_Converter",
    title: "مبدل باک",
    description: "مبدل کاهنده ولتاژ با سلف حلقوی مسی",
  },
  {
    id: "Output_Secondary_Converter",
    title: "مبدل ثانویه",
    description: "مبدل کمکی برای ریل‌های ولتاژ خروجی",
  },
  {
    id: "Output_Purple_Breakout",
    title: "برد بریک‌اوت",
    description: "ماژول بنفش رابط سیگنال و پسیوها",
  },
  {
    id: "Output_Green_Terminal",
    title: "ترمینال سبز خروجی",
    description: "ترمینال پیچی اتصال سیم خروجی",
  },
  {
    id: "Output_Semiconductor",
    title: "نیمه‌هادی خروجی",
    description: "ترانزیستور / آی‌سی سوئیچینگ روی برد خروجی",
  },
  {
    id: "Output_Green_Jumper",
    title: "جامپر سبز",
    description: "سیم‌کشی نقطه‌به‌نقطه روی برد خروجی",
  },
  {
    id: "Output_Red_Jumper",
    title: "جامپر قرمز",
    description: "مسیر تغذیه / سیگنال قرمز روی برد خروجی",
  },
  {
    id: "Output_Harness_End",
    title: "مهار سیم",
    description: "انتهای دسته سیم اتصال بین بردها",
  },
  {
    id: "Charger_Daughterboard",
    title: "برد کنترل شارژ",
    description: "ماژول CTRL مدیریت شارژ و مانیتورینگ",
  },
  {
    id: "Charger_Inductor_4R7",
    title: "سلف ۴R۷",
    description: "سلف قدرت مدار شارژر",
  },
  {
    id: "Charger_Trimmer",
    title: "تریمر تنظیم",
    description: "پتانسیومتر آبی برای کالیبراسیون شارژ",
  },
  {
    id: "Charger_Terminal",
    title: "ترمینال آبی شارژر",
    description: "ترمینال پیچی ورودی/خروجی برد شارژ",
  },
  {
    id: "Charger_Capacitor",
    title: "خازن شارژر",
    description: "خازن الکترولیت فیلتر و ذخیره انرژی",
  },
  {
    id: "Charger_Semiconductor",
    title: "نیمه‌هادی شارژر",
    description: "آی‌سی یا ترانزیستور مدار مدیریت قدرت",
  },
  {
    id: "Charger_Indicator",
    title: "اندیکاتور شارژ",
    description: "نشانگر وضعیت روی برد شارژر",
  },
  {
    id: "Charger_Left_Header",
    title: "هدر چپ",
    description: "کانکتور پین برد دختر شارژر",
  },
  {
    id: "Charger_Right_Header",
    title: "هدر راست",
    description: "کانکتور پین برد دختر شارژر",
  },
  {
    id: "Charger_Pin_Label",
    title: "لیبل سیگنال‌ها",
    description: "برچسب نام پایه‌ها مثل VFB، ISNS، STAT",
  },
  {
    id: "Charger_Wire",
    title: "سیم‌کشی شارژر",
    description: "مسیرهای سیم نقطه‌به‌نقطه روی پرف‌بورد",
  },
  {
    id: "Charger_Header_Jumper",
    title: "جامپر هدر",
    description: "سیم‌های رابط بین هدرها",
  },
  {
    id: "Charger_Red_Bus",
    title: "باس قرمز",
    description: "مسیر تغذیه قرمز روی برد شارژر",
  },
  {
    id: "Charger_Solder_Joints",
    title: "اتصالات لحیم",
    description: "نقاط لحیم اطراف برد و انتهای سیم‌ها",
  },
  {
    id: "PCB_Charger",
    title: "برد شارژر",
    description: "پرف‌بورد قهوه‌ای مدیریت شارژ و قدرت",
  },
  {
    id: "PCB_Output",
    title: "برد خروجی",
    description: "برد سبز کنترلر، مبدل‌ها و خروجی‌ها",
  },
  {
    id: "Cell_",
    title: "سلول ۱۸۶۵۰",
    description: "باتری لیتیوم‌یون پک انرژی دستگاه",
  },
  {
    id: "Battery_Retainer",
    title: "نگه‌دارنده باتری",
    description: "ریل نگه‌دارنده سلول‌های باتری",
  },
  {
    id: "Battery_Pack",
    title: "پک باتری",
    description: "هشت سلول ۱۸۶۵۰ به‌صورت آرایه‌ای",
  },
  {
    id: "Status_LED",
    title: "LED وضعیت",
    description: "چراغ‌های وضعیت روی درب دستگاه",
  },
  {
    id: "Lid_Shell",
    title: "درب کیس",
    description: "پوشش بالایی ABS گرافیتی",
  },
  {
    id: "Case_Top",
    title: "درب بالایی",
    description: "مجموعه درب و LEDهای وضعیت",
  },
  {
    id: "Bottom_Plate",
    title: "کف کیس",
    description: "صفحه پایینی بدنه دستگاه",
  },
  {
    id: "Side_Walls",
    title: "دیواره کیس",
    description: "دیواره‌های جانبی بدنه ABS",
  },
  {
    id: "Front_Panel_Cutouts",
    title: "پنل جلو",
    description: "جلوی کیس با برش محل پورت‌ها",
  },
  {
    id: "Front_Legends",
    title: "برچسب پورت‌ها",
    description: "علائم ۵V / ۹V / ۱۲V و IN / OUT",
  },
  {
    id: "Rubber_Foot",
    title: "پایه لاستیکی",
    description: "پایه‌های ضدلغزش زیر دستگاه",
  },
  {
    id: "Case_Bottom",
    title: "بدنه پایینی",
    description: "کف، دیواره‌ها و پایه‌های دستگاه",
  },
  {
    id: "Ports",
    title: "پورت‌های جلو",
    description: "مجموعه کانکتورهای پنل جلویی",
  },
];

/** Longer / more specific ids first so nested meshes resolve correctly. */
const SORTED = [...PARTS].sort((a, b) => b.id.length - a.id.length);

export function resolvePartInfo(name: string): PartInfo | null {
  if (!name) return null;

  if (/^Cell_\d{2}/.test(name)) {
    const n = name.match(/^Cell_(\d{2})/)?.[1] ?? "";
    return {
      id: `Cell_${n}`,
      title: `سلول ۱۸۶۵۰ · ${Number(n)}`,
      description: "باتری لیتیوم‌یون پک انرژی دستگاه",
    };
  }

  if (/^Status_LED_\d{2}/.test(name) || name === "Status_LED") {
    const n = name.match(/Status_LED_(\d{2})/)?.[1];
    return {
      id: name,
      title: n ? `LED وضعیت · ${Number(n)}` : "LED وضعیت",
      description: "چراغ وضعیت روی درب دستگاه",
    };
  }

  for (const part of SORTED) {
    if (name === part.id || name.startsWith(part.id)) {
      return part;
    }
  }

  return null;
}

export function resolvePartFromObject(object: {
  name: string;
  parent: unknown;
}): PartInfo | null {
  let current: { name: string; parent: unknown } | null = object;
  while (current) {
    const info = resolvePartInfo(current.name);
    if (info) return info;
    current = current.parent as { name: string; parent: unknown } | null;
  }
  return null;
}
