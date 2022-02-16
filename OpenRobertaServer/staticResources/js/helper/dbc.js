define(["require", "exports", "log"], function (require, exports, LOG) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertTrue = exports.assertEq = void 0;
    /**
     * assertEq: assert that two objects are === w.r.t. to type and content,
     * otherwise LOG and throw an exception
     */
    function assertEq(expected, given) {
        function internalCheck(expected, given) {
            if (typeof expected === typeof given) {
                if (expected === given) {
                    return null;
                }
                else {
                    return 'Violation. Expected value: ' + expected + ', given: ' + given;
                }
            }
            else {
                return 'Violation. Expected type: ' + typeof expected + ', given: ' + typeof given;
            }
        }
        var msg = internalCheck(expected, given);
        if (msg !== null) {
            LOG.info(msg);
            throw msg;
        }
    }
    exports.assertEq = assertEq;
    /**
     * assertTrue: assert that a condition holds, otherwise LOG and throw an
     * exception
     */
    function assertTrue(boolToTest, msg) {
        if (!boolToTest) {
            LOG.info(msg);
            throw msg;
        }
    }
    exports.assertTrue = assertTrue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGJjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2hlbHBlci9kYmMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBR0E7OztPQUdHO0lBQ0gsU0FBUyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUs7UUFDN0IsU0FBUyxhQUFhLENBQUMsUUFBUSxFQUFFLEtBQUs7WUFDbEMsSUFBSSxPQUFPLFFBQVEsS0FBSyxPQUFPLEtBQUssRUFBRTtnQkFDbEMsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFO29CQUNwQixPQUFPLElBQUksQ0FBQztpQkFDZjtxQkFBTTtvQkFDSCxPQUFPLDZCQUE2QixHQUFHLFFBQVEsR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFDO2lCQUN6RTthQUNKO2lCQUFNO2dCQUNILE9BQU8sNEJBQTRCLEdBQUcsT0FBTyxRQUFRLEdBQUcsV0FBVyxHQUFHLE9BQU8sS0FBSyxDQUFDO2FBQ3RGO1FBQ0wsQ0FBQztRQUNELElBQUksR0FBRyxHQUFHLGFBQWEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekMsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ2QsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLE1BQU0sR0FBRyxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBWVEsNEJBQVE7SUFWakI7OztPQUdHO0lBQ0gsU0FBUyxVQUFVLENBQUMsVUFBVSxFQUFFLEdBQUc7UUFDL0IsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNiLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZCxNQUFNLEdBQUcsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUNrQixnQ0FBVSJ9