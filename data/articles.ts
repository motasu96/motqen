export type ArticleTranslation = {
  title: string;
  excerpt: string;
  content: string[];
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: "الحفظ" | "التجويد" | "التربية" | "عام";
  date: string;
  readMinutes: number;
  image: string;
  content: string[];
  en: ArticleTranslation;
};

export const articles: Article[] = [
  {
    slug: "keeping-quran-after-hifz",
    image: "/images/art-keeping-hifz.jpg",
    title: "كيف تحافظ على القرآن بعد حفظه؟",
    excerpt: "خطوات عملية ومجربة للحفاظ على المحفوظ من القرآن الكريم وعدم تفلته بعد إتمام الحفظ.",
    category: "الحفظ",
    date: "2024-05-30",
    readMinutes: 6,
    content: [
      "كثير من الحفّاظ يبذلون جهدًا كبيرًا في حفظ القرآن الكريم، ثم يفاجؤون بتفلّت المحفوظ بعد فترة من التوقف عن المراجعة. والحقيقة أن الحفظ بلا مراجعة منتظمة أشبه بالبناء على غير أساس متين.",
      "من أهم الوسائل العملية لثبات الحفظ: تخصيص وقت يومي ثابت للمراجعة مهما كان قصيرًا، وربط المحفوظ بالتطبيق العملي كالصلاة به وتدبر معانيه، والانضمام إلى حلقة أو برنامج منظم يتابع مستوى الحفظ بشكل دوري.",
      "كما ننصح بتقسيم المحفوظ إلى وحدات صغيرة قابلة للمراجعة اليومية، والاستعانة بمعلم أو رفيق يسمّع معك بانتظام، فالمتابعة الخارجية من أقوى أسباب الثبات على المراجعة.",
    ],
    en: {
      title: "How to Retain the Quran After Memorizing It",
      excerpt: "Practical, tested steps to retain what you've memorized of the Holy Quran and prevent it from slipping away after completing the memorization.",
      content: [
        "Many who memorize the Quran put in great effort to memorize it, only to be surprised that what they memorized slips away after a period without review. In truth, memorization without regular review is like building on an unstable foundation.",
        "Among the most important practical means of retaining memorization: setting aside a fixed daily time for review no matter how short, linking what is memorized to practical application such as praying with it and reflecting on its meanings, and joining an organized circle or program that periodically tracks the level of memorization.",
        "We also recommend dividing what is memorized into small units suitable for daily review, and enlisting a teacher or companion to regularly listen to your recitation, as external follow-up is one of the strongest reasons for staying consistent with review.",
      ],
    },
  },
  {
    slug: "raising-kids-on-quran",
    image: "/images/art-raising-kids.jpg",
    title: "تربية الأطفال على حفظ القرآن",
    excerpt: "أساليب تربوية فعالة لغرس حب القرآن الكريم في نفوس الأطفال منذ الصغر.",
    category: "التربية",
    date: "2024-05-18",
    readMinutes: 5,
    content: [
      "غرس حب القرآن الكريم في نفوس الأطفال يبدأ من البيت قبل أي مؤسسة تعليمية، وذلك عبر القدوة العملية من الوالدين وجعل القرآن حاضرًا في الأجواء اليومية للأسرة.",
      "من الأساليب المجربة: استخدام قصص القرآن الكريم بأسلوب شيق يناسب عمر الطفل، والتحفيز بالمكافآت المعنوية قبل المادية، وتجنب الإكراه أو الضغط الزائد الذي قد ينفّر الطفل من الحفظ.",
      "كذلك يُنصح باختيار برنامج تعليمي يراعي الفروق الفردية بين الأطفال، ويجمع بين الحفظ وتعلّم آداب القرآن وأخلاقه، بحيث يكبر الطفل وهو يحب كتاب الله لا يحفظه فقط.",
    ],
    en: {
      title: "Raising Children to Memorize the Quran",
      excerpt: "Effective parenting methods for instilling love of the Holy Quran in children from an early age.",
      content: [
        "Instilling love of the Holy Quran in children begins at home before any educational institution, through the practical example of parents and by making the Quran present in the family's daily atmosphere.",
        "Tested methods include: using Quranic stories in an engaging way suited to the child's age, motivating with moral rewards before material ones, and avoiding coercion or excessive pressure that may make the child averse to memorization.",
        "It is also advisable to choose an educational program that accounts for individual differences between children, and that combines memorization with learning the manners and ethics of the Quran, so the child grows up loving the Book of Allah, not merely memorizing it.",
      ],
    },
  },
  {
    slug: "common-tilawa-mistakes",
    image: "/images/art-tilawa-mistakes.jpg",
    title: "أخطاء شائعة في تعلم التلاوة",
    excerpt: "أبرز الأخطاء التي يقع فيها المتعلمون عند تلاوة القرآن الكريم وكيفية تجنبها.",
    category: "التجويد",
    date: "2024-05-10",
    readMinutes: 4,
    content: [
      "يقع كثير من المتعلمين في أخطاء متكررة أثناء التلاوة دون أن يشعروا، من أبرزها: عدم إخراج الحروف من مخارجها الصحيحة، والتسرع في القراءة دون مراعاة أحكام المدود والغنن.",
      "من الأخطاء الشائعة أيضًا إهمال أحكام الوقف والابتداء، مما قد يغيّر المعنى المراد، وكذلك الاعتماد على الحفظ السمعي دون تعلم القواعد النظرية للتجويد.",
      "أفضل علاج لهذه الأخطاء هو التلقي المباشر من معلم متقن يصحح الأخطاء أولًا بأول، مع التدرّب على القراءة ببطء وتركيز قبل زيادة السرعة تدريجيًا.",
    ],
    en: {
      title: "Common Mistakes in Learning Recitation",
      excerpt: "The most prominent mistakes learners make when reciting the Holy Quran and how to avoid them.",
      content: [
        "Many learners fall into recurring mistakes while reciting without realizing it, the most prominent being: not articulating letters from their correct points of articulation, and rushing through the reading without observing the rules of elongation (madd) and nasalization (ghunnah).",
        "Other common mistakes include neglecting the rules of pausing and resuming, which can change the intended meaning, as well as relying on auditory memorization without learning the theoretical rules of Tajweed.",
        "The best remedy for these mistakes is direct instruction from a masterful teacher who corrects mistakes as they happen, along with practicing slow, focused reading before gradually increasing speed.",
      ],
    },
  },
  {
    slug: "virtue-of-hifz",
    image: "/images/art-virtue-hifz.jpg",
    title: "فضل حفظ القرآن وتعلمه",
    excerpt: "نصوص وأحاديث نبوية تبين عظيم أجر من تعلم القرآن الكريم وعلّمه لغيره.",
    category: "عام",
    date: "2024-05-05",
    readMinutes: 3,
    content: [
      "ورد في فضل تعلّم القرآن الكريم وتعليمه نصوص كثيرة، منها قول النبي ﷺ: «خيركم من تعلّم القرآن وعلّمه»، وهو حديث جامع يبيّن مكانة حامل القرآن بين الناس.",
      "كما أن حافظ القرآن يكون في معية القرآن يوم القيامة، وله من الأجر والرفعة ما لا يعادله عمل آخر، فضلًا عمّا يناله في الدنيا من نور في القلب وسكينة في النفس.",
      "لذلك كانت مقرأة متقن حريصة على تيسير هذا الخير العظيم للجميع، عبر برامج منظمة تجمع بين الإتقان والتيسير في تعلّم كتاب الله وتعليمه.",
    ],
    en: {
      title: "The Virtue of Memorizing and Learning the Quran",
      excerpt: "Prophetic texts and hadiths that show the great reward of one who learns the Holy Quran and teaches it to others.",
      content: [
        "Many texts have come down regarding the virtue of learning and teaching the Holy Quran, among them the saying of the Prophet ﷺ: \"The best among you are those who learn the Quran and teach it,\" a comprehensive hadith that shows the status of the bearer of the Quran among people.",
        "The one who memorizes the Quran will be in the company of the Quran on the Day of Judgment, and will have a reward and status unmatched by any other deed, not to mention what they attain in this world of light in the heart and tranquility in the soul.",
        "That is why Motqen Quran Academy is keen to make this great good accessible to everyone, through organized programs that combine mastery and ease in learning and teaching the Book of Allah.",
      ],
    },
  },
  {
    slug: "effective-revision-tips",
    image: "/images/art-revision-tips.jpg",
    title: "نصائح للمراجعة الفعالة",
    excerpt: "طرق مجربة لتنظيم وقت المراجعة اليومية والأسبوعية لضمان ثبات المحفوظ.",
    category: "الحفظ",
    date: "2024-04-28",
    readMinutes: 5,
    content: [
      "المراجعة الفعالة لا تعني بالضرورة قضاء وقت طويل، بل تنظيم الوقت المتاح بشكل ذكي. من أفضل الطرق المجربة نظام المراجعة الدائرية الذي يوزّع المحفوظ على أيام الأسبوع بشكل متكرر.",
      "يُنصح أيضًا بمراجعة المحفوظ القديم أسبوعيًا وشهريًا وليس الاكتفاء بالمحفوظ الجديد فقط، مع تسميع ما أمكن لمعلم أو زميل لضمان اكتشاف الأخطاء مبكرًا.",
      "ومن المفيد ربط المراجعة بوقت ثابت في اليوم كوقت ما بعد الفجر أو قبل النوم، حتى تتحول إلى عادة يومية راسخة لا تحتاج إلى مجهود إضافي لبدئها.",
    ],
    en: {
      title: "Tips for Effective Review",
      excerpt: "Tested methods for organizing daily and weekly review time to ensure retention of memorization.",
      content: [
        "Effective review doesn't necessarily mean spending a long time, but rather organizing the available time smartly. Among the best tested methods is the cyclical review system, which distributes what is memorized across the days of the week repeatedly.",
        "It is also advisable to review old memorization weekly and monthly, rather than limiting yourself to newly memorized material, while reciting as much as possible to a teacher or peer to ensure mistakes are caught early.",
        "It is also helpful to link review to a fixed time of day, such as after dawn prayer or before sleep, so that it becomes a firmly established daily habit that requires no extra effort to begin.",
      ],
    },
  },
  {
    slug: "tajweed-rules-simplified",
    image: "/images/art-tajweed-rules.jpg",
    title: "أحكام التجويد المبسطة للمبتدئين",
    excerpt: "شرح ميسّر لأهم أحكام التجويد التي يحتاجها كل متعلم في بداية طريقه.",
    category: "التجويد",
    date: "2024-04-20",
    readMinutes: 7,
    content: [
      "علم التجويد قد يبدو معقدًا للمبتدئين، لكنه في جوهره مجموعة قواعد بسيطة تهدف لتصحيح النطق وضبط القراءة كما نزل القرآن الكريم.",
      "من أهم الأحكام التي يبدأ بها المتعلم: أحكام النون الساكنة والتنوين (الإظهار، الإدغام، الإقلاب، الإخفاء)، وأحكام المدود الأساسية، ومعرفة مخارج الحروف الرئيسية.",
      "ننصح كل مبتدئ بعدم استعجال حفظ المصطلحات النظرية قبل التطبيق العملي مع معلم متقن، فالتجويد ملكة تُكتسب بالتلقي والتكرار أكثر من كونها معلومات تُحفظ نظريًا.",
    ],
    en: {
      title: "Simplified Tajweed Rules for Beginners",
      excerpt: "An easy explanation of the most important Tajweed rules every learner needs at the start of their journey.",
      content: [
        "The science of Tajweed may seem complex to beginners, but at its core it is a set of simple rules aimed at correcting pronunciation and ensuring recitation matches how the Holy Quran was revealed.",
        "Among the most important rules a learner begins with: the rules of the silent noon and tanween (izhar, idgham, iqlab, ikhfa), the basic rules of elongation (madd), and knowing the main points of articulation of the letters.",
        "We advise every beginner not to rush to memorize theoretical terminology before practical application with a masterful teacher, as Tajweed is a skill acquired through direct instruction and repetition more than information to be memorized theoretically.",
      ],
    },
  },
];
