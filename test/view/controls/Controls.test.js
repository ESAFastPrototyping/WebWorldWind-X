import Controls from '../../../src/view/controls/Controls';

describe(`Controls`, () => {
    let controlsUnderTest;
    // inject the HTML fixture for the tests
    beforeAll(function() {
        const fixture = `<div id="fixture"></div>`;

        document.getElementsByTagName(`body`)[0].insertAdjacentHTML(`afterbegin`,fixture);

        controlsUnderTest = new Controls({
            addEventListener: () => {},
            redraw: () => {},
            navigator: {
                range: 1000
            }
        }, `fixture`);
    });

    describe(`#handleZoomIn`, () => {

    });

    afterAll(function() {
        document.getElementsByTagName(`body`)[0].removeChild(document.getElementById(`fixture`));
    });
});