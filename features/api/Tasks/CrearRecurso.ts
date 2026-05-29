import { Task } from '@serenity-js/core';
import { PostRequest, Send } from '@serenity-js/rest';

export class CrearRecurso {
  static conBody = (endpoint: string, body: Record<string, unknown>) =>
    Task.where(
      `#actor crea un recurso en ${ endpoint }`,
      Send.a(
        PostRequest.to(endpoint).with(body),
      ),
    );
}