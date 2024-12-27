import { ObjectId } from "mongodb";
import type { Account, Adapter, AdapterSession, AdapterUser, VerificationToken } from "next-auth/adapters";
import User from "../models/user.model";
import Account from "../models/account.model";
import Session from "../models/session.model";

export function CustomMongoDBAdapter(): Adapter {
  return {
    async createUser(user) {
      const newUser = await User.create(user);
      return {
        id: newUser._id.toString(),
        ...newUser.toObject(),
      };
    },

    async getUser(id) {
      const user = await User.findById(id);
      if (!user) return null;
      return {
        id: user._id.toString(),
        ...user.toObject(),
      };
    },

    async getUserByEmail(email) {
      const user = await User.findOne({ email });
      if (!user) return null;
      return {
        id: user._id.toString(),
        ...user.toObject(),
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await Account.findOne({ providerAccountId, provider });
      if (!account) return null;
      
      const user = await User.findById(account.userId);
      if (!user) return null;
      
      return {
        id: user._id.toString(),
        ...user.toObject(),
      };
    },

    async updateUser(user) {
      const updated = await User.findByIdAndUpdate(
        user.id,
        { $set: user },
        { new: true }
      );
      return {
        id: updated._id.toString(),
        ...updated.toObject(),
      };
    },

    async linkAccount(account) {
      const newAccount = await Account.create({
        ...account,
        userId: new ObjectId(account.userId),
      });
      return newAccount.toObject();
    },

    async createSession(session) {
      const newSession = await Session.create({
        ...session,
        userId: new ObjectId(session.userId),
      });
      return {
        id: newSession._id.toString(),
        ...newSession.toObject(),
      };
    },

    async getSessionAndUser(sessionToken) {
      const session = await Session.findOne({ sessionToken });
      if (!session) return null;

      const user = await User.findById(session.userId);
      if (!user) return null;

      return {
        session: {
          id: session._id.toString(),
          ...session.toObject(),
        },
        user: {
          id: user._id.toString(),
          ...user.toObject(),
        },
      };
    },

    async updateSession(session) {
      const updated = await Session.findOneAndUpdate(
        { sessionToken: session.sessionToken },
        { $set: session },
        { new: true }
      );
      return updated.toObject();
    },

    async deleteSession(sessionToken) {
      await Session.deleteOne({ sessionToken });
    },
  };
} 