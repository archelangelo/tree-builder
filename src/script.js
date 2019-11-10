let canvasWidth = 100., canvasHeight = 80.;
let nodeSize = 10., nodePadding = 3., levelHeight = 17.5, treeHeight = 0., leftBound = 0., rightBound = 0.;
let backgroundColor = 245, fontSize = 5, lineColor = 100, lineWidth = .3;
let nodeColor = 50, nodeFontColor = 255, nodeHoverColor = 90;
let helpButtonSize = 25;
let root;
let myCamera;
let textBox, genButton;
let helpButton, helpBox;
let myCanvas;
let nodeModal, nodeModalDoneBtn, nodeModalInput, nodeModalDelBtn;
let currentNode;
const HELPTEXT = "- Click a node to change its value\n- Hover over an empty child's position and click to add a new node\n- Type in tree representation in text in the input field to generate a new tree\n- All updates are synchronized with the text field";

function setup() {
    myCanvas = createCanvas(windowWidth * 0.98, windowHeight * 0.98);
    myCanvas.center('horizontal');
    background(backgroundColor);
    textBox = createInput();
    textBox.position(myCanvas.x + 20, 20);
    genButton = createButton('submit');
    genButton.position(textBox.x + textBox.width + 8, 20);
    genButton.mousePressed(generateTree);

    // Setup node modal behaviors
    nodeModal = document.getElementById('nodeModal');
    nodeModalDoneBtn = document.getElementById('nodeModalDoneBtn');
    nodeModalInput = document.getElementById('nodeModalInput');
    nodeModalDelBtn = document.getElementById('nodeModalDelBtn');
    nodeModalDoneBtn.onclick = modalEditorDone;
    nodeModalDelBtn.onclick = deleteCurrentNode;

    root = Node.deserialize('[1,2,3,null,7,4,5,null,null,6]');
    genButton.elt.classList.add('button');
    textBox.elt.value = Node.serialize(root);
    myCamera = new Camera();
    root.display();

    helpBox = new HelpBox;
    uxNoStroke();
    uxFill(nodeColor);
    helpButton = uxEllipse(width - helpButtonSize, helpButtonSize, helpButtonSize, helpButtonSize);
    helpButton.uxEvent((input) => {
        if (input == "hover") {
            helpBox.visible = true;
        }
    });
    helpButton.uxRender();
}

function modalEditorDone() {
    currentNode.val = Number(nodeModalInput.value);
    textBox.elt.value = Node.serialize(root);
    nodeModal.style.display = 'none';
    uxDisable(false);
}

function deleteCurrentNode() {
    if (currentNode === root) {
        return;
    }
    Node.deleteNode(currentNode);
    textBox.elt.value = Node.serialize(root);
    nodeModal.style.display = 'none';
    uxDisable(false);
}

// Close and cancel value change when the user clicks outside.
window.onclick = function(event) {
        if (event.target == nodeModal) {
            nodeModal.style.display = "none";
            uxDisable(false);
        }
    }

function draw() {
    background(backgroundColor);
    root.display();
    helpBox.show();
    helpButton.uxRender();
    textSize(16);
    fill(nodeFontColor);
    textAlign(CENTER, CENTER);
    text("?", helpButton.x, helpButton.y);
}

function generateTree() {
    console.log(textBox.value());
    uxRefreshAll();
    root = Node.deserialize(textBox.value());
    root.display();
}

class Node {
    constructor(val = 0., x = 0., y = 0.) {
        this.val = val;
        this.left = null;
        this.right = null;
        this.x = x;
        this.y = y;
        this.width = nodeSize;
        this.ellipse = null;
        this.leftEllipse = null;
        this.rightEllipse = null;
        this.posUpdated = false;
    }

