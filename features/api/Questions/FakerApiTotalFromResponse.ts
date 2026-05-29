import { Question } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';

interface FakerApiUsersResponse {
  status: string;
  code: number;
  total: number;
  data: Array<Record<string, unknown>>;
}

export const FakerApiTotalFromResponse = () =>
  Question.about<number>(
    'el total de registros devueltos por FakerAPI',
    async actor => {
      const response = await LastResponse.body<FakerApiUsersResponse>().answeredBy(actor);
      return response.total;
    },
  );