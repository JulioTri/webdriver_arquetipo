---
name: kiro-specs-workflow
description: Crear y mantener specs de Kiro en .kiro/specs/<nombre>/ con los tres documentos requirements.md (historias de usuario + criterios de aceptación EARS), design.md (decisiones técnicas + diagramas + propiedades de correctitud) y tasks.md (plan de implementación incremental con trazabilidad a requerimientos). Usar cuando se inicie una nueva feature, se actualice una spec existente, se sincronice progreso de tareas, o se necesite estructurar trabajo siguiendo el flujo nativo de Kiro.
---

# Skill: Flujo de specs de Kiro

## Estructura de un spec

```
.kiro/specs/<nombre-en-kebab-case>/
├── requirements.md     # QUÉ se va a construir (historias + AC)
├── design.md           # CÓMO se va a construir (arquitectura)
├── tasks.md            # plan incremental con checkboxes
└── .config.kiro        # metadata del spec (Kiro lo gestiona)
```

**Reglas de nombre:**
- Kebab-case: `cart-order-data-capture`, `archetype-cleanup`
- Descriptivo, sin redundar el nombre del proyecto
- Una sola feature/módulo por spec

---

## Flujo de creación

```
1. requirements.md   →  el QUÉ y POR QUÉ (sin diseño técnico)
        ↓
2. design.md         →  el CÓMO (arquitectura, tradeoffs, propiedades)
        ↓
3. tasks.md          →  el plan ejecutable (checklist)
        ↓
4. Implementación + check de tareas (`[x]`) conforme avanza
```

**No saltarse pasos.** Si requirements está incompleto, design no puede ser sólido. Si design no existe, las tasks serán reactivas.

---

## 1. `requirements.md` — formato del proyecto

### Estructura obligatoria

```markdown
# Documento de Requerimientos — <Nombre Legible>

## Introducción

<2–4 párrafos describiendo el problema, el contexto y el alcance.
Mencionar las clases/módulos existentes que se tocarán.>

## Glosario

- **TerminoTecnico**: definición precisa.
- **OtroTermino**: ...

## Requerimientos

### Requerimiento 1: <Título corto>

**Historia de Usuario:** Como <rol>, quiero <funcionalidad>, para <beneficio>.

#### Criterios de Aceptación

1. THE <componente> SHALL <comportamiento>.
2. WHEN <evento>, THE <componente> SHALL <comportamiento>.
3. IF <condición>, THEN THE <componente> SHALL <comportamiento>.
4. WHILE <estado continuo>, THE <componente> SHALL <comportamiento>.

---

### Requerimiento 2: <Título corto>
...
```

### Reglas EARS (Easy Approach to Requirements Syntax)

Usar exclusivamente estos patrones:

| Patrón | Cuándo |
|---|---|
| `THE <X> SHALL <Y>` | Comportamiento ubicuo (siempre) |
| `WHEN <evento>, THE <X> SHALL <Y>` | Comportamiento por evento |
| `IF <condición>, THEN THE <X> SHALL <Y>` | Comportamiento condicional |
| `WHILE <estado>, THE <X> SHALL <Y>` | Comportamiento continuo durante un estado |
| `WHERE <feature opcional activa>, THE <X> SHALL <Y>` | Comportamiento opcional |

### ✅ Reglas de oro

- Cada AC debe ser **verificable** (testeable de forma binaria)
- Cada AC describe **comportamiento observable**, no implementación
- Una historia = un objetivo de negocio
- Glosario con términos técnicos antes de usarlos
- Lenguaje en **español**
- Numeración estable: si insertas un AC, no renumeres los anteriores (mantén trazabilidad)

### ❌ Anti-patrones

- AC vagos: "el sistema debe ser rápido", "la UI debe ser amigable"
- Mezclar diseño en requirements: "usar React hooks", "guardar en MongoDB"
- AC con múltiples comportamientos: dividirlos
- AC que duplican otros AC

---

## 2. `design.md` — formato del proyecto

### Estructura obligatoria

