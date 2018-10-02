let sudoku = [];
let possibilities = [];
let guesses = [];
let gradient = ['#A7ECBB','#A7ECAD', '#B2ECA8', '#C2ECA9', '#D2EDAA', '#E2EDAB','#EDE9AB', '#EDDBAC', '#EECCAD', '#EEBEAE', '#EEB1AF', '#EEB0BC', '#EFB1CB', '#EFB1DA','#EFB2E8','#E9B3EF','#DCB4F0','#CFB5F0','#C2B6F0','#B6B8F0'];
let currentInsecurity = 0;
let insecurity = [];
let backtrack = false;
let autostep = false;
let autosteptime = 200;
let steps=0;

loadSudoku(1);
initialize();

$('.load').click(function () {
    autostep = false;
    loadSudoku(Math.floor(Math.random() * 5));
    initialize();
    backtrack=false;
    currentInsecurity=0;
    setState(1);
})

$('.init').click(function () {
    checkAllPossibilities();
    setState(2);
    autostep=false;
})

$('.step').click(function () {
    step();
})

$('.autostep').click(function () {
    if (autostep) {
        autostep = false;
        setState(2)
    } else {
        autostep = true;
        setState(3)
        autoloop();
    }
})

$('.faster').click(function () {
    autosteptime *= 0.7;
    if(autosteptime<20){
        console.log('minimum step time reached')
        autosteptime=16.47086;
    }else console.log('step time:'+autosteptime)
})

$('.slower').click(function () {
    autosteptime /= 0.7;
    console.log('step time:'+autosteptime)
})

function autoloop() {
    step();
    if(autosteptime>20){
        if (autostep) setTimeout(function(){
            if(autostep) autoloop()
        }, autosteptime);
    }else{
        if (autostep) requestAnimationFrame(function(){
            if(autostep) autoloop()
        });
    }
    
}

function setState(i) {
    switch (i) {
        case 0:
            $('.sudoku-button-ready').removeClass('sudoku-button-ready');
            $('.sudoku-button-done').removeClass('sudoku-button-done');
            $('.activated').removeClass('activated');
            $('.load').attr('class', 'sudoku-button load sudoku-button-ready');
            break;
        case 1:
            $('.sudoku-button-ready').removeClass('sudoku-button-ready');
            $('.sudoku-button-done').removeClass('sudoku-button-done');
            $('.activated').removeClass('activated');
            $('.load').attr('class', 'sudoku-button load sudoku-button-done');
            $('.init').attr('class', 'sudoku-button init sudoku-button-ready');
            break;
        case 2:
            $('.sudoku-button-ready').removeClass('sudoku-button-ready');
            $('.sudoku-button-done').removeClass('sudoku-button-done');
            $('.activated').removeClass('activated');
            $('.load').addClass('sudoku-button-done');
            $('.init').addClass('sudoku-button-done');
            $('.step').addClass('sudoku-button-ready');
            $('.autostep').addClass('sudoku-button-ready');
            break;
        case 3:
            $('.sudoku-button-ready').removeClass('sudoku-button-ready');
            $('.sudoku-button-done').removeClass('sudoku-button-done');
            $('.activated').removeClass('activated');
            $('.load').addClass('sudoku-button-done');
            $('.init').addClass('sudoku-button-done');
            $('.step').addClass('sudoku-button-ready');
            $('.faster').addClass('sudoku-button-ready');
            $('.slower').addClass('sudoku-button-ready');
            $('.autostep').addClass('sudoku-button-done');
            $('.autostep-controls').addClass('activated');
            break;
    }
}

function step() {
    steps++;
    $('.steps').html(steps);
    if (backtrack) {
        $('.sudoku-cell-warning').removeClass('sudoku-cell-warning');
        for (let i = 0; i < insecurity.length; i++) {
            if (insecurity[i] == currentInsecurity) {
                sudoku[i] = 0;
                $('.sudoku-cell-' + i).empty();
                let $possibilities = $(document.createElement('div'));
                $possibilities.attr('class', 'sudoku-cell-possibilities');
                $('.sudoku-cell-' + i).append($possibilities)
                $('.sudoku-cell-' + i).css('background-color', '');

            }
        }
        currentInsecurity--;
        checkAllPossibilities();
        backtrack = false;
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
    if (cell == null) {
        autostep = false;
        return;
    }
    for (let i = 1; i < possibilities[cell].length; i++) {
        if (possibilities[cell][i] && !guesses[cell][i]) {
            solveCell(cell, i, true);
            guesses[cell][i] = true;
            return;
        }
    }
    // only happens if all guesses are used up
    backtrack = true;
    guesses[cell] = [false, false, false, false, false, false, false, false, false, false];
}

function getBestCell() {
    let min = 9;
    let minIndex = null;
    for (let i = 0; i < possibilities.length; i++) {
        if (sudoku[i] == 0) {
            let count = 0;
            for (let j = 1; j < possibilities[i].length; j++) {
                if (possibilities[i][j] && !guesses[i][j]) count++;
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
    $('.sudoku-cell-' + index).html(value);
    $('.sudoku-cell-' + index).css('background-color', gradient[currentInsecurity]);
    $('.sudoku-cell-current').removeClass('sudoku-cell-current');
    $('.sudoku-cell-' + index).addClass('sudoku-cell-current');

    if (insecure) {
        checkPossibilities(index);

    }
    if (currentInsecurity > 0) $('.sudoku-cell-' + index).append('<div class="sudoku-cell-insecurity">' + romanize(currentInsecurity) + '</div>');
    sudoku[index] = value;
    insecurity[index] = currentInsecurity;
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
    steps=0;
    for (let i = 0; i < sudoku.length; i++) {
        possibilities[i] = [];
        guesses[i] = [];
        insecurity[i] = 0;
        for (let j = 0; j < 10; j++){
            guesses[i][j] = false;
            possibilities[i][j]=false;
        }
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
                if (guesses[index][j]) {
                    $('.sudoku-cell-' + index).find('.sudoku-cell-possibilities').append('<div class="sudoku-cell-possibility red-text">' + j + '</div>');
                } else {
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
            let once = false;
            for (let j = 1; j < possibilities[i].length; j++) {
                if (possibilities[i][j]) {
                    $('.sudoku-cell-' + i).find('.sudoku-cell-possibilities').append('<div class="sudoku-cell-possibility">' + j + '</div>');
                    once = true;
                }
            }
            if (!once) {
                $('.sudoku-cell-' + i).addClass('sudoku-cell-warning');
                backtrack = true;
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