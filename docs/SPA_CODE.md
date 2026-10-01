# Código de la SPA

Contenido profesional desde la API; rótulos de interfaz locales.

## src/App.vue

```vue
<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { usePortfolio } from "./composables/usePortfolio";
import { useContact } from "./composables/useContact";
import { useTheme } from "./composables/useTheme";
import { getUiCopy } from "./lib/uiCopy";
import type { ContactPayload } from "./types/portfolio";

const { data, loading, error, currentLang, toggleLanguage } = usePortfolio();
const { submitting, success, errorMessage, sendContact } =
  useContact(currentLang);
const { currentTheme, toggleTheme } = useTheme();
const copy = computed(() => getUiCopy(currentLang.value));
const selectedCategory = ref("all");
const cvHref = computed(() =>
  currentLang.value === "es"
    ? "/Felix_Saucedo_CV_Base.pdf"
    : "/Felix_Saucedo_CV_Base_EN.pdf",
);
const themeLabel = computed(() =>
  currentLang.value === "es"
    ? `Cambiar a tema ${currentTheme.value === "dark" ? "claro" : "oscuro"}`
    : `Switch to ${currentTheme.value === "dark" ? "light" : "dark"} theme`,
);
const contactForm = reactive<ContactPayload>({
  name: "",
  email: "",
  subject: "oportunidad",
  message: "",
  _hp_company_url: "",
});

async function handleSubmit(): Promise<void> {
  if (await sendContact({ ...contactForm })) {
    Object.assign(contactForm, {
      name: "",
      email: "",
      subject: "oportunidad",
      message: "",
      _hp_company_url: "",
    });
  }
}

watch(
  [currentLang, () => data.value?.hero?.body],
  ([language, description]) => {
    document.title = `Félix Saucedo | Senior Software Engineer`;
    if (description) {
      for (const selector of [
        'meta[name="description"]',
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
      ]) {
        document.querySelector(selector)?.setAttribute("content", description);
      }
    }
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute("content", language === "es" ? "es_ES" : "en_US");
    document
      .querySelector('meta[property="og:locale:alternate"]')
      ?.setAttribute("content", language === "es" ? "en_US" : "es_ES");
  },
  { immediate: true },
);
const activeFilterClass =
  "filter-btn px-3 py-1.5 rounded-lg border border-sky-500 bg-sky-500/10 text-sky-600 dark:text-brand-accent transition-colors";
const inactiveFilterClass =
  "filter-btn px-3 py-1.5 rounded-lg border border-slate-300 dark:border-brand-borderDark bg-white dark:bg-brand-cardDark hover:border-slate-400 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 transition-colors";

const mindsetIconClasses = [
  "shrink-0 p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-brand-accent font-mono text-sm font-bold leading-none",
  "shrink-0 p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-brand-emerald font-mono text-sm font-bold leading-none",
  "shrink-0 p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-sm font-bold leading-none",
  "shrink-0 p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-sm font-bold leading-none",
];
const caseBadgeClasses = [
  "text-xs font-mono px-3 py-1 rounded bg-sky-500/10 text-sky-700 dark:text-brand-accent border border-sky-500/20 shrink-0",
  "text-xs font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-brand-emerald border border-emerald-500/20 shrink-0",
];
const careerPeriodClasses = [
  "text-xs text-sky-600 dark:text-brand-accent",
  "text-xs text-emerald-600 dark:text-brand-emerald",
  "text-xs text-purple-600 dark:text-purple-400",
];
const skillStyles = {
  backend: {
    card: "tech-item p-3.5 rounded-xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark hover:border-sky-500 transition-all flex flex-col justify-between shadow-sm min-h-[5.5rem]",
    subtitle: "text-[10px] text-sky-600 dark:text-brand-accent mt-1",
  },
  data: {
    card: "tech-item p-3.5 rounded-xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark hover:border-emerald-500 transition-all flex flex-col justify-between shadow-sm min-h-[5.5rem]",
    subtitle: "text-[10px] text-emerald-600 dark:text-brand-emerald mt-1",
  },
  cloud: {
    card: "tech-item p-3.5 rounded-xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark hover:border-sky-500 transition-all flex flex-col justify-between shadow-sm min-h-[5.5rem]",
    subtitle: "text-[10px] text-sky-600 dark:text-sky-400 mt-1",
  },
  api: {
    card: "tech-item p-3.5 rounded-xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark hover:border-purple-500 transition-all flex flex-col justify-between shadow-sm min-h-[5.5rem]",
    subtitle: "text-[10px] text-purple-600 dark:text-purple-400 mt-1",
  },
  quality: {
    card: "tech-item p-3.5 rounded-xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark hover:border-amber-500 transition-all flex flex-col justify-between shadow-sm min-h-[5.5rem]",
    subtitle: "text-[10px] text-amber-600 dark:text-amber-400 mt-1",
  },
};
const skillStyleOverrides: Record<string, keyof typeof skillStyles> = {
  "clean-arch": "quality",
  tdd: "quality",
};
const mutedSkillSubtitles = new Set(["linux", "nginx", "clean-arch"]);
const filteredSkills = computed(() =>
  (data.value?.skills_by_category ?? [])
    .flatMap((category) => {
      const styleKey =
        category.slug === "storage-db"
          ? "data"
          : category.slug === "cloud-devops"
            ? "cloud"
            : category.slug;
      const style =
        skillStyles[styleKey as keyof typeof skillStyles] ??
        skillStyles.backend;
      return category.skills.map((skill) => {
        const skillStyle =
          skillStyles[
            skillStyleOverrides[skill.slug] ??
              (styleKey as keyof typeof skillStyles)
          ] ?? style;
        return {
          ...skill,
          categoryId: category.slug,
          cardClass: skillStyle.card,
          subtitleClass: mutedSkillSubtitles.has(skill.slug)
            ? "text-[10px] text-slate-500 dark:text-slate-400 mt-1"
            : skillStyle.subtitle,
        };
      });
    })
    .filter(
      (skill) =>
        selectedCategory.value === "all" ||
        selectedCategory.value === skill.categoryId,
    ),
);
watch(
  () => data.value?.skills_by_category,
  (categories) => {
    if (
      selectedCategory.value !== "all" &&
      categories &&
      !categories.some((category) => category.slug === selectedCategory.value)
    )
      selectedCategory.value = "all";
  },
);
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-brand-dark/85 backdrop-blur-md border-b border-brand-lightBorder dark:border-brand-borderDark transition-colors"
  >
    <div class="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
      <a
        href="#"
        aria-label="Félix Saucedo"
        class="flex items-center gap-3.5 group"
      >
        <svg
          class="w-11 h-10 transition-transform group-hover:scale-105 shrink-0"
          viewBox="0 0 88 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            width="88"
            height="80"
            rx="18"
            class="fill-slate-100 stroke-slate-300 dark:fill-[#0f172a] dark:stroke-[#1e293b] transition-colors"
            stroke-width="1.5"
          />
          <circle cx="17" cy="17" r="3" fill="#10b981" />
          <path
            d="M21 38 L14 45 L21 52"
            class="stroke-slate-400 dark:stroke-[#64748b] transition-colors"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <text
            x="26"
            y="52"
            font-family="'JetBrains Mono', monospace"
            font-weight="800"
            font-size="19"
            class="fill-slate-800 dark:fill-[#f8fafc] transition-colors"
          >
            FS
          </text>
          <line
            x1="61"
            y1="36"
            x2="55"
            y2="54"
            class="stroke-sky-600 dark:stroke-[#38bdf8] transition-colors"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            d="M68 38 L75 45 L68 52"
            class="stroke-slate-400 dark:stroke-[#64748b] transition-colors"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div class="hidden sm:flex flex-col">
          <span
            class="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight leading-tight"
            >Félix Saucedo</span
          >
          <span
            class="font-mono text-[10.5px] text-sky-600 dark:text-brand-accent tracking-wider uppercase font-semibold"
            >Senior Software Engineer</span
          >
        </div>
      </a>

      <div
        class="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-400"
      >
        <a
          href="#como-pienso"
          class="hover:text-slate-950 dark:hover:text-slate-100 transition-colors"
          data-i18n="nav_how_work"
          >{{ copy.nav_how_work }}</a
        >
        <a
          href="#decisiones"
          class="hover:text-slate-950 dark:hover:text-slate-100 transition-colors"
          data-i18n="nav_decisions"
          >{{ copy.nav_decisions }}</a
        >
        <a
          href="#liderazgo"
          class="hover:text-slate-950 dark:hover:text-slate-100 transition-colors"
          data-i18n="nav_leadership"
          >{{ copy.nav_leadership }}</a
        >
        <a
          href="#herramientas"
          class="hover:text-slate-950 dark:hover:text-slate-100 transition-colors"
          data-i18n="nav_stack"
          >{{ copy.nav_stack }}</a
        >
      </div>

      <div class="flex items-center gap-3">
        <button
          id="langToggle"
          type="button"
          @click="toggleLanguage"
          :aria-label="
            currentLang === 'es'
              ? 'Cambiar idioma a inglés'
              : 'Switch language to Spanish'
          "
          class="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-brand-borderDark bg-slate-100 dark:bg-brand-cardDark text-xs font-mono font-bold text-slate-800 dark:text-slate-200 hover:border-sky-500 transition-colors"
        >
          <span id="langLabel">{{ currentLang === "es" ? "EN" : "ES" }}</span>
        </button>

        <button
          id="themeToggle"
          type="button"
          @click="toggleTheme"
          :aria-label="themeLabel"
          :title="themeLabel"
          class="p-2 rounded-lg border border-slate-300 dark:border-brand-borderDark bg-slate-100 dark:bg-brand-cardDark text-slate-700 dark:text-slate-300 hover:border-sky-500 transition-colors"
        >
          <svg
            id="themeIconSun"
            aria-hidden="true"
            class="w-4 h-4 hidden dark:block text-amber-300"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            id="themeIconMoon"
            aria-hidden="true"
            class="w-4 h-4 block dark:hidden text-slate-700"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>

        <a
          id="navCvBtn"
          :href="cvHref"
          download
          class="cv-dynamic-link hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-2 rounded-lg border border-slate-300 dark:border-brand-borderDark bg-white dark:bg-brand-cardDark text-slate-800 dark:text-slate-200 hover:border-sky-500 transition-colors"
        >
          <svg
            class="w-3.5 h-3.5 text-brand-emerald"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span data-i18n="btn_cv_short">{{ copy.btn_cv_short }}</span>
        </a>

        <a
          href="#contacto"
          class="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors"
        >
          <span data-i18n="btn_talk">{{ copy.btn_talk }}</span>
        </a>
      </div>
    </div>
  </nav>

  <main
    :aria-busy="loading"
    class="max-w-6xl mx-auto px-6 pt-32 pb-24 space-y-28"
  >
    <section
      class="pt-8 pb-6 border-b border-brand-lightBorder dark:border-brand-borderDark/60 transition-colors"
    >
      <div
        class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-brand-lightBorder dark:border-brand-borderDark bg-white dark:bg-brand-cardDark/80 text-xs font-mono text-slate-700 dark:text-slate-300 mb-6 shadow-sm"
      >
        <span
          class="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"
        ></span>
        <span>{{ data?.hero?.subtitle }}</span>
      </div>

      <h1
        class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15] max-w-4xl"
      >
        {{ data?.hero?.title ?? "" }}
      </h1>

      <p
        class="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed"
      >
        {{ data?.hero?.body ?? error ?? "" }}
      </p>

      <div class="mt-8 flex flex-wrap items-center gap-4 text-sm font-mono">
        <a
          href="https://linkedin.com/in/felix-saucedo"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark hover:border-slate-400 dark:hover:border-slate-600 transition-colors text-slate-800 dark:text-slate-200 shadow-sm"
        >
          <svg
            class="w-4 h-4 text-sky-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
            />
          </svg>
          <span>LinkedIn</span>
        </a>
        <a
          href="https://github.com/FelixSaucedo"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark hover:border-slate-400 dark:hover:border-slate-600 transition-colors text-slate-800 dark:text-slate-200 shadow-sm"
        >
          <svg
            class="w-4 h-4 text-slate-700 dark:text-slate-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          <span>GitHub</span>
        </a>
        <a
          id="heroCvBtn"
          :href="cvHref"
          download
          class="cv-dynamic-link flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark hover:border-slate-400 dark:hover:border-slate-600 transition-colors text-slate-800 dark:text-slate-200 shadow-sm"
        >
          <svg
            class="w-4 h-4 text-emerald-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span data-i18n="btn_cv_full">{{ copy.btn_cv_full }}</span>
        </a>
      </div>
    </section>

    <section id="como-pienso" class="scroll-mt-28 space-y-8">
      <div>
        <h2
          class="text-xs font-mono font-bold uppercase tracking-widest text-sky-600 dark:text-brand-accent"
          data-i18n="sec1_tag"
        >
          {{ copy.sec1_tag }}
        </h2>
        <p
          class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2"
          data-i18n="sec1_title"
        >
          {{ copy.sec1_title }}
        </p>
        <p
          class="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-2xl"
          data-i18n="sec1_desc"
        >
          {{ copy.sec1_desc }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="(item, index) in data?.philosophies ?? []"
          :key="item.id"
          class="p-7 rounded-2xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark shadow-sm flex flex-col justify-between h-full"
        >
          <div>
            <div class="flex items-start gap-3.5 mb-3">
              <span
                :class="mindsetIconClasses[index % mindsetIconClasses.length]"
                >{{ item.icon }}</span
              >
              <h3
                class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug"
              >
                {{ item.title }}
              </h3>
            </div>
            <p
              class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1"
            >
              {{ item.body }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="decisiones" class="scroll-mt-28 space-y-8">
      <div>
        <h2
          class="text-xs font-mono font-bold uppercase tracking-widest text-sky-600 dark:text-brand-accent"
          data-i18n="sec2_tag"
        >
          {{ copy.sec2_tag }}
        </h2>
        <p
          class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2"
          data-i18n="sec2_title"
        >
          {{ copy.sec2_title }}
        </p>
        <p
          class="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-2xl"
          data-i18n="sec2_desc"
        >
          {{ copy.sec2_desc }}
        </p>
      </div>

      <div class="space-y-6">
        <div
          v-for="(study, index) in data?.case_studies ?? []"
          :key="study.id"
          class="p-8 rounded-2xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark space-y-4 shadow-sm"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-brand-borderDark/60 pb-4"
          >
            <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">
              {{ study.title }}
            </h3>
            <span
              :class="caseBadgeClasses[index % caseBadgeClasses.length]"
              :title="study.skills.map((skill) => skill.name).join(', ')"
              >{{
                study.skills
                  .slice(0, 3)
                  .map((skill) => skill.name)
                  .join(" + ")
              }}</span
            >
          </div>
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
          >
            <div>
              <strong
                class="text-slate-900 dark:text-slate-200 block mb-1"
                data-i18n="label_problem"
                >{{ copy.label_problem }}</strong
              >
              <span>{{ study.problem }}</span>
            </div>
            <div>
              <strong
                class="text-slate-900 dark:text-slate-200 block mb-1"
                data-i18n="label_decision"
                >{{ copy.label_decision }}</strong
              >
              <span
                >{{ study.solution
                }}<span v-if="study.tradeoffs">
                  — {{ study.tradeoffs }}</span
                ></span
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      id="liderazgo"
      class="scroll-mt-28 p-8 sm:p-10 rounded-3xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark space-y-6 shadow-sm"
    >
      <div class="max-w-3xl">
        <h2
          class="text-xs font-mono font-bold uppercase tracking-widest text-sky-600 dark:text-brand-accent"
          data-i18n="sec3_tag"
        >
          {{ copy.sec3_tag }}
        </h2>
        <h3
          class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2"
          data-i18n="sec3_title"
        >
          {{ copy.sec3_title }}
        </h3>
        <p
          class="text-slate-600 dark:text-slate-400 text-sm mt-3 leading-relaxed"
          data-i18n="sec3_desc"
        >
          {{ copy.sec3_desc }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div
          v-for="item in data?.leadership ?? []"
          :key="item.id"
          class="space-y-2"
        >
          <h4 class="font-bold text-slate-900 dark:text-slate-200 text-base">
            {{ item.title }}
          </h4>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {{ item.body }}
          </p>
        </div>
      </div>
    </section>

    <section id="herramientas" class="scroll-mt-28 space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2
            class="text-xs font-mono font-bold uppercase tracking-widest text-sky-600 dark:text-brand-accent"
            data-i18n="sec4_tag"
          >
            {{ copy.sec4_tag }}
          </h2>
          <p
            class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2"
            data-i18n="sec4_title"
          >
            {{ copy.sec4_title }}
          </p>
          <p
            class="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-2xl"
            data-i18n="sec4_desc"
          >
            {{ copy.sec4_desc }}
          </p>
        </div>

        <div
          class="flex flex-wrap gap-2 text-xs font-mono"
          id="stackFilterContainer"
        >
          <button
            type="button"
            @click="selectedCategory = 'all'"
            :class="
              selectedCategory === 'all'
                ? activeFilterClass
                : inactiveFilterClass
            "
            :aria-pressed="selectedCategory === 'all'"
            data-filter="all"
            data-i18n="tab_all"
          >
            {{ copy.tab_all }}
          </button>
          <button
            v-for="category in data?.skills_by_category ?? []"
            :key="category.id"
            type="button"
            @click="selectedCategory = category.slug"
            :class="
              selectedCategory === category.slug
                ? activeFilterClass
                : inactiveFilterClass
            "
            :aria-pressed="selectedCategory === category.slug"
            :data-filter="category.slug"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs"
        id="techGrid"
      >
        <div
          v-for="skill in filteredSkills"
          :key="skill.id"
          :class="skill.cardClass"
          :data-category="skill.categoryId"
        >
          <span class="text-slate-900 dark:text-slate-100 font-bold text-sm">{{
            skill.name
          }}</span>
          <span :class="skill.subtitleClass">{{ skill.subtitle }}</span>
        </div>
      </div>
    </section>

    <section class="space-y-6">
      <div
        class="flex items-center justify-between border-b border-brand-lightBorder dark:border-brand-borderDark/60 pb-4"
      >
        <div>
          <h2
            class="text-xs font-mono font-bold uppercase tracking-widest text-sky-600 dark:text-brand-accent"
            data-i18n="sec5_tag"
          >
            {{ copy.sec5_tag }}
          </h2>
          <p
            class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1"
            data-i18n="sec5_title"
          >
            {{ copy.sec5_title }}
          </p>
        </div>
        <a
          id="summaryCvBtn"
          :href="cvHref"
          download
          class="cv-dynamic-link text-xs font-mono text-sky-600 dark:text-brand-accent hover:underline flex items-center gap-1.5"
        >
          <span data-i18n="btn_cv_full_details">{{
            copy.btn_cv_full_details
          }}</span>
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
        <div
          v-for="(milestone, index) in data?.career ?? []"
          :key="milestone.id"
          class="p-5 rounded-xl bg-white dark:bg-brand-cardDark/60 border border-brand-lightBorder dark:border-brand-borderDark shadow-sm"
        >
          <span
            :class="careerPeriodClasses[index % careerPeriodClasses.length]"
            >{{ milestone.period }}</span
          >
          <p class="font-bold text-slate-900 dark:text-slate-200 mt-1">
            {{ milestone.role }}
          </p>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            {{
              [milestone.company, milestone.location]
                .filter(Boolean)
                .join(" · ")
            }}
          </p>
        </div>
      </div>
    </section>

    <section
      id="contacto"
      class="scroll-mt-28 pt-8 border-t border-brand-lightBorder dark:border-brand-borderDark"
    >
      <div class="max-w-2xl mx-auto space-y-8">
        <div class="text-center">
          <h2
            class="text-xs font-mono font-bold uppercase tracking-widest text-sky-600 dark:text-brand-accent"
            data-i18n="contact_tag"
          >
            {{ copy.contact_tag }}
          </h2>
          <p
            class="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2"
            data-i18n="contact_title"
          >
            {{ copy.contact_title }}
          </p>
          <p
            class="text-slate-600 dark:text-slate-400 text-sm mt-3"
            data-i18n="contact_desc"
          >
            {{ copy.contact_desc }}
          </p>
        </div>

        <form
          id="contactForm"
          @submit.prevent="handleSubmit"
          :aria-busy="submitting"
          class="p-8 rounded-2xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark space-y-6 shadow-sm"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                for="name"
                class="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                data-i18n="field_name"
                >{{ copy.field_name }}</label
              >
              <input
                type="text"
                id="name"
                name="name"
                maxlength="100"
                autocomplete="name"
                v-model="contactForm.name"
                :disabled="submitting"
                required
                :placeholder="copy.ph_name"
                class="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-borderDark text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label
                for="email"
                class="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                data-i18n="field_email"
                >{{ copy.field_email }}</label
              >
              <input
                type="email"
                id="email"
                name="email"
                maxlength="255"
                autocomplete="email"
                v-model="contactForm.email"
                :disabled="submitting"
                required
                :placeholder="
                  currentLang === 'es'
                    ? 'nombre@empresa.com'
                    : 'name@company.com'
                "
                class="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-borderDark text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label
              for="subject"
              class="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
              data-i18n="field_subject"
              >{{ copy.field_subject }}</label
            >
            <select
              id="subject"
              name="subject"
              v-model="contactForm.subject"
              :disabled="submitting"
              class="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-borderDark text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-sm"
            >
              <option value="oportunidad" data-i18n="opt_job">
                {{ copy.opt_job }}
              </option>
              <option value="proyecto" data-i18n="opt_consult">
                {{ copy.opt_consult }}
              </option>
              <option value="otro" data-i18n="opt_other">
                {{ copy.opt_other }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="message"
              class="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
              data-i18n="field_message"
              >{{ copy.field_message }}</label
            >
            <textarea
              id="message"
              name="message"
              minlength="15"
              maxlength="3000"
              v-model="contactForm.message"
              :disabled="submitting"
              rows="4"
              required
              :placeholder="copy.ph_msg"
              class="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-borderDark text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors text-sm"
            ></textarea>
          </div>

          <input
            v-model="contactForm._hp_company_url"
            type="text"
            name="_hp_company_url"
            class="hidden"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />
          <div
            v-if="success"
            id="formStatus"
            role="status"
            class="p-4 rounded-lg text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 block"
          >
            {{
              currentLang === "es"
                ? "✓ Mensaje enviado correctamente."
                : "✓ Message sent successfully."
            }}
          </div>
          <div
            v-if="errorMessage"
            role="alert"
            class="p-4 rounded-lg text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300"
          >
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            id="submitBtn"
            :disabled="submitting"
            class="w-full py-3.5 px-6 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span data-i18n="btn_send">{{
              submitting
                ? currentLang === "es"
                  ? "Enviando..."
                  : "Sending..."
                : copy.btn_send
            }}</span>
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </form>

        <div
          class="text-center pt-2 text-xs font-mono text-slate-500 space-y-2"
        >
          <p data-i18n="inbox_alt">{{ copy.inbox_alt }}</p>
          <p class="text-slate-700 dark:text-slate-300">
            <a
              href="mailto:felix.saucedo.mendiola@gmail.com"
              class="hover:text-sky-500 transition-colors underline underline-offset-4"
              >felix.saucedo.mendiola@gmail.com</a
            >
          </p>
        </div>
      </div>
    </section>

    <footer
      class="pt-8 text-center text-xs font-mono text-slate-500 dark:text-slate-600"
    >
      <p data-i18n="footer_copy">{{ copy.footer_copy }}</p>
    </footer>
  </main>
</template>
```