```markdown
# Diseño Técnico — <Nombre>

## Visión General

<Resumen ejecutivo del diseño.>

### Decisiones de Diseño Clave

1. **<Decisión 1>:** justificación + tradeoff considerado.
2. **<Decisión 2>:** ...

## Arquitectura

### Flujo de Datos

```mermaid
sequenceDiagram
    participant Actor
    participant Componente
    Actor->>Componente: acción
    Componente-->>Actor: respuesta
```

### Ubicación de Archivos Nuevos

```
features/<modulo>/
├── shared/
│   └── Interactions/
│       └── NuevoComponente.ts        # NUEVO
├── UI/
│   └── HomeUI.ts                     # Modificado
└── Tasks/
    └── HomeTasks.ts                  # Modificado
```

## Componentes e Interfaces

### 1. <Componente> — <descripción>

<Explicación + interfaz pública en TypeScript>

```typescript
export class NuevoComponente extends Interaction {
    static fromX(): NuevoComponente;
    performAs(actor: Actor): Promise<void>;
}
```

**Flujo interno:** ...

## Modelos de Datos

```typescript
interface Modelo {
    campo: tipo;
}
```

## Propiedades de Correctitud

### Propiedad 1: <Nombre>

*Para cualquier* <entrada>, <comportamiento esperado>.

**Valida: Requerimientos X.Y, X.Z**

## Manejo de Errores

| Escenario | Estrategia | Impacto |
|---|---|---|
| ... | ... | ... |

## Estrategia de Testing

<Tests unitarios + property-based con fast-check si aplica>
```

### ✅ Reglas

- **Mermaid** para diagramas de secuencia/flujo (los specs existentes lo usan)
- Cada decisión técnica documenta el tradeoff considerado
- Propiedades de correctitud con formato "Para cualquier... debe..."
- Cada propiedad mapea a requerimientos específicos
- TypeScript en bloques de código (lenguaje del proyecto)
- Si hay tests basados en propiedades, mencionar `fast-check`

### ❌ Anti-patrones

- Diseño sin alternativas consideradas
- Decisiones sin justificación
- Diagramas en imágenes (usar Mermaid en texto)
- Especificar implementación a nivel de línea (eso va en tasks)

---

## 3. `tasks.md` — formato del proyecto

### Estructura obligatoria

```markdown
# Plan de Implementación: <Nombre>

## Visión General

<2–3 frases sobre el approach incremental.>

## Tareas

- [ ] 1. <Grupo de tareas>
  - [ ] 1.1 <Tarea concreta>
    - <Acción específica con archivo y método>
    - <Otra acción>
    - _Requerimientos: 1.1, 1.2_

  - [ ]* 1.2 <Tarea opcional, marcada con asterisco>
    - **Propiedad N: <nombre>**
    - <Detalles del test>
    - **Valida: Requerimientos X.Y**

- [ ] 2. Checkpoint — <Verificación>
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [ ] 3. <Siguiente grupo>
  - ...

## Notas

- Las tareas marcadas con `*` son opcionales
- Cada tarea referencia requerimientos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
```

### ✅ Reglas

- **Checkboxes** `[ ]` (pendiente) → `[x]` (completada). Marcar al terminar cada tarea.
- **Numeración jerárquica**: `1`, `1.1`, `1.2`, `2`, `2.1`...
- **Tarea atómica**: una tarea debe poder ejecutarse y validarse de forma independiente
- **Trazabilidad obligatoria**: `_Requerimientos: X.Y, X.Z_` al final de cada tarea
- **Tests opcionales con `*`**: formato `- [ ]* N.N` para tests de propiedad
- **Checkpoints regulares** entre grupos grandes para validación incremental
- Verbos en infinitivo en español: "Crear", "Agregar", "Implementar", "Integrar"

### ❌ Anti-patrones

- Tareas vagas ("Mejorar el sistema")
- Tareas sin `_Requerimientos: ..._`
- Plan sin checkpoints
- Marcar `[x]` sin haber ejecutado y verificado
- Mezclar refactor + feature en la misma tarea
- Tareas que dependen del orden pero no lo declaran

---

