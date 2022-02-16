define(["require", "exports", "log", "util", "message", "configuration.model", "jquery", "bootstrap-table"], function (require, exports, LOG, UTIL, MSG, CONFIGURATION, $) {
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
         * Delete the configurations that were selected in configuration list
         */
        $('#doDeleteConfiguration').onWrap('click', function () {
            var configurations = $('#confirmDeleteConfiguration').data('configurations');
            for (var i = 0; i < configurations.length; i++) {
                var conf = configurations[i];
                var confName = conf[0];
                CONFIGURATION.deleteConfigurationFromListing(confName, function (result, confName) {
                    UTIL.response(result);
                    if (result.rc === 'ok') {
                        MSG.displayInformation(result, 'MESSAGE_CONFIGURATION_DELETED', result.message, confName);
                        $('#confList').find('button[name="refresh"]').clickWrap();
                        LOG.info('delete configuration "' + confName);
                    }
                }, 'delete configuration');
            }
            $('.modal').modal('hide');
        }),
            'doDeleteConfigurations clicked';
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZkRlbGV0ZS5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvY29uZkRlbGV0ZS5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLFNBQVMsSUFBSTtRQUNULHFCQUFxQjtRQUNyQixVQUFVLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBQ1Esb0JBQUk7SUFFYixTQUFTLFFBQVEsS0FBSSxDQUFDO0lBRXRCLFNBQVMsVUFBVTtRQUNmOztXQUVHO1FBQ0gsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUN4QyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM3RSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDNUMsSUFBSSxJQUFJLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLGFBQWEsQ0FBQyw4QkFBOEIsQ0FDeEMsUUFBUSxFQUNSLFVBQVUsTUFBTSxFQUFFLFFBQVE7b0JBQ3RCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3RCLElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSyxJQUFJLEVBQUU7d0JBQ3BCLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsK0JBQStCLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFDMUYsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUMxRCxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLFFBQVEsQ0FBQyxDQUFDO3FCQUNqRDtnQkFDTCxDQUFDLEVBQ0Qsc0JBQXNCLENBQ3pCLENBQUM7YUFDTDtZQUNELENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFDO1lBQ0UsZ0NBQWdDLENBQUM7SUFDekMsQ0FBQyJ9