## src/style.css

```css
@import 'tailwindcss';

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --color-slate-950: #020617;
  --color-sky-400: #38bdf8;
  --color-sky-500: #0ea5e9;
  --color-sky-600: #0284c7;
  --color-sky-700: #0369a1;
  --color-emerald-400: #34d399;
  --color-emerald-500: #10b981;
  --color-emerald-600: #059669;
  --color-emerald-700: #047857;
  --color-purple-400: #c084fc;
  --color-purple-500: #a855f7;
  --color-purple-600: #9333ea;
  --color-amber-300: #fcd34d;
  --color-amber-400: #fbbf24;
  --color-amber-500: #f59e0b;
  --color-amber-600: #d97706;
  --color-red-300: #fca5a5;
  --color-red-500: #ef4444;
  --color-red-700: #b91c1c;
  --color-brand-dark: #090d16;
  --color-brand-cardDark: #0f172a;
  --color-brand-borderDark: #1e293b;
  --color-brand-accent: #38bdf8;
  --color-brand-emerald: #10b981;
  --color-brand-lightBg: #f8fafc;
  --color-brand-lightCard: #ffffff;
  --color-brand-lightBorder: #e2e8f0;
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

button:not(:disabled) {
  cursor: pointer;
}
button:disabled {
  cursor: wait;
  opacity: 0.6;
}
:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

## src/lib/uiCopy.ts

```typescript
import type { Language } from '../types/portfolio'

