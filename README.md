# IRON THREADS 3D Customizer

<p align="center">
  <img src="./public/logo.png" alt="IRON THREADS" width="220" />
</p>

<p align="center">
  Customizador 3D de prendas desarrollado con React, Vite, Three.js y Zustand.
  Permite cambiar color, aplicar imagenes por sector, ajustar decals en tiempo real
  y exportar vistas previas junto con la configuracion final en ZIP.
</p>

<p align="center">
  <strong>Estado:</strong> listo para despliegue en Vercel con observaciones de rendimiento<br />
  <strong>Framework:</strong> Vite + React + TypeScript<br />
  <strong>Render:</strong> React Three Fiber + Drei + Three.js
</p>

## Resumen

Esta aplicacion esta pensada para personalizar prendas en 3D desde una interfaz visual limpia:

- Seleccion de modelo de prenda.
- Cambio de color base.
- Carga de imagenes para estampados.
- Aplicacion de decals por sector.
- Ajuste de posicion, escala y rotacion.
- Captura automatica de 4 angulos.
- Exportacion de ZIP con previews, decals y `config.json`.

## Caracteristicas Principales

| Modulo | Descripcion |
| --- | --- |
| Modelos 3D | Soporta `Clasica`, `Oversize`, `Crop Top`, `Long Top` y `Hoodie`. |
| Personalizacion por sectores | Frente, espalda y mangas, con restricciones segun el modelo. |
| Editor visual | Controles superpuestos para mover, escalar y rotar decals. |
| Estado global | Gestionado con Zustand para mantener configuracion y exportacion. |
| Exportacion | Genera capturas del canvas y las empaqueta en ZIP con JSZip. |
| UI | Sidebar de configuracion, canvas central y panel lateral de preview/export. |

## Stack Tecnologico

| Tecnologia | Uso |
| --- | --- |
| React 18 | UI principal |
| TypeScript | Tipado estricto |
| Vite 6 | Bundler y entorno de desarrollo |
| Tailwind CSS | Estilos utilitarios |
| Three.js | Render 3D |
| @react-three/fiber | Integracion React + Three.js |
| @react-three/drei | Helpers 3D, decals, controles y entorno |
| Zustand | Estado global |
| Framer Motion | Transiciones y microinteracciones |
| JSZip | Exportacion ZIP |

## Arquitectura

Flujo principal de la aplicacion:

1. `src/main.tsx` monta la app en `StrictMode`.
2. `src/App.tsx` organiza la interfaz en tres zonas: sidebar, canvas y preview.
3. `src/components/canvas/Scene.tsx` crea el `Canvas` 3D y registra `renderer`, `scene` y `camera`.
4. `src/components/canvas/TShirt.tsx` carga el modelo activo, clasifica meshes por sector y proyecta decals.
5. `src/store/useStore.ts` centraliza color, modelo, sector activo, decals y estado de exportacion.
6. `src/components/ui/PreviewPanel.tsx` captura imagenes y genera el ZIP final.

## Estructura Del Proyecto

