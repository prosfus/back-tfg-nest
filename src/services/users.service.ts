import { Injectable } from '@nestjs/common';
@Injectable()
export class UserService {
  private readonly users = [];

  addUser(user) {
    this.users.push(user);
    return user;
  }

  removeUser(id) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index > -1) {
      this.users.splice(index, 1);
    }
  }

  getUser(id) {
    return this.users.find((user) => user.id === id);
  }

  getAllUsers() {
    return [...this.users];
  }
}
