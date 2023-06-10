export const takeoffCommand = Buffer.from("takeoff");
export const landCommand = Buffer.from("land");
export const forwardCommand = Buffer.from("rc 0 50 0 0");
export const backCommand = Buffer.from("rc 0 -50 0 0");
export const leftCommand = Buffer.from("rc -50 0 0 0");
export const rightCommand = Buffer.from("rc 50 0 0 0");
export const stopCommand = Buffer.from("stop");
export const batteryCommand = Buffer.from("battery?");