const es = {
  btn_cv_full: 'Descargar CV Base',
  btn_cv_full_details: 'Ver CV completo con detalles',
  btn_cv_short: 'CV',
  btn_send: 'Enviar mensaje',
  btn_talk: 'Hablemos',
  contact_desc:
    'Este formulario se conecta vía API JSON para comunicarse directamente conmigo.',
  contact_tag: 'Contacto Directo',
  contact_title: 'Conversemos sobre tu equipo o proyecto',
  field_email: 'Tu Correo *',
  field_message: 'Mensaje *',
  field_name: 'Tu Nombre *',
  field_subject: 'Motivo de Contacto',
  footer_copy:
    '© 2026 Félix Saucedo · Diseñado para complementar mi perfil profesional.',
  inbox_alt: 'O escribe directamente a mi bandeja:',
  label_decision: 'La decisión aplicada:',
  label_problem: 'El dilema técnico:',
  nav_decisions: 'Criterio Técnico',
  nav_how_work: 'Cómo trabajo',
  nav_leadership: 'Liderazgo',
  nav_stack: 'Ecosistema',
  opt_consult: 'Consultoría o desarrollo técnico',
  opt_job: 'Oportunidad laboral (Senior / Lead Hands-on)',
  opt_other: 'Conversación técnica / Pregunta sobre mi trabajo',
  ph_msg:
    'Cuéntame sobre el desafío técnico o la posición que buscan cubrir...',
  ph_name: 'Ej: Marcela Gómez',
  sec1_desc:
    'Las herramientas cambian, pero los hábitos de ingeniería que evitan incendios en producción son constantes.',
  sec1_tag: 'Detrás del CV',
  sec1_title: 'Mi filosofía de trabajo en el día a día',
  sec2_desc:
    'En un CV se listan tecnologías; aquí explico el razonamiento técnico detrás de su elección.',
  sec2_tag: 'Criterio en Producción',
  sec2_title: 'Trade-offs y decisiones que justifican el stack',
  sec3_desc:
    'No creo en el liderazgo desde torres de marfil ni en jefaturas desconectadas de la consola. Cuando guío un equipo técnico, aplico tres reglas fundamentales:',
  sec3_tag: 'Liderazgo & Colaboración',
  sec3_title: 'Cómo aporto al equipo como Lead Hands-on',
  sec4_desc:
    'En el CV resumo mi stack prioritario; aquí reflejo el abanico completo de lenguajes, motores, infraestructura, testing y protocolos con los que he construido soluciones en producción.',
  sec4_tag: 'Ecosistema Técnico',
  sec4_title: 'Herramientas & Tecnologías a lo largo del tiempo',
  sec5_tag: 'Resumen Curricular',
  sec5_title: 'Línea de Tiempo Sintética',
  tab_all: 'Todos',
} as const

