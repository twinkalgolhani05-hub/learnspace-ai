import mongoose from 'mongoose';

const savedNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: ['summary', 'ask_explain', 'qa_generator', 'make_precise', 'general'],
      default: 'general',
    },
    style: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
    },
    courseContext: {
      type: String,
      default: 'General Computer Science',
    },
    sourceDocument: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

const SavedNote = mongoose.model('SavedNote', savedNoteSchema);
export default SavedNote;

