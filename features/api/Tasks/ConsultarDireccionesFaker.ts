import { Task } from '@serenity-js/core';
import { GetRequest, Send } from '@serenity-js/rest';

export class ConsultarUsuariosFaker {
  static conCantidad = (quantity: number) =>
    Task.where(
      `#actor consulta ${ quantity } usuario(s) en FakerAPI`,
      Send.a(
        GetRequest.to(`/api/v2/companies?_quantity=${ quantity }`),
      ),
    );
}