import QuickLook from "../../../src/service/scihub/QuickLook";
import {fetch as fetchPolyfill} from 'whatwg-fetch';

describe('QuickLook', () => {
    describe('icon', () =>  {
        it('loads the icon and return the relevant image', async () => {
            const quickLook = new QuickLook('https://cog-gisat.s3.eu-central-1.amazonaws.com/data_cube.jpg', fetchPolyfill);
            const icon = await quickLook.icon();

            // TODO: Test whether the icon is the expected one.
            // TODO: Move tested image to the local server.
            expect(icon !== null).toBe(true);
        });
    })
});