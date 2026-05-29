---
name: test-data-management
description: Gestionar datos de prueba en el proyecto: estructura de carpetas Data/, carga tipada de JSON desde TypeScript, parametrización con Scenario Outline + Examples, generación dinámica con FakerAPI, datos sintéticos sensibles enmascarados, y persistencia de outputs (capturas de pedidos, fixtures). Usar al añadir datasets, parametrizar escenarios, generar datos aleatorios o crear archivos de output durante la ejecución.
---

# Skill: Gestión de datos de prueba

## Estructura de carpetas

```
features/
├── web/Data/
│   ├── Form/
│   │   └── datos_estudiante.json         # dataset por nombre
│   └── Images/
│       └── perfil.png
├── api/Data/                              # fixtures de request/response
└── shared/data/                           # datos transversales
```

**Regla:** Cada módulo tiene su propio `Data/`. Solo lo realmente compartido entre módulos vive en `shared/data/`.

---

## Carga de JSON tipado

### Patrón básico

```typescript
// features/web/Data/Form/types.ts
export interface DatosEstudiante {
  nombres: string;
  apellidos: string;
  email: string;
  genero: 'Male' | 'Female' | 'Other';
  movil: string;
  fechaNacimiento: { dia: string; mes: string; anio: string };
  materias: string[];
  hobbies: string[];
  imagenPerfil: string;
  direccion: string;
  estado: string;
  ciudad: string;
}
```

```typescript
// features/web/Data/Form/loader.ts
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DatosEstudiante } from './types';

export const cargarDataset = (nombre: string): DatosEstudiante => {
  const filePath = path.resolve(
    process.cwd(),
    'features/web/Data/Form',
    `${ nombre }.json`,
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset no encontrado: ${ filePath }`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as DatosEstudiante;
};
```

### Patrón con `import` directo (TypeScript con `resolveJsonModule`)

Si `tsconfig.json` tiene `"resolveJsonModule": true`:

```typescript
import datosEstudiante from '../../web/Data/Form/datos_estudiante.json';

// datosEstudiante tiene tipo inferido del JSON
```

Pero **prefiere `cargarDataset(nombre)`** cuando el dataset se elige dinámicamente desde el `.feature`.

---

## Parametrización con Scenario Outline

### Patrón del proyecto (web `Form.feature`)

```gherkin
Feature: Gestión de formulario Practice Form

  @form
  Scenario Outline: Registro exitoso de estudiante
    Given que <actor> accede al formulario de registro
    When <actor> diligencia el formulario con "<dataset>"
    Then <actor> envía la información
    Then <actor> debería ver los datos registrados correctamente de acuerdo a "<dataset>"

    Examples:
      | actor   | dataset            |
      | Pepito  | datos_estudiante   |
      | Ana     | datos_estudiante_2 |
```

### Step que recibe el nombre del dataset

```typescript
import { cargarDataset } from '../../web/Data/Form/loader';

When('{actor} diligencia el formulario con {string}',
  async (actor: Actor, dataset: string) => {
    await actor.attemptsTo(
      LlenarFormulario.conDataset(dataset),   // recibe nombre
    );
  },
);
```

### Task que carga el JSON

```typescript
import { Task } from '@serenity-js/core';
import { cargarDataset } from '../../Data/Form/loader';

export class LlenarFormulario {
  static conDataset = (nombre: string) =>
    Task.where(`#actor diligencia el formulario con dataset "${ nombre }"`,
      Interaction.where('carga y diligencia', async actor => {
        const datos = cargarDataset(nombre);
        await actor.attemptsTo(
          Enter.theValue(datos.nombres).into(FormUI.firstName()),
          Enter.theValue(datos.email).into(FormUI.email()),
          // ...
        );
      }),
    );
}
```

---

## DataTable de Cucumber

Cuando los datos vienen inline en el `.feature` (ej: API `crear-recurso.feature`):

```gherkin
When Jorge crea un recurso en "/post" con:
  | name  | Julio |
  | role  | qa    |
```

```typescript
import { DataTable } from '@cucumber/cucumber';

When('{actor} crea un recurso en {string} con:',
  async (actor: Actor, endpoint: string, table: DataTable) => {
    const body = table.rowsHash();   // { name: 'Julio', role: 'qa' }
    await actor.attemptsTo(CrearRecurso.conBody(endpoint, body));
  },
);
```

### Variantes de DataTable

| Método | Estructura | Uso |
|---|---|---|
| `table.raw()` | `string[][]` | matriz cruda |
| `table.rows()` | `string[][]` (sin header) | con header como llaves |
| `table.rowsHash()` | `Record<string, string>` | tabla 2-col clave/valor |
| `table.hashes()` | `Record<string, string>[]` | tabla con header (lista de objetos) |

---

## Generación dinámica de datos

### FakerAPI (caso real del proyecto)

El proyecto ya consume `https://fakerapi.it/api/v2/...` como endpoint externo. Útil para usuarios, direcciones, productos, etc.:

```typescript
// Task
GetRequest.to(`/api/v2/companies?_quantity=${ quantity }`);
GetRequest.to(`/api/v2/users?_quantity=10&_locale=es_CO`);
GetRequest.to(`/api/v2/addresses?_quantity=5`);
```

### `@faker-js/faker` (local, sin red)

