export const boundIndex = (index: number, total: number) => {
    return Number(((index % total) + total) % total);
};
