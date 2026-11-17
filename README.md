# BusPass 🚌 • Planificador de Bonos de Autobús y Calendario

Una aplicación web **100% responsive y mobile-first**, diseñada para gestionar y optimizar el consumo de bonos de transporte escolar y universitario durante el curso académico (de **Noviembre a Mayo**).

Totalmente construida con **HTML5, CSS3 y JavaScript vanilla** (sin dependencias ni frameworks pesados), lista para ser alojada de forma estática en **GitHub Pages**.

---

## 📱 Características Principales

- **Diseño Mobile-First & Minimalista:** Pensada para ser usada cómodamente con una sola mano en smartphones, con áreas táctiles amplias (44px+) y transiciones fluidas.
- **Modo Oscuro por defecto (Dark Mode):** Interfaz moderna y descansada para la vista, con conmutador instantáneo a Modo Día (Light Mode) y persistencia de preferencia en `localStorage`.
- **Sin Emojis — Iconografía Vectorial Bicolor (SVG Duotone):** Iconos limpios, semánticos y bicolores que se adaptan automáticamente a la paleta de color del tema.
- **Rango de Curso Completo (Noviembre a Mayo):** Selector de 7 meses horizontal táctil con scroll suave y píldoras informativas en tiempo real.
- **Sincronización en Tiempo Real (Localhost, GitHub Pages y Móvil):**
  - Sistema de **Sala de Sincronización (Sync Room ID)** integrado.
  - Al poner el mismo código en `localhost:8080` y en tu web de `GitHub Pages` (o en tu móvil), **los datos se sincronizan en tiempo real**.
  - Enlace directo de sincronización (`?room=mi-sala`) para vincular el móvil en un solo clic.
  - Sincronización instantánea entre pestañas abiertas mediante `BroadcastChannel`.
  - Funcionamiento *offline-first*: si no hay internet sigue guardando en `localStorage` y sincroniza en cuanto vuelve la conexión.
- **Calendario Dinámico e Interactivo:**
  - **Un toque/clic:** Marca o desmarca un día de clase en tiempo real.
  - **Pulsación larga en móvil o clic derecho en desktop:** Abre el selector para personalizar el número exacto de viajes de ese día (0 = sin clase, 1 = solo ida/vuelta, 2 = ida y vuelta, 4 = doble turno).
  - **Viajes por defecto configurables:** Selector rápido en la barra superior (por defecto 2 viajes por día de clase).
  - **Herramientas rápidas:** Botones para marcar patrones comunes en 1 clic (`L-V`, `L-X-V`, `L-J`) o limpiar el mes.
- **Simulador y Asesor Inteligente de Bonos:**
  - **Bono Mensual (20 viajes):** Activable mes a mes. Solo es válido en el mes en curso y sus viajes no consumidos caducan a fin de mes.
  - **Bonos Sueltos de 8 viajes (con edición de viajes restantes):**
    - Se pueden comprar bonos enteros de 8 viajes en cualquier momento.
    - **Bono en uso / Viajes sueltos:** Si ya empezaste un bono o te quedan viajes sueltos (por ejemplo, 3 o 5 viajes), puedes ajustarlos de 1 en 1 con el stepper `+`/`-` o pulsar directamente sobre el número para introducir la cifra exacta.
    - Todos los viajes sobrantes de bonos acumulables **se transfieren automáticamente como remanente al mes siguiente**.
  - **Semáforo de Cobertura en el Calendario:**
    - 🟢 *Verde esmeralda:* Días cubiertos por el Bono Mensual de 20.
    - 🟣 *Índigo / Azul:* Días cubiertos por Bonos de 8 viajes.
    - 🟡 *Ámbar:* Días con cobertura parcial (mixto).
    - 🔴 *Rojo sutil:* Días sin billete (descubiertos).
  - **Asesor de Compra:** Te calcula con exactitud si te quedas corto y te dice cuántos bonos de 8 viajes comprar este mes, con un botón para añadirlos directamente.
- **Persistencia Local (`localStorage`):** Guarda automáticamente tus días marcados, bonos y configuraciones para que no pierdas nada al recargar o cerrar el navegador.
- **PWA Ready:** Metadatos completos para agregar como app a la pantalla de inicio en iOS y Android (`manifest`/`apple-mobile-web-app-capable`, color de barra de estado reactiva).

---

## 🗂️ Estructura del Proyecto

