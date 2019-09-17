var nodeSize, nodePadding, levelHeight, treeHeight = 0., leftBound = 0., rightBound = 0.;
var root;
var myCamera;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(160);
    nodeSize = 10.;
    nodePadding = 4.;
    levelHeight = nodeSize + 2*nodePadding;
    // treeHeight = nodeSize*2 + nodePadding*3;
    // leftBound = -(1.5 * nodeSize + 2 * nodePadding);
    // rightBound = -leftBound;
    root = new Node(0., nodePadding + nodeSize/2.);
    root.left = new Node();
    root.right = new Node();
    root.right.right = new Node();
    root.calculateTreeWidth();
    root.adjustPosition(0., 0., 'root');
    myCamera = new Camera();
    root.display();
}

function draw() {
    // background(160);
    // myCamera.line(leftBound, treeHeight, rightBound, 0);
    // myCamera.line(leftBound, 0, rightBound, treeHeight);
}

class Node {
    constructor(x = 0., y = 0.) {
        this.val = 0;
        this.left = null;
        this.right = null;
        this.x = x;
        this.y = y;
        this.width = nodeSize;
    }

    // Display the tree staring from this node with dfs
    display(parent = null) {
        if (this.left != null) {
            this.left.display(this);
        }
        if (this.right != null) {
            this.right.display(this);
        }
        if (parent != null) {
            myCamera.line(this.x, this.y, parent.x, parent.y);
        }
        myCamera.ellipse(this.x, this.y, nodeSize, nodeSize, this.val, this.onClick);
    }

    // Calculate and adjust the sizes and positions of this node and the subtree under it
    // Returns a number indicating the width of the subtree
    // branchDirection: 'left' | 'right' | 'root'
    adjustPosition(baseX, depth, branchDirection) {
        // TODO: perform dfs to accumulation the width of the the entire subtree and update the postions of the nodes
        if (branchDirection == 'left') {
            this.x = baseX - this.width/2.;
            leftBound = Math.min(leftBound, baseX - this.width);
        } else if (branchDirection == 'right') {
            this.x = baseX + this.width/2.;
            rightBound = Math.max(rightBound, baseX + this.width);
        }
        this.y = depth + levelHeight;
        treeHeight = Math.max(treeHeight, this.y + levelHeight);
        if (this.left != null) {
            this.left.adjustPosition(this.x, this.y, 'left');
        }
        if (this.right != null) {
            this.right.adjustPosition(this.x, this.y, 'right');
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
        console.log('Node got clicked!!!!')
        // TODO: prompts the user to set the value, add children or delete
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
    ellipse(x, y, w, h, val, onClick) {
        this.updateScale();
        let x_p = x * this.scale + this.x;
        let y_p = y * this.scale + this.y;
        let w_p = w * this.scale;
        let h_p = h * this.scale;
        uxEllipse(x_p, y_p, w_p, h_p).uxEvent('click', onClick);
        textAlign(CENTER, CENTER);
        textSize(2 * this.scale);
        text(`${val}`, x_p, y_p);
    }

    // Draw a line
    line(x1, y1, x2, y2) {
        this.updateScale();
        let x1_p = x1 * this.scale + this.x;
        let y1_p = y1 * this.scale + this.y;
        let x2_p = x2 * this.scale + this.x;
        let y2_p = y2 * this.scale + this.y;
        line(x1_p, y1_p, x2_p, y2_p);
    }
}