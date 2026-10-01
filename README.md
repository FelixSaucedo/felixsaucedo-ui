# Félix Saucedo · Portfolio UI

Vue 3.5, TypeScript, Vite 8 y Tailwind CSS v4. El diseño usa como referencia `/home/felix/projectos/career-lab-main/site/index.html`, conservando su estructura, SVG, paleta, tipografías, tarjetas y disposición de las secciones. El contenido profesional procede de la API.

## Desarrollo y compilación

Desde sitio/:

```bash
docker compose up -d ui gateway
docker compose exec ui npm run build
```

Abre http://localhost. Vite mantiene polling/HMR por Nginx. No se instalaron herramientas en el host.

## Idioma y tema

`src/lib/uiCopy.ts` contiene solamente rótulos de interfaz ES/EN: navegación, encabezados de sección, botones, formulario, placeholders y opciones. Hero, filosofías, casos, liderazgo, tecnologías y trayectoria proceden de la API. Vue actualiza ambos tipos de texto sin recargar ni perder los campos. El idioma se guarda en `site_lang`; también se lee la preferencia anterior `felix-portfolio-language` cuando no existe la nueva.

`src/composables/useTheme.ts` alterna claro/oscuro con `site_theme`. La elección manual persiste y prevalece sobre el sistema. Sin preferencia guardada, el tema sigue el sistema operativo. Un script temprano en index.html aplica el tema antes de cargar Vue para evitar el cambio de paleta inicial. Ambos controles siguen funcionando cuando localStorage está restringido.

Tailwind v4 usa `@custom-variant dark` y `@theme` para reproducir los colores de la referencia de Tailwind v3: oscuro #090d16, tarjetas #0f172a, claro #f8fafc y acentos sky/esmeralda/violeta/ámbar. Se conservan Inter y JetBrains Mono de Google Fonts. Referencia técnica: [modo oscuro de Tailwind](https://tailwindcss.com/docs/dark-mode).

En móviles se muestra el monograma sin el texto largo del logo para dejar espacio a los controles. En escritorio se conserva el logo completo. Se respeta reducción de movimiento.

## API, contacto y SEO

`usePortfolio` consulta y valida `/api/v1/portfolio?lang=es|en`. Adapta `sections` a `hero`, `philosophies` (slug `philosophy`) y `leadership`; expone `skill_categories` como `skills_by_category` y `career_milestones` como `career`. App.vue renderiza estas colecciones reactivas con `v-for`, sin contenido profesional duplicado en diccionarios locales.

Al alternar el idioma, las traducciones JSON de la respuesta previa permiten actualizar el contenido inmediatamente mientras se solicita la respuesta nueva. Se cancelan solicitudes anteriores para evitar que una respuesta tardía sobrescriba el idioma elegido. Los campos nulos y las colecciones vacías se manejan sin romper el renderizado. Actualmente la API contiene 15 tecnologías y 3 categorías; la matriz y sus filtros se generan desde esos datos.

El contacto usa `/api/v1/contact`, headers JSON y honeypot. Mantiene los datos ante errores, confirma y limpia el formulario en 200/201/202, y localiza los errores al idioma actual. La URL `/api/contact` de la maqueta estática no se reutiliza.

GTM GTM-KC75DLJW, canonical https://felixsaucedo.com/ y schema ProfilePage se conservan. Títulos/descripción reflejan el rol Senior Software Engineer de la nueva referencia. Descripción y locale cambian con el idioma.

Los enlaces del CV alternan `/Felix_Saucedo_CV_Base.pdf` y `/Felix_Saucedo_CV_Base_EN.pdf`. Estos PDF todavía no se incorporaron a public/. Existen originales en el repositorio documental, dentro de artifacts/cv/es/ y artifacts/cv/en/; no se copiaron documentos adicionales como parte del cambio de colores e idioma.

[Auditoría](docs/AUDIT.md) · [Código completo](docs/SPA_CODE.md) · [Vista clara](docs/preview-light.png) · [Vista oscura](docs/preview-desktop.png)
