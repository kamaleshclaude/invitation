export type AttendanceStatus = 'Yes' | 'Maybe' | 'No';
export type DietType = 'Non-veg' | 'Veg';
export type SpiceLevel = 'Mild' | 'Medium' | 'Spicy';

export interface Registration {
  id: string;
  name: string;
  phone: string;
  email?: string;
  batch: string; // e.g. "XII - A", "XII - B", etc.
  guests: number; // 0, 1, 2, ...
  attendance_status: AttendanceStatus;
  photo_url?: string;
  created_at: string;
}

export interface FoodPreference {
  id: string;
  registration_id: string;
  attendee_name: string;
  diet: DietType;
  spice_level: SpiceLevel;
  notes?: string;
  guests_count: number;
  created_at: string;
}

export interface WallMessage {
  id: string;
  name: string;
  message: string;
  color: 'yellow' | 'pink' | 'cyan' | 'lime' | 'orange' | 'purple';
  hidden: boolean;
  created_at: string;
}

export interface PollOption {
  id: string;
  question_id: string;
  text: string;
  votes: number;
}

export interface PollQuestion {
  id: string;
  title: string;
  options: { id: string; text: string; votes: number }[];
}

export interface PollVote {
  id: string;
  question_id: string;
  option_id: string;
  user_phone_or_device: string;
  created_at: string;
}

export interface BenchClaim {
  id: string;
  registration_id: string;
  student_name: string;
  bench_number: number; // 1 to 40
  tagline?: string;
  row_category: 'front' | 'middle' | 'last';
  created_at: string;
}

export interface GameScore {
  id: string;
  name: string;
  score: number;
  combo: number;
  badge: string;
  created_at: string;
}

export interface GeneratedCardRecord {
  id: string;
  studentName: string;
  templateId: 'idcard' | 'classic' | 'golden' | 'vintage';
  downloadCount: number;
  createdAt: string;
}

export interface EventSettings {
  locked_venue_id: string | null; // 'venue-vellu' | 'venue-habbebi' | null (poll active)
  locked_date_id: string | null; // 'date-dec-25' | 'date-dec-27' | null (poll active)
  total_benches: number;
  batch_name: string;
  batch_year: string;
  organizer_name: string;
  announcement_notes?: string;
  card_generator_enabled: boolean;
}
