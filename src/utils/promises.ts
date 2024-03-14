export const PromiseScheduler = async <T>(promises: Promise<T>[]): Promise<T[]> => {
    return await Promise.all([...promises]);   
}