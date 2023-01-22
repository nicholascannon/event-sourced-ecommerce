export const CONFIG: Config = (() => {
    const origin = window.location.origin;
    switch (origin) {
        case 'http://localhost:3000':
            return {
                orderServiceURL: 'http://localhost:8000',
            };
        default:
            throw new Error(`No config for host ${origin}`);
    }
})();

type Config = {
    orderServiceURL: string;
};