```text
├── index.html        # Estructura semántica, metadatos PWA y favicons
├── data.json         # Fuente única de verdad con la configuración y días marcados
├── css/
│   └── styles.css    # Variables CSS, diseño mobile-first, Dark/Light mode y layout
├── js/
│   ├── icons.js      # Catálogo de iconos SVG duotone (bicolores, sin emojis)
│   └── app.js        # Lógica de cálculo, calendario y gestor de data.json
└── README.md         # Documentación y guía de despliegue
```

---

## 💻 Ejecución en local

Puedes levantar la app localmente con el servidor estándar de Python:

```bash
# Servidor estándar:
python3 -m http.server 8080

# O con el script local de auto-guardado en data.json (si lo usas localmente):
python3 server.py 8080
```

Abre tu navegador en:
👉 [http://localhost:8080](http://localhost:8080)

> **Nota:** La app no utiliza `localStorage`. Toda la lectura y guardado se realiza directamente sobre el archivo `data.json`.

---

## 🔄 Flujo de Trabajo: Localhost ↔ GitHub Pages

1. **Trabajar en local:**
   - Abre `http://localhost:8080`.
   - Cada clic o ajuste actualiza de inmediato el archivo local `data.json`.
2. **Subir los cambios a GitHub Pages:**
   - Cuando quieras actualizar la versión publicada en GitHub Pages, simplemente comitea el archivo `data.json`:
     ```bash
     git add data.json
     git commit -m "update: actualizados viajes y bonos en data.json"
     git push origin main
     ```
   - Al entrar a tu web en GitHub Pages, cargará exactamente el mismo `data.json`.
3. **Exportar / Importar desde GitHub Pages (Móvil o Web pública):**
   - En GitHub Pages (al ser un alojamiento estático), puedes pulsar el icono del disquete en el encabezado y hacer clic en **"Descargar data.json actual"**.
   - Luego reemplazas el archivo `data.json` en tu carpeta local o usas el botón **"Cargar / Importar data.json"**.

---

## 🚀 Despliegue inicial en GitHub Pages

Para publicar esta app en tu cuenta de GitHub y acceder a ella desde cualquier móvil:

1. **Crear o vincular tu repositorio en GitHub:**
   ```bash
   git add .
   git commit -m "feat: primera versión de BusPass con calendario y bonos"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Activar GitHub Pages:**
   1. Entra a tu repositorio en GitHub.
   2. Ve a **Settings** (Configuración) > **Pages** (en el menú lateral izquierdo).
   3. En **Build and deployment > Source**, selecciona **Deploy from a branch**.
   4. En **Branch**, selecciona `main` y la carpeta `/(root)`, luego haz clic en **Save**.
   5. En un par de minutos, GitHub te proporcionará una URL pública tipo:
      `https://TU_USUARIO.github.io/TU_REPOSITORIO/`

3. **Instalar en la pantalla de inicio del móvil:**
   - **En iPhone (Safari):** Pulsa el botón *Compartir* (icono con flecha arriba) y selecciona *"Añadir a pantalla de inicio"*.
   - **En Android (Chrome):** Pulsa el menú de tres puntos y selecciona *"Añadir a pantalla de inicio"* o *"Instalar aplicación"*.

---

## 💡 Lógica de Cálculo de Bonos

1. **Viajes Requeridos del Mes:** Suma de los viajes asignados a los días marcados en el calendario de ese mes.
2. **Consumo de Bono Mensual (20 viajes):**
   - Si está activo, absorbe hasta 20 viajes del mes.
   - Los viajes que no se usen dentro del mes expiran (no se pasan al mes siguiente).
3. **Consumo de Bonos de 8 Viajes:**
   - Viajes pendientes tras bono mensual = `max(0, requeridos - 20)`.
   - Se cubre con el saldo acumulado (remanente del mes anterior + `8 * nuevos_bonos`).
   - El sobrante de este saldo se convierte en el remanente transferible para el mes posterior.
4. **Alerta de Faltantes:** Si el saldo de bonos no alcanza, se calcula `Math.ceil(faltantes / 8)` para indicarte la compra óptima.

---

## 🛠️ Tecnologías

- **HTML5:** Semántica accesible, meta-etiquetas completas para móviles.
- **CSS3 Moderno:** Custom properties (variables), Grid, Flexbox, Safe Area insets (`env(safe-area-inset-bottom)`), Media Queries adaptativas.
- **JavaScript ES6+:** Programación modular sin frameworks, reactividad ligera y cálculo síncrono.

---

## 📄 Derechos de Autor

© 2026 **Jorge Mompeán Cabezas**. Todos los derechos reservados.


