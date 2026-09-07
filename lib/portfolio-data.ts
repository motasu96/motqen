export const SITE = {
  name: "EMERALD",
  fullName: "EMERALD — ما وراء الواقع",
  tagline: "رؤية إنسانية. إمكانيات اصطناعية.",
  description:
    "معرض أعمال سينمائي لمبدع فيديوهات الذكاء الاصطناعي والتصميم الرقمي — رؤية يقودها إنسان، تتجسّد عبر إمكانيات اصطناعية.",
  url: "https://emerald.example",
  email: "studio@emerald.example",
  social: [
    { label: "Instagram", href: "https://instagram.com/emerald.studio" },
    { label: "Vimeo", href: "https://vimeo.com/emerald.studio" },
    { label: "LinkedIn", href: "https://linkedin.com/company/emerald-studio" },
  ],
} as const;

export interface NavItem {
  id: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "studio", label: "الاستوديو" },
  { id: "visions", label: "رؤى مختارة" },
  { id: "design", label: "بُعد التصميم" },
  { id: "process", label: "منهج العمل" },
  { id: "services", label: "الخدمات" },
  { id: "contact", label: "تواصل" },
];

export interface StudioStat {
  value: string;
  label: string;
}

export const STUDIO: {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  stats: StudioStat[];
} = {
  eyebrow: "الاستوديو / نبذة",
  heading: "رؤية واحدة، تُدار عبر أدوات اصطناعية.",
  paragraphs: [
    "إيميرالد هي ممارسة مبدع واحد يعمل عند تقاطع الحركة المولّدة بالذكاء الاصطناعي والتصميم البصري التقليدي. كل لقطة تبدأ بقرار إنساني — مزاج، قيد، مرجع — قبل أن يُخرج أي نموذج بكسلاً واحداً.",
    "يتنقّل العمل بين تخصصين: مقاطع فيديو سينمائية قصيرة مبنية من لقطات توليدية، وأنظمة تصميم ثابتة مصنوعة يدوياً. كلاهما يخضع لنفس المعيار — الانضباط والضوء والإيقاع، لا البهرجة.",
    "\"ما وراء الواقع\" ليست ادّعاءً عن الأدوات. إنها ادّعاء عن العين التي تديرها.",
  ],
  stats: [
    { value: "+40", label: "دراسة فيلم توليدية" },
    { value: "5", label: "سنوات في الحركة والتصميم" },
    { value: "12", label: "استوديو وعلامة تم التعاون معها" },
  ],
};

export type VisionCategory =
  | "شذرات سردية"
  | "حركة منتج"
  | "دراسات تجريدية"
  | "أفلام العلامة";

export interface Vision {
  id: string;
  category: VisionCategory;
  title: string;
  description: string;
  duration: string;
  poster: string;
  video: string;
  tags: string[];
}

export const VISIONS: Vision[] = [
  {
    id: "narrative-fragments",
    category: "شذرات سردية",
    title: "شذرات من غرفة لا وجود لها",
    description:
      "دراسة قصيرة في فضاءات داخلية مولّدة — ضوء يتصرف كما تتذكره الذاكرة، لا كما سقط فعلاً.",
    duration: "0:08",
    poster: "/images/vision-narrative-fragments.webp",
    video: "/motion/vision-narrative-fragments.mp4",
    tags: ["فيلم توليدي", "دراسة داخلية", "تصور مبدئي"],
  },
  {
    id: "product-motion",
    category: "حركة منتج",
    title: "أشياء ساكنة، مدروسة بعناية",
    description:
      "حركة قريبة من عالم المنتجات، مبنية بالكامل من لقطات اصطناعية — شكل وخامة تُدرس تحت ضوء صناعي.",
    duration: "0:08",
    poster: "/images/vision-product-motion.webp",
    video: "/motion/vision-product-motion.mp4",
    tags: ["فيلم توليدي", "دراسة منتج", "تصور مبدئي"],
  },
  {
    id: "abstract-studies",
    category: "دراسات تجريدية",
    title: "إشارة قبل المعنى",
    description:
      "حركة وملمس خالصان، تم توليدهما وإعادة تركيبهما حتى تتوقف الصورة عن وصف أي شيء سوى ذاتها.",
    duration: "0:08",
    poster: "/images/vision-abstract-studies.webp",
    video: "/motion/vision-abstract-studies.mp4",
    tags: ["فيلم توليدي", "دراسة ملمس", "تصور مبدئي"],
  },
  {
    id: "brand-films",
    category: "أفلام العلامة",
    title: "علامة، تُمنح ثِقلاً",
    description:
      "مقاربة تصورية لكيفية عيش شعار علامة تجارية داخل عالم مولّد — النبرة قبل الطباعة.",
    duration: "0:08",
    poster: "/images/vision-brand-films.webp",
    video: "/motion/vision-brand-films.mp4",
    tags: ["فيلم توليدي", "دراسة علامة", "تصور مبدئي"],
  },
];

