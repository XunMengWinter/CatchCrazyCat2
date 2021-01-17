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
        gameResult: {
            default: null,
            type: cc.Node
        },
        gameRestart: {
            default: null,
            type: cc.Node
        },
        titleLabel: {
            default: null,
            type: cc.Label
        },
        stepLabel: {
            default: null,
            type: cc.Label
        },
        remainLabel: {
            default: null,
            type: cc.Label
        },
        box: {
            default: null,
            type: cc.Prefab
        },
        boxNodes: {
            default: [],
            type: [cc.Node]
        },
        centerBoxNodes: {
            default: [],
            type: [cc.Node]
        },
        block: {
            default: null,
            type: cc.Prefab
        },
        cat: {
            default: null,
            type: cc.Prefab
        },
        catNode: {
            default: null,
            type: cc.Node
        },
        allSteps: 0,
        currentStep: 0,
        isGameOver: false,
        currentLevel: 0
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 开启碰撞检测系统，未开启时无法检测
        cc.director.getCollisionManager().enabled = true;
        this.currentLevel = 0
        this.nextLevel()
        const that = this
        // this.gameRestart.on(cc.Node.EventType.MOUSE_DOWN, function (event) {
        //     that.currentLevel--
        //     that.nextLevel()
        // }, this);
        this.gameRestart.on(cc.Node.EventType.TOUCH_END, function (event) {
            that.currentLevel--
            that.nextLevel()
        }, this)
    },

    addBoxs() {
        const maxXX = 1080
        const border = Math.floor(540 + 126 / 2)
        let startX = -maxXX
        let startY = maxXX

        while (startY > -maxXX) {
            let x = startX
            let y = startY
            while (x < maxXX) {
                x = x + 111
                y = y - 29
                if (x > border) {
                    break
                }
                if (x < -border || y < -border) {
                    continue
                }
                if (y > border) {
                    continue
                }
                let newNode = cc.instantiate(this.box)
                this.gameArea.addChild(newNode)
                this.boxNodes.push(newNode)
                if (Math.abs(x) < 256 && Math.abs(y) < 256) {
                    this.centerBoxNodes.push(newNode)
                }
                newNode.setPosition(x, y)
                this.addClickEvent(newNode)
            }
            startX = startX + 30
            startY = startY - 110
        }
    },

    addClickEvent(node) {
        const that = this
        // 使用枚举类型来注册
        // node.on(cc.Node.EventType.MOUSE_DOWN, function (event) {
        //     if (this.isGameOver) {
        //         return
        //     }
        //     if (that.catNode.x == node.x && that.catNode.y == node.y) {
        //         return
        //     }
        //     node.pauseSystemEvents();
        //     console.log('Mouse down');
        //     console.log(node)
        //     node.active = false
        //     that.addBlock(node.x, node.y)
        //     that.jumpCat()
        // }, this);
        node.on(cc.Node.EventType.TOUCH_END, function (touch, event) {
            if (this.isGameOver) {
                return
            }
            if (that.catNode.x == node.x && that.catNode.y == node.y) {
                return
            }
            // 返回世界坐标
            const touchLoc = touch.getLocation();
            // https://docs.cocos.com/creator/api/zh/classes/Intersection.html 检测辅助类
            if (cc.Intersection.pointInPolygon(touchLoc, node.getComponent(cc.PolygonCollider).world.points)) {
                console.log("Hit!");
            } else {
                return
            }

            node.pauseSystemEvents();
            console.log('Mouse down');
            console.log(node)
            node.active = false
            that.addBlock(node.x, node.y)
            that.jumpCat()
        }, this)
    },

    gameOver() {
        this.gameResult.active = true
        this.isGameOver = true
    },

    nextLevel() {
        const gameAreaChildren = this.gameArea.children
        for (let i = 0; i < gameAreaChildren.length; i++) {
            const node = gameAreaChildren[i]
            node.destroy()
        }
        this.isGameOver = false
        this.gameResult.active = false
        this.boxNodes = []
        this.centerBoxNodes = []
        this.currentLevel++
        this.titleLabel.string = "第" + this.currentLevel + "关"
        const stepList = [50, 40, 30, 20, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7]
        this.allSteps = stepList[this.currentLevel - 1]
        this.currentStep = 0
        const remainStep = this.allSteps - this.currentStep
        this.stepLabel.string = "已用步数：" + this.currentStep
        this.remainLabel.string = "剩余步数：" + remainStep

        const that = this
        cc.resources.load("prefab/block", function (err, prefab) {
            that.block = prefab
        })

        cc.resources.load("prefab/box", function (err, prefab) {
            that.box = prefab
            that.addBoxs()

            cc.resources.load("prefab/cat", function (err, prefab) {
                that.cat = prefab
                that.addCat()
            })
        })
    },

    jumpCat() {
        const nextNodes = []
        const danger2Nodes = []
        const x = this.catNode.x
        const y = this.catNode.y
        let bestNode
        for (let i = 0; i < this.boxNodes.length; i++) {
            const node = this.boxNodes[i]
            if (node.active) {
                if (Math.abs(node.x - x) < 126 && Math.abs(node.y - y) < 126) {
                    if (node.x == x && node.y == y) {

                    } else {
                        //一步胜利
                        if (Math.abs(node.x) > (540 - 63) || Math.abs(node.y) > (540 - 63)) {
                            bestNode = node
                            break
                        }
                        nextNodes.push(node)
                    }
                } else {
                    const isDanger = Math.abs(node.x) > (540 - 63) || Math.abs(node.y) > (540 - 63)
                    if (isDanger) {
                        const distance = Math.pow((x - node.x), 2) + Math.pow((y - node.y), 2)
                        if (distance < Math.pow((126 * 2), 2)) {
                            danger2Nodes.push(node)
                        }
                    }
                }
            }
        }
        let randomNode = bestNode
        if (!randomNode) {
            if (danger2Nodes.length > 0) {
                for (let i = 0; i < nextNodes.length; i++) {
                    const node = nextNodes[i]
                    let nearDanger2Count = 0
                    for (let j = 0; j < danger2Nodes.length; j++) {
                        const dangerNode = danger2Nodes[j]
                        if (Math.abs(node.x - dangerNode.x) < 126 && Math.abs(node.y - dangerNode.y) < 126) {
                            nearDanger2Count++
                        }
                    }
                    if (nearDanger2Count > 1) {
                        randomNode = node
                        break
                    }
                }
            }
            if (!randomNode) {
                randomNode = nextNodes[Math.floor(Math.random() * nextNodes.length)]
            }
        }
        if (randomNode) {
            this.catNode.setPosition(randomNode.x, randomNode.y)
            if (Math.abs(randomNode.x) > (540 - 63) || Math.abs(randomNode.y) > (540 - 63)) {
                this.gameOver()
            }
            this.currentStep++
            const remainStep = this.allSteps - this.currentStep
            this.stepLabel.string = "已用步数：" + this.currentStep
            this.remainLabel.string = "剩余步数：" + remainStep
            if (remainStep <= 0) {
                this.gameOver()
            }
        } else {
            this.nextLevel()
        }
    },

    addCat() {
        const randomNode = this.centerBoxNodes[Math.floor(Math.random() * this.centerBoxNodes.length)]
        let newNode = cc.instantiate(this.cat)
        this.gameArea.addChild(newNode)
        this.catNode = newNode
        newNode.setPosition(randomNode.x, randomNode.y)
    },

    addBlock(x, y) {
        let newNode = cc.instantiate(this.block)
        this.gameArea.addChild(newNode)
        newNode.setPosition(x, y)
    },

    start() {

    },

    // update (dt) {},
});
