import { Task } from '@serenity-js/core';
import { GetRequest, Send } from '@serenity-js/rest';

export class ConsultarHealth {
  static delEndpoint = (endpoint: string) =>
    Task.where(
      `#actor consulta el endpoint ${ endpoint }`,
      Send.a(
        GetRequest.to(endpoint),
      ),
    );
}