export type UiCopy = { [Key in keyof typeof es]: string }

const en: UiCopy = {
  btn_cv_full: 'Download Base Resume (EN)',
  btn_cv_full_details: 'View complete resume details',
  btn_cv_short: 'Resume',
  btn_send: 'Send Message',
  btn_talk: "Let's Talk",
  contact_desc: 'This form connects via JSON API to reach my inbox directly.',
  contact_tag: 'Direct Contact',
  contact_title: "Let's discuss your team or next project",
  field_email: 'Your Email *',
  field_message: 'Message *',
  field_name: 'Your Name *',
  field_subject: 'Contact Reason',
  footer_copy:
    '© 2026 Félix Saucedo · Designed to complement my professional engineering profile.',
  inbox_alt: 'Or reach out directly via email:',
  label_decision: 'The implemented strategy:',
  label_problem: 'The technical dilemma:',
  nav_decisions: 'Technical Decisions',
  nav_how_work: 'Ways of Working',
  nav_leadership: 'Leadership',
  nav_stack: 'Ecosystem',
  opt_consult: 'Consulting or Technical Development',
  opt_job: 'Job Opportunity (Senior / Hands-on Lead)',
  opt_other: 'Technical Chat / Question about my work',
  ph_msg: 'Tell me about the engineering challenge or open role...',
  ph_name: 'e.g. Sarah Jenkins',
  sec1_desc:
    'Tools and stacks evolve, but the engineering disciplines that prevent production fires remain constant.',
  sec1_tag: 'Beyond the Resume',
  sec1_title: 'My day-to-day engineering mindset',
  sec2_desc:
    'Resumes list technologies; here I share the practical reasoning behind each engineering choice.',
  sec2_tag: 'Production Judgement',
  sec2_title: 'Trade-offs and architectural rationale',
  sec3_desc:
    "I don't believe in ivory-tower leadership or managers alienated from code. When leading engineering teams, I apply three core principles:",
  sec3_tag: 'Leadership & Collaboration',
  sec3_title: 'How I contribute as a Hands-on Lead',
  sec4_desc:
    'My resume highlights primary tools; here is the broader spectrum of languages, engines, cloud services, and protocols I have operated in production.',
  sec4_tag: 'Technical Ecosystem',
  sec4_title: 'Tools & Technologies across my career',
  sec5_tag: 'Career Summary',
  sec5_title: 'High-level Timeline',
  tab_all: 'All',
}

