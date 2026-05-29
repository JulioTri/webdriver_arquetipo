import { Task } from '@serenity-js/core';
import { ChangeApiConfig } from '@serenity-js/rest';

export class UsarApi {
  static baseUrl = (url: string) =>
    Task.where(
      `#actor usa la API ${ url }`,
      ChangeApiConfig.setUrlTo(url),
    );
}