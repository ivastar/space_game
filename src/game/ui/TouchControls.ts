import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TOUCH_CONSOLE_HEIGHT, TOUCH_WHEEL_RANGE } from '../../config';
import { font } from '../style';

type Control = 'leftBlast' | 'jump' | 'wheel' | 'rightBlast';

// One finger on the console: which control it started on, and where it is now.
interface Touch {
    control: Control;
    startX: number;
    startY: number;
    x: number;
    y: number;
}

const CONSOLE_TOP = GAME_HEIGHT - TOUCH_CONSOLE_HEIGHT;
const Y = CONSOLE_TOP + TOUCH_CONSOLE_HEIGHT / 2;
// Left to right, like Sasha's drawing: pink blast, blue jump, steering wheel, pink blast.
const X: Record<Control, number> = { leftBlast: 65, jump: 195, wheel: 415, rightBlast: 655 };

const PINK = 0xd94f9a;
const PINK_PRESSED = 0xff8ac8;
const OUTLINE = 0x222222;
const WHITE = 0xf2f2f2;

// The touch-screen control console at the bottom of the screen, from Sasha's design.
// LevelScene reads moveX / moveY (-1 to 1), leftBlast / rightBlast (held down) and
// consumeJump() (the blue button was tapped).
export class TouchControls {
    // Remembered between levels: did you last use touch (true) or the keyboard (false)?
    // null means not decided yet, so we guess from the device.
    private static usingTouch: boolean | null = null;

    moveX = 0;
    moveY = 0;
    leftBlast = false;
    rightBlast = false;
    private jumpQueued = false;
    private touches = new Map<number, Touch>();

    private container: Phaser.GameObjects.Container;
    private leftGfx: Phaser.GameObjects.Graphics;
    private rightGfx: Phaser.GameObjects.Graphics;
    private jumpGfx: Phaser.GameObjects.Graphics;
    private wheel: Phaser.GameObjects.Container;

    constructor(private scene: Phaser.Scene) {
        this.container = scene.add.container(0, 0).setDepth(20);
        this.container.add(this.drawConsole());
        this.leftGfx = scene.add.graphics({ x: X.leftBlast, y: Y });
        this.jumpGfx = scene.add.graphics({ x: X.jump, y: Y });
        this.rightGfx = scene.add.graphics({ x: X.rightBlast, y: Y });
        this.wheel = this.makeWheel();
        this.container.add([this.leftGfx, this.jumpGfx, this.wheel, this.rightGfx]);

        this.setVisible(TouchControls.usingTouch ?? scene.sys.game.device.input.touch);
        this.listen();
    }

    get visible() {
        return this.container.visible;
    }

    // The top of the console: the ship can't fly below this while the console is showing.
    get top() {
        return CONSOLE_TOP;
    }

    // True once for each tap of the blue jump button.
    consumeJump() {
        const tapped = this.jumpQueued;
        this.jumpQueued = false;
        return tapped;
    }

    private setVisible(visible: boolean) {
        this.container.setVisible(visible);
        this.touches.clear();
        this.refresh();
    }

    private listen() {
        const input = this.scene.input;
        const onDown = (pointer: Phaser.Input.Pointer) => {
            // Touching the screen brings the console back if the keyboard had hidden it.
            if (pointer.wasTouch && !this.visible) {
                TouchControls.usingTouch = true;
                this.setVisible(true);
            }
            if (!this.visible) return;
            const control = this.controlAt(pointer.x, pointer.y);
            if (!control) return;
            this.touches.set(pointer.id, { control, startX: pointer.x, startY: pointer.y, x: pointer.x, y: pointer.y });
            if (control === 'jump') this.jumpQueued = true;
            this.refresh();
        };
        const onMove = (pointer: Phaser.Input.Pointer) => {
            const touch = this.touches.get(pointer.id);
            if (!touch) return;
            touch.x = pointer.x;
            touch.y = pointer.y;
            this.refresh();
        };
        const onUp = (pointer: Phaser.Input.Pointer) => {
            if (this.touches.delete(pointer.id)) this.refresh();
        };
        // Pressing any key means you're on a keyboard, so the console hides.
        const onKey = () => {
            if (!this.visible) return;
            TouchControls.usingTouch = false;
            this.setVisible(false);
        };

        input.on('pointerdown', onDown);
        input.on('pointermove', onMove);
        input.on('pointerup', onUp);
        input.on('pointerupoutside', onUp);
        input.keyboard?.on('keydown', onKey);
        this.scene.events.once('shutdown', () => {
            input.off('pointerdown', onDown);
            input.off('pointermove', onMove);
            input.off('pointerup', onUp);
            input.off('pointerupoutside', onUp);
            input.keyboard?.off('keydown', onKey);
        });
    }

