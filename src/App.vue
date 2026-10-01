<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { usePortfolio } from "./composables/usePortfolio";
import { useContact } from "./composables/useContact";
import { useTheme } from "./composables/useTheme";
import { getCopy } from "./lib/copy";
import { getUiCopy } from "./lib/uiCopy";
import type { ContactPayload } from "./types/portfolio";

const { data, loading, error, currentLang, toggleLanguage, fetchPortfolio } = usePortfolio();
const { submitting, success, errorMessage, sendContact } =
  useContact(currentLang);
const { currentTheme, toggleTheme } = useTheme();
const copy = computed(() => getUiCopy(currentLang.value));
const portfolioCopy = computed(() => getCopy(currentLang.value));
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

const filteredSkills = computed(() =>
  data.value.skills
    .filter(
      (skill) => selectedCategory.value === "all" ||
        selectedCategory.value === skill.category_slug,
    )
    .map((skill) => ({
      ...skill,
      hoverColor: data.value.categories.find(
        (category) => category.slug === skill.category_slug,
      )?.default_accent_color ?? skill.accent_color,
    })),
);
watch(
  () => data.value.categories,
  (categories) => {
    if (selectedCategory.value !== "all" &&
        !categories.some((category) => category.slug === selectedCategory.value)) {
      selectedCategory.value = "all";
    }
  },
);
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-brand-dark/85 backdrop-blur-md border-b border-brand-lightBorder dark:border-brand-borderDark transition-colors"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a
        href="#"
        aria-label="Félix Saucedo"
        class="flex items-center gap-2 sm:gap-3.5 group"
      >
        <svg
          class="w-9 sm:w-11 h-10 transition-transform group-hover:scale-105 shrink-0"
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
        <div class="flex flex-col">
          <span
            class="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-lg tracking-tight leading-tight"
            >Félix Saucedo</span
          >
          <span
            class="hidden sm:block font-mono text-[10.5px] text-sky-600 dark:text-brand-accent tracking-wider uppercase font-semibold"
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

      <div class="flex items-center gap-2 sm:gap-3">
        <a
          id="navCvBtn"
          :href="cvHref"
          download
          class="cv-dynamic-link inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 sm:px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 hover:border-sky-500 transition-colors"
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
          class="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 sm:px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors"
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
    <div v-if="error" role="alert" class="rounded-xl border border-red-500/30 p-4 text-sm">
      <p>{{ error }}</p>
      <button type="button" @click="fetchPortfolio" :disabled="loading" class="mt-2 underline">
        {{ portfolioCopy.retry }}
      </button>
    </div>
    <p v-else-if="loading" role="status" class="text-sm text-slate-500">
      {{ portfolioCopy.loading }}
    </p>
    <section
      class="pt-8 pb-6 border-b border-brand-lightBorder dark:border-brand-borderDark/60 transition-colors"
    >
      <div
        class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-brand-lightBorder dark:border-brand-borderDark bg-white dark:bg-brand-cardDark/80 text-xs font-mono text-slate-700 dark:text-slate-300 mb-6 shadow-sm"
      >
        <span
          class="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"
        ></span>
        <span>{{ data.hero?.badge }}</span>
      </div>

      <h1
        class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15] sm:leading-none max-w-4xl"
      >
        {{ data.hero?.title ?? "" }}
      </h1>

      <p
        class="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed sm:leading-7"
      >
        {{ data.hero?.body ?? "" }}
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
          v-for="(item, index) in data.philosophies"
          :key="index"
          class="p-7 rounded-2xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark shadow-sm flex flex-col justify-between h-full"
        >
          <div>
            <div class="flex items-start gap-3.5 mb-3">
              <span
                class="shrink-0 p-2 rounded-lg font-mono text-sm font-bold leading-none"
                :style="{ color: item.accent_color_hex ?? undefined, backgroundColor: item.accent_color_hex ? item.accent_color_hex + '1a' : undefined }"
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
          v-for="(study, index) in data.case_studies"
          :key="index"
          class="p-8 rounded-2xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark space-y-4 shadow-sm"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-brand-borderDark/60 pb-4"
          >
            <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">
              {{ study.title }}
            </h3>
            <span
              class="text-xs font-mono px-3 py-1 rounded border shrink-0"
              :style="{ color: study.badge_color_hex, borderColor: study.badge_color_hex + '40', backgroundColor: study.badge_color_hex + '1a' }"
              >{{ study.badge_text }}</span
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
              <span>{{ study.solution }}</span>
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
          v-for="(item, index) in data.leadership"
          :key="index"
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
            v-for="category in data.categories"
            :key="category.id"
            type="button"
            @click="selectedCategory = category.slug"
            :class="
              selectedCategory === category.slug
                ? activeFilterClass
                : inactiveFilterClass
            "
            :style="selectedCategory === category.slug ? { color: category.default_accent_color, borderColor: category.default_accent_color, backgroundColor: category.default_accent_color + '1a' } : undefined"
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
          :key="`${skill.category_slug}:${skill.name}`"
          class="tech-item p-3.5 rounded-xl bg-white dark:bg-brand-cardDark border border-brand-lightBorder dark:border-brand-borderDark transition-all flex flex-col justify-between shadow-sm min-h-[5.5rem]"
          :style="{ '--skill-accent': skill.hoverColor }"
          :data-category="skill.category_slug"
        >
          <span class="text-slate-900 dark:text-slate-100 font-bold text-sm">{{
            skill.name
          }}</span>
          <span class="text-[10px] mt-1" :style="{ color: skill.accent_color }">{{ skill.subtitle }}</span>
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
          v-for="milestone in data.career"
          :key="`${milestone.company}:${milestone.period}`"
          class="p-5 rounded-xl bg-white dark:bg-brand-cardDark/60 border border-brand-lightBorder dark:border-brand-borderDark shadow-sm"
        >
          <span
            class="text-xs"
            :style="{ color: milestone.accent_color_hex }"
            >{{ milestone.period }}</span
          >
          <p class="font-bold text-slate-900 dark:text-slate-200 mt-1">
            {{ milestone.role }}
          </p>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            {{ milestone.company }}
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

  <aside
    id="preferencesDock"
    :aria-label="currentLang === 'es' ? 'Preferencias de visualización' : 'Display preferences'"
    class="fixed bottom-6 right-6 z-40 flex items-center gap-1 p-1 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl font-mono text-xs"
  >
        <button
          id="langToggle"
          type="button"
          role="switch"
          :aria-checked="currentLang === 'en'"
          :aria-label="currentLang === 'es' ? 'Usar idioma inglés' : 'Use English language'"
          :title="currentLang === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'"
          @click="toggleLanguage"
          class="relative inline-flex h-10 w-22 shrink-0 items-center rounded-full p-1 font-bold transition-colors"
        >
          <span
            aria-hidden="true"
            class="absolute inset-y-1 left-1 w-10 rounded-full bg-sky-500 shadow-sm transition-transform duration-200"
            :class="currentLang === 'en' ? 'translate-x-10' : 'translate-x-0'"
          ></span>
          <span
            aria-hidden="true"
            class="relative z-10 w-10 text-center transition-colors"
            :class="currentLang === 'es' ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'"
          >ES</span>
          <span
            aria-hidden="true"
            class="relative z-10 w-10 text-center transition-colors"
            :class="currentLang === 'en' ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'"
          >EN</span>
        </button>

        <span aria-hidden="true" class="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700"></span>
        <button
          id="themeToggle"
          type="button"
          @click="toggleTheme"
          role="switch"
          :aria-checked="currentTheme === 'dark'"
          :aria-label="currentLang === 'es' ? 'Modo oscuro' : 'Dark mode'"
          :title="themeLabel"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <svg
            id="themeIconSun"
            aria-hidden="true"
            class="w-4 h-4 block dark:hidden text-amber-500"
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
            class="w-4 h-4 hidden dark:block text-sky-300"
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
  </aside>
</template>
