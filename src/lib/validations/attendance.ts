import { z } from "zod";

export const markAttendanceSchema = z.object({
  code: z.string(),
  attended: z.boolean(),
});
