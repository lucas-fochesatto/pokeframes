export class MT19937 {
    private static readonly n = 624;
    private static readonly m = 397;
    private static readonly w = 32;
    private static readonly r = 31;
    private static readonly UMASK = 0xffffffff << MT19937.r;
    private static readonly LMASK = 0xffffffff >>> (MT19937.w - MT19937.r);
    private static readonly a = 0x9908b0df;
    private static readonly u = 11;
    private static readonly s = 7;
    private static readonly t = 15;
    private static readonly l = 18;
    private static readonly b = 0x9d2c5680;
    private static readonly c = 0xefc60000;
    private static readonly f = 1812433253;

    private stateArray: number[] = new Array(MT19937.n);
    private stateIndex: number = 0;

    constructor(seed: number) {
        this.initializeState(seed);
    }

    private initializeState(seed: number): void {
        this.stateArray[0] = seed >>> 0;
        for (let i = 1; i < MT19937.n; i++) {
            seed = MT19937.f * (seed ^ (seed >>> (MT19937.w - 2))) + i;
            this.stateArray[i] = seed >>> 0;
        }
        this.stateIndex = 0;
    }

    private randomUint32(): number {
        const { n, m, UMASK, LMASK, a } = MT19937;
        let k = this.stateIndex;

        let j = k - (n - 1);
        if (j < 0) j += n;

        let x = ((this.stateArray[k] ?? 0)  & UMASK) | ((this.stateArray[j] ?? 0) & LMASK);

        let xA = x >>> 1;
        if (x & 0x00000001) xA ^= a;

        j = k - (n - m);
        if (j < 0) j += n;

        x = (this.stateArray[j] ?? 0) ^ xA;
        this.stateArray[k] = x;

        if (++k >= n) k = 0;
        this.stateIndex = k;

        let y = x;
        y ^= (y >>> MT19937.u);
        y ^= (y << MT19937.s) & MT19937.b;
        y ^= (y << MT19937.t) & MT19937.c;
        y ^= (y >>> MT19937.l);

        return y >>> 0;
    }

    public randomPokemon(min: number, max: number): number {
        return min + ((this.randomUint32() % (max - min)) + 1);
    }
}