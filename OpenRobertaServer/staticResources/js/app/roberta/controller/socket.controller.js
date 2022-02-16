define(["require", "exports", "log", "jquery", "robot.controller", "guiState.controller", "socket.io", "comm"], function (require, exports, LOG, $, ROBOT_C, GUISTATE_C, IO, COMM) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uploadProgram = exports.getRobotList = exports.getPortList = exports.closeConnection = exports.init = exports.listRobotStop = exports.listRobotStart = void 0;
    var portList = [];
    var vendorList = [];
    var productList = [];
    var system;
    var cmd;
    var port;
    var robotList = [];
    var agentPortList = '[{"Name":"none","IdVendor":"none","IdProduct":"none"}]';
    var timerId;
    function makeRequest() {
        portList = [];
        vendorList = [];
        productList = [];
        robotList = [];
        COMM.listRobotsFromAgent(function (text) {
            //console.log("listing robots");
        }, function (response) {
            agentPortList = response.responseText;
        }, function () { });
        try {
            jsonObject = JSON.parse(agentPortList);
            jsonObject.forEach(function (port) {
                if (GUISTATE_C.getVendor() === port['IdVendor'].toLowerCase()) {
                    portList.push(port['Name']);
                    vendorList.push(port['IdVendor']);
                    productList.push(port['IdProduct']);
                    robotList.push(GUISTATE_C.getRobotRealName());
                }
            });
        }
        catch (e) {
            GUISTATE_C.setRobotPort('');
        }
        if (portList.indexOf(GUISTATE_C.getRobotPort()) < 0) {
            GUISTATE_C.setRobotPort('');
        }
        if (portList.length == 1) {
            ROBOT_C.setPort(portList[0]);
        }
        GUISTATE_C.updateMenuStatus();
    }
    function listRobotStart() {
        //console.log("list robots started");
        $('#menuConnect').parent().addClass('disabled');
        makeRequest();
        timerId = window.setInterval(makeRequest, 3000);
    }
    exports.listRobotStart = listRobotStart;
    function listRobotStop() {
        //console.log("list robots stopped");
        $('#menuConnect').parent().addClass('disabled');
        window.clearInterval(timerId);
    }
    exports.listRobotStop = listRobotStop;
    function init() {
        robotSocket = GUISTATE_C.getSocket();
        if (robotSocket == null || GUISTATE_C.getIsAgent() == false) {
            robotSocket = IO('ws://127.0.0.1:8991/');
            GUISTATE_C.setSocket(robotSocket);
            GUISTATE_C.setIsAgent(true);
            $('#menuConnect').parent().addClass('disabled');
            robotSocket.on('connect_error', function (err) {
                GUISTATE_C.setIsAgent(false);
            });
            robotSocket.on('connect', function () {
                robotSocket.emit('command', 'log on');
                GUISTATE_C.setIsAgent(true);
                window.setInterval(function () {
                    portList = [];
                    vendorList = [];
                    productList = [];
                    robotList = [];
                    robotSocket.emit('command', 'list');
                }, 3000);
            });
            /*
             * Vendor and Product IDs for some robots Botnroll: /dev/ttyUSB0,
             * VID: 0x10c4, PID: 0xea60 Mbot: /dev/ttyUSB0, VID: 0x1a86, PID:
             * 0x7523 ArduinoUno: /dev/ttyACM0, VID: 0x2a03, PID: 0x0043
             */
            robotSocket.on('message', function (data) {
                if (data.includes('"Network": false')) {
                    var robot;
                    jsonObject = JSON.parse(data);
                    jsonObject['Ports'].forEach(function (port) {
                        if (GUISTATE_C.getVendor() === port['VendorID'].toLowerCase()) {
                            portList.push(port['Name']);
                            vendorList.push(port['VendorID']);
                            productList.push(port['ProductID']);
                            robotList.push(GUISTATE_C.getRobotRealName());
                        }
                    });
                    GUISTATE_C.setIsAgent(true);
                    robotSocket.on('connect_error', function (err) {
                        GUISTATE_C.setIsAgent(false);
                        $('#menuConnect').parent().removeClass('disabled');
                    });
                    if (portList.indexOf(GUISTATE_C.getRobotPort()) < 0) {
                        if (GUISTATE_C.getRobotPort() != '') {
                            //MSG.displayMessage(Blockly.Msg["MESSAGE_ROBOT_DISCONNECTED"], 'POPUP', '');
                        }
                        GUISTATE_C.setRobotPort('');
                    }
                    if (portList.length == 1) {
                        ROBOT_C.setPort(portList[0]);
                    }
                    GUISTATE_C.updateMenuStatus();
                }
                else if (data.includes('OS')) {
                    jsonObject = JSON.parse(data);
                    system = jsonObject['OS'];
                }
            });
            robotSocket.on('disconnect', function () { });
            robotSocket.on('error', function (err) { });
        }
    }
    exports.init = init;
    function closeConnection() {
        robotSocket = GUISTATE_C.getSocket();
        if (robotSocket != null) {
            robotSocket.disconnect();
            GUISTATE_C.setSocket(null);
        }
    }
    exports.closeConnection = closeConnection;
    function getPortList() {
        return portList;
    }
    exports.getPortList = getPortList;
    function getRobotList() {
        return robotList;
    }
    exports.getRobotList = getRobotList;
    function uploadProgram(programHex, robotPort) {
        COMM.sendProgramHexToAgent(programHex, robotPort, GUISTATE_C.getProgramName(), GUISTATE_C.getSignature(), GUISTATE_C.getCommandLine(), function () {
            LOG.text('Create agent upload success');
            $('#menuRunProg').parent().removeClass('disabled');
            $('#runOnBrick').parent().removeClass('disabled');
        });
    }
    exports.uploadProgram = uploadProgram;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3JvYmVydGEvY29udHJvbGxlci9zb2NrZXQuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDbEIsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUNyQixJQUFJLE1BQU0sQ0FBQztJQUNYLElBQUksR0FBRyxDQUFDO0lBQ1IsSUFBSSxJQUFJLENBQUM7SUFDVCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDbkIsSUFBSSxhQUFhLEdBQUcsd0RBQXdELENBQUM7SUFDN0UsSUFBSSxPQUFPLENBQUM7SUFFWixTQUFTLFdBQVc7UUFDaEIsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNkLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDaEIsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUNqQixTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLG1CQUFtQixDQUNwQixVQUFVLElBQUk7WUFDVixnQ0FBZ0M7UUFDcEMsQ0FBQyxFQUNELFVBQVUsUUFBUTtZQUNkLGFBQWEsR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDO1FBQzFDLENBQUMsRUFDRCxjQUFhLENBQUMsQ0FDakIsQ0FBQztRQUNGLElBQUk7WUFDQSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2QyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSTtnQkFDN0IsSUFBSSxVQUFVLENBQUMsU0FBUyxFQUFFLEtBQUssSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO29CQUMzRCxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENB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