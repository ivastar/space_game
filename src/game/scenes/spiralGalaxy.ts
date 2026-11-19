import { GAME_WIDTH } from '../../config';
import type { Point } from './GalaxyMapScene';

// The galaxy map's spiral: both styles put the star systems in the same places.
// --- The shape of the spiral galaxy ---
export const CENTER_X = GAME_WIDTH / 2;
export const CENTER_Y = 640;
export const STRETCH_Y = 1.22; // drawn a bit taller than wide, to fill the tall screen
export const OUTER_RADIUS = 320;
export const INNER_RADIUS = 45;
export const TURNS = 2.2; // how many times an arm winds around the centre
export const START_ANGLE = Math.PI * 0.5;

// A point on a spiral arm. t = 0 is the outer edge of the galaxy, t = 1 is the centre.
// The radius shrinks steadily as the arm winds inwards.
export function spiralPoint(t: number, armAngle = 0): Point {
    const angle = START_ANGLE + armAngle + t * TURNS * Math.PI * 2;
    const radius = OUTER_RADIUS + (INNER_RADIUS - OUTER_RADIUS) * t;
    return { x: CENTER_X + Math.cos(angle) * radius, y: CENTER_Y + Math.sin(angle) * radius * STRETCH_Y };
}

// Places the 24 star systems along the first arm, evenly spaced along the route:
// Alpha on the outer edge, Omega near the centre.
export function systemPositions(count: number): Point[] {
    const steps = 2000;
    const samples: Point[] = [];
    const lengths = [0];
    for (let i = 0; i <= steps; i++) {
        samples.push(spiralPoint(i / steps));
        if (i > 0) {
            const a = samples[i - 1];
            const b = samples[i];
            lengths.push(lengths[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
        }
    }
    const total = lengths[steps];
    const points: Point[] = [];
    let j = 0;
    for (let k = 0; k < count; k++) {
        const target = (total * k) / (count - 1);
        while (j < steps && lengths[j] < target) j++;
        points.push(samples[j]);
    }
    return points;
}
