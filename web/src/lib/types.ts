import { z } from "zod";

export const MatchAnswersSchema = z.object({
  q1Interests: z.array(z.string()).min(1, "请至少选择一项兴趣"),
  q2WeeklyHours: z.enum(["lte3", "3to6", "6to10", "gt10"]),
  q3ActivityPref: z.enum(["表演比赛", "训练提升", "社交松弛", "项目产出"]),
  q4TrainingFreq: z.enum(["low", "medium", "high"]),
  q5BeginnerFriendly: z.boolean(),
});

export type MatchAnswers = z.infer<typeof MatchAnswersSchema>;

export type CustomFormField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect";
  required: boolean;
  options?: string[];
};

export type ClubForMatch = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  activityTypes: string[];
  intensity: "light" | "medium" | "heavy";
  beginnerFriendly: boolean;
  recruitEnd: Date;
};

export type ScoredClub = {
  club: ClubForMatch;
  score: number;
  reasons: string[];
};
