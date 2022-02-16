define(["require", "exports", "log", "util", "message", "progList.model", "userGroup.model", "program.model", "configuration.controller", "program.controller", "guiState.controller", "blockly", "jquery", "bootstrap-table"], function (require, exports, LOG, UTIL, MSG, PROGLIST, USERGROUP, PROGRAM, CONFIGURATION_C, PROGRAM_C, GUISTATE_C, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    /**
     * Initialize table of programs
     */
    function init() {
        initProgList();
        initProgListEvents();
    }
    exports.init = init;
    function initProgList() {
        $('#programNameTable').bootstrapTable({
            height: UTIL.calcDataTableHeight(),
            pageList: '[ 10, 25, All ]',
            toolbar: '#progListToolbar',
            toolbarAlign: 'none',
            showRefresh: 'true',
            sortName: 4,
            sortOrder: 'desc',
            showPaginationSwitch: 'true',
            pagination: 'true',
            buttonsAlign: 'right',
            resizable: 'true',
            iconsPrefix: 'typcn',
            icons: {
                paginationSwitchDown: 'typcn-document-text',
                paginationSwitchUp: 'typcn-book',
                refresh: 'typcn-refresh',
            },
            columns: [
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_PROGRAM_NAME'>" + (Blockly.Msg.DATATABLE_PROGRAM_NAME || 'Name des Programms') + '</span>',
                    sortable: true,
                },
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_CREATED_BY'>" + (Blockly.Msg.DATATABLE_CREATED_BY || 'Erzeugt von') + '</span>',
                    sortable: true,
                },
                {
                    events: eventsRelations,
                    title: "<span class='typcn typcn-flow-merge'></span>",
                    sortable: true,
                    sorter: sortRelations,
                    formatter: formatRelations,
                    align: 'left',
                    valign: 'middle',
                },
                {
                    visible: false,
                },
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_CREATED_ON'>" + (Blockly.Msg.DATATABLE_CREATED_ON || 'Erzeugt am') + '</span>',
                    sortable: true,
                    formatter: UTIL.formatDate,
                },
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_ACTUALIZATION'>" + (Blockly.Msg.DATATABLE_ACTUALIZATION || 'Letzte Aktualisierung') + '</span>',
                    sortable: true,
                    formatter: UTIL.formatDate,
                },
                {
                    title: '<input name="btSelectAll" type="checkbox">',
                    formatter: function (value, row, index) {
                        if (GUISTATE_C.isUserMemberOfUserGroup() && row[1] === GUISTATE_C.getUserUserGroupOwner()) {
                            return '<input type="checkbox" name="btSelectItem" data-index="' + index + '" disabled>';
                        }
                        return '<input type="checkbox" name="btSelectItem" data-index="' + index + '">';
                    },
                    valign: 'middle',
                    halign: 'center',
                    align: 'center',
                },
                {
                    events: eventsDeleteShareLoad,
                    title: titleActions,
                    align: 'left',
                    valign: 'top',
                    formatter: formatDeleteShareLoad,
                    width: '117px',
                },
            ],
        });
        $('#programNameTable').bootstrapTable('togglePagination');
    }
    function initProgListEvents() {
        var $tabProgList = $('#tabProgList'), $progList = $('#progList'), $programNameTable = $('#programNameTable'), $userGroupOptGroup = $('#progListUserGroupScope'), $userGroupSelect = $userGroupOptGroup.closest('select');
        $userGroupSelect.detach();
        $progList.find('button[name="refresh"]').parent().prepend($userGroupSelect);
        $(window).resize(function () {
            $programNameTable.bootstrapTable('resetView', {
                height: UTIL.calcDataTableHeight(),
            });
        });
        $tabProgList.onWrap('show.bs.tab', function (e) {
            guiStateController.setView('tabProgList');
            $programNameTable.bootstrapTable('load', []);
            $userGroupSelect.hide();
            if ($tabProgList.data('type') === 'userProgram') {
                $userGroupOptGroup.closest('select').val('userProgram');
                $userGroupOptGroup.find('option').remove();
                if (!GUISTATE_C.isUserMemberOfUserGroup()) {
                    USERGROUP.loadUserGroupList(function (data) {
                        if (data.rc == 'ok' && data.userGroups.length > 0) {
                            data.userGroups.forEach(function (userGroup) {
                                $userGroupOptGroup.append('<option value="' + userGroup.name + '">' + userGroup.name + '</option>');
                            });
                            $userGroupSelect.show();
                        }
                    });
                }
            }
        }, 'show prog list');
        $tabProgList.onWrap('shown.bs.tab', function (e) {
            switch ($tabProgList.data('type')) {
                case 'userProgram':
                    PROGLIST.loadProgList(update);
                    break;
                case 'exampleProgram':
                default:
                    PROGLIST.loadExampleList(updateExamplePrograms);
            }
        }, 'shown prog list');
        $progList.find('button[name="refresh"]').onWrap('click', function () {
            switch ($tabProgList.data('type')) {
                case 'userProgram':
                    $userGroupSelect.change();
                    break;
                case 'userGroupMemberProgram':
                case 'exampleProgram':
                default:
                    PROGLIST.loadExampleList(updateExamplePrograms);
            }
            return false;
        }, 'refresh prog list');
        $userGroupSelect.change(function (evt) {
            if ($tabProgList.data('type') !== 'userProgram') {
                return;
            }
            var selectVal = $userGroupSelect.val();
            if (selectVal === 'userProgram') {
                PROGLIST.loadProgList(update);
            }
            else {
                PROGLIST.loadProgListFromUserGroupMembers(selectVal, update);
            }
        });
        $programNameTable.onWrap('click-row.bs.table', function ($element, row) {
            loadFromListing(row);
        }, 'Load program from listing clicked');
        $programNameTable.onWrap('check-all.bs.table', function ($element, rows) {
            $programNameTable.find('.deleteSomeProg').removeClass('disabled');
            $programNameTable.find('#shareSome').removeClass('disabled');
            $programNameTable.find('.delete, .share, .gallery, .load').addClass('disabled');
        }, 'check all programs');
        $programNameTable.onWrap('check.bs.table', function (e, row, $element) {
            $programNameTable.find('.deleteSomeProg').removeClass('disabled');
            $programNameTable.find('#shareSome').removeClass('disabled');
            $programNameTable.find('.delete, .share, .gallery, .load').addClass('disabled');
        }, 'check one program');
        $programNameTable.onWrap('uncheck-all.bs.table', function ($element, rows) {
            $programNameTable.find('.deleteSomeProg').addClass('disabled');
            $programNameTable.find('#shareSome').addClass('disabled');
            $programNameTable.find('.delete, .share, .gallery, .load').filter(':not([data-status="disabled"])').removeClass('disabled');
        }, 'uncheck all programs');
        $programNameTable.onWrap('uncheck.bs.table', function (e, row, $element) {
            var selectedRows = $programNameTable.bootstrapTable('getSelections');
            if (!selectedRows || selectedRows.length === 0) {
                $programNameTable.find('.deleteSomeProg').addClass('disabled');
                $programNameTable.find('#shareSome').addClass('disabled');
                $programNameTable.find('.delete, .share, .gallery, .load').filter(':not([data-status="disabled"])').removeClass('disabled');
            }
        }, 'uncheck one program');
        $('#backProgList').onWrap('click', function () {
            $('#tabProgram').clickWrap();
            return false;
        }, 'back to program view');
        $(document).onWrap('click', '.deleteSomeProg', function () {
            var programs = $programNameTable.bootstrapTable('getSelections', {});
            var names = '<br>';
            for (var i = 0; i < programs.length; i++) {
                names += programs[i][0];
                names += '<br>';
            }
            $('#confirmDeleteProgramName').html(names);
            $('#confirmDeleteProgram').oneWrap('hide.bs.modal', function (event) {
                PROGLIST.loadProgList(update);
            });
            $('#confirmDeleteProgram').data('programs', programs);
            $('#confirmDeleteProgram').modal('show');
            return false;
        }, 'delete programs');
        $programNameTable.on('shown.bs.collapse hidden.bs.collapse', function (e) {
            $programNameTable.bootstrapTable('resetWidth');
        });
        function update(result) {
            UTIL.response(result);
            if (result.rc === 'ok') {
                $('#programNameTable').bootstrapTable('load', result.programNames);
                $('.deleteSomeProg').show();
            }
            else {
                if (result.cmd === 'loadPN') {
                    $('#backProgList').clickWrap();
                }
            }
            $('.deleteSomeProg').attr('data-original-title', Blockly.Msg.PROGLIST_DELETE_ALL_TOOLTIP || 'Click here to delete all selected programs.');
            $('#programNameTable')
                .find('.delete')
                .attr('data-original-title', Blockly.Msg.PROGLIST_DELETE_TOOLTIP || 'Click here to delete your program.');
            $('#programNameTable')
                .find('.share')
                .attr('data-original-title', Blockly.Msg.PROGLIST_SHARE_TOOLTIP || 'Click here to share your program with a friend.');
            $('#programNameTable')
                .find('.gallery')
                .attr('data-original-title', Blockly.Msg.PROGLIST_SHARE_WITH_GALLERY_TOOLTIP || 'Click here to upload your program to the gallery hence share it with all other users.');
            $('#programNameTable')
                .find('.load')
                .attr('data-original-title', Blockly.Msg.PROGLIST_LOAD_TOOLTIP || 'Click here to load your program in the programming environment.');
            $('#programNameTable').find('[rel="tooltip"]').tooltip();
        }
    }
    function updateExamplePrograms(result) {
        UTIL.response(result);
        if (result.rc === 'ok') {
            $('#programNameTable').bootstrapTable('load', result.programNames);
            $('#programNameTable').bootstrapTable('hideColumn', 2);
            $('#programNameTable').bootstrapTable('hideColumn', 6);
            $('#programNameTable').bootstrapTable('refreshOptions', {
                sortName: 0,
                sortOrder: 'asc',
            });
            $('.deleteSomeProg').hide();
        }
        else {
            if (result.cmd === 'loadPN') {
                $('#backProgList').clickWrap();
            }
        }
        $('#programNameTable')
            .find('.load')
            .attr('data-original-title', Blockly.Msg.PROGLIST_LOAD_TOOLTIP || 'Click here to load your program in the programming environment.');
        $('#programNameTable').find('[rel="tooltip"]').tooltip();
    }
    var eventsRelations = {
        'click .showRelations': function (e, value, row, index) {
            e.stopPropagation();
            var collapseName = '.relation' + index;
            $(collapseName).collapse('toggle');
        },
    };
    var eventsDeleteShareLoad = {
        'click .delete': function (e, value, row, index) {
            e.stopPropagation();
            var selectedRows = [row];
            var names = '<br>';
            for (var i = 0; i < selectedRows.length; i++) {
                names += selectedRows[i][0];
                names += '<br>';
            }
            $('#confirmDeleteProgramName').html(names);
            $('#confirmDeleteProgram').data('programs', selectedRows);
            $('#confirmDeleteProgram').oneWrap('hidden.bs.modal', function (event) { });
            $('#confirmDeleteProgram').modal('show');
            return false;
        },
        'click .share': function (e, value, row, index) {
            e.stopPropagation();
            if (!row[2].sharedFrom) {
                $('#show-relations').trigger('updateAndShow', [row]);
            }
            return false;
        },
        'click .gallery': function (e, value, row, index) {
            e.stopPropagation();
            if (!row[2].sharedFrom && !GUISTATE_C.isUserMemberOfUserGroup()) {
                $('#share-with-gallery').trigger('updateAndShow', [row]);
            }
            return false;
        },
        'click .load': function (e, value, row, index) {
            e.stopPropagation();
            loadFromListing(row);
        },
    };
    var formatRelations = function (value, row, index) {
        if ($.isEmptyObject(value)) {
            return '<span class="typcn typcn-minus"></span>';
        }
        if (value.sharedFrom === 'READ') {
            return '<span class="typcn typcn-eye"></span>';
        }
        if (value.sharedFrom === 'WRITE') {
            return '<span class="typcn typcn-pencil"></span>';
        }
        if (value.sharedFrom === 'X_WRITE') {
            return '<span class="typcn typcn-key"></span>';
        }
        if (value.sharedWith && value.sharedWith.length == 1) {
            var result = '';
            $.each(value.sharedWith, function (i, obj) {
                result += '<span>';
                if (obj.type === 'User' && obj.label === 'Roberta') {
                    // should not happen
                }
                else if (obj.right === 'READ') {
                    result += '<span class="typcn typcn-eye"></span>';
                }
                else if (obj.right === 'X_WRITE') {
                    result += '<span class="typcn typcn-key"></span>';
                }
                else if (obj.right === 'WRITE') {
                    result += '<span class="typcn typcn-pencil"></span>';
                }
                if (obj.type === 'User') {
                    result += '&nbsp;<span class="typcn typcn-user"></span>';
                }
                else if (obj.type === 'UserGroup') {
                    result += '&nbsp;<span class="typcn typcn-group"></span>';
                }
                result += '&nbsp;';
                result += '<span class="value">';
                result += obj.label;
                result += '</span>';
                result += '</span>';
            });
            return result;
        }
        if (value.sharedWith && Object.keys(value.sharedWith).length > 1) {
            var result = [];
            $.each(value.sharedWith, function (i, obj) {
                var typeLabel = '';
                if (obj.type === 'User') {
                    typeLabel = '&nbsp;<span class="typcn typcn-user"></span>';
                }
                else if (obj.type === 'UserGroup') {
                    typeLabel = '&nbsp;<span class="typcn typcn-group"></span>';
                }
                if (obj.type === 'User' && obj.label === 'Roberta') {
                    //Do nothing
                }
                else if (obj.right === 'READ') {
                    result.push('<span class="typcn typcn-eye"></span>' + typeLabel + '&nbsp;<span class="value">' + obj.label + '</span>');
                }
                else if (obj.right === 'WRITE') {
                    result.push('<span class="typcn typcn-pencil"></span>' + typeLabel + '&nbsp;<span class="value">' + obj.label + '</span>');
                }
            });
            var resultString = '<div style="white-space:nowrap;"><span style="float:left;">';
            resultString += result[0];
            resultString +=
                '</span><a class="collapsed showRelations" href="#" style="float:right;"' +
                    'href="#" data-toggle="collapse" data-target=".relation' +
                    index +
                    '"></a></div>';
            for (var i = 1; i < result.length; i++) {
                resultString += '<div style="clear:both;" class="collapse relation' + index + '">';
                resultString += result[i];
                resultString += '</div>';
            }
            return resultString;
        }
    };
    var formatDeleteShareLoad = function (value, row, index) {
        // TODO check here and on the server, if this user is allowed to share programs
        var result = '';
        if ($('#tabProgList').data('type') === 'userProgram') {
            if (!GUISTATE_C.isUserMemberOfUserGroup() || GUISTATE_C.getUserUserGroupOwner() !== row[1]) {
                result +=
                    '<a href="#" class="delete" rel="tooltip" lkey="Blockly.Msg.PROGLIST_DELETE_TOOLTIP" data-original-title="" title=""><span class="typcn typcn-delete"></span></a>';
            }
            else {
                result += '<a href="#" class="delete disabled" data-status="disabled"><span class="typcn typcn-delete"></span></a>';
            }
            if (row[2].sharedFrom) {
                result += '<a href="#" class="share disabled" data-status="disabled"><span class="typcn typcn-flow-merge"></span></a>';
                if (!GUISTATE_C.isUserMemberOfUserGroup()) {
                    result += '<a href="#" class="gallery disabled" data-status="disabled"><span class="typcn typcn-th-large-outline"></span></a>';
                }
            }
            else {
                result +=
                    '<a href="#" class="share" rel="tooltip" lkey="Blockly.Msg.PROGLIST_SHARE_TOOLTIP" data-original-title="" title=""><span class="typcn typcn-flow-merge"></span></a>';
                if (!GUISTATE_C.isUserMemberOfUserGroup()) {
                    result +=
                        '<a href="#" class="gallery" rel="tooltip" lkey="Blockly.Msg.PROGLIST_SHARE_WITH_GALLERY_TOOLTIP" data-original-title="" title=""><span class="typcn typcn-th-large-outline"></span></a>';
                }
            }
        }
        result +=
            '<a href="#" class="load" rel="tooltip" lkey="Blockly.Msg.PROGLIST_LOAD_TOOLTIP" data-original-title="" title=""><span class="typcn typcn-document"></span></a>';
        return result;
    };
    var sortRelations = function (a, b) {
        if ($.isEmptyObject(a) && $.isEmptyObject(b)) {
            return 0;
        }
        if (a.sharedFrom && b.sharedFrom) {
            if (a.sharedFrom === 'WRITE' && b.sharedFrom === 'WRITE')
                return 0;
            if (a.sharedFrom === 'WRITE')
                return 1;
            else
                return -1;
        }
        if (a.sharedWith && b.sharedWith) {
            var value = {
                a: a.sharedWith[0].right,
                b: b.sharedWith[0].right,
            };
            if (value.a === value.b)
                return 0;
            if (value.a === 'WRITE')
                return 1;
            else
                return -1;
        }
        if ($.isEmptyObject(a)) {
            return -1;
        }
        if ($.isEmptyObject(b)) {
            return 1;
        }
        if (a.sharedWith) {
            return 1;
        }
        return -1;
    };
    var titleActions = '<a href="#" id="deleteSomeProg" class="deleteSomeProg disabled" rel="tooltip" lkey="Blockly.Msg.PROGLIST_DELETE_ALL_TOOLTIP" data-original-title="" data-container="body" title="">' +
        '<span class="typcn typcn-delete"></span></a>';
    /**
     * Load the program and configuration that was selected in program list
     */
    function loadFromListing(program) {
        var right = 'none';
        LOG.info('loadFromList ' + program[0]);
        PROGRAM.loadProgramFromListing(program[0], program[1], program[3], function (result) {
            if (result.rc === 'ok') {
                result.programShared = false;
                var alien = program[1] === GUISTATE_C.getUserAccountName() ? null : program[1];
                if (alien) {
                    result.programShared = 'READ';
                }
                if (program[2].sharedFrom) {
                    var right = program[2].sharedFrom;
                    result.programShared = right;
                }
                result.name = program[0];
                GUISTATE_C.setProgram(result, alien);
                GUISTATE_C.setProgramXML(result.progXML);
                if (result.configName === undefined) {
                    if (result.confXML === undefined) {
                        // Set default configuration
                        GUISTATE_C.setConfigurationNameDefault();
                        GUISTATE_C.setConfigurationXML(GUISTATE_C.getConfigurationConf());
                    }
                    else {
                        // Set anonymous configuration
                        GUISTATE_C.setConfigurationName('');
                        GUISTATE_C.setConfigurationXML(result.confXML);
                    }
                }
                else {
                    // Set named configuration
                    GUISTATE_C.setConfigurationName(result.configName);
                    GUISTATE_C.setConfigurationXML(result.confXML);
                }
                $('#tabProgram').oneWrap('shown.bs.tab', function (e) {
                    CONFIGURATION_C.reloadConf();
                    PROGRAM_C.reloadProgram();
                    // this is a temporary function to  inform users about possible data loss from bug issue #924
                    // TODO review this in 4 weeks and remove it if possible
                    checkMissingInformaton(result);
                });
                $('#tabProgram').clickWrap();
            }
            MSG.displayInformation(result, '', result.message);
        });
    }
    /**
     * this is a temporary function to  inform users about possible data loss from bug issue #924
     * TODO review this in 4 weeks and remove it if possible
     */
    function checkMissingInformaton(result) {
        if (GUISTATE_C.getRobotGroup() === 'calliope' || GUISTATE_C.getRobotGroup() === 'microbit') {
            var begin = new Date('2020-10-28 03:00:00').getTime();
            var end = new Date('2020-11-04 03:00:00').getTime();
            var setWarning = function (block) {
                if (GUISTATE_C.getLanguage().toLowerCase() === 'de') {
                    block.setWarningText('Hier sind beim letzten Speichern Information verloren gegangen,\nbitte überprüfe die Parameter und sichere das Programm! :-)');
                }
                else {
                    block.setWarningText('Information was lost during the last save,\nplease check the parameters and store the program! :-)');
                }
                block.warning.setVisible(true);
            };
            if (result.lastChanged && result.lastChanged > begin && result.lastChanged < end) {
                var blocks = Blockly.getMainWorkspace() && Blockly.getMainWorkspace().getAllBlocks();
                blocks.forEach(function (block) {
                    switch (block.type) {
                        case 'mbedActions_play_note':
                        case 'robSensors_accelerometer_getSample':
                        case 'robSensors_gyro_getSample':
                            setWarning(block);
                            break;
                        case 'robSensors_getSample':
                            if (block.sensorType_ && (block.sensorType_ === 'ACCELEROMETER_VALUE' || block.sensorType_ === 'GYRO_ANGLE')) {
                                setWarning(block);
                            }
                            break;
                        default:
                            break;
                    }
                });
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ0xpc3QuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9jb250cm9sbGVyL3Byb2dMaXN0LmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBOztPQUVHO0lBQ0gsU0FBUyxJQUFJO1FBQ1QsWUFBWSxFQUFFLENBQUM7UUFDZixrQkFBa0IsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFDUSxvQkFBSTtJQUViLFNBQVMsWUFBWTtRQUNqQixDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxjQUFjLENBQUM7WUFDbEMsTUFBTSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUNsQyxRQUFRLEVBQUUsaUJBQWlCO1lBQzNCLE9BQU8sRUFBRSxrQkFBa0I7WUFDM0IsWUFBWSxFQUFFLE1BQU07WUFDcEIsV0FBVyxFQUFFLE1BQU07WUFDbkIsUUFBUSxFQUFFLENBQUM7WUFDWCxTQUFTLEVBQUUsTUFBTTtZQUNqQixvQkFBb0IsRUFBRSxNQUFNO1lBQzVCLFVBQVUsRUFBRSxNQUFNO1lBQ2xCLFlBQVksRUFBRSxPQUFPO1lBQ3JCLFNBQVMsRUFBRSxNQUFNO1lBQ2pCLFdBQVcsRUFBRSxPQUFPO1lBQ3BCLEtBQUssRUFBRTtnQkFDSCxvQkFBb0IsRUFBRSxxQkFBcUI7Z0JBQzNDLGtCQUFrQixFQUFFLFlBQVk7Z0JBQ2hDLE9BQU8sRUFBRSxlQUFlO2FBQzNCO1lBQ0QsT0FBTyxFQUFFO2dCQUNMO29CQUNJLEtBQUssRUFBRSxrREFBa0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLElBQUksb0JBQW9CLENBQUMsR0FBRyxTQUFTO29CQUNwSSxRQUFRLEVBQUUsSUFBSTtpQkFDakI7Z0JBQ0Q7b0JBQ0ksS0FBSyxFQUFFLGdEQUFnRCxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFB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