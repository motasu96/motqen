"use client";

import * as Accordion from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  CONTACT_COPY,
  DESIGN_CATEGORIES,
  DESIGN_WORKS,
  NAV_ITEMS,
  PROCESS_STAGES,
  SERVICES,
  SITE,
  STUDIO,
  VISIONS,
  type DesignCategory,
  type DesignWork,
} from "@/lib/portfolio-data";
import {
  validateContact,
  type ContactField,
  type ContactFormInput,
} from "@/lib/contact-validation";
import { ParticleField } from "./particle-field";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type MotionPreference = "on" | "off";

function useMotionPreference(): [MotionPreference, () => void] {
  const [preference, setPreference] = useState<MotionPreference>("on");

  useEffect(() => {
    const stored = window.localStorage.getItem("emerald-motion");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initial: MotionPreference = stored === "on" || stored === "off"
      ? stored
      : reduced
        ? "off"
        : "on";
    setPreference(initial);
    document.documentElement.dataset.motion = initial;
  }, []);

  const toggle = () => {
    setPreference((prev) => {
      const next: MotionPreference = prev === "on" ? "off" : "on";
      document.documentElement.dataset.motion = next;
      window.localStorage.setItem("emerald-motion", next);
      return next;
    });
  };

  return [preference, toggle];
}

/** Registers a batch of `.reveal` targets inside `root` for scroll-triggered fade/rise. */
function useScrollReveal(root: React.RefObject<HTMLElement | null>, motion: MotionPreference) {
  useLayoutEffect(() => {
    if (motion === "off" || !root.current) return;

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>(".reveal", root.current!);
      targets.forEach((el, i) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: (i % 4) * 0.06,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [root, motion]);
}

function MagneticButton({
  children,
  href,
  onClick,
  variant = "solid",
  type = "button",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  type?: "button" | "submit";
}) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.3, y: y * 0.4, duration: 0.4, ease: "power3.out" });
  };

  const handleLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  };

  const className = `magnetic-button${variant === "ghost" ? " magnetic-button--ghost" : ""}`;

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={className}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SiteNav() {
  return (
    <header className="site-nav">
      <a className="site-nav__mark" href="#top">
        <strong>{SITE.name}</strong> / ما وراء الواقع
      </a>
      <nav>
        <ul className="site-nav__links">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <ParticleField />
      <div className="hero__scrim" />
      <div className="hero__content container">
        <div className="hero__eyebrow">
          <span className="hero__eyebrow-line" />
          <span className="eyebrow">فيديو بالذكاء الاصطناعي وتصميم رقمي</span>
        </div>
        <h1 className="hero__title">
          <span>{SITE.name}</span>
          <span>
            <em>ما وراء الواقع</em>
          </span>
        </h1>
        <p className="hero__tagline">{SITE.tagline}</p>
        <div className="hero__actions">
          <MagneticButton href="#visions">شاهد الأعمال</MagneticButton>
          <MagneticButton href="#contact" variant="ghost">
            ابدأ مشروعاً
          </MagneticButton>
        </div>
      </div>
      <div className="hero__scroll-cue">
        <span className="hero__scroll-cue-line" />
        مرر للأسفل
      </div>
    </section>
  );
}

