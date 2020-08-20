function Minesweeper(size, debug)
{
const TILE_EMPTY_UNREVEALED = 0;
const TILE_EMPTY_REVEALED = 1;
const TILE_MINE = 2;

function Coord(row, col)
{
    this.row = parseInt(row);
    this.col = parseInt(col);

    this.plus = function(coord)
    {
        return new Coord(this.row + coord.row, this.col + coord.col);
    }
}

if (!isNaN(size))
    size = new Coord(size, size);

// setup board
var board = new Uint8Array(size.row * size.col);
board.fill(TILE_EMPTY_UNREVEALED);

var minePercent = 0.15; //random number * ?
var mineCount = Math.trunc(minePercent * board.length);

for (var i = 0; i < mineCount; ++i)
{
    var r = Math.trunc(Math.random() * Math.floor(size.row));
    var c = Math.trunc(Math.random() * Math.floor(size.col));
    board[r * size.col + c] = TILE_MINE;
}
var tilesRemaining = size.row * size.col - mineCount;
debug && console.log("mines", mineCount, "blank", tilesRemaining);

var Get$Tile = function(coord)
{
    var i = coord.row * size.col + coord.col;
    return $board.children[i + Math.trunc(i / size.row)];
};

var EndGame = function(didWin)
{
    for (var i = 0; i < board.length; ++i)
    {
        var tile = board[i];
        var $tile = $board.children[i + Math.trunc(i / size.row)];
        switch (tile)
        {
        case TILE_MINE:
            $tile.classList.add('mine', didWin ? 'win' : 'fail');
            break;
        case TILE_EMPTY_UNREVEALED:
            board[i] = TILE_EMPTY_REVEALED;
            $tile.classList.add('known');
        }
    }
}


const dirs = [new Coord(-1, -1), new Coord(0, -1), new Coord(1, -1),
new Coord(-1, 0),                    new Coord(1, 0),
new Coord(-1, 1),  new Coord(0, 1),  new Coord(1, 1)];

var Fill = function(start)
{
    var queue = [start];
    while (queue.length > 0)
    {
        var front = queue.shift();
        if (board[front.row * size.col + front.col] != TILE_EMPTY_UNREVEALED)
            continue;

        var nearby = 0;
        for (var dir in dirs)
        {
            var spot = front.plus(dirs[dir]);
            if (spot.row < 0 || spot.row >= size.row ||
                spot.col < 0 || spot.col >= size.col)
                continue;

            if (board[spot.row * size.col + spot.col] == TILE_MINE)
                ++nearby;
        }

        board[front.row * size.col + front.col] = TILE_EMPTY_REVEALED;
        var $tile = Get$Tile(front);
        $tile.classList.add('known');

        if (--tilesRemaining <= 0)
        {
            EndGame(true);
            return;
        }
        debug && console.log(tilesRemaining);

        if (nearby > 0)
            $tile.dataset.nearby = nearby;
        else
        {

            for (var dir in dirs)
            {
                var spot = front.plus(dirs[dir]);
                if (spot.row < 0 || spot.row >= size.row ||
                    spot.col < 0 || spot.col >= size.col)
                    continue;

                if (board[spot.row * size.col + spot.col] == TILE_EMPTY_UNREVEALED)
                    queue.push(spot);
            }
        }
    }
};

var Sweep = function(coord)
{
    var isFirst = (tilesRemaining == size.row * size.col - mineCount);
    switch (board[coord.row * size.col + coord.col])
    {
        case TILE_MINE:
        if (isFirst)
        {
            var r = Math.trunc(Math.random() * Math.floor(size.row));
            var c = Math.trunc(Math.random() * Math.floor(size.col));
            if (board[r * size.col + c] == TILE_MINE)
            {
                --mineCount;
                ++tilesRemaining;
            }
            else
                board[r * size.col + c] = TILE_MINE;
            board[coord.row * size.col + coord.col] = TILE_EMPTY_UNREVEALED;
            Fill(coord);
        }
        else
            EndGame(false);
        break;

        case TILE_EMPTY_UNREVEALED:
        Fill(coord);
        break;
    }
};

var $board = document.createDocumentFragment();
$board = $board.appendChild(document.createElement('div'));
$board.id = 'minesweeper';
$board.addEventListener('contextmenu', function(ev)
{
   ev.preventDefault();
});

for (var r = 0; r < size.row; ++r)
{
    for (var c = 0; c < size.col; ++c)
    {
        var $tile = document.createElement('div');
        $tile.classList.add('tile');
        $tile.dataset.row = r;
        $tile.dataset.column = c;
        $tile.addEventListener('contextmenu', function(ev)
        {
            Get$Tile(new Coord(ev.target.dataset.row, ev.target.dataset.column)).classList.toggle('flag');
            ev.preventDefault();
        });
        $tile.addEventListener('click', function(ev)
        {
            Sweep(new Coord(ev.target.dataset.row, ev.target.dataset.column));
            ev.preventDefault();
        });
        $board.appendChild($tile);

        if (debug && board[r * size.col + c] == TILE_MINE)
            $tile.classList.add('mine-debug');
    }
    $board.appendChild(document.createElement('br'));
}

var $dom = document.getElementById('minesweeper');
if ($dom)
    $dom.replaceWith($board);
else
    document.body.appendChild($board);
}