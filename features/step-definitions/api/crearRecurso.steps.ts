import { DataTable, When } from '@cucumber/cucumber';
import { Actor } from '@serenity-js/core';

import { CrearRecurso } from '../../api/Tasks/CrearRecurso';

When(
  '{actor} crea un recurso en {string} con:',
  async (actor: Actor, endpoint: string, table: DataTable) => {
    const body = table.rowsHash() as Record<string, unknown>;

    await actor.attemptsTo(
      CrearRecurso.conBody(endpoint, body),
    );
  },
);