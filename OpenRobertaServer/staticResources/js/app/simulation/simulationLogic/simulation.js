/**
 * @fileOverview Simulate a robot
 * @author Beate Jost <beate.jost@iais.fraunhofer.de>
 */
define(["require", "exports", "simulation.scene", "simulation.constants", "util", "interpreter.interpreter", "interpreter.robotSimBehaviour", "volume-meter", "message", "jquery", "huebee", "blockly"], function (require, exports, simulation_scene_1, simulation_constants_1, UTIL, SIM_I, MBED_R, Volume, MSG, $, HUEBEE, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSimVariables = exports.endDebugging = exports.interpreterAddEvent = exports.updateDebugMode = exports.getDebugMode = exports.getWebAudio = exports.importImage = exports.resetScene = exports.exportConfigData = exports.importConfigData = exports.getInfo = exports.getGround = exports.getScale = exports.cancel = exports.getSelectedRobot = exports.getRobotIndex = exports.run = exports.init = exports.stopProgram = exports.toggleColorPicker = exports.addColorArea = exports.addObstacle = exports.deleteSelectedObject = exports.resetPose = exports.setInfo = exports.setStep = exports.getDt = exports.initMicrophone = exports.getColorAreaList = exports.getObstacleList = exports.getBackground = exports.setBackground = exports.getNumRobots = exports.setPause = void 0;
    var standColorObstacle = '#33B8CA';
    var standColorArea = '#FBED00';
    var interpreters;
    var scene;
    var userPrograms;
    var configurations = [];
    var canvasOffset;
    var offsetX;
    var offsetY;
    var startX;
    var startY;
    var scale = 1;
    var selectedRobot = -1;
    var selectedObstacle = -1;
    var selectedColorArea = -1;
    var downCorner = -1;
    var downRuler = false;
    var downRobot = -1;
    var downColorArea = -1;
    var downObstacle = -1;
    var highLightCorners = [];
    var canceled;
    var storedPrograms;
    var copiedObject;
    var customBackgroundLoaded = false;
    var debugMode = false;
    var breakpoints = [];
    var obstacleList = [];
    var colorAreaList = [];
    var observers = {};
    var imgObstacle1 = new Image();
    var imgPattern = new Image();
    var imgRuler = new Image();
    var mouseX;
    var mouseY;
    var colorpicker = new HUEBEE('#colorpicker', {
        shades: 1,
        hues: 8,
        setText: false,
    });
    var imgList = [
        '/js/app/simulation/simBackgrounds/baustelle.svg',
        '/js/app/simulation/simBackgrounds/ruler.svg',
        '/js/app/simulation/simBackgrounds/wallPattern.png',
        '/js/app/simulation/simBackgrounds/calliopeBackground.svg',
        '/js/app/simulation/simBackgrounds/microbitBackground.svg',
        '/js/app/simulation/simBackgrounds/simpleBackground.svg',
        '/js/app/simulation/simBackgrounds/drawBackground.svg',
        '/js/app/simulation/simBackgrounds/robertaBackground.svg',
        '/js/app/simulation/simBackgrounds/rescueBackground.svg',
        '/js/app/simulation/simBackgrounds/blank.svg',
        '/js/app/simulation/simBackgrounds/mathBackground.svg',
    ];
    var imgListIE = [
        '/js/app/simulation/simBackgrounds/baustelle.png',
        '/js/app/simulation/simBackgrounds/ruler.png',
        '/js/app/simulation/simBackgrounds/wallPattern.png',
        '/js/app/simulation/simBackgrounds/calliopeBackground.png',
        '/js/app/simulation/simBackgrounds/microbitBackground.png',
        '/js/app/simulation/simBackgrounds/simpleBackground.png',
        '/js/app/simulation/simBackgrounds/drawBackground.png',
        '/js/app/simulation/simBackgrounds/robertaBackground.png',
        '/js/app/simulation/simBackgrounds/rescueBackground.png',
        '/js/app/simulation/simBackgrounds/blank.png',
        '/js/app/simulation/simBackgrounds/mathBackground.png',
    ];
    var imgObjectList = [];
    function preloadImages() {
        if (isIE()) {
            imgList = imgListIE;
        }
        var i = 0;
        for (i = 0; i < imgList.length; i++) {
            if (i === 0) {
                imgObstacle1.src = imgList[i];
            }
            else if (i == 1) {
                imgRuler.src = imgList[i];
            }
            else if (i == 2) {
                imgPattern.src = imgList[i];
            }
            else {
                imgObjectList[i - 3] = new Image();
                imgObjectList[i - 3].src = imgList[i];
            }
        }
        if (UTIL.isLocalStorageAvailable()) {
            var customBackground = localStorage.getItem('customBackground');
            if (customBackground) {
                // TODO backwards compatibility for non timestamped background images; can be removed after some time
                try {
                    JSON.parse(customBackground);
                }
                catch (e) {
                    localStorage.setItem('customBackground', JSON.stringify({
                        image: customBackground,
                        timestamp: new Date().getTime(),
                    }));
                    customBackground = localStorage.getItem('customBackground');
                }
                customBackground = JSON.parse(customBackground);
                // remove images older than 30 days
                var currentTimestamp = new Date().getTime();
                if (currentTimestamp - customBackground.timestamp > 63 * 24 * 60 * 60 * 1000) {
                    localStorage.removeItem('customBackground');
                }
                else {
                    // add image to backgrounds if recent
                    var dataImage = customBackground.image;
                    imgObjectList[i - 3] = new Image();
                    imgObjectList[i - 3].src = 'data:image/png;base64,' + dataImage;
                    customBackgroundLoaded = true;
                }
            }
        }
    }
    preloadImages();
    var currentBackground = 2;
    function setBackground(num) {
        num = num || -1;
        var configData = {};
        if (num === -1) {
            configData = exportConfigData();
            currentBackground += 1;
            if (currentBackground >= imgObjectList.length) {
                currentBackground = 2;
            }
            if (currentBackground == imgObjectList.length - 1 && customBackgroundLoaded && UTIL.isLocalStorageAvailable()) {
                // update timestamp of custom background
                localStorage.setItem('customBackground', JSON.stringify({
                    image: JSON.parse(localStorage.getItem('customBackground')).image,
                    timestamp: new Date().getTime(),
                }));
            }
        }
        else {
            currentBackground = num;
        }
        var debug = robots[0].debug;
        var moduleName = 'simulation.robot.' + simRobotType;
        removeMouseEvents();
        resetSelection();
        new Promise(function (resolve_1, reject_1) { require([moduleName], resolve_1, reject_1); }).then(function (ROBOT) {
            createRobots(ROBOT.default, numRobots);
            for (var i = 0; i < robots.length; i++) {
                robots[i].debug = debug;
                robots[i].reset();
            }
            scene.robots = robots;
        });
        var config = coordinates2relatives();
        scene.resetAllCanvas(imgObjectList[currentBackground]);
        relatives2coordinates(config);
        setObstacle();
        setRuler();
        scene.drawObstacles(highLightCorners);
        scene.drawColorAreas(highLightCorners);
        scene.drawRuler();
        addMouseEvents();
        resizeAll();
    }
    exports.setBackground = setBackground;
    function getBackground() {
        return currentBackground;
    }
    exports.getBackground = getBackground;
    function getObstacleList() {
        return obstacleList;
    }
    exports.getObstacleList = getObstacleList;
    function getColorAreaList() {
        return colorAreaList;
    }
    exports.getColorAreaList = getColorAreaList;
    function initMicrophone(robot) {
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }
        navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        try {
            // ask for an audio input
            navigator.mediaDevices
                .getUserMedia({
                audio: {
                    mandatory: {
                        googEchoCancellation: 'false',
                        googAutoGainControl: 'false',
                        googNoiseSuppression: 'false',
                        googHighpassFilter: 'false',
                    },
                    optional: [],
                },
            })
                .then(function (stream) {
                var mediaStreamSource = robot.webAudio.context.createMediaStreamSource(stream);
                robot.sound = Volume.createAudioMeter(robot.webAudio.context);
                mediaStreamSource.connect(robot.sound);
            }, function () {
                console.log('Sorry, but there is no microphone available on your system');
            });
        }
        catch (e) {
            console.log('Sorry, but there is no microphone available on your system');
        }
    }
    exports.initMicrophone = initMicrophone;
    var time;
    var renderTime = 5; // approx. time in ms only for the first rendering
    var dt = 0;
    function getDt() {
        return dt;
    }
    exports.getDt = getDt;
    var pause = false;
    function setPause(value) {
        if (!value && readyRobots.indexOf(false) > -1) {
            setTimeout(function () {
                setPause(false);
            }, 100);
        }
        else {
            if (value && !debugMode) {
                $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
                $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
            }
            else if (!value && !debugMode) {
                $('#simControl').addClass('typcn-media-stop').removeClass('typcn-media-play-outline');
                $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
            }
            pause = value;
        }
    }
    exports.setPause = setPause;
    var runRenderUntil;
    function setStep() {
        stepCounter = -50;
        setPause(false);
    }
    exports.setStep = setStep;
    var info;
    function setInfo() {
        if (info === true) {
            info = false;
        }
        else {
            info = true;
        }
    }
    exports.setInfo = setInfo;
    function resetPose() {
        for (var i = 0; i < robots.length; i++) {
            if (robots[i].resetPose) {
                robots[i].resetPose();
            }
            if (robots[i].time) {
                robots[i].time = 0;
            }
        }
        resetSelection();
        scene.resetAllCanvas();
        scene.drawColorAreas(highLightCorners);
        scene.drawObstacles(highLightCorners);
        scene.drawRuler();
    }
    exports.resetPose = resetPose;
    function deleteSelectedObject() {
        if (selectedColorArea >= 0) {
            colorAreaList.splice(selectedColorArea, 1);
            selectedColorArea = -1;
            highLightCorners = [];
            updateColorAreaLayer();
        }
        if (selectedObstacle >= 0) {
            obstacleList.splice(selectedObstacle, 1);
            selectedObstacle = -1;
            highLightCorners = [];
            updateObstacleLayer();
        }
    }
    exports.deleteSelectedObject = deleteSelectedObject;
    function addObstacle(shape) {
        var obstacle = addObject(shape, 'obstacle', obstacleList);
        if (selectedColorArea >= 0) {
            highLightCorners = [];
            updateColorAreaLayer();
        }
        resetSelection();
        selectedObstacle = obstacleList.length - 1;
        highLightCorners = calculateCorners(obstacle);
        updateObstacleLayer();
    }
    exports.addObstacle = addObstacle;
    function addColorArea(shape) {
        var colorArea = addObject(shape, 'colorArea', colorAreaList);
        if (selectedObstacle >= 0) {
            highLightCorners = [];
            updateObstacleLayer();
        }
        resetSelection();
        selectedColorArea = colorAreaList.length - 1;
        highLightCorners = calculateCorners(colorArea);
        updateColorAreaLayer();
    }
    exports.addColorArea = addColorArea;
    function addObject(shape, type, objectList) {
        $('#robotLayer').attr('tabindex', 0);
        $('#robotLayer').focus();
        var newObject = {};
        var x = Math.random() * (ground.w - 200 - 100) + 100;
        var y = Math.random() * (ground.h - 100 - 100) + 100;
        switch (shape) {
            case 'rectangle':
                newObject = {
                    form: 'rectangle',
                    x: x,
                    y: y,
                    w: 100,
                    h: 100,
                    theta: 0,
                    img: null,
                };
                break;
            case 'triangle':
                newObject = {
                    form: 'triangle',
                    ax: x - 50,
                    ay: y + 50,
                    bx: x,
                    by: y - 50,
                    cx: x + 50,
                    cy: y + 50,
                };
                break;
            case 'circle':
                newObject = {
                    form: 'circle',
                    x: x,
                    y: y,
                    r: 50,
                    startAngle: 50,
                    endAngle: 0,
                };
                break;
            default:
                console.error('SIMULATION: no or wrong shape');
        }
        if (type === 'obstacle') {
            newObject.color = standColorObstacle;
        }
        else {
            newObject.color = standColorArea;
        }
        newObject.type = type;
        objectList.push(newObject);
        enableChangeObjectButtons();
        return newObject;
    }
    function changeColorWithColorPicker(color) {
        var selectedObject = selectedObstacle >= 0 ? obstacleList[selectedObstacle] : selectedColorArea >= 0 ? colorAreaList[selectedColorArea] : null;
        if (selectedObject != null) {
            selectedObject.color = color;
            updateSelectedObjects();
        }
    }
    function toggleColorPicker() {
        if ($('.huebee').length) {
            colorpicker.close();
        }
        else {
            colorpicker.open();
        }
    }
    exports.toggleColorPicker = toggleColorPicker;
    function resetColorpickerCursor(event) {
        colorpicker.color = null;
        colorpicker.setTexts();
        colorpicker.setBackgrounds();
        colorpicker.cursor.classList.add('is-hidden');
    }
    function stopProgram() {
        setPause(true);
        for (var i = 0; i < numRobots; i++) {
            robots[i].reset();
        }
        resetButtons();
        if (debugMode) {
            for (var i = 0; i < numRobots; i++) {
                interpreters[i].removeHighlights();
            }
        }
        setTimeout(function () {
            init(userPrograms, false, simRobotType);
            addMouseEvents();
        }, 205);
    }
    exports.stopProgram = stopProgram;
    // obstacles
    // scaled playground
    ground = {
        x: 0,
        y: 0,
        w: 500,
        h: 500,
        isParallelToAxis: true,
        type: 'ground',
        form: 'rectangle',
    };
    var defaultObstacle = {
        x: 0,
        y: 0,
        xOld: 0,
        yOld: 0,
        w: 0,
        h: 0,
        wOld: 0,
        hOld: 0,
        isParallelToAxis: true,
        theta: 0,
        form: 'rectangle',
        type: 'obstacle',
    };
    obstacleList = [defaultObstacle];
    var ruler = {
        x: 0,
        y: 0,
        xOld: 0,
        yOld: 0,
        w: 0,
        h: 0,
        wOld: 0,
        hOld: 0,
        type: 'ruler',
    };
    // Note: The ruler is not considered an obstacle. The robot will
    // simply drive over it.
    var globalID;
    var robots = [];
    var robotIndex = 0;
    var simRobotType;
    var numRobots = 0;
    exports.getNumRobots = function () {
        return numRobots;
    };
    function callbackOnTermination() {
        if (allInterpretersTerminated()) {
            if (!robots[0].endless) {
                if (debugMode) {
                    $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-play');
                    $('#simStop').removeClass('disabled');
                }
                else {
                    $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
                    $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
                }
            }
            else if (debugMode) {
                if (!$('#simStop').hasClass('disabled')) {
                    $('#simStop').hide();
                    $('#simControl').addClass('typcn-media-stop').removeClass('typcn-media-play').removeClass('blue');
                    $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
                }
            }
        }
        console.log('END of Sim');
    }
    function init(programs, refresh, robotType) {
        mouseOnRobotIndex = -1;
        storedPrograms = programs;
        numRobots = programs.length;
        reset = false;
        simRobotType = robotType;
        userPrograms = programs;
        runRenderUntil = [];
        configurations = [];
        for (i = 0; i < programs.length; i++) {
            runRenderUntil[i] = 0;
        }
        if (robotType.indexOf('calliope') >= 0) {
            currentBackground = 0;
            resetScene([], []);
            $('.dropdown.sim, .simScene, #simImport, #simResetPose, #simButtonsHead, #simEditButtons').hide();
        }
        else if (robotType === 'microbit') {
            resetScene([], []);
            $('.dropdown.sim, .simScene, #simImport, #simResetPose, #simButtonsHead, #simEditButtons').hide();
            currentBackground = 1;
        }
        else if (currentBackground === 0 || currentBackground == 1) {
            currentBackground = 2;
        }
        if (currentBackground > 1) {
            if (isIE() || isEdge()) {
                // TODO IE and Edge: Input event not firing for file type of input
                $('.dropdown.sim, .simScene').show();
                $('#simImport').hide();
            }
            else {
                $('.dropdown.sim, .simScene, #simImport, #simResetPose, #simEditButtons').show();
            }
        }
        $('#simButtons, #canvasDiv').show();
        $('#webotsButtons, #webotsDiv').hide();
        interpreters = programs.map(function (x) {
            var src = JSON.parse(x.javaScriptProgram);
            configurations.push(x.configuration.SENSORS);
            return new SIM_I.Interpreter(src, new MBED_R.RobotMbedBehaviour(), callbackOnTermination, breakpoints);
        });
        updateDebugMode(debugMode);
        isDownRobots = [];
        for (var i = 0; i < numRobots; i++) {
            isDownRobots.push(false);
        }
        if (refresh) {
            robotIndex = 0;
            robots = [];
            readyRobots = [];
            isDownRobots = [];
            new Promise(function (resolve_2, reject_2) { require(['simulation.robot.' + simRobotType], resolve_2, reject_2); }).then(function (reqRobot) {
                createRobots(reqRobot.default, numRobots);
                for (var i = 0; i < numRobots; i++) {
                    robots[i].reset();
                    robots[i].resetPose();
                    readyRobots.push(false);
                    isDownRobots.push(false);
                }
                removeMouseEvents();
                canceled = false;
                isDownObstacle = false;
                colorpicker.close();
                isDownRuler = false;
                isDownColorArea = false;
                stepCounter = 0;
                pause = true;
                info = false;
                setObstacle();
                setRuler();
                initScene();
            });
        }
        else {
            for (var i = 0; i < numRobots; i++) {
                robots[i].replaceState(interpreters[i].getRobotBehaviour());
                if (robots[i].endless) {
                    robots[i].reset();
                }
            }
            resetButtons();
        }
    }
    exports.init = init;
    function run(refresh, robotType) {
        init(storedPrograms, refresh, robotType);
    }
    exports.run = run;
    function getRobotIndex() {
        return robotIndex;
    }
    exports.getRobotIndex = getRobotIndex;
    function getSelectedRobot() {
        return selectedRobot;
    }
    exports.getSelectedRobot = getSelectedRobot;
    function cancel() {
        canceled = true;
        removeMouseEvents();
    }
    exports.cancel = cancel;
    var reset = false;
    /*
     * The below Colors are picked from the toolkit and should be used to color
     * the robots
     */
    var colorsAdmissible = [
        [242, 148, 0],
        [143, 164, 2],
        [235, 106, 10],
        [51, 184, 202],
        [0, 90, 148],
        [186, 204, 30],
        [235, 195, 0],
        [144, 133, 186],
    ];
    function render() {
        if (canceled) {
            cancelAnimationFrame(globalID);
            return;
        }
        var actionValues = [];
        for (var i = 0; i < numRobots; i++) {
            actionValues.push({});
        }
        globalID = requestAnimationFrame(render);
        var now = new Date().getTime();
        var dtSim = now - (time || now);
        var dtRobot = Math.min(15, (dtSim - renderTime) / numRobots);
        var dtRobot = Math.abs(dtRobot);
        dt = dtSim / 1000;
        time = now;
        stepCounter += 1;
        for (var i = 0; i < numRobots; i++) {
            if (robots[i] && !robots[i].pause && !pause) {
                if (!interpreters[i].isTerminated() && !reset) {
                    if (runRenderUntil[i] <= now) {
                        var delayMs = interpreters[i].run(now + dtRobot);
                        var nowNext = new Date().getTime();
                        runRenderUntil[i] = nowNext + delayMs;
                    }
                }
                else if (reset || (allInterpretersTerminated() && !robots[i].endless)) {
                    reset = false;
                    for (var j = 0; j < robots.length; j++) {
                        robots[j].buttons.Reset = false;
                        robots[j].pause = true;
                        robots[j].reset();
                    }
                    removeMouseEvents();
                    scene.drawRobots();
                    // some time to cancel all timeouts
                    setTimeout(function () {
                        init(userPrograms, false, simRobotType);
                        addMouseEvents();
                    }, 205);
                    if (!(allInterpretersTerminated() && !robots[i].endless)) {
                        setTimeout(function () {
                            setPause(false);
                            for (var j = 0; j < robots.length; j++) {
                                robots[j].pause = false;
                            }
                        }, 1000);
                    }
                }
            }
            robots[i] && robots[i].update();
            updateBreakpointEvent();
        }
        var renderTimeStart = new Date().getTime();
        function allPause() {
            for (var i = 0; i < robots.length; i++) {
                if (!robots[i].pause) {
                    return false;
                }
            }
            return true;
        }
        if (allPause()) {
            setPause(true);
            for (var i = 0; i < robots.length; i++) {
                robots[i].pause = false;
            }
        }
        if (robots[0] !== undefined && robots[0].buttons !== undefined) {
            reset = robots[0].buttons.Reset;
        }
        scene.updateSensorValues(!pause);
        scene.drawRobots();
        renderTime = new Date().getTime() - renderTimeStart;
    }
    function allInterpretersTerminated() {
        for (var i = 0; i < interpreters.length; i++) {
            if (!interpreters[i].isTerminated()) {
                return false;
            }
        }
        return true;
    }
    function resetButtons() {
        if (debugMode) {
            $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-play');
            $('#simStop').addClass('disabled');
        }
        else {
            $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
            $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
        }
    }
    //set standard obstacle
    function setObstacle() {
        if (obstacleList.length == 0) {
            obstacleList.push(defaultObstacle);
        }
        if (obstacleList.length == 1) {
            var standObst = {};
            switch (currentBackground) {
                case 0:
                case 1:
                case 7:
                    standObst.x = 0;
                    standObst.y = 0;
                    standObst.w = 0;
                    standObst.h = 0;
                    standObst.color = null;
                    standObst.img = null;
                    standObst.form = 'rectangle';
                    break;
                case 2:
                    standObst.x = 580;
                    standObst.y = 290;
                    standObst.w = 100;
                    standObst.h = 100;
                    standObst.color = standColorObstacle;
                    standObst.form = 'rectangle';
                    break;
                case 3:
                    standObst.x = 500;
                    standObst.y = 250;
                    standObst.w = 100;
                    standObst.h = 100;
                    standObst.img = null;
                    standObst.color = standColorObstacle;
                    standObst.form = 'rectangle';
                    break;
                case 4:
                    standObst.x = 500;
                    standObst.y = 260;
                    standObst.w = 100;
                    standObst.h = 100;
                    standObst.img = imgObstacle1;
                    standObst.color = null;
                    standObst.form = 'rectangle';
                    break;
                case 5:
                    standObst.x = 505;
                    standObst.y = 405;
                    standObst.w = 20;
                    standObst.h = 20;
                    standObst.color = standColorObstacle;
                    standObst.img = null;
                    standObst.form = 'rectangle';
                    break;
                case 6:
                    standObst.x = 425;
                    standObst.y = 254;
                    standObst.w = 50;
                    standObst.h = 50;
                    standObst.color = '#009EE3';
                    standObst.img = null;
                    standObst.form = 'rectangle';
                    break;
                default:
                    var x = imgObjectList[currentBackground].width - 50;
                    var y = imgObjectList[currentBackground].height - 50;
                    standObst.x = x;
                    standObst.y = y;
                    standObst.w = 50;
                    standObst.h = 50;
                    standObst.color = standColorObstacle;
                    standObst.img = null;
                    standObst.form = 'rectangle';
            }
            standObst.type = 'obstacle';
            obstacleList[0] = standObst;
        }
    }
    function setRuler() {
        if (currentBackground == 4) {
            ruler.x = 430;
            ruler.y = 400;
            ruler.w = 300;
            ruler.h = 30;
            ruler.img = imgRuler;
            ruler.color = '#ff0000';
        }
        else {
            // All other scenes currently don't have a movable ruler.
            ruler.x = 0;
            ruler.y = 0;
            ruler.w = 0;
            ruler.h = 0;
            ruler.img = null;
            ruler.color = null;
        }
    }
    function handleKeyEvent(e) {
        var keyName = e.key;
        var keyCode = e.keyCode;
        var selectedObject = selectedObstacle >= 0 ? obstacleList[selectedObstacle] : selectedColorArea >= 0 ? colorAreaList[selectedColorArea] : null;
        if (selectedRobot >= 0) {
            if (robots[selectedRobot].drawWidth) {
                robots[selectedRobot].canDraw = false;
            }
            switch (keyName) {
                case 'ArrowUp':
                    robots[selectedRobot].pose.x += Math.cos(robots[selectedRobot].pose.theta);
                    robots[selectedRobot].pose.y += Math.sin(robots[selectedRobot].pose.theta);
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'ArrowLeft':
                    robots[robotIndex].pose.theta -= Math.PI / 180;
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'ArrowDown':
                    robots[selectedRobot].pose.x -= Math.cos(robots[selectedRobot].pose.theta);
                    robots[selectedRobot].pose.y -= Math.sin(robots[selectedRobot].pose.theta);
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'ArrowRight':
                    robots[selectedRobot].pose.theta += Math.PI / 180;
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                default:
            }
        }
        else if (selectedObject) {
            var shift = 5;
            switch (keyName) {
                case 'ArrowUp':
                    switch (selectedObject.form) {
                        case 'rectangle':
                        case 'circle':
                            selectedObject.y -= shift;
                            break;
                        case 'triangle':
                            selectedObject.ay -= shift;
                            selectedObject.by -= shift;
                            selectedObject.cy -= shift;
                            break;
                        default:
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'ArrowLeft':
                    switch (selectedObject.form) {
                        case 'rectangle':
                        case 'circle':
                            selectedObject.x -= shift;
                            break;
                        case 'triangle':
                            selectedObject.ax -= shift;
                            selectedObject.bx -= shift;
                            selectedObject.cx -= shift;
                            break;
                        default:
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'ArrowDown':
                    switch (selectedObject.form) {
                        case 'rectangle':
                        case 'circle':
                            selectedObject.y += shift;
                            break;
                        case 'triangle':
                            selectedObject.ay += shift;
                            selectedObject.by += shift;
                            selectedObject.cy += shift;
                            break;
                        default:
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'ArrowRight':
                    switch (selectedObject.form) {
                        case 'rectangle':
                        case 'circle':
                            selectedObject.x += shift;
                            break;
                        case 'triangle':
                            selectedObject.ax += shift;
                            selectedObject.bx += shift;
                            selectedObject.cx += shift;
                            break;
                        default:
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                default:
                // nothing to do so far
            }
            highLightCorners = calculateCorners(selectedObject);
            selectedObject.type === 'obstacle' ? updateObstacleLayer() : updateColorAreaLayer();
        }
        switch (keyCode) {
            case 17 && 67:
                copiedObject = {};
                if (selectedObject) {
                    copiedObject = $.extend(copiedObject, selectedObject);
                }
                e.preventDefault();
                e.stopPropagation();
                break;
            case 17 && 86:
                var toCopyObject = {};
                toCopyObject = $.extend(toCopyObject, selectedObject);
                if (!$.isEmptyObject(toCopyObject) && selectedObject) {
                    mouseX = mouseX || ground.w / 2;
                    mouseY = mouseY || ground.h / 2;
                    if (toCopyObject.form === 'triangle') {
                        var diffx = toCopyObject.ax - mouseX;
                        var diffy = toCopyObject.ay - mouseY;
                        toCopyObject.ax = mouseX;
                        toCopyObject.ay = mouseY;
                        toCopyObject.bx -= diffx;
                        toCopyObject.by -= diffy;
                        toCopyObject.cx -= diffx;
                        toCopyObject.cy -= diffy;
                    }
                    else if (toCopyObject.form === 'rectangle') {
                        toCopyObject.x = mouseX - toCopyObject.w / 2;
                        toCopyObject.y = mouseY - toCopyObject.h / 2;
                    }
                    else if (toCopyObject.form === 'circle') {
                        toCopyObject.x = mouseX;
                        toCopyObject.y = mouseY;
                    }
                    if (toCopyObject.type === 'obstacle') {
                        obstacleList.push(toCopyObject);
                        updateObstacleLayer();
                    }
                    else if (toCopyObject.type === 'colorArea') {
                        colorAreaList.push(toCopyObject);
                        updateColorAreaLayer();
                    }
                }
                e.preventDefault();
                e.stopPropagation();
                break;
            case 8:
                deleteSelectedObject();
                e.preventDefault();
                e.stopPropagation();
                break;
            case 46:
                deleteSelectedObject();
                e.preventDefault();
                e.stopPropagation();
                break;
            default:
            // nothing to do so far
        }
        $('#robotLayer').attr('tabindex', 0);
        $('#robotLayer').focus();
    }
    function disableChangeObjectButtons() {
        $('.simChangeObject').removeClass('disabled').addClass('disabled');
    }
    function enableChangeObjectButtons() {
        $('.simChangeObject').removeClass('disabled');
    }
    function handleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        var X = e.clientX || e.originalEvent.touches[0].pageX;
        var Y = e.clientY || e.originalEvent.touches[0].pageY;
        var top = $('#robotLayer').offset().top;
        var left = $('#robotLayer').offset().left;
        startX = parseInt(X - left, 10) / scale;
        startY = parseInt(Y - top, 10) / scale;
        var dx;
        var dy;
        for (var i = 0; i < numRobots; i++) {
            dx = startX - robots[i].mouse.rx;
            dy = startY - robots[i].mouse.ry;
            var boolDown = dx * dx + dy * dy < robots[i].mouse.r * robots[i].mouse.r;
            if (boolDown) {
                downRobot = i;
                if (selectedRobot !== i) {
                    $('#brick' + robotIndex).hide();
                    robotIndex = i;
                    $('#brick' + robotIndex).show();
                    if ($('#robotIndex')[0]) {
                        $('#robotIndex')[0][i].selected = true;
                    }
                    highLightCorners = [];
                    if (selectedObstacle >= 0) {
                        selectedObstacle = -1;
                        updateObstacleLayer();
                    }
                    if (selectedColorArea >= 0) {
                        selectedColorArea = -1;
                        updateColorAreaLayer();
                    }
                    downCorner = -1;
                    highLightCorners = [];
                    downRuler = false;
                }
                selectedRobot = i;
                if (robots[i].drawWidth) {
                    robots[i].canDraw = false;
                }
                return;
            }
        }
        if (highLightCorners.length > 0 && (selectedObstacle >= 0 || selectedColorArea >= 0)) {
            for (var i = 0; i < highLightCorners.length; i++) {
                var corner = highLightCorners[i];
                var isDownObstacleCorner = checkDownCircle(startX, startY, corner.x, corner.y, simulation_constants_1.default.CORNER_RADIUS * 3);
                if (isDownObstacleCorner) {
                    downCorner = i;
                    return;
                }
            }
        }
        for (var i = obstacleList.length - 1; i >= 0; i--) {
            var obstacle = obstacleList[i];
            var obstacleIsDown = false;
            if (obstacle.form === 'rectangle') {
                obstacleIsDown = startX > obstacle.x && startX < obstacle.x + obstacle.w && startY > obstacle.y && startY < obstacle.y + obstacle.h;
            }
            else if (obstacle.form === 'triangle') {
                obstacleIsDown = checkDownTriangle(startX, startY, obstacle.ax, obstacle.ay, obstacle.bx, obstacle.by, obstacle.cx, obstacle.cy);
            }
            else if (obstacle.form === 'circle') {
                obstacleIsDown = checkDownCircle(startX, startY, obstacle.x, obstacle.y, obstacle.r);
            }
            if (obstacleIsDown) {
                downObstacle = i;
                if (selectedObstacle !== i) {
                    enableChangeObjectButtons();
                    selectedRobot = -1;
                    if (selectedColorArea >= 0) {
                        selectedColorArea = -1;
                        highLightCorners = [];
                        updateColorAreaLayer();
                    }
                    highLightCorners = calculateCorners(obstacleList[i]);
                    selectedObstacle = i;
                    downCorner = -1;
                    downRuler = false;
                    updateObstacleLayer();
                }
                return;
            }
        }
        for (var i = colorAreaList.length - 1; i >= 0; i--) {
            var colorArea = colorAreaList[i];
            var isDownColorArea = false;
            if (colorArea.form === 'rectangle') {
                isDownColorArea = startX > colorArea.x && startX < colorArea.x + colorArea.w && startY > colorArea.y && startY < colorArea.y + colorArea.h;
            }
            else if (colorArea.form === 'triangle') {
                isDownColorArea = checkDownTriangle(startX, startY, colorArea.ax, colorArea.ay, colorArea.bx, colorArea.by, colorArea.cx, colorArea.cy);
            }
            else if (colorArea.form === 'circle') {
                isDownColorArea = checkDownCircle(startX, startY, colorArea.x, colorArea.y, colorArea.r);
            }
            if (isDownColorArea) {
                downColorArea = i;
                if (selectedColorArea !== i) {
                    enableChangeObjectButtons();
                    selectedRobot = -1;
                    if (selectedObstacle >= 0) {
                        selectedObstacle = -1;
                        highLightCorners = [];
                        updateObstacleLayer();
                    }
                    highLightCorners = calculateCorners(colorAreaList[i]);
                    selectedColorArea = i;
                    downCorner = -1;
                    downRuler = false;
                    updateColorAreaLayer();
                }
                return;
            }
        }
        var rulerIsDown = startX > ruler.x && startX < ruler.x + ruler.w && startY > ruler.y && startY < ruler.y + ruler.h;
        if (!downRuler && rulerIsDown) {
            downRuler = true;
            selectedRobot = -1;
            highLightCorners = [];
            if (selectedObstacle >= 0) {
                selectedObstacle = -1;
                updateObstacleLayer();
            }
            if (selectedColorArea >= 0) {
                selectedColorArea = -1;
                updateColorAreaLayer();
            }
            downCorner = -1;
            return;
        }
        if (selectedObstacle >= 0) {
            highLightCorners = [];
            updateObstacleLayer();
            disableChangeObjectButtons();
        }
        if (selectedColorArea >= 0) {
            highLightCorners = [];
            updateColorAreaLayer();
            disableChangeObjectButtons();
        }
        resetSelection();
    }
    function checkDownTriangle(px, py, x1, y1, x2, y2, x3, y3) {
        var areaOrig = Math.floor(Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)));
        var area1 = Math.floor(Math.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py)));
        var area2 = Math.floor(Math.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py)));
        var area3 = Math.floor(Math.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py)));
        if (area1 + area2 + area3 <= areaOrig) {
            return true;
        }
        return false;
    }
    function checkDownCircle(px, py, cx, cy, r) {
        return (px - cx) * (px - cx) + (py - cy) * (py - cy) <= r * r;
    }
    function calculateCorners(object) {
        var objectCorners;
        if (object.form === 'rectangle') {
            objectCorners = [
                { x: Math.round(object.x), y: Math.round(object.y) + object.h },
                { x: Math.round(object.x), y: Math.round(object.y) },
                { x: Math.round(object.x) + object.w, y: Math.round(object.y) },
                { x: Math.round(object.x) + object.w, y: Math.round(object.y) + object.h },
            ];
        }
        else if (object.form === 'triangle') {
            objectCorners = [
                { x: Math.round(object.ax), y: Math.round(object.ay) },
                { x: Math.round(object.bx), y: Math.round(object.by) },
                { x: Math.round(object.cx), y: Math.round(object.cy) },
            ];
        }
        else if (object.form === 'circle') {
            var cx = Math.round(object.x);
            var cy = Math.round(object.y);
            var r = Math.round(object.r);
            objectCorners = [
                { x: cx - r, y: cy - r },
                { x: cx + r, y: cy - r },
                { x: cx - r, y: cy + r },
                { x: cx + r, y: cy + r },
            ];
        }
        return objectCorners;
    }
    function resetSelection() {
        selectedRobot = -1;
        selectedObstacle = -1;
        selectedColorArea = -1;
        highLightCorners = [];
        downCorner = -1;
        downRuler = false;
        downRobot = -1;
        downColorArea = -1;
        downObstacle = -1;
    }
    function handleMouseUp(e) {
        $('#robotLayer').css('cursor', 'auto');
        if (selectedRobot >= 0 && robots[selectedRobot].drawWidth) {
            robots[selectedRobot].canDraw = true;
        }
        handleMouseOut(e);
    }
    function handleMouseOut(e) {
        e.preventDefault();
        e.stopPropagation();
        downCorner = -1;
        downRuler = false;
        downRobot = -1;
        downColorArea = -1;
        downObstacle = -1;
    }
    function updateColorAreaLayer() {
        scene.drawColorAreas(highLightCorners);
    }
    function updateObstacleLayer() {
        scene.drawRuler();
        scene.drawObstacles(highLightCorners);
    }
    function handleMouseMove(e) {
        e.preventDefault();
        $('#robotLayer').css('cursor', 'default');
        var X = e.clientX || e.originalEvent.touches[0].pageX;
        var Y = e.clientY || e.originalEvent.touches[0].pageY;
        var top = $('#robotLayer').offset().top;
        var left = $('#robotLayer').offset().left;
        mouseX = parseInt(X - left, 10) / scale;
        mouseY = parseInt(Y - top, 10) / scale;
        var dx;
        var dy;
        // move robots
        for (var i = 0; i < numRobots; i++) {
            dx = mouseX - robots[i].mouse.rx;
            dy = mouseY - robots[i].mouse.ry;
            var hoverRobot = dx * dx + dy * dy < robots[i].mouse.r * robots[i].mouse.r;
            if (hoverRobot) {
                $('#robotLayer').css('cursor', 'pointer');
            }
            if (downRobot === i && selectedRobot === i) {
                robots[i].pose.xOld = robots[i].pose.x;
                robots[i].pose.yOld = robots[i].pose.y;
                robots[i].pose.x += dx;
                robots[i].pose.y += dy;
                robots[i].mouse.rx += dx;
                robots[i].mouse.ry += dy;
                return;
            }
        }
        dx = mouseX - startX;
        dy = mouseY - startY;
        startX = mouseX;
        startY = mouseY;
        function resizeObject(object, corner) {
            switch (object.form) {
                case 'triangle':
                    switch (corner) {
                        case 0:
                            object.ax += dx;
                            object.ay += dy;
                            break;
                        case 1:
                            object.bx += dx;
                            object.by += dy;
                            break;
                        case 2:
                            object.cx += dx;
                            object.cy += dy;
                            break;
                        default:
                            break;
                    }
                    break;
                case 'circle':
                    if (Math.abs(dx) >= Math.abs(dy)) {
                        if (mouseX < object.x) {
                            object.r -= dx;
                        }
                        else {
                            object.r += dx;
                        }
                    }
                    else {
                        if (mouseY < object.y) {
                            object.r -= dy;
                        }
                        else {
                            object.r += dy;
                        }
                    }
                    object.r = Math.max(object.r, simulation_constants_1.default.MIN_SIZE_OBJECT);
                    break;
                case 'rectangle':
                    if (object.w >= simulation_constants_1.default.MIN_SIZE_OBJECT && object.h >= simulation_constants_1.default.MIN_SIZE_OBJECT) {
                        switch (corner) {
                            case 0:
                                object.x += dx;
                                object.w -= dx;
                                object.h += dy;
                                break;
                            case 1:
                                object.x += dx;
                                object.y += dy;
                                object.w -= dx;
                                object.h -= dy;
                                break;
                            case 2:
                                object.y += dy;
                                object.w += dx;
                                object.h -= dy;
                                break;
                            case 3:
                                object.w += dx;
                                object.h += dy;
                                break;
                            default:
                                break;
                        }
                    }
                    else if (object.w < simulation_constants_1.default.MIN_SIZE_OBJECT) {
                        if (downCorner == 0 || downCorner == 1) {
                            object.x -= simulation_constants_1.default.MIN_SIZE_OBJECT - object.w;
                        }
                        object.w = simulation_constants_1.default.MIN_SIZE_OBJECT;
                    }
                    else if (object.h < simulation_constants_1.default.MIN_SIZE_OBJECT) {
                        if (downCorner == 1 || downCorner == 2) {
                            object.y -= simulation_constants_1.default.MIN_SIZE_OBJECT - object.h;
                        }
                        object.h = simulation_constants_1.default.MIN_SIZE_OBJECT;
                    }
                    break;
                default:
                    break;
            }
            highLightCorners = calculateCorners(object);
        }
        var hoverCorners = false;
        for (var i = 0; i < highLightCorners.length; i++) {
            var corner = highLightCorners[i];
            hoverCorners = checkDownCircle(mouseX, mouseY, corner.x, corner.y, simulation_constants_1.default.CORNER_RADIUS * 3);
            if (hoverCorners) {
                if ((selectedObstacle >= 0 && obstacleList[selectedObstacle].form !== 'circle') ||
                    (selectedColorArea >= 0 && colorAreaList[selectedColorArea].form !== 'circle')) {
                    switch (i) {
                        case 0:
                            $('#robotLayer').css('cursor', 'sw-resize');
                            break;
                        case 1:
                            $('#robotLayer').css('cursor', 'nw-resize');
                            break;
                        case 2:
                            $('#robotLayer').css('cursor', 'ne-resize');
                            break;
                        case 3:
                            $('#robotLayer').css('cursor', 'se-resize');
                    }
                }
                else {
                    switch (i) {
                        case 0:
                        case 2:
                            $('#robotLayer').css('cursor', 'nesw-resize');
                            break;
                        case 1:
                        case 3:
                            $('#robotLayer').css('cursor', 'nwse-resize');
                            break;
                        default:
                    }
                }
                break;
            }
        }
        if (downCorner >= 0 && (selectedObstacle >= 0 || selectedColorArea >= 0)) {
            if (selectedObstacle >= 0) {
                resizeObject(obstacleList[selectedObstacle], downCorner);
                updateObstacleLayer();
            }
            else if (selectedColorArea >= 0) {
                resizeObject(colorAreaList[selectedColorArea], downCorner);
                updateColorAreaLayer();
            }
            return;
        }
        // move obstacles
        for (var i_1 = 0; i_1 < obstacleList.length; i_1++) {
            var obstacle = obstacleList[i_1];
            var hoverObstacle = false;
            if (obstacle.form === 'rectangle') {
                hoverObstacle = mouseX > obstacle.x && mouseX < obstacle.x + obstacle.w && mouseY > obstacle.y && mouseY < obstacle.y + obstacle.h;
            }
            else if (obstacle.form === 'triangle') {
                hoverObstacle = checkDownTriangle(mouseX, mouseY, obstacle.ax, obstacle.ay, obstacle.bx, obstacle.by, obstacle.cx, obstacle.cy);
            }
            else if (obstacle.form === 'circle') {
                hoverObstacle = checkDownCircle(mouseX, mouseY, obstacle.x, obstacle.y, obstacle.r);
            }
            if (hoverObstacle && !hoverCorners) {
                $('#robotLayer').css('cursor', 'pointer');
            }
            if (downObstacle === i_1 && selectedObstacle === i_1) {
                $('#robotLayer').css('cursor', 'pointer');
                switch (obstacle.form) {
                    case 'rectangle':
                    case 'circle':
                        obstacle.x += dx;
                        obstacle.y += dy;
                        break;
                    case 'triangle':
                        obstacle.ax += dx;
                        obstacle.ay += dy;
                        obstacle.bx += dx;
                        obstacle.by += dy;
                        obstacle.cx += dx;
                        obstacle.cy += dy;
                        break;
                    default:
                }
                highLightCorners = calculateCorners(obstacle);
                updateObstacleLayer();
                return;
            }
        }
        // move colorAreas
        for (var i_2 = 0; i_2 < colorAreaList.length; i_2++) {
            var colorArea = colorAreaList[i_2];
            var hoverColorArea = false;
            if (colorArea.form === 'rectangle') {
                hoverColorArea = mouseX > colorArea.x && mouseX < colorArea.x + colorArea.w && mouseY > colorArea.y && mouseY < colorArea.y + colorArea.h;
            }
            else if (colorArea.form === 'triangle') {
                hoverColorArea = checkDownTriangle(mouseX, mouseY, colorArea.ax, colorArea.ay, colorArea.bx, colorArea.by, colorArea.cx, colorArea.cy);
            }
            else if (colorArea.form === 'circle') {
                hoverColorArea = checkDownCircle(mouseX, mouseY, colorArea.x, colorArea.y, colorArea.r);
            }
            if (hoverColorArea && !hoverCorners) {
                $('#robotLayer').css('cursor', 'pointer');
            }
            if (downColorArea === i_2 && selectedColorArea === i_2) {
                $('#robotLayer').css('cursor', 'pointer');
                switch (colorArea.form) {
                    case 'rectangle':
                    case 'circle':
                        colorArea.x += dx;
                        colorArea.y += dy;
                        break;
                    case 'triangle':
                        colorArea.ax += dx;
                        colorArea.ay += dy;
                        colorArea.bx += dx;
                        colorArea.by += dy;
                        colorArea.cx += dx;
                        colorArea.cy += dy;
                        break;
                    default:
                }
                highLightCorners = calculateCorners(colorArea);
                updateColorAreaLayer();
                return;
            }
        }
        var hoverRuler = mouseX > ruler.x && mouseX < ruler.x + ruler.w && mouseY > ruler.y && mouseY < ruler.y + ruler.h;
        if (hoverRuler) {
            $('#robotLayer').css('cursor', 'pointer');
            if (downRuler) {
                ruler.x += dx;
                ruler.y += dy;
                scene.drawRuler();
                e.preventDefault();
                return;
            }
        }
        e.preventDefault();
    }
    var dist = 0;
    function handleMouseWheel(e) {
        var delta = 0;
        if (e.originalEvent.wheelDelta !== undefined) {
            delta = e.originalEvent.wheelDelta;
        }
        else {
            if (e.originalEvent.touches) {
                if (e.originalEvent.touches[0] && e.originalEvent.touches[1]) {
                    var diffX = e.originalEvent.touches[0].pageX - e.originalEvent.touches[1].pageX;
                    var diffY = e.originalEvent.touches[0].pageY - e.originalEvent.touches[1].pageY;
                    var newDist = diffX * diffX + diffY * diffY;
                    if (dist == 0) {
                        dist = newDist;
                        return;
                    }
                    else {
                        delta = newDist - dist;
                        dist = newDist;
                    }
                }
                else {
                    dist = 0;
                    return;
                }
            }
            else {
                delta = -e.originalEvent.deltaY;
            }
        }
        var zoom = false;
        if (delta > 0) {
            scale *= 1.025;
            if (scale > 2) {
                scale = 2;
            }
            zoom = true;
        }
        else if (delta < 0) {
            scale *= 0.925;
            if (scale < 0.25) {
                scale = 0.25;
            }
            zoom = true;
        }
        if (zoom) {
            scene.resizeBackgrounds(scale);
            scene.drawRuler();
            updateSelectedObjects();
            e.stopPropagation();
        }
    }
    function resizeAll() {
        if (!canceled) {
            canvasOffset = $('#simDiv').offset();
            offsetX = canvasOffset.left;
            offsetY = canvasOffset.top;
            scene.playground.w = $('#simDiv').outerWidth();
            scene.playground.h = $(window).height() - offsetY;
            ground.x = 10;
            ground.y = 10;
            ground.w = imgObjectList[currentBackground].width;
            ground.h = imgObjectList[currentBackground].height;
            var scaleX = scene.playground.w / (ground.w + 20);
            var scaleY = scene.playground.h / (ground.h + 20);
            scale = Math.min(scaleX, scaleY) - 0.05;
            scene.resizeBackgrounds(scale);
            scene.drawRuler();
            updateSelectedObjects();
        }
    }
    function updateSelectedObjects() {
        if (selectedObstacle >= 0) {
            scene.drawColorAreas([]);
            updateObstacleLayer();
            return;
        }
        if (selectedColorArea >= 0) {
            scene.drawObstacles([]);
            updateColorAreaLayer();
            return;
        }
        scene.drawObstacles([]);
        scene.drawColorAreas([]);
    }
    function addMouseEvents() {
        removeMouseEvents();
        $('#robotLayer').on('mousedown touchstart', function (e) {
            if (robots[robotIndex].handleMouseDown) {
                robots[robotIndex].handleMouseDown(e, offsetX, offsetY, scale, scene.playground.w / 2, scene.playground.h / 2);
            }
            else {
                handleMouseDown(e);
            }
        });
        $('#robotLayer').on('mousemove touchmove', function (e) {
            if (robots[robotIndex].handleMouseMove) {
                robots[robotIndex].handleMouseMove(e, offsetX, offsetY, scale, scene.playground.w / 2, scene.playground.h / 2);
            }
            else {
                handleMouseMove(e);
            }
        });
        $('#robotLayer').on('mouseup touchend', function (e) {
            if (robots[robotIndex].handleMouseUp) {
                robots[robotIndex].handleMouseUp(e, offsetX, offsetY, scale, scene.playground.w / 2, scene.playground.h / 2);
            }
            else {
                handleMouseUp(e);
            }
        });
        $('#robotLayer').on('mouseout touchcancel', function (e) {
            if (robots[robotIndex].handleMouseOut) {
                robots[robotIndex].handleMouseOut(e, offsetX, offsetY, scene.playground.w / 2, scene.playground.h / 2);
            }
            else {
                handleMouseOut(e);
            }
        });
        $('#simDiv').on('wheel mousewheel touchmove', function (e) {
            handleMouseWheel(e);
        });
        $('#canvasDiv').draggable();
        $('#robotLayer').attr('tabindex', 0);
        $('#robotLayer').on('click touchstart', function (e) {
            $('#robotLayer').attr('tabindex', 0);
            $('#robotLayer').focus();
            e.preventDefault();
        });
        $('#blocklyDiv').on('click touchstart', setFocusBlocklyDiv);
        $('#robotLayer').on('keydown', handleKeyEvent);
        $('#robotLayer').on('keyup', function () {
            if (selectedRobot >= 0 && robots[selectedRobot].drawWidth) {
                robots[selectedRobot].pose.xOld = robots[selectedRobot].pose.x;
                robots[selectedRobot].pose.yOld = robots[selectedRobot].pose.y;
                robots[selectedRobot].canDraw = true;
            }
        });
        $('#robotIndex').on('change', function (e) {
            $('#brick' + robotIndex).hide();
            robotIndex = e.target.selectedIndex;
            selectedRobot = e.target.selectedIndex;
            $('#brick' + robotIndex).show();
        });
    }
    function setFocusBlocklyDiv(e) {
        $('#blocklyDiv').attr('tabindex', 0);
        $('#blocklyDiv').focus();
        e.preventDefault();
    }
    function removeMouseEvents() {
        $('#robotLayer').off();
        $('#simDiv').off();
        $('#canvasDiv').off();
        $('#robotIndex').off();
        $('#blocklyDiv').off('click touchstart', setFocusBlocklyDiv);
    }
    function initScene() {
        scene = new simulation_scene_1.default(imgObjectList[currentBackground], robots, imgPattern, ruler);
        scene.drawRobots();
        resetSelection();
        addMouseEvents();
        disableChangeObjectButtons();
        if (robots[0].colorRange) {
            colorpicker = new HUEBEE('#colorpicker', {
                shades: 1,
                hues: 8,
                customColors: robots[0].colorRange,
                setText: false,
            });
            colorpicker.on('change', function (color) {
                changeColorWithColorPicker(color);
            });
            var close_1 = HUEBEE.prototype.close;
            HUEBEE.prototype.close = function () {
                $('.huebee__container').off('mouseup touchend', resetColorpickerCursor);
                close_1.apply(this);
            };
            var open_1 = HUEBEE.prototype.open;
            HUEBEE.prototype.open = function () {
                open_1.apply(this);
                $('.huebee__container').on('mouseup touchend', resetColorpickerCursor);
            };
        }
        for (var i = 0; i < numRobots; i++) {
            readyRobots[i] = true;
        }
        resizeAll();
        $(window).on('resize', resizeAll);
        $('#backgroundDiv').on('resize', resizeAll);
        render();
    }
    function getScale() {
        return scale;
    }
    exports.getScale = getScale;
    function getGround() {
        return ground;
    }
    exports.getGround = getGround;
    function getInfo() {
        return info;
    }
    exports.getInfo = getInfo;
    function isIE() {
        var ua = window.navigator.userAgent;
        var ie = ua.indexOf('MSIE ');
        var ie11 = ua.indexOf('Trident/');
        if (ie > -1 || ie11 > -1) {
            return true;
        }
        return false;
    }
    function isEdge() {
        var ua = window.navigator.userAgent;
        var edge = ua.indexOf('Edge');
        return edge > -1;
    }
    function importConfigData() {
        $('#backgroundFileSelector').val(null);
        $('#backgroundFileSelector').attr('accept', '.json');
        $('#backgroundFileSelector').clickWrap(); // opening dialog
        $('#backgroundFileSelector').change(function (event) {
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = (function (theFile) {
                return function (e) {
                    try {
                        var configData = JSON.parse(e.target.result);
                        relatives2coordinates(configData);
                        resetSelection();
                        resetScene(obstacleList || [], colorAreaList || []);
                        initScene();
                    }
                    catch (ex) {
                        MSG.displayPopupMessage('Blockly.Msg.POPUP_BACKGROUND_STORAGE', Blockly.Msg.POPUP_CONFIG_UPLOAD_ERROR);
                    }
                };
            })(file);
            reader.readAsText(file);
            event.preventDefault();
            event.stopPropagation();
        });
    }
    exports.importConfigData = importConfigData;
    function exportConfigData() {
        return coordinates2relatives();
    }
    exports.exportConfigData = exportConfigData;
    function coordinates2relatives() {
        var height = $('#unitBackgroundLayer').height();
        var width = $('#unitBackgroundLayer').width();
        var relatives = {};
        function calculateShape(object) {
            switch (object.form) {
                case 'rectangle':
                    return {
                        x: object.x / width,
                        y: object.y / height,
                        w: object.w / width,
                        h: object.h / height,
                        theta: object.theta,
                        color: object.color,
                        form: object.form,
                        type: object.type,
                    };
                case 'triangle':
                    return {
                        ax: object.ax / width,
                        ay: object.ay / height,
                        bx: object.bx / width,
                        by: object.by / height,
                        cx: object.cx / width,
                        cy: object.cy / height,
                        color: object.color,
                        form: object.form,
                        type: object.type,
                    };
                case 'circle':
                    return {
                        x: object.x / width,
                        y: object.y / height,
                        r: object.r / height / width,
                        color: object.color,
                        form: object.form,
                        type: object.type,
                        startAngle: 50,
                        endAngle: 0,
                    };
            }
        }
        relatives.robotPoses = robots.map(function (robot) {
            return {
                x: robot.pose.x / width,
                y: robot.pose.y / height,
                theta: robot.pose.theta,
                xOld: robot.pose.x / width,
                yOld: robot.pose.y / height,
                transX: 0,
                transY: 0,
                thetaOld: robot.pose.thetaOld,
                thetaDiff: 0,
            };
        });
        relatives.obstacles = obstacleList.map(function (object) {
            return calculateShape(object);
        });
        relatives.colorAreas = colorAreaList.map(function (object) {
            return calculateShape(object);
        });
        relatives.ruler = ruler;
        return relatives;
    }
    function relatives2coordinates(relatives) {
        var height = $('#unitBackgroundLayer').height();
        var width = $('#unitBackgroundLayer').width();
        function calculateShape(object) {
            switch (object.form) {
                case 'rectangle':
                    return {
                        x: object.x * width,
                        y: object.y * height,
                        w: object.w * width,
                        h: object.h * height,
                        theta: object.theta,
                        color: object.color,
                        form: object.form,
                        type: object.type,
                    };
                case 'triangle':
                    return {
                        ax: object.ax * width,
                        ay: object.ay * height,
                        bx: object.bx * width,
                        by: object.by * height,
                        cx: object.cx * width,
                        cy: object.cy * height,
                        color: object.color,
                        form: object.form,
                        type: object.type,
                    };
                case 'circle':
                    return {
                        x: object.x * width,
                        y: object.y * height,
                        r: object.r * height * width,
                        color: object.color,
                        form: object.form,
                        type: object.type,
                        startAngle: 50,
                        endAngle: 0,
                    };
            }
        }
        for (var i = 0; i < robots.length; i++) {
            if (relatives.robotPoses[i]) {
                robots[i].pose.x = relatives.robotPoses[i].x * width;
                robots[i].pose.y = relatives.robotPoses[i].y * height;
                robots[i].pose.theta = relatives.robotPoses[i].theta;
                robots[i].pose.xOld = relatives.robotPoses[i].xOld * width;
                robots[i].pose.yOld = relatives.robotPoses[i].yOld * height;
                robots[i].pose.thetaOld = relatives.robotPoses[i].thetaOld;
            }
        }
        obstacleList = relatives.obstacles.map(function (object) {
            return calculateShape(object);
        });
        colorAreaList = relatives.colorAreas.map(function (object) {
            return calculateShape(object);
        });
        ruler = relatives.ruler;
    }
    function resetScene(obstacleL, colorAreaL) {
        obstacleList = obstacleL;
        colorAreaList = colorAreaL;
        copiedObject = null;
    }
    exports.resetScene = resetScene;
    function importImage() {
        $('#backgroundFileSelector').val(null);
        $('#backgroundFileSelector').attr('accept', '.png, .jpg, .jpeg, .svg');
        $('#backgroundFileSelector').clickWrap(); // opening dialog
        $('#backgroundFileSelector').change(function (event) {
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = function (event) {
                var img = new Image();
                img.onload = function () {
                    var canvas = document.createElement('canvas');
                    var scaleX = 1;
                    var scaleY = 1;
                    // - 20 because of the border pattern which is 10 pixels wide on both sides
                    if (img.width > simulation_constants_1.default.MAX_WIDTH - 20) {
                        scaleX = (simulation_constants_1.default.MAX_WIDTH - 20) / img.width;
                    }
                    if (img.height > simulation_constants_1.default.MAX_HEIGHT - 20) {
                        scaleY = (simulation_constants_1.default.MAX_HEIGHT - 20) / img.height;
                    }
                    var scale = Math.min(scaleX, scaleY);
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    var ctx = canvas.getContext('2d');
                    ctx.scale(scale, scale);
                    ctx.drawImage(img, 0, 0);
                    var dataURL = canvas.toDataURL('image/png');
                    var image = new Image(canvas.width, canvas.height);
                    image.src = dataURL;
                    image.onload = function () {
                        if (customBackgroundLoaded) {
                            // replace previous image
                            imgObjectList[imgObjectList.length - 1] = image;
                        }
                        else {
                            imgObjectList[imgObjectList.length] = image;
                        }
                        setBackground(imgObjectList.length - 1);
                        initScene();
                    };
                    if (UTIL.isLocalStorageAvailable()) {
                        $('#show-message-confirm').oneWrap('shown.bs.modal', function (e) {
                            $('#confirm').off();
                            $('#confirm').on('click', function (e) {
                                e.preventDefault();
                                localStorage.setItem('customBackground', JSON.stringify({
                                    image: dataURL.replace(/^data:image\/(png|jpg);base64,/, ''),
                                    timestamp: new Date().getTime(),
                                }));
                            });
                            $('#confirmCancel').off();
                            $('#confirmCancel').on('click', function (e) {
                                e.preventDefault();
                            });
                        });
                        MSG.displayPopupMessage('Blockly.Msg.POPUP_BACKGROUND_STORAGE', Blockly.Msg.POPUP_BACKGROUND_STORAGE, Blockly.Msg.YES, Blockly.Msg.NO);
                    }
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
            return false;
        });
    }
    exports.importImage = importImage;
    function arrToRgb(values) {
        return 'rgb(' + values.join(', ') + ')';
    }
    function createRobots(reqRobot, numRobots) {
        $('#simRobotContent').empty();
        $('#simRobotModal').modal('hide');
        robots = [];
        if (numRobots >= 1) {
            var tempRobot = createRobot(reqRobot, configurations[0], 0, 0, interpreters[0].getRobotBehaviour());
            tempRobot.savedName = userPrograms[0].savedName;
            robots[0] = tempRobot;
            if (robots[0].brick) {
                $('#simRobotContent').append(robots[0].brick);
            }
            for (var i = 1; i < numRobots; i++) {
                var yOffset = 60 * Math.floor((i + 1) / 2) * Math.pow(-1, i);
                tempRobot = createRobot(reqRobot, configurations[i], i, yOffset, interpreters[i].getRobotBehaviour());
                tempRobot.savedName = userPrograms[i].savedName;
                var tempcolor = arrToRgb(colorsAdmissible[(i - 1) % colorsAdmissible.length]);
                tempRobot.geom.color = tempcolor;
                robots[i] = tempRobot;
                if (robots[i].brick) {
                    $('#simRobotContent').append(robots[i].brick);
                    $('#brick' + i).hide();
                }
            }
        }
        else {
            // should not happen
            // TODO throw exception
        }
    }
    function createRobot(reqRobot, configuration, num, optYOffset, robotBehaviour) {
        var yOffset = optYOffset || 0;
        var robot;
        if (currentBackground == 2) {
            robot = new reqRobot({
                x: 240,
                y: 200 + yOffset,
                theta: 0,
                xOld: 240,
                yOld: 200 + yOffset,
                transX: 0,
                transY: 0,
            }, configuration, num, robotBehaviour);
            robot.canDraw = false;
        }
        else if (currentBackground == 3) {
            robot = new reqRobot({
                x: 200,
                y: 200 + yOffset,
                theta: 0,
                xOld: 200,
                yOld: 200 + yOffset,
                transX: 0,
                transY: 0,
            }, configuration, num, robotBehaviour);
            robot.canDraw = true;
            robot.drawColor = '#000000';
            robot.drawWidth = 10;
        }
        else if (currentBackground == 4) {
            var robotY = 104 + yOffset;
            if (num >= 2) {
                robotY = 104 + 60 * (num - 1);
            }
            robot = new reqRobot({
                x: 70,
                y: robotY,
                theta: 0,
                xOld: 70,
                yOld: 104 + yOffset,
                transX: 0,
                transY: 0,
            }, configuration, num, robotBehaviour);
            robot.canDraw = false;
        }
        else if (currentBackground == 5) {
            robot = new reqRobot({
                x: 400,
                y: 50 + 60 * num,
                theta: 0,
                xOld: 400,
                yOld: 50 + yOffset,
                transX: 0,
                transY: 0,
            }, configuration, num, robotBehaviour);
            robot.canDraw = false;
        }
        else if (currentBackground == 6) {
            var robotY = 440 + yOffset;
            if (num > 2) {
                robotY = 440 - 60 * (num - 1);
            }
            robot = new reqRobot({
                x: 800,
                y: robotY,
                theta: -Math.PI / 2,
                xOld: 800,
                yOld: 440 + yOffset,
                transX: 0,
                transY: 0,
            }, configuration, num, robotBehaviour);
            robot.canDraw = false;
        }
        else if (currentBackground == 7) {
            var cx = imgObjectList[currentBackground].width / 2.0 + 10;
            var cy = imgObjectList[currentBackground].height / 2.0 + 10;
            robot = new reqRobot({
                x: cx,
                y: cy + yOffset,
                theta: 0,
                xOld: cx,
                yOld: cy + yOffset,
                transX: -cx,
                transY: -cy,
            }, configuration, num, robotBehaviour);
            robot.canDraw = true;
            robot.drawColor = '#ffffff';
            robot.drawWidth = 1;
        }
        else {
            var cx = imgObjectList[currentBackground].width / 2.0 + 10;
            var cy = imgObjectList[currentBackground].height / 2.0 + 10;
            robot = new reqRobot({
                x: cx,
                y: cy + yOffset,
                theta: 0,
                xOld: cx,
                yOld: cy + yOffset,
                transX: 0,
                transY: 0,
            }, configuration, num, robotBehaviour);
            robot.canDraw = false;
        }
        return robot;
    }
    function getWebAudio() {
        if (!this.webAudio) {
            this.webAudio = {};
            var AudioContext = window.AudioContext || window.webkitAudioContext || false;
            if (AudioContext) {
                this.webAudio.context = new AudioContext();
            }
            else {
                this.webAudio.context = null;
                this.webAudio.oscillator = null;
                console.log('Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox');
            }
        }
        return this.webAudio;
    }
    exports.getWebAudio = getWebAudio;
    /** adds/removes the ability for a block to be a breakpoint to a block */
    function updateBreakpointEvent() {
        if (debugMode) {
            Blockly.getMainWorkspace()
                .getAllBlocks()
                .forEach(function (block) {
                if (!$(block.svgGroup_).hasClass('blocklyDisabled')) {
                    if (observers.hasOwnProperty(block.id)) {
                        observers[block.id].disconnect();
                    }
                    var observer = new MutationObserver(function (mutations) {
                        mutations.forEach(function (mutation) {
                            if ($(block.svgGroup_).hasClass('blocklyDisabled')) {
                                removeBreakPoint(block);
                                $(block.svgPath_).removeClass('breakpoint').removeClass('selectedBreakpoint');
                            }
                            else {
                                if ($(block.svgGroup_).hasClass('blocklySelected')) {
                                    if ($(block.svgPath_).hasClass('breakpoint')) {
                                        removeBreakPoint(block);
                                        $(block.svgPath_).removeClass('breakpoint');
                                    }
                                    else if ($(block.svgPath_).hasClass('selectedBreakpoint')) {
                                        removeBreakPoint(block);
                                        $(block.svgPath_).removeClass('selectedBreakpoint').stop(true, true).animate({ 'fill-opacity': '1' }, 0);
                                    }
                                    else {
                                        breakpoints.push(block.id);
                                        $(block.svgPath_).addClass('breakpoint');
                                    }
                                }
                            }
                        });
                    });
                    observers[block.id] = observer;
                    observer.observe(block.svgGroup_, { attributes: true });
                }
            });
        }
        else {
            Blockly.getMainWorkspace()
                .getAllBlocks()
                .forEach(function (block) {
                if (observers.hasOwnProperty(block.id)) {
                    observers[block.id].disconnect();
                }
                $(block.svgPath_).removeClass('breakpoint');
            });
        }
    }
    function getDebugMode() {
        return debugMode;
    }
    exports.getDebugMode = getDebugMode;
    /** updates the debug mode for all interpreters */
    function updateDebugMode(mode) {
        debugMode = mode;
        if (interpreters !== null) {
            for (var i = 0; i < numRobots; i++) {
                interpreters[i].setDebugMode(mode);
            }
        }
        updateBreakpointEvent();
    }
    exports.updateDebugMode = updateDebugMode;
    /** removes breakpoint block */
    function removeBreakPoint(block) {
        for (var i = 0; i < breakpoints.length; i++) {
            if (breakpoints[i] === block.id) {
                breakpoints.splice(i, 1);
            }
        }
        if (!breakpoints.length > 0 && interpreters !== null) {
            for (var i = 0; i < numRobots; i++) {
                interpreters[i].removeEvent(simulation_constants_1.default.DEBUG_BREAKPOINT);
            }
        }
    }
    /** adds an event to the interpreters */
    function interpreterAddEvent(mode) {
        updateBreakpointEvent();
        if (interpreters !== null) {
            for (var i = 0; i < numRobots; i++) {
                interpreters[i].addEvent(mode);
            }
        }
    }
    exports.interpreterAddEvent = interpreterAddEvent;
    /** called to signify debugging is finished in simulation */
    function endDebugging() {
        if (interpreters !== null) {
            for (var i = 0; i < numRobots; i++) {
                interpreters[i].setDebugMode(false);
                interpreters[i].breakPoints = [];
            }
        }
        Blockly.getMainWorkspace()
            .getAllBlocks()
            .forEach(function (block) {
            $(block.svgPath_).stop(true, true).removeAttr('style');
        });
        breakpoints = [];
        debugMode = false;
        updateBreakpointEvent();
    }
    exports.endDebugging = endDebugging;
    /** returns the simulations variables */
    function getSimVariables() {
        if (interpreters !== null) {
            return interpreters[0].getVariables();
        }
        else {
            return {};
        }
    }
    exports.getSimVariables = getSimVariables;
    //http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    //http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    //requestAnimationFrame polyfill by Erik Möller
    //fixes from Paul Irish and Tino Zijdel
    (function () {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, frameRateMs - (currTime - lastTime));
                var id = window.setTimeout(function () {
                    callback();
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    })();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltdWxhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvc2ltdWxhdGlvbi9zaW11bGF0aW9uTG9naWMvc2ltdWxhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7Ozs7SUFpQkgsSUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUM7SUFDckMsSUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDO0lBQ2pDLElBQUksWUFBWSxDQUFDO0lBQ2pCLElBQUksS0FBSyxDQUFDO0lBQ1YsSUFBSSxZQUFZLENBQUM7SUFDakIsSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLElBQUksWUFBWSxDQUFDO0lBQ2pCLElBQUksT0FBTyxDQUFDO0lBQ1osSUFBSSxPQUFPLENBQUM7SUFDWixJQUFJLE1BQU0sQ0FBQztJQUNYLElBQUksTUFBTSxDQUFDO0lBQ1gsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkIsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMxQixJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzNCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN0QixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNuQixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN2QixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN0QixJQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUMxQixJQUFJLFFBQVEsQ0FBQztJQUNiLElBQUksY0FBYyxDQUFDO0lBQ25CLElBQUksWUFBWSxDQUFDO0lBQ2pCLElBQUksc0JBQXNCLEdBQUcsS0FBSyxDQUFDO0lBQ25DLElBQUks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