const Utils = {
    random_seed( s ) {
        const rnd_mask = 0xffffffff;
        let rnd_s1     = (123456789 + s) & rnd_mask,
            rnd_s2     = (987654321 - s) & rnd_mask;

        return ()=>        {
            rnd_s2 = (36969 * (rnd_s2 & 65535) + (rnd_s2 >>> 16)) & rnd_mask;
            rnd_s1 = (18000 * (rnd_s1 & 65535) + (rnd_s1 >>> 16)) & rnd_mask;

            return (((rnd_s2 << 16) + (rnd_s1 & 65535)) >>> 0) / 4294967296;
        }
    }
};


export default Utils;