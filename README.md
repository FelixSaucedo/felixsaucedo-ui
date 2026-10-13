# felixsaucedo-ui

Esta es la interfaz de [mi sitio personal](https://felixsaucedo.com). Aquí presento mi experiencia, proyectos y forma de trabajar, junto con mis CV y el formulario de contacto.

Partí de una maqueta HTML y la llevé a Vue, conservando el monograma, las tipografías y la organización de las secciones. El contenido llega desde mi API en Laravel; en este repositorio trabajo en cómo se ve el sitio y cómo se usa.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| Vue 3.5 | Organiza la interfaz en componentes y actualiza lo que se muestra al cambiar los datos. |
| TypeScript | Me ayuda a detectar errores en el uso de los datos antes de publicar. |
| Vite 8 | Muestra los cambios mientras trabajo y prepara los archivos para publicar el sitio. |
| Tailwind CSS 4 | Lo uso para los estilos, los tamaños y la adaptación a distintas pantallas. |

Mientras trabajo en la interfaz, Vite muestra los cambios en el navegador sin que tenga que actualizar la página manualmente. Para publicar, compilo la aplicación y sirvo los archivos generados con Nginx.

## Organización

Mantengo separadas las secciones del sitio, la carga de contenido y el envío del formulario:

| Archivo | Función |
| --- | --- |
| [App.vue](src/App.vue) | Organiza las secciones, el formulario y los controles de idioma, tema y CV. |
| [usePortfolio.ts](src/composables/usePortfolio.ts) | Pide el contenido a la API según el idioma seleccionado. |
| [portfolioContract.ts](src/lib/portfolioContract.ts) | Comprueba que los datos recibidos tengan el formato que espera la interfaz. |
| [uiCopy.ts](src/lib/uiCopy.ts) y [copy.ts](src/lib/copy.ts) | Contienen los textos de botones, etiquetas y mensajes en español e inglés. |
| [useTheme.ts](src/composables/useTheme.ts) | Aplica el tema claro u oscuro según la preferencia del sistema o la selección manual. |
| [useContact.ts](src/composables/useContact.ts) | Envía el formulario y muestra el resultado. |
| [NotFound.vue](src/components/NotFound.vue) | Muestra una página con regreso al inicio cuando la dirección no existe. |

Los textos sobre mi experiencia y mis proyectos están en la API. Los botones, etiquetas y mensajes de la interfaz quedan aquí, para poder ajustarlos junto con la presentación.

## Desarrollo local

Normalmente trabajo desde [portfolio-workspace](https://github.com/FelixSaucedo/portfolio-workspace), donde ejecuto la API y la interfaz juntas con Docker.

Con la API y su contenido ya preparados, uso estos comandos desde la carpeta del workspace:

```bash
docker compose up -d --build
docker compose exec ui npm test
docker compose exec ui npm run build
```

El sitio queda disponible en `http://localhost`. El README del workspace explica cómo preparar el proyecto completo.

También puedo trabajar directamente desde este repositorio con Node 22.18 o posterior de la rama 22, o con Node 24. Si la API está disponible en `http://localhost:8080`, ejecuto:

```bash
npm ci
API_PROXY_TARGET=http://localhost:8080 npm run dev
```

Después puedo abrir la interfaz en `http://localhost:5173`. `npm ci` instala las dependencias del proyecto y `npm run dev` inicia Vite. Si ejecuto la API en otra dirección, ajusto `API_PROXY_TARGET`.

## Idioma, tema y navegación

El sitio tiene versiones en español e inglés, y temas claro y oscuro. Guardo la selección en el navegador para conservarla al volver a visitar la página.

Dejé los accesos a CV y contacto en la cabecera, y los controles de idioma y tema en una barra fija. Así puedo mantenerlos disponibles sin llenar la navegación de botones.

Uso enlaces a las secciones porque el portafolio se recorre dentro de una misma página. Si alguien abre una dirección que no existe, muestro una página con un botón para volver al inicio.

La API entrega los colores de cada categoría y la interfaz decide cómo aplicarlos a los fondos, textos y demás elementos. Esto me permite ajustar los acentos sin cambiar los estilos de cada sección.

Antes de mostrar el contenido, reviso el formato de los datos recibidos. TypeScript ayuda durante el desarrollo, pero las respuestas de la API también necesitan esa comprobación. Si no puedo cargar el contenido, muestro un mensaje y la opción de reintentar.

## Formulario de contacto

Al enviar el formulario, incluyo el texto del motivo elegido, el idioma y el tema. Así los correos reflejan lo que la persona vio al escribir.

Mientras envío el mensaje, deshabilito el botón para evitar envíos repetidos. Si hay un error, conservo lo escrito y muestro qué ocurrió: un campo por corregir, demasiados intentos o un problema de conexión.

La confirmación indica que el mensaje quedó guardado. Si los correos siguen pendientes, lo explico sin pedir que se vuelva a enviar el formulario.

También dejo mi dirección de contacto: [contacto@felixsaucedo.com](mailto:contacto@felixsaucedo.com).

## CV

Guardo mis dos CV en `public/`, con estos nombres:

| Idioma | Archivo |
| --- | --- |
| Español | `public/Felix_Saucedo.pdf` |
| Inglés | `public/Felix_Saucedo_EN.pdf` |

El botón descarga el documento que corresponde al idioma seleccionado. Cuando compilo el sitio, Vite copia ambos PDF a `dist/`, la carpeta que contiene los archivos para publicar.

## Información del sitio

En [index.html](index.html) mantengo el título, las descripciones y los datos que usan los buscadores y las vistas previas al compartir un enlace. También está la integración de Google Tag Manager para la analítica.

Actualizo el idioma y las descripciones cuando se carga el contenido de la API.

## Pruebas y compilación

Desde el workspace ejecuto:

```bash
docker compose exec ui npm test
docker compose exec ui npm run build
```

Si trabajo con Node directamente, indico la dirección de la API para las pruebas:

```bash
PORTFOLIO_TEST_API_URL=http://localhost/api/v1/portfolio npm test
npm run build
```

Ajusto esa dirección si la API usa otro puerto. Las pruebas revisan el contenido en ambos idiomas, las preferencias del navegador y el formulario ante errores de conexión, respuestas inesperadas o envíos repetidos.

`npm run build` primero revisa los tipos con `vue-tsc` y después compila con Vite. Si encuentra un error de tipos, detiene la compilación.

También mantengo pruebas con Chromium y Playwright para revisar el sitio en el navegador. En ellas simulo las respuestas del formulario y desactivo la analítica, para no enviar correos reales ni registrar esas visitas.

## Despliegue

Publico la interfaz como parte de mi sitio en AWS. Uso `Dockerfile.prod` para compilarla y Nginx para servir los archivos de `dist/`. La configuración que une la interfaz con la API está en [portfolio-workspace](https://github.com/FelixSaucedo/portfolio-workspace).
