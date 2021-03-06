package de.fhg.iais.roberta.persistence;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import de.fhg.iais.roberta.persistence.bo.Role;
import de.fhg.iais.roberta.persistence.bo.User;
import de.fhg.iais.roberta.persistence.bo.UserGroup;
import de.fhg.iais.roberta.persistence.dao.UserDao;
import de.fhg.iais.roberta.persistence.dao.UserGroupDao;
import de.fhg.iais.roberta.persistence.util.DbSession;
import de.fhg.iais.roberta.persistence.util.HttpSessionState;
import de.fhg.iais.roberta.util.Key;
import de.fhg.iais.roberta.util.dbc.Assert;

public class UserProcessor extends AbstractProcessor {

    public static final String ILLEGAL_USER_NAME_CHARACTER_PATTERN = "[^a-zA-Z0-9=+!?.,%#+&^@_\\- ]";

    public UserProcessor(DbSession dbSession, HttpSessionState httpSessionState) {
        super(dbSession, httpSessionState.getUserId());
    }

    public User getUser(String account) {
        return getMemberOfUserGroup(null, account);
    }

    public User getMemberOfUserGroup(UserGroup userGroup, String account) {
        UserDao userDao = new UserDao(this.dbSession);

        User user = userDao.loadUser(userGroup, account);
        if ( user != null ) {
            setStatus(ProcessorStatus.SUCCEEDED, Key.USER_GET_ONE_SUCCESS, new HashMap<>());
        } else {
            setStatus(ProcessorStatus.FAILED, Key.USER_GET_ONE_ERROR_ID_OR_PASSWORD_WRONG, new HashMap<>());
        }
        return user;
    }

    /**
     * Returns a user with the given account name and password. This can not be used to get group members, because you need to know who the user group owner is,
     * in order to clearly identify a user group and therefore its members.
     *
     * @param account
     * @param password
     * @return
     * @throws Exception
     */
    public User getUser(String account, String password) throws Exception {
        Pattern p = Pattern.compile(ILLEGAL_USER_NAME_CHARACTER_PATTERN, Pattern.CASE_INSENSITIVE);
        Matcher acc_symbols = p.matcher(account);

        if ( acc_symbols.find() ) {
            Map<String, String> processorParameters = new HashMap<>();
            processorParameters.put("ACCOUNT", account);
            setStatus(ProcessorStatus.FAILED, Key.USER_CREATE_ERROR_CONTAINS_SPECIAL_CHARACTERS, processorParameters);
            return null;
        }

        UserDao userDao = new UserDao(this.dbSession);
        User user = userDao.loadUser(null, account);
        if ( user != null && user.isPasswordCorrect(password) ) {
            setStatus(ProcessorStatus.SUCCEEDED, Key.USER_GET_ONE_SUCCESS, new HashMap<>());
            return user;
        } else {
            setStatus(ProcessorStatus.FAILED, Key.USER_GET_ONE_ERROR_ID_OR_PASSWORD_WRONG, new HashMap<>());
            return null;
        }
    }

    public User getUser(UserGroup userGroup, String account, String password) throws Exception {
        if ( userGroup == null ) {
            setStatus(ProcessorStatus.FAILED, Key.GROUP_GET_ONE_ERROR_NOT_FOUND, new HashMap<>());
            return null;
        }

        UserDao userDao = new UserDao(this.dbSession);
        User user = userDao.loadUser(userGroup, account);
        if ( user != null && user.isPasswordCorrect(password) ) {
            setStatus(ProcessorStatus.SUCCEEDED, Key.USER_GET_ONE_SUCCESS, new HashMap<>());
            return user;
        } else {
            setStatus(ProcessorStatus.FAILED, Key.USER_GET_ONE_ERROR_ID_OR_PASSWORD_WRONG, new HashMap<>());
            return null;
        }
    }

    public User getUserByEmail(String email) throws Exception {
        UserDao userDao = new UserDao(this.dbSession);
        User user = userDao.loadUserByEmail(email);
        if ( user != null ) {
            setStatus(ProcessorStatus.SUCCEEDED, Key.USER_EMAIL_ONE_SUCCESS, new HashMap<>());
            return user;
        } else {
            setStatus(ProcessorStatus.FAILED, Key.USER_EMAIL_ONE_ERROR_USER_NOT_EXISTS_WITH_THIS_EMAIL, new HashMap<>());
            return null;
        }
    }

    public User getUser(int id) throws Exception {
        UserDao userDao = new UserDao(this.dbSession);
        User user = userDao.loadUser(id);
        if ( user != null ) {
            setStatus(ProcessorStatus.SUCCEEDED, Key.USER_GET_ONE_SUCCESS, new HashMap<>());
            return user;
        } else {
            setStatus(ProcessorStatus.FAILED, Key.USER_GET_ONE_ERROR_ID_OR_PASSWORD_WRONG, new HashMap<>());
            return null;
        }
    }