    // Which control is at this spot? Touch areas are a bit bigger than the drawings, for fingers.
    private controlAt(x: number, y: number): Control | null {
        if (y < CONSOLE_TOP) return null;
        const dy = y - Y;
        if (Math.abs(x - X.wheel) < 115 && Math.abs(dy) < 100) return 'wheel';
        if (Math.hypot(x - X.jump, dy) < 62) return 'jump';
        if (Math.abs(x - X.leftBlast) + Math.abs(dy) < 66) return 'leftBlast';
        if (Math.abs(x - X.rightBlast) + Math.abs(dy) < 66) return 'rightBlast';
        return null;
    }

    // Works out the steering and buttons from all the fingers on the console, and redraws.
    private refresh() {
        let wheelX = 0;
        let wheelY = 0;
        let jumpHeld = false;
        this.leftBlast = false;
        this.rightBlast = false;

        for (const touch of this.touches.values()) {
            if (touch.control === 'leftBlast') this.leftBlast = true;
            if (touch.control === 'rightBlast') this.rightBlast = true;
            if (touch.control === 'jump') jumpHeld = true;
            if (touch.control === 'wheel') {
                // Like a plane's yoke: drag sideways to steer, push up or pull down to climb or dive.
                wheelX = Phaser.Math.Clamp((touch.x - touch.startX) / TOUCH_WHEEL_RANGE, -1, 1);
                wheelY = Phaser.Math.Clamp((touch.y - touch.startY) / TOUCH_WHEEL_RANGE, -1, 1);
            }
        }

        this.moveX = wheelX;
        this.moveY = wheelY;

        this.drawDiamond(this.leftGfx, this.leftBlast);
        this.drawDiamond(this.rightGfx, this.rightBlast);
        this.drawJump(jumpHeld);
        this.wheel.setRotation(wheelX * 0.8);
        this.wheel.setY(Y + wheelY * 14);
    }

    // --- Drawing, based on Sasha's sketch ---

    private drawConsole() {
        const g = this.scene.add.graphics();
        g.fillStyle(0x9a9ea6, 1);
        g.fillRect(0, CONSOLE_TOP, GAME_WIDTH, TOUCH_CONSOLE_HEIGHT);
        // Faint pencil-shading lines.
        g.lineStyle(2, 0x6f737b, 0.25);
        for (let y = CONSOLE_TOP + 14; y < GAME_HEIGHT; y += 12) {
            g.lineBetween(8, y, GAME_WIDTH - 8, y + 3);
        }
        g.lineStyle(5, OUTLINE, 1);
        g.strokeRect(4, CONSOLE_TOP + 4, GAME_WIDTH - 8, TOUCH_CONSOLE_HEIGHT - 8);
        return g;
    }

    private drawDiamond(g: Phaser.GameObjects.Graphics, pressed: boolean) {
        const r = pressed ? 44 : 48;
        g.clear();
        g.fillStyle(pressed ? PINK_PRESSED : PINK, 1);
        g.lineStyle(4, OUTLINE, 1);
        g.beginPath();
        g.moveTo(0, -r);
        g.lineTo(r, 0);
        g.lineTo(0, r);
        g.lineTo(-r, 0);
        g.closePath();
        g.fillPath();
        g.strokePath();
    }

    private drawJump(pressed: boolean) {
        const g = this.jumpGfx;
        g.clear();
        g.fillStyle(pressed ? 0x6fb4ff : 0xe6eef8, 1);
        g.fillCircle(0, 0, 52);
        // Blue speckles, like the coloured-pencil patches in the drawing.
        g.fillStyle(0x5aa0e8, 1);
        for (const [x, y, w, h] of [[-26, -8, 18, 22], [8, -30, 20, 14], [16, 10, 16, 24], [-8, 22, 18, 14]]) {
            g.fillEllipse(x, y, w, h);
        }
        g.lineStyle(4, OUTLINE, 1);
        g.strokeCircle(0, 0, 52);
    }

    // The steering wheel: two handles with dark grips on the outside, joined by a bar,
    // and a middle piece with a "V" on it. It turns and moves as you steer.
    private makeWheel() {
        const g = this.scene.add.graphics();
        g.fillStyle(0x2a2a2a, 1);
        g.slice(-78, 0, 30, Math.PI / 2, Math.PI * 1.5);
        g.fillPath();
        g.slice(78, 0, 30, -Math.PI / 2, Math.PI / 2);
        g.fillPath();

        g.fillStyle(WHITE, 1);
        g.lineStyle(4, OUTLINE, 1);
        for (const side of [-1, 1]) {
            g.fillRoundedRect(side < 0 ? -80 : 46, -62, 34, 124, 14);
            g.strokeRoundedRect(side < 0 ? -80 : 46, -62, 34, 124, 14);
        }
        g.fillRect(-48, 16, 96, 20);
        g.strokeRect(-48, 16, 96, 20);
        g.fillRoundedRect(-30, -26, 60, 44, 10);
        g.strokeRoundedRect(-30, -26, 60, 44, 10);

        const v = this.scene.add.text(0, -4, 'V', {
            ...font(true), fontSize: 26, color: '#222222',
        }).setOrigin(0.5);
        return this.scene.add.container(X.wheel, Y, [g, v]);
    }
}
