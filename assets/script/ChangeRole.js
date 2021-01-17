// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        gameArea: {
            default: null,
            type: cc.Node
        },
        escapeArea: {
            default: null,
            type: cc.Node
        },
        label: {
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    },

    callback(event, customEventData) {
        if (this.label.string == "返回角色") {
            this.label.string = "幻化为猫"
            this.escapeArea.active = false
            this.gameArea.active = true
        } else {
            this.label.string = "返回角色"
            this.gameArea.active = false
            this.escapeArea.active = true
        }
    },

    start() {

    },

    // update (dt) {},
});