export type DesignCategory =
  | "هوية بصرية"
  | "تحرير"
  | "لقطات ثابتة"
  | "طباعة"
  | "أنظمة";

export interface DesignWork {
  id: string;
  title: string;
  category: DesignCategory;
  image: string;
  description: string;
  span: "tall" | "wide" | "square";
}

export const DESIGN_CATEGORIES: DesignCategory[] = [
  "هوية بصرية",
  "تحرير",
  "لقطات ثابتة",
  "طباعة",
  "أنظمة",
];

export const DESIGN_WORKS: DesignWork[] = [
  {
    id: "emerald-marque",
    title: "شعار لضوء اصطناعي",
    category: "هوية بصرية",
    image: "/images/design-emerald-marque.webp",
    description:
      "دراسة هوية تصورية تستكشف مصدر ضوء زمردي واحد كوحدة بصرية أساسية للعلامة.",
    span: "tall",
  },
  {
    id: "editorial-spread",
    title: "صفحة تحريرية — ما وراء الواقع",
    category: "تحرير",
    image: "/images/design-editorial-spread.webp",
    description:
      "تخطيط تحريري هادئ تقوده الصورة، مصمم ليترك اللقطات المولّدة تتنفس دون نص منافس.",
    span: "wide",
  },
  {
    id: "frame-study-01",
    title: "دراسة إطار 01",
    category: "لقطات ثابتة",
    image: "/images/design-frame-study-01.webp",
    description: "إطار واحد من تتابع توليدي أطول، يُعامل كتكوين مستقل بذاته.",
    span: "square",
  },
  {
    id: "type-system",
    title: "نظام طباعي لصوتين",
    category: "طباعة",
    image: "/images/design-type-system.webp",
    description:
      "إقران خط إنساني عريض مع خط أحادي المسافة وظيفي — أحدهما للإحساس، والآخر للبنية.",
    span: "square",
  },
  {
    id: "grid-system",
    title: "نظام الشبكة والإيقاع",
    category: "أنظمة",
    image: "/images/design-grid-system.webp",
    description:
      "شبكة التخطيط الأساسية المستخدمة عبر هذا المعرض، مكشوفة هنا كعمل تصميمي بحد ذاته.",
    span: "wide",
  },
  {
    id: "frame-study-02",
    title: "دراسة إطار 02",
    category: "لقطات ثابتة",
    image: "/images/design-frame-study-02.webp",
    description:
      "إطار ثانٍ محفوظ، يُقرن بالأول لدراسة كيف يمكن لتتابع توليدي واحد أن يحمل مزاجين مختلفين.",
    span: "tall",
  },
];

export interface ProcessStage {
  index: string;
  title: string;
  description: string;
  detail: string;
}

export const PROCESS_STAGES: ProcessStage[] = [
  {
    index: "01",
    title: "التوجيه",
    description: "كل عمل يبدأ بنية مكتوبة، لا بمجرد أمر (prompt).",
    detail:
      "يتم تحديد المزاج والمرجع والقيد ومعايير الرفض قبل أي عملية توليد. هنا يعيش نصف الممارسة الذي تقوده الرؤية الإنسانية.",
  },
  {
    index: "02",
    title: "التوليد",
    description: "تُستخدم نماذج ومحاولات متعددة للبحث، لا للإنهاء.",
    detail:
      "يتم إنتاج عشرات المحاولات التوليدية لكل فكرة. تُستبعد معظمها. الهدف هو مادة خام، لا إطار نهائي.",
  },
  {
    index: "03",
    title: "الانتقاء",
    description: "العين هي من تختار. النموذج لا يقرر أبداً ما هو المكتمل.",
    detail:
      "تُراجَع الإطارات والتتابعات المختارة مقابل التوجيه الأصلي — يُفحص اللون والإيقاع والانضباط يدوياً، واحداً تلو الآخر.",
  },
  {
    index: "04",
    title: "التركيب",
    description: "الحرفة التقليدية تُنهي ما بدأه التوليد.",
    detail:
      "تُطبَّق المعايرة اللونية والتوقيت والطباعة والتخطيط بأدوات تقليدية. هنا يلتقي الاصطناعي باليدوي، في القَصّ النهائي.",
  },
];

