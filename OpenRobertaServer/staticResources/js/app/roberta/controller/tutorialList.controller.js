define(["require", "exports", "util", "guiState.controller", "progTutorial.controller", "galleryList.controller", "jquery", "bootstrap-table", "bootstrap-tagsinput"], function (require, exports, UTIL, GUISTATE_C, TUTORIAL_C, GALLERYLIST_C, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatTags = exports.init = void 0;
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
    var tutorialList;
    /**
     * Initialize table of tutorials
     */
    function init() {
        tutorialList = GUISTATE_C.getListOfTutorials();
        for (var tutorial in tutorialList) {
            if (tutorialList.hasOwnProperty(tutorial)) {
                $('#head-navigation-tutorial-dropdown').append("<li class='" +
                    tutorialList[tutorial].language +
                    ' ' +
                    tutorialList[tutorial].robot +
                    "'><a href='#' id='" +
                    tutorial +
                    "' class='menu tutorial typcn typcn-mortar-board'>" +
                    tutorialList[tutorial].name +
                    '</a></li>');
            }
        }
        initTutorialList();
        initTutorialListEvents();
    }
    exports.init = init;
    function initTutorialList() {
        $('#tutorialTable').bootstrapTable({
            height: UTIL.calcDataTableHeight(),
            toolbar: '#tutorialListToolbar',
            showRefresh: 'true',
            cardView: 'true',
            rowStyle: GALLERYLIST_C.rowStyle,
            rowAttributes: rowAttributes,
            sortName: 'index',
            sortOrder: 'asc',
            search: true,
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
                    field: 'robot',
                    sortable: true,
                    formatter: formatRobot,
                },
                {
                    field: 'name',
                    sortable: true,
                    formatter: formatName,
                },
                {
                    field: 'overview.description',
                    sortable: true,
                    formatter: formatTutorialOverview,
                },
                {
                    field: 'overview.goal',
                    sortable: true,
                    formatter: formatTutorialOverview,
                },
                {
                    field: 'overview.previous',
                    sortable: true,
                    formatter: formatTutorialOverview,
                },
                {
                    field: 'time',
                    title: titleTime,
                    sortable: true,
                },
                {
                    field: 'age',
                    title: titleAge,
                    sortable: true,
                },
                {
                    field: 'sim',
                    title: titleSim,
                    sortable: true,
                    formatter: formatSim,
                },
                {
                    field: 'level',
                    title: titleLevel,
                    sortable: true,
                    formatter: formatLevel,
                },
                {
                    field: 'tags',
                    sortable: true,
                    formatter: formatTags,
                },
                {
                    field: 'index',
                    visible: false,
                },
                {
                    field: 'group',
                    visible: false,
                },
            ],
        });
        $('#tutorialTable').bootstrapTable('togglePagination');
    }
    function initTutorialListEvents() {
        $(window).resize(function () {
            $('#tutorialTable').bootstrapTable('resetView', {
                height: UTIL.calcDataTableHeight(),
            });
        });
        $('#tabTutorialList').onWrap('show.bs.tab', function (e) {
            guiStateController.setView('tabTutorialList');
            updateTutorialList();
        }, 'show tutorial list');
        $('#tutorialTable').on('page-change.bs.table', function (e) {
            configureTagsInput();
        });
        $('#tutorialList')
            .find('button[name="refresh"]')
            .onWrap('click', function () {
            updateTutorialList();
            return false;
        }, 'refresh tutorial list clicked');
        $('#tutorialTable').onWrap('click-row.bs.table', function ($element, row) {
            $element.stopPropagation();
            $element.preventDefault();
            TUTORIAL_C.loadFromTutorial(row.id);
        }, 'Load program from tutorial double clicked');
        $('#backTutorialList').onWrap('click', function () {
            $('#tabProgram').clickWrap();
            return false;
        }, 'back to program view');
        $('#tutorialTable').on('shown.bs.collapse hidden.bs.collapse', function (e) {
            $('#tutorialTable').bootstrapTable('resetWidth');
        });
        function updateTutorialList() {
            var tutorialArray = [];
            for (var tutorial in tutorialList) {
                if (tutorialList.hasOwnProperty(tutorial) && tutorialList[tutorial].language === GUISTATE_C.getLanguage().toUpperCase()) {
                    tutorialList[tutorial].id = tutorial;
                    tutorialArray.push(tutorialList[tutorial]);
                }
            }
            $('#tutorialTable').bootstrapTable('load', tutorialArray);
            configureTagsInput();
        }
    }
    var rowAttributes = function (row, index) {
        var hash = UTIL.getHashFrom(row.robot + row.name + row.index);
        currentColorIndex = hash % BACKGROUND_COLORS.length;
        return {
            style: 'background-color :' +
                BACKGROUND_COLORS[currentColorIndex] +
                ';' + //
                'padding: 24px 24px 6px 24px; border: solid 12px white; z-index: 1; cursor: pointer;',
        };
    };
    var titleTime = '<span class="tutorialIcon typcn typcn-stopwatch" />';
    var titleSim = '<span class="tutorialIcon typcn typcn-simulation" />';
    var titleAge = '<span class="tutorialIcon typcn typcn-group" />';
    var titleLevel = '<span class="tutorialIcon typcn typcn-mortar-board"/>';
    var formatRobot = function (robot, row, index) {
        return '<div class="typcn typcn-' + GUISTATE_C.findGroup(robot) + '"></div>';
    };
    var formatName = function (value, row, index) {
        return '<div class="galleryProgramname">' + value + '</div>';
    };
    var formatTutorialOverview = function (overview, row, index) {
        switch (overview) {
            case row.overview.description:
                return '<div class="tutorialOverview color' + currentColorIndex + '">' + overview + '</div>';
            case row.overview.goal:
                return '<div class="tutorialOverview color' + currentColorIndex + '"><b>Lernziel: </b>' + overview + '</div>';
            case row.overview.previous:
                return '<div class="tutorialOverview color' + currentColorIndex + '"><b>Vorkenntnisse: </b>' + overview + '</div>';
            default:
                return '';
        }
    };
    var formatTags = function (tags, row, index) {
        if (!tags) {
            tags = '&nbsp;';
        }
        return '<input class="infoTags" type="text" value="' + tags + '" data-role="tagsinput"/>';
    };
    exports.formatTags = formatTags;
    var formatSim = function (sim, row, index) {
        if (sim && (sim === 'sim' || sim === 1)) {
            return 'ja<span style="display:none;">simulation</span>';
        }
        else {
            return 'nein<span style="display:none;">real</span>';
        }
    };
    var formatLevel = function (level, row, index) {
        var html = '';
        if (level) {
            var maxLevel = isNaN(level) ? level.split('/')[1] : 3;
            var thisLevel = isNaN(level) ? level.split('/')[0] : level;
            for (var i = 1; i <= maxLevel; i++) {
                if (i <= thisLevel) {
                    html = '<span style="left: 0;" class="tutorialLevel typcn typcn-star-full-outline"/>' + html;
                }
                else {
                    html = '<span class="tutorialLevel typcn typcn-star-outline"/>' + html;
                }
            }
            html = '<span class="tutorialLevelStars" style="left:' + (maxLevel * 16 + 20) + ';">' + html;
            html += '</span>';
        }
        return html;
    };
    function configureTagsInput() {
        $('.infoTags').tagsinput();
        $('#tutorialTable .bootstrap-tagsinput').addClass('galleryTags');
        $('#tutorialList').find('.tutorialTags>input').attr('readonly', 'true');
        $('#tutorialList').find('span[data-role=remove]').addClass('hidden');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHV0b3JpYWxMaXN0LmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3JvYmVydGEvY29udHJvbGxlci90dXRvcmlhbExpc3QuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFzQkEsSUFBSSxpQkFBaUIsR0FBRztRQUNwQixTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO1FBQ1QsU0FBUztRQUNULFNBQVM7UUFDVCxTQUFTO0tBQ1osQ0FBQztJQUNGLElBQUksaUJBQWlCLENBQUM7SUFDdEIsSUFBSSxZQUFZLENBQUM7SUFDakI7O09BRUc7SUFDSCxTQUFTLElBQUk7UUFDVCxZQUFZLEdBQUcsVUFBVSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDL0MsS0FBSyxJQUFJLFFBQVEsSUFBSSxZQUFZLEVBQUU7WUFDL0IsSUFBSSxZQUFZLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN2QyxDQUFDLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxNQUFNLENBQzFDLGFBQWE7b0JBQ1QsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVE7b0JBQy9CLEdBQUc7b0JBQ0gsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUs7b0JBQzVCLG9CQUFvQjtvQkFDcEIsUUFBUTtvQkFDUixtREFBbUQ7b0JBQ25ELFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJO29CQUMzQixXQUFXLENBQ2xCLENBQUM7YUFDTDtTQUNKO1FBQ0QsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuQixzQkFBc0IsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUF1TVEsb0JBQUk7SUFyTWIsU0FBUyxnQkFBZ0I7UUFDckIsQ0FBQyxDQUFDLGdCQUFn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