---
name: api-testing-rest
description: Implementar pruebas de API REST con @serenity-js/rest sobre Screenplay Pattern. Cubre CallAnApi, Send con GetRequest/PostRequest/PutRequest/DeleteRequest/PatchRequest, ChangeApiConfig (baseUrl y headers), LastResponse (status/body/header), extracción tipada con Question.about, encadenamiento de requests, autenticación, validación de body y schemas. Usar al crear Tasks o Questions de API, depurar respuestas, o estructurar suites de pruebas REST.
---

# Skill: API Testing con @serenity-js/rest

## Stack del proyecto

- `@serenity-js/rest@^3.31.10` (cliente HTTP basado en axios)
- `@serenity-js/assertions` para `Ensure.that(...)`
- Config en `configs/wdio.api.conf.ts` con `baseUrl: process.env.API_BASE_URL`
- Features en `features/api/Features/*.feature`
- Tasks en `features/api/Tasks/`
- Questions en `features/api/Questions/`
- Steps en `features/step-definitions/api/`

---

## Setup del Actor con CallAnApi

### Opción A: automático vía `baseUrl` del wdio.conf

Cuando `wdio.api.conf.ts` define `baseUrl`, **Serenity/JS configura `CallAnApi` automáticamente**. No hace falta `whoCan(...)` en el step:

```typescript
// configs/wdio.api.conf.ts
baseUrl: process.env.API_BASE_URL,   // ← Serenity lo lee y crea la ability
```

```typescript
// step Given puede estar vacío
Given('que {actor} consume el servicio API', async (_actor: Actor) => {
  // CallAnApi ya está configurada por Serenity/JS via baseUrl
});
```

### Opción B: manual con `whoCan`

Para tests fuera de Cucumber o múltiples bases:

```typescript
import { actorCalled } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';

actorCalled('Jorge').whoCan(
  CallAnApi.at(process.env.API_BASE_URL!),
);
```

### Opción C: con axios config personalizada

```typescript
import { CallAnApi } from '@serenity-js/rest';
import axios from 'axios';

actorCalled('Jorge').whoCan(
  CallAnApi.using(axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 30_000,
    headers: { 'X-Client': 'qa-arquetipo' },
  })),
);
```

---

## Tasks: enviar requests

### GET (patrón del proyecto: `ConsultarHealth.ts`)

```typescript
import { Task } from '@serenity-js/core';
import { GetRequest, Send } from '@serenity-js/rest';

export class ConsultarHealth {
  static delEndpoint = (endpoint: string) =>
    Task.where(
      `#actor consulta el endpoint ${ endpoint }`,
      Send.a(GetRequest.to(endpoint)),
    );
}
```

### POST con body (patrón `CrearRecurso.ts`)

```typescript
import { Task } from '@serenity-js/core';
import { PostRequest, Send } from '@serenity-js/rest';

export class CrearRecurso {
  static conBody = (endpoint: string, body: Record<string, unknown>) =>
    Task.where(
      `#actor crea un recurso en ${ endpoint }`,
      Send.a(PostRequest.to(endpoint).with(body)),
    );
}
```

### PUT / PATCH / DELETE

```typescript
import { PutRequest, PatchRequest, DeleteRequest, Send } from '@serenity-js/rest';

// PUT (reemplaza recurso completo)
Send.a(PutRequest.to(`/users/${ id }`).with({ name: 'nuevo' }));

// PATCH (actualización parcial)
Send.a(PatchRequest.to(`/users/${ id }`).with({ status: 'active' }));

// DELETE
Send.a(DeleteRequest.to(`/users/${ id }`));
```

### Request con headers, query params y config

```typescript
Send.a(
  GetRequest.to('/users')
    .with({                      // body (POST/PUT/PATCH)
      // ...
    })
    .using({                     // axios config local
      headers: {
        'Authorization': `Bearer ${ token }`,
        'Content-Type': 'application/json',
      },
      params: {                  // query string
        page: 1,
        size: 20,
      },
      timeout: 15_000,
    }),
);
```

### Cambiar base URL en runtime (patrón `UsarApi.ts`)

```typescript
import { Task } from '@serenity-js/core';
import { ChangeApiConfig } from '@serenity-js/rest';

export class UsarApi {
  static baseUrl = (url: string) =>
    Task.where(
      `#actor usa la API ${ url }`,
      ChangeApiConfig.setUrlTo(url),
    );

  static withHeader = (name: string, value: string) =>
    Task.where(
      `#actor configura header ${ name }`,
      ChangeApiConfig.setHeader(name, value),
    );
}
```

---

## Questions: leer del response

### Patrón básico — `LastResponse`

```typescript
import { LastResponse } from '@serenity-js/rest';
import { Ensure, equals } from '@serenity-js/assertions';

