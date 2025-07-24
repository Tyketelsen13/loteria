import mongoose from 'mongoose';

const CardImageSchema = new mongoose.Schema({
  cardId: Number,
  name: String,
  imageUrl: String,
});

export default mongoose.models.CardImage || mongoose.model('CardImage', CardImageSchema);
