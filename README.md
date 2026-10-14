# Prospectar · Preguntas para negocios

Herramienta web para **validar si un negocio realmente necesita tu solución** antes de venderle algo.

Ya conocemos los problemas típicos de cada nicho y las soluciones que ofrecemos. Lo que no sabemos es si **este negocio en particular** tiene ese problema, si le duele lo suficiente y si está dispuesto a comprometerse. La app guía la entrevista con preguntas basadas en dos libros:

- **The Mom Test** (Rob Fitzpatrick): preguntar por hechos concretos del pasado y no por opiniones ni hipótesis, para que el cliente no te mienta por amabilidad.
- **Rompe la barrera del no** (Chris Voss): abrir la conversación, manejar objeciones con etiquetas y preguntas calibradas, y conseguir un "así es" real.

Con las respuestas clasificadas, la app calcula un **puntaje**, da un **veredicto** y recomienda **solo las soluciones de los problemas que quedaron validados con hechos**.

---

## Funcionalidades

- **Catálogo de nichos.** 138 nichos agrupados en 63 categorías, con sus problemas típicos, la solución para cada problema (descripción y qué incluye) y la estrategia de contacto recomendada (canal, efectividad y consejos).
- **Entrevista guiada.** Un formulario en 7 pasos:
  1. Datos del negocio (nombre, nicho, contacto, canal, presencial u online).
  2. Apertura.
  3. Su negocio y prioridades.
  4. Problemas del nicho: 5 preguntas por cada problema típico.
  5. Presupuesto y decisión.
  6. Cierre y compromiso.
  7. Objeciones y notas.
- **Leyenda debajo de cada respuesta.** Muestra cómo suena una *respuesta esperada* y cuáles son las *señales de alerta*.
- **Clasificación de respuestas.** Cada respuesta se marca como **Hecho concreto**, **Vago / genérico** o **Cumplido / futuro**.
- **Resultado en vivo.** Puntaje de 0 a 100, veredicto y aviso de *posible cliente zombi* (más cumplidos que hechos y ningún compromiso).
- **CRUD de negocios.** Listado paginado (10 por página) con búsqueda y filtros por categoría, nicho y veredicto, y orden por fecha, nombre o puntaje. Desde ahí se ve el detalle, se edita, se elimina o se seleccionan varios a la vez.
- **Guardado automático en el navegador** (`localStorage`) mientras respondés.
- **Exportar e importar JSON** para no perder los datos al limpiar el navegador o para pasarlos a otro equipo.
- **Tema claro, oscuro o del sistema**, y diseño adaptado a celular para entrevistas en persona.

---

## Requisitos e instalación

