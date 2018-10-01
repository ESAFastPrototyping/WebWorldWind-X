import CyclicPickController from '../../src/util/CyclicPickController';

describe('CyclicPickController', () => {
    const controllerUnderTest = new CyclicPickController({
        addEventListener: function(){}
    }, ['click'], () => {});

    describe('#setNextHighlightStage', () => {
        it('properly ignores terrain.', () => {
            const highlightedRenderables = controllerUnderTest.setNextHighlightStage([{
                id: 1,
                isTerrain: true,
                userObject: {
                    highlighted: false
                }
            }, {
                id: 2,
                isTerrain: true,
                userObject: {
                    highlighted: false
                }
            }]);

            expect(highlightedRenderables.length).toBe(0);
        });

        it('highlights next object in array', () => {
            const highlightedRenderables = controllerUnderTest.setNextHighlightStage([{
                id: 1,
                isTerrain: false,
                userObject: {
                    highlighted: true
                }
            }, {
                id: 2,
                isTerrain: true
            }, {
                id: 3,
                isTerrain: false,
                userObject: {
                    highlighted: false
                }
            }]);

            expect(highlightedRenderables[0].id).toBe(3);
        });

        it('highlights first when last is highlighted', () => {
            const highlightedRenderables = controllerUnderTest.setNextHighlightStage([{
                id: 1,
                isTerrain: false,
                userObject: {
                    highlighted: false
                }
            }, {
                id: 2,
                isTerrain: true
            }, {
                id: 3,
                isTerrain: false,
                userObject: {
                    highlighted: true
                }
            }]);

            expect(highlightedRenderables[0].id).toBe(1);
        });

        it('keeps the first highlighted, when there is only one', () => {
            const highlightedRenderables = controllerUnderTest.setNextHighlightStage([{
                id: 1,
                isTerrain: false,
                userObject: {
                    highlighted: true
                }
            }]);

            expect(highlightedRenderables[0].id).toBe(1);
        });
    });
});