$(function () {
    let gemSize = 64
    let gemClass = 'gem'
    let gemIdPrefix = 'gem'
    let numRows = 6
    let numCols = 7
    let jewels = new Array()
    let selectedRow = -1
    let selectedCol = -1
    let posY
    let posX
    let movingItems = 0
    let total = 0

    const gameStates = {
        "pick": 'pick',
        "switch": 'switch',
        "revert": 'revert',
        "remove": 'remove',
        "refill": 'refill'
    }
    Object.freeze(gameStates)
    let gameState

    let bgColors = new Array(
        'magenta',
        'mediumblue',
        'yellow',
        'lime',
        // 'cyan',
        // 'orange',
        // 'crimson',
        // 'gray'
    )
    let icons = new Array(
        'url("img/1.svg")',
        'url("img/orange.svg")',
        'url("img/3.svg")',
        'url("img/blue.svg")',
        'url("img/violet.svg")'
    )
    $('body').css({
        'background-color': 'black',
        'margin': '0',
    }).append('<div id="gamefield"></div> <div id="marker"></div> <button id="button">play</button> <div id="total">total: 0</div> <div id="timer">time: 30s</div>')
    $('#gamefield').css({
        'width': gemSize * numCols + 'px',
        'height': gemSize * numRows + 'px',
        'position': 'relative',
    })
    $('#marker').css({
        'width': (gemSize - 10) + 'px',
        'height': (gemSize - 10) + 'px',
        'border': '4px solid white',
        'position': 'absolute'
    }).hide()
    $('#button').css({
        'text-transform': 'uppercase',
        'cursor': 'pointer',
        'display': 'inline-block',
        'font-size': '32px',
        'font-family': 'Bangers',
        'letter-spacing': '3px',
        'padding': '0',
        'border': 'none',
        'padding': '0 10px',
        'position': 'absolute',
        'top': '400px',
        'left': '4px'
    })
    $('#total').css({
        'display': 'inline-block',
        'color': '#fff',
        'text-transform': 'uppercase',
        'font-family': 'Bangers',
        'letter-spacing': '3px',
        'font-size': '32px',
        'position': 'absolute',
        'top': '400px',
        'left': '154px'
    })
    $('#timer').css({
        'display': 'inline-block',
        'color': '#fff',
        'text-transform': 'uppercase',
        'font-family': 'Bangers',
        'letter-spacing': '3px',
        'font-size': '32px',
        'position': 'absolute',
        'top': '400px',
        'left': '304px'
    })
    for (i = 0; i < numRows; i++) {
        jewels[i] = new Array()
        for (j = 0; j < numCols; j++) {
            jewels[i][j] = -1
        }
    }

    for (i = 0; i < numRows; i++) {
        for (j = 0; j < numCols; j++) {
            do {
                jewels[i][j] = Math.floor(Math.random() * icons.length)
            } while (isStreak(i, j));

            $('#gamefield').append('<div class="' + gemClass + '" id="' + gemIdPrefix + '_' + i + '_' + j + '"></div>')
            $('.' + gemClass).css({
                'position': 'absolute',
                'width': (gemSize - 10) + 'px',
                'height': (gemSize - 10) + 'px',
            })
            $('#' + gemIdPrefix + '_' + i + '_' + j).css({
                'top': gemSize * i + 4 + 'px',
                'left': gemSize * j + 4 + 'px',
                'background-image': icons[jewels[i][j]]
            })
        }
    }


    $('#button').swipe({
        tap: function () {
            if ($(this).text() == 'restart') {
                selectedRow = -1
                total = 0
                for (i = 0; i < numRows; i++) {
                    for (j = 0; j < numCols; j++) {
                        $('#' + gemIdPrefix + '_' + i + '_' + j).remove()
                        jewels[i][j] = -1
                    }
                }
                
                for (i = 0; i < numRows; i++) {
                    for (j = 0; j < numCols; j++) {
                        do {
                            jewels[i][j] = Math.floor(Math.random() * icons.length)
                        } while (isStreak(i, j));

                        $('#gamefield').append('<div class="' + gemClass + '" id="' + gemIdPrefix + '_' + i + '_' + j + '"></div>')
                        $('.' + gemClass).css({
                            'position': 'absolute',
                            'width': (gemSize - 10) + 'px',
                            'height': (gemSize - 10) + 'px',
                        })
                        $('#' + gemIdPrefix + '_' + i + '_' + j).css({
                            'top': gemSize * i + 4 + 'px',
                            'left': gemSize * j + 4 + 'px',
                            'background-image': icons[jewels[i][j]]
                        })
                    }
                }
                $('#total').text('total: 0')
            }

            gameState = gameStates.pick
            $('.' + gemClass).css({
                'cursor': 'pointer'
            })
            $(this).animate({
                width: 0,
                opacity: 0,
                padding: 0,
            }, {
                    duration: 500,
                    complete: function () {
                        $(this).hide()
                    }
            })
            setTimeout(function () {
                gameState = null
                $('.' + gemClass).css({
                    'cursor': 'auto'
                })
                $('#button').show().animate({
                    width: 130,
                    opacity: 1,
                    paddingLeft: 10,
                    paddingRight: 10,
                }, {
                    duration: 500
                }).text('restart')

            }, 30000)
        }
    })

    $('#gamefield').swipe({
        tap: tapHandler
    })
    function tapHandler(event, target) {
        if ($(target).hasClass('gem')) {
            if (gameState == gameStates.pick) {
                let row = parseInt($(target).attr('id').split('_')[1])
                let col = parseInt($(target).attr('id').split('_')[2])
                
                $('#marker').css({
                    'top': gemSize * row + 'px', 
                    'left': gemSize * col + 'px' 
                }).show()

                if (selectedRow == -1) {
                    selectedRow = row
                    selectedCol = col
                }
                else {
                    if ((Math.abs(selectedRow - row) == 1 && selectedCol == col) ||
                        (Math.abs(selectedCol - col) == 1 && selectedRow == row)) {
                        $('#marker').hide()
                        gameState = gameStates.switch
                        posY = row
                        posX = col
                        gemSwitch()
                        
                    }
                    else {
                        selectedRow = row
                        selectedCol = col
                    }
                }
            }
        }
    }

    function isVerticalStreak(row, col) {
        let gemValue = jewels[row][col]
        
        let streak = 0
        let tmp = row

        while (tmp > 0 && jewels[tmp - 1][col] == gemValue) {
            
            streak++
            tmp--
        }

        tmp = row

        while (tmp < numRows - 1 && jewels[tmp + 1][col] == gemValue) {
            streak++
            tmp++
        }
        return streak > 1
    }

    function isHorizontalStreak(row, col) {
        let gemValue = jewels[row][col]
        let streak = 0
        let tmp = col

        while (tmp > 0 && jewels[row][tmp - 1] == gemValue) {
            streak++
            tmp--
        }

        tmp = col

        while (tmp < numCols - 1 && jewels[row][tmp + 1] == gemValue) {
            streak++
            tmp++
        }
        return streak > 1
    }

    function isStreak(row, col) {
        return isVerticalStreak(row, col) || isHorizontalStreak(row, col)
    }

    function gemSwitch() {
        let yOffSet = selectedRow - posY
        let xOffSet = selectedCol - posX

        $('#' + gemIdPrefix + '_' + selectedRow + '_' + selectedCol)
            .addClass('switch').attr('data-value', '-1')
        $('#' + gemIdPrefix + '_' + posY + '_' + posX)
            .addClass('switch').attr('data-value', '1')
        
        $('.switch').each(function () {
            movingItems++
            $(this).animate({
                top: '+=' + gemSize * yOffSet * parseInt($(this).attr('data-value')),
                left: '+=' + gemSize * xOffSet * parseInt($(this).attr('data-value'))
            }, {
                    duration: 500,
                    complete: function () {
                        $(this).removeClass('switch')
                        checkMoving()
                }
            })
        })
        $('#' + gemIdPrefix + '_' + selectedRow + '_' + selectedCol)
            .attr('id', 'temp')
        $('#' + gemIdPrefix + '_' + posY + '_' + posX)
            .attr('id', gemIdPrefix + '_' + selectedRow + '_' + selectedCol)
        $('#temp')
            .attr('id', gemIdPrefix + '_' + posY + '_' + posX)
        
        let temp = jewels[selectedRow][selectedCol]
        jewels[selectedRow][selectedCol] = jewels[posY][posX]
        jewels[posY][posX] = temp
    }

    function checkMoving() {
        movingItems--
        if (!movingItems) {
            switch (gameState) {
                case gameStates.switch:
                    if (!isStreak(selectedRow, selectedCol) && !isStreak(posY, posX)) {
                            gameState = gameStates.revert
                            gemSwitch()
                    }
                    else {
                        gameState = gameStates.remove
                        if (isStreak(selectedRow, selectedCol)) {
                            removeGems(selectedRow, selectedCol)
                        }
                        if (isStreak(posY, posX)) {
                            removeGems(posY, posX)
                        }
                        gemFade()
                    }
                    break
                case gameStates.revert:
                    selectedRow = -1
                    gameState = gameStates.pick
                    break
                case gameStates.remove:
                    checkFalling()
                    break
                case gameState = gameStates.refill:
                    placeNewGems()
                    break
            }
        }
    }

    function removeGems(row, col) {
        let gemValue = jewels[row][col]
        $('#' + gemIdPrefix + '_' + row + '_' + col).addClass('remove')
        let tmp = row

        if (isVerticalStreak(row, col)) {
            while (tmp > 0 && jewels[tmp - 1][col] == gemValue) {
                $('#' + gemIdPrefix + '_' + (tmp - 1) + '_' + col).addClass('remove')
                jewels[tmp - 1][col] = -1
                tmp--
            }
            tmp = row
            while (tmp < numRows - 1 && jewels[tmp + 1][col] == gemValue) {
                $('#' + gemIdPrefix + '_' + (tmp + 1) + '_' + col).addClass('remove')
                jewels[tmp + 1][col] = -1
                tmp++
            }
        }

        tmp = col

        if (isHorizontalStreak(row, col)) {
            while (tmp > 0 && jewels[row][tmp -1] == gemValue) {
                $('#' + gemIdPrefix + '_' + row + '_' + (tmp - 1)).addClass('remove')
                jewels[row][tmp - 1] = -1
                tmp--
            }
            tmp = col
            while (tmp < numCols - 1 && jewels[row][tmp + 1] == gemValue) {
                $('#' + gemIdPrefix + '_' + row + '_' + (tmp + 1)).addClass('remove')
                jewels[row][tmp + 1] = -1
                tmp++
            }
        }
        jewels[row][col] = -1
    }

    function gemFade() {
        $('.remove').each(function () {
            movingItems++
            $(this).animate({
                opacity: 0
            }, {
                    duration: 500,
                    complete: function () {
                        $(this).remove()
                        checkMoving()
                    }
            })
        })
        total += movingItems
        
        $('#total').text('total: ' + total)
    }

    function checkFalling() {
        let fellDown = 0
        for (i = numRows - 1; i > 0; i--) {
            for (j = 0; j < numCols; j++) {
                if (jewels[i][j] == -1 && jewels[i - 1][j] >= 0) {
                    $('#' + gemIdPrefix + '_' + (i - 1) + '_' + j)
                        .addClass('fall').attr('id', gemIdPrefix + '_' + i + '_' + j)
                    jewels[i][j] = jewels[i - 1][j]
                    jewels[i - 1][j] = -1
                    fellDown++
                }
                
            }
        }
        
        $('.fall').each(function () {
            movingItems++
            $(this).animate({
                top: '+=' + gemSize
            }, {
                    duration: 500,
                    complete: function () {
                        $(this).removeClass('fall')
                        checkMoving()
                    }
            })
        })
        if (!fellDown) {
            movingItems = 1
            gameState = gameStates.refill
            checkMoving()
        }
    }
    
    function placeNewGems() {
        let gemPlaced = 0
        for (j = 0; j < numCols; j++) {
            if (jewels[0][j] == -1) {
                jewels[0][j] = Math.floor(Math.random() * icons.length)
                $('#gamefield').append('<div class="' + gemClass + '" id="' + gemIdPrefix + '_' + 0 + '_' + j + '"></div>')
                $('.' + gemClass).css({
                    'position': 'absolute',
                    'cursor': 'pointer',
                    'width': (gemSize - 10) + 'px',
                    'height': (gemSize - 10) + 'px',
                })
                $('#' + gemIdPrefix + '_' + 0 + '_' + j).css({
                    'top': 4 + 'px',
                    'left': gemSize * j + 4 + 'px',
                    'background-image': icons[jewels[0][j]]
                })
                gemPlaced++
            }
        }
        if (gemPlaced) {
            gameState = gameStates.remove
            checkFalling()
        }
        else {
            let combo = 0
            for (i = 0; i < numRows; i++) {
                for (j = 0; j < numCols; j++) {
                    if (isVerticalStreak(i, j)) {
                        removeGems(i, j)
                        combo++
                    }
                    if (isHorizontalStreak(i, j)) {
                        removeGems(i, j)
                        combo++
                    }
                    
                }
            }
            if (combo) {
                gameState = gameStates.remove
                gemFade()
            }
            else {
                selectedRow = -1
                gameState = gameStates.pick
            }
        }
    }
})




