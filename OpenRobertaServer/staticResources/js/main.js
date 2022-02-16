require.config({
    baseUrl: 'js',
    paths: {
        codeflask: 'libs/codeflask/codeflask.min',
        blockly: '../blockly/blockly_compressed',
        bootstrap: 'libs/bootstrap/bootstrap-3.3.1-dist/dist/js/bootstrap.min',
        'bootstrap-table': 'libs/bootstrap/bootstrap-3.3.1-dist/dist/js/bootstrap-table.min',
        'bootstrap-tagsinput': 'libs/bootstrap/bootstrap-3.3.1-dist/dist/js/bootstrap-tagsinput.min',
        'bootstrap.wysiwyg': 'libs/bootstrap/bootstrap-3.3.1-dist/dist/js/bootstrap-wysiwyg.min',
        enjoyHint: 'libs/enjoyHint/enjoyhint.min',
        huebee: 'libs/huebee/huebee.min',
        jquery: 'libs/jquery/jquery-3.3.1.min',
        'jquery-scrollto': 'libs/jquery/jquery.scrollTo-2.1.2.min',
        'jquery-validate': 'libs/jquery/jquery.validate-1.17.0.min',
        'jquery-hotkeys': 'libs/jquery/jquery.hotkeys-0.2.0',
        slick: 'libs/slick/slick.min',
        'socket.io': 'libs/socket.io/socket.io',
        'volume-meter': 'libs/sound/volume-meter',
        'neuralnetwork-lib': 'libs/neuralnetwork/lib',
        d3: 'libs/neuralnetwork/d3.min',
        webots: 'libs/webots/webots.min',
        glm: 'libs/webots/glm-js.min',
        'webots.enum': 'libs/webots/enum',
        'webots.wren': 'libs/webots/wrenjs',
        'confDelete.controller': 'app/roberta/controller/confDelete.controller',
        'configuration.controller': 'app/roberta/controller/configuration.controller',
        'configuration.model': 'app/roberta/models/configuration.model',
        'confList.controller': 'app/roberta/controller/confList.controller',
        'confList.model': 'app/roberta/models/confList.model',
        'galleryList.controller': 'app/roberta/controller/galleryList.controller',
        'tutorialList.controller': 'app/roberta/controller/tutorialList.controller',
        'guiState.controller': 'app/roberta/controller/guiState.controller',
        'guiState.model': 'app/roberta/models/guiState.model',
        'import.controller': 'app/roberta/controller/import.controller',
        'language.controller': 'app/roberta/controller/language.controller',
        'legal.controller': 'app/roberta/controller/legal.controller',
        'logList.controller': 'app/roberta/controller/logList.controller',
        'logList.model': 'app/roberta/models/logList.model',
        'menu.controller': 'app/roberta/controller/menu.controller',
        'multSim.controller': 'app/roberta/controller/multSim.controller',
        'notification.controller': 'app/roberta/controller/notification.controller',
        'notification.model': 'app/roberta/models/notification.model',
        'nn.controller': 'app/roberta/controller/nn.controller',
        'progCode.controller': 'app/roberta/controller/progCode.controller',
        'progDelete.controller': 'app/roberta/controller/progDelete.controller',
        'progHelp.controller': 'app/roberta/controller/progHelp.controller',
        'progInfo.controller': 'app/roberta/controller/progInfo.controller',
        'progSim.controller': 'app/roberta/controller/progSim.controller',
        'progRun.controller': 'app/roberta/controller/progRun.controller',
        'progList.controller': 'app/roberta/controller/progList.controller',
        'progList.model': 'app/roberta/models/progList.model',
        'program.controller': 'app/roberta/controller/program.controller',
        'program.model': 'app/roberta/models/program.model',
        'progTutorial.controller': 'app/roberta/controller/progTutorial.controller',
        'progShare.controller': 'app/roberta/controller/progShare.controller',
        'progSim.controller': 'app/roberta/controller/progSim.controller',
        'robot.controller': 'app/roberta/controller/robot.controller',
        'robot.model': 'app/roberta/models/robot.model',
        'tour.controller': 'app/roberta/controller/tour.controller',
        'user.controller': 'app/roberta/controller/user.controller',
        'userGroup.controller': 'app/roberta/controller/userGroup.controller',
        'userGroup.model': 'app/roberta/models/userGroup.model',
        'user.model': 'app/roberta/models/user.model',
        'rest.robot': 'app/roberta/rest/robot',
        'socket.controller': 'app/roberta/controller/socket.controller',
        'webview.controller': 'app/roberta/controller/webview.controller',
        'sourceCodeEditor.controller': 'app/roberta/controller/sourceCodeEditor.controller',
        'simulation.constants': 'app/simulation/simulationLogic/constants',
        'simulation.math': 'app/simulation/simulationLogic/math',
        'simulation.robot': 'app/simulation/simulationLogic/robot',
        'simulation.robot.draw': 'app/simulation/simulationLogic/robot.draw',
        'simulation.robot.mbed': 'app/simulation/simulationLogic/robot.mbed',
        'simulation.robot.calliope': 'app/simulation/simulationLogic/robot.calliope',
        'simulation.robot.calliope2016': 'app/simulation/simulationLogic/robot.calliope2016',
        'simulation.robot.calliope2017': 'app/simulation/simulationLogic/robot.calliope2017',
        'simulation.robot.mbot': 'app/simulation/simulationLogic/robot.mbot',
        'simulation.robot.microbit': 'app/simulation/simulationLogic/robot.microbit',
        'simulation.robot.math': 'app/simulation/simulationLogic/robot.math',
        'simulation.robot.rescue': 'app/simulation/simulationLogic/robot.rescue',
        'simulation.robot.roberta': 'app/simulation/simulationLogic/robot.roberta',
        'simulation.robot.simple': 'app/simulation/simulationLogic/robot.simple',
        'simulation.robot.ev3': 'app/simulation/simulationLogic/robot.ev3',
        'simulation.robot.nxt': 'app/simulation/simulationLogic/robot.nxt',
        'simulation.scene': 'app/simulation/simulationLogic/scene',
        'simulation.simulation': 'app/simulation/simulationLogic/simulation',
        comm: 'helper/comm',
        log: 'helper/log',
        message: 'helper/msg',
        util: 'helper/util',
        wrap: 'helper/wrap',
        'interpreter.constants': 'app/nepostackmachine/interpreter.constants',
        'interpreter.interpreter': 'app/nepostackmachine/interpreter.interpreter',
        'interpreter.aRobotBehaviour': 'app/nepostackmachine/interpreter.aRobotBehaviour',
        'interpreter.robotWeDoBehaviour': 'app/nepostackmachine/interpreter.robotWeDoBehaviour',
        'interpreter.robotSimBehaviour': 'app/nepostackmachine/interpreter.robotSimBehaviour',
        'interpreter.state': 'app/nepostackmachine/interpreter.state',
        'interpreter.util': 'app/nepostackmachine/interpreter.util',
        'interpreter.jsHelper': 'app/nepostackmachine/interpreter.jsHelper',
        'neuralnetwork.nn': 'app/neuralnetwork/neuralnetwork.nn',
        'neuralnetwork.state': 'app/neuralnetwork/neuralnetwork.state',
        'neuralnetwork.playground': 'app/neuralnetwork/neuralnetwork.playground',
        confVisualization: 'app/configVisualization/confVisualization',
        'const.robots': 'app/configVisualization/const.robots',
        port: 'app/configVisualization/port',
        robotBlock: 'app/configVisualization/robotBlock',
        wires: 'app/configVisualization/wires',
        'webots.simulation': 'app/webotsSimulation/webots.simulation',
    },
    shim: {
        webots: {
            deps: ['glm', 'webots.enum', 'webots.wren'],
        },
        bootstrap: {
            deps: ['jquery'],
        },
        blockly: {
            exports: 'Blockly',
        },
        confVisualization: {
            deps: ['blockly'],
        },
        robotBlock: {
            deps: ['blockly'],
        },
        port: {
            deps: ['blockly'],
        },
        'volume-meter': {
            exports: 'Volume',
            init: function () {
                return {
                    createAudioMeter: createAudioMeter,
                };
            },
        },
        'jquery-validate': {
            deps: ['jquery'],
        },
    },
});
require([
    'require',
    'huebee',
    'wrap',
    'log',
    'jquery',
    'blockly',
    'guiState.controller',
    'progList.controller',
    'logList.controller',
    'confList.controller',
    'progDelete.controller',
    'confDelete.controller',
    'progShare.controller',
    'menu.controller',
    'multSim.controller',
    'user.controller',
    'nn.controller',
    'robot.controller',
    'program.controller',
    'progSim.controller',
    'notification.controller',
    'progCode.controller',
    'progDelete.controller',
    'progHelp.controller',
    'legal.controller',
    'progInfo.controller',
    'progRun.controller',
    'configuration.controller',
    'language.controller',
    'socket.controller',
    'progTutorial.controller',
    'tutorialList.controller',
    'userGroup.controller',
    'volume-meter',
    'user.model',
    'webview.controller',
    'sourceCodeEditor.controller',
    'codeflask',
    'interpreter.jsHelper',
    'confVisualization',
    'robotBlock',
], function (require) {
    $ = require('jquery');
    WRAP = require('wrap');
    LOG = require('log');
    COMM = require('comm');
    Blockly = require('blockly');
    confDeleteController = require('confDelete.controller');
    configurationController = require('configuration.controller');
    confListController = require('confList.controller');
    guiStateController = require('guiState.controller');
    languageController = require('language.controller');
    logListController = require('logList.controller');
    menuController = require('menu.controller');
    multSimController = require('multSim.controller');
    progDeleteController = require('progDelete.controller');
    progListController = require('progList.controller');
    galleryListController = require('galleryList.controller');
    tutorialListController = require('tutorialList.controller');
    legalController = require('legal.controller');
    programController = require('program.controller');
    progHelpController = require('progHelp.controller');
    progInfoController = require('progInfo.controller');
    notificationController = require('notification.controller');
    progCodeController = require('progCode.controller');
    progSimController = require('progSim.controller');
    progRunController = require('progRun.controller');
    progShareController = require('progShare.controller');
    robotController = require('robot.controller');
    userController = require('user.controller');
    nnController = require('nn.controller');
    userModel = require('user.model');
    socketController = require('socket.controller');
    tutorialController = require('progTutorial.controller');
    tutorialListController = require('tutorialList.controller');
    userGroupController = require('userGroup.controller');
    webviewController = require('webview.controller');
    sourceCodeEditorController = require('sourceCodeEditor.controller');
    codeflask = require('codeflask');
    stackmachineJsHelper = require('interpreter.jsHelper');
    confVisualization = require('confVisualization');
    robotBlock = require('robotBlock');
    $(document).ready(WRAP.wrapTotal(init, 'page init'));
});
/**
 * Initializations
 */
