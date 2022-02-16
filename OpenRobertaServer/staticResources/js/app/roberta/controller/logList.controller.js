define(["require", "exports", "util", "guiState.controller", "jquery", "blockly", "bootstrap-table"], function (require, exports, UTIL, GUISTATE_C, $, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    /**
     * Initialize table of programs
     */
    function init() {
        initLogList();
        initLogListEvents();
    }
    exports.init = init;
    function initLogList() {
        $('#logTable').bootstrapTable({
            height: UTIL.calcDataTableHeight(),
            pageList: '[ 10, 25, All ]',
            toolbar: '#logListToolbar',
            showRefresh: 'true',
            showPaginationSwitch: 'true',
            pagination: 'true',
            buttonsAlign: 'right',
            rowStyle: rowStyle,
            resizable: 'true',
            iconsPrefix: 'typcn',
            icons: {
                paginationSwitchDown: 'typcn-document-text',
                paginationSwitchUp: 'typcn-book',
                refresh: 'typcn-delete',
            },
            columns: [
                {
                    title: 'no.',
                    sortable: true,
                    align: 'center',
                    width: '75px',
                    field: '0',
                },
                {
                    title: 'type',
                    sortable: true,
                    align: 'center',
                    width: '75px',
                    field: '1',
                },
                {
                    title: 'message',
                    field: '2',
                },
            ],
        });
        $('#logTable').bootstrapTable('togglePagination');
        $('#logList>.bootstrap-table')
            .find('button[name="refresh"]')
            .attr('title', '')
            .attr('rel', 'tooltip')
            .attr('data-placement', 'left')
            .attr('lkey', 'Blockly.Msg.BUTTON_EMPTY_LIST')
            .attr('data-original-title', Blockly.Msg.BUTTON_EMPTY_LIST)
            .tooltip('fixTitle');
    }
    function initLogListEvents() {
        $('#tabLogList').onWrap('show.bs.tab', function () {
            GUISTATE_C.setView('tabLogList');
        });
        $(window).resize(function () {
            $('#logTable').bootstrapTable('resetView', {
                height: UTIL.calcDataTableHeight(),
            });
        });
        $('#logList>.bootstrap-table')
            .find('button[name="refresh"]')
            .onWrap('click', function () {
            $('#logTable').bootstrapTable('removeAll');
            return false;
        }, 'empty log list clicked');
        $('#backLogList').onWrap('click', function () {
            $('#' + GUISTATE_C.getPrevView()).clickWrap();
            return false;
        }, 'back to previous view');
    }
    function rowStyle(row, index) {
        if (row[1] === '[[ERR ]] ') {
            return {
                classes: 'danger',
            };
        }
        else
            return {};
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nTGlzdC5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvbG9nTGlzdC5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBOztPQUVHO0lBQ0gsU0FBUyxJQUFJO1FBQ1QsV0FBVyxFQUFFLENBQUM7UUFDZCxpQkFBaUIsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFDUSxvQkFBSTtJQUViLFNBQVMsV0FBVztRQUNoQixDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsY0FBYyxDQUFDO1lBQzFCLE1BQU0sRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDbEMsUUFBUSxFQUFFLGlCQUFpQjtZQUMzQixPQUFPLEVBQUUsaUJBQWlCO1lBQzFCLFdBQVcsRUFBRSxNQUFNO1lBQ25CLG9CQUFvQixFQUFFLE1BQU07WUFDNUIsVUFBVSxFQUFFLE1BQU07WUFDbEIsWUFBWSxFQUFFLE9BQU87WUFDckIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsU0FBUyxFQUFFLE1BQU07WUFDakIsV0FBVyxFQUFFLE9BQU87WUFDcEIsS0FBSyxFQUFFO2dCQUNILG9CQUFvQixFQUFFLHFCQUFxQjtnQkFDM0Msa0JBQWtCLEVBQUUsWUFBWTtnQkFDaEMsT0FBTyxFQUFFLGNBQWM7YUFDMUI7WUFDRCxPQUFPLEVBQUU7Z0JBQ0w7b0JBQ0ksS0FBSyxFQUFFLEtBQUs7b0JBQ1osUUFBUSxFQUFFLElBQUk7b0JBQ2QsS0FBSyxFQUFFLFFBQVE7b0JBQ2YsS0FBSyxFQUFFLE1BQU07b0JBQ2IsS0FBSyxFQUFFLEdBQUc7aUJBQ2I7Z0JBQ0Q7b0JBQ0ksS0FBSyxFQUFFLE1BQU07b0JBQ2IsUUFBUSxFQUFFLElBQUk7b0JBQ2QsS0FBSyxFQUFFLFFBQVE7b0JBQ2YsS0FBSyxFQUFFLE1BQU07b0JBQ2IsS0FBSyxFQUFFLEdBQUc7aUJBQ2I7Z0JBQ0Q7b0JBQ0ksS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLEtBQUssRUFBRSxHQUFHO2lCQUNiO2FBQ0o7U0FDSixDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbEQsQ0FBQyxDQUFDLDJCQUEyQixDQUFDO2FBQ3pCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQzthQUM5QixJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQzthQUNqQixJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQzthQUN0QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDO2FBQzlCLElBQUksQ0FBQyxNQUFNLEVBQUUsK0JBQStCLENBQUM7YUFDN0MsSUFBSSxDQUFDLHFCQUFxQixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUM7YUFDMUQsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxTQUFTLGlCQUFpQjtRQUN0QixDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRTtZQUNuQyxVQUFVLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBRUgsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUNiLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFO2dCQUN2QyxNQUFNLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2FBQ3JDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsQ0FBQyxDQUFDLDJCQUEyQixDQUFDO2FBQ3pCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQzthQUM5QixNQUFNLENBQ0gsT0FBTyxFQUNQO1lBQ0ksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMzQyxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLEVBQ0Qsd0JBQXdCLENBQzNCLENBQUM7UUFFTixDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUNwQixPQUFPLEVBQ1A7WUFDSSxDQUFDLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzlDLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUMsRUFDRCx1QkFBdUIsQ0FDMUIsQ0FBQztJQUNOLENBQUM7SUFFRCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSztRQUN4QixJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLEVBQUU7WUFDeEIsT0FBTztnQkFDSCxPQUFPLEVBQUUsUUFBUTthQUNwQixDQUFDO1NBQ0w7O1lBQU0sT0FBTyxFQUFFLENBQUM7SUFDckIsQ0FBQyJ9