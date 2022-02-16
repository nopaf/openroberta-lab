package de.fhg.iais.roberta.visitor.hardware;

import de.fhg.iais.roberta.syntax.action.motor.MotorGetPowerAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorSetPowerAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorStopAction;
import de.fhg.iais.roberta.syntax.action.motor.differential.DriveAction;
import de.fhg.iais.roberta.syntax.actors.arduino.bob3.LedOffAction;
import de.fhg.iais.roberta.syntax.actors.arduino.bob3.LedOnAction;
import de.fhg.iais.roberta.util.dbc.DbcException;
import de.fhg.iais.roberta.visitor.hardware.actor.IDifferentialMotorVisitor;
import de.fhg.iais.roberta.visitor.hardware.actor.ILightVisitor;
import de.fhg.iais.roberta.visitor.hardware.actor.IMotorVisitor;

public interface IOnerpcVisitor<V> extends IDifferentialMotorVisitor<V>, ILightVisitor<V> {
    
    default V visitLedOffAction(LedOffAction<V> ledOffAction) {
        throw new DbcException("Block is not implemented!");
    }

    default V visitLedOnAction(LedOnAction<V> ledOnAction) {
        throw new DbcException("Block is not implemented!");
    }
    
    // @Override
    // default V visitMotorSetPowerAction(MotorSetPowerAction<V> motorSetPowerAction) {
    //     throw new DbcException("Not supported!");
    // }

    // @Override
    // default V visitMotorGetPowerAction(MotorGetPowerAction<V> motorGetPowerAction) {
    //     throw new DbcException("Not supported!");
    // }

    // @Override
    // default V visitMotorStopAction(MotorStopAction<V> motorStopAction) {
    //     throw new DbcException("Not supported!");
    // }

    // @Override
    // default V visitDriveAction(DriveAction<V> driveAction) {
    //     throw new DbcException("Not supported!");
    // }

    // @Override
    // default V visitCurveAction(DriveAction<V> driveAction) {
    //     throw new DbcException("Not supported!");
    // }

    // @Override
    // default V visitTurnAction(DriveAction<V> driveAction) {
    //     throw new DbcException("Not supported!");
    // }

    // @Override
    // default V visitMotorDriveStopAction(DriveAction<V> driveAction) {
    //     throw new DbcException("Not supported!");
    // }

    // V visitDriveAction(DriveAction<V> driveAction);

    // V visitCurveAction(CurveAction<V> curveAction);

    // V visitTurnAction(TurnAction<V> turnAction);

    // V visitMotorDriveStopAction(MotorDriveStopAction<V> stopAction);
}
