export interface Organization {
  id: string;
  name: string;
  document: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  organization_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}