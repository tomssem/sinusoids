const canvasSketch = require('canvas-sketch');
import {random} from "canvas-sketch-util";
var _ = require('lodash');
import {Pane, SliderApi} from 'tweakpane';

const settings = {
  dimensions: [ 1080, 1080 ],
  // animate: true,
};

const colours = [
  // "lime", "darkorange",
  // "Fuchsia",
  "lightskyblue"];


const distance = (p1, p2) => {

  return Math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2);
}

class Tracer {
  constructor(colour) {
    this.points = [];
    this.colour = colour;
  }

  draw(context, _, x, y) {
    context.beginPath();
    context.strokeStyle = this.colour;
    context.lineWidth = 3;
    this.points.forEach((p) => {
      context.lineTo(p[0], p[1]);
    });
    context.stroke();
  }

  update(context, _, x, y) {
    context.translate(x, y);
    const transform = context.getTransform();

    const i = transform.e;
    const j = transform.f;

    this.points.push([i, j]);
  }

  finished() {
    const l = this.points.length - 1;
    return this.points.length > 10 && distance(this.points[0], this.points[l]) < 5;
  }

  length() {
    return this.points.length;
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

  update(context, t, x, y) {
    context.save();
    context.translate(x, y);
    context.rotate(t * this.omega);

    if(this.next) {
      this.next.update(context, t, 0, this.h);
    }
    
    context.restore();
  }

  draw(context, t, x, y) {
    if(this.next) {
      this.next.draw(context, t, 0, this.h);
    }
  }

  finished() {
    return this.next.finished();
  }

  length() {
    return this.next.length();
  }
}

const period = (spira) => {
  if(spira instanceof Tracer) {
    return 1;
  }
  let greatestCommonMultiple = period(spira.next);
  if(greatestCommonMultiple % spira.omega != 0) {
    greatestCommonMultiple *= spira.omega;
  }

  return greatestCommonMultiple;
}

const calcHeight = (spira) => {
  if(spira instanceof Tracer) {
    return 0;
  }

  return spira.h + calcHeight(spira.next);
}

const spira = new Spira(10, 100, 2,"red", new Spira(10, 100, 3, "green", new Tracer()));

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

const finishSpira = (context, spira) => {
  let time = 0;

  while(!spira.finished() && spira.length() < 10000) {
    spira.update(context, time, 530, 540);
    time += 0.01;
  }
  if(spira.finished()) {
    console.log(spira);
  }

  return spira;
}

const spira1 = generateRandomSpira();
const spira2 = generateRandomSpira();

const spiras = generateRandomSpiras(1);

let finished = undefined;

const sketch = () => {
  return ({ context, width, height, time }) => {
    context.fillStyle = "DarkSlateGrey";
    context.fillRect(0, 0, width, height);

    if(finished === undefined) {
      finished = _.map(spiras, (spira) => finishSpira(context, spira));
    }
    console.log(finished);
    finished.forEach((spira) => spira.draw(context));
    

    if(time > 0.5) {
    //   spiras.forEach((s) => {
    //     s.update(context, time / 2, width / 2 - 10 /2, height / 2)
    //     s.draw(context);
    //     s.draw(context);
    //     s.draw(context);
    //     s.draw(context);
    //   })
    // spira2.update(context, time / 2, width / 2 - 5, height / 2);
    // spira2.draw(context);
    }

    context.font = "30px Arial";
    context.fillText("Hello World", 10, 50); 
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