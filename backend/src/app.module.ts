import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { User, UserSchema } from './users/user.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/auth-app'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: 'your-secret-key', // Use environment variable in production
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}