// Status code
Ensure.that(LastResponse.status(), equals(200));

// Body completo (tipado)
Ensure.that(LastResponse.body<{ id: number }>(), equals({ id: 42 }));

// Header
Ensure.that(LastResponse.header('content-type'), equals('application/json; charset=utf-8'));
```

### Question custom para extraer datos (patrón `UserNameFromResponse.ts`)

```typescript
import { Question } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';

interface HttpBinPostResponse {
  json: { name: string; role: string };
}

export const UserNameFromResponse = () =>
  Question.about<string>(
    'el nombre del usuario en la respuesta',
    async actor => {
      const response = await LastResponse.body<HttpBinPostResponse>().answeredBy(actor);
      return response.json.name;
    },
  );
```

### Patrón para extraer y validar (FakerAPI status, total, etc.)

```typescript
// features/api/Questions/FakerApiTotalFromResponse.ts
import { Question } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';

interface FakerResponse {
  status: string;
  total: number;
  data: unknown[];
}

export const FakerApiTotalFromResponse = () =>
  Question.about<number>('el total de registros en la respuesta de FakerAPI', async actor => {
    const response = await LastResponse.body<FakerResponse>().answeredBy(actor);
    return response.total;
  });
```

### Uso en step

```typescript
Then('{actor} debería ver un total de {int} registro en FakerAPI',
  async (actor: Actor, total: number) => {
    await actor.attemptsTo(
      Ensure.that(FakerApiTotalFromResponse(), equals(total)),
    );
  },
);
```

---

## Aserciones avanzadas con `@serenity-js/assertions`

```typescript
import {
  Ensure, equals, includes, isGreaterThan,
  property, contain, startsWith, matches,
} from '@serenity-js/assertions';

// Status en rango
await actor.attemptsTo(
  Ensure.that(LastResponse.status(), isGreaterThan(199)),
);

// Body contiene clave con valor
await actor.attemptsTo(
  Ensure.that(LastResponse.body<{ status: string }>(),
              property('status', equals('OK'))),
);

// String incluye substring
await actor.attemptsTo(
  Ensure.that(UserNameFromResponse(), includes('Julio')),
);

// Array de respuesta tiene N elementos
await actor.attemptsTo(
  Ensure.that(
    Question.about('items count', async actor => {
      const body = await LastResponse.body<{ data: unknown[] }>().answeredBy(actor);
      return body.data.length;
    }),
    equals(5),
  ),
);

// Match contra regex
await actor.attemptsTo(
  Ensure.that(LastResponse.header('x-request-id'), matches(/^[\w-]{8,}$/)),
);
```

---

## Encadenamiento de requests

Para escenarios como "crea un usuario, captura su id, y consúltalo":

```typescript
// Task que extrae el id del último response
const obtenerIdCreado = () =>
  Question.about<number>('id del recurso creado', async actor => {
    const body = await LastResponse.body<{ id: number }>().answeredBy(actor);
    return body.id;
  });

// Task que consume ese id
export const ConsultarRecursoCreado = () =>
  Task.where('#actor consulta el recurso recién creado',
    Interaction.where('captura id y dispara GET', async actor => {
      const id = await obtenerIdCreado().answeredBy(actor);
      await actor.attemptsTo(
        Send.a(GetRequest.to(`/users/${ id }`)),
      );
    }),
  );
```

---

## Autenticación

### Bearer token

```typescript
import { ChangeApiConfig } from '@serenity-js/rest';

export const Autenticar = (token: string) =>
  Task.where(`#actor se autentica`,
    ChangeApiConfig.setHeader('Authorization', `Bearer ${ token }`),
  );
```

### Login que captura el token y lo aplica

```typescript
export const LoginYUsarToken = (user: string, password: string) =>
  Task.where('#actor inicia sesión y aplica token',
    Send.a(PostRequest.to('/auth/login').with({ user, password })),
    Ensure.that(LastResponse.status(), equals(200)),
    Interaction.where('aplica token', async actor => {
      const body = await LastResponse.body<{ token: string }>().answeredBy(actor);
      await actor.attemptsTo(
        ChangeApiConfig.setHeader('Authorization', `Bearer ${ body.token }`),
      );
    }),
  );
```

### Basic auth

```typescript
const credentials = Buffer.from(`${ user }:${ pass }`).toString('base64');

ChangeApiConfig.setHeader('Authorization', `Basic ${ credentials }`);
```

---

## Validación de schema (opcional con `ajv`)

```typescript
// features/api/Questions/ResponseMatchesSchema.ts
import Ajv from 'ajv';
import { Question } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';

const ajv = new Ajv();

export const ResponseMatchesSchema = (schema: object) =>
  Question.about<boolean>('si la respuesta cumple el schema', async actor => {
    const body = await LastResponse.body().answeredBy(actor);
    const validate = ajv.compile(schema);
    return validate(body);
  });