    /**
     * Creates a new user. If datais invalid or the email is already used, ser an error status.<br><br>
     * Is not used to create user group members. Take a look in the UserGroupProcessor for that.
     *
     * @param account not null, not empty, data for the data base
     * @param password not null, not empty, data for the data base
     * @param userName data for the data base
     * @param role data for the data base
     * @param email data for the data base
     * @param tags data for the data base
     * @param youngerThen14 data for the data base
     */
    public void createUser(String account, String password, String userName, String role, String email, String tags, boolean youngerThen14) throws Exception {
        Pattern p = Pattern.compile(ILLEGAL_USER_NAME_CHARACTER_PATTERN, Pattern.CASE_INSENSITIVE);
        Matcher acc_symbols = p.matcher(account);
        boolean account_check = acc_symbols.find();
        Matcher userName_symbols = p.matcher(userName);
        boolean userName_check = userName_symbols.find();
        Map<String, String> processorParameters = new HashMap<>();
        processorParameters.put("ACCOUNT", account);
        processorParameters.put("USER_NAME", userName);
        if ( account == null || account.equals("") || password == null || password.equals("") ) {
            setStatus(ProcessorStatus.FAILED, Key.USER_CREATE_ERROR_MISSING_REQ_FIELDS, processorParameters);
            return;
        } else if ( account_check || userName_check ) {
            setStatus(ProcessorStatus.FAILED, Key.USER_CREATE_ERROR_CONTAINS_SPECIAL_CHARACTERS, processorParameters);
            return;
        } else if ( account.length() > 25 || userName.length() > 25 ) {
            setStatus(ProcessorStatus.FAILED, Key.USER_CREATE_ERROR_ACCOUNT_LENGTH, processorParameters);
            return;
        } else {
            UserDao userDao = new UserDao(this.dbSession);
            if ( email != null && !email.equals("") ) {
                User user = userDao.loadUserByEmail(email);
                if ( user != null ) {
                    setStatus(ProcessorStatus.FAILED, Key.USER_ERROR_EMAIL_USED, processorParameters);
                    return;
                }
            }
            User user = userDao.persistUser(null, account, password, role);
            if ( user == null ) {
                setStatus(ProcessorStatus.FAILED, Key.USER_CREATE_ERROR_NOT_SAVED_TO_DB, processorParameters);
                return;
            }
            setStatus(ProcessorStatus.SUCCEEDED, Key.USER_CREATE_SUCCESS, new HashMap<>());
            user.setUserName(userName);
            user.setEmail(email);
            user.setTags(tags);
            user.setYoungerThen14(youngerThen14);
        }
    }

    public void updatePassword(String account, String oldPassword, String newPassword) throws Exception {
        if ( account == null || account.equals("") ) {
            setStatus(ProcessorStatus.FAILED, Key.USER_UPDATE_ERROR_ACCOUNT_WRONG, new HashMap<>());
            return;
        }

        User user = isUserLoggedIn() ? getUser(getIdOfLoggedInUser()) : null;
        if ( user == null || !user.getAccount().equals(account) || !user.isPasswordCorrect(oldPassword) ) {
            Map<String, String> processorParameters = new HashMap<>();
            processorParameters.put("ACCOUNT", account);
            this.setStatus(ProcessorStatus.FAILED, Key.USER_UPDATE_ERROR_NOT_SAVED_TO_DB, processorParameters);
            return;
        }

        user.setPassword(newPassword);
        this.setStatus(ProcessorStatus.SUCCEEDED, Key.USER_UPDATE_SUCCESS, new HashMap<>());
    }

    public void resetPassword(int userID, String newPassword) throws Exception {
        Map<String, String> processorParameters = new HashMap<>();
        processorParameters.put("USER_ID", String.valueOf(userID));
        if ( userID <= 0 ) {
            setStatus(ProcessorStatus.FAILED, Key.USER_UPDATE_ERROR_ACCOUNT_WRONG, processorParameters);
        } else {
            User user = getUser(userID);
            if ( user != null ) {
                user.setPassword(newPassword);
                setStatus(ProcessorStatus.SUCCEEDED, Key.USER_UPDATE_SUCCESS, new HashMap<>());
            } else {
                setStatus(ProcessorStatus.FAILED, Key.USER_UPDATE_ERROR_NOT_SAVED_TO_DB, processorParameters);
            }
        }
    }

