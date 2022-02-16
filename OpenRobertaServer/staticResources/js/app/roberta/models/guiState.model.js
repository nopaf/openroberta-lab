define(["require", "exports", "comm"], function (require, exports, COMM) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = exports.robot = exports.toolbox = exports.configuration = exports.program = exports.user = exports.gui = exports.server = void 0;
    exports.server = {};
    exports.gui = {};
    exports.user = {};
    exports.program = {};
    exports.configuration = {};
    exports.toolbox = '';
    exports.robot = {};
    /**
     * Initialize gui state object
     */
    function init() {
        var ready = new $.Deferred();
        exports.server.ping = true;
        exports.server.pingTime = 3000;
        exports.gui.view = '';
        exports.gui.prevView = '';
        exports.gui.language = '';
        exports.gui.robot = '';
        exports.gui.blocklyWorkspace = '';
        exports.gui.bricklyWorkspace = '';
        exports.gui.program = {};
        exports.gui.program.toolbox = {};
        exports.gui.program.toolbox.a = '';
        exports.gui.program.prog = {};
        exports.gui.program = {};
        exports.gui.program.toolbox = {};
        exports.gui.program.prog = {};
        exports.gui.program.download = false;
        exports.gui.configuration = {};
        exports.gui.configuration.toolbox = '';
        exports.gui.configuration.conf = '';
        exports.gui.connection = '';
        exports.gui.vendor = '';
        exports.gui.sim = false;
        exports.gui.multipleSim = false;
        exports.gui.webotsSim = false;
        exports.gui.webotsUrl = '';
        exports.gui.fileExtension = '';
        exports.gui.connectionType = {
            TOKEN: 'token',
            AUTO: 'autoConnection',
            AGENTORTOKEN: 'arduinoAgentOrToken',
            LOCAL: 'local',
            WEBVIEW: 'webview',
            JSPLAY: 'jsPlay',
        };
        exports.gui.runEnabled = false;
        exports.user.id = -1;
        exports.user.accountName = '';
        exports.user.name = '';
        exports.user.isAccountActivated = false;
        //socket.portNames = [];
        //socket.vendorIds = [];
        exports.program.name = '';
        exports.program.saved = true;
        exports.program.shared = true;
        exports.program.timestamp = '';
        exports.program.source = '';
        exports.program.xml = '';
        exports.program.toolbox = {};
        exports.program.toolbox.level = '';
        exports.program.toolbox.xml = '';
        exports.configuration.name = '';
        exports.configuration.saved = true;
        exports.configuration.timestamp = '';
        exports.configuration.xml = '';
        exports.robot.token = '';
        exports.robot.name = '';
        exports.robot.state = '';
        exports.robot.battery = '';
        exports.robot.version = '';
        exports.robot.fWName = '';
        exports.robot.sensorValues = '';
        exports.robot.nepoExitValue = 0;
        exports.robot.time = -1;
        exports.robot.robotPort = '';
        exports.robot.socket = null;
        exports.robot.hasWlan = false;
        var getInitFromServer = function () {
            COMM.setInitToken(undefined);
            return COMM.json('/init', {
                cmd: 'init',
                screenSize: [window.screen.availWidth, window.screen.availHeight],
            }, function (result) {
                if (result.rc === 'ok') {
                    COMM.setInitToken(result.initToken);
                    $.extend(exports.server, result.server);
                    exports.server.version = result['server.version'];
                    exports.server.time = result.serverTime;
                    ready.resolve();
                }
                else {
                    console.log('ERROR: ' + result.message);
                    // MSG.displayInformation(result, "", result.message);
                }
            }, 'init data from server');
        };
        getInitFromServer();
        return ready.promise();
    }
    exports.init = init;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpU3RhdGUubW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3JvYmVydGEvbW9kZWxzL2d1aVN0YXRlLm1vZGVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUlhLFFBQUEsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNaLFFBQUEsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNULFFBQUEsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNWLFFBQUEsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNiLFFBQUEsYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUNuQixRQUFBLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDYixRQUFBLEtBQUssR0FBRyxFQUFFLENBQUM7SUFFeEI7O09BRUc7SUFDSCxTQUFTLElBQUk7UUFDVCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUU3QixjQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNuQixjQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUV2QixXQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLFdBQUcsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLFdBQUcsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLFdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsV0FBRyxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUMxQixXQUFHLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1FBQzFCLFdBQUcsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLFdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUN6QixXQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzNCLFdBQUcsQ0FB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