function init() {
    COMM.setErrorFn(handleServerErrors);
    $.when(languageController.init())
        .then(function (language) {
        return webviewController.init(language);
    })
        .then(function (language, opt_data) {
        return guiStateController.init(language, opt_data);
    })
        .then(function () {
        return robotController.init();
    })
        .then(function () {
        return userController.init();
    })
        .then(function () {
        galleryListController.init();
        tutorialListController.init();
        progListController.init();
        progDeleteController.init();
        confListController.init();
        confDeleteController.init();
        progShareController.init();
        logListController.init();
        legalController.init();
        sourceCodeEditorController.init();
        programController.init();
        configurationController.init();
        progHelpController.init();
        progInfoController.init();
        progCodeController.init();
        progSimController.init();
        progRunController.init();
        tutorialController.init();
        userGroupController.init();
        notificationController.init();
        menuController.init();
        // nnController.init();
        $('.cover').fadeOut(100, function () {
            if (guiStateController.getStartWithoutPopup()) {
                userModel.getStatusText(function (result) {
                    if (result.statustext[0] !== '' && result.statustext[1] !== '') {
                        $('#modal-statustext').modal('show');
                    }
                });
            }
            else {
                $('#show-startup-message').modal('show');
            }
        });
        $('.pace').fadeOut(500);
    });
}
/**
 * Handle server errors
 */