- Node.js 20 o superior.
- [pnpm](https://pnpm.io).
- El binario `unzip`, solo si vas a regenerar los datos de nichos.

```bash
pnpm install
pnpm dev          # desarrollo en http://localhost:3000/preguntas_para_negocios
pnpm build        # export estático en out/
pnpm lint         # ESLint
```

---

## Cómo usarla

### 1. Preparar la visita

Entrá a **Nichos**, buscá el nicho del negocio y revisá:

- los **problemas típicos**: son *hipótesis*, no verdades;
- la **estrategia de contacto**: qué canal funciona mejor y cómo acercarte.

Desde el nicho podés tocar **"Prospectar un negocio de este nicho"** para empezar la entrevista con el nicho ya elegido.

### 2. Hacer la entrevista

En **Nuevo prospecto**, cargá el nombre del negocio y elegí el nicho. Desde ese momento **se guarda solo**.

Apenas elegís el nicho aparecen sus **problemas típicos y la solución de cada uno** (con qué incluye), para que sepas por dónde guiar la charla. Son hipótesis para vos: no se las leas al cliente.

Recorré los pasos con **Siguiente**, o tocá cualquier paso del indicador de arriba. En cada pregunta:

1. Anotá lo que dijo **con sus palabras**.
2. Compará su respuesta con la leyenda (respuesta esperada / alerta).
3. Clasificala:
   - **Hecho concreto:** pasado, específico, con números o casos ("el martes perdí 2 turnos").
   - **Vago / genérico:** "siempre", "a veces", "en general". Repreguntá: *"¿cuándo fue la última vez?"*.
   - **Cumplido / futuro:** "qué buena idea", "lo usaría", "pagaría". Ese tipo de respuesta resta puntos.

> **Importante:** nunca le leas la hipótesis al cliente ni presentes tu solución. Preguntá cómo maneja hoy esa parte del negocio y dejá que el problema aparezca solo.

En **Problemas del nicho**, cada problema se marca como **Validado** cuando:

- la pregunta *"¿cuándo fue la última vez?"* tiene un hecho concreto,
- y además hay un hecho concreto en *costo* o en *qué probó para resolverlo*.

En **Su negocio y prioridades**, debajo de *"¿Qué es lo que más tiempo o dolores de cabeza te lleva hoy?"*, además del cuadro de texto podés **seleccionar los dolores conocidos del nicho** que el cliente mencionó por su cuenta. Esos problemas aparecen primero en **Problemas del nicho**, abiertos y marcados como **"Lo mencionó"**. La marca también se puede poner o sacar desde cada tarjeta.

Si el cliente lo mencionó por su cuenta con un caso claro, también podés marcar **"Confirmado manualmente"**.

En **Cierre y compromiso**:

- Seguí la guía **Próximo paso**, que cambia según lo validado y el compromiso que ya tenés, con frases listas para decir:
  - sin problemas validados: no ofrezcas nada; anclá hechos y pedí un referido;
  - con problema validado y sin compromiso: nombrá el valor de la solución y pedí una reunión con fecha para mostrar una maqueta;
  - con compromiso de tiempo o reputación: en esa reunión pedí seña o piloto pago, con el precio anclado en lo que ya gasta;
  - con compromiso de dinero: asegurá el "cómo" de la implementación.
- Marcá los criterios de **early evangelist** que demostró: tiene el problema, sabe que lo tiene, buscó una solución, armó un parche propio, tiene presupuesto.
- Registrá el **compromiso** que conseguiste: ninguno, tiempo, reputación o dinero. Sin compromiso no hay cliente.

En **Objeciones y notas**, marcá las objeciones que surgieron. Cada una trae una *etiqueta* ("Parece que…") y una *pregunta calibrada* para seguir sin confrontar. Anotá qué respondió.

Al final tocá **"Guardar y ver resultado"**.

### 3. Leer el resultado

| Veredicto | Significado |
|---|---|
| **Necesita la solución** | Hay problemas validados con hechos, puntaje ≥ 65 y algún compromiso. |
| **Tal vez** | Hay dolor validado, pero falta evidencia o compromiso. Pedí un próximo paso concreto. |
| **No lo necesita (por ahora)** | Ningún problema validado: lo tolera o solo fue amable. |
| **Sin evaluar** | Todavía no hay respuestas clasificadas. |

El puntaje (0–100) suma:

- problemas validados: hasta 40 puntos (20 por problema, máximo 2);
- criterios de early evangelist: hasta 30 (6 por criterio);
- compromiso: tiempo 10, reputación 20, dinero 30;
- interés: 5 por cada par que mencionó como problema y eligió como prioridad, y 5 por cada "así es" del resumen de cierre, hasta 15.

El puntaje final nunca pasa de 100. Solo cuentan los problemas del nicho actual.

Los cumplidos restan 3 puntos cada uno, hasta un máximo de 15. Los pesos se ajustan en `lib/scoring.ts`.

En el detalle del negocio vas a ver las **soluciones recomendadas**: solo las que resuelven problemas validados. El precio no se muestra: se acuerda con cada cliente.

### 4. Gestionar los negocios

En **Negocios**:

- **Buscar** por nombre, contacto o nicho, y **filtrar** por categoría, nicho o veredicto. Los filtros quedan en la URL, así que podés guardar o compartir la vista.
- **Ver**, **editar** o **eliminar** cada negocio con los íconos de la fila. Antes de eliminar se pide confirmación.
- **Seleccionar** varios negocios para exportarlos o eliminarlos juntos.

### 5. Exportar e importar (respaldo)

Los datos viven **solo en este navegador**. Si limpiás los datos del sitio o cambiás de equipo, se pierden. Por eso conviene exportar seguido.

- **Exportar:** usá *Exportar todos*, exportá una selección o tocá *Exportar* en el detalle de un negocio. Se descarga un `.json`.
- **Importar:** usá *Importar JSON* y elegí el archivo. Antes de aplicar los cambios ves un resumen:
  - los **negocios nuevos se suman** (2 cargados + 7 importados = 9);
  - si un **nombre se repite** (sin importar mayúsculas ni acentos), **gana el que tiene la fecha `updatedAt` más reciente**;
  - los registros inválidos se descartan.

Formato del archivo:

```json
{
  "app": "preguntas-para-negocios",
  "version": 1,
  "exportedAt": "2026-10-13T18:00:00.000Z",
  "businesses": [
    {
      "id": "…",
      "name": "Dental Sonrisa",
      "nicheId": "clinica-dental-general",
      "answers": { "prob-last-time::clinica-dental-general--p1": { "text": "…", "signal": "fact" } },
      "evangelist": [true, true, false, false, false],
      "commitment": "time",
      "createdAt": "…",
      "updatedAt": "…"
    }
  ]
}
```

`updatedAt` solo cambia cuando editás algo de verdad. Abrir un negocio sin modificarlo no le cambia la fecha.

---

## Fuentes de conocimiento

Están en `docs/`:

| Archivo | Uso |
|---|---|
| `PROBLEMAS DE NICHOS Y SOLUCIONES.docx` | Nichos, problemas, soluciones y estrategias de contacto. |
| `README-MOM-TEST.md` | Base de las preguntas, las leyendas y el criterio de validación. |
| `README-ROMPE-LA-BARRERA-DEL-NO.md` | Apertura, objeciones, etiquetas y preguntas calibradas. |

### Actualizar los nichos

Si editás el `.docx`, regenerá los datos con:

```bash
pnpm parse:niches
```

El script `scripts/parse-niches.mjs` lee los estilos de título del documento (Título 1 = categoría, Título 2 = nicho, Título 3 = sección, Título 4 = solución) y genera:

- `data/niches.json`: datos completos, usados por las páginas del catálogo en el servidor;
- `data/niche-index.json`: índice liviano (nombres y categorías) para el navegador;
- `public/data/niches/{id}.json`: un archivo por nicho, que se carga bajo demanda en la entrevista y en el detalle.

Para que el script funcione, mantené la misma estructura de títulos en el documento.

Las preguntas y las objeciones se editan en `data/questions.ts` y `data/objections.ts`.

---

## Estructura del proyecto

```
app/                     Rutas (App Router)
  page.tsx               Inicio: resumen y reglas de oro
  negocios/              Listado, nuevo, ver?id=… y editar?id=…
  nichos/                Catálogo y detalle por nicho
components/
  business/              Formulario, detalle, listado, veredicto
  niches/                Selector, catálogo, estrategia de contacto
  layout/                Header, navegación, tema
  ui/                    Botones, campos, diálogo, toasts, paginación
data/                    Nichos generados, preguntas y objeciones
lib/
  storage.ts             Store sobre localStorage (useSyncExternalStore)
  scoring.ts             Puntaje y veredicto
  transfer.ts            Exportar, importar y merge por nombre y fecha
  business.ts            Creación y validación de negocios
scripts/parse-niches.mjs Conversión del .docx a JSON
docs/                    Fuentes de conocimiento
```

**Stack:** Next.js 16 (App Router, export estático), React 19, Tailwind CSS v4, TypeScript, lucide-react y la fuente Mona Sans.

---

## Despliegue en GitHub Pages

El sitio es 100% estático (`output: "export"` en `next.config.ts`) y se publica con el workflow `.github/workflows/nextjs.yml` en cada push a `master`.

1. En GitHub: **Settings → Pages → Source: "GitHub Actions"**.
2. Hacé push a `master`. Podés seguir el build en la pestaña **Actions**.
3. El sitio queda en `https://<usuario>.github.io/preguntas_para_negocios/`.

Hay algunas restricciones del export estático que conviene respetar:

- **No hay rutas dinámicas por negocio.** Los negocios viven en el navegador, así que el detalle y la edición usan un parámetro en la URL (`/negocios/ver/?id=…`, `/negocios/editar/?id=…`).
- **`basePath` es `/preguntas_para_negocios`** (el nombre del repo). `next/link` lo agrega solo. Para `fetch` usá `process.env.NEXT_PUBLIC_BASE_PATH` (ver `lib/niche-client.ts`). Si renombrás el repo, cambiá `basePath` en `next.config.ts` y en `image-loader.ts`.
- **`trailingSlash: true`** genera `ruta/index.html`, para que recargar cualquier página funcione en Pages.
- **No se puede usar `cacheComponents` ni `partialPrefetching`.** Activan PPR, que no es compatible con el export estático.