    // Display the tree staring from this node with dfs
    display(parent = null) {
        if (this.posUpdated) {
            this.updateUxObjectPos();
            this.posUpdated = false;
        }
        if (this.left != null) {
            this.left.display(this);
        } else {
            if (this.leftEllipse == null) {
                this.leftEllipse = myCamera.ellipse(this.x - nodeSize, this.y + levelHeight, nodeSize, nodeSize, nodeHoverColor);
                this.leftEllipse.visable = false;
                this.leftEllipse.uxEvent((input) => {
                    switch (input) {
                        case 'click':
                            this.leftEllipse.uxRemove();
                            this.leftEllipse = null;
                            this.left = new Node();
                            Node.updatePositions(root);
                            this.left.onClick();
                            break;
                        case 'hover':
                            this.leftEllipse.visable = true;
                    }
                });
            }
            if (this.leftEllipse.visable) {
                myCamera.line(this.x - nodeSize, this.y + levelHeight, this.x, this.y);
                this.leftEllipse.uxRender();
                this.leftEllipse.visable = false;
            }
        }
        if (this.right != null) {
            this.right.display(this);
        } else {
            if (this.rightEllipse == null) {
                this.rightEllipse = myCamera.ellipse(this.x + nodeSize, this.y + levelHeight, nodeSize, nodeSize, nodeHoverColor);
                this.rightEllipse.visable = false;
                this.rightEllipse.uxEvent((input) => {
                    switch (input) {
                        case 'click':
                            this.rightEllipse.uxRemove();
                            this.rightEllipse = null;
                            this.right = new Node();
                            Node.updatePositions(root);
                            this.right.onClick();
                            break;
                        case 'hover':
                            this.rightEllipse.visable = true;
                    }
                });
            }
            if (this.rightEllipse.visable) {
                myCamera.line(this.x + nodeSize, this.y + levelHeight, this.x, this.y);
                this.rightEllipse.uxRender();
                this.rightEllipse.visable = false;
            }
        }
        if (parent != null) {
            myCamera.line(this.x, this.y, parent.x, parent.y);
        }
        if (this.ellipse == null) {
            this.ellipse = myCamera.ellipse(this.x, this.y, nodeSize, nodeSize);
            this.ellipse.uxEvent((input) => {
                switch (input) {
                    case 'click':
                        this.onClick();
                        break;
                    case 'hover':
                        this.ellipse.uxFill = nodeHoverColor;
                }
            });
        }
        this.ellipse.uxRender();
        this.ellipse.uxFill = nodeColor;
        myCamera.text(`${this.val}`, this.x, this.y);
    }

    // Calculate and adjust the sizes and positions of this node and the subtree under it
    // Returns a number indicating the width of the subtree
    // branchDirection: 'left' | 'right' | 'root'
    adjustPosition(baseX = 0., depth = 0., branchDirection = 'root') {
        // TODO: perform dfs to accumulation the width of the the entire subtree and update the postions of the nodes
        let leftWidth = Node.getWidth(this.left), rightWidth = Node.getWidth(this.right);
        if (branchDirection == 'left') {
            this.x = baseX - this.width/2.;
            leftBound = Math.min(leftBound, baseX - this.width);
        } else if (branchDirection == 'right') {
            this.x = baseX + this.width/2.;
            rightBound = Math.max(rightBound, baseX + this.width);
        } else {
            this.x = baseX;
        }
        this.y = depth + levelHeight;
        treeHeight = Math.max(treeHeight, this.y + levelHeight * 2);
        if (this.left != null) {
            this.left.adjustPosition(this.x + (leftWidth - rightWidth) / 2., this.y, 'left');
        }
        if (this.right != null) {
            this.right.adjustPosition(this.x + (leftWidth - rightWidth) / 2., this.y, 'right');
        }
        this.posUpdated = true;
    }

    // Update all the object positions
    updateUxObjectPos() {
        if (this.ellipse != null) {
            console.log('At node id: ' + this.val + '. leftBound = ' + leftBound + 'rightBoud = ' + rightBound);
            [this.ellipse.x, this.ellipse.y, this.ellipse.w, this.ellipse.h] = myCamera.transform(this.x, this.y, nodeSize, nodeSize);
        }
        if (this.leftEllipse != null) {
            [this.leftEllipse.x, this.leftEllipse.y, this.leftEllipse.w, this.leftEllipse.h] = myCamera.transform(this.x - nodeSize, this.y + levelHeight, nodeSize, nodeSize);
        }
        if (this.rightEllipse != null) {
            [this.rightEllipse.x, this.rightEllipse.y, this.rightEllipse.w, this.rightEllipse.h] = myCamera.transform(this.x + nodeSize, this.y + levelHeight, nodeSize, nodeSize);
        }
    }

    // Calculate subtree width using dfs
    calculateTreeWidth() {
        let leftSubtreeWidth = nodeSize + 2 * nodePadding;
        let rightSubtreeWidth = leftSubtreeWidth;
        if (this.left != null) {
            leftSubtreeWidth = this.left.calculateTreeWidth();
        }
        if (this.right != null) {
            rightSubtreeWidth = this.right.calculateTreeWidth();
        }
        this.width = leftSubtreeWidth + rightSubtreeWidth;
        return this.width;
    }

    // Click trigger
    onClick() {
        nodeModalInput.value = this.val;
        currentNode = this;
        if (this === root) {
            nodeModalDelBtn.disabled = true;
        } else {
            nodeModalDelBtn.disabled = false;
        }
        uxDisable();
        nodeModal.style.display = 'block';
        nodeModalInput.focus();
        nodeModalInput.select();
    }

