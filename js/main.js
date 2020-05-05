var eleMain = $(".player");
var eleGame = $(".game");
var eleForm = $(".form");
var eleScore = $("#score");
var eleFuel = $("#fuel");
var eleTime = $("#time");
var game = {
    W: 960,
    H: 600,
    fuel: 15,
    maxFuel: 30,
    score: 0,
    time: 0,
    volume: 1,
    name: '',
    status: true
};

var dir = {
    left: false,
    right: false,
    top: false,
    bottom: false
};
$(".start-btn").on("click", function() {
    $(".player, .game, .planet-box > img").css('animation-play-state', 'running');
    $(".inst").hide();
    $('.game').show();
    init();
});

function init() {

    function createEle(name, attr, css) {
        var ele = $(`<div class="${name}"></div>`).appendTo(eleGame);
        ele.css(css).attr(attr).css('animation-play-state', 'running').on("webkitAnimationEnd", function() {
            $(this).remove();
        })
    }

    function create() {
        /*create Enemy*/
        createEle('enemy', {
            fuel: -15,
            life: 1,
            score: 5
        }, {
            left: '100%',
            top: random(80, game.H - 80)
        })
        /*create Friend*/
        createEle('friend', {
            fuel: -15,
            life: 1,
            score: -10
        }, {
            left: '100%',
            top: random(80, game.H - 80)
        })

        /*create Aestroid*/
        createEle('aestroid', {
            fuel: -15,
            life: 2,
            score: 10
        }, {
            left: '100%',
            top: random(80, game.H - 80)
        });

        /*create Fuel*/
        createEle('fuel', {
            fuel: 15,
            life: 1,
            score: 0
        }, {
            top: 0,
            left: random(80, game.W / 2 + 100)
        })

    }

    function createEnemyBullet() {
        $(".enemy").each(function() {
            var left = $(this).position().left;
            var top = $(this).position().top;
            createEle('enemy-bullet', {
                fuel: -15,
                life: 1,
                score: 0
            }, {
                left: left - 40,
                top: top + 40
            })
        })
    }

    function createMineBullet() {
        var left = parseInt(eleMain.css('left'));
        var top = parseInt(eleMain.css('top'));
        createEle('mine-bullet', {}, {
            left: left + 100,
            top: top + 20
        })
    }

    /*timer create element*/
    timerCreateEle();

    function timerCreateEle() {
        setInterval(function() {
            if (game.status) {
                create();
                createEnemyBullet();
            }
        }, 3000)
    }

    $(document).on("keydown", function(e) {
        switch (e.keyCode) {
            case 37:
                dir.left = true;
                break;
            case 39:
                dir.right = true;
                break;
            case 38:
                dir.top = true;
                break;
            case 40:
                dir.bottom = true;
                break;
            case 32:
                if (game.status) {
                    createMineBullet();
                    createAudio('shoot.mp3', game.volume, '');
                }
                break;
            case 80:
                $(".play").click();
                break;
        }
    })

    $(document).on("keyup", function(e) {
        switch (e.keyCode) {
            case 37:
                dir.left = false;
                break;
            case 39:
                dir.right = false;
                break;
            case 38:
                dir.top = false;
                break;
            case 40:
                dir.bottom = false;
                break;
        }
    })
    eleMove();

    function eleMove() {
        if (game.status) {
            var left = parseInt(eleMain.css('left'));
            var top = parseInt(eleMain.css('top'));
            if (dir.left) {
                eleMain.css('left', left - 8);
            }
            if (dir.right) {
                eleMain.css('left', left + 8);
            }
            if (dir.top) {
                eleMain.css('top', top - 8);
            }
            if (dir.bottom) {
                eleMain.css('top', top + 8);
            }
            checkEleMain();
        }
        requestAnimationFrame(eleMove);
    }

    function checkEleMain() {
        var left = parseInt(eleMain.css('left'));
        var top = parseInt(eleMain.css('top'));
        if (left < 0) {
            eleMain.css('left', 0);
        }
        if (left > game.W - 100) {
            eleMain.css('left', game.W - 100);
        }
        if (top < 60) {
            eleMain.css('top', 60);
        }
        if (top > game.H - 40) {
            eleMain.css('top', game.H - 40);
        }
    }

    checkCollision();

    function checkCollision() {
        /*player collision*/
        $(".enemy, .friend, .fuel, .enemy-bullet,.aestroid").each(function() {
            if (collision(eleMain, $(this))) {
                game.fuel += parseInt($(this).attr('fuel'));
                game.score += parseInt($(this).attr('score'));
                if (game.fuel > game.maxFuel) {
                    game.fuel = game.maxFuel;
                }
                $(this).remove();
            }
        });
        /*mine-bullet collision*/
        $(".mine-bullet").each(function(i, bullet) {
            $(".enemy, .aestroid, .friend").each(function(index, item) {
                if (collision($(bullet), $(item))) {
                    var life = $(item).attr('life');
                    life--;
                    $(item).css('opacity', 0.5);
                    if (life <= 0) {
                        game.score += parseInt($(item).attr('score'));
                        $(item).remove();
                    }
                    createAudio('destroyed.mp3', game.volume, '');
                    $(item).attr('life', life);
                    $(bullet).remove();
                }
            })
        });
        changeHeaderData();
        requestAnimationFrame(checkCollision);
    }

    function changeHeaderData() {
        eleFuel.text(game.fuel);
        eleFuel.css('width', game.fuel * 5);
        eleScore.text(game.score);
        if (game.fuel < 0) {
            /*game over*/
            eleForm.show();
            eleGame.hide();
            mutedAudio();
        }
    }

    function createAudio(src, volume, loop) {
        $(`<audio src="sound/${src}" autoplay ${loop ? 'loop' : ''}></audio>`).appendTo(eleGame).on('ended', function() {
            $(this).remove();
        })[0].volume = volume;
    }

    function mutedAudio() {
        $('audio').each(function() {
            $(this)[0].volume = 0;
        })
        game.volume = 0;
    }

    function openAudio() {
        $('audio').each(function() {
            $(this)[0].volume = 1;
        });
        game.volume = 1;
    }

    createAudio('background.mp3', game.volume, 'loop');


    $(".play").on("click", function() {
        if (game.status) {
            $(this).attr('src', 'images/pause.png');
            $("[style*=animation]").css('animation-play-state', 'paused');
            mutedAudio();
        } else {
            $(this).attr('src', 'images/play.png');
            $("[style*=animation]").css('animation-play-state', 'running');
            openAudio();
        }
        game.status = !game.status;
    });

    $(".font-add").on('click', function() {
        if (game.status) {
            var font = parseInt(eleGame.css('font-size'));
            if (font <= 28) {
                eleGame.css('font-size', font + 1);
            }
        }
    });
    $(".font-reduce").on('click', function() {
        if (game.status) {
            var font = parseInt(eleGame.css('font-size'));
            if (font >= 10) {
                eleGame.css('font-size', font - 1);
            }
        }
    });
    $(".sound").on('click', function() {
        if (game.status) {
            if (game.volume == 1) {
                mutedAudio();
                $(this).attr('src', 'images/sound_off.png');
            } else {
                openAudio();
                $(this).attr('src', 'images/sound_on.png');
            }
        }
    });


    settingTimer();

    function settingTimer() {
        setInterval(function() {
            if (game.status) {
                timerCount();
                fuelCount();
            }

        }, 1000);
    }

    function timerCount() {
        game.time++;
        eleTime.text(game.time);
    }

    function fuelCount() {
        game.fuel--;
        eleFuel.text(game.fuel);
        eleFuel.css('width', game.fuel * 5);
    }

    $("#username").on('input', function() {
        game.name = $(this).val();
        game.name ? $('.continue').removeClass('disabled') : $('.continue').addClass('disabled');
    });

    $(".continue").on('click', function() {
        if (game.name) {
            var result = {
                name: game.name,
                score: game.score,
                time: game.time
            };
            $.post('./php/register.php', result, function(data) {
                var arr = JSON.parse(data);
                arr.sort(function(a, b) {
                    if (a.score == b.score) {
                        return b.time - a.time;
                    }
                    return b.score - a.score;
                });
                arr = arr.slice(0, 10);
                var su = 0;
                var html = "";
                arr.forEach(function(v, i) {
                    var n = parseInt(i) + 1;
                    if ((i > 0) && (arr[i].score == arr[i - 1].score && (arr[i].time == arr[i - 1].time))) {
                        html += `<tr><td>${su}</td><td>${v.name}</td><td>${v.score}</td><td>${v.time}</td></tr>`;
                    } else {
                        su = n;
                        html += `<tr><td>${su}</td><td>${v.name}</td><td>${v.score}</td><td>${v.time}</td></tr>`;
                    }
                });
                $(".rank table").append(html);
                $(".form").hide();
                $('.rank').show();
            })
        }
    });

    $(".btn-restart").on("click", function() {
        location.href = location.href;
    });

    function collision(a, b) {
        var L1 = a.position().left;
        var R1 = a.position().left + a.width();
        var T1 = a.position().top;
        var B1 = a.position().top + a.height();

        var L2 = b.position().left;
        var R2 = b.position().left + b.width();
        var T2 = b.position().top;
        var B2 = b.position().top + b.height();

        return !(L2 > R1 || R2 < L1 || T2 > B1 || B2 < T1);

    }


    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}