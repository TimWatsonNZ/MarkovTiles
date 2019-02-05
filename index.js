
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

const colors = {
  GRASS: '#00FF00',
  OCEAN: '#0000FF',
  FOREST: '#006400'
}

class Tile {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
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


function getNeighbours(centerTile) {
  const index = { x: centerTile.x / tileSize, y: centerTile.y / tileSize };
  let grid = tiles;
  const tile = grid[index.y][index.x];
  const allDeltas = [
    { x:-1, y: -1 }, {x: 0, y: -1},  { x: 1, y: -1},
    { x:-1, y:  0 },              ,  { x: 1, y:  0},
    { x:-1, y:  1 }, {x: 0, y:  1 }, { x: 1, y:  1},
  ];

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
  const neighbours = getNeighbours(tile);

  const matrixChances = { OCEAN: 0, GRASS: 0 };

  neighbours.forEach((neighbour, i) => {
    if (!neighbour.color) return;
    matrixChances[neighbour.color] += chances[tile.color][i][neighbour.color];
  });

  const sum = matrixChances[OCEAN] + matrixChances[GRASS];
  if (sum === 0) {
    return tile.color;
  }
  matrixChances[OCEAN] /= sum;
  matrixChances[GRASS] /= sum;

  if (1 - Math.random() > matrixChances[OCEAN]) {
    return OCEAN;
  }
  return GRASS;
}

const createShoreline = (tile) => {
  const neighbours = getNeighbours(tile);

  if (neighbours.length < 8) {
    return tile.color;
  }
  if ((neighbours[3].color === OCEAN && neighbours[4].color === OCEAN) ||
  (neighbours[1].color === OCEAN && neighbours[6].color === OCEAN) ||
  (neighbours[0].color === OCEAN && neighbours[7].color === OCEAN) ||
  (neighbours[2].color === OCEAN && neighbours[5].color === OCEAN)) {
    return OCEAN;
  }
  return tile.color;
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

const seedIsland = () => {
  const island = [
    [{ x: 0, y: 0, color: OCEAN }, { x: 1, y: 0, color: OCEAN }, { x: 2, y: 0, color: GRASS },{ x: 3, y: 0, color: OCEAN }, { x: 4, y: 0, color: OCEAN } ],
    [{ x: 0, y: 1, color: OCEAN }, { x: 1, y: 1, color: GRASS }, { x: 2, y: 1, color: GRASS },{ x: 3, y: 1, color: GRASS }, { x: 4, y: 1, color: OCEAN } ],
    [{ x: 0, y: 2, color: GRASS }, { x: 1, y: 2, color: GRASS }, { x: 2, y: 2, color: GRASS },{ x: 3, y: 2, color: GRASS }, { x: 4, y: 2, color: GRASS } ],
    [{ x: 0, y: 3, color: OCEAN }, { x: 1, y: 3, color: GRASS }, { x: 2, y: 3, color: GRASS },{ x: 3, y: 3, color: GRASS }, { x: 4, y: 3, color: OCEAN } ],
    [{ x: 0, y: 4, color: OCEAN }, { x: 1, y: 4, color: OCEAN }, { x: 2, y: 4, color: GRASS },{ x: 3, y: 4, color: OCEAN }, { x: 4, y: 4, color: OCEAN } ],
  ];

  const middle = Math.round(tiles.length / 2) - Math.round(island.length / 2);

  for (let row = 0;row < island.length; row++){
    for (let column = 0;column < island.length; column++){
      tiles[middle + row][middle + column].color = island[row][column].color;
    }
  }
}

const analyze = () => {
  const cases = {
    GRASS: [
      { GRASS: 0, OCEAN: 0}, { GRASS: 0, OCEAN: 0 }, { GRASS: 0, OCEAN: 0 },
      { GRASS: 0, OCEAN: 0 },                        { GRASS: 0, OCEAN: 0 },
      { GRASS: 0, OCEAN: 0}, { GRASS: 0, OCEAN: 0 }, { GRASS: 0, OCEAN: 0 },
    ],
    OCEAN: [
      { GRASS: 0, OCEAN: 0}, { GRASS: 0, OCEAN: 0}, { GRASS: 0, OCEAN: 0 },
      { GRASS: 0, OCEAN: 0},                        { GRASS: 0, OCEAN: 0 },
      { GRASS: 0, OCEAN: 0}, { GRASS: 0, OCEAN: 0}, { GRASS: 0, OCEAN: 0 },
    ],
  };

  const countGrass = (n) => n.filter(x => x.color === GRASS).length;
  const countOcean = (n) => n.filter(x => x.color === OCEAN).length

  tiles.forEach(row => row.forEach(tile => {
    const n = getNeighbours(tile);

    if (n.filter(x => !x.color).length > 7) return;
    
    n.forEach((x, i) => {
      if (!tile.color || !x.color) return;
      cases[tile.color][i][x.color]++;
    });
  }));

  Object.keys(cases).forEach(key => {
    cases[key].forEach(chances => {
      const total = chances.GRASS + chances.OCEAN;
      chances[GRASS] = chances[GRASS] / total;
      chances[OCEAN] = chances[OCEAN] / total;
    })
  });

  console.log(JSON.stringify(cases));
  return cases;
}

// applyRule(randomCreateOceanRule);
// applyRule(grow)
// applyRule(createShoreline);
seedIsland();
const chances = analyze();
applyRule(grow(chances));
// applyRule(grow(chances));
// applyRule(grow(chances));
// applyRule(grow(chances));
// applyRule(grow(chances));
// applyRule(grow(chances));
// applyRule(grow(chances));
// applyRule(grow);
// applyRule(grow);
drawTiles();