function Studio() {
  return (
    <section className="section container" id="studio">
      <span className="eyebrow reveal">{STUDIO.eyebrow}</span>
      <h2 className="section-heading reveal">{STUDIO.heading}</h2>
      <div className="studio" style={{ marginTop: "3rem" }}>
        <div className="studio__copy reveal">
          {STUDIO.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <div className="studio__stats">
            {STUDIO.stats.map((stat) => (
              <div key={stat.label}>
                <div className="studio__stat-value">{stat.value}</div>
                <div className="studio__stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="studio__frame reveal">
          <img src="/images/design-emerald-marque.webp" alt="" loading="lazy" />
        </div>
      </div>
    </section>
  );
}

function SelectedVisions() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [playerVision, setPlayerVision] = useState<(typeof VISIONS)[number] | null>(null);

  const hoveredVision = VISIONS.find((v) => v.id === hovered);

  return (
    <section className="section container" id="visions">
      <span className="eyebrow reveal">رؤى مختارة</span>
      <h2 className="section-heading reveal">
        أربع دراسات أفلام توليدية، بمعيار تحريري واحد.
      </h2>
      <p className="section-lead reveal">
        مجموعة تصورية — دراسات سينمائية مولّدة لهذا المعرض، وليست أعمالاً سابقة لعملاء.
        مرّر للمعاينة، واختر للمشاهدة.
      </p>

      <div
        className="visions__list"
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      >
        {VISIONS.map((vision, i) => (
          <div
            key={vision.id}
            className="vision-row reveal"
            onMouseEnter={() => setHovered(vision.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setPlayerVision(vision)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setPlayerVision(vision);
            }}
            role="button"
            tabIndex={0}
          >
            <span className="vision-row__index">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="vision-row__title">{vision.title}</h3>
              <span className="vision-row__category">{vision.category}</span>
            </div>
            <span className="vision-row__meta">{vision.duration}</span>
          </div>
        ))}
      </div>

      <div
        className={`vision-preview${hoveredVision ? " vision-preview--visible" : ""}`}
        style={{ left: pos.x, top: pos.y }}
      >
        {hoveredVision && (
          <video
            key={hoveredVision.id}
            src={hoveredVision.video}
            poster={hoveredVision.poster}
            muted
            loop
            autoPlay
            playsInline
          />
        )}
      </div>

      <Dialog.Root open={!!playerVision} onOpenChange={(open) => !open && setPlayerVision(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content dialog-content--video">
            {playerVision && (
              <>
                <Dialog.Title className="dialog-title">{playerVision.title}</Dialog.Title>
                <video
                  src={playerVision.video}
                  poster={playerVision.poster}
                  controls
                  playsInline
                  className="dialog-video"
                />
                <p className="dialog-description">{playerVision.description}</p>
              </>
            )}
            <Dialog.Close className="dialog-close" aria-label="إغلاق">
              ×
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}

function DesignDimension() {
  const [category, setCategory] = useState<DesignCategory | "All">("All");
  const [active, setActive] = useState<DesignWork | null>(null);

  const filtered = useMemo(
    () => (category === "All" ? DESIGN_WORKS : DESIGN_WORKS.filter((w) => w.category === category)),
    [category],
  );

  const openAt = (index: number) => setActive(filtered[index] ?? null);
  const activeIndex = active ? filtered.findIndex((w) => w.id === active.id) : -1;

  return (
    <section className="section container" id="design">
      <span className="eyebrow reveal">بُعد التصميم</span>
      <h2 className="section-heading reveal">
        ستة أعمال، خمسة تخصصات، لغة بصرية واحدة مشتركة.
      </h2>

      <Tabs.Root value={category} onValueChange={(v) => setCategory(v as DesignCategory | "All")}>
        <Tabs.List className="design-filters reveal">
          <Tabs.Trigger value="All" className="design-filter" data-active={category === "All"}>
            الكل
          </Tabs.Trigger>
          {DESIGN_CATEGORIES.map((c) => (
            <Tabs.Trigger key={c} value={c} className="design-filter" data-active={category === c}>
              {c}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      <div className="masonry">
        {filtered.map((work, i) => (
          <button
            key={work.id}
            type="button"
            className="design-card reveal"
            data-span={work.span}
            onClick={() => openAt(i)}
          >
            <img src={work.image} alt={work.title} loading="lazy" />
            <span className="design-card__caption">
              <h3>{work.title}</h3>
              <span>{work.category}</span>
            </span>
          </button>
        ))}
      </div>

      <Dialog.Root open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content dialog-content--lightbox">
            {active && (
              <>
                <img src={active.image} alt={active.title} className="dialog-image" />
                <Dialog.Title className="dialog-title">{active.title}</Dialog.Title>
                <p className="dialog-description">{active.description}</p>
                <div className="dialog-lightbox-nav">
                  <button
                    type="button"
                    onClick={() => openAt((activeIndex - 1 + filtered.length) % filtered.length)}
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    onClick={() => openAt((activeIndex + 1) % filtered.length)}
                  >
                    التالي
                  </button>
                </div>
              </>
            )}
            <Dialog.Close className="dialog-close" aria-label="إغلاق">
              ×
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}

function CreativeProcess() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = PROCESS_STAGES[activeIndex]!;

  // In an RTL layout the arrow keys are reversed per WAI-ARIA authoring
  // practices: Left moves to the next tab, Right to the previous one.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setActiveIndex((i) => (i + 1) % PROCESS_STAGES.length);
    } else if (e.key === "ArrowRight") {
      setActiveIndex((i) => (i - 1 + PROCESS_STAGES.length) % PROCESS_STAGES.length);
    }
  };

  return (
    <section className="section container" id="process">
      <span className="eyebrow reveal">منهج العمل</span>
      <h2 className="section-heading reveal">أربع مراحل، تتكرر في كل عمل.</h2>

      <div className="process reveal" role="tablist" onKeyDown={handleKeyDown}>
        {PROCESS_STAGES.map((stage, i) => (
          <button
            key={stage.index}
            type="button"
            role="tab"
            aria-selected={activeIndex === i}
            tabIndex={activeIndex === i ? 0 : -1}
            className="process-stage"
            onClick={() => setActiveIndex(i)}
          >
            <span className="process-stage__index">{stage.index}</span>
            <h3 className="process-stage__title">{stage.title}</h3>
            <p className="process-stage__description">{stage.description}</p>
          </button>
        ))}
      </div>

      <div className="process-detail reveal" role="tabpanel">
        {active.detail}
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="section container" id="services">
      <span className="eyebrow reveal">الخدمات</span>
      <h2 className="section-heading reveal">خمس طرق للعمل معاً.</h2>

      <Accordion.Root type="single" collapsible className="services-list reveal">
        {SERVICES.map((service) => (
          <Accordion.Item key={service.id} value={service.id} className="service-item">
            <Accordion.Header>
              <Accordion.Trigger className="service-item__trigger">
                <div>
                  <h3 className="service-item__title">{service.title}</h3>
                  <p className="service-item__summary">{service.summary}</p>
                </div>
                <span className="service-item__icon" aria-hidden="true">
                  +
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="service-item__content">
              <div className="service-item__content-inner">
                <ul className="service-item__deliverables">
                  {service.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <span className="service-item__timeline">{service.timeline}</span>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

function ContactSection() {
  const [values, setValues] = useState<ContactFormInput>({
    name: "",
    email: "",
    message: "",
    company: "",
  });
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const requestIdRef = useRef<string>(
    typeof crypto !== "undefined" ? crypto.randomUUID() : "",
  );

  const setField = (field: keyof ContactFormInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const clientErrors = validateContact(values);
    if (clientErrors.length > 0) {
      setErrors(Object.fromEntries(clientErrors.map((err) => [err.field, err.message])));
      setStatus("error");
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, requestId: requestIdRef.current }),
      });

      if (res.status === 422) {
        const data = (await res.json()) as { errors: { field: ContactField; message: string }[] };
        setErrors(Object.fromEntries(data.errors.map((err) => [err.field, err.message])));
        setStatus("error");
        return;
      }

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setValues({ name: "", email: "", message: "", company: "" });
      requestIdRef.current = typeof crypto !== "undefined" ? crypto.randomUUID() : "";
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="section container" id="contact">
      <div className="contact__grid">
        <div className="contact__info">
          <span className="eyebrow reveal">{CONTACT_COPY.eyebrow}</span>
          <h2 className="section-heading reveal">{CONTACT_COPY.heading}</h2>
          <p className="section-lead reveal">{CONTACT_COPY.description}</p>
          <a href={`mailto:${SITE.email}`} className="reveal" dir="ltr">
            {SITE.email}
          </a>
          <div className="contact__socials reveal">
            {SITE.social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <form className="contact-form reveal" onSubmit={handleSubmit} noValidate>
          <div className="form-field" data-invalid={!!errors.name}>
            <label htmlFor="name">الاسم</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={setField("name")}
            />
            {errors.name && <span className="form-field__error">{errors.name}</span>}
          </div>

          <div className="form-field" data-invalid={!!errors.email}>
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={values.email}
              onChange={setField("email")}
            />
            {errors.email && <span className="form-field__error">{errors.email}</span>}
          </div>

          <div className="form-field" data-invalid={!!errors.message}>
            <label htmlFor="message">الرسالة</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={values.message}
              onChange={setField("message")}
            />
            {errors.message && <span className="form-field__error">{errors.message}</span>}
          </div>

          <div className="form-honeypot" aria-hidden="true">
            <label htmlFor="company">الشركة</label>
            <input
              id="company"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={values.company}
              onChange={setField("company")}
            />
          </div>

          <div className="contact-form__submit">
            <MagneticButton type="submit">
              {status === "submitting" ? "جارٍ الإرسال…" : "إرسال الرسالة"}
            </MagneticButton>
          </div>

          {status === "success" && (
            <div className="contact-form__status" data-tone="success" role="status">
              <strong>{CONTACT_COPY.successTitle}</strong> {CONTACT_COPY.successMessage}
            </div>
          )}
          {status === "error" && Object.keys(errors).length === 0 && (
            <div className="contact-form__status" data-tone="error" role="alert">
              <strong>{CONTACT_COPY.errorTitle}</strong> {CONTACT_COPY.errorMessage}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

function SiteFooter({
  motion,
  onToggleMotion,
}: {
  motion: MotionPreference;
  onToggleMotion: () => void;
}) {
  return (
    <footer className="site-footer">
      <span>
        © {new Date().getFullYear()} {SITE.name}. معرض أعمال تصوري.
      </span>
      <button type="button" className="motion-toggle" onClick={onToggleMotion}>
        <span className="motion-toggle__dot" />
        الحركة {motion === "on" ? "مفعّلة" : "متوقفة"}
      </button>
    </footer>
  );
}

export function Portfolio() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [motion, toggleMotion] = useMotionPreference();
  useScrollReveal(rootRef, motion);

  return (
    <div ref={rootRef}>
      <SiteNav />
      <Hero />
      <Studio />
      <SelectedVisions />
      <DesignDimension />
      <CreativeProcess />
      <Services />
      <ContactSection />
      <SiteFooter motion={motion} onToggleMotion={toggleMotion} />
    </div>
  );
}
