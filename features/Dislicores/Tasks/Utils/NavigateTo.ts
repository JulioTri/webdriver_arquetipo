import { Navigate } from '@serenity-js/web';
import { Task } from '@serenity-js/core';

// Localizador para el elemento basado en el texto
export class NavigateTo {

    // Tarea para navegar a una página específica con una URL como parámetro
    static navigateToPage = (url: string) =>
        Task.where(`#actor navigates to the page at ${url}`,
            Navigate.to(url)
        );
}