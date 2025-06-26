import { caching } from "../config";
import { Todo } from "../models/todoModel";
import { getUserTodosKey } from "./keys";
import { getJson, setJson } from "./query";
import cache from ".";

async function saveUserTodo(userId: string, todos: Todo[]) {
    const key = getUserTodosKey(userId);

    return setJson(key, { data: todos }, new Date(Date.now() + Number(caching.contentCacheDuration)));
}

async function fetchUserTodos(userId: string) {
    const key = getUserTodosKey(userId);

    return getJson<Todo[]>(userId);
}

async function invalidateUserTodos(userId: string) {
    const key = getUserTodosKey(userId);
    await cache.del(key);
}

export default {
    saveUserTodo,
    fetchUserTodos,
    invalidateUserTodos
}