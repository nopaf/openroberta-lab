define(["require", "exports", "util", "message", "guiState.model", "progHelp.controller", "legal.controller", "webview.controller", "confVisualization", "socket.controller", "jquery", "blockly"], function (require, exports, UTIL, MSG, GUISTATE, HELP_C, LEGAL_C, WEBVIEW_C, CV, SOCKET_C, $, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLegalTextsMap = exports.updateTutorialMenu = exports.updateMenuStatus = exports.setWebview = exports.inWebview = exports.getTheme = exports.getAvailableHelp = exports.getSocket = exports.setSocket = exports.getPingTime = exports.setPingTime = exports.doPing = exports.setPing = exports.isProgramToDownload = exports.setProgramToDownload = exports.getCommandLine = exports.getSignature = exports.getVendor = exports.getConnection = exports.getConnectionTypeEnum = exports.getListOfTutorials = exports.getWebotsUrl = exports.hasWebotsSim = exports.hasMultiSim = exports.hasSim = exports.checkSim = exports.setConfiguration = exports.setProgram = exports.setLogout = exports.setLogin = exports.getUserUserGroupOwner = exports.getUserUserGroup = exports.isUserMemberOfUserGroup = exports.isUserAccountActivated = exports.getUserAccountName = exports.getUserName = exports.isPublicServerVersion = exports.getServerVersion = exports.setStartWithoutPopup = exports.getStartWithoutPopup = exports.getConfigurationConf = exports.getProgramProg = exports.getConfigurationToolbox = exports.getProgramToolbox = exports.getRobots = exports.getProgramXML = exports.setProgramXML = exports.getConfigurationXML = exports.setConfigurationXML = exports.setRobotToken = exports.getRobotFWName = exports.setDefaultRobot = exports.getDefaultRobot = exports.getConfToolbox = exports.getToolbox = exports.getProgramToolboxLevel = exports.setProgramToolboxLevel = exports.setConfigurationNameDefault = exports.setConfigurationName = exports.getConfigurationName = exports.setProgramShareRelation = exports.getProgramShareRelation = exports.setProgramAuthorName = exports.getProgramAuthorName = exports.setProgramOwnerName = exports.getProgramOwnerName = exports.setProgramName = exports.getProgramName = exports.setProgramTimestamp = exports.getProgramTimestamp = exports.isUserLoggedIn = exports.getBinaryFileExtension = exports.getSourceCodeFileExtension = exports.getProgramSource = exports.setProgramSource = exports.getProgramShared = exports.setConfigurationSaved = exports.isConfigurationSaved = exports.setProgramSaved = exports.isProgramSaved = exports.getLanguage = exports.setLanguage = exports.getPrevView = exports.getView = exports.setView = exports.hasRobotDefaultFirmware = exports.getRobotVersion = exports.getRobotState = exports.getRobotBattery = exports.getRobotName = exports.getRobotTime = exports.isRobotDisconnected = exports.isConfigurationUsed = exports.isRobotConnected = exports.getRobotInfoEN = exports.getRobotInfoDE = exports.getIsRobotBeta = exports.getMenuRobotRealName = exports.getRobotRealName = exports.getRobotPort = exports.setRobotPort = exports.getRobotGroup = exports.getRobot = exports.setRunEnabled = exports.isRunEnabled = exports.setConnectionState = exports.findRobot = exports.findGroup = exports.setKioskMode = exports.setRobot = exports.setBricklyWorkspace = exports.getBricklyWorkspace = exports.setBlocklyWorkspace = exports.getBlocklyWorkspace = exports.setIsAgent = exports.getIsAgent = exports.setState = exports.isKioskMode = exports.isConfigurationAnonymous = exports.getConfigurationStandardName = exports.isConfigurationStandard = exports.isProgramWritable = exports.isProgramStandard = exports.setInitialState = exports.init = void 0;
    var LONG = 300000; // Ping time 5min
    var SHORT = 3000; // Ping time 3sec
    /**
     * Init robot
     */
    function init(language, opt_data) {
        var ready = $.Deferred();
        $.when(GUISTATE.init()).then(function () {
            GUISTATE.gui.webview = opt_data || false;
            if (GUISTATE.gui.webview) {
                $('.logo').css({
                    right: '32px',
                });
            }
            GUISTATE.gui.view = 'tabProgram';
            GUISTATE.gui.prevView = 'tabProgram';
            GUISTATE.gui.language = language;
            GUISTATE.gui.startWithoutPopup = false;
            GUISTATE.gui.robot = GUISTATE.server.defaultRobot;
            GUISTATE.gui.defaultRobot = GUISTATE.server.defaultRobot;
            GUISTATE.user.id = -1;
            GUISTATE.user.accountName = '';
            GUISTATE.user.name = '';
            GUISTATE.robot.name = '';
            GUISTATE.robot.robotPort = '';
            GUISTATE.robot.socket = null;
            GUISTATE.gui.isAgent = true;
            //GUISTATE.socket.portNames = [];
            //GUISTATE.socket.vendorIds = [];
            GUISTATE.program.toolbox.level = 'beginner';
            setProgramOwnerName(null);
            setProgramAuthorName(null);
            setProgramShareRelation(null);
            setProgramName('NEPOprog');
            if (GUISTATE.server.theme !== 'default') {
                var themePath = '../theme/' + GUISTATE.server.theme + '.json';
                $.getJSON(themePath)
                    .done(function (data) {
                    // store new theme properties (only colors so far)
                    GUISTATE.server.theme = data;
                })
                    .fail(function (e, r) {
                    // this should not happen
                    console.error('"' + themePath + '" is not a valid json file! The reason is probably a', r);
                    GUISTATE.server.theme = 'default';
                });
            }
            ready.resolve();
        });
        return ready.promise();
    }
    exports.init = init;
    function setInitialState() {
        // User not logged in?
        $('.nav > li > ul > .login').addClass('disabled');
        $('#head-navi-icon-user').addClass('error');
        // Toolbox?
        $('.level').removeClass('disabled');
        $('.level.' + GUISTATE.program.toolbox.level).addClass('disabled');
        // View?
        if (GUISTATE.gui.view === 'tabProgram') {
            $('#head-navigation-configuration-edit').css('display', 'none');
            GUISTATE.gui.blocklyWorkspace.markFocused();
        }
        else if (GUISTATE.gui.view === 'tabConfiguration') {
            $('#head-navigation-program-edit').css('display', 'none');
            GUISTATE.gui.bricklyWorkspace.markFocused();
        }
        // Robot?
        $('#menu-' + GUISTATE.gui.robot)
            .parent()
            .addClass('disabled');
        // Tutorials?
        updateTutorialMenu();
    }
    exports.setInitialState = setInitialState;
    /**
     * Check if a program is a standard program or not
     *
     */
    function isProgramStandard() {
        return GUISTATE.program.name == 'NEPOprog';
    }
    exports.isProgramStandard = isProgramStandard;
    function isProgramWritable() {
        if (GUISTATE.program.shared == 'WRITE') {
            return true;
        }
        else if (GUISTATE.program.shared == 'READ') {
            return false;
        }
        return true;
    }
    exports.isProgramWritable = isProgramWritable;
    function isConfigurationStandard() {
        return GUISTATE.configuration.name == getRobotGroup().toUpperCase() + 'basis';
    }
    exports.isConfigurationStandard = isConfigurationStandard;
    function getConfigurationStandardName() {
        return getRobotGroup().toUpperCase() + 'basis';
    }
    exports.getConfigurationStandardName = getConfigurationStandardName;
    function isConfigurationAnonymous() {
        return GUISTATE.configuration.name == '';
    }
    exports.isConfigurationAnonymous = isConfigurationAnonymous;
    function isKioskMode() {
        return GUISTATE.kiosk && GUISTATE.kiosk === true;
    }
    exports.isKioskMode = isKioskMode;
    function setState(result) {
        if (result['server.version']) {
            GUISTATE.server.version = result['server.version'];
        }
        if (result['robot.version']) {
            GUISTATE.robot.version = result['robot.version'];
        }
        if (result['robot.firmwareName'] != undefined) {
            GUISTATE.robot.fWName = result['robot.firmwareName'];
        }
        else {
            GUISTATE.robot.fWName = '';
        }
        if (result['robot.wait'] != undefined) {
            GUISTATE.robot.time = result['robot.wait'];
        }
        else {
            GUISTATE.robot.time = -1;
        }
        if (result['robot.battery'] != undefined) {
            GUISTATE.robot.battery = result['robot.battery'];
        }
        else {
            GUISTATE.robot.battery = '';
        }
        if (result['robot.name'] != undefined) {
            GUISTATE.robot.name = result['robot.name'];
        }
        else {
            GUISTATE.robot.name = '';
        }
        if (result['robot.state'] != undefined) {
            GUISTATE.robot.state = result['robot.state'];
        }
        else {
            GUISTATE.robot.state = '';
        }
        if (result['robot.sensorvalues'] != undefined) {
            GUISTATE.robot.sensorValues = result['robot.sensorvalues'];
        }
        else {
            GUISTATE.robot.sensorValues = '';
        }
        if (result['robot.nepoexitvalue'] != undefined) {
            //TODO: For different robots we have different error messages
            if (result['robot.nepoexitvalue'] !== GUISTATE.robot.nepoExitValue) {
                GUISTATE.nepoExitValue = result['robot.nepoexitvalue'];
                if (GUISTATE.nepoExitValue !== 143 && GUISTATE.robot.nepoExitValue !== 0) {
                    MSG.displayMessage('POPUP_PROGRAM_TERMINATED_UNEXPECTED', 'POPUP', '');
                }
            }
        }
        if (GUISTATE.user.accountName) {
            $('#iconDisplayLogin').removeClass('error');
            $('#iconDisplayLogin').addClass('ok');
        }
        else {
            $('#iconDisplayLogin').removeClass('ok');
            $('#iconDisplayLogin').addClass('error');
        }
        var connectionType = getConnection();
        switch (getConnection()) {
            case GUISTATE.gui.connectionType.AGENTORTOKEN:
                if (GUISTATE.gui.isAgent === true) {
                    break;
                }
            case GUISTATE.gui.connectionType.TOKEN:
                $('#menuConnect').parent().removeClass('disabled');
                if (GUISTATE.robot.state === 'wait') {
                    $('#head-navi-icon-robot').removeClass('error');
                    $('#head-navi-icon-robot').removeClass('busy');
                    $('#head-navi-icon-robot').addClass('wait');
                    setRunEnabled(true);
                    $('#runSourceCodeEditor').removeClass('disabled');
                }
                else if (GUISTATE.robot.state === 'busy') {
                    $('#head-navi-icon-robot').removeClass('wait');
                    $('#head-navi-icon-robot').removeClass('error');
                    $('#head-navi-icon-robot').addClass('busy');
                    setRunEnabled(false);
                    $('#runSourceCodeEditor').addClass('disabled');
                }
                else {
                    $('#head-navi-icon-robot').removeClass('busy');
                    $('#head-navi-icon-robot').removeClass('wait');
                    $('#head-navi-icon-robot').addClass('error');
                    setRunEnabled(false);
                    $('#runSourceCodeEditor').addClass('disabled');
                }
                break;
            case GUISTATE.gui.connectionType.AUTO:
                break;
            case GUISTATE.gui.connectionType.LOCAL:
                break;
            case GUISTATE.gui.connectionType.JSPLAY:
                break;
            case GUISTATE.gui.connectionType.AGENT:
                break;
            case GUISTATE.gui.connectionType.WEBVIEW:
                break;
            default:
                break;
        }
    }
    exports.setState = setState;
    function getIsAgent() {
        return GUISTATE.gui.isAgent;
    }
    exports.getIsAgent = getIsAgent;
    function setIsAgent(isAgent) {
        GUISTATE.gui.isAgent = isAgent;
    }
    exports.setIsAgent = setIsAgent;
    function getBlocklyWorkspace() {
        return GUISTATE.gui.blocklyWorkspace;
    }
    exports.getBlocklyWorkspace = getBlocklyWorkspace;
    function setBlocklyWorkspace(workspace) {
        GUISTATE.gui.blocklyWorkspace = workspace;
    }
    exports.setBlocklyWorkspace = setBlocklyWorkspace;
    function getBricklyWorkspace() {
        return GUISTATE.gui.bricklyWorkspace;
    }
    exports.getBricklyWorkspace = getBricklyWorkspace;
    function setBricklyWorkspace(workspace) {
        GUISTATE.gui.bricklyWorkspace = workspace;
    }
    exports.setBricklyWorkspace = setBricklyWorkspace;
    function setRobot(robot, result, opt_init) {
        // make sure we use the group instead of the specific robottype if the robot belongs to a group
        var robotGroup = findGroup(robot);
        GUISTATE.gui.program = result.program;
        GUISTATE.gui.configuration = result.configuration;
        GUISTATE.gui.sim = result.sim;
        GUISTATE.gui.multipleSim = result.multipleSim;
        GUISTATE.gui.webotsSim = result.webotsSim;
        GUISTATE.gui.webotsUrl = result.webotsUrl;
        GUISTATE.gui.neuralNetwork = result.neuralNetwork === undefined ? false : result.neuralNetwork;
        GUISTATE.gui.connection = result.connection;
        GUISTATE.gui.vendor = result.vendor;
        GUISTATE.gui.signature = result.signature;
        GUISTATE.gui.commandLine = result.commandLine;
        GUISTATE.gui.configurationUsed = result.configurationUsed;
        GUISTATE.gui.sourceCodeFileExtension = result.sourceCodeFileExtension;
        GUISTATE.gui.binaryFileExtension = result.binaryFileExtension;
        GUISTATE.gui.hasWlan = result.hasWlan;
        GUISTATE.gui.firmwareDefault = result.firmwareDefault;
        $('#blocklyDiv, #bricklyDiv').css('background', 'url(../../../../css/img/' + robotGroup + 'Background.jpg) repeat');
        $('#blocklyDiv, #bricklyDiv').css('background-size', '100%');
        $('#blocklyDiv, #bricklyDiv').css('background-position', 'initial');
        if (!isConfigurationUsed()) {
            $('#bricklyDiv').css('background', 'url(../../../../css/img/' + robotGroup + 'BackgroundConf.svg) no-repeat');
            $('#bricklyDiv').css('background-position', 'center');
            $('#bricklyDiv').css('background-size', '75% auto');
        }
        else if (CV.CircuitVisualization.isRobotVisualized(robotGroup, robot)) {
            $('#bricklyDiv').css('background', '');
            $('#bricklyDiv').css('background-position', '');
            $('#bricklyDiv').css('background-size', '');
        }
        $('.robotType').removeClass('disabled');
        $('.robotType.' + robot).addClass('disabled');
        $('#head-navi-icon-robot').removeClass('typcn-open');
        $('#head-navi-icon-robot').removeClass('typcn-' + GUISTATE.gui.robotGroup);
        $('#head-navi-icon-robot').addClass('typcn-' + robotGroup);
        checkSim();
        setProgramOwnerName(null);
        setProgramAuthorName(null);
        setProgramShareRelation(null);
        if (!opt_init) {
            setProgramSaved(true);
            setConfigurationSaved(true);
            if (findGroup(robot) != getRobotGroup()) {
                setConfigurationName(robotGroup.toUpperCase() + 'basis');
                setProgramName('NEPOprog');
            }
        }
        else {
            setConfigurationName(robotGroup.toUpperCase() + 'basis');
            setProgramName('NEPOprog');
        }
        $('#simRobot').removeClass('typcn-' + GUISTATE.gui.robotGroup);
        $('#simRobot').addClass('typcn-' + robotGroup);
        var connectionType = getConnection();
        $('#robotConnect').removeClass('disabled');
        switch (getConnection()) {
            case GUISTATE.gui.connectionType.TOKEN:
                SOCKET_C.listRobotStop();
                $('#head-navi-icon-robot').removeClass('error');
                $('#head-navi-icon-robot').removeClass('busy');
                $('#head-navi-icon-robot').removeClass('wait');
                setRunEnabled(false);
                $('#runSourceCodeEditor').addClass('disabled');
                $('#menuConnect').parent().removeClass('disabled');
                setPingTime(SHORT);
                break;
            case GUISTATE.gui.connectionType.LOCAL:
            case GUISTATE.gui.connectionType.AUTO:
            case GUISTATE.gui.connectionType.JSPLAY:
                SOCKET_C.listRobotStop();
                $('#head-navi-icon-robot').removeClass('error');
                $('#head-navi-icon-robot').removeClass('busy');
                $('#head-navi-icon-robot').addClass('wait');
                setRunEnabled(true);
                $('#runSourceCodeEditor').removeClass('disabled');
                $('#menuConnect').parent().addClass('disabled');
                setPingTime(LONG);
                break;
            case GUISTATE.gui.connectionType.AGENTORTOKEN:
                SOCKET_C.listRobotStart();
                if (GUISTATE.gui.isAgent == true) {
                    updateMenuStatus();
                }
                else {
                    $('#menuConnect').parent().removeClass('disabled');
                }
                $('#runSourceCodeEditor').addClass('disabled');
                setPingTime(SHORT);
                break;
            case GUISTATE.gui.connectionType.WEBVIEW:
                SOCKET_C.listRobotStop();
                $('#head-navi-icon-robot').removeClass('error');
                $('#head-navi-icon-robot').removeClass('busy');
                $('#head-navi-icon-robot').removeClass('wait');
                setRunEnabled(false);
                $('#menuConnect').parent().removeClass('disabled');
                // are we in an Open Roberta Webview
                if (inWebview()) {
                    $('#robotConnect').removeClass('disabled');
                }
                else {
                    $('#robotConnect').addClass('disabled');
                }
                $('#runSourceCodeEditor').addClass('disabled');
                setPingTime(LONG);
                break;
            default:
                setPingTime(SHORT);
                break;
        }
        var groupSwitched = false;
        if (findGroup(robot) != getRobotGroup()) {
            groupSwitched = true;
        }
        if (GUISTATE.gui.firmwareDefault === undefined) {
            $('#robotDefaultFirmware').addClass('hidden');
        }
        else {
            $('#robotDefaultFirmware').removeClass('hidden');
        }
        GUISTATE.gui.robot = robot;
        GUISTATE.gui.robotGroup = robotGroup;
        var value = Blockly.Msg.MENU_START_BRICK;
        if (value.indexOf('$') >= 0) {
            value = value.replace('$', getRobotRealName());
        }
        $('#menuRunProg').html(value);
        if (GUISTATE.gui.blocklyWorkspace) {
            GUISTATE.gui.blocklyWorkspace.robControls.refreshTooltips(getRobotRealName());
        }
        if (groupSwitched) {
            HELP_C.initView();
            if (inWebview()) {
                WEBVIEW_C.setRobotBehaviour();
                WEBVIEW_C.jsToAppInterface({
                    target: 'internal',
                    type: 'setRobot',
                    robot: robotGroup,
                });
            }
        }
        if (GUISTATE.gui.hasWlan) {
            $('#robotWlan').removeClass('hidden');
        }
        else {
            $('#robotWlan').addClass('hidden');
        }
        UTIL.clearTabAlert('tabConfiguration'); // also clear tab alert when switching robots
    }
    exports.setRobot = setRobot;
    function setKioskMode(kiosk) {
        GUISTATE.kiosk = kiosk;
    }
    exports.setKioskMode = setKioskMode;
    function findGroup(robot) {
        var robots = getRobots();
        for (var propt in robots) {
            if (robots[propt].name == robot && robots[propt].group !== '') {
                robot = robots[propt].group;
                return robot;
            }
        }
        return robot;
    }
    exports.findGroup = findGroup;
    function findRobot(group) {
        var robots = getRobots();
        var robot;
        for (robot in robots) {
            if (robots[robot].group === group) {
                return robots[robot].name;
                break;
            }
        }
        return null;
    }
    exports.findRobot = findRobot;
    function setConnectionState(state) {
        switch (state) {
            case 'busy':
                $('#head-navi-icon-robot').removeClass('error');
                $('#head-navi-icon-robot').removeClass('wait');
                $('#head-navi-icon-robot').addClass('busy');
                setRunEnabled(false);
                break;
            case 'error':
                $('#head-navi-icon-robot').removeClass('busy');
                $('#head-navi-icon-robot').removeClass('wait');
                $('#head-navi-icon-robot').addClass('error');
                setRunEnabled(false);
                break;
            case 'wait':
                if (isRobotConnected()) {
                    $('#head-navi-icon-robot').removeClass('busy');
                    $('#head-navi-icon-robot').removeClass('error');
                    $('#head-navi-icon-robot').addClass('wait');
                    setRunEnabled(true);
                }
                else {
                    setConnectionState('error');
                }
                break;
            default:
                break;
        }
    }
    exports.setConnectionState = setConnectionState;
    function isRunEnabled() {
        return GUISTATE.gui.runEnabled;
    }
    exports.isRunEnabled = isRunEnabled;
    function setRunEnabled(running) {
        running ? true : false;
        GUISTATE.gui.runEnabled = running;
        if (running) {
            GUISTATE.gui.blocklyWorkspace && GUISTATE.gui.blocklyWorkspace.robControls.enable('runOnBrick');
            $('.menuRunProg, #runSourceCodeEditor').removeClass('disabled');
        }
        else {
            GUISTATE.gui.blocklyWorkspace && GUISTATE.gui.blocklyWorkspace.robControls.disable('runOnBrick');
            $('.menuRunProg, #runSourceCodeEditor').addClass('disabled');
        }
    }
    exports.setRunEnabled = setRunEnabled;
    function getRobot() {
        return GUISTATE.gui.robot;
    }
    exports.getRobot = getRobot;
    function getRobotGroup() {
        return GUISTATE.gui.robotGroup;
    }
    exports.getRobotGroup = getRobotGroup;
    function setRobotPort(port) {
        GUISTATE.robot.robotPort = port;
    }
    exports.setRobotPort = setRobotPort;
    function getRobotPort() {
        return GUISTATE.robot.robotPort;
    }
    exports.getRobotPort = getRobotPort;
    function getRobotRealName() {
        for (var robot in getRobots()) {
            if (!getRobots().hasOwnProperty(robot)) {
                continue;
            }
            if (getRobots()[robot].name == getRobot()) {
                return getRobots()[robot].realName;
            }
        }
        return getRobot();
    }
    exports.getRobotRealName = getRobotRealName;
    function getMenuRobotRealName(robotName) {
        for (var robot in getRobots()) {
            if (!getRobots().hasOwnProperty(robot)) {
                continue;
            }
            if (getRobots()[robot].name == robotName) {
                return getRobots()[robot].realName;
            }
        }
        return 'Robot not found';
    }
    exports.getMenuRobotRealName = getMenuRobotRealName;
    function getIsRobotBeta(robotName) {
        for (var robot in getRobots()) {
            if (!getRobots().hasOwnProperty(robot)) {
                continue;
            }
            if (getRobots()[robot].name == robotName && getRobots()[robot].beta == true) {
                return true;
            }
        }
        return false;
    }
    exports.getIsRobotBeta = getIsRobotBeta;
    function getRobotInfoDE(robotName) {
        for (var robot in getRobots()) {
            if (!getRobots().hasOwnProperty(robot)) {
                continue;
            }
            if (getRobots()[robot].name == robotName) {
                return getRobots()[robot].infoDE;
            }
        }
        return '#';
    }
    exports.getRobotInfoDE = getRobotInfoDE;
    function getRobotInfoEN(robotName) {
        for (var robot in getRobots()) {
            if (!getRobots().hasOwnProperty(robot)) {
                continue;
            }
            if (getRobots()[robot].name == robotName) {
                return getRobots()[robot].infoEN;
            }
        }
        return '#';
    }
    exports.getRobotInfoEN = getRobotInfoEN;
    function isRobotConnected() {
        if (GUISTATE.robot.time > 0) {
            return true;
        }
        if (GUISTATE.gui.connection === GUISTATE.gui.connectionType.AUTO ||
            GUISTATE.gui.connection === GUISTATE.gui.connectionType.LOCAL ||
            GUISTATE.gui.connectionType.JSPLAY) {
            return true;
        }
        if (GUISTATE.gui.connection === GUISTATE.gui.connectionType.AGENTORTOKEN) {
            return true;
        }
        if (GUISTATE.gui.connection === GUISTATE.gui.connectionType.WEBVIEW && WEBVIEW_C.isRobotConnected()) {
            return true;
        }
        return false;
    }
    exports.isRobotConnected = isRobotConnected;
    function isConfigurationUsed() {
        return GUISTATE.gui.configurationUsed;
    }
    exports.isConfigurationUsed = isConfigurationUsed;
    function isRobotDisconnected() {
        return (GUISTATE.robot.time = -1);
    }
    exports.isRobotDisconnected = isRobotDisconnected;
    function getRobotTime() {
        return GUISTATE.robot.time;
    }
    exports.getRobotTime = getRobotTime;
    function getRobotName() {
        return GUISTATE.robot.name;
    }
    exports.getRobotName = getRobotName;
    function getRobotBattery() {
        return GUISTATE.robot.battery;
    }
    exports.getRobotBattery = getRobotBattery;
    function getRobotState() {
        return GUISTATE.robot.state;
    }
    exports.getRobotState = getRobotState;
    function getRobotVersion() {
        return GUISTATE.robot.version;
    }
    exports.getRobotVersion = getRobotVersion;
    function hasRobotDefaultFirmware() {
        return GUISTATE.gui.firmwareDefault;
    }
    exports.hasRobotDefaultFirmware = hasRobotDefaultFirmware;
    function setView(view) {
        $('#head-navi-tooltip-program').attr('data-toggle', 'dropdown');
        $('#head-navi-tooltip-configuration').attr('data-toggle', 'dropdown');
        $('#head-navi-tooltip-robot').attr('data-toggle', 'dropdown');
        $('#head-navigation-program-edit').removeClass('disabled');
        $('.robotType').removeClass('disabled');
        $('#head-navigation-configuration-edit').removeClass('disabled');
        $('.modal').modal('hide');
        GUISTATE.gui.prevView = GUISTATE.gui.view;
        GUISTATE.gui.view = view;
        if (!isRobotConnected()) {
            setRunEnabled(false);
            $('#runSourceCodeEditor').addClass('disabled');
        }
        if ($('.rightMenuButton.rightActive')) {
            $('.rightMenuButton.rightActive').clickWrap();
        }
        if (view === 'tabConfiguration') {
            $('#head-navigation-program-edit').css('display', 'none');
            $('#head-navigation-configuration-edit').css('display', 'inline');
            $('#menuTabProgram').parent().removeClass('disabled');
            $('#menuTabConfiguration').parent().addClass('disabled');
            UTIL.clearTabAlert(view);
        }
        else if (view === 'tabProgram') {
            $('#head-navigation-configuration-edit').css('display', 'none');
            $('#head-navigation-program-edit').css('display', 'inline');
            $('#menuTabConfiguration').parent().removeClass('disabled');
            $('#menuTabProgram').parent().addClass('disabled');
        }
        else if (view === 'tabSourceCodeEditor') {
            $('#head-navigation-configuration-edit').css('display', 'none');
            $('#head-navigation-program-edit').css('display', 'inline');
            $('#menuTabProgram').parent().removeClass('disabled');
            $('#menuTabConfiguration').parent().removeClass('disabled');
            $('#head-navigation-program-edit').addClass('disabled');
            $('.robotType').addClass('disabled');
            $('#head-navi-tooltip-program').attr('data-toggle', '');
            $('#head-navi-tooltip-configuration').attr('data-toggle', '');
        }
        else {
            $('#head-navi-tooltip-program').attr('data-toggle', '');
            $('#head-navi-tooltip-configuration').attr('data-toggle', '');
            $('#head-navigation-program-edit').addClass('disabled');
            $('#head-navigation-configuration-edit').addClass('disabled');
        }
    }
    exports.setView = setView;
    function getView() {
        return GUISTATE.gui.view;
    }
    exports.getView = getView;
    function getPrevView() {
        return GUISTATE.gui.prevView;
    }
    exports.getPrevView = getPrevView;
    function setLanguage(language) {
        $('#language li a[lang=' + language + ']')
            .parent()
            .addClass('disabled');
        $('#language li a[lang=' + GUISTATE.gui.language + ']')
            .parent()
            .removeClass('disabled');
        if (language === 'de') {
            $('.EN').css('display', 'none');
            $('.DE').css('display', 'inline');
            $('li>a.DE').css('display', 'block');
        }
        else {
            $('.DE').css('display', 'none');
            $('.EN').css('display', 'inline');
            $('li>a.EN').css('display', 'block');
        }
        GUISTATE.gui.language = language;
        HELP_C.initView();
        LEGAL_C.loadLegalTexts();
        $('#infoContent').attr('data-placeholder', Blockly.Msg.INFO_DOCUMENTATION_HINT || 'Document your program here ...');
        $('.bootstrap-tagsinput input').attr('placeholder', Blockly.Msg.INFO_TAGS || 'Tags');
        updateTutorialMenu();
    }
    exports.setLanguage = setLanguage;
    function getLanguage() {
        return GUISTATE.gui.language;
    }
    exports.getLanguage = getLanguage;
    function isProgramSaved() {
        return GUISTATE.program.saved;
    }
    exports.isProgramSaved = isProgramSaved;
    function setProgramSaved(save) {
        if (save) {
            $('#menuSaveProg').parent().parent().removeClass('disabled');
            $('#menuSaveProg').parent().parent().addClass('disabled');
            getBlocklyWorkspace().robControls.disable('saveProgram');
        }
        else {
            if (isUserLoggedIn() && !isProgramStandard() && isProgramWritable()) {
                $('#menuSaveProg').parent().parent().removeClass('disabled');
                getBlocklyWorkspace().robControls.enable('saveProgram');
            }
            else {
                $('#menuSaveProg').parent().parent().removeClass('disabled');
                $('#menuSaveProg').parent().parent().addClass('disabled');
                getBlocklyWorkspace().robControls.disable('saveProgram');
            }
        }
        GUISTATE.program.saved = save;
    }
    exports.setProgramSaved = setProgramSaved;
    function isConfigurationSaved() {
        return GUISTATE.configuration.saved;
    }
    exports.isConfigurationSaved = isConfigurationSaved;
    function setConfigurationSaved(save) {
        if (save) {
            $('#menuSaveConfig').parent().removeClass('disabled');
            $('#menuSaveConfig').parent().addClass('disabled');
            getBricklyWorkspace().robControls.disable('saveProgram');
        }
        else {
            if (isUserLoggedIn() && !isConfigurationStandard() && !isConfigurationAnonymous()) {
                $('#menuSaveConfig').parent().removeClass('disabled');
                getBricklyWorkspace().robControls.enable('saveProgram');
            }
            else {
                $('#menuSaveConfig').parent().removeClass('disabled');
                $('#menuSaveConfig').parent().addClass('disabled');
                getBricklyWorkspace().robControls.disable('saveProgram');
            }
        }
        GUISTATE.configuration.saved = save;
    }
    exports.setConfigurationSaved = setConfigurationSaved;
    function getProgramShared() {
        return GUISTATE.program.shared;
    }
    exports.getProgramShared = getProgramShared;
    function setProgramSource(source) {
        GUISTATE.program.source = source;
    }
    exports.setProgramSource = setProgramSource;
    function getProgramSource() {
        return GUISTATE.program.source;
    }
    exports.getProgramSource = getProgramSource;
    function getSourceCodeFileExtension() {
        return GUISTATE.gui.sourceCodeFileExtension;
    }
    exports.getSourceCodeFileExtension = getSourceCodeFileExtension;
    function getBinaryFileExtension() {
        return GUISTATE.gui.binaryFileExtension;
    }
    exports.getBinaryFileExtension = getBinaryFileExtension;
    function isUserLoggedIn() {
        return GUISTATE.user.id >= 0;
    }
    exports.isUserLoggedIn = isUserLoggedIn;
    function getProgramTimestamp() {
        return GUISTATE.program.timestamp;
    }
    exports.getProgramTimestamp = getProgramTimestamp;
    function setProgramTimestamp(timestamp) {
        GUISTATE.program.timestamp = timestamp;
    }
    exports.setProgramTimestamp = setProgramTimestamp;
    function getProgramName() {
        return GUISTATE.program.name;
    }
    exports.getProgramName = getProgramName;
    function setProgramName(name) {
        var displayName = name;
        if (getProgramShareRelation() && getProgramShareRelation() !== 'NONE' && getProgramOwnerName() !== getUserAccountName()) {
            var owner = getProgramOwnerName(), author = getProgramAuthorName(), relation = getProgramShareRelation(), icon = '', content = '', suffix = '';
            if (owner === 'Gallery') {
                // user has uploaded this program to the gallery
                icon = 'th-large-outline';
                if (relation === 'READ') {
                    content = author;
                }
            }
            else if (owner === 'Roberta') {
                // user loads a program from the example program list
                icon = 'roberta';
            }
            else if (relation == 'WRITE') {
                // user loads a program, owned by another user, but with WRITE rights
                icon = 'pencil';
                suffix = '<span style="color:#33B8CA;">' + owner + '</span>';
            }
            else if (relation == 'READ') {
                // user loads a program, owned by another user, but with READ rights
                icon = 'eye';
                suffix = '<span style="color:#33B8CA;">' + owner + '</span>';
            }
            displayName += ' <b><span style="color:#33B8CA;" class="typcn typcn-' + icon + ' progName">' + content + '</span></b>' + suffix;
        }
        $('#tabProgramName').html(displayName);
        GUISTATE.program.name = name;
    }
    exports.setProgramName = setProgramName;
    function getProgramOwnerName() {
        return GUISTATE.program.owner || getUserAccountName();
    }
    exports.getProgramOwnerName = getProgramOwnerName;
    function setProgramOwnerName(name) {
        GUISTATE.program.owner = name;
    }
    exports.setProgramOwnerName = setProgramOwnerName;
    function getProgramAuthorName() {
        return GUISTATE.program.author || getUserAccountName();
    }
    exports.getProgramAuthorName = getProgramAuthorName;
    function setProgramAuthorName(name) {
        GUISTATE.program.author = name;
    }
    exports.setProgramAuthorName = setProgramAuthorName;
    function getProgramShareRelation() {
        return GUISTATE.program.shared;
    }
    exports.getProgramShareRelation = getProgramShareRelation;
    function setProgramShareRelation(relation) {
        GUISTATE.program.shared = relation;
    }
    exports.setProgramShareRelation = setProgramShareRelation;
    function getConfigurationName() {
        return GUISTATE.configuration.name;
    }
    exports.getConfigurationName = getConfigurationName;
    function setConfigurationName(name) {
        $('#tabConfigurationName').html(name);
        GUISTATE.configuration.name = name;
    }
    exports.setConfigurationName = setConfigurationName;
    function setConfigurationNameDefault() {
        setConfigurationName(getConfigurationStandardName());
    }
    exports.setConfigurationNameDefault = setConfigurationNameDefault;
    function setProgramToolboxLevel(level) {
        $('.level').removeClass('disabled');
        $('.level.' + level).addClass('disabled');
        GUISTATE.program.toolbox.level = level;
    }
    exports.setProgramToolboxLevel = setProgramToolboxLevel;
    function getProgramToolboxLevel() {
        return GUISTATE.program.toolbox.level;
    }
    exports.getProgramToolboxLevel = getProgramToolboxLevel;
    function getToolbox(level) {
        return GUISTATE.gui.program.toolbox[level];
    }
    exports.getToolbox = getToolbox;
    function getConfToolbox() {
        return GUISTATE.conf.toolbox;
    }
    exports.getConfToolbox = getConfToolbox;
    function getDefaultRobot() {
        return GUISTATE.gui.defaultRobot;
    }
    exports.getDefaultRobot = getDefaultRobot;
    function setDefaultRobot(robot) {
        GUISTATE.gui.defaultRobot = robot;
    }
    exports.setDefaultRobot = setDefaultRobot;
    function getRobotFWName() {
        return GUISTATE.robot.fWName;
    }
    exports.getRobotFWName = getRobotFWName;
    function setRobotToken(token) {
        GUISTATE.robot.token = token;
    }
    exports.setRobotToken = setRobotToken;
    function setConfigurationXML(xml) {
        GUISTATE.configuration.xml = xml;
    }
    exports.setConfigurationXML = setConfigurationXML;
    function getConfigurationXML() {
        return GUISTATE.configuration.xml;
    }
    exports.getConfigurationXML = getConfigurationXML;
    function setProgramXML(xml) {
        GUISTATE.program.xml = xml;
    }
    exports.setProgramXML = setProgramXML;
    function getProgramXML() {
        return GUISTATE.program.xml;
    }
    exports.getProgramXML = getProgramXML;
    function getRobots() {
        return GUISTATE.server.robots;
    }
    exports.getRobots = getRobots;
    function getProgramToolbox() {
        return GUISTATE.gui.program.toolbox[GUISTATE.program.toolbox.level];
    }
    exports.getProgramToolbox = getProgramToolbox;
    function getConfigurationToolbox() {
        return GUISTATE.gui.configuration.toolbox;
    }
    exports.getConfigurationToolbox = getConfigurationToolbox;
    function getProgramProg() {
        return GUISTATE.gui.program.prog;
    }
    exports.getProgramProg = getProgramProg;
    function getConfigurationConf() {
        return GUISTATE.gui.configuration.conf;
    }
    exports.getConfigurationConf = getConfigurationConf;
    function getStartWithoutPopup() {
        return GUISTATE.gui.startWithoutPopup;
    }
    exports.getStartWithoutPopup = getStartWithoutPopup;
    function setStartWithoutPopup() {
        return (GUISTATE.gui.startWithoutPopup = true);
    }
    exports.setStartWithoutPopup = setStartWithoutPopup;
    function getServerVersion() {
        return GUISTATE.server.version;
    }
    exports.getServerVersion = getServerVersion;
    function isPublicServerVersion() {
        return GUISTATE.server.isPublic;
    }
    exports.isPublicServerVersion = isPublicServerVersion;
    function getUserName() {
        return GUISTATE.user.name;
    }
    exports.getUserName = getUserName;
    function getUserAccountName() {
        return GUISTATE.user.accountName;
    }
    exports.getUserAccountName = getUserAccountName;
    function isUserAccountActivated() {
        return GUISTATE.user.isAccountActivated;
    }
    exports.isUserAccountActivated = isUserAccountActivated;
    function isUserMemberOfUserGroup() {
        return GUISTATE.user.userGroup != '';
    }
    exports.isUserMemberOfUserGroup = isUserMemberOfUserGroup;
    function getUserUserGroup() {
        return GUISTATE.user.userGroup;
    }
    exports.getUserUserGroup = getUserUserGroup;
    function getUserUserGroupOwner() {
        return GUISTATE.user.userGroupOwner;
    }
    exports.getUserUserGroupOwner = getUserUserGroupOwner;
    function setLogin(result) {
        setState(result);
        GUISTATE.user.accountName = result.userAccountName;
        if (result.userName === undefined || result.userName === '') {
            GUISTATE.user.name = result.userAccountName;
        }
        else {
            GUISTATE.user.name = result.userName;
        }
        GUISTATE.user.id = result.userId;
        GUISTATE.user.isAccountActivated = result.isAccountActivated;
        GUISTATE.user.userGroup = result.userGroupName;
        GUISTATE.user.userGroupOwner = result.userGroupOwner;
        $('.nav > li > ul > .login, .logout').removeClass('disabled');
        $('.nav > li > ul > .login.unavailable').addClass('disabled');
        $('.nav > li > ul > .logout').addClass('disabled');
        $('#head-navi-icon-user').removeClass('error');
        $('#head-navi-icon-user').addClass('ok');
        $('#menuSaveProg').parent().addClass('disabled');
        $('#menuSaveConfig').parent().addClass('disabled');
        setProgramSaved(true);
        setConfigurationSaved(true);
        if (isUserMemberOfUserGroup()) {
            $('#registerUserName, #registerUserEmail').prop('disabled', true);
            $('#userGroupMemberDefaultPasswordHint').removeClass('hidden');
        }
        if (GUISTATE.gui.view == 'tabGalleryList') {
            $('#galleryList').find('button[name="refresh"]').clickWrap();
        }
    }
    exports.setLogin = setLogin;
    function setLogout() {
        if (isUserMemberOfUserGroup()) {
            $('#registerUserName, #registerUserEmail').prop('disabled', false);
            $('#userGroupMemberDefaultPasswordHint').addClass('hidden');
        }
        GUISTATE.user.id = -1;
        GUISTATE.user.accountName = '';
        GUISTATE.user.name = '';
        GUISTATE.user.userGroup = '';
        GUISTATE.user.userGroupOwner = '';
        if (getView() === 'tabUserGroupList') {
            $('#tabProgram').clickWrap();
        }
        setProgramName('NEPOprog');
        setProgramOwnerName(null);
        setProgramAuthorName(null);
        setProgramShareRelation(null);
        GUISTATE.program.shared = false;
        $('.nav > li > ul > .logout, .login').removeClass('disabled');
        $('.nav > li > ul > .login').addClass('disabled');
        $('#head-navi-icon-user').removeClass('ok');
        $('#head-navi-icon-user').addClass('error');
        if (GUISTATE.gui.view == 'tabProgList') {
            $('#tabProgram').clickWrap();
        }
        else if (GUISTATE.gui.view == 'tabConfList') {
            $('#tabConfiguration').clickWrap();
        }
        else if (GUISTATE.gui.view == 'tabGalleryList') {
            $('#galleryList').find('button[name="refresh"]').clickWrap();
        }
    }
    exports.setLogout = setLogout;
    function setProgram(result, opt_owner, opt_author) {
        if (result) {
            GUISTATE.program.shared = result.programShared;
            GUISTATE.program.timestamp = result.lastChanged;
            setProgramSaved(true);
            setConfigurationSaved(true);
            var name = result.name;
            setProgramShareRelation(result.programShared);
            if (opt_owner) {
                setProgramOwnerName(opt_owner);
            }
            else if (result.parameters && result.parameters.OWNER_NAME) {
                setProgramOwnerName(result.parameters.OWNER_NAME);
            }
            else {
                setProgramOwnerName(null);
            }
            if (opt_author) {
                setProgramAuthorName(opt_author);
            }
            else if (result.parameters && result.parameters.AUTHOR_NAME) {
                setProgramAuthorName(result.parameters.AUTHOR_NAME);
            }
            else {
                setProgramOwnerName(null);
            }
            setProgramName(result.name);
        }
    }
    exports.setProgram = setProgram;
    /**
     * Set configuration
     * @param {*} result
     */
    function setConfiguration(result) {
        if (result) {
            setConfigurationName(result.name);
            GUISTATE.configuration.timestamp = result.lastChanged;
            setConfigurationSaved(true);
            setProgramSaved(false);
            $('#tabConfigurationName').html(result.name);
        }
    }
    exports.setConfiguration = setConfiguration;
    function checkSim() {
        if (hasSim()) {
            $('#menuRunSim').parent().removeClass('disabled');
            $('#simButton, #simDebugButton').show();
        }
        else {
            $('#menuRunSim').parent().addClass('disabled');
            $('#simButton, #simDebugButton').hide();
        }
        if (hasWebotsSim()) {
            $('#simDebugButton').hide();
        }
        if (hasMultiSim()) {
            $('#menuRunMulipleSim').parent().removeClass('unavailable');
            $('#menuRunMulipleSim').parent().addClass('available');
            if (isUserLoggedIn()) {
                $('#menuRunMulipleSim').parent().removeClass('disabled');
            }
        }
        else {
            $('#menuRunMulipleSim').parent().addClass('unavailable');
            $('#menuRunMulipleSim').parent().removeClass('available');
            $('#menuRunMulipleSim').parent().addClass('disabled');
        }
    }
    exports.checkSim = checkSim;
    function hasSim() {
        return GUISTATE.gui.sim == true;
    }
    exports.hasSim = hasSim;
    function hasMultiSim() {
        return GUISTATE.gui.multipleSim == true;
    }
    exports.hasMultiSim = hasMultiSim;
    function hasWebotsSim() {
        return GUISTATE.gui.webotsSim == true;
    }
    exports.hasWebotsSim = hasWebotsSim;
    function getWebotsUrl() {
        return GUISTATE.gui.webotsUrl;
    }
    exports.getWebotsUrl = getWebotsUrl;
    function getListOfTutorials() {
        return GUISTATE.server.tutorial;
    }
    exports.getListOfTutorials = getListOfTutorials;
    function getConnectionTypeEnum() {
        return GUISTATE.gui.connectionType;
    }
    exports.getConnectionTypeEnum = getConnectionTypeEnum;
    function getConnection() {
        return GUISTATE.gui.connection;
    }
    exports.getConnection = getConnection;
    function getVendor() {
        return GUISTATE.gui.vendor;
    }
    exports.getVendor = getVendor;
    function getSignature() {
        return GUISTATE.gui.signature;
    }
    exports.getSignature = getSignature;
    function getCommandLine() {
        return GUISTATE.gui.commandLine;
    }
    exports.getCommandLine = getCommandLine;
    function setProgramToDownload() {
        return (GUISTATE.gui.program.download = true);
    }
    exports.setProgramToDownload = setProgramToDownload;
    function isProgramToDownload() {
        return GUISTATE.gui.program.download;
    }
    exports.isProgramToDownload = isProgramToDownload;
    function setPing(ping) {
        GUISTATE.server.ping = ping;
    }
    exports.setPing = setPing;
    function doPing() {
        return GUISTATE.server.ping;
    }
    exports.doPing = doPing;
    function setPingTime(time) {
        GUISTATE.server.pingTime = time;
    }
    exports.setPingTime = setPingTime;
    function getPingTime() {
        return GUISTATE.server.pingTime;
    }
    exports.getPingTime = getPingTime;
    function setSocket(socket) {
        GUISTATE.robot.socket = socket;
    }
    exports.setSocket = setSocket;
    function getSocket() {
        return GUISTATE.robot.socket;
    }
    exports.getSocket = getSocket;
    function getAvailableHelp() {
        return GUISTATE.server.help;
    }
    exports.getAvailableHelp = getAvailableHelp;
    function getTheme() {
        return GUISTATE.server.theme;
    }
    exports.getTheme = getTheme;
    function inWebview() {
        return GUISTATE.gui.webview || false;
    }
    exports.inWebview = inWebview;
    function setWebview(webview) {
        GUISTATE.gui.webview = webview;
    }
    exports.setWebview = setWebview;
    function updateMenuStatus() {
        // TODO revice this function, because isAgent is the exception
        switch (SOCKET_C.getPortList().length) {
            case 0:
                if (getConnection() !== GUISTATE.gui.connectionType.AGENTORTOKEN) {
                    $('#head-navi-icon-robot').removeClass('error');
                    $('#head-navi-icon-robot').removeClass('busy');
                    $('#head-navi-icon-robot').removeClass('wait');
                    setRunEnabled(false);
                    $('#runSourceCodeEditor').addClass('disabled');
                    $('#menuConnect').parent().addClass('disabled');
                    setIsAgent(true);
                }
                else {
                    setIsAgent(false);
                }
                break;
            case 1:
                setIsAgent(true);
                $('#head-navi-icon-robot').removeClass('error');
                $('#head-navi-icon-robot').removeClass('busy');
                $('#head-navi-icon-robot').addClass('wait');
                setRunEnabled(true);
                $('#runSourceCodeEditor').removeClass('disabled');
                $('#menuConnect').parent().addClass('disabled');
                break;
            default:
                setIsAgent(true);
                // Always:
                $('#menuConnect').parent().removeClass('disabled');
                // If the port is not chosen:
                if (getRobotPort() == '') {
                    $('#head-navi-icon-robot').removeClass('error');
                    $('#head-navi-icon-robot').removeClass('busy');
                    $('#head-navi-icon-robot').removeClass('wait');
                    setRunEnabled(false);
                    //$('#menuConnect').parent().addClass('disabled');
                }
                else {
                    $('#head-navi-icon-robot').removeClass('error');
                    $('#head-navi-icon-robot').removeClass('busy');
                    $('#head-navi-icon-robot').addClass('wait');
                    setRunEnabled(true);
                    $('#runSourceCodeEditor').removeClass('disabled');
                }
                break;
        }
    }
    exports.updateMenuStatus = updateMenuStatus;
    function updateTutorialMenu() {
        $('#head-navigation-tutorial').hide();
        var tutorialList = getListOfTutorials();
        for (var tutorial in tutorialList) {
            if (tutorialList.hasOwnProperty(tutorial) && tutorialList[tutorial].language === getLanguage().toUpperCase()) {
                $('#head-navigation-tutorial').show();
                break;
            }
        }
    }
    exports.updateTutorialMenu = updateTutorialMenu;
    function getLegalTextsMap() {
        return GUISTATE.server.legalTexts;
    }
    exports.getLegalTextsMap = getLegalTextsMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpU3RhdGUuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9jb250cm9sbGVyL2d1aVN0YXRlLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsaUJBQWlCO0lBQ3BDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLGlCQUFpQjtJQUNuQzs7T0FFRztJQUNILFNBQVMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRO1FBQzVCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN6QixRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxRQUFRLElBQUksS0FBSyxDQUFDO1lBQ3pDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3RCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ1gsS0FBSyxFQUFFLE1BQU07aUJBQ2hCLENBQUMsQ0FBQzthQUNOO1lBRUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO1lBQ2pDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQztZQUNyQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDakMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFFdkMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDbEQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsUUFB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