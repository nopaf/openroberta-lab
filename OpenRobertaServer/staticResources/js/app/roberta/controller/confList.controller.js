define(["require", "exports", "util", "confList.model", "blockly", "jquery", "bootstrap-table"], function (require, exports, UTIL, CONFLIST, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    /**
     * Initialize table of configurations
     */
    function init() {
        initConfList();
        initConfListEvents();
    }
    exports.init = init;
    function initConfList() {
        $('#confNameTable').bootstrapTable({
            height: UTIL.calcDataTableHeight(),
            pageList: '[ 10, 25, All ]',
            toolbar: '#confListToolbar',
            showRefresh: 'true',
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
                    title: "<span lkey='Blockly.Msg.DATATABLE_CONFIGURATION_NAME'>" +
                        (Blockly.Msg.DATATABLE_CONFIGURATION_NAME || 'Name der Configuration') +
                        '</span>',
                    sortable: true,
                    field: '0',
                },
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_CREATED_BY'>" + (Blockly.Msg.DATATABLE_CREATED_BY || 'Erzeugt von') + '</span>',
                    sortable: true,
                    field: '1',
                },
                {
                    title: "<span class='typcn typcn-flow-merge'></span>",
                    field: '2',
                    sortable: true,
                    sorter: sortRelations,
                    formatter: formatRelations,
                    align: 'left',
                    valign: 'middle',
                },
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_CREATED_ON'>" + (Blockly.Msg.DATATABLE_CREATED_ON || 'Erzeugt am') + '</span>',
                    sortable: true,
                    field: '3',
                    formatter: UTIL.formatDate,
                },
                {
                    title: "<span lkey='Blockly.Msg.DATATABLE_ACTUALIZATION'>" + (Blockly.Msg.DATATABLE_ACTUALIZATION || 'Letzte Aktualisierung') + '</span>',
                    sortable: true,
                    field: '4',
                    formatter: UTIL.formatDate,
                },
                {
                    field: '5',
                    checkbox: true,
                    valign: 'middle',
                },
                {
                    field: '7',
                    events: eventsDeleteShareLoad,
                    title: titleActions,
                    align: 'left',
                    valign: 'top',
                    formatter: formatDeleteShareLoad,
                    width: '89px',
                },
            ],
        });
        $('#confNameTable').bootstrapTable('togglePagination');
    }
    function initConfListEvents() {
        $(window).resize(function () {
            $('#confNameTable').bootstrapTable('resetView', {
                height: UTIL.calcDataTableHeight(),
            });
        });
        $('#tabConfList').onWrap('show.bs.tab', function (e) {
            guiStateController.setView('tabConfList');
            CONFLIST.loadConfList(update);
        });
        $('#confList>.bootstrap-table')
            .find('button[name="refresh"]')
            .onWrap('click', function () {
            CONFLIST.loadConfList(update);
            return false;
        }, 'refresh configuration list clicked');
        $('#confNameTable').onWrap('click-row.bs.table', function ($element, row) {
            configurationController.loadFromListing(row);
        }, 'Load configuration from listing clicked');
        $('#confNameTable').onWrap('check-all.bs.table', function ($element, rows) {
            $('.deleteSomeConf').removeClass('disabled');
            $('#shareSome').removeClass('disabled');
            $('.delete').addClass('disabled');
            $('.share').addClass('disabled');
            $('.load').addClass('disabled');
        }, 'check all configurations');
        $('#confNameTable').onWrap('check.bs.table', function ($element, row) {
            $('.deleteSomeConf').removeClass('disabled');
            $('#shareSome').removeClass('disabled');
            $('.delete').addClass('disabled');
            $('.share').addClass('disabled');
            $('.load').addClass('disabled');
        }, 'check one configuration');
        $('#confNameTable').onWrap('uncheck-all.bs.table', function ($element, rows) {
            $('.deleteSomeConf').addClass('disabled');
            $('#shareSome').addClass('disabled');
            $('.delete').removeClass('disabled');
            $('.share').removeClass('disabled');
            $('.load').removeClass('disabled');
        }, 'uncheck all configurations');
        $('#confNameTable').onWrap('uncheck.bs.table', function ($element, row) {
            var selectedRows = $('#confNameTable').bootstrapTable('getSelections');
            if (selectedRows.length <= 0 || selectedRows == null) {
                $('.deleteSomeConf').addClass('disabled');
                $('#shareSome').addClass('disabled');
                $('.delete').removeClass('disabled');
                $('.share').removeClass('disabled');
                $('.load').removeClass('disabled');
            }
        }, 'uncheck one configuration');
        $('#backConfList').onWrap('click', function () {
            $('#tabConfiguration').clickWrap();
            return false;
        }, 'back to configuration view');
        $(document).onWrap('click', '.deleteSomeConf', function () {
            var configurations = $('#confNameTable').bootstrapTable('getSelections', {});
            var names = '';
            for (var i = 0; i < configurations.length; i++) {
                names += configurations[i][0];
                names += '<br>';
            }
            $('#confirmDeleteConfName').html(names);
            $('#confirmDeleteConfiguration').oneWrap('hide.bs.modal', function (event) {
                CONFLIST.loadConfList(update);
            });
            $('#confirmDeleteConfiguration').data('configurations', configurations);
            $('#confirmDeleteConfiguration').modal('show');
            return false;
        }, 'delete configurations');
        $('#confNameTable').on('shown.bs.collapse hidden.bs.collapse', function (e) {
            $('#confNameTable').bootstrapTable('resetWidth');
        });
        function update(result) {
            UTIL.response(result);
            if (result.rc === 'ok') {
                $('#confNameTable').bootstrapTable({});
                $('#confNameTable').bootstrapTable('load', result.configurationNames);
                $('#confNameTable').bootstrapTable('hideColumn', '2');
                $('#confNameTable').bootstrapTable('hideColumn', '3');
            }
            $('#deleteSomeConf').attr('data-original-title', Blockly.Msg.CONFLIST_DELETE_ALL_TOOLTIP || 'Click here to delete all selected robot configurations.');
            $('#confNameTable')
                .find('.delete')
                .attr('data-original-title', Blockly.Msg.CONFLIST_DELETE_TOOLTIP || 'Click here to delete your robot configuration.');
            $('#confNameTable')
                .find('.load')
                .attr('data-original-title', Blockly.Msg.CONFLIST_LOAD_TOOLTIP || 'Click here to load your robot configuration in the configuration environment.');
            $('#confNameTable').find('[rel="tooltip"]').tooltip();
        }
    }
    var eventsDeleteShareLoad = {
        'click .delete': function (e, value, row, index) {
            //var deleted = false;
            e.stopPropagation();
            var selectedRows = [row];
            var names = '';
            for (var i = 0; i < selectedRows.length; i++) {
                names += selectedRows[i][0];
                names += '<br>';
            }
            $('#confirmDeleteConfName').html(names);
            $('#confirmDeleteConfiguration').data('configurations', selectedRows);
            $('#confirmDeleteConfiguration').modal('show');
            return false;
        },
        'click .share': function (e, value, row, index) {
            if (!row[2].sharedFrom) {
                $('#show-relations').trigger('updateAndShow', [row]);
            }
            return false;
        },
        'click .load': function (e, value, row, index) {
            configurationController.loadFromListing(row);
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
        if (value.sharedWith && Object.keys(value.sharedWith).length == 1) {
            var result = '';
            $.each(value.sharedWith, function (i, obj) {
                $.each(obj, function (user, right) {
                    result += '<span>';
                    if (right === 'READ') {
                        result += '<span class="typcn typcn-eye"></span>';
                    }
                    else {
                        result += '<span title="WRITE" class="typcn typcn-pencil"></span>';
                    }
                    result += '&nbsp;';
                    result += user;
                    result += '</span>';
                });
            });
            return result;
        }
        if (value.sharedWith && Object.keys(value.sharedWith).length > 1) {
            var result = '';
            $.each(value.sharedWith, function (i, obj) {
                $.each(obj, function (user, right) {
                    if (i == 0) {
                        result += '<div style="white-space:nowrap;"><span style="float:left;">';
                        if (right === 'READ') {
                            result += '<span title="READ" class="typcn typcn-eye"></span>';
                        }
                        else {
                            result += '<span title="WRITE" class="typcn typcn-pencil"></span>';
                        }
                        result += '&nbsp;';
                        result += user;
                        result +=
                            '</span><a class="collapsed showRelations" href="#" style="float:right;"' +
                                'href="#" data-toggle="collapse" data-target=".relation' +
                                index +
                                '"></a></div>';
                    }
                    else {
                        result += '<div style="clear:both;" class="collapse relation' + index + '">';
                        if (right == 'READ') {
                            result += '<span title="READ" class="typcn typcn-eye"></span>';
                        }
                        else {
                            result += '<span title="WRITE" class="typcn typcn-pencil"></span>';
                        }
                        result += '&nbsp';
                        result += user;
                        result += '</div>';
                    }
                });
            });
            return result;
        }
    };
    var formatDeleteShareLoad = function (value, row, index) {
        var result = '';
        result +=
            '<a href="#" class="delete" rel="tooltip" lkey="Blockly.Msg.CONFLIST_DELETE_TOOLTIP" data-original-title="" title=""><span class="typcn typcn-delete"></span></a>';
        result +=
            '<a href="#" class="load" rel="tooltip" lkey="Blockly.Msg.CONFLIST_LOAD_TOOLTIP" data-original-title="" title=""><span class="typcn typcn-document"></span></a>';
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
            var value = {};
            $.each(a.sharedWith, function (i, obj) {
                $.each(obj, function (user, right) {
                    value.a = right;
                    return false;
                });
                return false;
            });
            $.each(b.sharedWith, function (i, obj) {
                $.each(obj, function (user, right) {
                    value.b = right;
                    return false;
                });
                return false;
            });
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
    var titleActions = '<a href="#" id="deleteSomeConf" class="deleteSomeConf disabled" rel="tooltip" lkey="Blockly.Msg.CONFLIST_DELETE_ALL_TOOLTIP" data-original-title="" data-container="body" title="">' +
        '<span class="typcn typcn-delete"></span></a>';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZkxpc3QuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9jb250cm9sbGVyL2NvbmZMaXN0LmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0E7O09BRUc7SUFDSCxTQUFTLElBQUk7UUFDVCxZQUFZLEVBQUUsQ0FBQztRQUNmLGtCQUFrQixFQUFFLENBQUM7SUFDekIsQ0FBQztJQUNRLG9CQUFJO0lBRWIsU0FBUyxZQUFZO1FBQ2pCLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUMvQixNQUFNLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQ2xDLFFBQVEsRUFBRSxpQkFBaUI7WUFDM0IsT0FBTyxFQUFFLGtCQUFrQjtZQUMzQixXQUFXLEVBQUUsTUFBTTtZQUNuQixvQkFBb0IsRUFBRSxNQUFNO1lBQzVCLFVBQVUsRUFBRSxNQUFNO1lBQ2xCLFlBQVksRUFBRSxPQUFPO1lBQ3JCLFNBQVMsRUFBRSxNQUFNO1lBQ2pCLFdBQVcsRUFBRSxPQUFPO1lBQ3BCLEtBQUssRUFBRTtnQkFDSCxvQkFBb0IsRUFBRSxxQkFBcUI7Z0JBQzNDLGtCQUFrQixFQUFFLFlBQVk7Z0JBQ2hDLE9BQU8sRUFBRSxlQUFlO2FBQzNCO1lBQ0QsT0FBTyxFQUFFO2dCQUNMO29CQUNJLEtBQUssRUFDRCx3REFBd0Q7d0JBQ3hELENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsSUFBSSx3QkFBd0IsQ0FBQzt3QkFDdEUsU0FBUztvQkFDYixRQUFRLEVBQUUsSUFBSTtvQkFDZCxLQUFLLEVBQUUsR0FBRztpQkFDYjtnQkFDRDtvQkFDSSxLQUFLLEVBQUUsZ0RBQWdELEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixJQUFJLGFBQWEsQ0FBQyxHQUFHLFNBQVM7b0JBQ3pILFFBQVEs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