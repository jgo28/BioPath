var modelEdit = require('./modelEditTesting');
 
test('Test getDotPos', () => {
    expect(modelEdit.getDotPos(50, 0, ["r"], 100)).toBe(50);
});

test('Test that speed is changed', () => {
    expect(modelEdit.setSpeed("", 10)).toBe(0);
    expect(modelEdit.setSpeed("enzyme1", 20)).toBe(1);
});