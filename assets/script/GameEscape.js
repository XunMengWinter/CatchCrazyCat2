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
        blockNodes: {
            default: [],
            type: [cc.Node]
        },
        cat: {
            default: null,
            type: cc.Prefab
        },
        catNode: {
            default: null,
            type: cc.Node
        },
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
            if (Math.abs(that.catNode.x - node.x) < 126 && Math.abs(that.catNode.y - node.y) < 126) {
                that.catNode.setPosition(node.x, node.y)

                if (Math.abs(node.x) > (540 - 63) || Math.abs(node.y) > (540 - 63)) {
                    that.nextLevel()
                    return
                }

                that.playBlock(node.x, node.y)
            }
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
        this.blockNodes = []
        this.catNode = null
        this.currentLevel++
        this.titleLabel.string = "第" + this.currentLevel + "关"

        const that = this
        cc.resources.load("prefab/box", function (err, prefab) {
            that.box = prefab
            that.addBoxs()

            cc.resources.load("prefab/zhangai", function (err, prefab) {
                that.block = prefab
                that.genBlock(that.currentLevel)
                that.currentStep = 0
                that.stepLabel.string = "障碍数：" + that.blockNodes.length
                that.remainLabel.string = "得分：" + that.currentStep

                cc.resources.load("prefab/cat", function (err, prefab) {
                    that.cat = prefab
                    that.addCat()
                })
            })
        })
    },

    genBlock(count) {
        let removedCount = 0;
        while (removedCount < count) {
            const randomIndex = Math.floor(Math.random() * this.boxNodes.length)
            const randomNode = this.boxNodes[randomIndex]
            if (randomNode) {
                removedCount++
                this.addBlock(randomNode.x, randomNode.y)
                this.boxNodes.splice(randomIndex, 1)
                randomNode.destroy()
            }
        }
    },

    playBlock(x, y) {
        let nextNodes = []
        let danger1Nodes = []
        let danger2Nodes = []
        let danger3Nodes = []
        let danger4Nodes = []
        let indexList = []
        let danger1IndexList = []
        let danger2IndexList = []
        let danger3IndexList = []
        let danger4IndexList = []
        const distance1Nodes = []
        const distance2Nodes = []
        const distance3Nodes = []
        const distance4Nodes = []
        const distance1IndexList = []
        const distance2IndexList = []
        const distance3IndexList = []
        const distance4IndexList = []
        for (let i = 0; i < this.boxNodes.length; i++) {
            const node = this.boxNodes[i]
            if (!node) {
                continue
            }
            if (node.x == x && node.y == y) {
                continue
            }
            const distance = Math.pow((x - node.x), 2) + Math.pow((y - node.y), 2)
            const isDanger = Math.abs(node.x) > (540 - 63) || Math.abs(node.y) > (540 - 63)
            if (distance < Math.pow((126 * 1), 2)) {
                distance1Nodes.push(node)
                distance1IndexList.push(i)
                if (isDanger) {
                    danger1Nodes.push(node)
                    danger1IndexList.push(i)
                }
                nextNodes.push(node)
                indexList.push(i)
            } else if (distance < Math.pow((126 * 2), 2)) {
                distance2Nodes.push(node)
                distance2IndexList.push(i)
                if (isDanger) {
                    danger2Nodes.push(node)
                    danger2IndexList.push(i)
                }
                nextNodes.push(node)
                indexList.push(i)
            } else if (distance < Math.pow((126 * 3), 2)) {
                distance3Nodes.push(node)
                distance3IndexList.push(i)
                if (isDanger) {
                    danger3Nodes.push(node)
                    danger3IndexList.push(i)
                }
                nextNodes.push(node)
                indexList.push(i)
            } else if (distance < Math.pow((126 * 4), 2)) {
                distance4Nodes.push(node)
                distance4IndexList.push(i)
                if (isDanger) {
                    danger4Nodes.push(node)
                    danger4IndexList.push(i)
                }
                nextNodes.push(node)
                indexList.push(i)
            }
        }

        if (distance1Nodes.length < 2) {
            nextNodes = distance1Nodes
            indexList = distance1IndexList
            this.randomBlock(nextNodes, indexList)
            this.gameOver()
            return
        }

        if (danger1Nodes.length > 0) {
            nextNodes = danger1Nodes
            indexList = danger1IndexList
            this.randomBlock(nextNodes, indexList)
            return
        }

        if (danger2Nodes.length > 0) {
            let realDanger2Nodes = []
            let realDanger2IndexList = []
            for (let i = 0; i < danger2Nodes.length; i++) {
                const danger2Node = danger2Nodes[i]
                let neiborCount = 0
                for (let j = 0; j < distance1Nodes.length; j++) {
                    const distance1Node = distance1Nodes[j]
                    if (Math.abs(distance1Node.x - danger2Node.x) < 126 && Math.abs(distance1Node.y - danger2Node.y) < 126) {
                        neiborCount++
                    }
                }
                if (neiborCount > 0) {
                    realDanger2Nodes.push(danger2Node)
                    realDanger2IndexList.push(danger2IndexList[i])
                } else {
                    for (let j = 0; j < distance2Nodes.length; j++) {
                        if (danger2Node.x == distance2Nodes[j].x) {
                            distance2Nodes.splice(j, 1)
                            distance2IndexList.splice(j, 1)
                            break
                        }
                    }
                }
            }
            if (realDanger2Nodes.length > 0) {
                nextNodes = realDanger2Nodes
                indexList = realDanger2IndexList
                this.randomBlock(nextNodes, indexList)
                return
            }
        }

        if (distance2Nodes.length < 3) {
            if (distance2Nodes.length == 0) {
                nextNodes = distance1Nodes
                indexList = distance1IndexList
                this.randomBlock(nextNodes, indexList)
                return
            }
            nextNodes = distance2Nodes
            indexList = distance2IndexList
            this.randomBlock(nextNodes, indexList)
            return
        }

        if (danger3Nodes.length > 0) {
            let realDanger3Nodes = []
            let realDanger3IndexList = []
            for (let i = 0; i < danger3Nodes.length; i++) {
                const danger3Node = danger3Nodes[i]
                let neiborCount = 0
                for (let j = 0; j < distance2Nodes.length; j++) {
                    const distance2Node = distance2Nodes[j]
                    if (Math.abs(distance2Node.x - danger3Node.x) < 126 && Math.abs(distance2Node.y - danger3Node.y) < 126) {
                        neiborCount++
                    }
                }
                if (neiborCount > 0) {
                    realDanger3Nodes.push(danger3Node)
                    realDanger3IndexList.push(danger3IndexList[i])
                } else {
                    for (let j = 0; j < distance3Nodes.length; j++) {
                        if (danger3Node.x == distance3Nodes[j].x) {
                            distance3Nodes.splice(j, 1)
                            distance3IndexList.splice(j, 1)
                            break
                        }
                    }
                }
            }
            if (realDanger3Nodes.length > 0) {
                nextNodes = realDanger3Nodes
                indexList = realDanger3IndexList
                this.randomBlock(nextNodes, indexList)
                return
            }
        }

        if (distance3Nodes.length < 4) {
            if (distance3Nodes.length == 0) {
                nextNodes = distance2Nodes
                indexList = distance2IndexList
                this.randomBlock(nextNodes, indexList)
                return
            }
            nextNodes = distance3Nodes
            indexList = distance3IndexList
            this.randomBlock(nextNodes, indexList)
            return
        }

        if (danger4Nodes.length > 0) {
            let realDanger4Nodes = []
            let realDanger4IndexList = []
            for (let i = 0; i < danger4Nodes.length; i++) {
                const danger4Node = danger4Nodes[i]
                let neiborCount = 0
                for (let j = 0; j < distance3Nodes.length; j++) {
                    const distance3Node = distance3Nodes[j]
                    if (Math.abs(distance3Node.x - danger4Node.x) < 126 && Math.abs(distance3Node.y - danger4Node.y) < 126) {
                        neiborCount++
                    }
                }
                if (neiborCount > 0) {
                    realDanger4Nodes.push(danger4Node)
                    realDanger4IndexList.push(danger4IndexList[i])
                } else {
                    for (let j = 0; j < distance4Nodes.length; j++) {
                        if (danger4Node.x == distance4Nodes[j].x) {
                            distance4Nodes.splice(j, 1)
                            distance4IndexList.splice(j, 1)
                            break
                        }
                    }
                }
            }
            if (realDanger4Nodes.length > 0) {
                nextNodes = realDanger4Nodes
                indexList = realDanger4IndexList
                this.randomBlock(nextNodes, indexList)
                return
            }
        }

        if (distance4Nodes.length < 5) {
            if (distance4Nodes.length == 0) {
                nextNodes = distance3Nodes
                indexList = distance3IndexList
                this.randomBlock(nextNodes, indexList)
                return
            }
            nextNodes = distance4Nodes
            indexList = distance4IndexList
            this.randomBlock(nextNodes, indexList)
            return
        }

        this.randomBlock(nextNodes, indexList)
        return
    },

    randomBlock(nextNodes, indexList) {
        const randomIndex = Math.floor(Math.random() * nextNodes.length)
        const randomNode = nextNodes[randomIndex]
        if (randomNode) {
            this.addBlock(randomNode.x, randomNode.y)
            this.boxNodes.splice(indexList[randomIndex], 1)
            randomNode.destroy()

            this.currentStep++
            this.stepLabel.string = "障碍数：" + this.blockNodes.length
            this.remainLabel.string = "得分：" + this.currentStep
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
        this.blockNodes.push(newNode)
        newNode.setPosition(x, y)
    },

    start() {

    },

    // update (dt) {},
});
