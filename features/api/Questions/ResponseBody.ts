import { Question } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';

export class ResponseBody {
  static asJson = <T>() =>
    Question.about<T>(
      'el body de la última respuesta',
      actor => LastResponse.body<T>().answeredBy(actor),
    );
}