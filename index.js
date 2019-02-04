
const canvas = document.createElement('canvas');
const height = canvas.height = 400;
const width = canvas.width = 400;

const tileSize = 10;
document.body.appendChild(canvas);

const context = canvas.getContext('2d');
let tiles = [];

class Tile {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
  }

  draw(context) {
    context.fillStyle = this.color || '#FFFFFF';
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

const GRASS = '#00FF00';
const OCEAN = '#0000FF';
const FOREST = '#006400';


const growGrassRule = (tile) => {
  if (Math.random() > 0.6) return GRASS; 
  return tile.color;
}

const randomCreateOceanRule = (tile) => {
  if (Math.random() > 0.6) return OCEAN; 
  return tile.color;
}

const createOceanRule = (tile) => {
  return '#0000FF';
}

const grow = (chances) => (tile) => {
  const neighbours = getNeighbours(tile);

  // if (neighbours.length < 8) return OCEAN;

  const countGrass = () => neighbours.filter(x => x.color === GRASS).length;
  const countOcean = () => neighbours.filter(x => x.color === OCEAN).length
  
  const chanceForGrass = chances[`grass:${countGrass()}`];
  const chanceForOcean = chances[`ocean:${countOcean()}`];

  if (!chanceForGrass || chanceForGrass.chance === 0) {
    return OCEAN;
  }
  if (!chanceForOcean || chanceForOcean.chance === 0) {
    return GRASS;
  }
  
  return Math.random() > 1 - chanceForGrass ? OCEAN : GRASS; 

  return tile.color;
}

const createShoreline = (tile) => {
  const neighbours = getNeighbours(tile);

  if (neighbours.length < 8) {
    return tile.color;
  }
  if ((neighbours[3].color === '#0000FF' && neighbours[4].color === '#0000FF') ||
  (neighbours[1].color === '#0000FF' && neighbours[6].color === '#0000FF') ||
  (neighbours[0].color === '#0000FF' && neighbours[7].color === '#0000FF') ||
  (neighbours[2].color === '#0000FF' && neighbours[5].color === '#0000FF')) {
    return '#0000FF';
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
  const cases = {};

  const countGrass = (n) => n.filter(x => x.color === GRASS).length;
  const countOcean = (n) => n.filter(x => x.color === OCEAN).length

  tiles.forEach(row => row.forEach(tile => {
    const n = getNeighbours(tile);

    if (n.filter(x => !x.color).length > 7) return;
    const grass = countGrass(n);
    const ocean = countOcean(n);

    const forGrass = `grass:${grass}`;
    const forOcean = `ocean:${ocean}`;

    if (cases[forGrass]) {
      if (tile.color === GRASS) {
        cases[forGrass].positive++;
      } else {
        cases[forGrass].negative++;
      }
    } else {
      cases[forGrass] = { positive: tile.color === GRASS ? 1 : 0, negative: tile.color === GRASS ? 0 : 1 };
    }
    if (cases[forOcean]) {
      if (tile.color === OCEAN) {
        cases[forOcean].positive++;
      } else {
        cases[forOcean].negative++;
      }
    } else {
      cases[forOcean] = { positive: tile.color === OCEAN ? 1 : 0, negative: tile.color === OCEAN ? 0 : 1 };
    }
  }));

  const chances = Object.keys(cases).map(c => {
    const value = cases[c];
    if (value.positive === 0) {
      return { key: c, chance: 0 };
    }

    if (value.negative === 0) {
      return { key: c, chance: 1 };
    }

    const sum = value.positive + value.negative;
    return { key: c, chance: value.positive / sum };
  }).reduce((collection, current) => {
    collection[current.key] = current.chance;
    return collection;
  }, {});
  console.log(JSON.stringify(chances));
  return chances;
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
