# felixsaucedo-ui

Construí la interfaz de mi portafolio con Vue 3.5, TypeScript estricto, Vite 8 y Tailwind CSS 4. Presenta mi experiencia, decisiones de arquitectura y forma de trabajar, con descarga de CV y formulario de contacto.

Partí de una maqueta HTML y mantuve el monograma, las tipografías y la estructura de secciones al llevarla a Vue. El contenido profesional llega desde mi API Laravel; aquí mantengo la presentación y la interacción, con versiones en español e inglés y temas claro y oscuro.

## Desarrollo

Normalmente trabajo desde [portfolio-workspace](https://github.com/FelixSaucedo/portfolio-workspace), donde Nginx sirve API y UI bajo el mismo origen. Con la API inicializada, uso estos comandos desde la raíz del workspace:

```bash
docker compose up -d --build
docker compose exec ui npm test
docker compose exec ui npm run build
```

El sitio se sirve en `http://localhost`. Vite usa HMR y polling sobre los archivos montados.

Si necesito ejecutar la UI directamente con Node 22.18+ o Node 24, trabajo desde este repositorio:

```bash
npm ci
API_PROXY_TARGET=http://localhost:8080 npm run dev
```

También mantengo un Compose autónomo que publica Vite en `http://localhost:5173`. Su proxy espera la API en `host.docker.internal:8080`; ajusto `API_PROXY_TARGET` si uso otra dirección. Las solicitudes del cliente son relativas y los composables actuales no utilizan `VITE_API_BASE_URL`.

## Contenido y preferencias

| Archivo | Responsabilidad |
| --- | --- |
| [`App.vue`](src/App.vue) | Secciones, formulario, selectores y descarga de CV. |
| [`usePortfolio.ts`](src/composables/usePortfolio.ts) | Carga de contenido, cancelación, caché por idioma y timeout de 12 segundos. |
| [`portfolioContract.ts`](src/lib/portfolioContract.ts) | Validación del JSON y de los colores HEX recibidos. |
| [`uiCopy.ts`](src/lib/uiCopy.ts), [`copy.ts`](src/lib/copy.ts) | Rótulos ES/EN y mensajes de interacción. |
| [`useTheme.ts`](src/composables/useTheme.ts) | Preferencia de sistema y selección manual de tema. |

Mantengo el contenido profesional en la base de datos y el seeder de la API. Los rótulos y mensajes de interacción quedan en `uiCopy.ts` y `copy.ts`.

Valido el JSON antes de renderizarlo: TypeScript no comprueba respuestas de red. La carga requiere `200`; los errores, timeouts y respuestas inválidas permiten reintentar.

Dejé CV y contacto en el header, e idioma y tema en un dock fijo para reducir la cantidad de controles en la navegación. Guardo las preferencias en `site_lang` y `site_theme`; si `localStorage` está bloqueado, se aplican en memoria.

Para los acentos consumo colores `#RRGGBB` de la API y defino los fondos, el contraste y el layout en la UI. Así puedo cambiar un acento en la base sin reconstruir un catálogo de clases CSS.

Como el sitio se recorre por secciones, mantuve la navegación con anclas. Para direcciones distintas de `/` y `/index.html` muestro [`NotFound.vue`](src/components/NotFound.vue), con regreso al inicio y `noindex`. Nginx conserva el fallback a `index.html`; los assets y PDF ausentes reciben un 404 de servidor.

## Contacto

En [`useContact.ts`](src/composables/useContact.ts) mantengo el envío del formulario. Conservo el texto completo del motivo seleccionado, el idioma y el tema para que los correos reflejen lo que la persona vio al escribir. El honeypot `_hp_company_url` viaja vacío en un envío legítimo. Mi dirección de contacto es [contacto@felixsaucedo.com](mailto:contacto@felixsaucedo.com).

El formulario conserva lo escrito ante un fallo y controla estos estados:

- Deshabilita controles durante el envío e impide solicitudes simultáneas.
- Aplica un timeout de 15 segundos y cancela la petición al desmontar el componente.
- Acepta `201` solo con confirmación JSON válida; `202` indica contacto guardado con correo pendiente.
- Resalta campos ante `422` e interpreta `Retry-After` ante `429`.
- Conserva lo escrito cuando falla la petición y evita presentar un error de red como éxito.

La confirmación que muestro acredita la recepción del mensaje. Cuando la API devuelve un `202`, explico que el correo está pendiente y que no hace falta reenviar: el contacto ya quedó guardado.

## CV y metadatos

Mantengo mis dos CV en `public/`, con estos nombres para que los botones los encuentren:

| Idioma | Archivo |
| --- | --- |
| Español | `public/Felix_Saucedo.pdf` |
| Inglés | `public/Felix_Saucedo_EN.pdf` |

Los botones seleccionan mi CV según el idioma del sitio. Al compilar, Vite copia ambos documentos a `dist/`.

En [`index.html`](index.html) mantengo canonical, Open Graph, Twitter Cards, Schema.org y Google Tag Manager. Actualizo el idioma y las descripciones al cargar contenido; la implementación sigue siendo una SPA, sin SSR ni prerendering.

## Pruebas y build

```bash
npm run build
```

`npm run build` ejecuta `vue-tsc -b` antes de Vite. Un error de tipos detiene la compilación; publico el contenido de `dist/`.

Con el workspace activo ejecuto también las pruebas:

```bash
docker compose exec ui npm test
docker compose exec ui npm run build
```

Para ejecutar las pruebas desde Node en el host, indico la dirección de la API:

```bash
PORTFOLIO_TEST_API_URL=http://localhost/api/v1/portfolio npm test
```

Las pruebas cubren el contrato real ES/EN, preferencias, timeout, conexión perdida, doble envío y respuestas inválidas.

Complemento esas pruebas con [`browser-security-audit.mjs`](tests/browser-security-audit.mjs), que usa Chromium instalado en `/ms-playwright`; en Docker necesita acceso al gateway y `QA_GATEWAY_IP` para resolver `localhost`. En [`browser-audit.cjs`](tests/browser-audit.cjs) mantengo la revisión visual con un runtime Playwright separado. En ambos casos simulo los envíos de contacto y bloqueo GTM para probar el sitio sin mandar correos ni generar actividad de analítica.

Para producción compilo la aplicación con `Dockerfile.prod` y sirvo `dist/` con Nginx, usando caché inmutable para los assets con hash. En el README del workspace dejé los pasos del despliegue completo.
