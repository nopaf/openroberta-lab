define(["require", "exports", "util", "message", "guiState.controller", "progList.model", "program.model", "program.controller", "blockly", "jquery", "bootstrap-table", "bootstrap-tagsinput"], function (require, exports, UTIL, MSG, GUISTATE_C, PROGLIST, PROGRAM, PROGRAM_C, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatTags = exports.formatDate = exports.formatAuthor = exports.formatProgramDescription = exports.formatProgramName = exports.formatRobot = exports.titleLikes = exports.titleNumberOfViews = exports.rowAttributes = exports.rowStyle = exports.init = void 0;
    var BACKGROUND_COLORS = [
        '#33B8CA',
        '#EBC300',
        '#39378B',
        '#005A94',
        '#179C7D',
        '#F29400',
        '#E2001A',
        '#EB6A0A',
        '#8FA402',
        '#BACC1E',
        '#9085BA',
        '#FF69B4',
        '#DF01D7',
    ];
    var currentColorIndex;
    var currentViewMode = 'gallery';
    /**
     * Initialize table of programs
     */
    function init() {
        initGalleryToolbar();
        initGalleryList();
        initGalleryListEvents();
    }
    exports.init = init;
    //TODO: Robot group names exists in plugin properties
    function getRobotGroups() {
        var robots = GUISTATE_C.getRobots();
        var groups = {};
        var coerceName = function (name, group) {
            if (group === 'arduino')
                return 'Nepo4Arduino';
            if (group === 'ev3')
                return 'Ev3';
            return GUISTATE_C.getMenuRobotRealName(name);
        };
        for (var propt in robots) {
            var group = robots[propt].group;
            var name = robots[propt].name;
            if (group && !groups[group]) {
                groups[group] = coerceName(name, group);
            }
        }
        return groups;
    }
    function initGalleryToolbar() {
        var groups = getRobotGroups();
        var filterField = $('#filterRobot');
        for (var group in groups) {
            filterField.append(new Option(groups[group], group));
        }
        filterField.append(new Option('All robots', 'all', true, true));
    }
    function initGalleryList() {
        $('#galleryTable').bootstrapTable({
            height: UTIL.calcDataTableHeight(),
            toolbar: '#galleryListToolbar',
            showRefresh: 'true',
            cardView: 'true',
            rowStyle: rowStyle,
            rowAttributes: rowAttributes,
            sortName: 4,
            sortOrder: 'desc',
            search: true,
            buttonsAlign: 'right',
            resizable: 'true',
            iconsPrefix: 'typcn',
            pageSize: 12,
            pageList: [12, 24, 48, 96],
            icons: {
                paginationSwitchDown: 'typcn-document-text',
                paginationSwitchUp: 'typcn-book',
                refresh: 'typcn-refresh',
            },
            columns: [
                {
                    sortable: true,
                    //visible : false,
                    formatter: formatRobot,
                },
                {
                    sortable: true,
                    formatter: formatProgramName,
                },
                {
                    sortable: true,
                    formatter: formatProgramDescription,
                },
                {
                    formatter: formatAuthor,
                    sortable: true,
                },
                {
                    sortable: true,
                    formatter: formatDate,
                },
                {
                    title: titleNumberOfViews,
                    sortable: true,
                },
                {
                    title: titleLikes,
                    sortable: true,
                },
                {
                    sortable: true,
                    formatter: formatTags,
                },
                {
                    events: eventsLike,
                    formatter: formatLike,
                },
            ],
        });
        $('#galleryTable').bootstrapTable('togglePagination');
    }
    function initGalleryListEvents() {
        $(window).resize(function () {
            $('#galleryTable').bootstrapTable('resetView', {
                height: UTIL.calcDataTableHeight(),
            });
        });
        $('#tabGalleryList').onWrap('show.bs.tab', function (e) {
            $('#filterRobot').val(GUISTATE_C.getRobotGroup());
            guiStateController.setView('tabGalleryList');
            if ($('#galleryTable').bootstrapTable('getData').length === 0) {
                $('.pace').show(); // Show loading icon and hide gallery table
            }
            loadGalleryData();
        }, 'show gallery list');
        $('#tabGalleryList').onWrap('shown.bs.tab', function (e) {
            $(window).trigger('resize');
        }, 'shown gallery list');
        $('#galleryTable').onWrap('page-change.bs.table', function (e) {
            configureTagsInput();
        }, 'page-change gallery list');
        $('#galleryList')
            .find('button[name="refresh"]')
            .onWrap('click', function () {
            loadGalleryData();
            return false;
        }, 'refresh gallery list clicked');
        $('#galleryTable').onWrap('click-row.bs.table', function ($element, row) {
            PROGRAM_C.loadFromGallery(row);
        }, 'Load program from gallery double clicked');
        $('#backGalleryList').onWrap('click', function () {
            $('#tabProgram').clickWrap();
            return false;
        }, 'back to program view');
        $('#galleryTable').on('shown.bs.collapse hidden.bs.collapse', function (e) {
            $('#galleryTable').bootstrapTable('resetWidth');
        });
        $('#filterRobot').onWrap('change', loadGalleryData, 'gallery filter changed');
        $('#fieldOrderBy').change(function (e) {
            var fieldData = e.target.value.split(':');
            var row = parseInt(fieldData[0]);
            console.log(row);
            $('#galleryTable').bootstrapTable('refreshOptions', {
                sortName: row,
                sortOrder: fieldData[1],
            });
        });
        //        TODO reactivate this once the table-view is improved
        //        $('#toogleView').clickWrap(function (e) {
        //            // toggle button icon
        //            var iconClassName = '';
        //            if (currentViewMode === 'gallery') {
        //                currentViewMode = 'list';
        //                iconClassName = 'typcn-th-large';
        //            } else {
        //                currentViewMode = 'gallery';
        //                iconClassName = 'typcn-th-list';
        //            }
        //            $('#toogleView > i').attr('class', 'typcn ' + iconClassName);
        //            $('#galleryTable').bootstrapTable('refreshOptions', {});
        //        });
    }
    function loadGalleryData() {
        var params = {};
        var group = $('#filterRobot').val();
        if (group !== 'all') {
            params['group'] = group;
        }
        PROGLIST.loadGalleryList(update, params);
    }
    function update(result) {
        UTIL.response(result);
        if (result.rc === 'ok') {
            $('#galleryTable').bootstrapTable('load', result.programNames);
            configureTagsInput();
        }
        $('.pace').fadeOut(300); // Hide loading icon and show gallery table
    }
    function updateLike(value, index, row) {
        var likes = row[6] + value;
        $('#galleryTable').bootstrapTable('updateCell', {
            index: index,
            field: 6,
            value: likes,
        });
        var like = value > 0 ? true : false;
        $('#galleryTable').bootstrapTable('updateCell', {
            index: index,
            field: 8,
            value: like,
        });
    }
    var eventsLike = {
        'click .like': function (e, value, row, index) {
            e.stopPropagation();
            if ($(e.target).data('blocked') == 1)
                return;
            $(e.target).data('blocked', 1);
            PROGRAM.likeProgram(true, row[1], row[3], row[0], function (result) {
                if (result.rc == 'ok') {
                    updateLike(1, index, row);
                    $(e.target).data('blocked', 0);
                }
                else {
                    $(e.target).data('blocked', 0);
                }
                MSG.displayInformation(result, result.message, result.message, row[1]);
            });
            return false;
        },
        'click .dislike': function (e, value, row, index) {
            e.stopPropagation();
            if ($(e.target).data('blocked') == 1)
                return;
            $(e.target).data('blocked', 1);
            PROGRAM.likeProgram(false, row[1], row[3], row[0], function (result) {
                if (result.rc == 'ok') {
                    updateLike(-1, index, row);
                    $(e.target).data('blocked', 0);
                }
                else {
                    $(e.target).data('blocked', 0);
                }
                MSG.displayInformation(result, result.message, result.message, row[1]);
            });
            return false;
        },
    };
    var rowStyle = function (row, index) {
        return {
            classes: currentViewMode === 'gallery' ? 'galleryNode col-xl-2 col-lg-3 col-md-4 col-sm-6' : 'listNode',
        };
    };
    exports.rowStyle = rowStyle;
    // TODO extend this, if more customization features are available, eg. robot graphics, uploaded images.
    var rowAttributes = function (row, index) {
        var hash = UTIL.getHashFrom(row[0] + row[1] + row[3]);
        currentColorIndex = hash % BACKGROUND_COLORS.length;
        return {
            style: 'background-color :' + BACKGROUND_COLORS[currentColorIndex] + ';' + 'border: solid 12px white; cursor: pointer;  z-index: 1;',
        };
    };
    exports.rowAttributes = rowAttributes;
    var titleNumberOfViews = '<span class="galleryIcon typcn typcn-eye-outline" />';
    exports.titleNumberOfViews = titleNumberOfViews;
    var titleLikes = '<span class="galleryIcon typcn typcn-heart-full-outline" />';
    exports.titleLikes = titleLikes;
    var formatRobot = function (value, row, index) {
        return '<div class="typcn typcn-' + row[0] + '"></div>';
    };
    exports.formatRobot = formatRobot;
    var formatProgramName = function (value, row, index) {
        return '<div class="galleryProgramname">' + value + '</div>';
    };
    exports.formatProgramName = formatProgramName;
    var formatProgramDescription = function (value, row, index) {
        var xmlDoc = Blockly.Xml.textToDom(value, Blockly.getMainWorkspace());
        var description = xmlDoc.getAttribute('description');
        if (!description) {
            description = '&nbsp;';
        }
        return '<div class="galleryDescription color' + currentColorIndex + '">' + description + '</div>';
    };
    exports.formatProgramDescription = formatProgramDescription;
    var formatAuthor = function (value, row, index) {
        return ("<div class='galleryAuthor'><span class='title' lkey='Blockly.Msg.GALLERY_BY'>" +
            (Blockly.Msg.GALLERY_BY || 'von') +
            '</span>' +
            value +
            '</span></div>');
    };
    exports.formatAuthor = formatAuthor;
    var formatDate = function (value, row, index) {
        return ("<span class='title' lkey='Blockly.Msg.GALLERY_DATE'>" +
            (Blockly.Msg.GALLERY_DATE || 'erstellt') +
            '</span>' +
            UTIL.formatDate(value.replace(/\s/, 'T')));
    };
    exports.formatDate = formatDate;
    var formatTags = function (value, row, index) {
        var xmlDoc = Blockly.Xml.textToDom(row[2], Blockly.getMainWorkspace());
        var tags = xmlDoc.getAttribute('tags');
        if (!tags) {
            tags = '&nbsp;';
        }
        return '<input class="infoTags" type="text" value="' + tags + '" data-role="tagsinput"/>';
    };
    exports.formatTags = formatTags;
    var formatLike = function (value, row, index) {
        if (GUISTATE_C.isUserLoggedIn()) {
            if (value) {
                return ('<div class="galleryLike"><a href="#" class="dislike galleryLike typcn typcn-heart-half-outline"><span lkey="Blockly.Msg.GALLERY_DISLIKE">' +
                    (Blockly.Msg.GALLERY_DISLIKE || 'gefällt mir nicht mehr') +
                    '</span></a></div>');
            }
            else {
                return ('<div class="galleryLike"><a href="#" class="like galleryLike typcn typcn-heart-full-outline"><span lkey="Blockly.Msg.GALLERY_LIKE">' +
                    (Blockly.Msg.GALLERY_LIKE || 'gefällt mir') +
                    '</span></a></div>');
            }
        }
        else {
            return '<div style="display:none;" />'; // like is only for logged in users allowed
        }
    };
    function configureTagsInput() {
        $('.infoTags').tagsinput();
        $('#galleryTable .bootstrap-tagsinput').addClass('galleryTags');
        $('#galleryList').find('.galleryTags>input').attr('readonly', 'true');
        $('#galleryList').find('span[data-role=remove]').addClass('hidden');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FsbGVyeUxpc3QuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9jb250cm9sbGVyL2dhbGxlcnlMaXN0LmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBdUJBLElBQUksaUJBQWlCLEdBQUc7UUFDcEIsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztLQUNaLENBQUM7SUFDRixJQUFJLGlCQUFpQixDQUFDO0lBQ3RCLElBQUksZUFBZSxHQUFHLFNBQVMsQ0FBQztJQUNoQzs7T0FFRztJQUNILFNBQVMsSUFBSTtRQUNULGtCQUFrQixFQUFFLENBQUM7UUFDckIsZUFBZSxFQUFFLENBQUM7UUFDbEIscUJBQXFCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBaVVHLG9CQUFJO0lBL1RSLHFEQUFxRDtJQUNyRCxTQUFTLGNBQWM7UUFDbkIsSUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3BDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUVoQixJQUFJLFVBQVUsR0FBRyxVQUFVLElBQUksRUFBRSxLQUFLO1lBQ2xDLElBQUksS0FBSyxLQUFLLFNBQVM7Z0JBQUUsT0FBTyxjQUFjLENBQUM7WUFDL0MsSUFBSSxLQUFLLEtBQUssS0FBSztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUNsQyxPQUFPLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUM7UUFFRixLQUFLLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRTtZQUN0QixJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxD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