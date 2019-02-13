
const canvas = document.createElement('canvas');
const height = canvas.height = 400;
const width = canvas.width = 400;

const tileSize = 10;
document.body.appendChild(canvas);

const context = canvas.getContext('2d');
let tiles = [];

const GRASS = 'GRASS';
const OCEAN = 'OCEAN';
const FOREST = 'FOREST';
const NONE = 'NONE';

const G = GRASS;
const O = OCEAN;

const colors = {
  GRASS: '#00FF00',
  OCEAN: '#0000FF',
  FOREST: '#006400',
  NONE: '#FFFFFF',
}

class Tile {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color || NONE;
  }

  draw(context) {
    context.fillStyle = colors[this.color] || '#FFFFFF';
    context.fillRect(this.x, this.y, tileSize, tileSize);
  }
}

const copyTile = (tile) => new Tile(tile.x, tile.y, tile.color);

for (let row = 0;row < height/tileSize;row++) {
  const currentRow = [];
  for (let column = 0; column < width/tileSize;column++) {
    currentRow.push(new Tile(column * tileSize, row * tileSize));
  }
  tiles.push(currentRow);
}


function getNeighbours(centerTile, size) {
  const index = { x: centerTile.x / tileSize, y: centerTile.y / tileSize };
  let grid = tiles;
  const tile = grid[index.y][index.x];
  // const allDeltas = [
  //   { x:-1, y: -1 }, {x: 0, y: -1},  { x: 1, y: -1},
  //   { x:-1, y:  0 },              ,  { x: 1, y:  0},
  //   { x:-1, y:  1 }, {x: 0, y:  1 }, { x: 1, y:  1},
  // ];

  const allDeltas = [];
  for(let h = 0;h < size; h++) {
    for (let w = 0;w < size;w++) {
      const x = w - (size-1)/2;
      const y = h - (size-1)/2;
      if (x === 0 && y === 0) continue;
      allDeltas.push({ x, y });
    }
  }

  const neighbours = [];
  if (!tile) {
    return neighbours;
  }

  const deltas = allDeltas;
  deltas.forEach(delta => {
    const indexX = index.x + delta.x;
    const indexY = index.y + delta.y;

    if (indexX < 0 || indexX > grid.length-1 ||
        indexY < 0 || indexY > grid.length-1) {
    } else {
      neighbours.push(grid[indexY][indexX]);
    }
  });

  return neighbours;
}


const growGrassRule = (tile) => {
  if (Math.random() > 0.6) return GRASS; 
  return tile.color;
}

const randomCreateOceanRule = (tile) => {
  if (Math.random() > 0.6) return OCEAN; 
  return tile.color;
}

const createOceanRule = (tile) => {
  return OCEAN;
}

const grow = (chances) => (tile) => {
  const n = getNeighbours(tile, 3);

  if (n.length < 4) return tile.color;
  
  const topLeftTile = n[0];
  const leftTile = n[3];
  const topTile = n[1];
  const key = `${topLeftTile.color}:${topTile.color}:${leftTile.color}`;

  if (!chances[key]) {
    return tile.color;
  }
  
  if (Math.random() + chances[key][GRASS] < Math.random() + chances[key][OCEAN]) {
    return OCEAN;
  }
  return GRASS;
}

const iterateTiles = (fnc, reassign = true) => {
  const newTiles = []
  tiles.forEach(row => {
    const newRow = [];
    row.forEach(tile => {
      newRow.push(fnc(tile));
    });
    newTiles.push(newRow);
  });

  if (reassign) tiles = newTiles;
}

const applyRule = (rule) => {
  iterateTiles(tile => {
    const newTile = copyTile(tile);
    newTile.color = rule(tile);
    return newTile;
  })
}

const drawTiles = () => {
  iterateTiles(tile => tile.draw(context), false);
}


const applyShape = (shape) => {
  const middle = Math.round(tiles.length / 2) - Math.round(shape.length / 2);

  for (let row = 0;row < shape.length; row++){
    for (let column = 0;column < shape[row].length; column++){
      tiles[middle + row][middle + column].color = shape[row][column];
    }
  }
}
const seedIsland = () => {
  const island = [
    [O, O,O,O, O,],
    [O, O,O,O, O,],
    [O, G,G,G, O,],
    [O, G,G,G, O,],
    [O, G,G,G, O,],
    [O, O,O,O, O,],
    [O, O,O,O, O,],
  ];

  applyShape(island);
}

