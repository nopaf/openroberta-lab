/**
 * Rest calls to the server related to user operations (create user, login ...)
 *
 * @module rest/program
 */
define(["require", "exports", "comm"], function (require, exports, COMM) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setStatusText = exports.getStatusText = exports.deleteUserOnServer = exports.userActivateAccount = exports.userSendAccountActivation = exports.userPasswordRecovery = exports.checkTargetRecovery = exports.resetPasswordToServer = exports.updateUserPasswordToServer = exports.updateUserToServer = exports.createUserToServer = exports.getUserFromServer = exports.userLoggedInCheck = exports.logout = exports.loginUserGroup = exports.login = exports.clear = void 0;
    /**
     * Clear user
     *
     */
    function clear(successFn) {
        COMM.json('/user/clear', {
            cmd: 'clear',
        }, successFn, 'clear user');
    }
    exports.clear = clear;
    /**
     * Login user
     *
     * @param accountName
     *            {String} - name of the account of the user
     * @param passwd
     *            {String} - password for the account
     *
     *
     */
    function login(accountName, passwd, successFn) {
        COMM.json('/user/login', {
            cmd: 'login',
            accountName: accountName,
            password: passwd,
        }, successFn, "login user '" + accountName + "'");
    }
    exports.login = login;
    /**
     * Login user of user-group
     *
     * @param userGroupOwner
     *            {String} - name of the account of the user that owns the user-group
     * @param userGroupName
     *            {String} - name of the user-group
     * @param accountName
     *            {String} - name of the account of the user
     * @param passwd
     *            {String} - password for the account
     *
     *
     */
    function loginUserGroup(userGroupOwner, userGroupName, accountName, passwd, successFn) {
        COMM.json('/user/login', {
            cmd: 'login',
            accountName: accountName,
            password: passwd,
            userGroupOwner: userGroupOwner,
            userGroupName: userGroupName,
        }, successFn, "login user '" + accountName + "' of group '" + userGroupOwner + '.' + userGroupName + "'.");
    }
    exports.loginUserGroup = loginUserGroup;
    /**
     * Logout user
     *
     * @memberof USER
     */
    function logout(successFn) {
        COMM.json('/user/logout', {
            cmd: 'logout',
        }, successFn, 'logout user');
    }
    exports.logout = logout;
    /**
     * Checks if the user is logged in
     */
    function userLoggedInCheck(successFn) {
        COMM.json('/user/loggedInCheck', {}, successFn, 'Check for export all programs');
    }
    exports.userLoggedInCheck = userLoggedInCheck;
    /**
     * Retrive user from server.
     *
     * @param accountName
     *            {String} - name of the account of the user
     *
     *
     */
    function getUserFromServer(accountName, successFn) {
        COMM.json('/user/getUser', {
            cmd: 'getUser',
        }, successFn, 'got user info from server');
    }
    exports.getUserFromServer = getUserFromServer;
    /**
     * Create user to server.
     *
     * @param accountName
     *            {String} - name of the account
     * @param userName
     *            {String} - name of the user
     * @param userEmail
     *            {String} - user email address
     * @param passwd
     *            {String} - user password
     *
     */
    function createUserToServer(accountName, userName, userEmail, passwd, isYoungerThen14, language, successFn) {
        COMM.json('/user/createUser', {
            cmd: 'createUser',
            accountName: accountName,
            userName: userName,
            userEmail: userEmail,
            password: passwd,
            role: 'TEACHER',
            isYoungerThen14: isYoungerThen14 === '1' ? true : false,
            language: language,
        }, successFn, "save user '" + accountName + "' to server");
    }
    exports.createUserToServer = createUserToServer;
    /**
     * Update user to server
     *
     * @param accountName
     *            {String} - name of the account
     * @param userName
     *            {String} - name of the user
     * @param userEmail
     *            {String} - user email address
     *
     */
    function updateUserToServer(accountName, userName, userEmail, isYoungerThen14, language, successFn) {
        COMM.json('/user/updateUser', {
            cmd: 'updateUser',
            accountName: accountName,
            userName: userName,
            userEmail: userEmail,
            isYoungerThen14: isYoungerThen14 === '1' ? true : false,
            language: language,
            role: 'TEACHER',
        }, successFn, "update user '" + accountName + "' to server");
    }
    exports.updateUserToServer = updateUserToServer;
    /**
     * Update user password to server.
     *
     * @param oldPassword
     *            {String} - old password of the user account
     *
     * @param newPassword -
     *            new password of the user account
     *
     */
    function updateUserPasswordToServer(accountName, oldPassword, newPassword, successFn) {
        COMM.json('/user/changePassword', {
            cmd: 'changePassword',
            accountName: accountName,
            oldPassword: oldPassword,
            newPassword: newPassword,
        }, successFn, "update user password '" + accountName + "' to server");
    }
    exports.updateUserPasswordToServer = updateUserPasswordToServer;
    /**
     * Reset password for lost password.
     *
     * @param resetPasswordLink
     *            {String} - link sent to the user email for reseting the
     *            password
     * @param newPassword
     *            {String} - new password for the user account
     *
     */
    function resetPasswordToServer(resetPasswordLink, newPassword, successFn) {
        COMM.json('/user/resetPassword', {
            cmd: 'resetPassword',
            resetPasswordLink: resetPasswordLink,
            newPassword: newPassword,
        }, successFn, "update user password '" + resetPasswordLink + "' to server");
    }
    exports.resetPasswordToServer = resetPasswordToServer;
    /**
     * Check if the generated target for password reset is valid.
     *
     * @param target
     *            {String} - target from link
     *
     */
    function checkTargetRecovery(target, successFn) {
        COMM.json('/user/isResetPasswordLinkExpired', {
            cmd: 'isResetPasswordLinkExpired',
            resetPasswordLink: target,
        }, successFn, "check password recovery for '" + target + "'");
    }
    exports.checkTargetRecovery = checkTargetRecovery;
    /**
     * User password recovery for lost password.
     *
     * @param lostEmail
     *            {String} - email of the user
     *
     */
    function userPasswordRecovery(lostEmail, lang, successFn) {
        COMM.json('/user/passwordRecovery', {
            cmd: 'passwordRecovery',
            lostEmail: lostEmail,
            language: lang,
        }, successFn, "password recovery for '" + lostEmail + "'");
    }
    exports.userPasswordRecovery = userPasswordRecovery;
    /**
     * Resend Account Activation Mail.
     *
     * @param accountName
     *            {String} - name of the account
     * @param language
     *            {String} - language of the current client
     *
     */
    function userSendAccountActivation(accountName, language, successFn) {
        COMM.json('/user/resendActivation', {
            cmd: 'resendActivation',
            accountName: accountName,
            language: language,
        }, successFn, "send account activation mail for '" + accountName + "'");
    }
    exports.userSendAccountActivation = userSendAccountActivation;
    /**
     * Activate account given URL.
     *
     * @param url
     *            {String} - url for the account
     */
    function userActivateAccount(url, successFn) {
        COMM.json('/user/activateUser', {
            cmd: 'activateUser',
            userActivationLink: url,
        }, successFn, "send account activation mail for '" + url + "'");
    }
    exports.userActivateAccount = userActivateAccount;
    /**
     * Delete user from the server.
     *
     * @param accountName
     *            {String} - account name
     * @param passwd
     *            {String} - user account password
     *
     */
    function deleteUserOnServer(accountName, passwd, successFn) {
        COMM.json('/user/deleteUser', {
            cmd: 'deleteUser',
            accountName: accountName,
            password: passwd,
        }, successFn, "delete user '" + accountName + "' on server");
    }
    exports.deleteUserOnServer = deleteUserOnServer;
    function getStatusText(successFn) {
        COMM.json('/user/getStatusText', {
            cmd: 'getStatusText',
        }, successFn, 'get status text');
    }
    exports.getStatusText = getStatusText;
    function setStatusText(english, german, timestamp, successFn) {
        COMM.json('/user/setStatusText', {
            cmd: 'setStatusText',
            english: english,
            german: german,
            timestamp: timestamp,
        }, successFn, 'set status text');
    }
    exports.setStatusText = setStatusText;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9tb2RlbHMvdXNlci5tb2RlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHOzs7O0lBSUg7OztPQUdHO0lBQ0gsU0FBUyxLQUFLLENBQUMsU0FBUztRQUNwQixJQUFJLENBQUMsSUFBSSxDQUNMLGFBQWEsRUFDYjtZQUNJLEdBQUcsRUFBRSxPQUFPO1NBQ2YsRUFDRCxTQUFTLEVBQ1QsWUFBWSxDQUNmLENBQUM7SUFDTixDQUFDO0lBeVVHLHNCQUFLO0lBdlVUOzs7Ozs7Ozs7T0FTRztJQUNILFNBQVMsS0FBSyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsU0FBUztRQUN6QyxJQUFJLENBQUMsSUFBSSxDQUNMLGFBQWEsRUFDYjtZQUNJLEdBQUcsRUFBRSxPQUFPO1lBQ1osV0FBVyxFQUFFLFdBQVc7WUFDeEIsUUFBUSxFQUFFLE1BQU07U0FDbkIsRUFDRCxTQUFTLEVBQ1QsY0FBYyxHQUFHLFdBQVcsR0FBRyxHQUFHLENBQ3JDLENBQUM7SUFDTixDQUFDO0lBbVRHLHNCQUFLO0lBalRUOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSCxTQUFTLGNBQWMsQ0FBQyxjQUFjLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsU0FBUztRQUNqRixJQUFJLENBQUMsSUFBSSxDQUNMLGFBQWEsRUFDYjtZQUNJLEdBQUcsRUFBRSxPQUFPO1lBQ1osV0FBVyxFQUFFLFdBQVc7WUFDeEIsUUFBUSxFQUFFLE1BQU07WUFDaEIsY0FBYyxFQUFFLGNBQWM7WUFDOUIsYUFBYSxFQUFFLGFBQWE7U0FDL0IsRUFDRCxTQUFTLEVBQ1QsY0FBYyxHQUFHLFdBQVcsR0FBRyxjQUFjLEdBQUcsY0FBYyxHQUFHLEdBQUcsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUM5RixDQUFDO0lBQ04sQ0FBQztJ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