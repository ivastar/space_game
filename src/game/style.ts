import { DEFAULT_STYLE, GAME_FONT, STYLE_KEY } from '../config';
import type { GameStyle } from '../config';

// The game has two looks. "classic" is the first one: simple glowing shapes and a spiral
// galaxy. "pencil" is drawn like Sasha's notebook: school-pencil sprites and a zig-zag map.
// The rules of the game are exactly the same in both.
//
// The style is picked by the page's address: add ?style=classic or ?style=pencil to it.
// Without that you get the style you used last time, or DEFAULT_STYLE the first time.
export const GAME_STYLES: GameStyle[] = ['classic', 'pencil'];

function isStyle(value: string | null): value is GameStyle {
    return GAME_STYLES.includes(value as GameStyle);
}

function chooseStyle(): GameStyle {
    const fromAddress = new URLSearchParams(window.location.search).get('style');
    try {
        if (isStyle(fromAddress)) {
            localStorage.setItem(STYLE_KEY, fromAddress);
            return fromAddress;
        }
        const remembered = localStorage.getItem(STYLE_KEY);
        if (isStyle(remembered)) return remembered;
    } catch {
        // the browser won't let us remember; the address still works
        if (isStyle(fromAddress)) return fromAddress;
    }
    return DEFAULT_STYLE;
}

// The style stays the same for as long as the page is open.
export const STYLE = chooseStyle();
export const isPencil = STYLE === 'pencil';

// The font for a piece of writing: the pencil style has its own pixel font, classic uses Arial.
export function font(bold = false) {
    if (isPencil) return { fontFamily: GAME_FONT, fontStyle: bold ? 'bold' : 'normal' };
    return { fontFamily: bold ? 'Arial Black' : 'Arial', fontStyle: 'normal' };
}

// Opens the game again in another style. Your saved game is the same in both.
export function switchStyle(style: GameStyle) {
    const address = new URL(window.location.href);
    address.searchParams.set('style', style);
    window.location.href = address.toString();
}
