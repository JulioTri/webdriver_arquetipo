// src/shared/data/types/StudentData.ts
export interface DateOfBirth {
  day: number;
  month: string;   // "Feb", "Jun", etc.
  year: number;
}

export interface StudentData {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  dateOfBirth: DateOfBirth;
  subjects: string[];
  hobbies: string[];
  picture?: string;
  currentAddress: string;
  state: string;
  city: string;
}

export interface StudentsDataset {
  students: StudentData[];
}