    // Serialize the tree into a string
    static serialize(root) {
        if (root == null) return "";
        let ans = "[";
        let queue = [];
        let nodeNumber = 0;
        queue.push(root);
        nodeNumber++;
        while (nodeNumber > 0) {
            let p = queue.shift();
            if (p == null) {
                ans += "null";
            } else {
                nodeNumber--;
                ans += p.val.toString();
                queue.push(p.left);
                if (p.left != null) {
                    nodeNumber++;
                }
                queue.push(p.right);
                if (p.right != null) {
                    nodeNumber++;
                }
            }
            if (nodeNumber > 0) {
                ans += ",";
            }
        }
        ans += "]";
        // console.log(ans);
        return ans;
    }

    static deserialize(data) {
        let queue = [];
        let valArr = data.substring(1, data.length-1).split(",");
        // console.log(valArr);
        let root;
        if (valArr.length > 0 && !isNaN(valArr[0]) && valArr[0] != "") {
            root = new Node(valArr[0].toString());
        } else {
            return null;
        }
        queue.push(root);
        valArr.shift();
        while (valArr.length > 0) {
            let p = queue.shift();
            if (valArr[0] != "null") {
                p.left = new Node(Number(valArr[0]));
                queue.push(p.left);
            }
            valArr.shift();
            if (valArr.length > 0 && valArr[0] != "null") {
                p.right = new Node(Number(valArr[0]));
                queue.push(p.right);
            }
            valArr.shift();
        }
        Node.updatePositions(root);
        return root;
    }

    static updatePositions(root) {
        root.calculateTreeWidth();
        root.adjustPosition();
        return root;
    }

    static getWidth(node) {
        if (node == null) {
            return nodeSize + 2 * nodePadding;
        } else {
            return node.width;
        }
    }

    static deleteNode(nodeToDel, node = root) {
        if (nodeToDel === node.right) {
            node.right = null;
        } else if (nodeToDel === node.left) {
            node.left = null;
        } else {
            if (node.left != null) {
                Node.deleteNode(nodeToDel, node.left);
            }
            if (node.right != null) {
                Node.deleteNode(nodeToDel, node.right);
            }
        }
    }
    
}

// Draw objects through the lens of this camera
// Support zoom and automatically adjust the size to fit all nodes
class Camera {
    constructor() {
        this.x = 0.;
        this.y = 0.;
        this.scale = 1.;
    }

    // Update the scale of the camera
    updateScale() {
        this.scale = Math.min(1.*height/treeHeight, 1.*width/(rightBound-leftBound));
        this.x = width/2. - (rightBound+leftBound)/2.*this.scale;
        this.y = 0;
    }

    // Draw an ellipse
    ellipse(x, y, w, h, color = nodeColor) {
        this.updateScale();
        uxNoStroke();
        uxFill(color);
        let x_p = x * this.scale + this.x;
        let y_p = y * this.scale + this.y;
        let w_p = w * this.scale;
        let h_p = h * this.scale;
        return uxEllipse(x_p, y_p, w_p, h_p);
    }

    // Display text
    text(t, x, y, color = nodeFontColor) {
        uxNoStroke();
        fill(color);
        this.updateScale();
        let x_p = x * this.scale + this.x;
        let y_p = y * this.scale + this.y;
        textAlign(CENTER, CENTER);
        textSize(fontSize * this.scale);
        text(t, x_p, y_p);
    }

    // Draw a line
    line(x1, y1, x2, y2) {
        this.updateScale();
        stroke(lineColor);
        strokeWeight(lineWidth * this.scale);
        let x1_p = x1 * this.scale + this.x;
        let y1_p = y1 * this.scale + this.y;
        let x2_p = x2 * this.scale + this.x;
        let y2_p = y2 * this.scale + this.y;
        line(x1_p, y1_p, x2_p, y2_p);
    }

    transform(x, y, w, h) {
        this.updateScale();
        return [x * this.scale + this.x, y * this.scale + this.y, w * this.scale, h * this.scale];
    }
}

class HelpBox {
    HelpBox() {
        this.visible = false;
    }
    show() {
        if (this.visible) {
            let margin = 12, fontSize = 16;
            let boxW = 500., boxH = margin * 2 + 6 * fontSize;
            let bx = width - helpButtonSize - boxW;
            let by = helpButtonSize;
            fill(nodeColor);
            noStroke();
            rect(bx, by, boxW, boxH);
            fill(nodeFontColor);
            textSize(fontSize);
            textAlign(LEFT, TOP);
            text(HELPTEXT, bx + margin, by + margin, boxW - margin * 2);
            this.visible = false;
        }
    }
}