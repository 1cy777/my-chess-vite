import { Colors } from "@/models/Colors";

/**
 * Повертає колір супротивника
 */
export function getNextColor(color: Colors): Colors {
  return color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
}
