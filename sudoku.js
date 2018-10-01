let sudoku = [];
let possibilities = [];
let guesses = [];
let gradient = ['#93ec8e', '#8eebab', '#8febcd', '#90e6ea', '#91c5ea', '#92a5e9','#9f92e9','#bf93e8','#de94e8','#e795d3','#e796b5','#e79798'];
let currentInsecurity = 0;
let insecurity = [];
let backtrack=false;
let autostep=false;
let autosteptime=200;

loadSudoku(1);
initialize();


$('.init').click(function () {
    checkAllPossibilities();
})

$('.step').click(function () {
    step();
})

$('.autostep').click(function () {
    if(autostep) autostep=false;
    else{
        autostep=true;
        autoloop();
    }
})

$('.faster').click(function () {
    autosteptime*=0.7;
})

$('.slower').click(function () {
    autosteptime/=0.7;
})

function autoloop() {
    step();
    if(autostep) setTimeout(autoloop, autosteptime);
}

function step() {
    if(backtrack){
        $('.sudoku-cell-warning').removeClass('sudoku-cell-warning');
        for(let i=0;i<insecurity.length;i++){
            if(insecurity[i]==currentInsecurity){
                sudoku[i]=0;
                $('.sudoku-cell-'+i).empty();
                let $possibilities = $(document.createElement('div'));
                    $possibilities.attr('class', 'sudoku-cell-possibilities');
                    $('.sudoku-cell-'+i).append($possibilities)
                $('.sudoku-cell-'+i).css('background-color','');
                
            }
        }
        currentInsecurity--;
        checkAllPossibilities();
        backtrack=false;
        return;
    }
    let cell = checkForTrivial();
    if (cell != null) {
        let value = null;
        for (let i = 1; i < possibilities[cell].length; i++) {
            if (possibilities[cell][i]) value = i;
        }
        solveCell(cell, value, false)
        return;
    }
    cell = getBestCell();
    console.log(cell)
    if(cell==null){
        autostep=false;
        return;
    }
    for (let i = 1; i < possibilities[cell].length; i++) {
        if (possibilities[cell][i]&&!guesses[cell][i]) {
            solveCell(cell, i, true);
            guesses[cell][i]=true;
            return;
        }
    }
    // only happens if all guesses are used up
    backtrack=true;
    guesses[cell]=[false,false,false,false,false,false,false,false,false,false];
}

function getBestCell() {
    let min = 9;
    let minIndex = null;
    for (let i = 0; i < possibilities.length; i++) {
        if (sudoku[i] == 0) {
            let count = 0;
            for (let j = 1; j < possibilities[i].length; j++) {
                if (possibilities[i][j]&&!guesses[i][j]) count++;
            }
            if (count < min) {
                min = count;
                minIndex = i;
            }
        }
    }
    return minIndex;
}

function solveCell(index, value, insecure) {
    if (insecure) {
        currentInsecurity++;
        guesses[index][value] = true;
    }
    console.log(value)
    $('.sudoku-cell-' + index).html(value);
    $('.sudoku-cell-' + index).css('background-color', gradient[currentInsecurity]);
    $('.sudoku-cell-current').removeClass('sudoku-cell-current');
    $('.sudoku-cell-' + index).addClass('sudoku-cell-current');

    if (insecure) {
        checkPossibilities(index);
        
    }
    if(currentInsecurity>0) $('.sudoku-cell-' + index).append('<div class="sudoku-cell-insecurity">' + romanize(currentInsecurity) + '</div>');
    sudoku[index] = value;
    insecurity[index]=currentInsecurity;
    applyInfluence(index, value);
}

function romanize(num) {
    if (isNaN(num))
        return NaN;
    var digits = String(+num).split(""),
        key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

function highlight(index) {
    $('.sudoku-cell-' + index).css('background-color', gradient[currentInsecurity]);
}

function checkForTrivial() {
    for (let i = 0; i < sudoku.length; i++) {
        if (sudoku[i] == 0) {
            let count = 0;
            for (let j = 1; j < possibilities[i].length; j++) {
                if (possibilities[i][j]) count++;
            }
            if (count == 1) {
                return i;
            }
        }
    }
    return null;
}

function initialize() {
    for (let i = 0; i < sudoku.length; i++) {
        possibilities[i] = [];
        guesses[i] = [];
        insecurity[i] = 0;
        for (let j = 0; j < 9; j++) guesses[i][j] = false;
    }
}

function applyInfluence(index, value) {
    for (let i = 0; i < 9; i++) {
        possibilities[Math.floor(index / 9) * 9 + i][value] = false;
    }
    for (let i = 0; i < 9; i++) {
        possibilities[Math.floor(i * 9 + index % 9)][value] = false;

    }
    let blockX = Math.floor(index % 9 / 3);
    let blockY = Math.floor(Math.floor(index / 9) / 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            possibilities[blockX * 3 + blockY * 27 + i + j * 9][value] = false;
        }
    }
    updatePossibilitiesInView();
}

