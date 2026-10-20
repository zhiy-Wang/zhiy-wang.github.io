// Source: https://github.com/stackedlol/ascii-sharks/blob/c521e24a787e6d4cc460d4cf2b9815f25e4fe453/src/engine.ts
// TypeScript compiled to browser-native JavaScript; no runtime dependencies.
// Local changes: visibility pause, guarded callbacks, idempotent cleanup and canvas release.
import { AsciiRenderer } from "./renderer.js";
import { World } from "./world.js";
const STEP = 1 / 60;
const MAX_STEPS = 4;
export class OceanEngine {
    canvas;
    world;
    renderer;
    raf = 0;
    last = 0;
    acc = 0;
    visible = false;
    reducedMotion;
    resizeObserver;
    intersectionObserver;
    disposed = false;
    constructor(canvas, sharks){
        this.canvas = canvas;
        this.world = new World(sharks);
        this.renderer = new AsciiRenderer(canvas);
        this.renderer.setFontFamily(getComputedStyle(canvas).fontFamily);
        this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        this.resizeObserver = new ResizeObserver(()=>this.resize());
        this.resizeObserver.observe(canvas);
        this.intersectionObserver = new IntersectionObserver(([entry])=>{
            if (this.disposed || !entry) return;
            this.visible = entry.isIntersecting;
            this.schedule();
        });
        this.intersectionObserver.observe(canvas);
        this.reducedMotion.addEventListener("change", this.onMotionPreference);
        window.addEventListener("pointermove", this.onPointerMove, {
            passive: true
        });
        window.addEventListener("pointerdown", this.onPointerDown, {
            passive: true
        });
        document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
        window.addEventListener("blur", this.onPointerLeave);
        document.addEventListener("visibilitychange", this.onVisibilityChange);
        this.resize();
        document.fonts?.load(`600 16px ${getComputedStyle(canvas).fontFamily}`).then(()=>{
            if (!this.disposed && this.reducedMotion.matches) this.drawStill();
        }).catch(() => {});
        this.schedule();
    }
    destroy() {
        if (this.disposed) return;
        this.disposed = true;
        cancelAnimationFrame(this.raf);
        this.raf = 0;
        this.resizeObserver.disconnect();
        this.intersectionObserver.disconnect();
        this.reducedMotion.removeEventListener("change", this.onMotionPreference);
        window.removeEventListener("pointermove", this.onPointerMove);
        window.removeEventListener("pointerdown", this.onPointerDown);
        document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
        window.removeEventListener("blur", this.onPointerLeave);
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
        this.world.pointer.active = false;
        // Drop the canvas backing stores as well as the scheduled work.
        this.canvas.width = this.canvas.height = 0;
        this.renderer.destroy();
    }
    resize() {
        if (this.disposed) return;
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.renderer.resize(rect.width, rect.height, dpr);
        this.world.resize(rect.width, rect.height, this.renderer.cellWidth, this.renderer.cellHeight);
        if (this.reducedMotion.matches) this.drawStill();
    }
    schedule() {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
        if (this.disposed || !this.visible || document.hidden || this.reducedMotion.matches) return;
        this.last = performance.now();
        this.acc = 0;
        this.raf = requestAnimationFrame(this.frame);
    }
    frame = (now)=>{
        this.raf = 0;
        if (this.disposed || !this.visible || document.hidden || this.reducedMotion.matches) return;
        const dt = Math.min(0.1, (now - this.last) / 1000);
        this.last = now;
        this.acc += dt;
        let steps = 0;
        while(this.acc >= STEP && steps < MAX_STEPS){
            this.world.step(STEP);
            this.acc -= STEP;
            steps++;
        }
        if (steps === MAX_STEPS) this.acc = 0;
        this.renderer.render(this.world, dt);
        this.raf = requestAnimationFrame(this.frame);
    };
    drawStill() {
        if (this.disposed) return;
        if (this.world.time < 4) {
            for(let i = 0; i < 240; i++)this.world.step(STEP);
        }
        this.renderer.render(this.world, STEP);
    }
    onMotionPreference = ()=>{
        if (this.disposed) return;
        this.schedule();
        if (this.reducedMotion.matches) {
            this.drawStill();
        }
    };
    onVisibilityChange = () => {
        this.onPointerLeave();
        this.schedule();
    };
    toLocal(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
        return {
            x,
            y,
            inside
        };
    }
    onPointerMove = (e)=>{
        const { x, y, inside } = this.toLocal(e);
        const p = this.world.pointer;
        p.x = x;
        p.y = y;
        p.active = inside && e.pointerType !== "touch";
    };
    onPointerDown = (e)=>{
        const { x, y, inside } = this.toLocal(e);
        if (inside && !this.reducedMotion.matches) this.world.splash(x, y);
    };
    onPointerLeave = ()=>{
        this.world.pointer.active = false;
    };
}
