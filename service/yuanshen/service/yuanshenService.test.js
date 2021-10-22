// yuanshenService.test.js
// Testing
// ================

const Service = require('./yuanshenService');

// Test
// beforeAll(() => doSomething());
// afterAll(() => doSomething());
// const checkSynergy = () => console.log('check synergy...');

describe('Request Data from Service', () => {
    test('Request with bad token', () => {
        const apiService = new Service('yuanshen-api.herokuapp.com', 'bad token', '', false);
        const callback = (json) => {
            expect(json).not.toBeNull();
        };
        apiService.singleFigure(callback, 'something');
    });
});
