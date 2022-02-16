/**
 * Rest calls to the server related to program operations (save, delete,
 * share...)
 *
 * @module rest/program
 */
define(["require", "exports", "comm"], function (require, exports, COMM) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadGalleryList = exports.loadExampleList = exports.loadProgListFromUserGroupMembers = exports.loadProgList = void 0;
    /**
     * Refresh program list
     */
    function loadProgList(successFn) {
        COMM.json('/program/listing/names', {}, successFn, 'load program list');
    }
    exports.loadProgList = loadProgList;
    /**
     *
     */
    function loadProgListFromUserGroupMembers(userGroupName, successFn) {
        COMM.json('/program/userGroupMembers/names', {
            cmd: 'getInfosOfProgramsOfUserGroupMembers',
            groupName: userGroupName,
        }, successFn, 'load program list of the members of the user group "' + userGroupName + '" from the server.');
    }
    exports.loadProgListFromUserGroupMembers = loadProgListFromUserGroupMembers;
    /**
     * Refresh example list
     */
    function loadExampleList(successFn) {
        COMM.json('/program/examples/names', {}, successFn, 'load example list');
    }
    exports.loadExampleList = loadExampleList;
    /**
     * Refresh example list
     */
    function loadGalleryList(successFn, filters) {
        var data = !!filters ? filters : {};
        COMM.json('/program/gallery', data, successFn, 'load gallery list');
    }
    exports.loadGalleryList = loadGalleryList;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ0xpc3QubW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3JvYmVydGEvbW9kZWxzL3Byb2dMaXN0Lm1vZGVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHOzs7O0lBSUg7O09BRUc7SUFDSCxTQUFTLFlBQVksQ0FBQyxTQUFTO1FBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUErQlEsb0NBQVk7SUE3QnJCOztPQUVHO0lBQ0gsU0FBUyxnQ0FBZ0MsQ0FBQyxhQUFhLEVBQUUsU0FBUztRQUM5RCxJQUFJLENBQUMsSUFBSSxDQUNMLGlDQUFpQyxFQUNqQztZQUNJLEdBQUcsRUFBRSxzQ0FBc0M7WUFDM0MsU0FBUyxFQUFFLGFBQWE7U0FDM0IsRUFDRCxTQUFTLEVBQ1Qsc0RBQXNELEdBQUcsYUFBYSxHQUFHLG9CQUFvQixDQUNoRyxDQUFDO0lBQ04sQ0FBQztJQWdCc0IsNEVBQWdDO0lBZHZEOztPQUVHO0lBQ0gsU0FBUyxlQUFlLENBQUMsU0FBUztRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBU3dELDBDQUFlO0lBUHhFOztPQUVHO0lBQ0gsU0FBUyxlQUFlLENBQUMsU0FBUyxFQUFFLE9BQU87UUFDdkMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUN5RSwwQ0FBZSJ9