(function () {

    var Script;

    module('test scene serialization', {
        setup: function () {
            SetupEngine.setup();

            Script = cc.Class({
                name: '97423897423',
                extends: cc.Component,
                properties: {
                    target: {
                        default: null,
                        type: cc.ENode
                    }
                },
                getName: function () {
                    return this.name;
                }
            });
        },
        teardown: function () {
            cc.js.unregisterClass(Script);
            SetupEngine.teardown();
        }
    });

    test('basic test', function () {
        var newScene = new cc.EScene();
        var root1 = new cc.ENode();
        root1.parent = newScene;

        var serialized = Editor.serialize(newScene, {stringify: false});
        strictEqual(serialized[0].__type__, cc.js._getClassId(cc.EScene), 'scene should be serialized');
        ok(serialized[0]._children instanceof Array, 'children should be serialized');

        var loaded = cc.deserialize(serialized);
        ok(loaded instanceof cc.EScene, 'deserialization');
        strictEqual(loaded._children.length, 1, 'children should be loaded');

        ok(cc.engine.getInstanceById(root1.uuid) == null, 'should not register uuid to engine before scene launch');

        cc.director.runScene(newScene);
        strictEqual(cc.director.getScene(), newScene, 'could run new scene');

        ok(cc.engine.getInstanceById(root1.uuid) === root1, 'should register uuid to engine after scene launch');
    });
})();
