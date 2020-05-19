let smoothing = 0.1;
let time = 0;
let healthyCount = 0;
let infectedCount = 0;
let recoveredCount = 0;
let deadCount = 0;
let graphData = [];
let graphSpeed = 10;
let populationCount = 80;
let gamerules = {
  recoveredBecomesSusceptible : false,
}
population = [];


function setup() {
  createCanvas(innerWidth, innerHeight);
  frameRate(60);
  for (let i = 0; i < populationCount; i++) {
    population.push(new Dot());
  }
  population[0].infect();
}

function update() {
  time++;
  healthyCount = 0;
  infectedCount = 0;
  recoveredCount = 0;
  deadCount = 0;
  for (let dot of population) {
    dot.update();
    if (dot.dead) {
      deadCount ++;
    } else {
      if (dot.infectedState === 0 ) {
        healthyCount ++;
      } else if (dot.infectedState === 1) {
        infectedCount ++;
      } else if (dot.infectedState === 2) {
        recoveredCount ++;
      }
    }
  }
  if (time % graphSpeed === 0) {
    graphData.push({
      healthy: healthyCount,
      infected: infectedCount,
      recovered: recoveredCount,
      dead: deadCount,
    });
  }
}

function draw() {
  update();
  background(51);
  for (let dot of population) {
    dot.draw();
  }
  textSize(40);
  fill(255);
  textAlign(LEFT, TOP);
  noStroke(0);
  let healthyText = round((healthyCount / populationCount) * 1000) / 10;
  let infectText = round((infectedCount / populationCount) * 1000) / 10;
  let recovText = round((recoveredCount / populationCount) * 1000) / 10;
  let deadText = round((deadCount / populationCount) * 1000) / 10;
  text("Susceptible: " + healthyCount + " (" + healthyText + "%)", 5, 5);
  text("Infected: " + infectedCount + " (" + infectText + "%)", 5, 55);
  text("Recovered: " + recoveredCount + " (" + recovText + "%)", 5, 105);
  text("Dead: " + deadCount + " (" + deadText + "%)", 5, 155);

  noStroke();
  for (let i = 0; i < graphData.length; i++) {
    strokeWeight(1);
    let h = graphData[i].infected;
    let hpast = 0;
    stroke(204, 63, 63);
    line(i + 5, innerHeight - 5 - hpast, i + 5, innerHeight - 5 - h);
    hpast = h;
    h += graphData[i].healthy;
    stroke(66, 232, 194);
    line(i + 5, innerHeight - 5 - hpast, i + 5, innerHeight - 5 - h);
    hpast = h;
    h += graphData[i].recovered;
    stroke(75, 164, 219);
    line(i + 5, innerHeight - 5 - hpast, i + 5, innerHeight - 5 - h);
    hpast = h;
    h += graphData[i].dead;
    stroke(120, 120, 120);
    line(i + 5, innerHeight - 5 - hpast, i + 5, innerHeight - 5 - h);

  }
}

class Dot {


  constructor() {
    this.direction = random(0, Math.PI * 2);
    this.x = random(0, innerWidth);
    this.y = random(0, innerHeight);
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.rD = 0;
    this.gD = 0;
    this.bD = 0;
    this.directionD = 0;
    this.xD = 0;
    this.yD = 0;
    this.size = 30;
    this.sizeD = 0;
    this.seed = noise(-100000, 100000);
    this.infectedState = 0;
    this.virusTime = -1;
    this.vulnerability = random(0, 2)
    this.dead = false;
  }

  update() {
    if (!this.dead) {
      this.x += Math.sin(this.direction) * 4;
      this.y += Math.cos(this.direction) * 4;
      for (let dot of population) {
        if (dot != this && !dot.dead) {
          if (dist(this.x, this.y, dot.x, dot.y) < 20) {
            this.x += Math.sin(this.direction);
            this.y += Math.cos(this.direction);
            this.direction = lerp(this.direction, dot.direction, 0.004);

          }
          if (dist(this.x, this.y, dot.x, dot.y) < 100) {
            if (random(0, 100) < 1 && this.infectedState === 1) { // They Get Infected!
              dot.infect();
            }
          }

        }
      }
      this.direction += (noise(time / 50, this.seed) - 0.5) / 8;


      if (this.direction > Math.PI * 2) {
        this.direction = -Math.PI * 2;
      }

      if (this.x > innerWidth + 16) {
        this.x = -16;
        this.xD = -16;
      }
      if (this.x < -16) {
        this.x = innerWidth + 16;
        this.xD = innerWidth + 16;
      }
      if (this.y > innerHeight + 16) {
        this.y = -16;
        this.yD = -16;
      }
      if (this.y < -16) {
        this.y = innerHeight + 16;
        this.yD = innerHeight + 16;
      }
      if (this.virusTime > 0) {
        this.virusTime -= 1;
      } else if (this.virusTime === 0) {
        this.infectedState = 2;
      }

      if (this.infectedState === 1) {
        this.vulnerability -= 0.0001;
        if (random(0, 2000) < this.vulnerability) {
          this.dead = true;
          this.infectedState = 2;
          this.size = 25;
        }
      }
      if (this.infectedState === 2) {
        if (random(0, 1000) < 1 && gamerules.recoveredBecomesSusceptible) {
          this.infectedState = 0;
          this.virusTime = -1;
        }
      }

    } else {
      this.direction = time / 50;
    }
    if (this.infectedState === 1) { // Infected
      this.r = 204;
      this.g = 63;
      this.b = 63;
    } else if (this.infectedState === 2) { // Recovered
      this.r = 75;
      this.g = 164;
      this.b = 219;
    } else {
      this.r = 67;
      this.g = 232;
      this.b = 194;
    }
    if(this.dead) {
      this.r = 120;
      this.g = 120;
      this.b = 120;
    }

    this.directionD = lerp(this.directionD, this.direction, 0.1);
    this.xD = lerp(this.xD, this.x, 0.2);
    this.yD = lerp(this.yD, this.y, 0.2);
    this.sizeD = lerp(this.sizeD, this.size, 0.04);
    this.rD = lerp(this.rD, this.r, 0.04);
    this.gD = lerp(this.gD, this.g, 0.04);
    this.bD = lerp(this.bD, this.b, 0.04);
  }

  infect() {
    if (this.infectedState === 0) {
      this.infectedState = 1;
      this.virusTime = 1000 + round(random(-400, 400));
    }
  }

  draw() {
    strokeWeight(2);
    stroke(0);
    fill(this.rD, this.gD, this.bD);
    ellipse(this.xD, this.yD, this.sizeD, this.sizeD);
    fill(0);
    let vuld = map(this.vulnerability, 2, 0, 0, this.sizeD / 2);
    ellipse(this.xD, this.yD, vuld, vuld);
    line(this.xD, this.yD, this.xD + Math.sin(this.directionD) * this.sizeD / 2, this.yD + Math.cos(this.directionD) * this.sizeD / 2);
    for (let dot of population) {
      if (dot != this && !dot.dead && dot.infectedState === 0) {
        if (dist(this.x, this.y, dot.x, dot.y) < 100) {
          if(this.infectedState === 1) { // They Get Infected!
            let lineMod = map(dist(this.xD, this.yD, dot.xD, dot.yD), 80, 100, 255, 0);
            strokeWeight(map(dist(this.x, this.yD, dot.xD, dot.yD), 80, 100, 4, 0));
            stroke(204, 63, 63, lineMod);
            line(this.xD, this.yD, dot.xD, dot.yD);
          }
        }

      }
    }

  }

}