import { Lifecycle } from './lifecycle';

describe('lifecycle', () => {
    let lifecycle: Lifecycle;

    beforeEach(async () => {
        jest.resetModules();
        const module = await import('./lifecycle');
        lifecycle = module.lifecycle;
    });

    it('should be running by default', () => {
        expect(lifecycle.isRunning()).toBeTruthy();
    });

    it('should shutdown and run all registered listener functions', async () => {
        let closed = false;
        lifecycle.on('close', async () => {
            closed = true;
        });

        await lifecycle.shutdown();
        expect(closed).toBeTruthy();
    });

    it('should not be running after shutdown is called', async () => {
        await lifecycle.shutdown();
        expect(lifecycle.isRunning()).toBeFalsy();
    });

    it('should run multiple handlers when shutting down', async () => {
        let count = 0;
        lifecycle.on('close', () => (count += 1));
        lifecycle.on('close', () => (count += 1));

        await lifecycle.shutdown();

        expect(count).toBe(2);
    });

    it('should properly run async handlers', async () => {
        let called = false;
        lifecycle.on('close', async () => (called = true));

        await lifecycle.shutdown();

        expect(called).toBeTruthy();
    });
});
