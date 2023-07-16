import { Injectable } from '@nestjs/common';

export interface User {
  id: string;
  name: string;
}

@Injectable()
export class UserService {
  private users = [] as User[];

  addUser(user: User) {
    this.users.push(user);
    return user;
  }

  removeUser(id: string) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index > -1) {
      this.users.splice(index, 1);
    }
  }

  getUser(id: string) {
    return this.users.find((user) => user.id === id);
  }

  getAllUsers() {
    return [...this.users];
  }
}