export interface Service {
  id: string;
  title: string;
  summary: string;
  deliverables: string[];
  timeline: string;
}

export const SERVICES: Service[] = [
  {
    id: "ai-video-direction",
    title: "إخراج فيديو بالذكاء الاصطناعي",
    summary:
      "إخراج كامل لفيلم توليدي قصير — من الفكرة المكتوبة إلى القَصّ النهائي المعاير لونياً.",
    deliverables: [
      "توجيه إبداعي مكتوب ولوحة مراجع",
      "استكشاف توليدي عبر محاولات متعددة",
      "مونتاج منتقى ومعايرة لونية وتوقيت صوتي",
      "تسليم بنسب عرض مناسبة للويب والسوشيال ميديا",
    ],
    timeline: "2–4 أسابيع",
  },
  {
    id: "motion-design",
    title: "تصميم الحركة (موشن غرافيك)",
    summary:
      "رسوم متحركة تقليدية تُضاف فوق أو بجانب لقطات توليدية للوصول إلى نتيجة نهائية ذات هوية.",
    deliverables: [
      "تحريك الطباعة والشعار",
      "انتقالات وتركيب مشاهد",
      "تكييف الصيغة للويب والسوشيال ميديا والعروض التقديمية",
    ],
    timeline: "1–3 أسابيع",
  },
  {
    id: "brand-visual-systems",
    title: "أنظمة الهوية البصرية",
    summary:
      "لغة بصرية متماسكة — لوحة ألوان وطباعة وتوجيه بصري — مصممة لتحتضن العمل الثابت والمتحرك معاً.",
    deliverables: [
      "نظام الألوان والطباعة والشبكة",
      "تطبيقات نموذجية عبر الطباعة والشاشة",
      "إرشادات لاستخدام الصور التوليدية بما يتوافق مع الهوية",
    ],
    timeline: "3–5 أسابيع",
  },
  {
    id: "concept-art-stills",
    title: "لقطات ورسوم تصورية",
    summary:
      "لقطات مولّدة مستقلة، موجَّهة فنياً ومنتهية للاستخدام كصور رئيسية أو أغلفة أو مرئيات حملات.",
    deliverables: [
      "استكشاف تصوري وتوجيه المزاج",
      "لقطات نهائية منتقاة ومُنقّحة",
      "طبقات المصدر لإعادة الاستخدام الداخلي",
    ],
    timeline: "1–2 أسبوع",
  },
  {
    id: "creative-consulting",
    title: "استشارات إبداعية",
    summary:
      "دعم استشاري للاستوديوهات والفرق التي تبني آليات عمل خاصة بها للفيديو التوليدي أو التصميم.",
    deliverables: [
      "مراجعة آلية العمل والأدوات",
      "تدريب على التوجيه وصياغة الأوامر (prompt-craft)",
      "مراجعة مستمرة للعمل قيد التنفيذ",
    ],
    timeline: "مستمر / حسب الاتفاق",
  },
];

export const CONTACT_COPY = {
  eyebrow: "تواصل",
  heading: "ابدأ بتوجيه، لا بمُخرَج جاهز.",
  description:
    "أخبرني بما تريد أن يشعر به الناس. المواعيد والصيغ والأدوات تأتي بعد ذلك.",
  successTitle: "تم الإرسال.",
  successMessage:
    "شكراً لك — تم استلام رسالتك. الرد عادة ما يصل خلال يومي عمل.",
  errorTitle: "لم يتم الإرسال.",
  errorMessage:
    "لم تُحفظ الرسالة. كل ما كتبته لا يزال موجوداً — يرجى المحاولة مرة أخرى بعد قليل.",
} as const;
