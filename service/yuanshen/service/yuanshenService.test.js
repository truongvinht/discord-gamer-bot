// yuanshenService.test.js
// Testing
// ================

const Service = require('./yuanshenService');

// Test
// beforeAll(() => doSomething());
// afterAll(() => doSomething());
// const checkSynergy = () => console.log('check synergy...');

const SERVER_URL = 'yuanshen-api.herokuapp.com';
const BAD_TOKEN = 'bad token';

describe('Request Data from Service', () => {
    test('Request figure with bad token', () => {
        const apiService = new Service(SERVER_URL, BAD_TOKEN, '', false);
        const callback = (json) => {
            expect(json).not.toBeNull();
        };
        apiService.singleFigure(callback, 'something');
    });
    test('Request figure details with bad token', () => {
        const apiService = new Service(SERVER_URL, BAD_TOKEN, '', false);
        const callback = (json) => {
            expect(json).not.toBeNull();
        };
        apiService.singleFigureDetails(callback, 'something');
    });
    test('Convert nickname to full name', () => {
        const apiService = new Service(SERVER_URL, BAD_TOKEN, '', false);
        expect(apiService.mapFigureNickname('baal')).not.toBeNull();
    });
    test('Validate short name', () => {
        const apiService = new Service(SERVER_URL, BAD_TOKEN, '', false);
        expect(apiService.validateLongFigureName('kokomi')).not.toBeNull();
    });

    test('Request random element with bad token', () => {
        const apiService = new Service(SERVER_URL, BAD_TOKEN, '', false);
        const callback = (json) => {
            expect(json).not.toBeNull();
        };
        apiService.randomElement(callback, 'something');
    });

    test('Request random weapon with bad token', () => {
        const apiService = new Service(SERVER_URL, BAD_TOKEN, '', false);
        const callback = (json) => {
            expect(json).not.toBeNull();
        };
        apiService.randomWeapon(callback, 'something');
    });
});