function checkPossibilities(index) {
    if (sudoku[index] == 0) {
        possibilities[index] = getCellPossibilities(index);
        for (let j = 1; j < possibilities[index].length; j++) {
            if (possibilities[index][j]) {
                if(guesses[index][j]){
                    $('.sudoku-cell-' + index).find('.sudoku-cell-possibilities').append('<div class="sudoku-cell-possibility red-text">' + j + '</div>');
                }else{
                    $('.sudoku-cell-' + index).find('.sudoku-cell-possibilities').append('<div class="sudoku-cell-possibility">' + j + '</div>');
                }
            }
        }
    }
}

function updatePossibilitiesInView() {
    for (let i = 0; i < sudoku.length; i++) {
        if (sudoku[i] == 0) {
            $('.sudoku-cell-' + i).find('.sudoku-cell-possibilities').empty();
            let once=false;
            for (let j = 1; j < possibilities[i].length; j++) {
                if (possibilities[i][j]) {
                    $('.sudoku-cell-' + i).find('.sudoku-cell-possibilities').append('<div class="sudoku-cell-possibility">' + j + '</div>');
                    once=true;
                }
            }
            if(!once){
                $('.sudoku-cell-' + i).addClass('sudoku-cell-warning');
                backtrack=true;
            }
        }
    }
}

function checkAllPossibilities() {
    for (let i = 0; i < sudoku.length; i++) {
        if (sudoku[i] == 0) {
            possibilities[i] = getCellPossibilities(i);
            $('.sudoku-cell-' + i).find('.sudoku-cell-possibilities').empty();
            for (let j = 1; j < possibilities[i].length; j++) {
                if (possibilities[i][j]) {
                    $('.sudoku-cell-' + i).find('.sudoku-cell-possibilities').append('<div class="sudoku-cell-possibility">' + j + '</div>');
                }
            }
        }
    }
}

function loadSudoku(index) {
    sudoku = [];
    let sudokus = data.split(';');
    let sudokuSet = sudokus[index];
    let sudokuString = sudokuSet.split(',')[0];
    let sudokuCharArr = sudokuString.split('');
    for (let i = 0; i < sudokuCharArr.length; i++) {
        sudoku.push(parseInt(sudokuCharArr[i]))
    }
    loadSudokuIntoView();
}

function loadSudokuIntoView() {
    let $area = $('.sudoku-area');
    $area.empty();
    for (let i = 0; i < 3; i++) {
        let $tr = $(document.createElement('tr'));
        $area.append($tr)
        for (let j = 0; j < 3; j++) {
            let $block = $(document.createElement('td'));
            $tr.append($block);
            let $blockGrid = $(document.createElement('table'));
            $block.append($blockGrid);
            for (let k = 0; k < 3; k++) {
                let $blocktr = $(document.createElement('tr'));
                $blockGrid.append($blocktr);
                for (let l = 0; l < 3; l++) {
                    let $blockCell = $(document.createElement('td'));
                    $blockCell.attr('class', 'sudoku-cell sudoku-cell-' + (l + 3 * j + 9 * k + 27 * i));
                    $blocktr.append($blockCell);
                    $blockCell.html(sudoku[l + 3 * j + 9 * k + 27 * i] == 0 ? '' : sudoku[l + 3 * j + 9 * k + 27 * i])
                    let $possibilities = $(document.createElement('div'));
                    $possibilities.attr('class', 'sudoku-cell-possibilities');
                    $blockCell.append($possibilities)
                }
            }
        }
    }
}

function getCellPossibilities(index) {
    let res = [];
    for (let i = 0; i < 10; i++) res[i] = true;
    getRowNumbers(index, res);
    getColumnNumbers(index, res);
    getBlockNumbers(index, res);
    return res;
}

function getRowNumbers(index, res) {
    let row = Math.floor(index / 9);
    for (let i = 0; i < 9; i++) {
        res[sudoku[row * 9 + i]] = false;
    }
}

function getColumnNumbers(index, res) {
    let col = index % 9;
    for (let i = 0; i < 9; i++) {
        res[sudoku[col + i * 9]] = false;
    }
}

function getBlockNumbers(index, res) {
    let blockX = Math.floor(index % 9 / 3);
    let blockY = Math.floor(Math.floor(index / 9) / 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            res[sudoku[blockX * 3 + blockY * 27 + i + j * 9]] = false;
        }
    }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}