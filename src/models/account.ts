import mongoose, { Document, Model, model } from 'mongoose';

export interface Account {
  readonly id?: string;
  amount: number;
}

export interface IAccountDocument extends Omit<Account, 'id'>, Document {}
export interface IAccountModel extends Model<IAccountDocument> {}

const schema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      min: 0.0,
      default: 0.0,
    },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

export const Account: IAccountModel = model<IAccountDocument, IAccountModel>(
  'Account',
  schema
);
