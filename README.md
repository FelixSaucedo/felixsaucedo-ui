# felixsaucedo-ui

Esta SPA presenta mi experiencia y mis decisiones técnicas a partir del contenido de la API. La construí con Vue 3.5, Composition API y `<script setup>`, TypeScript estricto, Vite 8 y Tailwind CSS v4. El objetivo de la interfaz es que se pueda leer con facilidad, encontrar el CV y abrir una conversación, sin que los controles del sitio compitan con el contenido.

La base visual procede de una maqueta HTML: mantuve el monograma, las tipografías, la estructura de secciones y la distinción entre tema claro y oscuro. La adaptación a Vue convirtió esas secciones en colecciones reactivas; los textos profesionales no se copiaron a un segundo catálogo local.

## Dos tipos de acción, dos lugares

El header conserva identidad, navegación y dos acciones: descargar el CV y contactar. Moví el selector ES/EN y el control de tema a un dock fijo en la esquina inferior derecha. Separar preferencias de acciones de negocio reduce la densidad del header y mantiene los ajustes accesibles durante la lectura.

El dock está implementado en [`App.vue`](src/App.vue), tiene fondo translúcido, borde discreto y variantes para ambos temas. Sus botones exponen semántica de switch, estado `aria-checked` y etiquetas accesibles. El selector de idioma muestra ambas opciones y resalta la elegida; admite teclado sin una implementación de eventos paralela a la del botón nativo.

[`useTheme`](src/composables/useTheme.ts) sigue la preferencia del sistema hasta que el usuario elige una manualmente. Esa elección persiste en `site_theme`. Un script en `index.html` aplica el tema antes de montar Vue para reducir el cambio inicial de paleta. El idioma persiste en `site_lang`; ambos controles toleran que el navegador restrinja `localStorage`.

## Un contrato explícito con la API

Elegí resolver las traducciones profesionales en el servidor. [`usePortfolio`](src/composables/usePortfolio.ts) solicita `/api/v1/portfolio?lang=es|en`; no intenta traducir ni reconstruir secciones a partir del antiguo esquema de Laravel.

[`portfolioContract.ts`](src/lib/portfolioContract.ts) valida la respuesta en ejecución, además de los tipos de compilación. Acepta el objeto directo del backend y el mismo contrato envuelto en `{ data: ... }`. Comprueba estructura, colecciones y colores `#RRGGBB` antes de exponerlos al template.

| Dato recibido | Uso en la interfaz |
| --- | --- |
| `hero` | Título, descripción e insignia profesional. |
| `philosophies` | Icono, texto y acento de cada tarjeta. |
| `case_studies` | Dilema, solución y badge técnico. |
| `leadership` | Prácticas de colaboración. |
| `categories`, `skills` | Filtros y matriz de tecnologías. |
| `career` | Período, rol y empresa de cada hito. |

El composable comienza con un objeto completo y arreglos vacíos. Distingue carga, fallo de red y timeout de 12 segundos; muestra reintento y registra el error de fetch en consola. Cancela solicitudes anteriores y usa una secuencia para impedir que una respuesta tardía sobrescriba el idioma actual. Conserva una caché en memoria por idioma durante la sesión del componente.

Estos fallbacks evitan errores de renderizado por valores ausentes y permiten conservar contenido ya cargado. No reservan una altura fija para todas las tarjetas: la primera respuesta puede cambiar la altura del documento. No hay una promesa de CLS cero ni cifras de rendimiento que el proyecto no haya medido.

Los rótulos de navegación, formulario y estados viven en [`uiCopy.ts`](src/lib/uiCopy.ts) y [`copy.ts`](src/lib/copy.ts). Esta separación deja el contenido editorial en la base de datos y la interacción de la aplicación en el cliente.

## Colores como datos

La API entrega valores HEX, no clases CSS. El segundo `span` de cada `.tech-item` recibe `skill.accent_color` mediante estilo en línea; el nombre de la tecnología mantiene el color de texto correspondiente al tema. El borde hover usa una variable CSS alimentada por `category.default_accent_color`.

Filosofías y trayectoria usan `accent_color_hex`. Los casos usan `badge_color_hex`; la UI deriva de ese valor la transparencia del fondo y del borde. Así puedo cambiar un acento en la base de datos sin reconstruir un catálogo de clases Tailwind. Las decisiones de layout, contraste y modo oscuro siguen en la UI.

