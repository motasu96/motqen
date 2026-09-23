import { SupabaseClient } from "@supabase/supabase-js";

export type TeacherReview = {
  id: string;
  rating: number;
  comment: string;
  studentName: string;
  createdAt: string;
};

type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  student_name: string;
  created_at: string;
};

function mapReviewRow(row: ReviewRow): TeacherReview {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    studentName: row.student_name,
    createdAt: row.created_at,
  };
}

export async function listTeacherReviews(supabase: SupabaseClient, teacherId: string): Promise<TeacherReview[]> {
  const { data } = await supabase
    .from("teacher_reviews")
    .select("id, rating, comment, student_name, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => mapReviewRow(row as ReviewRow));
}

export async function getMyReview(
  supabase: SupabaseClient,
  teacherId: string,
  studentId: string
): Promise<{ rating: number; comment: string } | null> {
  const { data } = await supabase
    .from("teacher_reviews")
    .select("rating, comment")
    .eq("teacher_id", teacherId)
    .eq("student_id", studentId)
    .maybeSingle();
  return data as { rating: number; comment: string } | null;
}

// A student may only review a teacher they've actually had a confirmed
// booking with — enforced again by RLS on write, checked here to decide
// whether to show the review form at all.
export async function canStudentReview(
  supabase: SupabaseClient,
  teacherId: string,
  studentId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("bookings")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("student_id", studentId)
    .eq("status", "confirmed")
    .limit(1)
    .maybeSingle();
  return !!data;
}

export async function submitReview(
  supabase: SupabaseClient,
  params: { teacherId: string; studentId: string; studentName: string; rating: number; comment: string }
): Promise<boolean> {
  const { error } = await supabase.from("teacher_reviews").upsert(
    {
      teacher_id: params.teacherId,
      student_id: params.studentId,
      student_name: params.studentName,
      rating: params.rating,
      comment: params.comment,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "teacher_id,student_id" }
  );
  return !error;
}
