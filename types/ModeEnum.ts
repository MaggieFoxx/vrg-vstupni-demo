export enum Mode {
  IDLE = "idle",
  DRAWING = "drawing",
  DELETING = "deleting",
  EDITING = "editing",
  MEASURING_ANGLE = "measuringAngle",
  MODIFYING = "modifying",
}

export const getTooltipText = (mode: Mode): string => {
  let helpMsg = "Click on the button to choose functionality";
  switch (mode) {
    case Mode.DRAWING:
      helpMsg = "Click to continue drawing the line";
      break;
    case Mode.DELETING:
      helpMsg = "Click on a line to delete it";
      break;
    case Mode.EDITING:
      helpMsg = "Click on a line to edit";
      break;
    case Mode.MEASURING_ANGLE:
      helpMsg = "Draw two lines to measure the angle";
      break;
    default:
      helpMsg = "Click on the button to choose functionality";
  }
  return helpMsg;
};
