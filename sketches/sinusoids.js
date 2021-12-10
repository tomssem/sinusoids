const canvasSketch = require('canvas-sketch');
import {random} from "canvas-sketch-util";
var _ = require('lodash');
import {Pane, SliderApi} from 'tweakpane';

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const colours = [
  // "lime", "darkorange",
  "Fuchsia",
  "lightskyblue"];

const params = {
  time_delta: 0.89,
  num_spiras: 10,
  blur: 0,
  alpha: 0.25,
  scale: 1.7,
  frequency: 0.13
}


const distance = (p1, p2) => {

  return Math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2);
}

class Tracer {
  constructor(colour) {
    this.points = [];
    this.colour = colour;
  }

  reset() {
    this.points = [];
  }

  draw(context, _, x, y) {
    context.beginPath();
    context.strokeStyle = this.colour;
    context.lineWidth = 2;
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

  reset() {
    this.next.reset();
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

const finishSpira = (context, spira, time_delta) => {
  spira.reset();
  let time = 0;

  while(!spira.finished() && spira.length() < 1000) {
    spira.update(context, time, 0, 0);
    time += time_delta;
  }

  return spira;
}

const spira1 = generateRandomSpira();
const spira2 = generateRandomSpira();

const spiras = generateRandomSpiras(params.num_spiras);

let finished = undefined;

const sketch = () => {
  return ({ context, width, height, time }) => {
    while(spiras.length < params.num_spiras) {
      spiras.push(generateRandomSpira());
    }
    while(spiras.length > params.num_spiras) {
      spiras.pop();
    }
    context.fillStyle = "DarkSlateGrey";
    context.fillRect(0, 0, width, height);


    context.filter = `blur(${params.blur}px)`;

    let time_delta = time / 1000;
    finished = _.map(spiras, (spira) => finishSpira(context, spira, params.time_delta));
    context.globalAlpha = params.alpha
    finished.forEach((spira, index) => {
      context.save();
      const scaleRandomness = random.noise2D(time, index * 10, params.frequency);
      const scale = params.scale * (random.noise2D(time, index * 10, params.frequency) + 1) / 2
      const rotation = random.noise2D(index * 10, time, params.frequency) * Math.PI;
      context.scale(scale, scale);
      context.translate(width / (2 * scale), height / (2 * scale));
      context.rotate(rotation);
      spira.draw(context)
      context.restore();
      if(scaleRandomness < -0.7) {
        spiras[index]= generateRandomSpira();
      }
    });
  };
};

canvasSketch(sketch, settings);

const createPane = () => {
  const pane = new Pane();
  let folder;
  folder = pane.addFolder({title: "Drawing"})
  folder.addInput(params, "time_delta", {min: 0.01, max: 1, step: 0.01});
  folder.addInput(params, "num_spiras", {min:1, max: 10, step: 1});

  folder = pane.addFolder({title: "Global"})
  folder.addInput(params, "blur", {min: 0, max: 3, step: 0.1});
  folder.addInput(params, "alpha", {min: 0, max: 1, step: 0.05});
  folder.addInput(params, "scale", {min: 0, max: 3, step: 0.05});
  folder.addInput(params, "frequency", {min: 0.000, max: 3, step: 0.01});
}

createPane();