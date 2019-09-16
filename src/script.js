var nodeSize, nodePadding, levelHeight, treeHeight, leftBound, rightBound;
var root;
var myCamera;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(160);
    nodeSize = 10.;
    nodePadding = 4.;
    levelHeight = nodeSize + 2*nodePadding;
    treeHeight = nodeSize*2 + nodePadding*3;
    leftBound = -(1.5 * nodeSize + 2 * nodePadding);
    rightBound = -leftBound;
    root = new Node(0., nodePadding + nodeSize/2., null);
    root.left = new Node(root.x - (nodeSize + nodePadding), root.y + levelHeight, root);
    root.right = new Node(root.x + (nodeSize + nodePadding), root.y + levelHeight, root);
    myCamera = new Camera();
}

function draw() {
    background(160);
    root.display();
    myCamera.line(leftBound, treeHeight, rightBound, 0);
    myCamera.line(leftBound, 0, rightBound, treeHeight);
}

class Node {
    constructor(x, y, parent) {
        this.val = 0;
        this.left = null;
        this.right = null;
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.width = nodeSize;
    }

    // Display the tree staring from this node with dfs
    display() {
        if (this.left != null) {
            this.left.display();
        }
        if (this.right != null) {
            this.right.display();
        }
        if (this.parent != null) {
            myCamera.line(this.x, this.y, this.parent.x, this.parent.y);
        }
        myCamera.ellipse(this.x, this.y, nodeSize, nodeSize);
    }

    // Calculate and adjust the sizes and positions of this node and the subtree under it
    // Returns a number indicating the width of the subtree
    adjustPosition(baseX, depth, rightBound) {
        // TODO: perform dfs to accumulation the width of the the entire subtree and update the postions of the nodes
        return this.width;
    }

    // Click trigger
    onClick() {
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
    ellipse(x, y, w, h) {
        this.updateScale();
        let x_p = x * this.scale + this.x;
        let y_p = y * this.scale + this.y;
        let w_p = w * this.scale;
        let h_p = h * this.scale;
        ellipse(x_p, y_p, w_p, h_p);
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