## Sincronización entre los 3 documentos

| Cambio en... | Implicación |
|---|---|
| Nuevo AC en `requirements.md` | Revisar si afecta arquitectura → puede requerir update en `design.md` |
| Decisión de diseño cambia | Verificar que las tasks afectadas estén actualizadas |
| Tarea descubre un AC faltante | Agregar el AC en `requirements.md` antes de continuar |
| Tarea revela limitación técnica | Actualizar `design.md` con el workaround o tradeoff |

**Regla:** los tres documentos deben estar coherentes en todo momento. Si una tarea revela un hueco, **detenerse y arreglar el documento de origen**.

---

## Cuándo crear un nuevo spec vs extender uno existente

### Crear nuevo spec
- Feature nueva con alcance claro
- Cambia más de 3 archivos
- Tiene reglas de negocio propias
- Necesita su propio plan de tasks

### Extender spec existente
- Cambio menor a la feature ya planeada
- Bugfix dentro del alcance original
- Refinamiento de un AC existente

---

## Patrón de spec del proyecto (caso real `cart-order-data-capture`)

El spec real del proyecto sigue exactamente:

1. **Introducción** mencionando archivos exactos del proyecto y XPaths reales
2. **Glosario** con términos como `HomeTask`, `HomeUI`, `EnsureMinimumOrderIsMet`
3. **Requerimientos** con AC en formato EARS estricto (`THE ... SHALL ...`)
4. **Design** con diagrama Mermaid de secuencia, ubicación de archivos nuevos, interfaces TypeScript
5. **Propiedades de correctitud** mapeadas a requerimientos y validadas con `fast-check`
6. **Tasks** con checkpoints (`Checkpoint — Verificar X`) y trazabilidad explícita

Replicar este patrón en specs nuevos.

---

## Comandos relacionados (Kiro)

| Acción | Cómo |
|---|---|
| Crear spec | Crear carpeta `.kiro/specs/<nombre>/` y los 3 archivos |
| Marcar tarea completa | Cambiar `[ ]` a `[x]` en `tasks.md` |
| Sincronizar con Kiro Cloud | Kiro lo hace automático al guardar archivos en `.kiro/specs/` |
| Ver progreso | Contar `[x]` vs `[ ]` en `tasks.md` |

---

## Anti-patrones críticos

- ❌ Empezar a implementar sin `requirements.md` aprobado
- ❌ Marcar `[x]` sin haber ejecutado tests
- ❌ Editar requirements después de implementar (sin actualizar tasks/design)
- ❌ Specs que se solapan en alcance
- ❌ Decisiones técnicas en `requirements.md` (van en `design.md`)
- ❌ Tasks sin trazabilidad a requerimientos
- ❌ Diseño "imaginado" sin leer el código real al que afecta

---

## Checklist por documento

### requirements.md
- [ ] Tiene Introducción, Glosario y Requerimientos
- [ ] Cada requerimiento tiene Historia de Usuario en formato Como/quiero/para
- [ ] Todos los AC usan EARS (`THE ... SHALL`, `WHEN ...`, `IF ... THEN ...`)
- [ ] Cada AC es verificable de forma binaria
- [ ] No hay decisiones técnicas (solo qué/por qué)

### design.md
- [ ] Tiene Visión General + Decisiones Clave
- [ ] Diagramas en Mermaid (no imágenes)
- [ ] Lista archivos a crear/modificar con ruta exacta
- [ ] Interfaces TypeScript de los componentes nuevos
- [ ] Propiedades de correctitud mapeadas a requerimientos
- [ ] Tabla de Manejo de Errores
- [ ] Estrategia de testing (unitario + property-based si aplica)

### tasks.md
- [ ] Tareas numeradas jerárquicamente (1, 1.1, 1.2, 2...)
- [ ] Cada tarea tiene `_Requerimientos: X.Y_` al final
- [ ] Tests de propiedad marcados con `*`
- [ ] Checkpoints entre grupos grandes
- [ ] Verbos en infinitivo, español
- [ ] Acciones específicas (archivo + método), no genéricas
