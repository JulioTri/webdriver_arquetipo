import { Task } from '@serenity-js/core';
import { Click, Key, Press, Scroll, Enter } from '@serenity-js/web';

import { JsonDataLoader } from '../../shared/Utils/JsonDataLoader';
import type { StudentsDataset } from '../../shared/data/types/StudentData';
import { FormUI } from '../../UI/Form/FormUI';
import { resolvePathFromProject } from '../../shared/Utils/ResolvePath';
import { SelectFromDropdown } from '../../shared/Tasks/SelectFromDropdown';
import { ClearAndEnter } from '../../shared/Tasks/ClearAndEnter';
import { ReplaceValue } from '../../shared/Tasks/ReplaceValue';

export class LlenarFormulario {
  static conDataset = (dataset: string) => {
    const data = JsonDataLoader.from<StudentsDataset>(`features/web/Data/Form/${ dataset }.json`);
    const student = data.students[0];
    const images = resolvePathFromProject(`features/web/Data/Images/${ student.picture }`);
    return Task.where(`#actor diligencia el formulario con ${ dataset }`,
      Enter.theValue(student.firstName).into(FormUI.Name()),
      Enter.theValue(student.lastName).into(FormUI.LastName()),
      Enter.theValue(student.email).into(FormUI.Email()),
      Click.on(FormUI.GenderMale()),
      Enter.theValue(student.mobile).into(FormUI.MobileNumber()),
      ReplaceValue.with(`${student.dateOfBirth.day} ${student.dateOfBirth.month.slice(0,3)} ${student.dateOfBirth.year}`).in(FormUI.DateOfBirth()),
      Enter.theValue(student.subjects[0]).into(FormUI.Subjects()),
      Press.the(Key.Enter),
      ClearAndEnter.theValue(student.subjects[1]).into(FormUI.Subjects()),
      Press.the(Key.Enter),
      Click.on(FormUI.CheckSports()),
      Click.on(FormUI.CheckReading()),
      Click.on(FormUI.CheckMusic()),
      Enter.theValue(images).into(FormUI.UploadPicture()),
      Enter.theValue(student.currentAddress).into(FormUI.Address()),
      Scroll.to(FormUI.State()),
      SelectFromDropdown.option({dropdownTrigger: FormUI.State(), optionToSelect: FormUI.StateOptions, value: student.state}),
      SelectFromDropdown.option({dropdownTrigger: FormUI.City(), optionToSelect: FormUI.CityOptions, value: student.city}),
    );
  }
}
