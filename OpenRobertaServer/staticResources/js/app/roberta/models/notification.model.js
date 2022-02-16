/**
 * Rest calls to the server related to notification operations (save, delete, get)
 *
 * @module rest/program
 */
define(["require", "exports", "comm"], function (require, exports, COMM) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.postNotifications = exports.getNotifications = void 0;
    exports.getNotifications = function (successFn) {
        COMM.json('/notifications/getNotifications', {}, function (result) {
            if (result.rc === 'ok' && result.message === 'ORA_SERVER_SUCCESS') {
                successFn(result);
            }
        }, 'load notofications');
    };
    exports.postNotifications = function (notifications, successFn) {
        COMM.json('/notifications/postNotifications', {
            notifications: notifications,
        }, successFn, 'send notifications to server');
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uLm1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL21vZGVscy9ub3RpZmljYXRpb24ubW9kZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRzs7OztJQUlVLFFBQUEsZ0JBQWdCLEdBQUcsVUFBVSxTQUFTO1FBQy9DLElBQUksQ0FBQyxJQUFJLENBQ0wsaUNBQWlDLEVBQ2pDLEVBQUUsRUFDRixVQUFVLE1BQU07WUFDWixJQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssb0JBQW9CLEVBQUU7Z0JBQy9ELFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNyQjtRQUNMLENBQUMsRUFDRCxvQkFBb0IsQ0FDdkIsQ0FBQztJQUNOLENBQUMsQ0FBQztJQUVXLFFBQUEsaUJBQWlCLEdBQUcsVUFBVSxhQUFhLEVBQUUsU0FBUztRQUMvRCxJQUFJLENBQUMsSUFBSSxDQUNMLGtDQUFrQyxFQUNsQztZQUNJLGFBQWEsRUFBRSxhQUFhO1NBQy9CLEVBQ0QsU0FBUyxFQUNULDhCQUE4QixDQUNqQyxDQUFDO0lBQ04sQ0FBQyxDQUFDIn0=