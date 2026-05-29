import type { SchemaOptions } from 'mongoose';

type TransformRet = Record<string, unknown> & {
  _id?: unknown;
  __v?: unknown;
  id?: string;
  password?: unknown;
  refreshToken?: unknown;
  passwordChangedAt?: unknown;
};

export function defaultSchemaOptions(
  extraTransform?: (ret: TransformRet) => void,
): SchemaOptions {
  return {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: TransformRet) {
        if (ret._id != null) {
          ret.id = String(ret._id);
          delete ret._id;
        }
        delete ret.__v;
        extraTransform?.(ret);
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  };
}

export function schemaOptionsFor<T>(
  extraTransform?: (ret: TransformRet) => void,
): SchemaOptions<T> {
  return defaultSchemaOptions(extraTransform) as SchemaOptions<T>;
}
