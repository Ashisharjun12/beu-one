import mongoose from 'mongoose';
import { branchSchema } from '@/app/models/branch.model';
import { subjectSchema } from '@/app/models/subject.model';
import { yearSchema } from '@/app/models/academic/year.model';
import { semesterSchema } from '@/app/models/academic/semester.model';
import { creditSchema } from '@/app/models/academic/credit.model';
import { noteSchema } from '@/app/models/note.model';

// Register all models
export function registerModels() {
  try {
    // Only register if they haven't been registered
    if (!mongoose.models.Branch) {
      mongoose.model('Branch', branchSchema);
    }
    if (!mongoose.models.Subject) {
      mongoose.model('Subject', subjectSchema);
    }
    if (!mongoose.models.Year) {
      mongoose.model('Year', yearSchema);
    }
    if (!mongoose.models.Semester) {
      mongoose.model('Semester', semesterSchema);
    }
    if (!mongoose.models.Credit) {
      mongoose.model('Credit', creditSchema);
    }
    if (!mongoose.models.Note) {
      mongoose.model('Note', noteSchema);
    }
  } catch (error) {
    console.error('Error registering models:', error);
  }
} 