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

const TICKET_LENGTH = 47;
const TICKET_VALIDATOR_MSG = `Linha digitável deve ter ${TICKET_LENGTH} caracteres`;

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
    ticketCode: {
      type: String,
      minLength: [TICKET_LENGTH, TICKET_VALIDATOR_MSG],
      maxLength: [TICKET_LENGTH, TICKET_VALIDATOR_MSG],
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

schema.index({ createdAt: -1 });
schema.index(
  { account: 1, ticketCode: 1 },
  { unique: true, partialFilterExpression: { ticketCode: { $exists: true } } }
);

export const Finance: IFinanceModel = model<IFinanceDocument, IFinanceModel>(
  'Finance',
  schema
);
