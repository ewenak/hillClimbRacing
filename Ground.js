class Ground {

    constructor(x=0) {
        this.vectors = [];
        this.width = 20 * canvas.width;
        this.distance = x + this.width;
        this.recreateAt = this.distance - canvas.width;
        this.x = x;
        this.smoothness = 10; //a vector every
        this.grassThickness = 5;

        for (var i = this.x; i < this.distance; i += this.smoothness) {
            this.vectors.push(new Vec2(i, canvas.height - map(noise(i / 500), 0, 1, 10, 500)));
        }

        this.vectors.push(new Vec2(this.distance, canvas.height + this.grassThickness * 2));
        this.vectors.push(new Vec2(0, canvas.height + this.grassThickness * 2));

        for (var vect of this.vectors) {
            vect.x /= SCALE;
            vect.y /= SCALE;
        }
        this.dirtBodies = [];
        for (var i = 1; i < this.vectors.length; i++) {
            this.dirtBodies.push(this.addEdge(this.vectors[i - 1], this.vectors[i], DIRT_MASK, DIRT_CATEGORY));
        }

        this.grassBodies = [];
        for (var i = 1; i < this.vectors.length; i++) {
            this.grassBodies.push(this.addEdge(new Vec2(this.vectors[i - 1].x, this.vectors[i - 1].y - this.grassThickness / SCALE), new Vec2(this.vectors[i].x,
                this.vectors[i].y - this.grassThickness / SCALE), GRASS_MASK, GRASS_CATEGORY));
        }
    }

    show() {
        fill(82, 30, 0);
        noStroke();
        if (this.x == 0) {
            stroke(0, 205, 0);
            strokeWeight(this.grassThickness * 2);
        }

        beginShape();
        push();
        translate(-panX, -panY);
        for (var i = 0; i < this.vectors.length - 2; i++) {
            vertex(this.vectors[i].x * SCALE, this.vectors[i].y * SCALE);
        }

        // Vertical closing bar to get a closed shape
        vertex(this.distance, canvas.height + this.grassThickness * 2 + panY);
        vertex(this.x, canvas.height + this.grassThickness * 2 + panY);

        endShape(CLOSE);
        pop();

        if (this.x != 0) {
            // Grass
            stroke(0, 205, 0);
            strokeWeight(this.grassThickness * 2);

            for (var i = 0; i < this.vectors.length - 2; i++) {
                line(this.vectors[i].x * SCALE - panX, this.vectors[i].y * SCALE - panY, this.vectors[i + 1].x * SCALE - panX, this.vectors[i + 1].y * SCALE - panY);
            }
        }
        strokeWeight(1);
    }

    addEdge(vec1, vec2, mask, category) {
        var bodyDef = new b2BodyDef();
        bodyDef.type = b2StaticBody;
        bodyDef.position.x = 0; //canvas.width / 2 / SCALE;
        bodyDef.position.y = 0; //(canvas.height - 20) / SCALE;
        var fixDef = new b2FixtureDef();
        fixDef.friction = 0.99; // 0.95;
        fixDef.restitution = 0.1;
        fixDef.shape = new b2PolygonShape();

        fixDef.shape.SetAsEdge(vec1, vec2);

        var filtData = new b2FilterData();
        // filtData.groupIndex = -1;
        filtData.categoryBits = category;
        filtData.maskBits = mask;
        var tempBody = world.CreateBody(bodyDef);

        tempBody.CreateFixture(fixDef).SetFilterData(filtData);
        return tempBody;
        // bodies.push(tempBody);
    }
}
