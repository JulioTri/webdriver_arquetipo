import { Interaction } from '@serenity-js/core';
import { Select } from '@serenity-js/web';

export const SelectOption = {
  byOption: (option: any) => ({
    from: (element: any) =>
      Interaction.where(
        `#actor selects option ${option} from ${element.toString()}`,
        async (actor) => {
          await Select.option(option).from(element).performAs(actor);
        }
      ),
  }),

  byValue: (value: string, element:any) => 
      Interaction.where(
        `#actor selects option with value "${value}" from ${element.toString()}`,
        async (actor) => {
          await Select.value(value).from(element).performAs(actor);
        }
  ),
};