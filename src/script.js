var nodeSize, nodePadding, levelHeight;
var root;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
    nodeSize = 10.;
    nodePadding = 4.;
    levelHeight = nodeSize + 2*nodePadding;
    root = new Node(windowWidth/2., nodeSize/2. + nodePadding, null);
    root.left = new Node(root.x - (nodeSize + nodePadding), root.y + levelHeight, root);
    root.right = new Node(root.x + (nodeSize + nodePadding), root.y + levelHeight, root);
    myCamera = new Camera();
}

function draw() {
    background(255);
    root.display();
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
            line(this.x, this.y, this.parent.x, this.parent.y);
        }
        ellipse(this.x, this.y, nodeSize, nodeSize);
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
// Support zoom and automatically adjust the size
class Camera {
    constructor() {
        this.x = 0.;
        this.y = 0.;
        this.scale = 1.;
    }

    // Draw an ellipse
    ellipse(x, y, w, h) {}

    // Draw a line
    line(x1, y1, x2, y2) {}
}