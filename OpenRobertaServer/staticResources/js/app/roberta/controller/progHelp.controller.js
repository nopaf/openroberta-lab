define(["require", "exports", "guiState.controller", "blockly", "jquery", "jquery-validate"], function (require, exports, GUISTATE_C, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initView = exports.init = void 0;
    var INITIAL_WIDTH = 0.3;
    var blocklyWorkspace;
    var currentHelp;
    /**
     *
     */
    function init() {
        blocklyWorkspace = GUISTATE_C.getBlocklyWorkspace();
        initView();
        initEvents();
    }
    exports.init = init;
    function initView() {
        $('#helpContent').remove();
        var loadHelpFile = function (helpFileName) {
            var url = '../help/' + helpFileName;
            $('#helpDiv').load(url, function (response, status, xhr) {
                if (status == 'error') {
                    $('#helpButton').hide();
                }
                else {
                    $('#helpButton').show();
                    currentHelp = GUISTATE_C.getRobotGroup() + '_' + GUISTATE_C.getLanguage().toLowerCase();
                }
            });
        };
        var helpFileNameDefault = 'progHelp_' + GUISTATE_C.getRobotGroup() + '_en.html';
        var helpFileName = 'progHelp_' + GUISTATE_C.getRobotGroup() + '_' + GUISTATE_C.getLanguage().toLowerCase() + '.html';
        if (GUISTATE_C.getAvailableHelp().indexOf(helpFileName) > -1) {
            loadHelpFile(helpFileName);
        }
        else if (GUISTATE_C.getAvailableHelp().indexOf(helpFileNameDefault) > -1) {
            loadHelpFile(helpFileNameDefault);
        }
        else {
            $('#helpButton').hide();
        }
    }
    exports.initView = initView;
    function initEvents() {
        $('#helpButton').off('click touchend');
        $('#helpButton').onWrap('click touchend', function (event) {
            if ($('#helpButton').is(':visible')) {
                toggleHelp();
            }
            return false;
        });
    }
    function toggleHelp() {
        Blockly.hideChaff();
        if ($('#helpButton').hasClass('rightActive')) {
            $('#blockly').closeRightView();
        }
        else {
            if (GUISTATE_C.getProgramToolboxLevel() === 'beginner') {
                $('.help.expert').hide();
            }
            else {
                $('.help.expert').show();
            }
            var robotGroup = GUISTATE_C.findGroup(GUISTATE_C.getRobot());
            var exludeClass = ''.concat('.help.not', robotGroup.charAt(0).toUpperCase(), robotGroup.slice(1));
            $(exludeClass).hide();
            if (currentHelp != GUISTATE_C.getRobotGroup() + '_' + GUISTATE_C.getLanguage().toLowerCase()) {
                init();
            }
            $('#blockly').openRightView('help', INITIAL_WIDTH, function () {
                if (Blockly.selected) {
                    var block = Blockly.selected.type;
                    $('#' + block).addClass('selectedHelp');
                    $('#helpContent').scrollTo('#' + block, 1000, {
                        offset: -10,
                    });
                }
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ0hlbHAuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9jb250cm9sbGVyL3Byb2dIZWxwLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsSUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDO0lBQzFCLElBQUksZ0JBQWdCLENBQUM7SUFDckIsSUFBSSxXQUFXLENBQUM7SUFDaEI7O09BRUc7SUFDSCxTQUFTLElBQUk7UUFDVCxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNwRCxRQUFRLEVBQUUsQ0FBQztRQUNYLFVBQVUsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUEyQlEsb0JBQUk7SUF6QmIsU0FBUyxRQUFRO1FBQ2IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRTNCLElBQUksWUFBWSxHQUFHLFVBQVUsWUFBWTtZQUNyQyxJQUFJLEdBQUcsR0FBRyxVQUFVLEdBQUcsWUFBWSxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQVUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHO2dCQUNuRCxJQUFJLE1BQU0sSUFBSSxPQUFPLEVBQUU7b0JBQ25CLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDM0I7cUJBQU07b0JBQ0gsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN4QixXQUFXLEdBQUcsVUFBVSxDQUFDLGFBQWEsRUFBRSxHQUFHLEdBQUcsR0FBRyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQzNGO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUM7UUFFRixJQUFJLG1CQUFtQixHQUFH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