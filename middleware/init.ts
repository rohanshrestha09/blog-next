import mongoose from 'mongoose';

const init = () => {
  mongoose.connect(process.env.MONGODB_URI as string);
};

export default init;
