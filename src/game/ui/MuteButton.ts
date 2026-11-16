import { Scene } from 'phaser';
import { makeButton } from './makeButton';
import { audio } from '../GameAudio';

// A small button that turns all sound and music on or off. The M key does the same.
// The choice is remembered for next time.
export function addMuteButton(scene: Scene, x: number, y: number) {
    const label = () => (audio.muted ? 'Sound: off' : 'Sound: on');
    const toggle = () => {
        audio.toggleMute();
        if (text.active) text.setText(label());
    };
    const { rect, text } = makeButton(scene, x, y, label(), toggle, { width: 130, height: 40, fontSize: 18, color: 0x33415c });
    rect.setDepth(10);
    text.setDepth(10);
    scene.input.keyboard?.on('keydown-M', toggle);
}