export function getUiCopy(language: Language): UiCopy {
  return language === 'en' ? en : es
}
```

## src/composables/useTheme.ts

```typescript
import { onScopeDispose, ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const currentTheme = ref<Theme>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  let explicitPreference = false
  try {
    const saved = localStorage.getItem('site_theme')
    explicitPreference = saved === 'light' || saved === 'dark'
  } catch {}

  function applyTheme(theme: Theme): void {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }

  function followSystem(event: MediaQueryListEvent): void {
    if (!explicitPreference)
      currentTheme.value = event.matches ? 'dark' : 'light'
  }

  function toggleTheme(): void {
    explicitPreference = true
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem('site_theme', currentTheme.value)
    } catch {}
  }

  watch(currentTheme, applyTheme, { immediate: true, flush: 'sync' })
  media.addEventListener('change', followSystem)
  onScopeDispose(() => media.removeEventListener('change', followSystem))

  return { currentTheme, toggleTheme }
}
```

## src/composables/usePortfolio.ts

```typescript
import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue'
import { getCopy } from '../lib/copy'
import { localizePortfolio } from '../lib/portfolio'
import { parsePortfolio } from '../lib/portfolioContract'
import type {
  Language,
  PortfolioResponse,
  PortfolioViewData,
} from '../types/portfolio'

const languageKey = 'site_lang'

function savedLanguage(): Language {
  try {
    const saved =
      localStorage.getItem(languageKey) ??
      localStorage.getItem('felix-portfolio-language')
    return saved === 'en' ? 'en' : 'es'
  } catch {
    return 'es'
  }
}

function persistLanguage(language: Language): void {
  try {
    localStorage.setItem(languageKey, language)
  } catch {
    return
  }
}

