export type SkillGroup = {
  id: string;
  name: string;
  blurb?: string | null;
  icon?: string | null;      // emoji or icon name
  icon_url?: string | null;  // optional external URL
  accent?: string | null;    // e.g. 'emerald', 'sky', 'violet' or '#hex'
  sort_order: number;
  published: boolean;
  created_at?: string;       // optional if your table has it
};

export type Skill = {
  id: string;
  group_id: string;
  name: string;
  sort_order: number;
  published: boolean;
  created_at?: string;
};