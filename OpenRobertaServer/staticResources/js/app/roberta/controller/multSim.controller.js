/**
 * @fileOverview Multiple Simulate robots
 * @author Akshat Khare <akshat.khare08@gmail.com>
 */
/**
 * Controller for multiple simulation part of the project
 */
define(["require", "exports", "message", "util", "progList.model", "program.model", "guiState.controller", "simulation.simulation", "jquery", "blockly"], function (require, exports, MSG, UTIL, PROGLIST, PROGRAM_M, GUISTATE_C, SIM, $, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showListProg = void 0;
    function showListProg() {
        PROGLIST.loadProgList(function (result) {
            if (result.rc === 'ok' && result.programNames.length > 1) {
                $('#multipleRobotsTable').bootstrapTable('destroy'); //refreshing the table
                var dataarr = []; //Array having data to be displayed in table shown
                var robottype = GUISTATE_C.getRobot();
                result.programNames.forEach(function (item, i, oriarray) {
                    dataarr.push({
                        name: item[0],
                        robot: robottype,
                        creator: item[1],
                        date: item[4],
                    });
                });
                $('#multipleRobotsTable').bootstrapTable({
                    height: 400,
                    sortName: 'name',
                    toggle: 'multipleRobotsTable',
                    iconsPrefix: 'typcn',
                    search: true,
                    icons: {
                        paginationSwitchDown: 'typcn-document-text',
                        paginationSwitchUp: 'typcn-book',
                        refresh: 'typcn-refresh',
                    },
                    pagination: 'true',
                    buttonsAlign: 'right',
                    resizable: 'true',
                    columns: [
                        {
                            field: 'name',
                            title: "<span lkey='Blockly.Msg.DATATABLE_PROGRAM_NAME'>" + (Blockly.Msg.DATATABLE_PROGRAM_NAME || 'Name des Programms') + '</span>',
                            sortable: true,
                        },
                        {
                            field: 'creator',
                            title: "<span lkey='Blockly.Msg.DATATABLE_CREATED_BY'>" + (Blockly.Msg.DATATABLE_CREATED_BY || 'Erzeugt von') + '</span>',
                            sortable: true,
                        },
                        {
                            field: 'date',
                            title: "<span lkey='Blockly.Msg.DATATABLE_CREATED_ON'>" + (Blockly.Msg.DATATABLE_CREATED_ON || 'Erzeugt am') + '</span>',
                            sortable: true,
                            formatter: UTIL.formatDate,
                        },
                        {
                            checkbox: true,
                            valign: 'middle',
                        },
                    ],
                    data: dataarr,
                });
                $('#loadMultipleSimPrograms').off();
                $('#loadMultipleSimPrograms').onWrap('click', function () {
                    var selections = $('#multipleRobotsTable').bootstrapTable('getSelections');
                    var selectedprograms = [];
                    for (var i = 0; i < selections.length; i++) {
                        var tempfind = result.programNames.filter(function (ele) {
                            return selections[i].name === ele[0] && selections[i].creator === ele[1];
                        })[0];
                        selectedprograms.push(tempfind);
                    }
                    var extractedprograms = [];
                    numberOfPrograms = 0;
                    selectedprograms.forEach(function (item, i, oriarray) {
                        PROGRAM_M.loadProgramFromListing(item[0], item[1], item[3], function (dat) {
                            if (dat.rc != 'ok') {
                                //TODO
                                alert('failed loading program for item ' + i + ', check console');
                                console.log('failed item is ', item);
                            }
                            dat.savedName = item[0];
                            extractedprograms[i] = dat;
                            var xmlTextProgram = dat.progXML;
                            var isNamedConfig = dat.configName !== GUISTATE_C.getRobotGroup().toUpperCase() + 'basis' && dat.configName !== '';
                            var configName = isNamedConfig ? dat.configName : undefined;
                            var xmlConfigText = dat.configName !== '' ? dat.confXML : undefined;
                            var language = GUISTATE_C.getLanguage();
                            PROGRAM_M.runInSim(dat.savedName, configName, xmlTextProgram, xmlConfigText, language, function (result) {
                                numberOfPrograms++;
                                if (result.rc === 'ok') {
                                    for (var resultProp in result)
                                        extractedprograms[i][resultProp] = result[resultProp];
                                }
                                else {
                                    MSG.displayInformation(result, '', result.message, '');
                                }
                                if (selectedprograms.length === numberOfPrograms) {
                                    if (extractedprograms.length >= 1) {
                                        simulateMultiple(extractedprograms);
                                    }
                                    else {
                                        $('#showMultipleSimPrograms').modal('hide');
                                    }
                                }
                            });
                        });
                    });
                });
                $('#showMultipleSimPrograms').modal('show');
            }
            else {
                if (result.rc === 'ok') {
                    result.rc = 'error';
                }
                MSG.displayInformation(result, '', 'POPUP_MULTROBOTS_NOPROGRAMS', '');
            }
        });
    }
    exports.showListProg = showListProg;
    function simulateMultiple(programs) {
        $('#showMultipleSimPrograms').modal('hide');
        var INITIAL_WIDTH = 0.5;
        SIM.init(programs, true, GUISTATE_C.getRobotGroup());
        $('#simCancel, #simControlStepOver, #simControlStepInto').hide();
        $('.sim').removeClass('hide');
        if ($('#blockly').hasClass('rightActive') && !$('#simButton').hasClass('rightActive')) {
            $('#blockly').closeRightView(function () {
                $('#blockly').openRightView('sim', INITIAL_WIDTH);
            });
        }
        else if (!$('#simButton').hasClass('rightActive')) {
            $('#blockly').openRightView('sim', INITIAL_WIDTH);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdFNpbS5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvbXVsdFNpbS5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUNIOztHQUVHOzs7O0lBWUgsU0FBUyxZQUFZO1FBQ2pCLFFBQVEsQ0FBQyxZQUFZLENBQUMsVUFBVSxNQUFNO1lBQ2xDLElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN0RCxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7Z0JBQzNFLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDLGtEQUFrRDtnQkFDcEUsSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN0QyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLEVBQUUsUUFBUTtvQkFDbkQsT0FBTyxDQUFDLElBQUksQ0FBQzt3QkFDVCxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDYixLQUFLLEVBQUUsU0FBUzt3QkFDaEIsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ2hCLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO3FCQUNoQixDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsY0FBYyxDQUFDO29CQUNyQyxNQUFNLEVBQUUsR0FBRztvQkFDWCxRQUFRLEVBQUUsTUFBTTtvQkFDaEIsTUFBTSxFQUFFLHFCQUFxQjtvQkFDN0IsV0FBVyxFQUFFLE9BQU87b0JBQ3BC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