    public void activateAccount(int userID) throws Exception {
        Map<String, String> processorParameters = new HashMap<>();
        processorParameters.put("USER_ID", String.valueOf(userID));
        if ( userID <= 0 ) {
            setStatus(ProcessorStatus.FAILED, Key.USER_ACTIVATION_WRONG_ACCOUNT, processorParameters);
        } else {
            User user = getUser(userID);
            if ( user != null ) {
                user.setActivated(true);
                setStatus(ProcessorStatus.SUCCEEDED, Key.USER_ACTIVATION_SUCCESS, new HashMap<>());
            } else {
                setStatus(ProcessorStatus.FAILED, Key.USER_UPDATE_ERROR_NOT_SAVED_TO_DB, processorParameters);
            }
        }
    }

    /**
     * Updates the information of a user. Is not used to update user group members, since they are not able to update their accounts.
     *
     * @param user user to be uodated, not null
     * @param userName to be set in the data base
     * @param roleAsString to be set in the data base
     * @param email to be set in the data base
     * @param tags to be set in the data base
     * @param youngerThen14 to be set in the data base
     * @param deactivateAccount true, if the account has to be deactivated (until confirmation email will arrives in the future)
     * @throws Exception
     */
    public void updateUser(
        User user,
        String userName,
        String roleAsString,
        String email,
        String tags,
        boolean youngerThen14,
        boolean deactivateAccount) throws Exception //
    {
        Assert.isTrue(user != null && getIdOfLoggedInUser() == user.getId(), "user or userid invalid");
        user.setUserName(userName);
        user.setRole(Role.valueOf(roleAsString));
        user.setEmail(email);
        user.setTags(tags);
        user.setYoungerThen14(youngerThen14);
        if ( deactivateAccount ) {
            user.setActivated(false);
        }
        setStatus(ProcessorStatus.SUCCEEDED, Key.USER_UPDATE_SUCCESS, new HashMap<>());
    }

    /**
     * Deletes a user. Does not work with user group members
     *
     * @param account
     * @param password
     * @throws Exception
     */
    public void deleteUser(String account, String password) throws Exception {
        UserDao userDao = new UserDao(this.dbSession);
        UserGroupDao userGroupDao = new UserGroupDao(this.dbSession);
        User user = userDao.loadUser(null, account);
        Map<String, String> processorParameters = new HashMap<>();
        processorParameters.put("ACCOUNT", account);

        if ( user == null || !user.isPasswordCorrect(password) || user.getUserGroup() != null ) {
            setStatus(ProcessorStatus.FAILED, Key.USER_DELETE_ERROR_ID_NOT_FOUND, processorParameters);
            return;
        }

        if ( userGroupDao.getNumberOfGroupsOfOwner(user) > 0 ) {
            setStatus(ProcessorStatus.FAILED, Key.USER_DELETE_ERROR_HAS_GROUPS, new HashMap<>());
            return;
        }

        int rowCount = userDao.deleteUser(user);
        if ( rowCount > 0 ) {
            setStatus(ProcessorStatus.SUCCEEDED, Key.USER_DELETE_SUCCESS, new HashMap<>());
        } else {
            setStatus(ProcessorStatus.FAILED, Key.USER_DELETE_ERROR_NOT_DELETED_IN_DB, processorParameters);
        }
    }

    /**
     * Deletes a set of members of a user group.
     *
     * @param userGroup The user group the members are belonging to.
     * @param memberAccounts A list of account names of the members of the group that shall be deleted.
     * @throws Exception
     */
    public void deleteUserGroupMembers(UserGroup userGroup, List<String> memberAccounts) {
        UserDao userDao = new UserDao(this.dbSession);
        if ( userGroup == null ) {
            //Necessary to not use this end point to delete global users
            setStatus(ProcessorStatus.FAILED, Key.GROUP_GET_ONE_ERROR_NOT_FOUND, new HashMap<>());
            return;
        }
        List<User> usersToDelete = new ArrayList<>();
        for ( String memberAccount : memberAccounts ) {
            User user = userDao.loadUser(userGroup, memberAccount);
            if ( user == null ) {
                continue;
            }
            usersToDelete.add(user);
        }
        for ( User user : usersToDelete ) {
            int rowCount = userDao.deleteUser(user);
            if ( rowCount == 0 ) {
                //Show an error, because there is most likely a database problem.
                Map<String, String> processorParameters = new HashMap<>();
                processorParameters.put("OWNER", userGroup.getOwner().getAccount());
                processorParameters.put("USERGROUP", userGroup.getName());
                processorParameters.put("MEMBER", user.getAccount());
                setStatus(ProcessorStatus.FAILED, Key.USER_DELETE_ERROR_NOT_DELETED_IN_DB, processorParameters);
                return;
            }
        }
        setStatus(ProcessorStatus.SUCCEEDED, Key.USER_DELETE_SUCCESS, new HashMap<>());
    }
}