Tailwind se integra mediante `@tailwindcss/vite`, `@theme` y una variante `dark` por clase. El interlineado del hero se declara también en los breakpoints necesarios para conservar el comportamiento de la maqueta anterior. Los SVG están en el markup; no hay una librería de componentes ni de iconos añadida para esta página. Se respeta `prefers-reduced-motion`.

## Contacto y manejo de errores

[`useContact`](src/composables/useContact.ts) envía JSON a `/api/v1/contact` con el honeypot `_hp_company_url` vacío. Impide envíos simultáneos, aplica un timeout de 15 segundos y distingue errores de validación, límite y red. Para `429`, interpreta `Retry-After`; para `422`, identifica campos con errores y prepara mensajes localizados.

`App.vue` conserva el formulario ante un fallo y lo limpia tras la confirmación de recepción. Cambiar idioma o tema no borra lo escrito. La API actual responde `202`; el cliente admite `200`, `201` y `202`. La confirmación significa recepción de la solicitud, no entrega de correo.

## SEO y analítica

[`index.html`](index.html) incluye canonical para `https://felixsaucedo.com/`, Open Graph, Twitter Cards y JSON-LD con `ProfilePage` y `Person`. Google Tag Manager se carga de forma asíncrona mediante `GTM-KC75DLJW`, con su alternativa `noscript`.

Vue actualiza el idioma del documento, la descripción y los locales de Open Graph cuando cambia el contenido. La metadata inicial y el JSON-LD siguen definidos en el HTML para consumidores que no ejecutan la SPA. No hay SSR ni prerendering: el texto principal se obtiene por API después de montar la aplicación. Incluir GTM tampoco implica que haya eventos de conversión personalizados definidos en el código.

Inter y JetBrains Mono se cargan desde Google Fonts. Los enlaces de CV alternan `/Felix_Saucedo_CV_Base.pdf` y `/Felix_Saucedo_CV_Base_EN.pdf`; esos archivos deben colocarse en `public/` y no están incluidos en el checkout actual.

## Desarrollo

La ejecución recomendada usa [portfolio-workspace](https://github.com/FelixSaucedo/portfolio-workspace), donde Nginx sirve UI y API bajo el mismo origen. Desde esa raíz, con la API inicializada:

```bash
docker compose up -d --build
docker compose exec ui npm run build
```

Abre `http://localhost`. Vite utiliza polling para observar archivos montados y el gateway permite HMR por WebSocket.

Para trabajar con Node 22 sin el workspace, desde este repositorio:

```bash
npm ci
npm run dev
npm run build
```

También hay un Compose autónomo: `docker compose up -d --build` publica Vite en `localhost:5173`. En ambos casos, el proxy de desarrollo espera una API en `host.docker.internal:8080`, configurable mediante `API_PROXY_TARGET` en el entorno de Vite. Con Node ejecutado directamente en el host, usa `API_PROXY_TARGET=http://localhost:8080`.

Las solicitudes del cliente usan rutas relativas `/api/v1/...`. Aunque la infraestructura conserva `VITE_API_BASE_URL`, los composables actuales no leen esa variable; para cambiar el origen hay que ajustar el proxy o el despliegue.

## Compilación y verificaciones

`npm run build` ejecuta `vue-tsc -b` antes de Vite. Los errores de tipos bloquean el build. La salida es `dist/`; el Dockerfile de producción la sirve con Nginx y cachea los assets con hash como inmutables.

Con el stack raíz en ejecución:

```bash
docker compose exec ui node --experimental-strip-types --test tests/portfolio-contract.test.mjs
docker compose exec ui npm run build
```

Las pruebas del contrato usan respuestas reales ES/EN de `http://gateway/api/v1/portfolio`. Para ejecutarlas con Node en el host, define `PORTFOLIO_TEST_API_URL=http://localhost/api/v1/portfolio` y ejecuta el mismo archivo con `node --experimental-strip-types --test`.

[`browser-audit.cjs`](tests/browser-audit.cjs) añade comprobaciones en Chromium: contenido, colores calculados, interlineado, filtros, cambios de idioma y tema, teclado, persistencia, ancho móvil y recuperación de errores. Usa Playwright en un contenedor de pruebas separado; no es una dependencia de la SPA. Las llamadas de contacto se simulan y GTM se bloquea durante esa auditoría para no generar envíos ni actividad de analítica.
