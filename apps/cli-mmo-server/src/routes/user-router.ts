import { Router } from 'express';
import { UserService } from '../services/user-service';
import { UserData } from '@cli-mmo/shared';

const userRouter = Router();

userRouter.post('/user', async (req, res) => {
  const userData: UserData = req.body;

  const userService = new UserService();
  const success = await userService.createUser(userData);
  if (success) {
    res.status(201).send('User created');
  } else {
    res.status(500).send('Failed to create user');
  }
});

userRouter.get('/allUsers', async (req, res) => {
  const userService = new UserService();
  const users = await userService.getAllUsers();
  res.status(200).json(users);
});

export default userRouter;
