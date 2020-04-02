// pmastersService.test.js
// Testing
// ================

const service = require('./pmastersService');

// Test
// beforeAll(() => doSomething());
// afterAll(() => doSomething());
// const checkSynergy = () => console.log('check synergy...');

describe('Get Pokemon Event', () => {
    // beforeEach(() => checkSynergy());

    test('Get current pokemon event', () => {
        const callback = (json) => {
            expect(json).not.toBeNull();
        };
        service.getSyncEvents(callback);
    });
});

describe('Get Pokemons as list', () => {
    // beforeEach(() => checkSynergy());

    test('Get pokemons', () => {
        const callback = (json) => {
            expect(json).not.toBeNull();
        };
        service.getPokemons(callback);
    });
});

test.todo('Mockup server requests');
