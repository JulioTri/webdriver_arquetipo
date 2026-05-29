import { Task } from '@serenity-js/core';
import { Answerable } from '@serenity-js/core';
import { PageElement, Click, Enter, Key, Press } from '@serenity-js/web';

export class ReplaceValue {

  static with = (value: string) => ({
    in: (element: Answerable<PageElement>) =>{
        const isMac = process.platform === 'darwin';
        const modifier = isMac ? Key.Meta : Key.Control;
     return Task.where(`#actor reemplaza el contenido con "${ value }"`,
        Click.on(element),
        Press.the(modifier, 'a').in(element),
        Enter.theValue(value).into(element),
        Press.the(Key.Enter),
      )}
  });
}
