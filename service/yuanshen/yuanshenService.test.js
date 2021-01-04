// yuanshenService.test.js
// Testing
// ================

const service = require('./yuanshenService');

// Test
// beforeAll(() => doSomething());
// afterAll(() => doSomething());
// const checkSynergy = () => console.log('check synergy...');

describe('Convert star rating', () => {
    test('Get 1-star rating', () => {
        expect(service.getStarrating(1) === '★');
    });
    test('Get 2-star rating', () => {
        expect(service.getStarrating(2) === '★★');
    });
    test('Get 3-star rating', () => {
        expect(service.getStarrating(3) === '★★★');
    });
    test('Get 4-star rating', () => {
        expect(service.getStarrating(4) === '★★★★');
    });
    test('Get 5-star rating', () => {
        expect(service.getStarrating(5) === '★★★★★');
    });
});

test.todo('Mockup server requests');