```

---

## Estructura de carpetas API (patrón del proyecto)

```
features/api/
├── Features/                       # archivos .feature
│   ├── health-check.feature
│   ├── crear-recurso.feature
│   └── cambiar-base-url.feature
├── Tasks/                          # acciones de negocio
│   ├── ConsultarHealth.ts
│   ├── CrearRecurso.ts
│   ├── ConsultarDireccionesFaker.ts
│   └── UsarApi.ts                  # ChangeApiConfig wrappers
├── Questions/                      # extracción de respuestas
│   ├── FakerApiStatusFromResponse.ts
│   ├── FakerApiTotalFromResponse.ts
│   ├── ResponseBody.ts
│   └── UserNameFromResponse.ts
├── Interactions/                   # custom (raras en API)
└── Data/                           # JSON de fixtures
```

---

## Step definitions API (patrón del proyecto)

```typescript
import { Given, When, Then, setDefaultTimeout, DataTable } from '@cucumber/cucumber';
import { Actor } from '@serenity-js/core';
import { Ensure, equals } from '@serenity-js/assertions';
import { LastResponse } from '@serenity-js/rest';

import { ConsultarHealth } from '../../api/Tasks/ConsultarHealth';
import { CrearRecurso } from '../../api/Tasks/CrearRecurso';

setDefaultTimeout(60_000);   // API: 60s, no 200s

Given('que {actor} consume el servicio API', async (_actor: Actor) => {
  // CallAnApi configurada por baseUrl en wdio.api.conf.ts
});

When('{actor} consulta el endpoint {string}', async (actor: Actor, endpoint: string) => {
  await actor.attemptsTo(ConsultarHealth.delEndpoint(endpoint));
});

When('{actor} crea un recurso en {string} con:',
  async (actor: Actor, endpoint: string, table: DataTable) => {
    const body = table.rowsHash();    // { name: 'Julio', role: 'qa' }
    await actor.attemptsTo(CrearRecurso.conBody(endpoint, body));
  },
);

Then('{actor} debería recibir un código {int}', async (actor: Actor, code: number) => {
  await actor.attemptsTo(Ensure.that(LastResponse.status(), equals(code)));
});
```

---

## Manejo de errores HTTP

`Send.a(...)` **no lanza** automáticamente en respuestas 4xx/5xx — se evalúan con `LastResponse.status()`. Si quieres que falle inmediatamente:

```typescript
Send.a(
  GetRequest.to('/users/999').using({
    validateStatus: (status: number) => status >= 200 && status < 300,
    // axios lanzará excepción si el status no cumple
  }),
);
```

Lo recomendado es **NO lanzar** y validar con `Ensure.that(LastResponse.status(), ...)` para reportes claros.

---

## Anti-patrones

- ❌ Llamar `axios.get(...)` directo en steps (rompe Screenplay y reportes)
- ❌ `Send.a(GetRequest.to(`http://hardcoded.com/...`))` — usar `baseUrl` o `ChangeApiConfig.setUrlTo`
- ❌ Validar el body sin tipar: `LastResponse.body() as any`
- ❌ Esperas (`pause`) entre requests — el HTTP es síncrono request/response
- ❌ Encadenar requests sin `Ensure` del status intermedio
- ❌ Reusar el mismo Question custom para múltiples campos — uno por concepto
- ❌ Commitear tokens reales en `.env.api`
- ❌ `Question.about` con efectos secundarios (debe ser pura lectura)

---

## Performance y timeouts

| Capa | Timeout recomendado |
|---|---|
| `cucumberOpts.timeout` | `60_000` ms (suficiente para API) |
| `setDefaultTimeout` (steps) | `60_000` ms |
| Axios `timeout` por request | `15_000` – `30_000` ms |
| `connectionRetryTimeout` (wdio) | `120_000` ms (default) |

---

## Checklist de calidad

- [ ] El `baseUrl` viene de `process.env.API_BASE_URL` (no hardcoded)
- [ ] Cada Task tiene descripción `#actor ...` clara
- [ ] Las Questions están tipadas (`Question.about<T>`)
- [ ] El body del response se castea con genérico (`LastResponse.body<MyType>()`)
- [ ] Los headers de auth se configuran con `ChangeApiConfig.setHeader`, no hardcoded en cada request
- [ ] Las aserciones usan `@serenity-js/assertions` (no `expect` puro de chai/jest)
- [ ] No hay credenciales reales en `.env.api` ni en código
- [ ] El step file tiene `setDefaultTimeout(60_000)` (no 200_000)
- [ ] Encadenamiento de requests valida cada paso con `Ensure`
- [ ] Las Questions no tienen side effects
