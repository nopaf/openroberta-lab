/**
 * Rest calls to the server related to userGroup operations (create user, login ...)
 *
 * @module rest/program
 */
define(["require", "exports", "comm", "guiState.model"], function (require, exports, COMM, GUI) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateMemberAccount = exports.setUserGroupMemberDefaultPasswords = exports.setUserGroupMemberDefaultPassword = exports.deleteGroupMembers = exports.deleteGroupMember = exports.addGroupMembers = exports.deleteUserGroups = exports.deleteUserGroup = exports.createUserGroup = exports.loadUserGroupMemberList = exports.loadUserGroupList = exports.loadUserGroup = void 0;
    /**
     * Retrieves userGroup with specified name from the server, if the currently logged in user is its owner
     *
     * @param groupName
     *            {String} - name of the userGroup
     * @param successFn
     *            {Function} - a callback that is called when the creation succeeds. Needs to take one parameter "data"
     */
    function loadUserGroup(groupName, successFn) {
        COMM.json('/userGroup/getUserGroup', {
            cmd: 'getUserGroup',
            groupName: groupName,
        }, successFn, 'Got all information of the usergroup "' + groupName + '" of the user "' + GUI.user.accountName + '" from the server.');
    }
    exports.loadUserGroup = loadUserGroup;
    /**
     * Retrieves all userGroups from the server, for which the currently logged in user is the owner.
     *
     * @param successFn
     *            {Function} - a callback that is called when the creation succeeds. Needs to take one parameter "data"
     */
    function loadUserGroupList(successFn) {
        COMM.json('/userGroup/getUserGroupList', {
            cmd: 'getUserGroupList',
        }, successFn, 'Got the list of usergroups for the user "' + GUI.user.accountName + '" from the server.');
    }
    exports.loadUserGroupList = loadUserGroupList;
    /**
     * Retrieves all members of the usergroup of the provided name from the server, for which the currently logged in user is the owner.
     *
     * @param groupName
     *            {String} - name of the userGroup
     * @param successFn
     *            {Function} - a callback that is called when the creation succeeds. Needs to take one parameter "data"
     */
    function loadUserGroupMemberList(groupName, successFn) {
        COMM.json('/userGroup/getUserGroupMemberList', {
            cmd: 'getUserGroupMemberList',
            groupName: groupName,
        }, successFn, 'Got the list of members for the usergroup "' + groupName + '" of the user "' + GUI.user.accountName + '" from the server.');
    }
    exports.loadUserGroupMemberList = loadUserGroupMemberList;
    /**
     * Create a usergroup on the server.
     *
     * @param groupName
     *            {String} - name of the userGroup
     * @param successFn
     *            {Function} - a callback that is called when the creation succeeds. Needs to take one parameter "data"
     *
     */
    function createUserGroup(groupName, initialMembers, successFn) {
        COMM.json('/userGroup/createUserGroup', {
            cmd: 'createUserGroup',
            groupName: groupName,
            groupMemberNames: initialMembers,
        }, function (data) {
            successFn(data);
        }, 'Create usergroup "' + groupName + '" for user "' + GUI.user.accountName + '" on server.');
    }
    exports.createUserGroup = createUserGroup;
    function deleteUserGroup(groupName, successFn) {
        COMM.json('/userGroup/deleteUserGroups', {
            cmd: 'deleteUserGroups',
            groupNames: [groupName],
        }, function (data) {
            successFn(data);
        }, 'Delete usergroup "' + groupName + '" of user "' + GUI.user.accountName + '" on server.');
    }
    exports.deleteUserGroup = deleteUserGroup;
    function deleteUserGroups(groupNames, successFn) {
        COMM.json('/userGroup/deleteUserGroups', {
            cmd: 'deleteUserGroups',
            groupNames: groupNames,
        }, function (data) {
            successFn(data);
        }, 'Deleted "' + groupNames.length + '" user groups of user "' + GUI.user.accountName + '" on server.');
    }
    exports.deleteUserGroups = deleteUserGroups;
    function addGroupMembers(groupName, newMemberNames, successFn) {
        COMM.json('/userGroup/addGroupMembers', {
            cmd: 'addGroupMembers',
            groupName: groupName,
            groupMemberNames: newMemberNames,
        }, function (data) {
            successFn(data);
        }, 'Added ' + newMemberNames.length + ' members to usergroup "' + groupName + '" of user "' + GUI.user.accountName + '" on server.');
    }
    exports.addGroupMembers = addGroupMembers;
    function deleteGroupMember(groupName, memberAccount, successFn) {
        COMM.json('/userGroup/deleteGroupMembers', {
            cmd: 'deleteGroupMembers',
            groupName: groupName,
            groupMemberAccounts: [memberAccount],
        }, function (data) {
            successFn(data);
        }, 'Deleted member "' + memberAccount + '" of usergroup "' + groupName + '" of user "' + GUI.user.accountName + '" on server.');
    }
    exports.deleteGroupMember = deleteGroupMember;
    function deleteGroupMembers(groupName, memberAccounts, successFn) {
        COMM.json('/userGroup/deleteGroupMembers', {
            cmd: 'deleteGroupMembers',
            groupName: groupName,
            groupMemberAccounts: memberAccounts,
        }, function (data) {
            successFn(data);
        }, 'Deleted ' + memberAccounts.length + ' members of usergroup "' + groupName + '" of user "' + GUI.user.accountName + '" on server.');
    }
    exports.deleteGroupMembers = deleteGroupMembers;
    function setUserGroupMemberDefaultPassword(userGroupName, memberId, successFn) {
        COMM.json('/userGroup/setUserGroupMemberDefaultPasswords', {
            cmd: 'setUserGroupMemberDefaultPasswords',
            groupName: userGroupName,
            groupMemberAccounts: [memberId],
        }, function (data) {
            successFn(data);
        }, 'Reset the password of user "' + memberId + '" (member of "' + userGroupName + '") to default on server.');
    }
    exports.setUserGroupMemberDefaultPassword = setUserGroupMemberDefaultPassword;
    function setUserGroupMemberDefaultPasswords(userGroupName, memberIds, successFn) {
        COMM.json('/userGroup/setUserGroupMemberDefaultPasswords', {
            cmd: 'setUserGroupMemberDefaultPasswords',
            groupName: userGroupName,
            groupMemberAccounts: memberIds,
        }, function (data) {
            successFn(data);
        }, 'Reset the password of ' + memberIds.length + ' users of the group "' + userGroupName + '" to default value on server.');
    }
    exports.setUserGroupMemberDefaultPasswords = setUserGroupMemberDefaultPasswords;
    function updateMemberAccount(account, groupName, newAccount, successFn) {
        COMM.json('/userGroup/updateMemberAccount', {
            cmd: 'updateMemberAccount',
            groupName: groupName,
            currentGroupMemberAccount: account,
            newGroupMemberAccount: newAccount,
        }, function (data) {
            successFn(data);
        }, 'Set new account name for ' + account + ' of the group "' + groupName + '" to "' + newAccount + '" on server.');
    }
    exports.updateMemberAccount = updateMemberAccount;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckdyb3VwLm1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL21vZGVscy91c2VyR3JvdXAubW9kZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRzs7OztJQUtIOzs7Ozs7O09BT0c7SUFDSCxTQUFTLGFBQWEsQ0FBQyxTQUFTLEVBQUUsU0FBUztRQUN2QyxJQUFJLENBQUMsSUFBSSxDQUNMLHlCQUF5QixFQUN6QjtZQUNJLEdBQUcsRUFBRSxjQUFjO1lBQ25CLFNBQVMsRUFBRSxTQUFTO1NBQ3ZCLEVBQ0QsU0FBUyxFQUNULHdDQUF3QyxHQUFHLFNBQVMsR0FBRyxpQkFBaUIsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxvQkFBb0IsQ0FDekgsQ0FBQztJQUNOLENBQUM7SUFzTEcsc0NBQWE7SUFwTGpCOzs7OztPQUtHO0lBQ0gsU0FBUyxpQkFBaUIsQ0FBQyxTQUFTO1FBQ2hDLElBQUksQ0FBQyxJQUFJLENBQ0wsNkJBQTZCLEVBQzdCO1lBQ0ksR0FBRyxFQUFFLGtCQUFrQjtTQUMxQixFQUNELFNBQVMsRUFDVCwyQ0FBMkMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxvQkFBb0IsQ0FDNUYsQ0FBQztJQUNOLENBQUM7SUFzS0csOENBQWlCO0lBcEtyQjs7Ozs7OztPQU9HO0lBQ0gsU0FBUyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsU0FBUztRQUNqRCxJQUFJLENBQUMsSUFBSSxDQUNMLG1DQUFtQyxFQUNuQztZQUNJLEdBQUcsRUFBRSx3QkFBd0I7WUFDN0IsU0FBUyxFQUFFLFNBQVM7U0FDdkIsRUFDRCxTQUFTLEVBQ1QsNkNBQTZDLEdBQUcsU0FBUyxHQUFHLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLG9CQUFvQixDQUM5SCxDQUFDO0lBQ04sQ0FBQztJ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