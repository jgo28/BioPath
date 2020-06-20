const moduleEdit = require('./moduleEdit');

test('testClickSaveBtn should return true', () => {
    expect(moduleEdit.testClickSaveBtn("click")).toBe(false);
    expect(moduleEdit.testClickSaveBtn("no click")).toBe(true);
});

test('test initialXCoor', () => {
    expect(moduleEdit.setInitialXCoor(1)).toBe(330);
});

test('test if radio buttons changed', () => {
    expect(moduleEdit.onRadioChange(["test1"], ["test2"], ["test3"])).toBe(0);
});