const seedBigIsland = () => {
  const island = [
    [O, O,O,O, O,O,O,O],
    [O, O,O,O, O,O,O,O],
    [O, O,G,G, G,G,O,O],
    [O, O,G,G, G,G,O,O],
    [O, O,G,G, G,G,O,O],
    [O, O,G,G, G,G,O,O],
    [O, O,O,O, O,O,O,O],
    [O, O,O,O, O,O,O,O],
  ];

  applyShape(island);
}


const seedT = () => {
  const t = [
    [G, G,G,G, G, G, G],
    [G, G,G,G, G, G, G],
    [G, G,G,G, G, G, G],
    [O, O,G,G, G, O, O],
    [O, O,G,G, G, O, O],
    [O, O,G,G, G, O, O],
    [O, O,G,G, G, O, O],
    [O, O,G,G, G, O, O],
    [O, O,G,G, G, O, O],
    [O, O,G,G, G, O, O],
  ];

  applyShape(t);
}


const seedStar = () => {
  const t = [
    [O, O,O,G, O, O, O],
    [O, O,O,G, O, O, O],
    [O, O,G,G, G, O, O],
    [G, G,G,G, G, G, G],
    [G, G,G,G, G, G, G],
    [O, O,G,G, G, O, O],
    [O, O,O,G, O, O, O],
    [O, O,O,G, O, O, O],
    [O, O,O,G, O, O, O],
  ];

  applyShape(t);
}

const seedNZ = () => {
  const t = [
    [O,O,O,O,O,O,G,O,O,O,O,O,O],
    [O,O,O,O,O,O,G,G,O,O,O,O,O],
    [O,O,O,O,O,O,O,G,G,O,O,O,O],
    [O,O,O,O,O,O,O,G,G,G,O,O,O],
    [O,O,O,O,O,O,O,O,G,G,O,G,O],
    [O,O,O,O,O,O,O,O,G,G,G,G,O],
    [O,O,O,O,O,O,O,G,G,G,G,G,O],
    [O,O,O,O,O,O,O,O,G,G,G,O,O],
    [O,O,O,O,O,O,O,O,G,G,G,O,O],
    [O,O,O,O,O,O,O,G,G,G,O,O,O],
    [O,O,O,O,O,O,O,O,O,O,O,O,O],
    [O,O,O,O,O,O,G,G,G,O,O,O,O],
    [O,O,O,O,O,G,G,G,O,O,O,O,O],
    [O,O,O,O,G,G,G,G,G,O,O,O,O],
    [O,O,O,G,G,G,O,O,O,O,O,O,O],
    [O,O,G,G,G,O,O,O,O,O,O,O,O],
    [O,G,G,G,O,O,O,O,O,O,O,O,O],
    [O,O,O,O,O,O,O,O,O,O,O,O,O],
  ];

  applyShape(t);
}

const analyze = () => {
  
  const cases = {};
  tiles.forEach(row => row.forEach(tile => {
    const n = getNeighbours(tile, 5);
    if (n.length < 12) {
      return;
    }

    const mTiles = [0,1,2,5,6,7,10,11];

    const key = `${topLeftTile.color}:${topTile.color}:${leftTile.color}`;

    if (cases[key]) {
      cases[key][tile.color]++;
    } else {
      const obj = { };
      obj[GRASS] = 0;
      obj[OCEAN] = 0;
      obj[NONE] = 0;

      obj[tile.color]++;
      cases[key] = obj;
    }
  }));

  Object.keys(cases).forEach(key => {
    const total = cases[key].GRASS + cases[key].OCEAN || 1;
    cases[key][GRASS] = cases[key][GRASS] / total;
    cases[key][OCEAN] = cases[key][OCEAN] / total;
    delete cases[key][NONE]
  });

  return cases;
}

seedNZ();
const chances = analyze();

drawTiles();
document.getElementById('iterate').onclick = function(){
  applyRule(grow(chances));
  drawTiles();
}

setInterval(() => {
  applyRule(grow(chances));
  drawTiles();
}, 200)
