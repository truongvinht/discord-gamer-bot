// pmastersService.test.js
// Testing
// ================

const service = require('./pmastersService');

// Test
// beforeAll(() => doSomething());
// afterAll(() => doSomething());
// const checkSynergy = () => console.log('check synergy...');

describe('Get Event', () => {
    // beforeEach(() => checkSynergy());

    test('Get event', () => {
        const callback = (json) => {
            expect(json).not.toBeNull();
        };
        service.getSyncEvents(callback);
    });
});
