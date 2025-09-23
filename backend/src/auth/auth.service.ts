import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/user.schema';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const { email, password, name } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      name,
    });

    const token = this.jwtService.sign({ id: user._id });
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    return { token, user: userWithoutPassword };
  }

  async login(loginDto: LoginDto): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ id: user._id });
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    return { token, user: userWithoutPassword };
  }
}