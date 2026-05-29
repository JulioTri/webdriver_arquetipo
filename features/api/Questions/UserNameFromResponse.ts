import { Question } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';

interface HttpBinPostResponse {
  json: {
    name: string;
    role: string;
  };
}

export const UserNameFromResponse = () =>
  Question.about<string>(
    'el nombre del usuario en la respuesta',
    async actor => {
      const response = await LastResponse.body<HttpBinPostResponse>().answeredBy(actor);
      return response.json.name;
    }
  );