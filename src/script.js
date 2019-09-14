var worldSize, nodeSize, nodePadding, levelHeight;
var root;

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
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
    worldSize = 1.;
    nodeSize = 10.;
    nodePadding = 4.;
    levelHeight = nodeSize + 2*nodePadding;
    root = new Node(windowWidth/2., nodeSize/2. + nodePadding, null);
    root.left = new Node(root.x - (nodeSize + nodePadding), root.y + levelHeight, root);
    root.right = new Node(root.x + (nodeSize + nodePadding), root.y + levelHeight, root);
}

function draw() {
    background(255);
    root.display();
}