define(["require", "exports", "message", "util", "userGroup.model", "guiState.controller", "language.controller", "jquery", "blockly", "bootstrap-table", "bootstrap-tagsinput"], function (require, exports, MSG, UTIL, USERGROUP, GUISTATE_C, LANG, $, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = exports.showPanel = void 0;
    var $userGroupTable;
    var $userGroupMemberTable;
    var userGroupMemberThreshold = 99;
    var memberNameValidators = {};
    function showPanel() {
        $userGroupTable.bootstrapTable('showLoading');
        USERGROUP.loadUserGroupList(function (data) {
            if (data.rc === 'ok') {
                $userGroupTable.bootstrapTable('load', data.userGroups);
            }
            else {
                $userGroupTable.bootstrapTable('removeAll');
                MSG.displayInformation(data, data.cause, data.cause);
            }
            setTimeout(function () {
                //The fronted can not calculate the height of the table if it tries to directly after the table is filled.
                //So we wait 250ms. If you set it to a shorter amount, it wont work again.
                $userGroupTable.bootstrapTable('resetView', {
                    height: UTIL.calcDataTableHeight(),
                });
                $userGroupTable.find('[data-toggle="tooltip"]').tooltip();
                $userGroupTable.bootstrapTable('hideLoading');
            }, 250);
        });
        $('#tabUserGroupList').clickWrap();
        if (GUISTATE_C.getView() !== 'tabUserGroupList') {
            GUISTATE_C.setView('tabUserGroupList');
        }
    }
    exports.showPanel = showPanel;
    /**
     * Initialize table of tutorials
     */
    function init() {
        $userGroupTable = $('#userGroupTable');
        $userGroupMemberTable = $('#userGroupMemberTable');
        initUserGroupListTable();
        initUserGroupEvents();
        initUserGroupMemberListTable();
        initUserGroupMemberEvents();
        initAddMembersToGroupEvents();
    }
    exports.init = init;
    function initUserGroupListTable() {
        var $actionItemsTemplate = $userGroupTable.find('.action-items-template');
        $actionItemsTemplate.remove();
        $userGroupTable.bootstrapTable({
            height: UTIL.calcDataTableHeight(),
            pageList: '[ 10, 25, All ]',
            toolbar: '#userGroupListToolbar',
            toolbarAlign: 'none',
            showRefresh: true,
            sortName: 'created',
            sortOrder: 'desc',
            showPaginationSwitch: true,
            pagination: true,
            buttonsAlign: 'right',
            resizable: true,
            iconsPrefix: 'typcn',
            icons: {
                paginationSwitchDown: 'typcn-document-text',
                paginationSwitchUp: 'typcn-book',
                refresh: 'typcn-refresh',
            },
            columns: [
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_USERGROUP_NAME'>" + (Blockly.Msg.DATATABLE_USERGROUP_NAME || 'Name der Gruppe') + '</span>',
                    field: 'name',
                    sortable: true,
                },
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_MEMBERS'>" + (Blockly.Msg.DATATABLE_MEMBERS || 'Mitglieder') + '</span>',
                    field: 'members',
                    sortable: true,
                    sorter: function (a, b) {
                        return (a.length || 0) - (b.length || 0);
                    },
                    formatter: function (value, row, index) {
                        return value.length || 0;
                    },
                },
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_SHARED_PROGRAMS'>" + (Blockly.Msg.DATATABLE_SHARED_PROGRAMS || 'Geteilte Programme') + '</span>',
                    field: 'programs',
                    sortable: false,
                    formatter: function (value, row, index) {
                        if (!value || !value.length) {
                            var $returnValue = $('<div><span lkey="Blockly.Msg.SHARE_PROGRAMS_USERGROUP_HINT" data-translation-targets="title" data-toggle="tooltip" data-container="body" data-placement="right" title="">-</span></div>');
                            LANG.translate($returnValue);
                            return $returnValue.html();
                        }
                        var programFormatter = function (program) {
                            var relationIconKey = '';
                            if (program.right === 'READ') {
                                relationIconKey = 'eye';
                            }
                            else if (program.right === 'X_WRITE') {
                                relationIconKey = 'key';
                            }
                            else if (program.right === 'WRITE') {
                                relationIconKey = 'pencil';
                            }
                            var $returnValue = $('<div>' +
                                '<span>' +
                                '<span class="typcn typcn-' +
                                program.robot +
                                '"></span> ' +
                                '<span class="typcn typcn-' +
                                relationIconKey +
                                '"></span> ' +
                                program.name +
                                '</span>' +
                                '</div>');
                            LANG.translate($returnValue);
                            return $returnValue.html();
                        };
                        if (value.length === 1) {
                            return programFormatter(value[0]);
                        }
                        else {
                            var entries = value.map(function (program) {
                                return programFormatter(program);
                            });
                            var $returnValue = $('<div>' +
                                '<div style="white-space:nowrap;">' +
                                '<span style="float:left;">' +
                                entries.shift() +
                                '</span>' +
                                '<a class="collapsed showRelations" href="#" style="float:right;" href="#" data-toggle="collapse" data-target=".relation' +
                                index +
                                '"></a>' +
                                '</div>' +
                                entries
                                    .map(function (entry) {
                                    return '<div style="clear:both;" class="collapse relation' + index + '"> ' + entry + '</div>';
                                })
                                    .join('') +
                                '</div>');
                            LANG.translate($returnValue);
                            return $returnValue.html();
                        }
                    },
                    events: {
                        'click .showRelations': function (e, value, row, index) {
                            e.stopPropagation();
                            var collapseName = '.relation' + index;
                            $(collapseName).collapse('toggle');
                        },
                    },
                },
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_CREATED_ON'>" + (Blockly.Msg.DATATABLE_CREATED_ON || 'Erzeugt am') + '</span>',
                    field: 'created',
                    sortable: true,
                    formatter: UTIL.formatDate,
                },
                {
                    checkbox: true,
                    valign: 'middle',
                },
                {
                    title: '<a href="#" id="deleteUserGroups" class="deleteSome disabled" rel="tooltip" lkey="Blockly.Msg.USERGROUP_LIST_DELETE_ALL_TOOLTIP" data-original-title="" data-container="body" title="" data-translation-targets="title data-original-title">' +
                        '<span class="typcn typcn-delete"></span></a>',
                    events: {
                        'click .delete': function (e, value, row, index) {
                            e.stopPropagation();
                            var groupName = typeof row.name === undefined ? null : row.name, groupMembers = typeof row.members === undefined ? [] : row.members, $button = $(this), deleteFunction = function () {
                                USERGROUP.deleteUserGroup(row.name, function (data) {
                                    if (data.rc === 'ok') {
                                        $userGroupTable.bootstrapTable('remove', { field: 'name', values: [row.name] });
                                    }
                                    else {
                                        UTIL.showMsgOnTop(data.message);
                                    }
                                });
                            };
                            if (groupName === null || $button.hasClass('disabled')) {
                                return;
                            }
                            if (!groupMembers.length) {
                                deleteFunction();
                                return;
                            }
                            else if (groupMembers.filter(function (groupMember) {
                                return !groupMember.hasDefaultPassword;
                            }).length === 0) {
                                var modalMessageKey = 'USERGROUP_DELETE_WITH_MEMBERS_WARNING', modalMessage = Blockly.Msg[modalMessageKey] ||
                                    'Are your sure that you want to delete the usergroup including all members? No member did log in so far.';
                                $('#show-message-confirm').oneWrap('shown.bs.modal', function (e) {
                                    $('#confirm').off();
                                    $('#confirm').on('click', function (e) {
                                        e.preventDefault();
                                        deleteFunction(true);
                                    });
                                    $('#confirmCancel').off();
                                    $('#confirmCancel').on('click', function (e) {
                                        e.preventDefault();
                                        $('.modal').modal('hide');
                                    });
                                });
                                MSG.displayPopupMessage(modalMessageKey, modalMessage, 'OK', Blockly.Msg.POPUP_CANCEL);
                            }
                            else {
                                UTIL.showMsgOnTop('ORA_GROUP_DELETE_ERROR_GROUP_HAS_MEMBERS');
                            }
                        },
                    },
                    align: 'left',
                    valign: 'top',
                    formatter: function (value, row, index) {
                        return $actionItemsTemplate.find('td').html();
                    },
                    width: '117px',
                },
            ],
        });
        $('#userGroupList').find('[data-toggle="tooltip"]').tooltip();
        $userGroupTable.bootstrapTable('togglePagination');
        LANG.translate($('#userGroupList'));
    }
    /* This is an internal function and a part of the initialization. Do not export it. */
    function initUserGroupEvents() {
        var $userGroupList = $userGroupTable.closest('#userGroupList');
        $(window).resize(function () {
            $userGroupTable.bootstrapTable('resetView', {
                height: UTIL.calcDataTableHeight(),
            });
        });
        $userGroupList.find('[data-toggle="tooltip"]').tooltip();
        $('#create-user-group').find('[data-toggle="tooltip"]').tooltip();
        $userGroupList.find('button[name="refresh"]').onWrap('click', function (evt) {
            evt.preventDefault();
            showPanel();
        }, 'refreshed usergroup view');
        $userGroupTable.onWrap('check-all.bs.table', function ($element, rows) {
            $userGroupList.find('.deleteSome').removeClass('disabled');
            $userGroupTable.find('.delete').addClass('disabled');
        }, 'check all usergroups');
        $userGroupTable.onWrap('check.bs.table', function ($element, row) {
            $userGroupList.find('.deleteSome').removeClass('disabled');
            $userGroupTable.find('.delete').addClass('disabled');
        }, 'check one usergroup');
        $userGroupTable.onWrap('uncheck-all.bs.table', function ($element, rows) {
            $userGroupList.find('.deleteSome').addClass('disabled');
            $userGroupTable.find('.delete').filter(':not([data-status="disabled"])').removeClass('disabled');
        }, 'uncheck all usergroups');
        $userGroupTable.onWrap('uncheck.bs.table', function ($element, row) {
            var selectedRows = $userGroupTable.bootstrapTable('getSelections');
            if (!selectedRows || selectedRows.length === 0) {
                $userGroupList.find('.deleteSome').addClass('disabled');
                $userGroupTable.find('.delete').filter(':not([data-status="disabled"])').removeClass('disabled');
            }
        }, 'uncheck one usergroup');
        $userGroupList.find('.deleteSome').onWrap('click', function () {
            var selectedRows = $userGroupTable.bootstrapTable('getSelections'), $deleteAllButton = $userGroupList.find('.deleteSome');
            if (!selectedRows || selectedRows.length === 0 || $deleteAllButton.hasClass('disabled')) {
                return;
            }
            var groupNames = selectedRows.map(function (row) {
                return row.name;
            });
            if (selectedRows.reduce(function (carry, element) {
                return carry || (element && element.members && element.members.length > 0);
            }, false)) {
                if (selectedRows.reduce(function (carry, element) {
                    return (carry ||
                        (element &&
                            element.members &&
                            element.members.filter(function (member) {
                                return !member.hasDefaultPassword;
                            }).length > 0));
                }, false)) {
                    //Logged in users exist. Delete them first.
                    MSG.displayInformation({}, '', 'ORA_GROUP_DELETE_ERROR_GROUP_HAS_MEMBERS');
                }
                else {
                    var modalMessageKey = 'USERGROUP_DELETE_WITH_MEMBERS_WARNING', modalMessage = Blockly.Msg[modalMessageKey] ||
                        'Are your sure that you want to delete the usergroup including all members? No member did log in so far.';
                    $('#show-message-confirm').oneWrap('shown.bs.modal', function (e) {
                        $('#confirm').off();
                        $('#confirm').on('click', function (e) {
                            e.preventDefault();
                            USERGROUP.deleteUserGroups(groupNames, function (data) {
                                if (data.rc === 'ok') {
                                    $userGroupTable.bootstrapTable('remove', { field: 'name', values: groupNames });
                                }
                                else {
                                    UTIL.showMsgOnTop(data.message);
                                }
                            });
                        });
                        $('#confirmCancel').off();
                        $('#confirmCancel').on('click', function (e) {
                            e.preventDefault();
                            $('.modal').modal('hide');
                        });
                    });
                    MSG.displayPopupMessage(modalMessageKey, modalMessage, 'OK', Blockly.Msg.POPUP_CANCEL);
                }
            }
            else {
                //No group has members. => Delete all directly
                USERGROUP.deleteUserGroups(groupNames, function (data) {
                    if (data.rc === 'ok') {
                        $userGroupTable.bootstrapTable('remove', { field: 'name', values: groupNames });
                    }
                    else {
                        UTIL.showMsgOnTop(data.message);
                    }
                });
            }
        }, 'bulk delete usergroup');
        $('#backUserGroupList').onWrap('click', function () {
            $('#tabProgram').clickWrap();
            return false;
        }, 'closed usergroup view and went back to program view.');
        $userGroupTable.onWrap('click-row.bs.table', function (e, rowData, row) {
            openDetailUserGroupView(rowData);
        }, 'show usergroup member view');
        initCreateUserGroupEvents();
    }
    /* This is an internal function and a part of the initialization. Do not export it. */
    function initCreateUserGroupEvents() {
        var $createUserGroupModal = $('#create-user-group'), $createUserGroupForm = $createUserGroupModal.find('#user-group-form');
        $('#showCreateUserGroupPopup').clickWrap(function () {
            $createUserGroupForm.validate();
            $createUserGroupModal.modal('show');
            return false;
        });
        $('#create-user-group .close-button').clickWrap(function () {
            $createUserGroupModal.modal('hide');
            return false;
        });
        $.validator.addMethod('isValidGroupName', function (value, element) {
            return value.trim() !== '' && !/[^a-zA-Z0-9=+!?.,%#+&^@_\- ]/gi.test(value.trim());
        }, Blockly.Msg['ORA_GROUP_ERROR_NAME_INVALID']);
        $.validator.addMethod('isOptionalIntBiggerEquals0Regex', function (value, element) {
            return /^\d*$/.test(value.trim());
        }, Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE']);
        $.validator.addMethod('isOptionalOrNotOverThreshold', function (value, element) {
            return isNaN(value) || value.trim() === '' || parseInt(value.trim()) <= userGroupMemberThreshold;
        }, Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_LIMIT_REACHED']);
        $createUserGroupForm.removeData('validator');
        $createUserGroupForm.validate({
            rules: {
                name: {
                    required: true,
                    isValidGroupName: true,
                },
                initialMembers: {
                    isOptionalIntBiggerEquals0Regex: true,
                    isOptionalOrNotOverThreshold: true,
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertBefore(element.parent());
            },
            messages: {
                name: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    isValidGroupName: Blockly.Msg['ORA_GROUP_ERROR_NAME_INVALID'],
                },
                initialMembers: {
                    isOptionalIntBiggerEquals0Regex: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE'],
                    isOptionalOrNotOverThreshold: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_LIMIT_REACHED'],
                    min: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE'],
                    max: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE'],
                    step: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE'],
                    number: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE'],
                },
            },
        });
        $('#create-user-group .accept-button').clickWrap(function () {
            var validator = $createUserGroupForm.validate(), groupName = $('#userGroupNameInput').val(), initialMembersCount = $('#initialMembersInput').val().trim(), initialMembers = [], formatter = new Intl.NumberFormat('en-US', { minimumIntegerDigits: 2 });
            if (!$createUserGroupForm.valid()) {
                return;
            }
            initialMembersCount = initialMembersCount === '' ? 0 : parseInt(initialMembersCount);
            for (var i = 1; i <= initialMembersCount; i++) {
                initialMembers.push(formatter.format(i));
            }
            USERGROUP.createUserGroup(groupName, initialMembers, function (data) {
                if (data.rc === 'ok') {
                    var tableData = $userGroupTable.bootstrapTable('getData');
                    //Clone array, because the original array is directly linked to the bootstrap table.
                    //No need to clone the items in it, though, normal reference copy is enough.
                    tableData = tableData.map(function (item) {
                        return item;
                    });
                    tableData.unshift(data.userGroup);
                    $userGroupTable.bootstrapTable('showLoading');
                    $userGroupTable.bootstrapTable('removeAll');
                    $userGroupTable.bootstrapTable('load', tableData);
                    $userGroupTable.bootstrapTable('hideLoading');
                    $createUserGroupModal.modal('hide');
                    $('#userGroupNameInput').val('');
                    $('#initialMembersInput').val(0);
                }
                else {
                    switch (data.cause) {
                        case 'ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE':
                        case 'ORA_GROUP_ADD_MEMBER_ERROR_LIMIT_REACHED':
                            validator.showErrors({
                                initialMembers: Blockly.Msg[data.cause],
                            });
                            break;
                        case 'ORA_GROUP_ERROR_NAME_INVALID':
                        case 'ORA_GROUP_CREATE_ERROR_GROUP_ALREADY_EXISTS':
                        default:
                            validator.showErrors({
                                name: Blockly.Msg[data.cause],
                            });
                    }
                }
            });
            return false;
        });
    }
    /* This is an internal function and a part of the initialization. Do not export it. */
    function initUserGroupMemberListTable() {
        var $memberPasswordResetTemplate = $userGroupMemberTable.find('.reset-password-template'), $memberActionItemsTemplate = $userGroupMemberTable.find('.action-items-template'), $memberActionItemsHeaderTemplate = $userGroupMemberTable.find('.action-items-header-template'), $memberNameTemplate = $userGroupMemberTable.find('.edit-member-template'), nameChangeValidateOptions = {
            rules: {
                name: {
                    maxlength: 25,
                    loginRegex: true,
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertBefore(element);
            },
            messages: {
                name: {
                    maxlength: Blockly.Msg['VALIDATION_MAX_LENGTH'],
                    loginRegex: Blockly.Msg['VALIDATION_CONTAINS_SPECIAL_CHARACTERS'],
                },
            },
        };
        $memberPasswordResetTemplate.remove();
        $memberActionItemsTemplate.remove();
        $memberActionItemsHeaderTemplate.remove();
        $memberNameTemplate.remove();
        $.validator.addMethod('loginRegex', function (value, element) {
            return this.optional(element) || /^[a-zA-Z0-9=+!?.,%#+&^@_\- ]+$/gi.test(value);
        }, Blockly.Msg['VALIDATION_CONTAINS_SPECIAL_CHARACTERS']);
        $userGroupMemberTable.bootstrapTable({
            height: UTIL.calcDataTableHeight(),
            pageList: '[ 10, 25, All ]',
            toolbar: '#userGroupMemberListToolbar',
            toolbarAlign: 'none',
            showRefresh: true,
            sortName: 'account',
            sortOrder: 'asc',
            showPaginationSwitch: true,
            pagination: true,
            buttonsAlign: 'right',
            resizable: true,
            iconsPrefix: 'typcn',
            icons: {
                paginationSwitchDown: 'typcn-document-text',
                paginationSwitchUp: 'typcn-book',
                refresh: 'typcn-refresh',
            },
            columns: [
                {
                    title: "<span lkey='Blockly.Msg.MENU_USER_TOOLTIP'>" + (Blockly.Msg.MENU_USER_TOOLTIP || 'User') + '</span>',
                    field: 'account',
                    formatter: function (value, row, index) {
                        var $memberNameTemplateClone = $memberNameTemplate.find('td').clone(false), name = value.substr(value.lastIndexOf(':') + 1);
                        $memberNameTemplateClone.find('.member-name').text(name);
                        $memberNameTemplateClone.find('input').attr('value', name);
                        if (!row.hasDefaultPassword) {
                            $memberNameTemplateClone.find('.member-name-toggle-button').css('visibility', 'hidden');
                        }
                        if (row.id === 0) {
                            $memberNameTemplate.find('.active').removeClass('active');
                            $memberNameTemplateClone.find('.edit-member-name').addClass('active');
                            $memberNameTemplateClone.find('.member-name-edit-button').addClass('typcn-plus');
                            $memberNameTemplateClone.find('.member-name-edit-button').removeClass('typcn-tick');
                        }
                        if ($memberNameTemplateClone.find('.active').length === 0) {
                            $memberNameTemplateClone.find('.member-name').addClass('active');
                        }
                        return $memberNameTemplateClone.html();
                    },
                    events: {
                        'click .member-name-toggle-button': function (e, value, row, index) {
                            var $self = $(this).closest('td'), oldName = value.substr(value.lastIndexOf(':') + 1), newName = $self.find('input').first().val();
                            if (typeof memberNameValidators[index] === 'undefined') {
                                memberNameValidators[index] = $self.find('form').first().validate(nameChangeValidateOptions);
                            }
                            if ($self.find('.member-name').hasClass('active')) {
                                $self.find('.member-name').removeClass('active');
                                $self.find('.edit-member-name').addClass('active');
                                $self.find('.member-name-column').addClass('active');
                                $(document.body).on('click', function (e) {
                                    if ($(e.target).closest('tr[data-index="' + index + '"]').length === 0 &&
                                        !$self.find('.member-name-toggle-button').hasClass('disabled') &&
                                        $(e.target).closest('.modal').length === 0) {
                                        if (typeof newName === 'undefined' || newName === '' || newName === oldName) {
                                            $self.find('input').first().val(oldName);
                                        }
                                        $self.find('.member-name').addClass('active');
                                        $self.find('.edit-member-name').removeClass('active');
                                        $self.find('.member-name-column').removeClass('active');
                                        $(document.body).off(e);
                                    }
                                });
                                $self.find('input').first().select();
                            }
                            else {
                                $self.find('.member-name').addClass('active');
                                $self.find('.edit-member-name').removeClass('active');
                                $self.find('.member-name-column').removeClass('active');
                            }
                        },
                        'dblclick .member-name.active': function (e, value, row, index) {
                            var $toggleButton = $(this).closest('td').find('.member-name-toggle-button');
                            if ($toggleButton.is(':visible') &&
                                $toggleButton.css('visibility') !== 'hidden' &&
                                !$toggleButton.hasClass('disabled') &&
                                !$toggleButton.prop('disabled')) {
                                $(this).closest('td').find('.member-name-toggle-button').clickWrap();
                            }
                        },
                        'click .member-name-edit-button': function (e, value, row, index) {
                            var $button = $(this), $self = $button.closest('td'), $input = $self.find('input').first(), oldName = value.substr(value.lastIndexOf(':') + 1), newName = $input.val();
                            if (typeof memberNameValidators[index] === 'undefined') {
                                memberNameValidators[index] = $self.find('form').first().validate(nameChangeValidateOptions);
                            }
                            if (!$self.find('form').valid()) {
                                return;
                            }
                            if (typeof newName === 'undefined' || newName === '' || newName === oldName) {
                                if (row.id !== 0) {
                                    $self.find('.member-name-toggle-button').clickWrap();
                                }
                                return;
                            }
                            $button.addClass('typcn-arrow-sync');
                            $button.removeClass('typcn-tick');
                            $button.addClass('iais-loading-spin');
                            $self.find('input').prop('disabled', true);
                            $self.find('.member-name-toggle-button').addClass('disabled');
                            USERGROUP.updateMemberAccount(value, $('#userGroupMemberListHeader').text(), newName, function (data) {
                                if (data.rc === 'ok') {
                                    if (row.id !== 0) {
                                        //clone the current row data
                                        var rowData = JSON.parse(JSON.stringify(row));
                                        rowData.account = $('#userGroupMemberListHeader').text() + ':' + newName;
                                        delete memberNameValidators[index];
                                        $userGroupMemberTable.bootstrapTable('updateRow', {
                                            index: index,
                                            row: rowData,
                                            replace: true,
                                        });
                                    }
                                    else {
                                        $userGroupMemberTable.bootstrapTable('append', {
                                            id: 123,
                                            account: $('#userGroupMemberListHeader').text() + ':' + newName,
                                            hasDefaultPassword: true,
                                        });
                                    }
                                }
                                else {
                                    memberNameValidators[index].showErrors({
                                        name: Blockly.Msg[data.cause] || data.message,
                                    });
                                    $button.removeClass('iais-loading-spin');
                                    $button.addClass('typcn-tick');
                                    $button.removeClass('typcn-arrow-sync');
                                    $self.find('input').prop('disabled', false);
                                    $self.find('.member-name-toggle-button').removeClass('disabled');
                                }
                            });
                        },
                        'keydown input': function (e, value, row, index) {
                            if (e.originalEvent.keyCode === 13) {
                                e.preventDefault();
                                $(this).closest('td').find('.member-name-edit-button').clickWrap();
                                return false;
                            }
                        },
                        'submit form': function (e) {
                            e.preventDefault();
                            $(this).closest('td').find('.member-name-edit-button').clickWrap();
                            return false;
                        },
                    },
                    sortable: true,
                    sorter: function (a, b) {
                        if (a === '') {
                            return 1;
                        }
                        if (b === '') {
                            return -1;
                        }
                        return a.localeCompare(b);
                    },
                },
                {
                    title: "<span lkey='Blockly.Msg.POPUP_PASSWORD'>" + (Blockly.Msg.POPUP_PASSWORD || 'Password') + '</span>',
                    field: 'password',
                    formatter: function (value, row, index) {
                        if (row.id === 0 && row.account === '') {
                            return '';
                        }
                        return row.hasDefaultPassword ? row.account : '************';
                    },
                    sortable: false,
                    width: '33.3333%',
                },
                {
                    title: '<input name="btSelectAll" type="checkbox">',
                    formatter: function (value, row, index) {
                        if (row.id === 0) {
                            return '';
                        }
                        return '<input type="checkbox" name="btSelectItem" data-index="' + index + '">';
                    },
                    valign: 'middle',
                    halign: 'center',
                    align: 'center',
                    width: '37px',
                },
                {
                    title: $memberActionItemsHeaderTemplate.find('td').html(),
                    events: {
                        'click .delete': function (e, value, row, index) {
                            e.stopPropagation();
                            var $button = $(this);
                            if ($button.hasClass('disabled') || !row.account) {
                                return;
                            }
                            var deleteFunction = function (members) {
                                if (!members) {
                                    return;
                                }
                                var memberAccountNames = members.map(function (member) {
                                    return member.account;
                                });
                                USERGROUP.deleteGroupMembers(memberAccountNames[0].split(':', 2)[0], memberAccountNames, function (data) {
                                    if (data.rc === 'ok') {
                                        $userGroupMemberTable.bootstrapTable('remove', {
                                            field: 'account',
                                            values: memberAccountNames,
                                        });
                                    }
                                    else {
                                        UTIL.showMsgOnTop(data.message);
                                    }
                                });
                            };
                            /*
                         *
                        var hasDefaultPassword = members.reduce(function(carry, member) {
                            return carry && member.hasDefaultPassword;
                        }, true);
                         */
                            var modalMessageKey = row.hasDefaultPassword ? 'DELETE_USERGROUP_MEMBER_WARNING' : 'DELETE_USERGROUP_MEMBER_AFTER_LOGIN_WARNING', modalMessage = Blockly.Msg[modalMessageKey] ||
                                'The member you want to delete might have create own programs and did already log in. Are you sure, that you want to delete the member?';
                            $('#show-message-confirm').oneWrap('shown.bs.modal', function (e) {
                                $('#confirm').off();
                                $('#confirm').on('click', function (e) {
                                    e.preventDefault();
                                    deleteFunction([row]);
                                });
                                $('#confirmCancel').off();
                                $('#confirmCancel').on('click', function (e) {
                                    e.preventDefault();
                                    $('.modal').modal('hide');
                                });
                            });
                            MSG.displayPopupMessage(modalMessageKey, modalMessage, 'OK', Blockly.Msg.POPUP_CANCEL);
                        },
                        'click .reset-password': function (e, value, row, index) {
                            e.stopPropagation();
                            var $button = $(this);
                            if ($button.hasClass('disabled') || !row.account) {
                                return;
                            }
                            USERGROUP.setUserGroupMemberDefaultPassword(row.account.split(':', 2)[0], row.account, function (data) {
                                if (data.rc === 'ok') {
                                    row.hasDefaultPassword = true;
                                    $userGroupMemberTable.bootstrapTable('updateRow', {
                                        index: index,
                                        row: row,
                                        replace: true,
                                    });
                                    $button.addClass('disabled');
                                }
                                else {
                                    UTIL.showMsgOnTop(data.message);
                                }
                            });
                        },
                    },
                    align: 'left',
                    valign: 'top',
                    formatter: function (value, row, index) {
                        if (row.id === 0 && row.account === '') {
                            return '';
                        }
                        var $element = $memberActionItemsTemplate.clone(true);
                        if (row.hasDefaultPassword) {
                            var $button = $element.find('.reset-password');
                            $button.addClass('disabled');
                            $button.attr('data-status', 'disabled');
                        }
                        LANG.translate($element);
                        return $element.find('td').html();
                    },
                    width: '117px',
                },
            ],
        });
        $('#userGroupMemberList').find('[data-toggle="tooltip"]').tooltip();
        $userGroupMemberTable.bootstrapTable('togglePagination');
        LANG.translate($('#userGroupMemberList'));
    }
    /* This is an internal function and a part of the initialization. Do not export it. */
    function initUserGroupMemberEvents() {
        $(window).resize(function () {
            $userGroupMemberTable.bootstrapTable('resetView', {
                height: UTIL.calcDataTableHeight(),
            });
        });
        $userGroupMemberTable
            .closest('#userGroupMemberList')
            .find('button[name="refresh"]')
            .onWrap('click', function (evt) {
            evt.preventDefault();
            var groupName = $('#userGroupMemberListHeader').text();
            $userGroupMemberTable.bootstrapTable('showLoading');
            USERGROUP.loadUserGroup(groupName, function (data) {
                if (data.rc === 'ok' && typeof data.userGroup !== 'undefined' && typeof data.userGroup.members !== 'undefined') {
                    var members = data.userGroup.members;
                    members.push({
                        id: 0,
                        account: '',
                        hasDefaultPassword: false,
                    });
                    $userGroupMemberTable.bootstrapTable('load', data.userGroup.members);
                    memberNameValidators = {};
                }
                else {
                    $userGroupMemberTable.bootstrapTable('removeAll');
                    MSG.displayInformation(data, data.cause, data.cause);
                }
                setTimeout(function () {
                    //The fronted can not calculate the height of the table if it tries to directly after the table is filled.
                    //So we wait 250ms. If you set it to a shorter amount, it wont work again.
                    $userGroupMemberTable.bootstrapTable('resetView', {
                        height: UTIL.calcDataTableHeight(),
                    });
                    $userGroupMemberTable.bootstrapTable('hideLoading');
                }, 250);
            });
        }, 'refreshed usergroup member view');
        $userGroupMemberTable.onWrap('check-all.bs.table', function (e, rows) {
            $userGroupMemberTable.closest('#userGroupMemberList').find('.deleteSome').removeClass('disabled');
            var atLeastOneHasNotDefaultPassword = rows.reduce(function (noDefaultPasswordFound, row) {
                return noDefaultPasswordFound || !row.hasDefaultPassword;
            }, false);
            if (atLeastOneHasNotDefaultPassword) {
                $userGroupMemberTable.closest('#userGroupMemberList').find('.resetPasswords').removeClass('disabled');
            }
            $userGroupMemberTable.find('.delete, .reset-password').addClass('disabled');
        }, 'check all usergroups');
        $userGroupMemberTable.onWrap('check.bs.table', function (e, row, $element) {
            $userGroupMemberTable.closest('#userGroupMemberList').find('.deleteSome').removeClass('disabled');
            if (!row.hasDefaultPassword) {
                $userGroupMemberTable.closest('#userGroupMemberList').find('.resetPasswords').removeClass('disabled');
            }
            $userGroupMemberTable.find('.delete, .reset-password').addClass('disabled');
        }, 'check one usergroup');
        $userGroupMemberTable.onWrap('uncheck-all.bs.table', function (e, rows) {
            $userGroupMemberTable.closest('#userGroupMemberList').find('.deleteSome, .resetPasswords').addClass('disabled');
            $userGroupMemberTable.find('.delete, .reset-password').filter(':not([data-status="disabled"])').removeClass('disabled');
        }, 'uncheck all usergroups');
        $userGroupMemberTable.onWrap('uncheck.bs.table', function (e, row, $element) {
            var selectedRows = $userGroupMemberTable.bootstrapTable('getSelections');
            if (!selectedRows || selectedRows.length === 0) {
                $userGroupMemberTable.closest('#userGroupMemberList').find('.deleteSome, .resetPasswords').addClass('disabled');
                $userGroupMemberTable.find('.delete, .reset-password').filter(':not([data-status="disabled"])').removeClass('disabled');
            }
            else {
                var atLeastOneHasNotDefaultPassword = selectedRows.reduce(function (noDefaultPasswordFound, row) {
                    return noDefaultPasswordFound || !row.hasDefaultPassword;
                }, false);
                if (!atLeastOneHasNotDefaultPassword) {
                    $userGroupMemberTable.closest('#userGroupMemberList').find('.resetPasswords').addClass('disabled');
                }
            }
        }, 'uncheck one usergroup');
        $userGroupMemberTable
            .closest('#userGroupMemberList')
            .find('.deleteSome')
            .onWrap('click', function () {
            var selectedRows = $userGroupMemberTable.bootstrapTable('getSelections'), $deleteSomeButton = $userGroupMemberTable.closest('#userGroupMemberList').find('.deleteSome');
            if (!selectedRows || selectedRows.length === 0 || $deleteSomeButton.hasClass('disabled')) {
                return;
            }
            var hasDefaultPassword = selectedRows.reduce(function (carry, member) {
                return carry && member.hasDefaultPassword;
            }, true), deleteFunction = function (members) {
                if (!members) {
                    return;
                }
                var memberAccountNames = members.map(function (member) {
                    return member.account;
                });
                USERGROUP.deleteGroupMembers(memberAccountNames[0].split(':', 2)[0], memberAccountNames, function (data) {
                    if (data.rc === 'ok') {
                        $userGroupMemberTable.bootstrapTable('remove', {
                            field: 'account',
                            values: memberAccountNames,
                        });
                    }
                    else {
                        UTIL.showMsgOnTop(data.message);
                    }
                });
            };
            var modalMessageKey = hasDefaultPassword ? 'DELETE_USERGROUP_MEMBER_WARNING' : 'DELETE_USERGROUP_MEMBER_AFTER_LOGIN_WARNING', modalMessage = Blockly.Msg[modalMessageKey] ||
                'The member you want to delete might have create own programs and did already log in. Are you sure, that you want to delete the member?';
            $('#show-message-confirm').oneWrap('shown.bs.modal', function (e) {
                $('#confirm').off();
                $('#confirm').on('click', function (e) {
                    e.preventDefault();
                    deleteFunction(selectedRows);
                });
                $('#confirmCancel').off();
                $('#confirmCancel').on('click', function (e) {
                    e.preventDefault();
                    $('.modal').modal('hide');
                });
            });
            MSG.displayPopupMessage(modalMessageKey, modalMessage, 'OK', Blockly.Msg.POPUP_CANCEL);
        }, 'Bulk removed members of usergroup.');
        $userGroupMemberTable
            .closest('#userGroupMemberList')
            .find('.resetPasswords')
            .onWrap('click', function () {
            var selectedRows = $userGroupMemberTable.bootstrapTable('getSelections'), $resetAllButton = $userGroupMemberTable.closest('#userGroupMemberList').find('.resetPasswords');
            if (!selectedRows || selectedRows.length === 0 || $resetAllButton.hasClass('disabled')) {
                return;
            }
            var userGroupName = selectedRows[0].account.split(':', 2)[0], memberAccounts = selectedRows
                .filter(function (row) {
                return !row.hasDefaultPassword;
            })
                .map(function (row) {
                return row.account;
            });
            USERGROUP.setUserGroupMemberDefaultPasswords(userGroupName, memberAccounts, function (data) {
                if (data.rc === 'ok') {
                    $userGroupMemberTable.closest('#userGroupMemberList').find('button[name="refresh"]').clickWrap();
                }
                else {
                    UTIL.showMsgOnTop(data.message);
                }
            });
        }, 'Bulk resetted passwords of usergroup members.');
        $('#backUserGroupMemberList').clickWrap(function () {
            showPanel();
            return false;
        });
    }
    /* This is an internal function and a part of the initialization. Do not export it. */
    function initAddMembersToGroupEvents() {
        var $addMembersModal = $('#user-group-add-members'), $addMembersForm = $addMembersModal.find('form'), $memberCountInput = $addMembersForm.find('#additionalMembersInput'), $memberCountInputHint = $addMembersModal.find('label[for="additionalMembersInput"] ~ .hint');
        $('#showAddMembersPopup').clickWrap(function () {
            $addMembersForm.validate();
            $addMembersModal.modal('show');
            return false;
        });
        $addMembersModal.find('.close-button').clickWrap(function () {
            $addMembersModal.modal('hide');
            return false;
        });
        $.validator.addMethod('isIntBiggerThan1Regex', function (value, element) {
            return /^\s*0*[1-9]\d*\s*$/.test(value.trim());
        }, Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE']);
        $.validator.addMethod('notOverThreshold', function (value, element) {
            return !isNaN(value) && $userGroupMemberTable.bootstrapTable('getData').length - 1 + parseInt(value.trim()) <= userGroupMemberThreshold;
        }, Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_LIMIT_REACHED']);
        $addMembersForm.removeData('validator');
        $addMembersForm.validate({
            rules: {
                additionalMembers: {
                    required: true,
                    isIntBiggerThan1Regex: true,
                    notOverThreshold: true,
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertBefore(element.parent());
            },
            messages: {
                additionalMembers: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    isIntBiggerThan1Regex: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE'],
                    notOverThreshold: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_LIMIT_REACHED'],
                    min: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE'],
                    max: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE'],
                    step: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE'],
                    number: Blockly.Msg['ORA_GROUP_ADD_MEMBER_ERROR_SMALLER_THAN_ONE'],
                },
            },
        });
        $addMembersForm.submit(function (e) {
            e.preventDefault();
            $addMembersModal.find('.accept-button').clickWrap();
            return false;
        });
        $memberCountInput.keydown(function (e) {
            if (e.originalEvent.keyCode === 13) {
                e.stopPropagation();
                e.preventDefault();
                $addMembersModal.find('.accept-button').clickWrap();
                return false;
            }
        });
        $addMembersModal.find('.accept-button').clickWrap(function () {
            var validator = $addMembersForm.validate();
            if (!$addMembersForm.valid()) {
                return;
            }
            var additionalMembersCount = parseInt($memberCountInput.val().trim()), additionalMembers = [], formatter = new Intl.NumberFormat('en-US', { minimumIntegerDigits: 2 }), currentMaximum = 0, groupName = $('#userGroupMemberListHeader').text().trim(), rows = $userGroupMemberTable.bootstrapTable('getData');
            currentMaximum = rows.reduce(function (maximum, row) {
                if (row === null || row.id === 0) {
                    return maximum;
                }
                var accountName = row.account.substr(row.account.indexOf(':') + 1);
                if (isNaN(accountName)) {
                    return maximum;
                }
                accountName = parseInt(accountName);
                return Math.max(maximum, accountName);
            }, currentMaximum);
            for (var i = currentMaximum + 1; i <= currentMaximum + additionalMembersCount; i++) {
                additionalMembers.push(formatter.format(i));
            }
            USERGROUP.addGroupMembers(groupName, additionalMembers, function (data) {
                if (data.rc === 'ok') {
                    $addMembersModal.modal('hide');
                    $memberCountInput.val('');
                    if (data.userGroup) {
                        openDetailUserGroupView(data.userGroup);
                    }
                }
                else {
                    validator.showErrors({
                        additionalMembers: Blockly.Msg[data.cause],
                    });
                }
            });
            return false;
        });
    }
    /* This is an internal function and a part of the initialization. Do not export it. */
    function openDetailUserGroupView(userGroupData) {
        if (userGroupData == null || typeof userGroupData.name !== 'string') {
            MSG.displayPopupMessage('ORA_GROUP_GET_MEMBERS_ERROR', 'Could not open group detail view for that group.', 'OK');
            return;
        }
        $('#userGroupMemberListHeader').html(userGroupData.name.trim() || '&nbsp;');
        $('#additionalMembersInput').val('');
        var members = userGroupData.members.map(function (member) {
            return member;
        });
        members.push({
            id: 0,
            account: '',
            hasDefaultPassword: false,
        });
        $userGroupMemberTable.bootstrapTable('showLoading');
        $userGroupMemberTable.bootstrapTable('removeAll');
        $userGroupMemberTable.bootstrapTable('load', members);
        memberNameValidators = {};
        setTimeout(function () {
            //The fronted can not calculate the height of the table if it tries to directly after the table is filled.
            //So we wait 250ms. If you set it to a shorter amount, it wont work again.
            $userGroupMemberTable.bootstrapTable('resetView', {
                height: UTIL.calcDataTableHeight(),
            });
            $userGroupMemberTable.bootstrapTable('hideLoading');
        }, 250);
        $('#tabUserGroupMemberList').clickWrap();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckdyb3VwLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3JvYmVydGEvY29udHJvbGxlci91c2VyR3JvdXAuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxJQUFJLGVBQWUsQ0FBQztJQUNwQixJQUFJLHFCQUFxQixDQUFDO0lBQzFCLElBQUksd0JBQXdCLEdBQUcsRUFBRSxDQUFDO0lBQ2xDLElBQUksb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0lBRTlCLFNBQVMsU0FBUztRQUNkLGVBQWUsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDOUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsSUFBSTtZQUN0QyxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNsQixlQUFlLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDM0Q7aUJBQU07Z0JBQ0gsZUFBZSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDNUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN4RDtZQUNELFVBQVUsQ0FBQztnQkFDUCwwR0FBMEc7Z0JBQzFHLDBFQUEwRTtnQkFDMUUsZUFBZSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUU7b0JBQ3hDLE1BQU0sRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7aUJBQ3JDLENBQUMsQ0FBQztnQkFDSCxlQUFlLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFELGVBQWUsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDbEQsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFD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