// Database types for SeaVitae Supabase schema
// These types should match the database schema exactly

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'jobseeker' | 'employer' | 'admin'
export type EmployerType = 'individual' | 'company'
export type InterviewStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'
export type InterviewType = 'in_person' | 'video' | 'phone'
export type CVSectionType = 'experience' | 'education' | 'skills' | 'languages' | 'certifications' | 'projects' | 'publications' | 'summary'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type HiringPurpose = 'personal_project' | 'freelance_work' | 'startup' | 'household' | 'other'

// CV Section Content Types
export interface ExperienceItem {
  id: string
  title: string
  company: string
  location?: string
  startDate: string
  endDate?: string
  current: boolean
  description: string
}

export interface EducationItem {
  id: string
  degree: string
  institution: string
  location?: string
  graduationYear: number
  field?: string
  gpa?: string
}

export interface SkillItem {
  id: string
  name: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category?: string
}

export interface LanguageItem {
  id: string
  name: string
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic'
}

export interface CertificationItem {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  url?: string
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  url?: string
  startDate?: string
  endDate?: string
  technologies?: string[]
}

export interface PublicationItem {
  id: string
  title: string
  publisher: string
  date: string
  url?: string
  description?: string
}

export interface SummaryContent {
  text: string
}

export type CVSectionContent = {
  items: ExperienceItem[] | EducationItem[] | SkillItem[] | LanguageItem[] | CertificationItem[] | ProjectItem[] | PublicationItem[] | unknown[]
} | SummaryContent | { items: unknown[] } | { text: string }

