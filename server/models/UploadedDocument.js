import mongoose from 'mongoose';

const uploadedDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    summary: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const UploadedDocument = mongoose.model('UploadedDocument', uploadedDocumentSchema);
export default UploadedDocument;

