import type { DomainEvent } from '@serenity-js/core/lib/events';
import { InteractionFinished } from '@serenity-js/core/lib/events';
import { PhotoTakingStrategy } from '@serenity-js/web';

/**
 * Estrategia selectiva de screenshots para Serenity/JS.
 * Solo toma fotos cuando la interacción finalizada coincide con alguno
 * de los patrones configurados (por ejemplo: Click, Enter, Clear, Scroll).
 *
 * Uso en wdio config:
 *   import { Photographer } from '@serenity-js/web';
 *   import { TakePhotosOfSelectedInteractions } from '...';
 *
 *   Photographer.whoWill(TakePhotosOfSelectedInteractions)
 */
export class TakePhotosOfSelectedInteractions extends PhotoTakingStrategy {

    /**
     * Patrones (case-insensitive) que determinan en qué interacciones tomar foto.
     * Se evalúan contra el nombre de la actividad reportada por Serenity/JS.
     */
    private static readonly PATTERNS: RegExp[] = [
        /click/i,
        /enter/i,
        /clear/i,
        /scroll/i,
        /navigate/i,
        /captura/i,
    ];

    protected shouldTakeAPhotoOf(event: DomainEvent): boolean {
        if (!(event instanceof InteractionFinished)) {
            return false;
        }
        const name = event.details.name.value;
        return TakePhotosOfSelectedInteractions.PATTERNS.some(p => p.test(name));
    }

    protected photoNameFor(event: InteractionFinished): string {
        return event.details.name.value;
    }
}