export function usePortfolio() {
  const currentLang = ref<Language>(savedLanguage())
  const source = shallowRef<PortfolioResponse | null>(null)
  const data = computed<PortfolioViewData | null>(() => {
    if (!source.value) return null
    const localized = localizePortfolio(source.value, currentLang.value)
    return {
      ...localized,
      hero:
        localized.sections.find((section) => section.slug === 'hero')
          ?.content_blocks[0] ?? null,
      philosophies:
        localized.sections.find((section) => section.slug === 'philosophy')
          ?.content_blocks ?? [],
      leadership:
        localized.sections.find((section) => section.slug === 'leadership')
          ?.content_blocks ?? [],
      career: localized.career_milestones,
      skills_by_category: localized.skill_categories,
    }
  })
  const loading = ref(false)
  const failure = ref<'network' | 'timeout' | null>(null)
  const error = computed(() =>
    failure.value
      ? getCopy(currentLang.value)[
          failure.value === 'timeout' ? 'timeout' : 'loadError'
        ]
      : null,
  )
  let pending: AbortController | null = null
  let sequence = 0

  async function fetchPortfolio(): Promise<void> {
    const requestId = ++sequence
    pending?.abort()
    const controller = new AbortController()
    pending = controller
    loading.value = true
    failure.value = null
    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 12000)

    try {
      const response = await fetch(
        `/api/v1/portfolio?lang=${currentLang.value}`,
        {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        },
      )
      if (!response.ok) throw new Error('Portfolio request failed')
      const payload = parsePortfolio(await response.json())
      if (requestId === sequence) source.value = payload
    } catch {
      if (requestId === sequence && (!controller.signal.aborted || timedOut)) {
        failure.value = timedOut ? 'timeout' : 'network'
      }
    } finally {
      clearTimeout(timeout)
      if (requestId === sequence) {
        loading.value = false
        pending = null
      }
    }
  }

  function toggleLanguage(): void {
    currentLang.value = currentLang.value === 'es' ? 'en' : 'es'
  }

  watch(
    currentLang,
    (language) => {
      persistLanguage(language)
      document.documentElement.lang = language
      void fetchPortfolio()
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    sequence++
    pending?.abort()
  })

  return { data, loading, error, currentLang, fetchPortfolio, toggleLanguage }
}
```

## src/composables/useContact.ts

```typescript
import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { getCopy } from '../lib/copy'
import type {
  ContactErrors,
  ContactField,
  ContactPayload,
  Language,
} from '../types/portfolio'

type ContactFailure = 'network' | 'timeout' | 'validation' | 'rate-limit' | null
const fieldCopy = {
  name: 'serverName',
  email: 'serverEmail',
  subject: 'serverSubject',
  message: 'serverMessage',
} as const

export function useContact(language: MaybeRefOrGetter<Language> = 'es') {
  const submitting = ref(false)
  const received = ref(false)
  const failure = ref<ContactFailure>(null)
  const invalidFields = ref<ContactField[]>([])
  const retryMinutes = ref(10)
  const copy = computed(() => getCopy(toValue(language)))
  const successMessage = computed(() =>
    received.value ? copy.value.received : '',
  )
  const errorMessage = computed(() => {
    switch (failure.value) {
      case 'network':
        return copy.value.contactError
      case 'timeout':
        return copy.value.contactTimeout
      case 'validation':
        return copy.value.invalidContact
      case 'rate-limit':
        return copy.value.rateLimit.replace(
          '{minutes}',
          String(retryMinutes.value),
        )
      default:
        return ''
    }
  })
  const fieldErrors = computed<ContactErrors>(() =>
    Object.fromEntries(
      invalidFields.value.map((field) => [field, copy.value[fieldCopy[field]]]),
    ),
  )
  let controller: AbortController | null = null
  let disposed = false

  function resetFeedback(): void {
    received.value = false
    failure.value = null
    invalidFields.value = []
  }

  async function sendContact(payload: ContactPayload): Promise<boolean> {
    if (submitting.value) return false
    resetFeedback()
    submitting.value = true
    controller = new AbortController()
    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      controller?.abort()
    }, 15000)

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          _hp_company_url: payload._hp_company_url ?? '',
        }),
        signal: controller.signal,
      })
      if (disposed) return false
      if (response.status >= 200 && response.status <= 202) {
        received.value = true
        return true
      }
      if (response.status === 429) {
        const retrySeconds = Number(response.headers.get('Retry-After'))
        retryMinutes.value =
          Number.isFinite(retrySeconds) && retrySeconds > 0
            ? Math.ceil(retrySeconds / 60)
            : 10
        failure.value = 'rate-limit'
      } else if (response.status === 422) {
        const body: unknown = await response.json()
        if (
          body &&
          typeof body === 'object' &&
          'errors' in body &&
          body.errors &&
          typeof body.errors === 'object'
        ) {
          const errors = body.errors
          invalidFields.value = (
            Object.keys(fieldCopy) as ContactField[]
          ).filter((field) => field in errors)
        }
        failure.value = 'validation'
      } else {
        failure.value = 'network'
      }
    } catch {
      if (!disposed) failure.value = timedOut ? 'timeout' : 'network'
    } finally {
      clearTimeout(timeout)
      submitting.value = false
      controller = null
    }
    return false
  }

  onScopeDispose(() => {
    disposed = true
    controller?.abort()
  })

  return {
    submitting,
    success: received,
    successMessage,
    errorMessage,
    fieldErrors,
    sendContact,
    resetFeedback,
  }
}
```

## src/types/portfolio.ts

```typescript
export type Language = 'es' | 'en'
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
export type Localized<T> = Partial<Record<Language, T | null>> | []
export type JsonObject = { [key: string]: JsonValue }
export type ImpactMetrics = string | JsonObject | JsonValue[] | null

export interface Skill {
  id: number
  name: string
  slug: string
  summary: string | null
  subtitle: string | null
  badge_color: string | null
  is_highlight: boolean
  order: number
  translations: {
    summary: Localized<string> | null
    subtitle: Localized<string> | null
  }
}

export interface SkillCategory {
  id: number
  slug: string
  name: string | null
  order: number
  translations: { name: Localized<string> }
  skills: Skill[]
}

export interface CaseStudy {
  id: number
  slug: string
  title: string | null
  context: string | null
  problem: string | null
  solution: string | null
  tradeoffs: string | null
  impact_metrics: ImpactMetrics
  is_featured: boolean
  order: number
  translations: {
    title: Localized<string>
    context: Localized<string> | null
    problem: Localized<string>
    solution: Localized<string>
    tradeoffs: Localized<string> | null
    impact_metrics: Localized<Exclude<ImpactMetrics, null>> | null
  }
  skills: Skill[]
}

export interface ContentBlock {
  id: number
  slug: string
  title: string | null
  subtitle: string | null
  body: string | null
  icon: string | null
  metadata: JsonObject | JsonValue[] | null
  order: number
  translations: {
    title: Localized<string>
    subtitle: Localized<string> | null
    body: Localized<string> | null
  }
}

export interface Section {
  id: number
  slug: string
  name: string
  order: number
  content_blocks: ContentBlock[]
}

