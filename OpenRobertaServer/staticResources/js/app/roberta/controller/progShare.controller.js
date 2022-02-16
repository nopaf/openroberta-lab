define(["require", "exports", "log", "util", "message", "guiState.controller", "language.controller", "galleryList.controller", "program.model", "userGroup.model", "blockly", "jquery", "bootstrap-table"], function (require, exports, LOG, UTIL, MSG, GUISTATE_C, LANG, GALLERY_C, PROGRAM, USERGROUP, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    function init() {
        initView();
        initEvents();
    }
    exports.init = init;
    function initView() {
        $('#relationsTable').bootstrapTable({
            height: 400,
            iconsPrefix: 'typcn',
            icons: {
                paginationSwitchDown: 'typcn-document-text',
                paginationSwitchUp: 'typcn-book',
                refresh: 'typcn-refresh',
            },
            columns: [
                {
                    title: 'Name',
                    field: 'name',
                    visible: false,
                },
                {
                    title: 'Owner',
                    field: 'owner',
                    visible: false,
                },
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_SHARED_WITH'>" + (Blockly.Msg.DATATABLE_SHARED_WITH || 'Geteilt mit') + '</span>',
                    field: 'sharedWith',
                    events: eventAddShare,
                    formatter: formatSharedWith,
                },
                {
                    title: "<span class='typcn typcn-eye'></span>",
                    field: 'read',
                    events: eventCheckRead,
                    width: '20px',
                    halign: 'center',
                    valign: 'middle',
                    formatter: formatRead,
                },
                {
                    title: "<span class='typcn typcn-pencil'></span>",
                    field: 'write',
                    events: eventCheckWrite,
                    width: '20px',
                    halign: 'center',
                    valign: 'middle',
                    formatter: formatWrite,
                },
            ],
        });
        $('#galleryPreview').bootstrapTable({
            height: 410,
            cardView: 'true',
            rowStyle: GALLERY_C.rowStyle,
            rowAttributes: GALLERY_C.rowAttributes,
            resizable: 'true',
            iconsPrefix: 'typcn',
            columns: [
                {
                    sortable: true,
                    //visible : false,
                    formatter: GALLERY_C.formatRobot,
                },
                {
                    sortable: true,
                    formatter: GALLERY_C.formatProgramName,
                },
                {
                    sortable: true,
                    formatter: GALLERY_C.formatProgramDescription,
                },
                {
                    title: GALLERY_C.titleAuthor,
                    sortable: true,
                },
                {
                    title: GALLERY_C.titleDate,
                    sortable: true,
                    formatter: UTIL.formatDate,
                },
                {
                    title: GALLERY_C.titleNumberOfViews,
                    sortable: true,
                },
                {
                    title: GALLERY_C.titleLikes,
                    sortable: true,
                },
                {
                    sortable: true,
                    formatter: GALLERY_C.formatTags,
                },
                {
                    visible: false,
                },
            ],
        });
    }
    function initEvents() {
        // triggered from the progList
        $('#show-relations').onWrap('updateAndShow', function (e, data) {
            showShareWithUser(data);
            return false;
        }, 'show relations');
        // triggered from the progList
        $('#share-with-gallery').onWrap('updateAndShow', function (e, row) {
            showShareWithGallery(row);
            return false;
        }, 'share with gallery');
        // click on the ok button from modal
        $('#shareProgram').onWrap('click', function (e) {
            updateSharedWithUsers();
        }, 'ok click for share program');
        // click on the ok button from modal
        $('#shareWithGallery').onWrap('click', function (e) {
            var table = $('#share-with-gallery .modal-body').find('>:first-child');
            if (table) {
                table.show();
            }
            else {
                $('#textShareGallery').show();
            }
            updateShareWithGallery($('#share-with-gallery').data('action'));
        }, 'ok click for share with gallery');
        $('#cancelShareWithGallery').onWrap('click', function (e) {
            var table = $('#share-with-gallery .modal-body').find('>:first-child');
            if (table) {
                table.show();
            }
            else {
                $('#textShareGallery').show();
            }
            $('#share-with-gallery').modal('hide');
        }, 'ok click for cancel share with gallery');
    }
    function showShareWithUser(data) {
        var progName = data[0];
        var shared = null;
        if (!$.isEmptyObject(data[2])) {
            shared = data[2];
        }
        $('#show-relations h3')
            .text(Blockly.Msg.BUTTON_DO_SHARE + ' »' + progName + '«')
            .end();
        // $('#show-relations').find('.modal-header>h3').text(Blockly.Msg.BUTTON_DO_SHARE + ' »' + progName + '«').end();
        $('#relationsTable').bootstrapTable('removeAll');
        if (shared) {
            $.each(shared.sharedWith, function (i, shareObj) {
                if (shareObj.type !== 'User' || shareObj.label !== 'Gallery') {
                    $('#relationsTable').bootstrapTable('insertRow', {
                        index: -1,
                        row: {
                            name: data[0],
                            owner: data[1],
                            sharedWith: shareObj,
                            read: shareObj.right,
                            write: shareObj.right,
                        },
                    });
                }
            });
        }
        // add input row for new user group to share with
        $('#relationsTable').bootstrapTable('insertRow', {
            index: 0,
            row: {
                name: data[0],
                owner: data[1],
                sharedWith: {
                    label: null,
                    type: 'UserGroup',
                    right: 'NONE',
                },
                read: 'READ',
                write: '',
            },
        });
        // add input row for new user to share with
        $('#relationsTable').bootstrapTable('insertRow', {
            index: 0,
            row: {
                name: data[0],
                owner: data[1],
                sharedWith: {
                    label: null,
                    type: 'User',
                    right: 'NONE',
                },
                read: 'READ',
                write: '',
            },
        });
        $('#show-relations').oneWrap('shown.bs.modal', function (e) {
            $('#relationsTable').bootstrapTable('resetView');
            $('#relationsTable').find('input :first').focus();
        });
        $('#show-relations').modal('show');
    }
    function showShareWithGallery(row) {
        var progName = row[0];
        var authorName = row[3];
        $('#share-with-gallery h3').html('');
        $('#galleryPreview').html('');
        $('#textShareGallery').html('');
        $('#share-with-gallery').data('progName', progName);
        $('#share-with-gallery').data('user', authorName);
        // check if this program has already shared with the gallery
        PROGRAM.loadProgramFromListing(progName, 'Gallery', authorName, function (result) {
            if (result.rc === 'ok') {
                // already shared!
                //TODO create usefull text at least for german and english.
                MSG.displayInformation({ rc: 'error' }, 'GALLERY_SHARED_ALREADY', 'GALLERY_SHARED_ALREADY', progName);
            }
            else {
                $('#textShareGallery').html(Blockly.Msg.PROGLIST_SHARE_WITH_GALLERY);
                $('#share-with-gallery').data('action', 'add');
                PROGRAM.loadProgramEntity(progName, GUISTATE_C.getUserAccountName(), GUISTATE_C.getUserAccountName(), function (result) {
                    if (result.rc === 'ok') {
                        var progName = row[0];
                        $('#share-with-gallery h3').text(Blockly.Msg.BUTTON_DO_UPLOAD_GALLERY.replace('$', progName));
                        $('#galleryPreview').bootstrapTable('load', new Array(result.program));
                        $('.infoTags').tagsinput();
                        $('#galleryPreview .bootstrap-tagsinput').addClass('galleryTags');
                        $('#galleryPreview').find('.galleryTags>input').attr('readonly', 'true');
                        $('#galleryPreview').find('span[data-role=remove]').addClass('hidden');
                        $('#share-with-gallery').modal('show');
                    }
                });
            }
        });
    }
    /**
     * Update rights for all users with which this program is shared, no
     * selected right will remove sharing
     */
    function updateSharedWithUsers(rowIndex) {
        var data = $('#relationsTable').bootstrapTable('getData');
        for (var i = 0; i < data.length; i++) {
            if (!isNaN(rowIndex) && i != parseInt(rowIndex)) {
                continue;
            }
            var sharedWith = JSON.parse(JSON.stringify(data[i].sharedWith)), $shareLabelInput = false;
            (updateRowIndex = -1), (right = 'NONE');
            if ($('#checkRead' + i).is(':checked') &&
                (sharedWith.type !== 'User' || !GUISTATE_C.isUserMemberOfUserGroup() || sharedWith.label !== GUISTATE_C.getUserUserGroupOwner())) {
                right = 'READ';
            }
            if ($('#checkWrite' + i).is(':checked')) {
                right = 'WRITE';
            }
            if (sharedWith.label === null) {
                var $shareLabelInput = $('#relationsTable tr[data-index="' + i + '"] .shareLabelInput'), shareLabel = $shareLabelInput.val();
                if (!shareLabel) {
                    continue;
                }
                if (sharedWith.type === 'User') {
                    // new user and owner are the same?
                    if (shareLabel === data[i].owner) {
                        if (!isNaN(rowIndex)) {
                            UTIL.showMsgOnTop('ORA_USER_TO_SHARE_SAME_AS_LOGIN_USER');
                            return;
                        }
                        continue;
                    }
                    updateRowIndex = data
                        .map(function (row) {
                        return row.sharedWith !== null ? row.sharedWith.label : '';
                    })
                        .indexOf(shareLabel);
                    if (updateRowIndex >= 0) {
                        sharedWith = JSON.parse(JSON.stringify(data[updateRowIndex].sharedWith));
                    }
                }
                sharedWith.label = shareLabel;
            }
            if (right !== sharedWith.right) {
                sharedWith.right = right;
                (function (row, shareObj, $shareLabelInput, updateRowIndex) {
                    PROGRAM.shareProgram(row.name, shareObj, function (result) {
                        if (result.rc === 'ok') {
                            if ($shareLabelInput) {
                                $shareLabelInput.val('');
                                if (shareObj.type === 'UserGroup') {
                                    $shareLabelInput.find('option[value="' + shareObj.label + '"]').remove();
                                }
                                if (updateRowIndex < 0) {
                                    $('#relationsTable').bootstrapTable('insertRow', {
                                        index: 2,
                                        row: {
                                            name: row.name,
                                            owner: row.owner,
                                            sharedWith: shareObj,
                                            read: shareObj.right,
                                            write: shareObj.right,
                                        },
                                    });
                                }
                                else {
                                    $('#relationsTable').bootstrapTable('updateRow', {
                                        index: updateRowIndex,
                                        row: {
                                            name: row.name,
                                            owner: row.owner,
                                            sharedWith: shareObj,
                                            read: shareObj.right,
                                            write: shareObj.right,
                                        },
                                    });
                                }
                            }
                            MSG.displayMessage(result.message, 'TOAST', shareObj.label);
                            LOG.info('share program ' + row.name + " with '" + shareObj.label + "'(" + shareObj.type + ") having right '" + shareObj.right + "'");
                            $('#progList').find('button[name="refresh"]').clickWrap();
                        }
                        else {
                            UTIL.showMsgOnTop(result.message);
                        }
                    });
                })(data[i], sharedWith, $shareLabelInput, updateRowIndex);
            }
        }
        if (isNaN(rowIndex)) {
            $('#show-relations').modal('hide');
        }
    }
    /**
     * Update rights for sharing with the gallery
     *
     */
    function updateShareWithGallery(action) {
        var progName = $('#share-with-gallery').data('progName');
        PROGRAM.shareProgramWithGallery(progName, function (result) {
            if (result.rc === 'ok') {
                LOG.info('share program ' + progName + ' with Gallery');
                $('#progList').find('button[name="refresh"]').clickWrap();
            }
            MSG.displayInformation(result, result.message, result.message, progName);
        });
        $('#share-with-gallery').modal('hide');
    }
    var rowStyle = function (row, index) {
        return {
            classes: 'typcn typcn-' + row[2],
        };
    };
    var eventAddShare = {
        'click .addShare': function (e, value, row, index) {
            updateSharedWithUsers(index);
        },
    };
    var eventCheckRead = {
        'click #checkRead0': function (e) {
            if (!$(this).is(':checked')) {
                $('#checkWrite0').prop('checked', true);
            }
        },
    };
    var eventCheckWrite = {
        'click #checkWrite0': function () {
            if (!$(this).is(':checked')) {
                $('#checkRead0').prop('checked', true);
            }
        },
    };
    var formatRead = function (value, row, index) {
        if ((row.sharedWith.label === null && row.sharedWith.type === 'UserGroup') ||
            (row.sharedWith.type === 'User' && GUISTATE_C.isUserMemberOfUserGroup() && GUISTATE_C.getUserUserGroupOwner() === row.sharedWith.label)) {
            return '<input type="checkbox" id="checkRead' + index + '" checked disabled>';
        }
        if (value === 'READ') {
            return '<input type="checkbox" id="checkRead' + index + '" checked>';
        }
        return '<input type="checkbox" id="checkRead' + index + '">';
    };
    var formatWrite = function (value, row, index) {
        if (row.sharedWith.type === 'UserGroup') {
            return '<input type="checkbox" id="checkWrite' + index + '" disabled>';
        }
        if (value === 'WRITE') {
            return '<input type="checkbox" id="checkWrite' + index + '" checked>';
        }
        return '<input type="checkbox" id="checkWrite' + index + '">';
    };
    var formatSharedWith = function (value, row, index) {
        if (value === null || typeof value !== 'object') {
            error.log('unknown share format "' + typeof value + '"');
            return '';
        }
        if (value.label === null) {
            var typeLabel = '';
            if (value.type === 'User') {
                var $html = $('<div class="input-group">' +
                    '<label class="input-group-btn" for="shareWithUserInput">' +
                    '<button type="button" style="height:34px" class="btn disabled editor">' +
                    '<i class="typcn typcn-user"></i>' +
                    '</button>' +
                    '</label>' +
                    '<span class="input-group-btn">' +
                    '<button class="addShare btn" type="button" style="height: 34px">' +
                    '<i class="typcn typcn-plus"></i>' +
                    '</button>' +
                    '</span>' +
                    '<input class="shareLabelInput form-control" type="text" name="user.account" lkey="Blockly.Msg.SHARE_WITH_USER" data-translation-targets="placeholder"/>' +
                    '</div>');
                LANG.translate($html);
                return $('<div></div>').append($html).html();
            }
            if (value.type === 'UserGroup') {
                if (!GUISTATE_C.isUserMemberOfUserGroup()) {
                    USERGROUP.loadUserGroupList(function (data) {
                        if (data.rc == 'ok' && data.userGroups && data.userGroups.length > 0) {
                            var existingUserGroupNames = $('#relationsTable')
                                .bootstrapTable('getData')
                                .filter(function (dataEntry) {
                                return dataEntry.sharedWith && dataEntry.sharedWith.type === 'UserGroup';
                            })
                                .map(function (dataEntry) {
                                return dataEntry.sharedWith.label;
                            }), $td = $('#relationsTable tr[data-index="' + index + '"] script').parent(), html;
                            html =
                                '<div class="input-group" title="" data-original-title lkey="Blockly.Msg.SHARE_WITH_USERGROUP" data-translation-targets="title data-original-title">' +
                                    '<label class="input-group-btn" for="shareWithUserGroupInput">' +
                                    '<button type="button" style="height:34px" class="btn disabled editor">' +
                                    '<i class="typcn typcn-group"></i>' +
                                    '</button>' +
                                    '</label>' +
                                    '<span class="input-group-btn">' +
                                    '<button class="addShare btn" type="button" style="height: 34px">' +
                                    '<i class="typcn typcn-plus"></i>' +
                                    '</button>' +
                                    '</span>' +
                                    '<select class="shareLabelInput form-control" name="userGroup.name">' +
                                    '<option value="" lkey="Blockly.Msg.SHARE_WITH_USERGROUP" data-translation-targets="html"></option>' +
                                    data.userGroups
                                        .filter(function (userGroup) {
                                        return existingUserGroupNames.indexOf(userGroup.name) === -1;
                                    })
                                        .reduce(function (carry, userGroup) {
                                        return carry + '<option value="' + userGroup.name + '">' + userGroup.name + '</option>';
                                    }, '') +
                                    '</select>' +
                                    '</div>';
                            $td.html(html);
                            LANG.translate($td);
                            Object.keys(eventAddShare).forEach(function (eventKey) {
                                if (!eventAddShare.hasOwnProperty(eventKey)) {
                                    return;
                                }
                                var eventInformation = eventKey.split(' ', 2);
                                $td.find(eventInformation[1]).on(eventInformation[0], function (e) {
                                    eventAddShare[eventKey](e, value, row, index);
                                });
                            });
                            $td.parent().show();
                        }
                    });
                }
                return "<script>$('#relationsTable').find('tr[data-index=\"" + index + '"]\').hide();</script>';
            }
            error.log('unknown share type');
            return '';
        }
        var typeIconClass = 'warning-outline';
        if (value.type === 'User') {
            typeIconClass = 'user';
        }
        else if (value.type === 'UserGroup') {
            typeIconClass = 'group';
        }
        return '<span class="typcn typcn-' + typeIconClass + '"></span> <span class="value">' + value.label + '</span>';
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ1NoYXJlLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3JvYmVydGEvY29udHJvbGxlci9wcm9nU2hhcmUuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxTQUFTLElBQUk7UUFDVCxRQUFRLEVBQUUsQ0FBQztRQUNYLFVBQVUsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFDUSxvQkFBSTtJQUViLFNBQVMsUUFBUTtRQUNiLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUNoQyxNQUFNLEVBQUUsR0FBRztZQUNYLFdBQVcsRUFBRSxPQUFPO1lBQ3BCLEtBQUssRUFBRTtnQkFDSCxvQkFBb0IsRUFBRSxxQkFBcUI7Z0JBQzNDLGtCQUFrQixFQUFFLFlBQVk7Z0JBQ2hDLE9BQU8sRUFBRSxlQUFlO2FBQzNCO1lBQ0QsT0FBTyxFQUFFO2dCQUNMO29CQUNJLEtBQUssRUFBRSxNQUFNO29CQUNiLEtBQUssRUFBRSxNQUFNO29CQUNiLE9BQU8sRUFBRSxLQUFLO2lCQUNqQjtnQkFDRDtvQkFDSSxLQUFLLEVBQUUsT0FBTztvQkFDZCxLQUFLLEVBQUUsT0FBTztvQkFDZCxPQUFPLEVBQUUsS0FBSztpQkFDakI7Z0JBQ0Q7b0JBQ0ksS0FBSyxFQUFFLGlEQUFpRCxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsSUFBSSxhQUFhLENBQUMsR0FBRyxTQUFTO29CQUMzSCxLQUFLLEVBQUUsWUFBWTtvQkFDbkIsTUFBTSxFQUFFLGFBQWE7b0JBQ3JCLFNBQVMsRUFBRSxnQkFBZ0I7aUJBQzlCO2dCQUNEO29CQUNJLEtBQUssRUFBRSx1Q0FBdUM7b0JBQzlDLEtBQUssRUFBRSxNQUFNO29CQUNiLE1BQU0sRUFBRSxjQUFjO29CQUN0QixLQUFLLEVBQUUsTUFBTTtvQkFDYixNQUFNLEVBQUUsUUFB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