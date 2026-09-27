export type TeacherTranslation = {
  name: string;
  title: string;
  bio: string;
  specialties: string[];
};

export type Teacher = {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  gender: "male" | "female";
  availableTimes: string[];
  stats: {
    students: number;
    yearsExperience: number;
    completedSessions: number;
    rating: number;
  };
  specialties: string[];
  en: TeacherTranslation;
};