export interface CareerMilestone {
  id: number
  period: string
  role: string | null
  company: string
  location: string | null
  highlights: string[] | string | null
  order: number
  translations: {
    period: Localized<string>
    role: Localized<string>
    location: Localized<string> | null
    highlights: Localized<string[] | string> | null
  }
}

export interface PortfolioResponse {
  lang: Language
  skill_categories: SkillCategory[]
  case_studies: CaseStudy[]
  sections: Section[]
  career_milestones: CareerMilestone[]
}

export interface PortfolioViewData extends PortfolioResponse {
  hero: ContentBlock | null
  philosophies: ContentBlock[]
  leadership: ContentBlock[]
  career: CareerMilestone[]
  skills_by_category: SkillCategory[]
}

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
  _hp_company_url: string
}

export type ContactField = Exclude<keyof ContactPayload, '_hp_company_url'>
export type ContactErrors = Partial<Record<ContactField, string>>
```

## src/lib/portfolio.ts

```typescript
import type {
  CaseStudy,
  ImpactMetrics,
  Language,
  Localized,
  PortfolioResponse,
  Skill,
} from '../types/portfolio'

function translated<T>(
  values: Localized<T> | null,
  language: Language,
  fallback: T,
): T {
  if (!values || Array.isArray(values)) return fallback
  return values[language] ?? values.es ?? values.en ?? fallback
}

export function localizePortfolio(
  source: PortfolioResponse,
  language: Language,
): PortfolioResponse {
  const localizeSkill = (skill: Skill): Skill => ({
    ...skill,
    subtitle: translated<string | null>(
      skill.translations.subtitle,
      language,
      skill.subtitle,
    ),
    summary: translated<string | null>(
      skill.translations.summary,
      language,
      skill.summary,
    ),
  })
  return {
    ...source,
    lang: language,
    skill_categories: source.skill_categories.map((category) => ({
      ...category,
      name: translated(category.translations.name, language, category.name),
      skills: category.skills.map(localizeSkill),
    })),
    case_studies: source.case_studies.map((study) => ({
      ...study,
      title: translated(study.translations.title, language, study.title),
      context: translated<string | null>(
        study.translations.context,
        language,
        study.context,
      ),
      problem: translated(study.translations.problem, language, study.problem),
      solution: translated(
        study.translations.solution,
        language,
        study.solution,
      ),
      tradeoffs: translated<string | null>(
        study.translations.tradeoffs,
        language,
        study.tradeoffs,
      ),
      impact_metrics: translated<ImpactMetrics>(
        study.translations.impact_metrics,
        language,
        study.impact_metrics,
      ),
      skills: study.skills.map(localizeSkill),
    })),
    sections: source.sections.map((section) => ({
      ...section,
      content_blocks: section.content_blocks.map((block) => ({
        ...block,
        title: translated(block.translations.title, language, block.title),
        subtitle: translated<string | null>(
          block.translations.subtitle,
          language,
          block.subtitle,
        ),
        body: translated<string | null>(
          block.translations.body,
          language,
          block.body,
        ),
      })),
    })),
    career_milestones: source.career_milestones.map((milestone) => ({
      ...milestone,
      period: translated(
        milestone.translations.period,
        language,
        milestone.period,
      ),
      role: translated(milestone.translations.role, language, milestone.role),
      location: translated<string | null>(
        milestone.translations.location,
        language,
        milestone.location,
      ),
      highlights: translated<string[] | string | null>(
        milestone.translations.highlights,
        language,
        milestone.highlights,
      ),
    })),
  }
}

export interface ProductionMetrics {
  before: number | null
  after: number | null
  peak: number | null
}

export function productionMetrics(study?: CaseStudy): ProductionMetrics {
  const metrics = study?.impact_metrics
  if (!metrics || typeof metrics === 'string' || Array.isArray(metrics))
    return { before: null, after: null, peak: null }
  const latency = metrics.p99_latency_ms
  const values =
    latency && typeof latency === 'object' && !Array.isArray(latency)
      ? latency
      : null
  const number = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null
  return {
    before: number(values?.before),
    after: number(values?.after),
    peak: number(metrics.peak_requests_per_second),
  }
}

export function impactText(metrics: ImpactMetrics): string | null {
  if (typeof metrics === 'string') return metrics
  if (Array.isArray(metrics)) return null
  const outcome = metrics?.resultado ?? metrics?.outcome
  return typeof outcome === 'string' ? outcome : null
}
```

## src/lib/portfolioContract.ts

```typescript
import type {
  CareerMilestone,
  CaseStudy,
  ContentBlock,
  PortfolioResponse,
  Section,
  Skill,
  SkillCategory,
} from '../types/portfolio'

type Check = (value: unknown) => boolean

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const text: Check = (value) => typeof value === 'string'
const integer: Check = (value) =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const boolean: Check = (value) => typeof value === 'boolean'
const nullable =
  (check: Check): Check =>
  (value) =>
    value === null || check(value)
const list =
  (check: Check): Check =>
  (value) =>
    Array.isArray(value) && value.every(check)
const shape =
  (fields: Record<string, Check>): Check =>
  (value) =>
    record(value) &&
    Object.entries(fields).every(
      ([key, check]) => Object.hasOwn(value, key) && check(value[key]),
    )
const localized =
  (check: Check): Check =>
  (value) =>
    (Array.isArray(value) && value.length === 0) ||
    (record(value) &&
      ['es', 'en'].every(
        (lang) => !Object.hasOwn(value, lang) || nullable(check)(value[lang]),
      ))

const json: Check = (value) =>
  value === null ||
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value)) ||
  (Array.isArray(value) && value.every(json)) ||
  (record(value) && Object.values(value).every(json))
const structuredJson: Check = (value) =>
  (Array.isArray(value) || record(value)) && json(value)
const impact: Check = (value) => text(value) || structuredJson(value)
const highlights: Check = (value) => text(value) || list(text)(value)

const skill = shape({
  id: integer,
  name: text,
  slug: text,
  summary: nullable(text),
  subtitle: nullable(text),
  badge_color: nullable(text),
  is_highlight: boolean,
  order: integer,
  translations: shape({
    summary: nullable(localized(text)),
    subtitle: nullable(localized(text)),
  } satisfies Record<keyof Skill['translations'], Check>),
} satisfies Record<keyof Skill, Check>)

const category = shape({
  id: integer,
  slug: text,
  name: nullable(text),
  order: integer,
  skills: list(skill),
  translations: shape({ name: localized(text) } satisfies Record<
    keyof SkillCategory['translations'],
    Check
  >),
} satisfies Record<keyof SkillCategory, Check>)

