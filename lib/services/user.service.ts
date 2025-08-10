import User, { IUser } from '../models/User';
import dbConnect from '../dbConnect';

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: 'admin';
  isActive?: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export class UserService {
  /**
   * Create a new admin user
   */
  static async createUser(userData: CreateUserData): Promise<IUser> {
    await dbConnect();

    try {
      const user = new User({
        ...userData,
        role: userData.role || 'admin',
        isActive: userData.isActive !== false, // Default to true
      });

      const savedUser = await user.save();

      // Return user without password
      const { password, ...userWithoutPassword } = savedUser.toObject();
      return userWithoutPassword as IUser;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error('User with this email or username already exists');
      }
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<IUser | null> {
    await dbConnect();

    const user = await User.findById(id).select('-password');
    return user;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<IUser | null> {
    await dbConnect();

    const user = await User.findOne({ email }).select('-password');
    return user;
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username: string): Promise<IUser | null> {
    await dbConnect();

    const user = await User.findOne({ username }).select('-password');
    return user;
  }

  /**
   * Get all users (without passwords)
   */
  static async getAllUsers(): Promise<IUser[]> {
    await dbConnect();

    const users = await User.find({}).select('-password');
    return users;
  }

  /**
   * Update user
   */
  static async updateUser(
    id: string,
    updateData: UpdateUserData
  ): Promise<IUser | null> {
    await dbConnect();

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    return user;
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<boolean> {
    await dbConnect();

    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Deactivate user
   */
  static async deactivateUser(id: string): Promise<IUser | null> {
    await dbConnect();

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    return user;
  }

  /**
   * Activate user
   */
  static async activateUser(id: string): Promise<IUser | null> {
    await dbConnect();

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select('-password');

    return user;
  }

  /**
   * Change user password
   */
  static async changePassword(
    id: string,
    newPassword: string
  ): Promise<boolean> {
    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    user.password = newPassword;
    await user.save();

    return true;
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
  }> {
    await dbConnect();

    const [total, active, inactive, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: 'admin' }),
    ]);

    return { total, active, inactive, admins };
  }
}
