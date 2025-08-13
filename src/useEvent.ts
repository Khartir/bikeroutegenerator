// (!) Approximate behavior

function useEvent<T extends (...args: any[]) => any>(handler: T): T {
    const handlerRef = useRef(null);

    // In a real implementation, this would run before layout effects
    useLayoutEffect(() => {
        handlerRef.current = handler;
    });

    return useCallback((...args) => {
        // In a real implementation, this would throw if called during render
        const fn = handlerRef.current;
        return fn(...args);
    }, []);
}