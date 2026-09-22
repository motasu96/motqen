export type Review = {
  name: string;
  rating: number;
  comment: string;
  date: string;
};

export type TeacherTranslation = {
  name: string;
  title: string;
  bio: string;
  specialties: string[];
};

export type Teacher = {
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  gender: "male" | "female";
  stats: {
    students: number;
    yearsExperience: number;
    completedSessions: number;
    rating: number;
  };
  specialties: string[];
  reviews: Review[];
  en: TeacherTranslation;
};