Si el proyecto añade `@faker-js/faker`:

```typescript
import { faker } from '@faker-js/faker';
faker.locale = 'es';

const usuario = {
  nombres: faker.person.firstName(),
  apellidos: faker.person.lastName(),
  email: faker.internet.email(),
  movil: faker.phone.number('3#########'),
  direccion: faker.location.streetAddress(),
};
```

**Regla:** datos sintéticos generados deben loguearse o guardarse para reproducir fallos:

```typescript
import * as fs from 'node:fs';
fs.writeFileSync(
  `features/web/Data/Form/_generated_${ Date.now() }.json`,
  JSON.stringify(usuario, null, 2),
);
```

---

## Persistencia de outputs durante la ejecución

Cuando un test extrae datos del DOM o response y los guarda (ej: `CaptureOrderData` del proyecto):

### Convención de nombres con timestamp

```typescript
const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, '-')
  .slice(0, 19);                  // "2026-05-15T14-30-12"

const fileName = `pedido_${ timestamp }.json`;
```

### Escritura segura

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';

const dir = path.resolve(process.cwd(), 'features/web/Data/orders');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(
  path.join(dir, fileName),
  JSON.stringify(data, null, 2),
  { encoding: 'utf-8' },
);
```

### Reglas

- ✅ Crear el directorio recursivamente si no existe
- ✅ Indentación de 2 espacios en JSON
- ✅ UTF-8 para soportar tildes/eñes/emojis
- ✅ Timestamp en el nombre para no sobrescribir
- ❌ Nunca usar `:` en nombre de archivo (Windows incompatible)
- ❌ Nunca commitear outputs al repo (añadir al `.gitignore`)

---

## Datos sensibles

### Reglas inviolables (proyecto)

1. **NO commitear:** credenciales reales, tokens, endpoints internos, datos de clientes
2. **Usar mocks:** `test_user`, `test_password`, `https://example.com`
3. **Variables de entorno:** datos sensibles van en `.env.*` que NO se commitea
4. **Enmascarar en logs:** `password: "***"` en cualquier output

### Patrón de mock seguro

```typescript
// .env.web (commiteado con valores mock)
APP_USER=test_user
APP_PASSWORD=test_password
APP_URL=https://example.com

// .env.web.local (NO commiteado, valores reales en local/CI)
APP_USER=usuario_real
APP_PASSWORD=clave_real
APP_URL=https://app-real.empresa.com
```

```typescript
// step
const user = process.env.APP_USER ?? 'test_user';
const pass = process.env.APP_PASSWORD ?? 'test_password';
```

### Enmascarado en reportes

```typescript
import { Task } from '@serenity-js/core';

export const Login = (user: string, pass: string) =>
  Task.where(
    `#actor inicia sesión con usuario ${ user }`,   // password NO en descripción
    Enter.theValue(user).into(LoginUI.user()),
    Enter.theValue(pass).into(LoginUI.password()),  // valor no aparece en reporte
    Click.on(LoginUI.submit()),
  );
```

---

## Carga por entorno (multi-ambiente)

```typescript
// features/web/Data/by-env.ts
const env = process.env.TEST_ENV ?? 'qa';   // qa | uat | prod-readonly

const datos = {
  qa:   { url: 'https://qa.app.com',   user: 'qa_user' },
  uat:  { url: 'https://uat.app.com',  user: 'uat_user' },
  prod: { url: 'https://app.com',      user: 'readonly_user' },
};

export const datosAmbiente = datos[env as keyof typeof datos];
```

---

## Anti-patrones

- ❌ Hardcodear datos en Tasks (`Enter.theValue('Pepito').into(...)`)
- ❌ Repetir el mismo dataset en múltiples `Examples` cuando podría parametrizarse
- ❌ Importar JSON con paths relativos profundos (usar loader o `path.resolve`)
- ❌ Reusar datasets entre escenarios que mutan estado (cada escenario su dataset)
- ❌ Cargar el JSON en el `top-level` del módulo (ejecuta en import)
- ❌ Commitear `Data/orders/pedido_*.json` u otros outputs
- ❌ Datos sensibles en `.env` commiteado
- ❌ DataTables con más de 5 columnas (usar JSON externo)

---

## Estructura recomendada de un dataset JSON

```json
{
  "_meta": {
    "descripcion": "Estudiante para flujo de registro feliz",
    "creadoPor": "QA Team",
    "version": 1
  },
  "datos": {
    "nombres": "Pepito",
    "apellidos": "Pérez",
    "email": "pepito@example.com",
    "genero": "Male",
    "movil": "3001234567"
  }
}
```

`_meta` es opcional pero ayuda a entender datasets sin abrir el código que los usa.

---

## Checklist de calidad

- [ ] El dataset está en el `Data/` del módulo correspondiente
- [ ] Hay un tipo TypeScript que describe la estructura
- [ ] El loader usa `path.resolve(process.cwd(), ...)` (no rutas relativas frágiles)
- [ ] El `Scenario Outline` referencia el dataset por nombre, no inline
- [ ] Datos sensibles están en `.env.*` y no en JSON commiteado
- [ ] Outputs de ejecución usan timestamp y están en `.gitignore`
- [ ] El generador faker (si aplica) guarda los datos generados para reproducción
- [ ] No hay credenciales reales hardcoded
