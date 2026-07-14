// Exact 6-item mega menu data structure requested by the owner.
// IMPORTANT: Texts are intentionally kept exactly as provided.
// FIX: Every section now has a unique slug to avoid filter collisions.

export type MegaGroup = {
  name: string;
  sections: Array<{ name: string; slug: string; items: string[] }>;
};

export const MEGA_GROUPS: MegaGroup[] = [
  {
    name: "کالای خواب",
    sections: [
      {
        name: "روتختی و لحاف",
        slug: "bedding-sets",
        items: [
          "روتختی پنبه دوزی (دونفره / یک نفره)",
          "سرویس روتختی کلاسیک",
          "سرویس لحاف دونفره (کامل / خارجی / تک)",
          "سرویس لحاف یک نفره (کامل / خارجی / تک)",
          "لحاف هتلی (دونفره / یک نفره)",
        ],
      },
      {
        name: "ملحفه و کاور",
        slug: "pillowcases",
        items: [
          "کاور لحاف دونفره (۴ تکه / خارجی)",
          "کاور لحاف یک نفره (۳ تکه / خارجی)",
          "ملحفه دونفره (تک / ۴ تکه / نیم ست)",
          "ملحفه یک نفره (تک / ۳ تکه / سایز ۱۲۰ / نیم ست)",
          "روبالشی تخصصی",
        ],
      },
      {
        name: "بستر پایه",
        slug: "pillows",
        items: [
          "انواع تشک (طبی، مهمان، جکدار)",
          "محافظ تشک ضدآب",
          "انواع بالش (طبی، پر، الیاف)",
          "پتو (ژله ای، مسافرتی، مسافرتی ضخیم)",
        ],
      },
      {
        name: "لحاف و پتو",
        slug: "duvets",
        items: [
          "لحاف پر قو و غاز",
          "لحاف الیاف بامبو",
          "پتو سنگین‌وزن درمانی",
          "پتو سفری و مسافرتی",
        ],
      },
      {
        name: "محافظ تشک",
        slug: "mattress-protectors",
        items: [
          "محافظ تشک ضد آب",
          "محافظ بالش ضد حساسیت",
        ],
      },
    ],
  },
  {
    name: "نظم دهنده",
    sections: [
      {
        name: "مدیریت رخت خواب و لباس",
        slug: "organizers-bedding",
        items: [
          "باکس رخت خواب (شاسی دار / پارچه ای)",
          "باکس لباس (برزنتی / چند طبقه)",
          "سبد لباس چرک (حصیری / پارچه ای / تاشو)",
        ],
      },
      {
        name: "نظم دهنده های تخصصی",
        slug: "organizers-special",
        items: [
          "نظم دهنده کشو و کمد",
          "باکسهای درب دار ضد رطوبت",
        ],
      },
    ],
  },
  {
    name: "خانه و آشپزخانه",
    sections: [
      {
        name: "سفره و رومیزی",
        slug: "kitchen-table",
        items: [
          "انواع سفره (مجلسی / پلاستیکی / ضد لک)",
          "زیر سفره ای (پارچه ای / سنتی)",
          "رومیزی و ترمه لوکس",
        ],
      },
      {
        name: "منسوجات و نظافت",
        slug: "kitchen-textiles",
        items: [
          "دستمالهای تخصصی (میکروفایبر / نم گیر / آشپزخانه)",
          "ست دم کنی و پیش بند",
          "دستگیره و دستکش فر",
        ],
      },
      {
        name: "ملزومات کاربردی",
        slug: "kitchen-tools",
        items: [
          "ظروف پخت وپز",
          "ابزار و ارگانایزرهای داخل کابینت",
        ],
      },
    ],
  },
  {
    name: "دکوراسیون فرش و روفرشی",
    sections: [
      {
        name: "روفرشی (لاین استراتژیک)",
        slug: "rugs",
        items: [
          "روفرشی کشدار (جدید)",
          "روفرشی مخمل ابریشم",
          "روفرشی کلاسیک و مدرن",
        ],
      },
      {
        name: "اکسسوری دکوراتیو",
        slug: "blankets",
        items: [
          "شال مبل",
          "پافهای مدرن",
          "پرده (اتاق خواب / پذیرایی)",
          "پادری (فانتزی / آشپزخانه / ورودی)",
        ],
      },
    ],
  },
  {
    name: "حمام و سرویس بهداشتی",
    sections: [
      {
        name: "انواع حوله",
        slug: "towels-main",
        items: [
          "حوله تن پوش (مردانه / زنانه)",
          "ست حوله عروس و داماد",
          "حوله حمامی و استخری",
          "حوله دستی",
          "حوله بچه گانه",
        ],
      },
      {
        name: "اکسسوری حمام",
        slug: "towels-bathroom",
        items: [
          "ست سرویس بهداشتی (رزین / سرامیک)",
          "پادری حمام (جاذب آب)",
          "پرده حمام ضدآب",
        ],
      },
    ],
  },
  {
    name: "کودک سفر و سلامت",
    sections: [
      {
        name: "کودک و نوجوان",
        slug: "kids-travel",
        items: [
          "سرویس روتختی بچه گانه",
          "ست کاور لحاف کودک",
          "حوله و تن پوش کودک",
        ],
      },
      {
        name: "سفر و پیک نیک",
        slug: "travel",
        items: [
          "حصیر مسافرتی (ضدآب / جاجیم)",
          "زیراندازهای سفری تاشو",
          "پتو و بالش سفری",
        ],
      },
      {
        name: "سلامت و مراقبت",
        slug: "health",
        items: [
          "بالش ارتوپدی گردن و زانو",
          "بالش طبی و مموری فوم",
        ],
      },
    ],
  },
];

// Compatibility export used by shop/admin pages.
export const CATEGORIES = MEGA_GROUPS.flatMap((group) =>
  group.sections.map((section) => ({
    name: section.name,
    slug: section.slug,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80",
    subs: section.items,
  }))
);

// Kept for components that may still import this name.
export const MICRO_CATEGORIES = [] as Array<{ name: string; slug: string; search: string; image: string }>;
