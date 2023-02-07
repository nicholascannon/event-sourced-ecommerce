export const CONFIG: Config = (() => {
    const origin = window.location.origin;
    switch (origin) {
        case 'http://localhost:3000':
        case 'http://127.0.0.1:3000':
            return {
                orderServiceURL: 'http://localhost:8000',
            };
        default:
            throw new Error(`No config for origin ${origin}`);
    }
})();

type Config = {
    orderServiceURL: string;
};
