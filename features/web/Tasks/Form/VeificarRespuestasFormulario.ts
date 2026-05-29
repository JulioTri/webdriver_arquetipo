// src/web/tasks/VerifySubmittedPracticeForm.ts
import { Duration, Task, Wait } from '@serenity-js/core';
import { isVisible } from '@serenity-js/web';
import { Ensure, equals } from '@serenity-js/assertions';

import type {StudentsDataset } from '../../shared/data/types/StudentData';
import { TextContent } from '../../shared/Questions/TextContent';
import { ModalFormUI } from '../../UI/Form/ModalFormUI';
import { JsonDataLoader } from '../../shared/Utils/JsonDataLoader';

export class VerificarRespuestasFormulario {

    static matches = (dataset:string) =>{
        const data = JsonDataLoader.from<StudentsDataset>(`features/web/Data/Form/${ dataset }.json`);
        const student = data.students[0];
        return Task.where(`#actor valida la información del modal`,
            Wait.upTo(Duration.ofSeconds(10)).until(ModalFormUI.TitleForm(), isVisible()),

            Ensure.that(
                TextContent.of(ModalFormUI.StudentName()),
                equals(`${ student.firstName } ${ student.lastName }`)
            ),

            Ensure.that(
                TextContent.of(ModalFormUI.StudentEmail()),
                equals(student.email)
            ),

            Ensure.that(
                TextContent.of(ModalFormUI.Gender()),
                equals(student.gender)
            ),

            Ensure.that(
                TextContent.of(ModalFormUI.Mobile()),
                equals(student.mobile)
            ),

            Ensure.that(
                TextContent.of(ModalFormUI.DateOfBirth()),
                equals(`${student.dateOfBirth.day} ${student.dateOfBirth.month},${student.dateOfBirth.year}`)
            ),

            Ensure.that(
                TextContent.of(ModalFormUI.Subjects()),
                equals(student.subjects.join(', '))
            ),

            Ensure.that(
                TextContent.of(ModalFormUI.Hobbies()),
                equals(student.hobbies.join(', '))
            ),

            Ensure.that(
                TextContent.of(ModalFormUI.Picture()),
                equals(`${ student.picture }`)
            ),

            Ensure.that(
                TextContent.of(ModalFormUI.Address()),
                equals(`${ student.currentAddress }`)
            ),

            // Ensure.that(
            //     TextContent.of(ModalFormUI.StateAndCity()),
            //     equals(`${ student.state } ${ student.city }`)
            // ),
        );
    }
}
