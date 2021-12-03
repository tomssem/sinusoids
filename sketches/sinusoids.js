const canvasSketch = require('canvas-sketch');
import {random} from "canvas-sketch-util";
var _ = require('lodash');
import {Pane} from 'tweakpane';

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const colours = ["darkmagenta", "darkorange", "Fuchsia", "lightskyblue"];


const distance = (p1, p2) => {
  return Math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2);
}

class Tracer {
  constructor(colour) {
    this.points = [];
    this.colour = colour;
  }

  draw(context, _, x, y) {
    context.translate(x, y);
    const transform = context.getTransform();

    const i = transform.e;
    const j = transform.f;

    this.points.push([i, j]);

    context.resetTransform();
    context.beginPath();
    context.strokeStyle = this.colour;
    context.lineWidth = 3;
    this.points.forEach((p) => {
      context.lineTo(p[0], p[1]);
    });
    context.stroke();
  }
}

class Spira {
  constructor(width, height, omega, colour, next) {
    this.w = width;
    this.h = height;
    this.omega = omega;
    this.colour = colour;
    this.next = next;
  }

  draw(context, t, x, y) {

    context.save();
    context.fillStyle = this.colour;

    context.translate(x, y);
    context.rotate(t * this.omega);

    //context.beginPath();
    //context.rect(0, 0, this.w, this.h);
    //context.fill();


    if(this.next) {
      this.next.draw(context, t, 0, this.h);
    }
    
    context.restore();
  }
}

// const spira = new Spira(10, 100, 2.5,"red", new Spira(10, 100, 3, "green", new Tracer()));

const generateRandomSpira = () => {
  const _f = (n) => {
    if(n === 0) {
      const colour = random.pick(colours);
      return new Tracer(colour);
    }
    const length = random.pick([10, 20, 50, 100, 200]);
    const period = random.pick([1, 2, 3, 5, 7, 11]);
    return new Spira(10, length, period, "red", _f(n - 1));
  }

  return _f(random.rangeFloor(3, 6));
}

const generateRandomSpiras = (n) => {
  let spiras = []
  for(let i = 0; i < n; ++i) {
    spiras.push(generateRandomSpira());
  }


  return spiras;
}

const spira1 = generateRandomSpira();
const spira2 = generateRandomSpira();

const spiras = generateRandomSpiras(3);

const sketch = () => {
  return ({ context, width, height, time }) => {
    if(time < 0.5) {
      return;
    }
    context.fillStyle = "darkblue";
    context.fillRect(0, 0, width, height);

    // ontext.filter = 'blur(10px)';

    spiras.forEach((s) => {
      s.draw(context, time / 2, width / 2 - 10 /2, height / 2);
    })
  };
};

canvasSketch(sketch, settings);

const createPane = () => {
  const pane = new Pane();
  let folder;
  // folder = pane.addFolder({title: "Cells"})
  // folder.addInput(params, "cells", {min: 10, max: 100, step: 1});

  // folder = pane.addFolder({title: "Function"})
  // folder.addInput(params, "xTheta", {min: 0.1, max: 1080, step: 0.1});
  // folder.addInput(params, "yTheta", {min: 0.1, max: 1080, step: 0.1});
}

createPane();