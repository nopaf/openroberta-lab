/**
 * Rest calls to the server related to the configuration operations (save,
 * delete, share...)
 *
 * @module rest/configuration
 */
define(["require", "exports", "comm"], function (require, exports, COMM) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.refreshList = exports.loadConfigurationFromListing = exports.deleteConfigurationFromListing = exports.saveConfigurationToServer = exports.saveAsConfigurationToServer = void 0;
    /**
     * Save program with new name to server
     *
     * @param configName
     *            {String } - name of the robot configuration
     *
     * @param xmlText
     *            {String} - XML representation of the robot configuration
     */
    function saveAsConfigurationToServer(configName, xmlText, successFn) {
        COMM.json('/conf/saveC', {
            cmd: 'saveAsC',
            name: configName,
            configuration: xmlText,
        }, successFn, 'save configuration to server with new name ' + configName);
    }
    exports.saveAsConfigurationToServer = saveAsConfigurationToServer;
    /**
     * Save program
     *
     * @param configName
     *            {String } - name of the robot configuration
     *
     * @param xmlText
     *            {String} - XML representation of the robot configuration
     */
    function saveConfigurationToServer(configName, xmlText, successFn) {
        COMM.json('/conf/saveC', {
            cmd: 'saveC',
            name: configName,
            configuration: xmlText,
        }, successFn, 'save configuration ' + configName + ' to server');
    }
    exports.saveConfigurationToServer = saveConfigurationToServer;
    /**
     * Delete the configuration that was selected in configuration list
     *
     * @param configName
     *            {String } - name of the robot configuration
     *
     */
    function deleteConfigurationFromListing(configName, successFn) {
        COMM.json('/conf/deleteC', {
            cmd: 'deleteC',
            name: configName,
        }, function (result) {
            successFn(result, configName);
        }, 'delete configuration ' + configName);
    }
    exports.deleteConfigurationFromListing = deleteConfigurationFromListing;
    /**
     * Load the configuration that was selected in program list
     *
     * @param configName
     *            {String } - name of the robot configuration
     *
     * @param owner
     *            {String} - configuration owner
     */
    function loadConfigurationFromListing(configName, owner, successFn) {
        COMM.json('/conf/loadC', {
            cmd: 'loadC',
            name: configName,
            owner: owner,
        }, successFn, 'load configuration ' + configName);
    }
    exports.loadConfigurationFromListing = loadConfigurationFromListing;
    /**
     * Refresh configuration list
     *
     */
    function refreshList(successFn) {
        COMM.json('/conf/loadCN', {
            cmd: 'loadCN',
        }, successFn, 'refresh configuration list');
    }
    exports.refreshList = refreshList;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9tb2RlbHMvY29uZmlndXJhdGlvbi5tb2RlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRzs7OztJQUlIOzs7Ozs7OztPQVFHO0lBQ0gsU0FBUywyQkFBMkIsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFNBQVM7UUFDL0QsSUFBSSxDQUFDLElBQUksQ0FDTCxhQUFhLEVBQ2I7WUFDSSxHQUFHLEVBQUUsU0FBUztZQUNkLElBQUksRUFBRSxVQUFVO1lBQ2hCLGFBQWEsRUFBRSxPQUFPO1NBQ3pCLEVBQ0QsU0FBUyxFQUNULDZDQUE2QyxHQUFHLFVBQVUsQ0FDN0QsQ0FBQztJQUNOLENBQUM7SUFrRlEsa0VBQTJCO0lBaEZwQzs7Ozs7Ozs7T0FRRztJQUNILFNBQVMseUJBQXlCLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxTQUFTO1FBQzdELElBQUksQ0FBQyxJQUFJLENBQ0wsYUFBYSxFQUNiO1lBQ0ksR0FBRyxFQUFFLE9BQU87WUFDWixJQUFJLEVBQUUsVUFBVTtZQUNoQixhQUFhLEVBQUUsT0FBTztTQUN6QixFQUNELFNBQVMsRUFDVCxxQkFBcUIsR0FBRyxVQUFVLEdBQUcsWUFBWSxDQUNwRCxDQUFDO0lBQ04sQ0FBQztJQTREcUMsOERBQXlCO0lBMUQvRDs7Ozs7O09BTUc7SUFDSCxTQUFTLDhCQUE4QixDQUFDLFVBQVUsRUFBRSxTQUFTO1FBQ3pELElBQUksQ0FBQyxJQUFJLENBQ0wsZUFBZSxFQUNmO1lBQ0ksR0FBRyxFQUFFLFNBQVM7WUFDZCxJQUFJLEVBQUUsVUFBVTtTQUNuQixFQUNELFVBQVUsTUFBTTtZQUNaLFNBQVMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEMsQ0FBQyxFQUNELHVCQUF1QixHQUFHLFVBQVUsQ0FDdkMsQ0FBQztJQUNOLENBQUM7SUF1Q2dFLHdFQUE4QjtJQXJDL0Y7Ozs7Ozs7O09BUUc7SUFDSCxTQUFTLDRCQUE0QixDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUztRQUM5RCxJQUFJLENBQUMsSUFBSSxDQUNMLGFBQWEsRUFDYjtZQUNJLEdBQUcsRUFBRSxPQUFPO1lBQ1osSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLEtBQUs7U0FDZixFQUNELFNBQVMsRUFDVCxxQkFBcUIsR0FBRyxVQUFVLENBQ3JDLENBQUM7SUFDTixDQUFDO0lBaUJnRyxvRUFBNEI7SUFmN0g7OztPQUdHO0lBQ0gsU0FBUyxXQUFXLENBQUMsU0FBUztRQUMxQixJQUFJLENBQUMsSUFBSSxDQUNMLGNBQWMsRUFDZDtZQUNJLEdBQUcsRUFBRSxRQUFRO1NBQ2hCLEVBQ0QsU0FBUyxFQUNULDRCQUE0QixDQUMvQixDQUFDO0lBQ04sQ0FBQztJQUU4SCxrQ0FBVyJ9