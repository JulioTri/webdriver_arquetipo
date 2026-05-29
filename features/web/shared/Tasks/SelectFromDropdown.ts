import { Answerable, Duration, Task, Wait } from '@serenity-js/core';
import { Click, isClickable, isVisible, PageElement } from '@serenity-js/web';

export class SelectFromDropdown {

  static option = (params: {
    dropdownTrigger: Answerable<PageElement>;
    optionToSelect: (value: string) => Answerable<PageElement>;
    value: string;

    selectedValueElement?: Answerable<PageElement>;
    timeout?: Duration;
  }) => {

    const timeout = params.timeout ?? Duration.ofSeconds(10);
    const { dropdownTrigger, optionToSelect, value } = params;

    if (!value || value.trim() === '') {
      return Task.where(`#actor omite selección porque el valor está vacío`);
    }

    const option = optionToSelect(value);

    const steps = [
      Wait.upTo(timeout).until(dropdownTrigger, isClickable()),
      Click.on(dropdownTrigger),

      Wait.upTo(timeout).until(option, isVisible()),
      Click.on(option),
    ];

    return Task.where(`#actor selecciona "${ value }" del dropdown`,
      ...steps,
    );
  };
}
