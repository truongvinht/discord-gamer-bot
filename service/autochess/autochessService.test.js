// autochessService.test.js
// Testing
// ================

const service = require('./autochessService');

// Test
//beforeAll(() => doSomething());
//afterAll(() => doSomething());
const checkSynergy = () => console.log("check synergy...");

describe('Get Random Synergy', () => {

    //beforeEach(() => checkSynergy());

    test("Get 1 random race synergy", () => {
        expect(service.getRandomRace(1).length).toBe(1);
    });
    
    test("Get 1 random class synergy", () => {
        expect(service.getRandomClass(1).length).toBe(1);
    });
    
    test("Get 1 random synergy", () => {
        expect(service.getRandomSynergy(1).length).toBe(1);
    });
}); 


test.todo('Incomplete tests for autochess service');