// Database schema types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          created_at: string
          updated_at: string
          email_verified: boolean
          last_login_at: string | null
        }
        Insert: {
          id: string
          email: string
          role: UserRole
          created_at?: string
          updated_at?: string
          email_verified?: boolean
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
          email_verified?: boolean
          last_login_at?: string | null
        }
      }
      jobseekers: {
        Row: {
          id: string
          user_id: string
          full_name: string
          preferred_role: string | null
          city: string | null
          bio: string | null
          years_experience: number
          age: number | null
          phone: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          is_visible: boolean
          profile_completeness: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          preferred_role?: string | null
          city?: string | null
          bio?: string | null
          years_experience?: number
          age?: number | null
          phone?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          is_visible?: boolean
          profile_completeness?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          preferred_role?: string | null
          city?: string | null
          bio?: string | null
          years_experience?: number
          age?: number | null
          phone?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          is_visible?: boolean
          profile_completeness?: number
          created_at?: string
          updated_at?: string
        }
      }
      employers: {
        Row: {
          id: string
          user_id: string
          employer_type: EmployerType
          display_name: string
          company_name: string | null
          company_size: string | null
          industry: string | null
          website: string | null
          linkedin_url: string | null
          bio: string | null
          // Verification fields for company employers
          cac_registration_number: string | null
          // Verification fields for individual employers
          nin_passport_number: string | null
          hiring_purpose: string | null
          // Verification status
          verification_status: VerificationStatus
          is_verified: boolean
          verification_date: string | null
          verification_notes: string | null
          phone: string | null
          city: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          employer_type: EmployerType
          display_name: string
          company_name?: string | null
          company_size?: string | null
          industry?: string | null
          website?: string | null
          linkedin_url?: string | null
          bio?: string | null
          cac_registration_number?: string | null
          nin_passport_number?: string | null
          hiring_purpose?: string | null
          verification_status?: VerificationStatus
          is_verified?: boolean
          verification_date?: string | null
          verification_notes?: string | null
          phone?: string | null
          city?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          employer_type?: EmployerType
          display_name?: string
          company_name?: string | null
          company_size?: string | null
          industry?: string | null
          website?: string | null
          linkedin_url?: string | null
          bio?: string | null
          cac_registration_number?: string | null
          nin_passport_number?: string | null
          hiring_purpose?: string | null
          verification_status?: VerificationStatus
          is_verified?: boolean
          verification_date?: string | null
          verification_notes?: string | null
          phone?: string | null
          city?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cvs: {
        Row: {
          id: string
          jobseeker_id: string
          title: string
          is_primary: boolean
          is_locked: boolean
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          jobseeker_id: string
          title?: string
          is_primary?: boolean
          is_locked?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          jobseeker_id?: string
          title?: string
          is_primary?: boolean
          is_locked?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      cv_sections: {
        Row: {
          id: string
          cv_id: string
          section_type: CVSectionType
          section_order: number
          content: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          section_type: CVSectionType
          section_order?: number
          content?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          section_type?: CVSectionType
          section_order?: number
          content?: Json
          created_at?: string
          updated_at?: string
        }
      }
      saved_cvs: {
        Row: {
          id: string
          employer_id: string
          jobseeker_id: string
          cv_id: string
          snapshot_data: Json
          snapshot_version: number
          notes: string | null
          saved_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          jobseeker_id: string
          cv_id: string
          snapshot_data: Json
          snapshot_version: number
          notes?: string | null
          saved_at?: string
        }
        Update: never // Snapshots are immutable
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          subject: string | null
          content: string
          is_read: boolean
          read_at: string | null
          parent_message_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          subject?: string | null
          content: string
          is_read?: boolean
          read_at?: string | null
          parent_message_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          subject?: string | null
          content?: string
          is_read?: boolean
          read_at?: string | null
          parent_message_id?: string | null
          created_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          employer_id: string
          jobseeker_id: string
          status: InterviewStatus
          proposed_date: string | null
          proposed_location: string | null
          interview_type: InterviewType | null
          message: string | null
          response_message: string | null
          responded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          jobseeker_id: string
          status?: InterviewStatus
          proposed_date?: string | null
          proposed_location?: string | null
          interview_type?: InterviewType | null
          message?: string | null
          response_message?: string | null
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employer_id?: string
          jobseeker_id?: string
          status?: InterviewStatus
          proposed_date?: string | null
          proposed_location?: string | null
          interview_type?: InterviewType | null
          message?: string | null
          response_message?: string | null
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invites: {
        Row: {
          id: string
          code: string
          created_by: string | null
          email: string | null
          role: UserRole | null
          is_used: boolean
          used_by: string | null
          used_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          created_by?: string | null
          email?: string | null
          role?: UserRole | null
          is_used?: boolean
          used_by?: string | null
          used_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          created_by?: string | null
          email?: string | null
          role?: UserRole | null
          is_used?: boolean
          used_by?: string | null
          used_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_profile_completeness: {
        Args: { jobseeker_id_param: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for common use cases
export type User = Database['public']['Tables']['users']['Row']
export type Jobseeker = Database['public']['Tables']['jobseekers']['Row']
export type Employer = Database['public']['Tables']['employers']['Row']
export type CV = Database['public']['Tables']['cvs']['Row']
export type CVSection = Database['public']['Tables']['cv_sections']['Row']
export type SavedCV = Database['public']['Tables']['saved_cvs']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Interview = Database['public']['Tables']['interviews']['Row']
export type Invite = Database['public']['Tables']['invites']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type JobseekerInsert = Database['public']['Tables']['jobseekers']['Insert']
export type EmployerInsert = Database['public']['Tables']['employers']['Insert']
export type CVInsert = Database['public']['Tables']['cvs']['Insert']
export type CVSectionInsert = Database['public']['Tables']['cv_sections']['Insert']
export type SavedCVInsert = Database['public']['Tables']['saved_cvs']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type InterviewInsert = Database['public']['Tables']['interviews']['Insert']
export type InviteInsert = Database['public']['Tables']['invites']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type JobseekerUpdate = Database['public']['Tables']['jobseekers']['Update']
export type EmployerUpdate = Database['public']['Tables']['employers']['Update']
export type CVUpdate = Database['public']['Tables']['cvs']['Update']
export type CVSectionUpdate = Database['public']['Tables']['cv_sections']['Update']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']
export type InterviewUpdate = Database['public']['Tables']['interviews']['Update']
export type InviteUpdate = Database['public']['Tables']['invites']['Update']

// Extended types with relations
export interface JobseekerWithCV extends Jobseeker {
  cvs: (CV & { cv_sections: CVSection[] })[]
  user: User
}

export interface EmployerWithSavedCVs extends Employer {
  saved_cvs: SavedCV[]
  user: User
}

export interface CVWithSections extends CV {
  cv_sections: CVSection[]
  jobseeker: Jobseeker
}

export interface MessageWithUsers extends Message {
  sender: User
  recipient: User
}

export interface InterviewWithParticipants extends Interview {
  employer: Employer
  jobseeker: Jobseeker
}

// CV Snapshot data structure (stored in saved_cvs.snapshot_data)
export interface CVSnapshotData {
  jobseeker: {
    full_name: string
    preferred_role: string | null
    city: string | null
    bio: string | null
    years_experience: number
  }
  cv: {
    id: string
    title: string
    version: number
  }
  sections: {
    section_type: CVSectionType
    section_order: number
    content: Json
  }[]
  snapshot_timestamp: string
}
