# WebdriverIO Test Automation Framework

Este proyecto es un framework de automatización de pruebas basado en WebdriverIO, Cucumber y el patrón Screenplay. Permite la ejecución de pruebas en entornos web y móviles (Android/iOS), soporta pruebas en dispositivos físicos y en la granja de BrowserStack, y cuenta con reportes detallados mediante Serenity/JS.

## Requisitos previos

Asegúrate de tener instalados los siguientes requisitos:

- **Node.js** (versión recomendada: 16 o superior)
- **npm** (incluido con Node.js)
- **WebdriverIO**
- **Cucumber**
- **Appium** (para pruebas móviles)
- **Configuración de BrowserStack** (si se desea ejecutar pruebas en la nube)

## Instalación del Proyecto

Clona el repositorio y ejecuta:

```sh
npm install
```

Esto instalará todas las dependencias necesarias.

---

## Ejecución de Pruebas

El framework permite ejecutar pruebas de manera flexible, tanto en local como en BrowserStack, para web y móvil.

### 1. Ejecución de todas las pruebas

```sh
npx wdio
```

(Este comando ejecuta la suite completa y corresponde a `"wdio": "wdio run ./wdio.conf.ts"` en el `package.json`)

---

### 2. Ejecución de un feature específico

Para ejecutar un archivo `.feature` específico, usa:

```sh
npx wdio -- --spec features/<nombre-del-feature>.feature
```

(Este comando corresponde a `"wdio": "wdio run ./wdio.conf.ts"` en el `package.json` con la opción `--spec` para especificar un feature)

Ejemplo:

```sh
npx wdio -- --spec features/google_search.feature
```

---

### 3. Ejecución de pruebas con reportes de Serenity/JS

Para ejecutar todas las pruebas y generar reportes:

```sh
npx serenity-bdd run --features ./features
```

(Este comando genera el reporte de Serenity y corresponde a `"serenity:report": "serenity-bdd run --features ./features"` en el `package.json`)

---

## Configuraciones Adicionales

### Modificación de configuraciones en `wdio.conf.ts`

El archivo `wdio.conf.ts` contiene todas las configuraciones, incluyendo:

- **Ambientes** (local, BrowserStack)
- **Tiempo de espera**
- **Paralelismo**
- **Plataformas de ejecución**

Puedes modificarlo según tus necesidades.

---

## Reportes

Las pruebas generan reportes automáticos con Serenity/JS y Allure.

### 1. Reporte de Serenity/JS

Para generar y abrir el reporte:

```sh
npx serenity-bdd run --features ./features
```

(Este comando corresponde a `"serenity:report": "serenity-bdd run --features ./features"` en el `package.json`)

### 2. Reporte de Allure

Para generar el reporte de Allure:

```sh
npx allure generate allure-results --clean -o allure-report
```

Para abrir el reporte de Allure:

```sh
npx allure open allure-report
```

---

## CI/CD con Azure

Este framework está preparado para integrarse con Azure DevOps. Puedes configurar un pipeline para ejecutar las pruebas automáticamente en cada commit.

# WebdriverIO Test Automation Framework

Este proyecto es un framework de automatización de pruebas basado en WebdriverIO, Cucumber y el patrón Screenplay. Permite la ejecución de pruebas en entornos web y móviles (Android/iOS), soporta pruebas en dispositivos físicos y en la granja de BrowserStack, y cuenta con reportes detallados mediante Serenity/JS.

## Requisitos previos

Asegúrate de tener instalados los siguientes requisitos:

- **Node.js** (versión recomendada: 16 o superior)
- **npm** (incluido con Node.js)
- **WebdriverIO**
- **Cucumber**
- **Appium** (para pruebas móviles)
- **Configuración de BrowserStack** (si se desea ejecutar pruebas en la nube)

## Instalación del Proyecto

Clona el repositorio y ejecuta:

```sh
npm install
```

Esto instalará todas las dependencias necesarias.

---

## Ejecución de Pruebas

El framework permite ejecutar pruebas de manera flexible, tanto en local como en BrowserStack, para web y móvil.

### 1. Ejecución de todas las pruebas

```sh
npx wdio
```

(Este comando ejecuta la suite completa y corresponde a `"wdio": "wdio run ./wdio.conf.ts"` en el `package.json`)

---

### 2. Ejecución de un feature específico

Para ejecutar un archivo `.feature` específico, usa:

```sh
npx wdio -- --spec features/<nombre-del-feature>.feature
```

(Este comando corresponde a `"wdio": "wdio run ./wdio.conf.ts"` en el `package.json` con la opción `--spec` para especificar un feature)

Ejemplo:

```sh
npx wdio -- --spec features/google_search.feature
```

---

### 3. Ejecución de pruebas con reportes de Serenity/JS

Para ejecutar todas las pruebas y generar reportes:

```sh
npx serenity-bdd run --features ./features
```

(Este comando genera el reporte de Serenity y corresponde a `"serenity:report": "serenity-bdd run --features ./features"` en el `package.json`)

---

## Configuraciones Adicionales

### Modificación de configuraciones en `wdio.conf.ts`

El archivo `wdio.conf.ts` contiene todas las configuraciones, incluyendo:

- **Ambientes** (local, BrowserStack)
- **Tiempo de espera**
- **Paralelismo**
- **Plataformas de ejecución**

Puedes modificarlo según tus necesidades.

---

## Reportes

Las pruebas generan reportes automáticos con Serenity/JS y Allure.

### 1. Reporte de Serenity/JS

Para generar y abrir el reporte:

```sh
npx serenity-bdd run --features ./features
```

(Este comando corresponde a `"serenity:report": "serenity-bdd run --features ./features"` en el `package.json`)

### 2. Reporte de Allure

Para generar el reporte de Allure:

```sh
npx allure generate allure-results --clean -o allure-report
```

Para abrir el reporte de Allure:

```sh
npx allure open allure-report
```

---

## CI/CD con Azure

Este framework está preparado para integrarse con Azure DevOps. Puedes configurar un pipeline para ejecutar las pruebas automáticamente en cada commit.

