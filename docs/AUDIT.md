# Auditoría de contenido API, colores, idioma y tema

El build `docker exec portfolio-ui-1 npm run build` pasó sin errores ni advertencias: vue-tsc -b, Vite 8.3.1, 19 módulos.

La prueba Chromium verificó:

- Paridad con respuestas reales ES/EN en hero, filosofías, casos (incluidos trade-offs), liderazgo, tecnologías y trayectoria.
- Rótulos de interfaz, placeholders y enlaces CV localizados.
- Fondos calculados exactos: oscuro rgb(9,13,22), tarjeta rgb(15,23,42), claro rgb(248,250,252), tarjeta blanca. Colores de texto slate según la referencia.
- Cambio y persistencia del idioma y tema al recargar; campos conservados al usar ambos controles.
- Preferencia inicial del sistema, cambio automático del sistema y prioridad de una selección manual.
- Funcionamiento con localStorage restringido, sin excepciones de renderizado.
- 15 tecnologías y filtros dinámicos all/backend/storage-db/cloud-devops, procedentes de las categorías de la API.
- Contrato TypeScript validado con 6 pruebas: respuestas reales ES/EN, campos nulos, traducciones parciales, estructuras inválidas, colecciones vacías y traducción de períodos/subtítulos.
- Contacto simulado: headers JSON, honeypot vacío y respuestas 200/201/202/422/429/500. Error localizado al alternar idioma. No se escribieron submissions.
- Vista móvil de 390 px sin desbordamiento horizontal.

GTM se bloqueó durante QA; la configuración remota de sus tags no se modificó. Las pruebas de enlaces CV verifican el href, no la descarga de documentos, porque los PDF no se incorporaron a public/.

## Repetir las pruebas

Desde sitio/ con el ecosistema iniciado:

```bash
docker exec portfolio-ui-1 npm run build
docker exec portfolio-ui-1 node --experimental-strip-types --test tests/portfolio-contract.test.mjs
mkdir -p /tmp/portfolio-approved-preview
portfolio_gateway_ip="$(docker inspect portfolio-gateway-1 --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')"
docker run --rm --network portfolio-network \
  -e GATEWAY_IP="$portfolio_gateway_ip" \
  -v "$PWD/felixsaucedo-ui:/app:ro" \
  -v /tmp/portfolio-approved-preview:/artifacts \
  --entrypoint sh mcr.microsoft.com/playwright:v1.63.0-noble -ec '
    npm install --prefix /tmp/checks playwright@1.63.0 --no-audit --no-fund >/tmp/npm-install.log
    NODE_PATH=/tmp/checks/node_modules node --experimental-strip-types /app/tests/browser-audit.cjs
  '
```

La referencia HTML y los documentos del repositorio career-lab-main no se modificaron.
