
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
  if (Math.random() > 0.3) return '#00FF00'; 
  return tile.color;
}

const randomCreateOceanRule = (tile) => {
  if (Math.random() > 0.75) return OCEAN; 
  return tile.color;
}

const createOceanRule = (tile) => {
  return '#0000FF';
}

const grow = (tile) => {
  const neighbours = getNeighbours(tile);

  if (neighbours.filter(x => x.color === OCEAN).length >= 4) {
    return OCEAN;
  } else {
    // return GRASS;
  }

  if (neighbours.filter(x => x.color === OCEAN).length < 2) {
    return GRASS;
  }

  return tile.color;
}

const createShoreline = (tile) => {
  const neighbours = getNeighbours(tile);

  if (neighbours.length < 8) {
    return '#00FF00';
  }
  if ((neighbours[3].color === '#0000FF' && neighbours[4].color === '#0000FF') ||
  (neighbours[1].color === '#0000FF' && neighbours[6].color === '#0000FF') ||
  (neighbours[0].color === '#0000FF' && neighbours[7].color === '#0000FF') ||
  (neighbours[2].color === '#0000FF' && neighbours[5].color === '#0000FF')) {
        return '#0000FF';
      }
  return tile.color;
}

tiles[0][0].color = '#00FF00';

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
    tile.color = rule(tile);
    return tile;
  })
}

const drawTiles = () => {
  iterateTiles(tile => tile.draw(context), false);
}

applyRule(randomCreateOceanRule);
applyRule(grow);
drawTiles();