```text
.
|-- public/
|   |-- assets/
|   |   |-- shirt_nuevo.glb
|   |   |-- shirt_baked.glb
|   |   |-- tshirt.glb
|   |   `-- hoodie.glb
|   |-- icon.png
|   `-- logo.png
|-- src/
|   |-- assets/
|   |   |-- shirt_nuevo.glb
|   |   |-- oversize.glb
|   |   |-- croptop.glb
|   |   |-- longtop.glb
|   |   |-- hoodie.glb
|   |   `-- menhoodie.glb
|   |-- components/
|   |   |-- canvas/
|   |   |   |-- Environment.tsx
|   |   |   |-- Scene.tsx
|   |   |   `-- TShirt.tsx
|   |   |-- shared/
|   |   `-- ui/
|   |       |-- Sidebar.tsx
|   |       |-- PreviewPanel.tsx
|   |       `-- DecalControlsOverlay.tsx
|   |-- store/
|   |   `-- useStore.ts
|   |-- types/
|   |   `-- index.ts
|   |-- utils/
|   |   `-- export.ts
|   |-- App.tsx
|   |-- index.css
|   `-- main.tsx
|-- scripts/
|-- index.html
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
`-- tsconfig.json
```

## Funcionalidad Detallada

### 1. Modelos disponibles

El proyecto soporta cinco variantes de prenda:

- `shirt_nuevo`
- `oversize`
- `croptop`
- `longtop`
- `hoodie`

Cada una tiene reglas propias de posicionamiento para decals. El caso de `hoodie` usa una logica distinta de rotacion, escala y anclaje por sector.

### 2. Sectores editables

Sectores definidos en `src/types/index.ts`:

- `body_front`
- `body_back`
- `sleeve_left`
- `sleeve_right`

En `hoodie`, actualmente la UI restringe la seleccion a frente y espalda.

### 3. Estado global

El store en `src/store/useStore.ts` maneja:

- Modelo seleccionado.
- Color de la prenda.
- Sector activo.
- Lista de decals por sector.
- Indice del decal activo por sector.
- Estado de exportacion.
- Imagenes capturadas.

Tambien incluye logica para:

- Limitar decals por sector.
- Adaptar posiciones al cambiar de modelo.
- Reiniciar toda la personalizacion.

### 4. Exportacion

La exportacion genera:

- `config.json`
- `preview_front.png`
- `preview_right.png`
- `preview_back.png`
- `preview_left.png`
- `decal_<sector>_<n>.png`

El ZIP se construye desde `src/utils/export.ts` usando JSZip.

## Scripts Disponibles

| Comando | Descripcion |
| --- | --- |
| `npm install` | Instala dependencias |
| `npm run dev` | Levanta Vite en desarrollo |
| `npm run build` | Ejecuta `tsc -b` y build de Vite |
| `npm run preview` | Sirve el build generado |
| `npm run model` | Ejecuta `scripts/generate-model.mjs` |

## Desarrollo Local

### Requisitos

- Node.js 18 o superior recomendado.
- npm.

### Instalacion

```bash
npm install
```

### Servidor de desarrollo

```bash
npm run dev
```

### Build de produccion

```bash
npm run build
```

### Preview local del build

```bash
npm run preview
```

## Despliegue En Vercel

### Estado Actual

El proyecto esta **listo para desplegarse en Vercel** como una aplicacion estatica de Vite.

Validaciones realizadas:

- `npx tsc --noEmit`: correcto.
- `npx vite build`: correcto.
- `npm run build`: correcto.
- No requiere backend ni variables de entorno para funcionar.
- No usa routing SPA que requiera rewrites especiales.

### Configuracion Recomendada En Vercel

| Campo | Valor |
| --- | --- |
| Framework Preset | `Vite` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

No hace falta `vercel.json` con la configuracion actual.

### Observaciones Antes De Produccion

Aunque el despliegue es viable, hay puntos a mejorar:

1. El bundle JS principal generado pesa aproximadamente `1.36 MB` minificado.
2. El asset `menhoodie.glb` generado en build pesa aproximadamente `12.3 MB`.
3. Vite muestra advertencia por chunks grandes.
4. No hay suite de tests automatizados.
5. El script `lint` existe, pero no hay configuracion de ESLint en el repo, por lo que ese flujo no esta realmente preparado.

### Recomendaciones De Mejora Para Vercel

1. Comprimir u optimizar los `.glb`, especialmente el hoodie.
2. Considerar carga diferida de modulos pesados o separacion adicional de chunks.
3. Añadir analisis de bundle para controlar peso de `three`, `drei` y assets.
4. Incorporar una configuracion real de ESLint y, si aplica, tests basicos de smoke.
5. Añadir capturas o demo publica en el README cuando exista el despliegue final.

## Assets 3D

El proyecto trabaja con modelos `.glb` desde dos ubicaciones:

- `public/assets/` para assets servidos de forma publica.
- `src/assets/` para assets incluidos en el grafo de build de Vite.

Esto es importante porque el comportamiento de carga cambia segun el modelo:

- `shirt_nuevo` usa ruta publica.
- `oversize`, `croptop`, `longtop` y `hoodie` usan `new URL(..., import.meta.url).href`.

## Diseno De Interfaz

La interfaz esta dividida en tres paneles:

- Izquierda: configuracion de modelo, sector, imagen y color.
- Centro: canvas 3D interactivo.
- Derecha: capturas previas y exportacion.

Visualmente usa una direccion limpia, clara y comercial, con una paleta centrada en:

- Fondo: `#f8f9fa`
- Acento: `#58aec9`
- Bordes suaves y superficies claras

## Limitaciones Actuales

- La app esta pensada principalmente para escritorio; no hay una capa responsive avanzada para paneles laterales en pantallas pequenas.
- No existe backend ni persistencia remota.
- No hay autenticacion ni gestion de proyectos guardados.
- El rendimiento inicial puede verse afectado por el peso de modelos y librerias 3D.

## Calidad Tecnica

Puntos positivos detectados:

- TypeScript en modo estricto.
- Build de produccion funcionando.
- Separacion clara entre UI, canvas, store, tipos y utilidades.
- Estado global simple y mantenible.
- Exportacion encapsulada en utilidades dedicadas.

Puntos pendientes:

- Sin testing automatizado.
- Sin configuracion efectiva de lint.
- Sin documentacion previa del repositorio.
- Sin optimizacion avanzada de rendimiento para modelos pesados.

## Roadmap Sugerido

1. Optimizar y comprimir modelos 3D.
2. Mejorar experiencia mobile o tablet.
3. Añadir presets guardables o persistencia local.
4. Incorporar validaciones de archivos subidos.
5. Agregar CI con build, typecheck y lint real.

## Creditos

Desarrollado sobre:

- React
- Vite
- Three.js
- React Three Fiber
- Drei
- Zustand
- Tailwind CSS
- Framer Motion

## Licencia

No se ha definido una licencia en este repositorio.
