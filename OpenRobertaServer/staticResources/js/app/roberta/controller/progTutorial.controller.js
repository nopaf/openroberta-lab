define(["require", "exports", "message", "log", "guiState.controller", "program.controller", "robot.controller", "import.controller", "blockly", "util", "jquery"], function (require, exports, MSG, LOG, GUISTATE_C, PROG_C, ROBOT_C, IMPORT_C, Blockly, U, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadFromTutorial = exports.init = void 0;
    var INITIAL_WIDTH = 0.5;
    var blocklyWorkspace;
    var tutorialList;
    var tutorialId;
    var tutorial;
    var step = 0;
    var maxSteps = 0;
    var credits = [];
    var maxCredits = [];
    var quiz = false;
    function init() {
        tutorialList = GUISTATE_C.getListOfTutorials();
        blocklyWorkspace = GUISTATE_C.getBlocklyWorkspace();
        initEvents();
    }
    exports.init = init;
    function initEvents() {
        $('.menu.tutorial').onWrap('click', function (event) {
            startTutorial(event.target.id);
        });
        $('#tutorialButton').onWrap('click touchend', function () {
            toggleTutorial();
            return false;
        });
    }
    function loadFromTutorial(tutId) {
        // initialize this tutorial
        tutorialId = tutId;
        tutorial = tutorialList && tutorialList[tutId];
        if (tutorial) {
            ROBOT_C.switchRobot(tutorial.robot, null, startTutorial);
        }
        function startTutorial() {
            $('#tabProgram').clickWrap();
            if (GUISTATE_C.isKioskMode()) {
                $('#infoButton').hide();
                $('#feedbackButton').hide();
                // for beginner tutorials the code view is more confusing than helpful, so we don't show the button in kiosk mode
                if (tutorial.level.indexOf('1') === 0) {
                    $('#codeButton').hide();
                }
                U.removeLinks($('#legalDiv a'));
            }
            if (tutorial.initXML) {
                IMPORT_C.loadProgramFromXML('egal', tutorial.initXML);
            }
            maxSteps = tutorial.step.length;
            step = 0;
            credits = [];
            maxCredits = [];
            quiz = false;
            for (var i = 0; i < tutorial.step.length; i++) {
                if (tutorial.step[i].quiz) {
                    quiz = true;
                    break;
                }
            }
            $('#tutorial-list').empty();
            // create this tutorial navigation
            for (var i = 0; i < tutorial.step.length; i++) {
                $('#tutorial-list').append($('<li>')
                    .attr('class', 'step')
                    .append($('<a>')
                    .attr({
                    href: '#',
                })
                    .append(i + 1)));
            }
            $('#tutorial-list li:last-child').addClass('last');
            $('#tutorial-header').html(tutorial.name);
            // prepare the view
            $('#tutorial-navigation').fadeIn(750);
            $('#head-navigation').fadeOut(750);
            $('#tutorial-list :first-child').addClass('active');
            $('#tutorialButton').show();
            $('.blocklyToolboxDiv>.levelTabs').addClass('invisible');
            initStepEvents();
            createInstruction();
            openTutorialView();
            showOverview();
        }
    }
    exports.loadFromTutorial = loadFromTutorial;
    function initStepEvents() {
        $('#tutorial-list.nav li.step a').on('click', function () {
            Blockly.hideChaff();
            step = $(this).text() - 2;
            nextStep();
            openTutorialView();
        });
        $('#tutorialEnd').oneWrap('click', function () {
            exitTutorial();
        });
    }
    function showOverview() {
        if (!tutorial.overview)
            return;
        var html = tutorial.overview.description;
        html += '</br></br><b>Lernziel: </b>';
        html += tutorial.overview.goal;
        html += '</br></br><b>Vorkenntnisse: </b>';
        html += tutorial.overview.previous;
        html += '<hr style="border: 2px solid #33B8CA; margin: 10px 0">';
        html += '<span class="typcn typcn-stopwatch"/>&emsp;&emsp;';
        html += tutorial.time;
        html += '</br><span class="typcn typcn-group"/>&emsp;&emsp;';
        html += tutorial.age;
        html += '</br><span class="typcn typcn-simulation"/>&emsp;&emsp;';
        html += tutorial.sim && (tutorial.sim === 'sim' || tutorial.sim === 1) ? 'ja' : 'nein';
        if (tutorial.level) {
            html += '</br><span class="typcn typcn-mortar-board"/>&emsp;&emsp;';
            var maxLevel = isNaN(tutorial.level) ? tutorial.level.split('/')[1] : 3;
            var thisLevel = isNaN(tutorial.level) ? tutorial.level.split('/')[0] : tutorial.level;
            for (var i = 1; i <= maxLevel; i++) {
                if (i <= thisLevel) {
                    html += '<span class="typcn typcn-star-full-outline"/>';
                }
                else {
                    html += '<span class="typcn typcn-star-outline"/>';
                }
            }
        }
        html += '</br><span class="typcn typcn-roberta"/>&emsp;&emsp;';
        html += GUISTATE_C.getMenuRobotRealName(tutorial.robot);
        $('#tutorialOverviewText').html(html);
        $('#tutorialOverviewTitle').html(tutorial.name);
        if (GUISTATE_C.isKioskMode()) {
            U.removeLinks($('#tutorialOverview a'));
        }
        $('#tutorialAbort').off('click.dismiss.bs.modal');
        $('#tutorialAbort').onWrap('click.dismiss.bs.modal', function (event) {
            exitTutorial();
        }, 'tutorial exit');
        $('#tutorialContinue').off('click.dismiss.bs.modal');
        $('#tutorialContinue').onWrap('click.dismiss.bs.modal', function (event) {
            LOG.info('tutorial executed ' + tutorial.index + tutorialId);
        }, 'tuorial continue');
        $('#tutorialOverview').modal({
            backdrop: 'static',
            keyboard: false,
            show: true,
        }, 'tutorial overview');
    }
    function createInstruction() {
        if (tutorial.step[step]) {
            $('#tutorialContent').empty();
            if (tutorial.step[step].instruction) {
                if (tutorial.step[step].toolbox) {
                    try {
                        PROG_C.loadExternalToolbox(tutorial.step[step].toolbox);
                        Blockly.mainWorkspace.options.maxBlocks = tutorial.step[step].maxBlocks;
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                if (tutorial.step[step].header) {
                    $('#tutorialContent').append($('<h3>').attr('class', 'quiz header').append(tutorial.step[step].header));
                }
                $('#tutorialContent').append(tutorial.step[step].instruction);
                if (tutorial.step[step].tip) {
                    $('#tutorialContent').append('<br><br>').append($('<ul>').attr('class', 'tip'));
                    if (Array.isArray(tutorial.step[step].tip)) {
                        for (var i = 0; i < tutorial.step[step].tip.length; i++) {
                            $('#tutorialContent ul.tip').append('<li>' + tutorial.step[step].tip[i] + '</li>');
                        }
                    }
                    else {
                        $('#tutorialContent ul.tip').append('<li>' + tutorial.step[step].tip + '</li>');
                    }
                }
                if (tutorial.step[step].solution) {
                    $('#tutorialContent').append($('<div>')
                        .attr('id', 'helpDiv')
                        .append($('<button>', {
                        text: 'Hilfe',
                        id: 'quizHelp',
                        class: 'btn test',
                        click: function () {
                            showSolution();
                        },
                    })));
                }
                if (step == maxSteps - 1) {
                    // last step
                    $('#tutorialContent').append($('<div>')
                        .attr('class', 'quiz continue')
                        .append($('<button>', {
                        text: 'Tutorial beenden',
                        class: 'btn',
                        click: function () {
                            MSG.displayMessage(tutorial.end, 'POPUP', '');
                            $('.modal').oneWrap('hide.bs.modal', function (e) {
                                $('#tutorialEnd').clickWrap();
                                return false;
                            });
                            return false;
                        },
                    })));
                }
                else {
                    $('#tutorialContent').append($('<div>')
                        .attr('class', 'quiz continue')
                        .append($('<button>', {
                        text: 'weiter',
                        class: 'btn',
                        click: function () {
                            createQuiz();
                        },
                    })));
                }
            }
            else {
                // apparently a step without an instruction -> go directly to the quiz
                createQuiz();
            }
            if (GUISTATE_C.isKioskMode()) {
                U.removeLinks($('#tutorialContent a'));
            }
        }
    }
    function createQuiz() {
        if (tutorial.step[step].quiz) {
            $('#tutorialContent').html('');
            $('#tutorialContent').append($('<div>').attr('class', 'quiz content'));
            tutorial.step[step].quiz.forEach(function (quiz, iQuiz) {
                $('#tutorialContent .quiz.content').append($('<div>').attr('class', 'quiz question').append(quiz.question));
                var answers = shuffle(quiz.answer);
                quiz.answer.forEach(function (answer, iAnswer) {
                    var correct = answer.charAt(0) !== '!';
                    if (!correct) {
                        answer = answer.substr(1);
                    }
                    $('#tutorialContent .quiz.content').append($('<label>')
                        .attr('class', 'quiz answer')
                        .append(answer)
                        .append($('<input>', {
                        type: 'checkbox',
                        class: 'quiz',
                        name: 'answer_' + iAnswer,
                        id: iQuiz + '_' + iAnswer,
                        value: correct,
                    }))
                        .append($('<span>', {
                        for: iQuiz + '_' + iAnswer,
                        class: 'checkmark quiz',
                    })));
                });
            });
            $('#tutorialContent .quiz.content').append($('<div>')
                .attr('class', 'quiz footer')
                .attr('id', 'quizFooter')
                .append($('<button/>', {
                text: 'prüfen!',
                class: 'btn test left',
                click: function () {
                    checkQuiz();
                },
            })));
        }
        else {
            // apparently no quiz provided, go to next step
            nextStep();
        }
    }
    function nextStep() {
        step += 1;
        if (step < maxSteps) {
            $('#tutorial-list .active').removeClass('active');
            $('#tutorial-list .preActive').removeClass('preActive');
            $("#tutorial-list .step a:contains('" + (step + 1) + "')")
                .parent()
                .addClass('active');
            $("#tutorial-list .step a:contains('" + step + "')")
                .parent()
                .addClass('preActive');
            createInstruction();
            if (step == maxSteps - 1 && quiz) {
                var finalMaxCredits = 0;
                for (var i = maxCredits.length; i--;) {
                    if (maxCredits[i]) {
                        finalMaxCredits += maxCredits[i];
                    }
                }
                var finalCredits = 0;
                for (var i = credits.length; i--;) {
                    if (credits[i]) {
                        finalCredits += credits[i];
                    }
                }
                var percent = 0;
                if (finalMaxCredits !== 0) {
                    percent = Math.round((100 / finalMaxCredits) * finalCredits);
                }
                var thumbs = Math.round((percent - 50) / 17) + 1;
                var $quizFooter = $('<div>')
                    .attr('class', 'quiz footer')
                    .attr('id', 'quizFooter')
                    .append(finalCredits + ' von ' + finalMaxCredits + ' Antworten oder ' + percent + '% sind richtig! ');
                $quizFooter.insertBefore($('.quiz.continue'));
                $('#quizFooter').append($('<span>', {
                    id: 'quizResult',
                }));
                if (percent > 0) {
                    $('#quizResult').append($('<span>', {
                        class: 'typcn typcn-thumbs-up',
                    }));
                }
                if (percent == 100) {
                    $('#quizResult').append($('<span>', {
                        class: 'typcn typcn-thumbs-up',
                    }));
                    $('#quizResult').append($('<span>', {
                        class: 'typcn typcn-thumbs-up',
                    }));
                    $('#quizResult').append(' Spitze!');
                }
                else if (percent > 80) {
                    $('#quizResult').append($('<span>', {
                        class: 'typcn typcn-thumbs-up',
                    }));
                    $('#quizResult').append(' Super!');
                }
                else if (percent > 60) {
                    $('#quizResult').append(' Gut gemacht!');
                }
                else if (percent == 0) {
                    $('#quizResult').append(' Du kannst die Quizfragen jederzeit wiederholen, wenn du möchtest!');
                }
                else {
                    $('#quizResult').append(' Das ist ok!');
                }
            }
        }
        else {
            // end of the tutorial
        }
    }
    function showSolution() {
        $('#helpDiv').append($('<div>').append(tutorial.step[step].solution).attr({
            class: 'imgSol',
        }));
        $('#quizHelp').remove();
    }
    function checkQuiz() {
        var countCorrect = 0;
        var countChecked = 0;
        var totalQuestions = $('.quiz.question').length;
        var totalCorrect = $('.quiz.answer [value=true]').length;
        $('.quiz input').each(function (i, elem) {
            var $label = $('label>span[for="' + $(this).attr('id') + '"]');
            if ($(this).is(':checked')) {
                countChecked++;
            }
            if ($(this).val() === 'true' && $(this).is(':checked')) {
                $label.parent().addClass('correct');
                countCorrect++;
            }
            if ($(this).val() === 'false' && $(this).is(':checked')) {
                $label.parent().addClass('fail');
            }
            $(this).attr('onclick', 'return false;');
        });
        $('#quizFooter').html('');
        if (countCorrect !== totalCorrect) {
            $('#quizFooter').append($('<button/>', {
                text: 'nochmal',
                class: 'btn test',
                click: function () {
                    createQuiz();
                },
            }));
            var confirmText;
            if (countChecked == 0) {
                confirmText = 'Bitte kreuze mindestens eine Anwort an.';
            }
            else if (totalQuestions == 1) {
                confirmText = 'Die Antwort ist leider nicht ganz richtig.';
            }
            else {
                confirmText = countCorrect + ' Anworten von ' + totalCorrect + ' sind richtig!';
            }
            $('#quizFooter').append($('<span>', {
                text: confirmText,
            }));
        }
        $('#tutorialContent').append($('<div>')
            .attr('class', 'quiz continue')
            .append($('<button>', {
            text: 'weiter',
            class: 'btn',
            click: function () {
                nextStep();
            },
        })));
        credits[step] = countCorrect;
        maxCredits[step] = totalCorrect;
    }
    function shuffle(answers) {
        for (var j, x, i = answers.length; i; j = Math.floor(Math.random() * i), x = answers[--i], answers[i] = answers[j], answers[j] = x)
            ;
        return answers;
    }
    function toggleTutorial() {
        if ($('#tutorialButton').hasClass('rightActive')) {
            $('#blockly').closeRightView();
        }
        else {
            $('#blockly').openRightView('tutorial', INITIAL_WIDTH);
        }
    }
    function openTutorialView() {
        if ($('#tutorialDiv').hasClass('rightActive')) {
            return;
        }
        if ($('#blockly').hasClass('rightActive')) {
            function waitForClose() {
                if (!$('#blockly').hasClass('rightActive')) {
                    toggleTutorial();
                }
                else {
                    setTimeout(waitForClose, 50);
                }
            }
            waitForClose();
        }
        else {
            toggleTutorial();
        }
    }
    function closeTutorialView() {
        if ($('.rightMenuButton.rightActive').length >= 0) {
            $('.rightMenuButton.rightActive').clickWrap();
        }
    }
    function exitTutorial() {
        Blockly.hideChaff();
        $('#tutorial-navigation').fadeOut(750);
        $('#head-navigation').fadeIn(750);
        $('#tutorialButton').fadeOut();
        $('.blocklyToolboxDiv>.levelTabs').removeClass('invisible');
        PROG_C.loadExternalToolbox(GUISTATE_C.getProgramToolbox());
        Blockly.mainWorkspace.options.maxBlocks = undefined;
        if (GUISTATE_C.isKioskMode()) {
            $('.modal').modal('hide');
            loadFromTutorial(tutorialId);
        }
        else {
            closeTutorialView();
            $('#tabTutorialList').clickWrap();
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ1R1dG9yaWFsLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3JvYmVydGEvY29udHJvbGxlci9wcm9nVHV0b3JpYWwuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxJQUFNLGFBQWEsR0FBRyxHQUFHLENBQUM7SUFDMUIsSUFBSSxnQkFBZ0IsQ0FBQztJQUNyQixJQUFJLFlBQVksQ0FBQztJQUNqQixJQUFJLFVBQVUsQ0FBQztJQUNmLElBQUksUUFBUSxDQUFDO0lBQ2IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNqQixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDcEIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO0lBRWpCLFNBQVMsSUFBSTtRQUNULFlBQVksR0FBRyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMvQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNwRCxVQUFVLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBOEVRLG9CQUFJO0lBNUViLFNBQVMsVUFBVTtRQUNmLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxLQUFLO1lBQy9DLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFO1lBQzFDLGNBQWMsRUFBRSxDQUFDO1lBQ2pCLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFNBQVMsZ0JBQWdC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