import { Document, Model, Schema, model } from 'mongoose';

const financeType = ['in', 'out', 'payment_ticket'] as const;
type FinanceType = typeof financeType[number];

export interface Finance {
  readonly id?: string;
  type: FinanceType;
  amount: number;
  account: string;
  ticketCode?: string;
}

interface IFinanceDocument extends Omit<Finance, 'id'>, Document {}
interface IFinanceModel extends Model<IFinanceDocument> {}

const schema = new Schema(
  {
    type: {
      type: String,
      enum: financeType,
      required: true,
    },
    amount: {
      type: Number,
      min: 0.0,
      required: true,
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    ticketCode: String,
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

schema.index({ createdAt: -1 });

export const Finance: IFinanceModel = model<IFinanceDocument, IFinanceModel>(
  'Finance',
  schema
);
