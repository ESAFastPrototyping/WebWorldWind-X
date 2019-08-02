import Query from '../../../src/service/scihub/Query';

describe('Query', () => {
    describe('', () => {

        it('returns proper query containing all parameters', () => {
            const beginTime = new Date("2017-05-02T12:45:32.004+02:00");
            const endTime = new Date("2017-06-02T12:45:32.004+02:00");
            const query = new Query({
                shortName: 'S-1A',
                products: ['SAR'],
                location: {
                    latitude: 35,
                    longitude: 40
                },
                beginTime: beginTime,
                endTime: endTime,
                startIndex: 0
            });
            const url = query.url();
            expect(url).toBe('?q=(footprint%3A%22intersects(35%2C%2040)%22)AND(beginposition%3A%20%5B2017-05-02T10%3A45%3A32.004Z%20TO%202017-06-02T10%3A45%3A32.004Z%5D)AND(filename%3A(S1A_*))AND(producttype%3A(SAR))&rows=100&start=0&orderby=beginposition%20desc');
        });
    });
});