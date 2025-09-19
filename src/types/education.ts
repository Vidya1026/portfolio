export type Education = {
  id: string;
  school: string;
  degree: string;
  field: string | null;
  location: string | null;
  start_date: string | null; // 'YYYY-MM-DD'
  end_date: string | null;   // 'YYYY-MM-DD' (null when current)
  is_current: boolean;
  gpa: string | null;        // keep as string so you can show “3.93/4.0”
  website: string | null;
  logo_url: string | null;
  highlights: string[];      // bullet points
  coursework: string[];      // tags
  sort_order: number;
  published: boolean;
  created_at?: string;
};