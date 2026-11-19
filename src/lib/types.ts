export interface Profile {
  id: number;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  photo: string;
}

export type SwipeAction = "like" | "pass";

export interface SwipeResult {
  createdMatch: boolean;
  match: Profile | null;
}
