// autochessService.test.js
// Testing
// ================

const service = require('./autochessService');

// Test
// beforeAll(() => doSomething());
// afterAll(() => doSomething());
// const checkSynergy = () => console.log('check synergy...');

describe('Get Random Synergy', () => {
    // beforeEach(() => checkSynergy());

    test('Get 1 random race synergy', () => {
        expect(service.getRandomRace(1).length).toBe(1);
    });

    test('Get 1 random class synergy', () => {
        expect(service.getRandomClass(1).length).toBe(1);
    });

    test('Get 1 random synergy', () => {
        expect(service.getRandomSynergy(1).length).toBe(1);
    });

    test('Get 10 random synergy', () => {
        expect(service.getRandomSynergy(10).length).toBe(10);
    });
});

describe('Get icon URL for Synergy', () => {
    test('Get icon URL for human synergy', () => {
        expect(service.getIconUrl('Human')).toBe('https://static.ilongyuan.cn/official_website/e52b47a8c88/61268e367c33412f5cce9bf77333d723.png');
    });

    test('Get invalid entry for not existing synergy', () => {
        expect(service.getIconUrl('Bot')).not.toBe('');
    });
});

test.todo('Incomplete tests for autochess service');