ALLOWED_PING_NUM = 5;
function handleServerErrors(jqXHR) {
    // TODO more?
    LOG.error('Client connection issue: ' + jqXHR.status);
    if (this.url === '/rest/ping') {
        COMM.errorNum += 1;
    }
    // show message, if REST call is no ping or EXACTLY ALLOWED_PING_NUM requests fail (to avoid multiple messages)
    if (this.url !== '/rest/ping' || COMM.errorNum == ALLOWED_PING_NUM) {
        if (jqXHR.status && jqXHR.status < 500) {
            COMM.showServerError('FRONTEND');
        }
        else {
            COMM.showServerError('CONNECTION');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDWCxPQUFPLEVBQUUsSUFBSTtJQUNiLEtBQUssRUFBRTtRQUNILFNBQVMsRUFBRSw4QkFBOEI7UUFDekMsT0FBTyxFQUFFLCtCQUErQjtRQUN4QyxTQUFTLEVBQUUsMkRBQTJEO1FBQ3RFLGlCQUFpQixFQUFFLGlFQUFpRTtRQUNwRixxQkFBcUIsRUFBRSxxRUFBcUU7UUFDNUYsbUJBQW1CLEVBQUUsbUVBQW1FO1FBQ3hGLFNBQVMsRUFBRSw4QkFBOEI7UUFDekMsTUFBTSxFQUFFLHdCQUF3QjtRQUNoQyxNQUFNLEVBQUUsOEJBQThCO1FBQ3RDLGlCQUFpQixFQUFFLHVDQUF1QztRQUMxRCxpQkFBaUIsRUFBRSx3Q0FBd0M7UUFDM0QsZ0JBQWdCLEVBQUUsa0NBQWtDO1FBQ3BELEtBQUssRUFBRSxzQkFBc0I7UUFDN0IsV0FBVyxFQUFFLDBCQUEwQjtRQUN2QyxjQUFjLEVBQUUseUJBQXlCO1FBQ3pDLG1CQUFtQixFQUFFLHdCQUF3QjtRQUM3QyxFQUFFLEVBQUUsMkJBQTJCO1FBQy9CLE1BQU0sRUFBRSx3QkFBd0I7UUFDaEMsR0FBRyxFQUFFLHdCQUF3QjtRQUM3QixhQUFhLEVBQUUsa0JBQWtCO1FBQ2pDLGFBQWEsRUFBRSxvQkFBb0I7UUFFbkMsdUJBQXVCLEVBQUUsOENBQThDO1FBQ3ZFLDBCQUEwQixFQUFFLGlEQUFpRDtRQUM3RSxxQkFBcUIsRUFBRSx3Q0FBd0M7UUFDL0QscUJBQXFCLEVBQUUsNENBQTRDO1FBQ25FLGdCQUFnQixFQUFFLG1DQUFtQztRQUNyRCx3QkFBd0IsRUFBRSwrQ0FBK0M7UUFDekUseUJBQXlCLEVBQUUsZ0RBQWdEO1FBQzNFLHFCQUFxQixFQUFFLDRDQUE0QztRQUNuRSxnQkFBZ0IsRUFBRSxtQ0FBbUM7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