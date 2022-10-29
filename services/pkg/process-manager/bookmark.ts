export interface BookmarkRepo<T> {
    get: () => Promise<T>;
    set: (bookmark: T) => Promise<void>;
}
