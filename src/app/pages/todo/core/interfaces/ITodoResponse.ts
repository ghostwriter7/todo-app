import { ITodoItem } from './ITodoItem';

export interface ITodoResponse {
  todos: ITodoItem[],
  creator: string;
  date: string;
  _id: string;
}
