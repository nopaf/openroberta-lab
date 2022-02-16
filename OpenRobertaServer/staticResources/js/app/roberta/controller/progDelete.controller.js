define(["require", "exports", "log", "util", "message", "program.model", "jquery", "bootstrap-table"], function (require, exports, LOG, UTIL, MSG, PROGRAM, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    function init() {
        //        initView();
        initEvents();
    }
    exports.init = init;
    function initView() { }
    function initEvents() {
        /**
         * Delete the programs that were selected in program list
         */
        $('#doDeleteProgram').onWrap('click', function () {
            var programs = $('#confirmDeleteProgram').data('programs');
            for (var i = 0; i < programs.length; i++) {
                var prog = programs[i];
                var progName = prog[0];
                var progOwner = prog[1];
                var progRight = prog[2];
                var author = prog[3];
                if (progRight.sharedFrom) {
                    PROGRAM.deleteShare(progName, progOwner, author, function (result, progName) {
                        UTIL.response(result);
                        if (result.rc === 'ok') {
                            MSG.displayInformation(result, 'MESSAGE_PROGRAM_DELETED', result.message, progName);
                            $('#progList').find('button[name="refresh"]').clickWrap();
                            LOG.info('remove shared program "' + progName + '"form List');
                        }
                    });
                }
                else {
                    PROGRAM.deleteProgramFromListing(progName, author, function (result, progName) {
                        UTIL.response(result);
                        if (result.rc === 'ok') {
                            MSG.displayInformation(result, 'MESSAGE_PROGRAM_DELETED', result.message, progName);
                            $('#progList').find('button[name="refresh"]').clickWrap();
                            LOG.info('delete program "' + progName);
                        }
                    });
                }
            }
            $('.modal').modal('hide');
        }),
            'delete programs clicked';
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ0RlbGV0ZS5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvcHJvZ0RlbGV0ZS5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLFNBQVMsSUFBSTtRQUNULHFCQUFxQjtRQUNyQixVQUFVLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBQ1Esb0JBQUk7SUFFYixTQUFTLFFBQVEsS0FBSSxDQUFDO0lBRXRCLFNBQVMsVUFBVTtRQUNmOztXQUVHO1FBQ0gsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNsQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3RDLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUU7b0JBQ3RCLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsVUFBVSxNQUFNLEVBQUUsUUFBUTt3QkFDdkUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDdEIsSUFBSSxNQUFNLENBQUMsRUFBRSxLQUFLLElBQUksRUFBRTs0QkFDcEIsR0FBRyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUNwRixDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7NEJBQzFELEdBQUcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDO3lCQUNqRTtvQkFDTCxDQUFDLENBQUMsQ0FBQztpQkFDTjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsd0JBQXdCLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLE1BQU0sRUFBRSxRQUFRO3dCQUN6RSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUN0QixJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssSUFBSSxFQUFFOzRCQUNwQixHQUFHLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLHlCQUF5QixFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7NEJBQ3BGLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs0QkFDMUQsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxRQUFRLENBQUMsQ0FBQzt5QkFDM0M7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7aUJBQ047YUFDSjtZQUNELENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFDO1lBQ0UseUJBQXlCLENBQUM7SUFDbEMsQ0FBQyJ9