const caseStudy = shape({
  id: integer,
  slug: text,
  title: nullable(text),
  context: nullable(text),
  problem: nullable(text),
  solution: nullable(text),
  tradeoffs: nullable(text),
  impact_metrics: nullable(impact),
  is_featured: boolean,
  order: integer,
  skills: list(skill),
  translations: shape({
    title: localized(text),
    context: nullable(localized(text)),
    problem: localized(text),
    solution: localized(text),
    tradeoffs: nullable(localized(text)),
    impact_metrics: nullable(localized(impact)),
  } satisfies Record<keyof CaseStudy['translations'], Check>),
} satisfies Record<keyof CaseStudy, Check>)

const block = shape({
  id: integer,
  slug: text,
  title: nullable(text),
  subtitle: nullable(text),
  body: nullable(text),
  icon: nullable(text),
  metadata: nullable(structuredJson),
  order: integer,
  translations: shape({
    title: localized(text),
    subtitle: nullable(localized(text)),
    body: nullable(localized(text)),
  } satisfies Record<keyof ContentBlock['translations'], Check>),
} satisfies Record<keyof ContentBlock, Check>)

const section = shape({
  id: integer,
  slug: text,
  name: text,
  order: integer,
  content_blocks: list(block),
} satisfies Record<keyof Section, Check>)

const milestone = shape({
  id: integer,
  period: text,
  role: nullable(text),
  company: text,
  location: nullable(text),
  highlights: nullable(highlights),
  order: integer,
  translations: shape({
    period: localized(text),
    role: localized(text),
    location: nullable(localized(text)),
    highlights: nullable(localized(highlights)),
  } satisfies Record<keyof CareerMilestone['translations'], Check>),
} satisfies Record<keyof CareerMilestone, Check>)

const portfolio = shape({
  lang: (value) => value === 'es' || value === 'en',
  skill_categories: list(category),
  case_studies: list(caseStudy),
  sections: list(section),
  career_milestones: list(milestone),
} satisfies Record<keyof PortfolioResponse, Check>)

export function parsePortfolio(value: unknown): PortfolioResponse {
  if (!portfolio(value)) throw new Error('Invalid portfolio response')
  return value as PortfolioResponse
}
```

## index.html

```html
<!doctype html>
<html lang="es" class="scroll-smooth dark">
  <head>
    <meta charset="UTF-8" />
    <script>
      try {
        const saved = localStorage.getItem('site_theme')
        const dark =
          saved === 'dark' ||
          (saved !== 'light' &&
            matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.classList.toggle('dark', dark)
        document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
      } catch {
        document.documentElement.classList.add('dark')
        document.documentElement.style.colorScheme = 'dark'
      }
    </script>
    <!-- Google Tag Manager -->
    <script>
      ;(function (w, d, s, l, i) {
        w[l] = w[l] || []
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != 'dataLayer' ? '&l=' + l : ''
        j.async = true
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
        f.parentNode.insertBefore(j, f)
      })(window, document, 'script', 'dataLayer', 'GTM-KC75DLJW')
    </script>
    <!-- End Google Tag Manager -->

    <link
      rel="icon"
      type="image/svg+xml"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 88 80'%3E%3Crect width='88' height='80' rx='18' fill='%230f172a' stroke='%231e293b' stroke-width='1.5'/%3E%3Ccircle cx='17' cy='17' r='3' fill='%2310b981'/%3E%3Cpath d='M21 38 L14 45 L21 52' fill='none' stroke='%2364748b' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ctext x='26' y='52' font-family='monospace' font-weight='800' font-size='19' fill='%23f8fafc'%3EFS%3C/text%3E%3Cline x1='61' y1='36' x2='55' y2='54' stroke='%2338bdf8' stroke-width='3' stroke-linecap='round'/%3E%3Cpath d='M68 38 L75 45 L68 52' fill='none' stroke='%2364748b' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700;800&display=swap"
      rel="stylesheet"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Félix Saucedo | Senior Software Engineer</title>
    <meta
      name="description"
      content="Mi CV resume mis más de 12 años en desarrollo y liderazgo técnico. Este espacio muestra lo que no cabe en dos páginas: mi criterio para tomar decisiones de arquitectura, mi obsesión por la simplicidad y la forma en que colaboro para hacerle la vida más fácil al equipo y al negocio."
    />
    <meta
      name="robots"
      content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    />
    <link rel="canonical" href="https://felixsaucedo.com/" />

    <!-- Open Graph / Redes Sociales -->
    <meta property="og:type" content="profile" />
    <meta
      property="og:title"
      content="Félix Saucedo | Senior Software Engineer"
    />
    <meta
      property="og:description"
      content="Mi CV resume mis más de 12 años en desarrollo y liderazgo técnico. Este espacio muestra lo que no cabe en dos páginas: mi criterio para tomar decisiones de arquitectura, mi obsesión por la simplicidad y la forma en que colaboro para hacerle la vida más fácil al equipo y al negocio."
    />
    <meta property="og:url" content="https://felixsaucedo.com/" />
    <meta property="og:locale" content="es_ES" />
    <meta property="og:locale:alternate" content="en_US" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta
      name="twitter:title"
      content="Félix Saucedo | Senior Software Engineer"
    />
    <meta
      name="twitter:description"
      content="Mi CV resume mis más de 12 años en desarrollo y liderazgo técnico. Este espacio muestra lo que no cabe en dos páginas: mi criterio para tomar decisiones de arquitectura, mi obsesión por la simplicidad y la forma en que colaboro para hacerle la vida más fácil al equipo y al negocio."
    />

    <!-- JSON-LD Estructurado Schema.org -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "mainEntity": {
          "@type": "Person",
          "name": "Félix Saucedo",
          "jobTitle": "Senior Software Engineer",
          "description": "Senior Software Engineer and Hands-on Lead specializing in software architecture and database optimization.",
          "knowsAbout": [
            "Software Architecture",
            "High Throughput Systems",
            "MySQL Optimization",
            "Laravel",
            "Vue.js",
            "AWS",
            "Docker"
          ],
          "url": "https://felixsaucedo.com"
        }
      }
    </script>
  </head>
  <body
    class="bg-brand-lightBg dark:bg-brand-dark text-slate-700 dark:text-slate-300 font-sans antialiased transition-colors duration-200 selection:bg-brand-accent/20 selection:text-brand-accent"
  >
    <!-- Google Tag Manager (noscript) -->
    <noscript
      ><iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-KC75DLJW"
        height="0"
        width="0"
        style="display: none; visibility: hidden"
      ></iframe
    ></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```
